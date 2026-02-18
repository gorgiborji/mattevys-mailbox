import { escapeHtml } from '../utils/escapeHtml.js';

const CATEGORY_EMOJIS = {
  Food: '🍽️',
  Outdoors: '🌿',
  Cozy: '🕯️',
  Adventure: '⚡',
  Culture: '🎭',
};

export function renderCard(idea, isNew = false) {
  const div = document.createElement('div');
  div.className = 'postcard idea-card' + (isNew ? ' card-appearing' : '');
  div.dataset.id = idea.id;
  div.dataset.category = idea.category || '';

  const heartIcon  = idea.hearted ? '\u2764\uFE0F' : '\uD83E\uDD0D';
  const heartLabel = idea.hearted ? 'Remove from Top Picks' : 'Add to Top Picks';
  const cat = idea.category || '';
  const catEmoji = CATEGORY_EMOJIS[cat] || '';

  // Category gradient header band
  let gradientHeader = '';
  if (cat) {
    gradientHeader = `<div class="card-category-band" data-category="${escapeHtml(cat)}">
      <span class="category-band-emoji">${catEmoji}</span>
    </div>`;
  }

  let metaHtml = '';
  if (idea.location) {
    metaHtml += `<span class="card-meta-item" aria-label="Location">\uD83D\uDCCD ${escapeHtml(idea.location)}</span>`;
  }
  if (idea.cost) {
    metaHtml += `<span class="card-meta-item" aria-label="Cost: ${escapeHtml(idea.cost)}">\uD83D\uDCB0 ${escapeHtml(idea.cost)}</span>`;
  }
  if (idea.category) {
    metaHtml += `<span class="card-meta-item" aria-label="Category: ${escapeHtml(idea.category)}">\uD83C\uDFF7\uFE0F ${escapeHtml(idea.category)}</span>`;
  }

  // SVG checkmark for done button
  const doneBtn = !idea.done ? `<button class="card-action-btn btn-done"
          aria-label="Mark as done"
          data-id="${idea.id}">
          <svg class="done-check-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline class="done-check-path" points="4 12 9 17 20 6"/>
          </svg>
        </button>` : '';

  div.innerHTML = `
    ${gradientHeader}
    <div class="card-body">
      <div class="card-header">
        <h3 class="card-title">${escapeHtml(idea.title)}</h3>
        <div class="card-actions">
          <button class="card-action-btn btn-heart"
                  aria-label="${heartLabel}"
                  data-id="${idea.id}"
                  data-hearted="${idea.hearted}">${heartIcon}</button>
          ${doneBtn}
          <button class="card-action-btn btn-delete"
                  aria-label="Delete idea"
                  data-id="${idea.id}">\u2715</button>
        </div>
      </div>
      ${idea.description ? `<p class="card-description">${escapeHtml(idea.description)}</p>` : ''}
      ${metaHtml ? `<div class="card-meta">${metaHtml}</div>` : ''}
      ${idea.added_by ? `<p class="card-signature">\u2014 ${escapeHtml(idea.added_by)}</p>` : ''}
      <div class="delete-confirm-container" style="display:none;"></div>
    </div>
  `;

  return div;
}
