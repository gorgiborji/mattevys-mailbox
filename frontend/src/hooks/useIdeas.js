import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const IDEAS_QUERY_KEY = ['ideas'];

function normalizeIdea(row) {
  return {
    id: row.id,
    title: row.title || 'Untitled date idea',
    description: row.description ?? null,
    location: row.location ?? null,
    cost: row.cost ?? null,
    category: row.category ?? null,
    added_by: row.added_by ?? null,
    priority: row.priority ?? 'normal',
    expires_at: row.expires_at ?? null,
    hearted: Boolean(row.hearted),
    done: Boolean(row.done),
    created_at: row.created_at ?? null,
  };
}

async function fetchIdeas() {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .or('deleted.is.null,deleted.eq.false')
    .order('created_at', { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(error.message || 'Failed to fetch ideas');
  }

  if (!Array.isArray(data)) return [];
  return data.map(normalizeIdea);
}

export function useIdeas() {
  return useQuery({
    queryKey: IDEAS_QUERY_KEY,
    queryFn: fetchIdeas,
    retry: 1,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

// Single app-level realtime sync to avoid duplicate channels.
export function useIdeasRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('ideas-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ideas' },
        () => queryClient.invalidateQueries({ queryKey: IDEAS_QUERY_KEY }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

function sortUrgentFirst(ideas) {
  return [...ideas].sort((a, b) => {
    const aU = a.priority === 'urgent' ? 1 : 0;
    const bU = b.priority === 'urgent' ? 1 : 0;
    return bU - aU;
  });
}

export function selectTopPicks(ideas) {
  return sortUrgentFirst(ideas.filter((i) => i.hearted && !i.done));
}

export function selectBox(ideas) {
  return sortUrgentFirst(ideas.filter((i) => !i.hearted && !i.done));
}

export function selectArchive(ideas) {
  return ideas.filter((i) => i.done);
}

export function applyFilter(ideas, filter) {
  if (filter === 'all') return ideas;
  if (filter === 'urgent') {
    return ideas.filter((i) => i.priority === 'urgent');
  }
  if (filter === '$' || filter === '$$' || filter === '$$$') {
    return ideas.filter((i) => i.cost === filter);
  }
  return ideas.filter((i) => i.category === filter);
}

export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idea) => {
      const payload = { ...idea, deleted: false };
      const { data, error } = await supabase.from('ideas').insert([payload]).select().single();
      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('priority') || msg.includes('expires_at') || msg.includes('column')) {
          const { priority, expires_at, ...corePayload } = payload;
          const { data: retryData, error: retryError } = await supabase.from('ideas').insert([corePayload]).select().single();
          if (retryError) throw retryError;
          return normalizeIdea(retryData);
        }
        throw error;
      }
      return normalizeIdea(data);
    },
    onSuccess: (createdIdea) => {
      queryClient.setQueryData(IDEAS_QUERY_KEY, (old = []) => [createdIdea, ...old]);
      queryClient.invalidateQueries({ queryKey: IDEAS_QUERY_KEY });
    },
  });
}

export function useToggleHeart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, hearted }) => {
      const { error } = await supabase.from('ideas').update({ hearted }).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, hearted }) => {
      await queryClient.cancelQueries({ queryKey: IDEAS_QUERY_KEY });
      const previous = queryClient.getQueryData(IDEAS_QUERY_KEY);
      queryClient.setQueryData(IDEAS_QUERY_KEY, (old) => old?.map((i) => (i.id === id ? { ...i, hearted } : i)));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(IDEAS_QUERY_KEY, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: IDEAS_QUERY_KEY }),
  });
}

export function useMarkDone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('ideas').update({ done: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: IDEAS_QUERY_KEY }),
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('ideas').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: IDEAS_QUERY_KEY });
      const previous = queryClient.getQueryData(IDEAS_QUERY_KEY);
      queryClient.setQueryData(IDEAS_QUERY_KEY, (old) => old?.filter((i) => i.id !== id));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(IDEAS_QUERY_KEY, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: IDEAS_QUERY_KEY }),
  });
}
