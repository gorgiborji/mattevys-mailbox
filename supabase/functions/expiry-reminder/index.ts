/**
 * Supabase Edge Function: expiry-reminder
 *
 * Runs on a daily cron schedule (e.g., 9am via pg_cron or Supabase cron trigger).
 * Finds ideas expiring tomorrow and sends reminder SMS to both users.
 *
 * Environment secrets (same as notify-sms):
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * To set up the cron trigger in Supabase dashboard:
 *   Schedule: 0 14 * * *   (14:00 UTC = 9am EST / 6am PST)
 *   Target: this Edge Function URL
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

serve(async (_req) => {
  try {
    // Calculate tomorrow's date in UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

    // Find non-done, non-deleted ideas expiring tomorrow
    const { data: expiringIdeas, error: ideasError } = await supabase
      .from('ideas')
      .select('*')
      .eq('expires_at', tomorrowStr)
      .eq('done', false)
      .or('deleted.is.null,deleted.eq.false');

    if (ideasError) throw ideasError;
    if (!expiringIdeas || expiringIdeas.length === 0) {
      return new Response(JSON.stringify({ message: 'No ideas expiring tomorrow' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get all enabled notification recipients
    const { data: prefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('enabled', true);

    if (prefsError) throw prefsError;
    if (!prefs || prefs.length === 0) {
      return new Response('No recipients configured', { status: 200 });
    }

    // Build and send messages
    let totalSent = 0;
    let totalFailed = 0;

    for (const idea of expiringIdeas) {
      const message = `Heads up — "${idea.title}" expires tomorrow! Open the mailbox if you want to do it before it's gone.`;

      const results = await Promise.allSettled(
        prefs.map((pref) => sendSms(pref.phone, message)),
      );

      totalSent += results.filter((r) => r.status === 'fulfilled').length;
      totalFailed += results.filter((r) => r.status === 'rejected').length;
    }

    return new Response(
      JSON.stringify({
        expiring: expiringIdeas.length,
        sent: totalSent,
        failed: totalFailed,
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err) {
    console.error('expiry-reminder error:', err);
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
