import { store } from '../state/store.js';
import { $ } from './dom.js';
import { toggleHeart, markDone, removeIdea, createIdea } from '../actions/ideas.js';
import {
  updateWatermark,
  showError,
  hideError,
  setFormDisabled,
  resetForm,
  setAnimating,
  setActiveFilter,
} from '../actions/ui.js';
import { playSubmitAnimation } from './animation.js';
import { setupChips } from './chips.js';
import { saveUsername } from '../utils/preferences.js';
import { setupTabs, switchTab } from './tabs.js';
import { setupWizard, resetWizard } from './wizard.js';
import { setupSwipe } from './swipe.js';
import { setupSurpriseMe } from './surpriseMe.js';
import { playStampCelebration } from './confetti.js';
import { renderBoard } from './renderBoard.js';
import { iconHeart, iconHeartFilled } from './icons.js';

/* ── Card action delegation ─────────────────────────────────── */
function handleCardAction(e) {
  // Heart
  const heartBtn = e.target.closest('.btn-heart');
  if (heartBtn) {
    const id = Number(heartBtn.dataset.id);
    // Read current hearted state from store (not stale DOM attribute)
    const idea = store.get().ideas.find(i => i.id === id);
    if (!idea) return;
    const hearted = idea.hearted;
    // Springy animation
    heartBtn.classList.add('heart-spring');
    heartBtn.addEventListener('animationend', () => {
      heartBtn.classList.remove('heart-spring');
    }, { once: true });
    toggleHeart(id, hearted);
    return;
  }

  // Done
  const doneBtn = e.target.closest('.btn-done');
  if (doneBtn) {
    const card = doneBtn.closest('.postcard');
    const id = Number(doneBtn.dataset.id);

    // Animate SVG checkmark
    const path = doneBtn.querySelector('.done-check-path');
    if (path) {
      path.classList.add('draw-check');
    }

    // Card slide-down + fade-out
    setTimeout(() => {
      let handled = false;
      const doDone = () => {
        if (handled) return;
        handled = true;
        markDone(id);
        playStampCelebration();
      };
      card.classList.add('card-removing');
      card.addEventListener('animationend', doDone, { once: true });
      // Fallback: if animationend never fires, proceed after timeout
      setTimeout(doDone, 500);
    }, 400);
    return;
  }

  // Delete — show inline confirm
  const deleteBtn = e.target.closest('.btn-delete');
  if (deleteBtn) {
    const card = deleteBtn.closest('.postcard');
    const container = card.querySelector('.delete-confirm-container');
    if (container.style.display !== 'none') return;
    container.style.display = 'flex';
    container.innerHTML = `
      <div class="delete-confirm">
        Remove this idea?
        <button class="yes-btn" aria-label="Yes, delete">Yes</button>
        <button class="no-btn" aria-label="No, keep it">No</button>
      </div>
    `;
    return;
  }

  // Confirm delete
  const yesBtn = e.target.closest('.yes-btn');
  if (yesBtn) {
    const card = yesBtn.closest('.postcard');
    const id = Number(card.dataset.id);
    let removed = false;
    const doRemove = () => {
      if (removed) return;
      removed = true;
      removeIdea(id);
    };
    card.classList.add('card-removing');
    card.addEventListener('animationend', doRemove, { once: true });
    // Fallback: if animationend never fires, remove after timeout
    setTimeout(doRemove, 500);
    return;
  }

  // Cancel delete
  const noBtn = e.target.closest('.no-btn');
  if (noBtn) {
    const container = noBtn.closest('.delete-confirm-container');
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }
}

/* ── Filter pills ───────────────────────────────────────────── */
function setupFilterPills() {
  $.filterBar.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;

    $.filterBar.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    setActiveFilter(pill.dataset.filter);
    renderBoard();
  });
}

/* ── Public setup ───────────────────────────────────────────── */
export function bindEvents() {
  // Event delegation on all three card lists
  $.topPicksList.addEventListener('click', handleCardAction);
  $.theBoxList.addEventListener('click', handleCardAction);
  $.archiveList.addEventListener('click', handleCardAction);

  // Watermark & submit-button state
  $.titleInput.addEventListener('input', updateWatermark);

  // Submit
  $.submitBtn.addEventListener('click', async () => {
    const state = store.get();
    if (state.ui.animating) return;

    const title = $.titleInput.value.trim();
    if (!title) return;

    const name = $.addedByInput.value.trim();
    saveUsername(name);
    store.set({ prefs: { username: name } });

    const ideaData = {
      title,
      description: $.descInput.value.trim() || null,
      cost: state.ui.selectedCost || null,
      category: state.ui.selectedCategory || null,
      location: $.locationInput.value.trim() || null,
      added_by: name || null,
      hearted: false,
      done: false,
    };

    hideError();

    playSubmitAnimation(async () => {
      try {
        await createIdea(ideaData);
        resetForm();
        resetWizard();
        // Switch to The Box tab after submitting
        setTimeout(() => switchTab('box'), 300);
      } catch {
        showError("Couldn't send \u2014 check your connection and try again.");
        setFormDisabled(false);
        setAnimating(false);
      }
    });
  });

  // Tab navigation
  setupTabs();

  // Wizard
  setupWizard();

  // Swipe gestures
  setupSwipe();

  // Surprise Me
  setupSurpriseMe();

  // Filter pills
  setupFilterPills();

  // Chip groups
  setupChips('cost-chips', 'cost');
  setupChips('category-chips', 'category');
}
