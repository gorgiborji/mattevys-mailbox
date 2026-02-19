import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ── Fetch ──────────────────────────────────────────────────────

async function fetchIdeas() {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export function useIdeas() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['ideas'],
    queryFn: fetchIdeas,
  });

  // Real-time: any change to ideas table triggers a refetch.
  // This means when Matt adds an idea, Evy sees it appear without refreshing.
  useEffect(() => {
    const channel = supabase
      .channel('ideas-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ideas' },
        () => queryClient.invalidateQueries({ queryKey: ['ideas'] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

// ── Selectors ──────────────────────────────────────────────────

export function selectTopPicks(ideas) {
  return ideas.filter((i) => i.hearted && !i.done);
}

export function selectBox(ideas) {
  return ideas.filter((i) => !i.hearted && !i.done);
}

export function selectArchive(ideas) {
  return ideas.filter((i) => i.done);
}

export function applyFilter(ideas, filter) {
  if (filter === 'all') return ideas;
  if (filter === '$' || filter === '$$' || filter === '$$$') {
    return ideas.filter((i) => i.cost === filter);
  }
  return ideas.filter((i) => i.category === filter);
}

// ── Mutations ──────────────────────────────────────────────────

export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idea) => {
      const { error } = await supabase.from('ideas').insert([idea]);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ideas'] }),
  });
}

export function useToggleHeart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, hearted }) => {
      const { error } = await supabase
        .from('ideas')
        .update({ hearted })
        .eq('id', id);
      if (error) throw error;
    },
    // Optimistic: update the cache immediately so the heart feels instant
    onMutate: async ({ id, hearted }) => {
      await queryClient.cancelQueries({ queryKey: ['ideas'] });
      const previous = queryClient.getQueryData(['ideas']);
      queryClient.setQueryData(['ideas'], (old) =>
        old?.map((i) => (i.id === id ? { ...i, hearted } : i)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['ideas'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['ideas'] }),
  });
}

export function useMarkDone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('ideas')
        .update({ done: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ideas'] }),
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('ideas').delete().eq('id', id);
      if (error) throw error;
    },
    // Optimistic: remove from list immediately so deletion feels instant
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['ideas'] });
      const previous = queryClient.getQueryData(['ideas']);
      queryClient.setQueryData(['ideas'], (old) =>
        old?.filter((i) => i.id !== id),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['ideas'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['ideas'] }),
  });
}
