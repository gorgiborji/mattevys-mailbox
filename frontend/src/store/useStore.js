import { create } from "zustand";

const TAB_ORDER = { write: 0, box: 1, archive: 2 };

export const useStore = create((set, get) => ({
  activeTab: "write",
  tabDirection: 0,
  setActiveTab: (tab) => {
    const current = get().activeTab;
    if (tab === current) return;
    set({
      activeTab: tab,
      tabDirection: TAB_ORDER[tab] > TAB_ORDER[current] ? 1 : -1,
    });
  },

  activeFilter: "all",
  setActiveFilter: (f) => set({ activeFilter: f }),

  wizardStep: 0,
  setWizardStep: (s) => set({ wizardStep: Math.max(0, Math.min(2, s)) }),

  selectedCost: null,
  selectedCategory: null,
  setSelectedCost: (c) =>
    set((s) => ({ selectedCost: s.selectedCost === c ? null : c })),
  setSelectedCategory: (c) =>
    set((s) => ({ selectedCategory: s.selectedCategory === c ? null : c })),

  formTitle: '',
  formDescription: '',
  setFormTitle: (v) => set({ formTitle: v }),
  setFormDescription: (v) => set({ formDescription: v }),

  resetForm: () =>
    set({ selectedCost: null, selectedCategory: null, wizardStep: 0, formTitle: '', formDescription: '' }),

  showEnvelopeAnimation: false,
  showStampCelebration: false,
  setShowEnvelope: (v) => set({ showEnvelopeAnimation: v }),
  setShowStamp: (v) => set({ showStampCelebration: v }),

  username: localStorage.getItem("mattevy-username") || "",
  setUsername: (name) => {
    localStorage.setItem("mattevy-username", name);
    set({ username: name });
  },
}));
