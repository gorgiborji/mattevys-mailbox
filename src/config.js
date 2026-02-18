const SUPABASE_URL      = 'https://jcswgkrhejpomdhazude.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_c3q6cvJ8oRrMKzeK5qMIew_vwiffcSi';

export const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
