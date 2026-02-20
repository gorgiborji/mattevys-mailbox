import { store } from '../state/store.js';
import { $ } from '../ui/dom.js';

export function selectChip(type, value) {
  if (type === 'cost') {
    store.set({ ui: { selectedCost: value } });
  } else if (type === 'priority') {
    store.set({ ui: { selectedPriority: value } });
    // Show/hide expiry date picker based on priority
    if ($.expiresRow) {
      $.expiresRow.style.display = value === 'urgent' ? '' : 'none';
    }
    // Clear expiry date when switching back to normal
    if (value !== 'urgent' && $.expiresInput) {
      $.expiresInput.value = '';
    }
  } else {
    store.set({ ui: { selectedCategory: value } });
  }
}

export function toggleArchive() {
  const { archiveOpen } = store.get().ui;
  store.set({ ui: { archiveOpen: !archiveOpen } });
}

export function setFormDisabled(disabled) {
  [$.titleInput, $.descInput, $.locationInput, $.addedByInput, $.expiresInput].forEach(el => {
    if (el) el.disabled = disabled;
  });
  document.querySelectorAll('#cost-chips .chip, #category-chips .chip, #priority-chips .chip').forEach(c => {
    c.style.pointerEvents = disabled ? 'none' : '';
  });
  $.submitBtn.disabled = disabled;
}

export function updateWatermark() {
  const title = $.titleInput.value;
  $.watermark.style.opacity = title.length > 0 ? '0' : '';
  $.submitBtn.disabled = title.trim().length === 0;
  store.set({ form: { title } });
}

export function showError(message) {
  $.submitError.textContent = message;
  $.submitError.style.display = '';
  store.set({ ui: { error: message } });
}

export function hideError() {
  $.submitError.style.display = 'none';
  store.set({ ui: { error: null } });
}

export function resetForm() {
  const username = store.get().prefs.username;

  $.titleInput.value    = '';
  $.descInput.value     = '';
  $.locationInput.value = '';
  $.addedByInput.value  = username;

  if ($.expiresInput) $.expiresInput.value = '';
  if ($.expiresRow) $.expiresRow.style.display = 'none';

  store.set({
    ui: { selectedCost: null, selectedCategory: null, selectedPriority: null },
    form: { title: '', description: '', location: '', addedBy: username },
  });

  document.querySelectorAll('#cost-chips .chip, #category-chips .chip, #priority-chips .chip').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-checked', 'false');
  });

  $.submitBtn.disabled = true;
  $.watermark.style.opacity = '';
  $.submitError.style.display = 'none';
  setFormDisabled(false);
  $.titleInput.focus();
}

export function setAnimating(value) {
  store.set({ ui: { animating: value } });
}

export function setActiveFilter(filter) {
  store.set({ ui: { activeFilter: filter } });
}
