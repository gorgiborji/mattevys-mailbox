import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { colors } from '../theme/colors';

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [mode, setMode] = useState('create');
  const [mailboxName, setMailboxName] = useState('Our Mailbox');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');

  const createMailbox = async () => {
    const { data: mailbox, error } = await supabase.from('mailboxes').insert([{ name: mailboxName, created_by: user.id }]).select().single();
    if (error) return Alert.alert('Error', error.message);
    const { error: memberError } = await supabase
      .from('mailbox_members')
      .insert([{ mailbox_id: mailbox.id, user_id: user.id, display_name: displayName || 'Owner', role: 'owner' }]);
    if (memberError) return Alert.alert('Error', memberError.message);
    setCreatedCode(mailbox.invite_code);
  };

  const joinMailbox = async () => {
    const { data: mailbox, error } = await supabase.from('mailboxes').select('id').eq('invite_code', inviteCode.toLowerCase()).single();
    if (error || !mailbox) return Alert.alert('Invalid code', 'We could not find a mailbox with that invite code.');
    const { error: joinError } = await supabase
      .from('mailbox_members')
      .insert([{ mailbox_id: mailbox.id, user_id: user.id, display_name: displayName || 'Member', role: 'member' }]);
    if (joinError) return Alert.alert('Error', joinError.message);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.switchRow}>
        <Pressable style={[styles.switch, mode === 'create' && styles.switchActive]} onPress={() => setMode('create')}><Text>Create</Text></Pressable>
        <Pressable style={[styles.switch, mode === 'join' && styles.switchActive]} onPress={() => setMode('join')}><Text>Join</Text></Pressable>
      </View>
      <TextInput placeholder="Display name" style={styles.input} value={displayName} onChangeText={setDisplayName} />
      {mode === 'create' ? (
        <>
          <TextInput placeholder="Mailbox name" style={styles.input} value={mailboxName} onChangeText={setMailboxName} />
          <Pressable style={styles.button} onPress={createMailbox}><Text style={styles.buttonText}>Create mailbox</Text></Pressable>
          {createdCode ? <Text style={styles.code}>Invite code: {createdCode}</Text> : null}
        </>
      ) : (
        <>
          <TextInput placeholder="Invite code" autoCapitalize="none" style={styles.input} value={inviteCode} onChangeText={setInviteCode} />
          <Pressable style={styles.button} onPress={joinMailbox}><Text style={styles.buttonText}>Join mailbox</Text></Pressable>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream, padding: 20, gap: 12 },
  switchRow: { flexDirection: 'row', gap: 8 },
  switch: { flex: 1, borderWidth: 1, borderColor: colors.border, padding: 10, borderRadius: 10, alignItems: 'center' },
  switchActive: { backgroundColor: colors.blush },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, backgroundColor: 'white' },
  button: { backgroundColor: colors.ink, borderRadius: 12, padding: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
  code: { marginTop: 12, fontSize: 20, color: colors.stampRed, fontWeight: '700' },
});
