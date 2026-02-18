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
    // Optimistic update is correct — no re-fetch needed
  } catch {
    // Roll back optimistic update directly, no loading flash
    const rolledBack = store.get().ideas.map(i =>
      i.id === id ? { ...i, hearted: currentState } : i
    );
    store.set({ ideas: rolledBack });
  }
}

export async function markDone(id) {
  // Optimistic update — mark done in store immediately
  const prevIdeas = store.get().ideas;
  store.set({ ideas: prevIdeas.map(i => i.id === id ? { ...i, done: true } : i) });

  try {
    await repo.updateIdea(id, { done: true });
    // Optimistic update was correct — no re-fetch needed
  } catch {
    // Roll back
    store.set({ ideas: prevIdeas });
  }
}

export async function removeIdea(id) {
  // Optimistic update — remove from store immediately
  const prevIdeas = store.get().ideas;
  store.set({ ideas: prevIdeas.filter(i => i.id !== id) });

  try {
    await repo.deleteIdea(id);
    // Optimistic update was correct — no re-fetch needed
  } catch {
    // Roll back: restore the idea
    store.set({ ideas: prevIdeas });
  }
}
