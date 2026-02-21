import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

const MailboxContext = createContext(null);

export function MailboxProvider({ children }) {
  const { user } = useAuth();
  const [mailbox, setMailbox] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const loadMailbox = async () => {
      if (!user) {
        setMailbox(null);
        setMembers([]);
        setNeedsOnboarding(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data: memberships, error: memberError } = await supabase
        .from('mailbox_members')
        .select('mailbox_id')
        .eq('user_id', user.id)
        .limit(1);

      if (memberError) {
        setNeedsOnboarding(true);
        setIsLoading(false);
        return;
      }

      if (!memberships?.length) {
        setNeedsOnboarding(true);
        setMailbox(null);
        setMembers([]);
        setIsLoading(false);
        return;
      }

      const mailboxId = memberships[0].mailbox_id;
      const [{ data: mailboxData }, { data: membersData }] = await Promise.all([
        supabase.from('mailboxes').select('*').eq('id', mailboxId).single(),
        supabase.from('mailbox_members').select('*').eq('mailbox_id', mailboxId),
      ]);

      setMailbox(mailboxData ?? null);
      setMembers(membersData ?? []);
      setNeedsOnboarding(false);
      setIsLoading(false);
    };

    loadMailbox();
  }, [user]);

  const partner = useMemo(() => members.find((m) => m.user_id !== user?.id) ?? null, [members, user]);

  const value = useMemo(
    () => ({ mailbox, members, partner, isLoading, needsOnboarding }),
    [mailbox, members, partner, isLoading, needsOnboarding],
  );

  return <MailboxContext.Provider value={value}>{children}</MailboxContext.Provider>;
}

export const useMailbox = () => {
  const ctx = useContext(MailboxContext);
  if (!ctx) throw new Error('useMailbox must be used within MailboxProvider');
  return ctx;
};
