import { $ } from './dom.js';
import { store } from '../state/store.js';
import { selectBox, selectTopPicks } from '../state/selectors.js';
import { markDone } from '../actions/ideas.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { playStampCelebration } from './confetti.js';
import { categoryIcon, iconMail, iconMapPin, iconDollarSign, iconTag, iconClock } from './icons.js';

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
  const icon = categoryIcon(cat, 52) || iconMail(52);
  const color = CATEGORY_COLORS[cat] || 'var(--blush)';

  $.surpriseEmoji.innerHTML = icon;
  $.surpriseTitle.textContent = idea.title;
  $.surpriseDesc.textContent = idea.description || '';
  $.surpriseDesc.style.display = idea.description ? '' : 'none';

  let metaHtml = '';
  if (idea.location) metaHtml += `<span>${iconMapPin()} ${escapeHtml(idea.location)}</span>`;
  if (idea.cost) metaHtml += `<span>${iconDollarSign()} ${escapeHtml(idea.cost)}</span>`;
  if (idea.category) metaHtml += `<span>${iconTag()} ${escapeHtml(idea.category)}</span>`;
  if (idea.expires_at) {
    const exp = new Date(idea.expires_at + 'T00:00:00');
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const days = Math.ceil((exp - now) / 86400000);
    let label = days < 0 ? 'Expired' : days === 0 ? 'Expires today' : days === 1 ? 'Expires tomorrow' : `Expires in ${days} days`;
    metaHtml += `<span>${iconClock()} ${escapeHtml(label)}</span>`;
  }
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
