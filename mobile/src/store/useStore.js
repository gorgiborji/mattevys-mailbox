import { create } from 'zustand';

const TAB_ORDER = { write: 0, box: 1, archive: 2 };

export const useStore = create((set, get) => ({
  activeTab: 'write',
  tabDirection: 0,
  setActiveTab: (tab) => {
    const current = get().activeTab;
    if (tab === current) return;
    set({ activeTab: tab, tabDirection: TAB_ORDER[tab] > TAB_ORDER[current] ? 1 : -1 });
  },

  activeFilter: 'all',
  setActiveFilter: (f) => set({ activeFilter: f }),

  wizardStep: 0,
  setWizardStep: (s) => set({ wizardStep: Math.max(0, Math.min(2, s)) }),

  selectedCost: null,
  selectedCategory: null,
  selectedPriority: null,
  setSelectedCost: (c) => set((s) => ({ selectedCost: s.selectedCost === c ? null : c })),
  setSelectedCategory: (c) => set((s) => ({ selectedCategory: s.selectedCategory === c ? null : c })),
  setSelectedPriority: (p) => set((s) => ({ selectedPriority: s.selectedPriority === p ? null : p })),

  formTitle: '',
  formDescription: '',
  formExpiresAt: '',
  setFormTitle: (v) => set({ formTitle: v }),
  setFormDescription: (v) => set({ formDescription: v }),
  setFormExpiresAt: (v) => set({ formExpiresAt: v }),

  resetForm: () =>
    set({ selectedCost: null, selectedCategory: null, selectedPriority: null, wizardStep: 0, formTitle: '', formDescription: '', formExpiresAt: '' }),

  showEnvelopeAnimation: false,
  showStampCelebration: false,
  setShowEnvelope: (v) => set({ showEnvelopeAnimation: v }),
  setShowStamp: (v) => set({ showStampCelebration: v }),

  username: '',
  setUsername: (name) => set({ username: name || '' }),
}));
