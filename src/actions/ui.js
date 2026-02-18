import { store } from '../state/store.js';
import { $ } from '../ui/dom.js';

export function selectChip(type, value) {
  if (type === 'cost') {
    store.set({ ui: { selectedCost: value } });
  } else {
    store.set({ ui: { selectedCategory: value } });
  }
}

export function toggleArchive() {
  const { archiveOpen } = store.get().ui;
  store.set({ ui: { archiveOpen: !archiveOpen } });
}

export function setFormDisabled(disabled) {
  [$.titleInput, $.descInput, $.locationInput, $.addedByInput].forEach(el => {
    el.disabled = disabled;
  });
  document.querySelectorAll('#cost-chips .chip, #category-chips .chip').forEach(c => {
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

  store.set({
    ui: { selectedCost: null, selectedCategory: null },
    form: { title: '', description: '', location: '', addedBy: username },
  });

  document.querySelectorAll('#cost-chips .chip, #category-chips .chip').forEach(c => {
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
