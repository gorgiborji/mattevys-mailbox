/**
 * Supabase Edge Function: notify-sms
 *
 * Triggered by a database webhook on INSERT into the `ideas` table.
 * Sends an SMS to the other person via Twilio.
 *
 * Fallback behavior:
 *   - Missing Twilio creds → logs the message to console (no crash)
 *   - Missing notification_preferences table → returns 200 with warning
 *   - Twilio API error → logs error, returns 200 (non-blocking)
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

const TWILIO_SID   = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
const TWILIO_FROM  = Deno.env.get('TWILIO_PHONE_NUMBER') || '';

const twilioConfigured = Boolean(TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM);

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });

serve(async (req) => {
  try {
    const payload = await req.json();

    // Database webhook sends { type, table, record, ... }
    const idea = payload.record;
    if (!idea || !idea.title) {
      return json({ error: 'No idea in payload' }, 400);
    }

    const addedBy = idea.added_by || 'Someone';

    // Build message regardless of delivery method
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

    // ── Guard: Supabase client not available ────────────────────
    if (!supabase) {
      console.warn('[notify-sms] Supabase client not configured. Logging notification:');
      console.log(`[notify-sms] TO: (all except ${addedBy}) | MSG: ${message}`);
      return json({ mode: 'dry-run', reason: 'supabase_not_configured', message });
    }

    // ── Guard: notification_preferences table might not exist ───
    const { data: prefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('enabled', true)
      .neq('name', addedBy);

    if (prefsError) {
      // Table doesn't exist or query failed — log and return OK
      console.warn('[notify-sms] Could not query notification_preferences:', prefsError.message);
      console.log(`[notify-sms] Falling back to console. MSG: ${message}`);
      return json({ mode: 'dry-run', reason: 'prefs_table_error', error: prefsError.message, message });
    }

    if (!prefs || prefs.length === 0) {
      console.log('[notify-sms] No recipients found. MSG:', message);
      return json({ mode: 'dry-run', reason: 'no_recipients', message });
    }

    // ── Guard: Twilio not configured → log instead of send ─────
    if (!twilioConfigured) {
      console.warn('[notify-sms] Twilio not configured. Would have sent:');
      prefs.forEach((p) => console.log(`  → ${p.name} (${p.phone}): ${message}`));
      return json({
        mode: 'dry-run',
        reason: 'twilio_not_configured',
        would_notify: prefs.map((p) => p.name),
        message,
      });
    }

    // ── Send SMS via Twilio ────────────────────────────────────
    const results = await Promise.allSettled(
      prefs.map((pref) => sendSms(pref.phone, message)),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failures = results.filter((r) => r.status === 'rejected');

    if (failures.length > 0) {
      console.error('[notify-sms] Some SMS failed:', failures);
    }

    return json({ mode: 'live', sent, failed: failures.length });
  } catch (err) {
    console.error('[notify-sms] Unhandled error:', err);
    // Return 200 so the webhook doesn't retry endlessly on a config issue
    return json({ mode: 'error', error: String(err) }, 200);
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
