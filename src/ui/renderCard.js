import { escapeHtml } from '../utils/escapeHtml.js';
import { categoryIcon, iconHeart, iconHeartFilled, iconX, iconMapPin, iconDollarSign, iconTag, iconClock, iconAlertTriangle } from './icons.js';

function expiryLabel(expiresAt) {
  if (!expiresAt) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiresAt + 'T00:00:00');
  const diffMs = exp - now;
  const days = Math.ceil(diffMs / 86400000);

  if (days < 0) return { text: 'Expired', cls: 'card-expiry-expired' };
  if (days === 0) return { text: 'Expires today', cls: 'card-expiry-urgent' };
  if (days === 1) return { text: 'Expires tomorrow', cls: 'card-expiry-urgent' };
  if (days <= 3) return { text: `Expires in ${days} days`, cls: 'card-expiry-soon' };
  return { text: `Expires in ${days} days`, cls: '' };
}

export function renderCard(idea, isNew = false) {
  const div = document.createElement('div');
  const isExpired = idea.expires_at && new Date(idea.expires_at + 'T00:00:00') < new Date(new Date().toDateString());
  div.className = 'postcard idea-card' + (isNew ? ' card-appearing' : '') + (isExpired ? ' card-expired' : '');
  div.dataset.id = idea.id;
  div.dataset.category = idea.category || '';

  const heartIcon  = idea.hearted ? iconHeartFilled() : iconHeart();
  const heartLabel = idea.hearted ? 'Remove from Top Picks' : 'Add to Top Picks';
  const cat = idea.category || '';
  const catIcon = categoryIcon(cat);

  const isUrgent = idea.priority === 'urgent';

  // Category gradient header band
  let gradientHeader = '';
  if (cat || isUrgent) {
    const urgentBadge = isUrgent
      ? `<span class="category-band-urgent">${iconAlertTriangle(14)} Time-sensitive</span>`
      : '';
    gradientHeader = `<div class="card-category-band${isUrgent ? ' band-urgent' : ''}" data-category="${escapeHtml(cat)}">
      ${cat ? `<span class="category-band-icon">${catIcon}</span>` : ''}
      ${urgentBadge}
    </div>`;
  }

  let metaHtml = '';
  if (idea.location) {
    metaHtml += `<span class="card-meta-item" aria-label="Location">${iconMapPin()} ${escapeHtml(idea.location)}</span>`;
  }
  if (idea.cost) {
    metaHtml += `<span class="card-meta-item" aria-label="Cost: ${escapeHtml(idea.cost)}">${iconDollarSign()} ${escapeHtml(idea.cost)}</span>`;
  }
  if (idea.category) {
    metaHtml += `<span class="card-meta-item" aria-label="Category: ${escapeHtml(idea.category)}">${iconTag()} ${escapeHtml(idea.category)}</span>`;
  }

  const expiry = expiryLabel(idea.expires_at);
  if (expiry) {
    metaHtml += `<span class="card-meta-item card-expiry ${expiry.cls}" aria-label="${escapeHtml(expiry.text)}">${iconClock()} ${escapeHtml(expiry.text)}</span>`;
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
                  data-id="${idea.id}">${iconX()}</button>
        </div>
      </div>
      ${idea.description ? `<p class="card-description">${escapeHtml(idea.description)}</p>` : ''}
      ${metaHtml ? `<div class="card-meta">${metaHtml}</div>` : ''}
      ${idea.added_by ? `<p class="card-signature">\u2014 ${escapeHtml(idea.added_by)}</p>` : ''}
    </div>
  `;

  return div;
}
