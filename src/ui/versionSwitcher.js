const VERSION_KEY = 'mattevy_design_version';
const VERSIONS = {
  original: null,
  v1: 'version-1',
  v2: 'version-2',
  v3: 'version-3',
};

export function setupVersionSwitcher() {
  const toggle = document.getElementById('version-toggle');
  const panel = document.getElementById('version-panel');
  if (!toggle || !panel) return;

  // Restore saved version
  const saved = localStorage.getItem(VERSION_KEY) || 'original';
  applyVersion(saved);
  markActive(panel, saved);

  // Toggle panel open/close
  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
    toggle.classList.toggle('open', !isOpen);
  });

  // Version button clicks
  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('.version-btn');
    if (!btn) return;

    const version = btn.dataset.version;
    applyVersion(version);
    markActive(panel, version);
    localStorage.setItem(VERSION_KEY, version);

    // Close panel after selection
    panel.classList.remove('open');
    toggle.classList.remove('open');
  });

  // Close panel on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.version-switcher')) {
      panel.classList.remove('open');
      toggle.classList.remove('open');
    }
  });
}

function applyVersion(version) {
  // Remove all version classes
  Object.values(VERSIONS).forEach(cls => {
    if (cls) document.body.classList.remove(cls);
  });

  // Apply selected version class
  const cls = VERSIONS[version];
  if (cls) {
    document.body.classList.add(cls);
  }
}

function markActive(panel, version) {
  panel.querySelectorAll('.version-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.version === version);
  });
}
