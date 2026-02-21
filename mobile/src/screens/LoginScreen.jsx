import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const { signInWithApple, signInWithGoogle, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(null);
  const [sent, setSent] = useState(false);

  const run = async (type, fn) => {
    try {
      setLoading(type);
      await fn();
      if (type === 'magic') setSent(true);
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Mattevy&apos;s Mailbox</Text>
        <Text style={styles.tagline}>A date-night dropbox with a handcrafted soul.</Text>
        <TextInput placeholder="Email" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Pressable style={styles.primaryButton} onPress={() => run('magic', () => signInWithMagicLink(email))}>
          {loading === 'magic' ? <ActivityIndicator color="white" /> : <Text style={styles.primaryText}>Send Magic Link</Text>}
        </Pressable>
        {sent ? <Text style={styles.success}>Check your email!</Text> : null}
        <Text style={styles.divider}>or</Text>
        <Pressable style={styles.appleButton} onPress={() => run('apple', signInWithApple)}>
          {loading === 'apple' ? <ActivityIndicator color="white" /> : <Text style={styles.appleText}>Sign in with Apple</Text>}
        </Pressable>
        <Pressable style={styles.googleButton} onPress={() => run('google', signInWithGoogle)}>
          {loading === 'google' ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.googleText}>Sign in with Google</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: 20, gap: 12 },
  title: { fontSize: 38, color: colors.ink, textAlign: 'center' },
  tagline: { color: colors.inkLight, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, backgroundColor: 'white' },
  primaryButton: { backgroundColor: colors.ink, borderRadius: 12, padding: 12, alignItems: 'center' },
  primaryText: { color: 'white', fontWeight: '600' },
  divider: { textAlign: 'center', color: colors.inkFaint },
  appleButton: { backgroundColor: '#111', borderRadius: 12, padding: 12, alignItems: 'center' },
  appleText: { color: 'white', fontWeight: '600' },
  googleButton: { backgroundColor: 'white', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, alignItems: 'center' },
  googleText: { color: colors.ink, fontWeight: '600' },
  success: { color: '#2d7a2d', textAlign: 'center' },
});
