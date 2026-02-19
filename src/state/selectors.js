export function selectTopPicks(ideas) {
  return ideas.filter(i => i.hearted && !i.done && !i.deleted);
}

export function selectBox(ideas) {
  return ideas.filter(i => !i.hearted && !i.done && !i.deleted);
}

export function selectArchive(ideas) {
  return ideas.filter(i => i.done && !i.deleted);
}
