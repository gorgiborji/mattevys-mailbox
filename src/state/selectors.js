function sortUrgentFirst(ideas) {
  return [...ideas].sort((a, b) => {
    const aUrgent = a.priority === 'urgent' ? 1 : 0;
    const bUrgent = b.priority === 'urgent' ? 1 : 0;
    return bUrgent - aUrgent;
  });
}

export function selectTopPicks(ideas) {
  return sortUrgentFirst(ideas.filter(i => i.hearted && !i.done && !i.deleted));
}

export function selectBox(ideas) {
  return sortUrgentFirst(ideas.filter(i => !i.hearted && !i.done && !i.deleted));
}

export function selectArchive(ideas) {
  return ideas.filter(i => i.done && !i.deleted);
}
