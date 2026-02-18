import { toggleHeart, removeIdea } from '../actions/ideas.js';

const THRESHOLD = 80;
const MAX_DRAG = 120;

export function setupSwipe() {
  // Only enable on touch devices
  if (!('ontouchstart' in window)) return;

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
}

let activeCard = null;
let startX = 0;
let startY = 0;
let deltaX = 0;
let locked = false; // true once we decide horizontal vs vertical

function onTouchStart(e) {
  const card = e.target.closest('.idea-card');
  if (!card) return;
  // Don't interfere with buttons
  if (e.target.closest('.card-action-btn, .delete-confirm, .yes-btn, .no-btn')) return;

  activeCard = card;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  deltaX = 0;
  locked = false;
  card.style.transition = 'none';
}

function onTouchMove(e) {
  if (!activeCard) return;
  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;

  // Decide direction on first significant move
  if (!locked) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    if (Math.abs(dy) > Math.abs(dx)) {
      // Vertical scroll — abort swipe
      activeCard = null;
      return;
    }
    locked = true;
  }

  e.preventDefault();
  deltaX = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx));

  activeCard.style.transform = `translateX(${deltaX}px)`;

  // Show color hint
  if (deltaX < -30) {
    activeCard.style.background = `linear-gradient(to left, rgba(192,57,43,${Math.min(0.15, Math.abs(deltaX) / 400)}), var(--card-bg) 60%)`;
  } else if (deltaX > 30) {
    activeCard.style.background = `linear-gradient(to right, rgba(242,196,206,${Math.min(0.25, deltaX / 300)}), var(--card-bg) 60%)`;
  } else {
    activeCard.style.background = '';
  }
}

function onTouchEnd() {
  if (!activeCard) return;
  const card = activeCard;
  const id = Number(card.dataset.id);
  const hearted = card.querySelector('.btn-heart')?.dataset.hearted === 'true';

  card.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease';

  if (deltaX < -THRESHOLD) {
    // Swipe left — delete
    card.style.transform = 'translateX(-100%)';
    card.style.opacity = '0';
    setTimeout(() => {
      removeIdea(id);
    }, 250);
  } else if (deltaX > THRESHOLD) {
    // Swipe right — toggle heart
    card.style.transform = 'translateX(0)';
    card.style.background = '';
    toggleHeart(id, hearted);
  } else {
    // Snap back
    card.style.transform = '';
    card.style.background = '';
  }

  activeCard = null;
  deltaX = 0;
}
