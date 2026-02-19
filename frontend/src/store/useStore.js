import { create } from 'zustand';

const TAB_ORDER = { write: 0, box: 1, archive: 2 };

export const useStore = create((set, get) => ({
  // ── Tab navigation ───────────────────────────────────────────
  activeTab: 'write',
  tabDirection: 0,
  setActiveTab: (tab) => {
    const current = get().activeTab;
    if (tab === current) return;
    set({
      activeTab: tab,
      tabDirection: TAB_ORDER[tab] > TAB_ORDER[current] ? 1 : -1,
    });
  },

  // ── Filter ───────────────────────────────────────────────────
  activeFilter: 'all',
  setActiveFilter: (f) => set({ activeFilter: f }),

  // ── Wizard ───────────────────────────────────────────────────
  wizardStep: 0,
  setWizardStep: (s) => set({ wizardStep: Math.max(0, Math.min(2, s)) }),

  // ── Form selections (chips) ──────────────────────────────────
  selectedCost: null,
  selectedCategory: null,
  setSelectedCost: (c) =>
    set((s) => ({ selectedCost: s.selectedCost === c ? null : c })),
  setSelectedCategory: (c) =>
    set((s) => ({ selectedCategory: s.selectedCategory === c ? null : c })),

  // ── Form reset ───────────────────────────────────────────────
  resetForm: () =>
    set({ selectedCost: null, selectedCategory: null, wizardStep: 0 }),

  // ── Animation overlays ───────────────────────────────────────
  showEnvelopeAnimation: false,
  showStampCelebration: false,
  setShowEnvelope: (v) => set({ showEnvelopeAnimation: v }),
  setShowStamp: (v) => set({ showStampCelebration: v }),

  // ── Preferences ──────────────────────────────────────────────
  username: localStorage.getItem('mattevy-username') || '',
  setUsername: (name) => {
    localStorage.setItem('mattevy-username', name);
    set({ username: name });
  },
}));
