import { Utensils, Leaf, Flame, Zap, Palette } from 'lucide-react';

export const CATEGORIES = ['Food', 'Outdoors', 'Cozy', 'Adventure', 'Culture'];
export const COSTS = ['$', '$$', '$$$'];

export const CATEGORY_COLORS = {
  Food: '#F4A261',
  Outdoors: '#81B29A',
  Cozy: '#E8C5E5',
  Adventure: '#F4D35E',
  Culture: '#B5C7D3',
};

export const CATEGORY_ICONS = {
  Food: Utensils,
  Outdoors: Leaf,
  Cozy: Flame,
  Adventure: Zap,
  Culture: Palette,
};

export const CONFETTI_COLORS = [
  '#F2C4CE', '#B7C9B0', '#D4C5E2',
  '#F4A261', '#F4D35E', '#B5C7D3', '#E8C5E5',
];

export const EASE_OUT = [0.22, 1, 0.36, 1];
export const SPRING = { type: 'spring', stiffness: 400, damping: 25, mass: 0.8 };
