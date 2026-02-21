import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ideasKey = (mailboxId) => ['ideas', mailboxId];

function normalizeIdea(row) {
  return {
    id: row.id,
    title: row.title || 'Untitled date idea',
    description: row.description ?? null,
    location: row.location ?? null,
    cost: row.cost ?? null,
    category: row.category ?? null,
    user_id: row.user_id ?? null,
    mailbox_id: row.mailbox_id ?? null,
    priority: row.priority ?? 'normal',
    expires_at: row.expires_at ?? null,
    hearted: Boolean(row.hearted),
    done: Boolean(row.done),
    created_at: row.created_at ?? null,
  };
}

async function fetchIdeas(mailboxId) {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('mailbox_id', mailboxId)
    .or('deleted.is.null,deleted.eq.false')
    .order('created_at', { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message || 'Failed to fetch ideas');
  if (!Array.isArray(data)) return [];
  return data.map(normalizeIdea);
}

export function useIdeas(mailboxId) {
  return useQuery({
    queryKey: ideasKey(mailboxId),
    queryFn: () => fetchIdeas(mailboxId),
    enabled: Boolean(mailboxId),
    retry: 1,
    staleTime: 15000,
    refetchOnWindowFocus: true,
  });
}

export function useIdeasRealtimeSync(mailboxId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!mailboxId) return;
    const channel = supabase
      .channel(`ideas-realtime-sync-${mailboxId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ideas',
        filter: `mailbox_id=eq.${mailboxId}`,
      }, () => queryClient.invalidateQueries({ queryKey: ideasKey(mailboxId) }))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mailboxId, queryClient]);
}

function sortUrgentFirst(ideas) {
  return [...ideas].sort((a, b) => (b.priority === 'urgent') - (a.priority === 'urgent'));
}

export const selectTopPicks = (ideas) => sortUrgentFirst(ideas.filter((i) => i.hearted && !i.done));
export const selectBox = (ideas) => sortUrgentFirst(ideas.filter((i) => !i.hearted && !i.done));
export const selectArchive = (ideas) => ideas.filter((i) => i.done);

export function applyFilter(ideas, filter) {
  if (filter === 'all') return ideas;
  if (filter === 'urgent') return ideas.filter((i) => i.priority === 'urgent');
  if (filter === '$' || filter === '$$' || filter === '$$$') return ideas.filter((i) => i.cost === filter);
  return ideas.filter((i) => i.category === filter);
}

export function useCreateIdea(mailboxId, userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idea) => {
      const payload = { ...idea, mailbox_id: mailboxId, user_id: userId, deleted: false };
      const { data, error } = await supabase.from('ideas').insert([payload]).select().single();
      if (error) throw error;
      return normalizeIdea(data);
    },
    onSuccess: (createdIdea) => {
      queryClient.setQueryData(ideasKey(mailboxId), (old = []) => [createdIdea, ...old]);
      queryClient.invalidateQueries({ queryKey: ideasKey(mailboxId) });
    },
  });
}

export function useToggleHeart(mailboxId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, hearted }) => {
      const { error } = await supabase.from('ideas').update({ hearted }).eq('id', id).eq('mailbox_id', mailboxId);
      if (error) throw error;
    },
    onMutate: async ({ id, hearted }) => {
      await queryClient.cancelQueries({ queryKey: ideasKey(mailboxId) });
      const previous = queryClient.getQueryData(ideasKey(mailboxId));
      queryClient.setQueryData(ideasKey(mailboxId), (old) => old?.map((i) => (i.id === id ? { ...i, hearted } : i)));
      return { previous };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(ideasKey(mailboxId), ctx?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ideasKey(mailboxId) }),
  });
}

export function useMarkDone(mailboxId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('ideas').update({ done: true }).eq('id', id).eq('mailbox_id', mailboxId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ideasKey(mailboxId) }),
  });
}

export function useDeleteIdea(mailboxId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('ideas').delete().eq('id', id).eq('mailbox_id', mailboxId);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ideasKey(mailboxId) });
      const previous = queryClient.getQueryData(ideasKey(mailboxId));
      queryClient.setQueryData(ideasKey(mailboxId), (old) => old?.filter((i) => i.id !== id));
      return { previous };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(ideasKey(mailboxId), ctx?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ideasKey(mailboxId) }),
  });
}
