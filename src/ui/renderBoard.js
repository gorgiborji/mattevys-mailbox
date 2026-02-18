import { $ } from './dom.js';
import { store } from '../state/store.js';
import { selectTopPicks, selectBox, selectArchive } from '../state/selectors.js';
import { renderCard } from './renderCard.js';

export function renderBoard() {
  const state = store.get();
  const { ideas } = state;
  const filter = state.ui.activeFilter || 'all';

  const topPicks = selectTopPicks(ideas);
  const theBox   = selectBox(ideas);
  const archived = selectArchive(ideas);

  // Apply filter to box/top picks
  const filteredTopPicks = applyFilter(topPicks, filter);
  const filteredBox      = applyFilter(theBox, filter);

  // Top Picks
  $.topPicksList.innerHTML = '';
  filteredTopPicks.forEach((idea, i) => {
    const card = renderCard(idea);
    card.style.animationDelay = `${i * 50}ms`;
    card.classList.add('card-stagger');
    $.topPicksList.appendChild(card);
  });
  $.topPicksEmpty.style.display = filteredTopPicks.length === 0 ? '' : 'none';

  // The Box
  $.theBoxList.innerHTML = '';
  filteredBox.forEach((idea, i) => {
    const card = renderCard(idea);
    card.style.animationDelay = `${i * 50}ms`;
    card.classList.add('card-stagger');
    $.theBoxList.appendChild(card);
  });
  $.theBoxEmpty.style.display = filteredBox.length === 0 ? '' : 'none';

  // Archive
  $.archiveList.innerHTML = '';
  archived.forEach(idea => $.archiveList.appendChild(renderCard(idea)));
  $.archiveCount.textContent = archived.length > 0 ? `(${archived.length})` : '';
  $.archiveEmpty.style.display = archived.length === 0 ? '' : 'none';
}

function applyFilter(ideas, filter) {
  if (filter === 'all') return ideas;
  // Cost filters
  if (filter === '$' || filter === '$$' || filter === '$$$') {
    return ideas.filter(i => i.cost === filter);
  }
  // Category filters
  return ideas.filter(i => i.category === filter);
}

export function updateArchiveUI() {
  // Archive is now always visible on its tab — just update content
  const state = store.get();
  const archived = selectArchive(state.ideas);
  $.archiveEmpty.style.display = archived.length === 0 ? '' : 'none';
}

export function updateLoadingUI() {
  const { loading } = store.get().ui;
  if (loading) {
    $.skeletonCards.style.display = '';
    $.topPicksList.parentElement.style.display = 'none';
    $.theBoxList.parentElement.style.display = 'none';
  } else {
    $.skeletonCards.style.display = 'none';
    $.topPicksList.parentElement.style.display = '';
    $.theBoxList.parentElement.style.display = '';
  }
}
