import { store } from '../state/store.js';
import * as repo from '../data/ideasRepo.js';

export async function fetchIdeas() {
  store.set({ ui: { loading: true } });
  try {
    const ideas = await repo.listIdeas();
    store.set({ ideas, ui: { loading: false } });
  } catch {
    store.set({ ui: { loading: false } });
  }
}

export async function createIdea(ideaData) {
  await repo.addIdea(ideaData);
  await fetchIdeas();
}

export async function toggleHeart(id, currentState) {
  // Optimistic update
  const ideas = store.get().ideas.map(i =>
    i.id === id ? { ...i, hearted: !currentState } : i
  );
  store.set({ ideas });

  try {
    await repo.updateIdea(id, { hearted: !currentState });
    await fetchIdeas();
  } catch {
    // Roll back optimistic update
    await fetchIdeas();
  }
}

export async function markDone(id) {
  try {
    await repo.updateIdea(id, { done: true });
    await fetchIdeas();
  } catch {
    await fetchIdeas();
  }
}

export async function removeIdea(id) {
  try {
    await repo.deleteIdea(id);
    await fetchIdeas();
  } catch {
    await fetchIdeas();
  }
}
