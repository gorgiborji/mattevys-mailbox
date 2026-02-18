import { escapeHtml } from '../utils/escapeHtml.js';

export function renderCard(idea, isNew = false) {
  const div = document.createElement('div');
  div.className = 'postcard idea-card' + (isNew ? ' card-appearing' : '');
  div.dataset.id = idea.id;
  div.dataset.category = idea.category || '';

  const heartIcon  = idea.hearted ? '\u2764\uFE0F' : '\uD83E\uDD0D';
  const heartLabel = idea.hearted ? 'Remove from Top Picks' : 'Add to Top Picks';

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

  div.innerHTML = `
    <div class="card-header">
      <h3 class="card-title">${escapeHtml(idea.title)}</h3>
      <div class="card-actions">
        <button class="card-action-btn btn-heart"
                aria-label="${heartLabel}"
                data-id="${idea.id}"
                data-hearted="${idea.hearted}">${heartIcon}</button>
        ${!idea.done ? `<button class="card-action-btn btn-done"
                aria-label="Mark as done"
                data-id="${idea.id}">\u2713</button>` : ''}
        <button class="card-action-btn btn-delete"
                aria-label="Delete idea"
                data-id="${idea.id}">\u2715</button>
      </div>
    </div>
    ${idea.description ? `<p class="card-description">${escapeHtml(idea.description)}</p>` : ''}
    ${metaHtml ? `<div class="card-meta">${metaHtml}</div>` : ''}
    ${idea.added_by ? `<p class="card-signature">\u2014 ${escapeHtml(idea.added_by)}</p>` : ''}
    <div class="delete-confirm-container" style="display:none;"></div>
  `;

  return div;
}
