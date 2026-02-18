import { store } from '../state/store.js';
import { $ } from './dom.js';
import { toggleHeart, markDone, removeIdea, createIdea } from '../actions/ideas.js';
import {
  toggleArchive,
  updateWatermark,
  showError,
  hideError,
  setFormDisabled,
  resetForm,
  setAnimating,
} from '../actions/ui.js';
import { playSubmitAnimation } from './animation.js';
import { setupChips } from './chips.js';
import { saveUsername } from '../utils/preferences.js';

/* ── Card action delegation ─────────────────────────────────── */
function handleCardAction(e) {
  // Heart
  const heartBtn = e.target.closest('.btn-heart');
  if (heartBtn) {
    const id = Number(heartBtn.dataset.id);
    const hearted = heartBtn.dataset.hearted === 'true';
    toggleHeart(id, hearted);
    return;
  }

  // Done
  const doneBtn = e.target.closest('.btn-done');
  if (doneBtn) {
    const card = doneBtn.closest('.postcard');
    const id = Number(doneBtn.dataset.id);
    // Small pulse animation on the card
    card.style.transition = 'transform 0.15s';
    card.style.transform = 'scale(0.97)';
    setTimeout(() => { card.style.transform = ''; markDone(id); }, 150);
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
    removeIdea(id);
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
      } catch {
        showError("Couldn't send \u2014 check your connection and try again \uD83D\uDC8C");
        setFormDisabled(false);
        setAnimating(false);
      }
    });
  });

  // Archive toggle
  function handleArchiveToggle() { toggleArchive(); }

  $.archiveToggle.addEventListener('click', handleArchiveToggle);
  $.archiveToggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleArchiveToggle();
    }
  });

  // Chip groups
  setupChips('cost-chips', 'cost');
  setupChips('category-chips', 'category');
}
