import { sb } from '../config.js';

export async function listIdeas() {
  const { data, error } = await sb
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addIdea(idea) {
  const { error } = await sb.from('ideas').insert([idea]);
  if (error) throw error;
}

export async function updateIdea(id, patch) {
  const { error } = await sb
    .from('ideas')
    .update(patch)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteIdea(id) {
  const { error } = await sb.from('ideas').delete().eq('id', id);
  if (error) throw error;
}
