import { store } from './state/store.js';
import { getUsername } from './utils/preferences.js';
import { fetchIdeas } from './actions/ideas.js';
import { renderBoard, updateLoadingUI } from './ui/renderBoard.js';
import { bindEvents } from './ui/bindEvents.js';
import { $ } from './ui/dom.js';
import { injectStaticIcons } from './ui/injectIcons.js';

// Inject SVG icons into static HTML elements
injectStaticIcons();

// Pre-fill saved username
const savedUsername = getUsername();
if (savedUsername) {
  $.addedByInput.value = savedUsername;
  store.set({ prefs: { username: savedUsername }, form: { addedBy: savedUsername } });
}

// Subscribe to store changes
store.subscribe((newState, prevState) => {
  if (prevState.ideas !== newState.ideas) {
    renderBoard();
  }

  if (prevState.ui.loading !== newState.ui.loading) {
    updateLoadingUI();
  }
});

// Bind all event handlers
bindEvents();

// Initial data load
fetchIdeas();
