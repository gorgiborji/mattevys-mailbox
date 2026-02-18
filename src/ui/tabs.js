import { $ } from './dom.js';
import { store } from '../state/store.js';

const TABS = { write: $.tabWrite, box: $.tabBox, archive: $.tabArchive };

let currentTab = 'write';
let sliding = false;

export function getCurrentTab() {
  return currentTab;
}

export function switchTab(tabName, direction) {
  if (tabName === currentTab || sliding) return;
  sliding = true;

  const outPane = TABS[currentTab];
  const inPane  = TABS[tabName];
  const goRight = direction === 'right' ||
    (!direction && tabOrder(tabName) > tabOrder(currentTab));

  // Set entry position
  inPane.classList.remove('active', 'slide-out-left', 'slide-out-right');
  inPane.classList.add(goRight ? 'slide-in-right' : 'slide-in-left');
  inPane.style.display = '';
  inPane.classList.add('active');

  // Slide out current
  outPane.classList.add(goRight ? 'slide-out-left' : 'slide-out-right');

  // Update tab bar buttons
  $.tabBar.querySelectorAll('.tab-bar-btn').forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    if (isActive) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  // After animation completes
  setTimeout(() => {
    outPane.classList.remove('active', 'slide-out-left', 'slide-out-right');
    inPane.classList.remove('slide-in-left', 'slide-in-right');
    currentTab = tabName;
    sliding = false;

    // Show archive items when switching to archive tab
    if (tabName === 'archive') {
      $.archiveList.style.display = '';
      const archived = store.get().ideas.filter(i => i.done);
      $.archiveEmpty.style.display = archived.length === 0 ? '' : 'none';
    }
  }, 300);
}

function tabOrder(name) {
  return name === 'write' ? 0 : name === 'box' ? 1 : 2;
}

export function setupTabs() {
  $.tabBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-bar-btn');
    if (!btn) return;
    switchTab(btn.dataset.tab);
  });
}
