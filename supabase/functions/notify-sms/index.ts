/**
 * Supabase Edge Function: notify-sms
 *
 * Triggered by a database webhook on INSERT into the `ideas` table.
 * Sends an SMS to the other person via Twilio.
 *
 * Environment secrets (set via `supabase secrets set`):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER   (your Twilio sender number, E.164)
 *   SUPABASE_URL           (auto-provided)
 *   SUPABASE_SERVICE_ROLE_KEY (auto-provided)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TWILIO_SID   = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const TWILIO_FROM  = Deno.env.get('TWILIO_PHONE_NUMBER')!;

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

serve(async (req) => {
  try {
    const payload = await req.json();

    // Database webhook sends { type, table, record, ... }
    const idea = payload.record;
    if (!idea || !idea.title) {
      return new Response('No idea in payload', { status: 400 });
    }

    const addedBy = idea.added_by || 'Someone';

    // Find who to notify (everyone except the person who added it)
    const { data: prefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('enabled', true)
      .neq('name', addedBy);

    if (prefsError) throw prefsError;
    if (!prefs || prefs.length === 0) {
      return new Response('No recipients to notify', { status: 200 });
    }

    // Build message
    let message = `${addedBy} just dropped a new date idea: "${idea.title}"!`;

    if (idea.priority === 'urgent') {
      message = `[Time-sensitive] ${message}`;
    }

    if (idea.expires_at) {
      const exp = new Date(idea.expires_at);
      const formatted = exp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      message += ` Expires ${formatted}.`;
    }

    message += ' Open the mailbox to see it!';

    // Send SMS to each recipient
    const results = await Promise.allSettled(
      prefs.map((pref) => sendSms(pref.phone, message)),
    );

    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      console.error('Some SMS failed:', failures);
    }

    return new Response(
      JSON.stringify({ sent: prefs.length - failures.length, failed: failures.length }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err) {
    console.error('notify-sms error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

async function sendSms(to: string, body: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
  const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio error ${res.status}: ${text}`);
  }

  return res.json();
}
