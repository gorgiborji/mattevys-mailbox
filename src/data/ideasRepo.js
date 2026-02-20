import { sb } from '../config.js';

export async function listIdeas() {
  const { data, error } = await sb
    .from('ideas')
    .select('*')
    .or('deleted.is.null,deleted.eq.false')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addIdea(idea) {
  const { error } = await sb.from('ideas').insert([idea]);

  // Fallback: if insert fails because priority/expires_at columns don't exist
  // yet (migration not run), retry without those fields
  if (error) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('priority') || msg.includes('expires_at') || msg.includes('column')) {
      const { priority, expires_at, ...coreIdea } = idea;
      const { error: retryError } = await sb.from('ideas').insert([coreIdea]);
      if (retryError) throw retryError;
      return;
    }
    throw error;
  }
}

export async function updateIdea(id, patch) {
  const { error } = await sb
    .from('ideas')
    .update(patch)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteIdea(id) {
  const { error } = await sb
    .from('ideas')
    .update({ deleted: true })
    .eq('id', id);
  if (error) throw error;
}
