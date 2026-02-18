export function selectTopPicks(ideas) {
  return ideas.filter(i => i.hearted && !i.done);
}

export function selectBox(ideas) {
  return ideas.filter(i => !i.hearted && !i.done);
}

export function selectArchive(ideas) {
  return ideas.filter(i => i.done);
}
