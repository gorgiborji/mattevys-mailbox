import { $ } from './dom.js';
import { store } from '../state/store.js';
import { selectTopPicks, selectBox, selectArchive } from '../state/selectors.js';
import { renderCard } from './renderCard.js';

export function renderBoard() {
  const state = store.get();
  const { ideas } = state;
  const { archiveOpen } = state.ui;

  const topPicks = selectTopPicks(ideas);
  const theBox   = selectBox(ideas);
  const archived = selectArchive(ideas);

  // Top Picks
  $.topPicksList.innerHTML = '';
  topPicks.forEach(idea => $.topPicksList.appendChild(renderCard(idea)));
  $.topPicksEmpty.style.display = topPicks.length === 0 ? '' : 'none';

  // The Box
  $.theBoxList.innerHTML = '';
  theBox.forEach(idea => $.theBoxList.appendChild(renderCard(idea)));
  $.theBoxEmpty.style.display = theBox.length === 0 ? '' : 'none';

  // Archive
  $.archiveList.innerHTML = '';
  archived.forEach(idea => $.archiveList.appendChild(renderCard(idea)));
  $.archiveCount.textContent = archived.length > 0 ? `(${archived.length})` : '';
  $.archiveEmpty.style.display = archived.length === 0 && archiveOpen ? '' : 'none';
}

export function updateArchiveUI() {
  const state = store.get();
  const { archiveOpen } = state.ui;
  const archived = selectArchive(state.ideas);

  $.archiveToggle.classList.toggle('expanded', archiveOpen);
  $.archiveToggle.setAttribute('aria-expanded', archiveOpen ? 'true' : 'false');

  if (archiveOpen) {
    $.archiveList.style.display = '';
    $.archiveEmpty.style.display = archived.length === 0 ? '' : 'none';
  } else {
    $.archiveList.style.display = 'none';
    $.archiveEmpty.style.display = 'none';
  }
}

export function updateLoadingUI() {
  const { loading } = store.get().ui;
  if (loading) {
    $.appMain.classList.add('loading');
  } else {
    $.appMain.classList.remove('loading');
  }
}
