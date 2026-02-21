import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: 'mattevy://auth-callback' } });
    if (error) throw error;
  };

  const signInWithApple = async () => {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'mattevy', path: 'auth-callback' });
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: redirectUri, skipBrowserRedirect: true } });
    if (error) throw error;
    if (!data?.url) throw new Error('Missing Apple auth URL');
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
    if (result.type !== 'success' || !result.url) throw new Error('Apple sign-in canceled');
    const parsed = AuthSession.parse(result.url);
    if (parsed.params?.access_token && parsed.params?.refresh_token) {
      await supabase.auth.setSession({ access_token: parsed.params.access_token, refresh_token: parsed.params.refresh_token });
    }
  };

  const signInWithGoogle = async () => {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'mattevy', path: 'auth-callback' });
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUri, skipBrowserRedirect: true } });
    if (error) throw error;
    if (!data?.url) throw new Error('Missing Google auth URL');
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
    if (result.type !== 'success' || !result.url) throw new Error('Google sign-in canceled');
    const parsed = AuthSession.parse(result.url);
    if (parsed.params?.access_token && parsed.params?.refresh_token) {
      await supabase.auth.setSession({ access_token: parsed.params.access_token, refresh_token: parsed.params.refresh_token });
    }
  };

  const signOut = () => supabase.auth.signOut();

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, loading, signInWithMagicLink, signInWithApple, signInWithGoogle, signOut }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
