/**
 * Supabase Edge Function: expiry-reminder
 *
 * Runs on a daily cron schedule (e.g., 9am via pg_cron or Supabase cron trigger).
 * Finds ideas expiring tomorrow and sends reminder SMS to both users.
 *
 * Fallback behavior:
 *   - Missing Twilio creds → logs reminders to console (no crash)
 *   - Missing notification_preferences table → returns 200 with warning
 *   - Missing expires_at column → returns 200 with warning
 *   - Twilio API error → logs error, continues with next idea
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

serve(async (_req) => {
  try {
    // ── Guard: Supabase client not available ────────────────────
    if (!supabase) {
      console.warn('[expiry-reminder] Supabase client not configured. Skipping.');
      return json({ mode: 'dry-run', reason: 'supabase_not_configured' });
    }

    // Calculate tomorrow's date in UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

    // ── Guard: expires_at column might not exist yet ────────────
    const { data: expiringIdeas, error: ideasError } = await supabase
      .from('ideas')
      .select('*')
      .eq('expires_at', tomorrowStr)
      .eq('done', false)
      .or('deleted.is.null,deleted.eq.false');

    if (ideasError) {
      // Column doesn't exist or query failed
      console.warn('[expiry-reminder] Could not query ideas for expiry:', ideasError.message);
      return json({ mode: 'dry-run', reason: 'ideas_query_error', error: ideasError.message });
    }

    if (!expiringIdeas || expiringIdeas.length === 0) {
      return json({ mode: 'live', message: 'No ideas expiring tomorrow', expiring: 0 });
    }

    // ── Guard: notification_preferences table might not exist ───
    const { data: prefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('enabled', true);

    if (prefsError) {
      console.warn('[expiry-reminder] Could not query notification_preferences:', prefsError.message);
      console.log('[expiry-reminder] Ideas expiring tomorrow:');
      expiringIdeas.forEach((i) => console.log(`  → "${i.title}"`));
      return json({ mode: 'dry-run', reason: 'prefs_table_error', error: prefsError.message, expiring: expiringIdeas.length });
    }

    if (!prefs || prefs.length === 0) {
      console.log('[expiry-reminder] No recipients configured. Ideas expiring tomorrow:');
      expiringIdeas.forEach((i) => console.log(`  → "${i.title}"`));
      return json({ mode: 'dry-run', reason: 'no_recipients', expiring: expiringIdeas.length });
    }

    // ── Guard: Twilio not configured → log instead of send ─────
    if (!twilioConfigured) {
      console.warn('[expiry-reminder] Twilio not configured. Would have sent reminders for:');
      expiringIdeas.forEach((i) => {
        prefs.forEach((p) => {
          console.log(`  → ${p.name}: "${i.title}" expires tomorrow`);
        });
      });
      return json({
        mode: 'dry-run',
        reason: 'twilio_not_configured',
        expiring: expiringIdeas.length,
        would_notify: prefs.map((p) => p.name),
      });
    }

    // ── Send SMS via Twilio ────────────────────────────────────
    let totalSent = 0;
    let totalFailed = 0;

    for (const idea of expiringIdeas) {
      const message = `Heads up — "${idea.title}" expires tomorrow! Open the mailbox if you want to do it before it's gone.`;

      const results = await Promise.allSettled(
        prefs.map((pref) => sendSms(pref.phone, message)),
      );

      totalSent += results.filter((r) => r.status === 'fulfilled').length;
      const failures = results.filter((r) => r.status === 'rejected');
      totalFailed += failures.length;

      if (failures.length > 0) {
        console.error(`[expiry-reminder] SMS failures for "${idea.title}":`, failures);
      }
    }

    return json({
      mode: 'live',
      expiring: expiringIdeas.length,
      sent: totalSent,
      failed: totalFailed,
    });
  } catch (err) {
    console.error('[expiry-reminder] Unhandled error:', err);
    // Return 200 so the cron doesn't flag repeated failures
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
