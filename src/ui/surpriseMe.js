import { $ } from './dom.js';
import { store } from '../state/store.js';
import { selectBox, selectTopPicks } from '../state/selectors.js';
import { markDone } from '../actions/ideas.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { playStampCelebration } from './confetti.js';

const CATEGORY_EMOJIS = {
  Food: '🍽️',
  Outdoors: '🌿',
  Cozy: '🕯️',
  Adventure: '⚡',
  Culture: '🎭',
};

const CATEGORY_COLORS = {
  Food:      'var(--cat-food)',
  Outdoors:  'var(--cat-outdoors)',
  Cozy:      'var(--cat-cozy)',
  Adventure: 'var(--cat-adventure)',
  Culture:   'var(--cat-culture)',
};

let currentIdeaId = null;

export function setupSurpriseMe() {
  $.surpriseFab.addEventListener('click', openSurprise);
  $.surpriseClose.addEventListener('click', closeSurprise);
  $.surpriseModal.addEventListener('click', (e) => {
    if (e.target === $.surpriseModal) closeSurprise();
  });

  $.surpriseCta.addEventListener('click', () => {
    if (currentIdeaId == null) return;
    closeSurprise();
    markDone(currentIdeaId);
    playStampCelebration();
    currentIdeaId = null;
  });
}

function openSurprise() {
  const ideas = store.get().ideas;
  const pool = [...selectBox(ideas), ...selectTopPicks(ideas)];
  if (pool.length === 0) return;

  const idea = pool[Math.floor(Math.random() * pool.length)];
  currentIdeaId = idea.id;

  const cat = idea.category || '';
  const emoji = CATEGORY_EMOJIS[cat] || '💌';
  const color = CATEGORY_COLORS[cat] || 'var(--blush)';

  $.surpriseEmoji.textContent = emoji;
  $.surpriseTitle.textContent = idea.title;
  $.surpriseDesc.textContent = idea.description || '';
  $.surpriseDesc.style.display = idea.description ? '' : 'none';

  let metaHtml = '';
  if (idea.location) metaHtml += `<span>📍 ${escapeHtml(idea.location)}</span>`;
  if (idea.cost) metaHtml += `<span>💰 ${escapeHtml(idea.cost)}</span>`;
  if (idea.category) metaHtml += `<span>🏷️ ${escapeHtml(idea.category)}</span>`;
  $.surpriseMeta.innerHTML = metaHtml;

  // Color theme
  $.surpriseModal.querySelector('.surprise-modal').style.background =
    `linear-gradient(135deg, ${color}33 0%, var(--card-bg) 50%)`;

  $.surpriseModal.style.display = 'flex';
  requestAnimationFrame(() => {
    $.surpriseModal.classList.add('visible');
  });
}

function closeSurprise() {
  $.surpriseModal.classList.remove('visible');
  setTimeout(() => {
    $.surpriseModal.style.display = 'none';
  }, 300);
}
