/**
 * Tiny pub/sub store.
 * createStore(initial) → { get, set, subscribe }
 *
 * set() does a one-level-deep merge for plain-object values so that
 * callers can do  store.set({ ui: { loading: true } })  without
 * clobbering sibling keys inside `ui`.
 */
function createStore(initial) {
  let state = structuredClone(initial);
  const listeners = new Set();

  function get() {
    return state;
  }

  function set(partial) {
    const prev = state;
    const next = { ...state };

    for (const key of Object.keys(partial)) {
      const oldVal = state[key];
      const newVal = partial[key];

      if (
        newVal !== null &&
        typeof newVal === 'object' &&
        !Array.isArray(newVal) &&
        oldVal !== null &&
        typeof oldVal === 'object' &&
        !Array.isArray(oldVal)
      ) {
        next[key] = { ...oldVal, ...newVal };
      } else {
        next[key] = newVal;
      }
    }

    state = next;
    listeners.forEach(fn => fn(state, prev));
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { get, set, subscribe };
}

export const store = createStore({
  ideas: [],
  ui: {
    selectedCost: null,
    selectedCategory: null,
    archiveOpen: false,
    animating: false,
    loading: false,
    error: null,
    activeFilter: 'all',
  },
  form: {
    title: '',
    description: '',
    location: '',
    addedBy: '',
  },
  prefs: {
    username: '',
  },
});
