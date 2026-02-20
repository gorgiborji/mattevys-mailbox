// Lucide-based SVG icons (MIT License) — consistent, cross-platform replacements for emojis
// All icons: 24x24 viewBox, stroke-based, inheriting currentColor

const svg = (w, h, inner) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

// ── Tab bar & navigation ──────────────────────────────────────────
export const iconPenLine = (s = 20) => svg(s, s,
  `<path d="M12 20h9"/><path d="m16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z"/>`);

export const iconInbox = (s = 20) => svg(s, s,
  `<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>`);

export const iconArchive = (s = 20) => svg(s, s,
  `<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>`);

// ── Card actions ──────────────────────────────────────────────────
export const iconHeart = (s = 18) => svg(s, s,
  `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.332.88-4.5 2.17A6.826 6.826 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`);

export const iconHeartFilled = (s = 18) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.332.88-4.5 2.17A6.826 6.826 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;

export const iconX = (s = 16) => svg(s, s,
  `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`);

// ── Meta icons ────────────────────────────────────────────────────
export const iconMapPin = (s = 14) => svg(s, s,
  `<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>`);

export const iconDollarSign = (s = 14) => svg(s, s,
  `<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`);

export const iconTag = (s = 14) => svg(s, s,
  `<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>`);

// ── Category icons ────────────────────────────────────────────────
export const iconUtensils = (s = 18) => svg(s, s,
  `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>`);

export const iconLeaf = (s = 18) => svg(s, s,
  `<path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 .5 20 .5s1.5 6-2 12c-1.5 2.5-3.5 4-6 5.5"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>`);

export const iconFlame = (s = 18) => svg(s, s,
  `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>`);

export const iconZap = (s = 18) => svg(s, s,
  `<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>`);

export const iconPalette = (s = 18) => svg(s, s,
  `<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>`);

// ── Category lookup ───────────────────────────────────────────────
const CATEGORY_ICONS = {
  Food:      iconUtensils,
  Outdoors:  iconLeaf,
  Cozy:      iconFlame,
  Adventure: iconZap,
  Culture:   iconPalette,
};

export function categoryIcon(cat, size = 18) {
  const fn = CATEGORY_ICONS[cat];
  return fn ? fn(size) : '';
}

// ── Special icons ─────────────────────────────────────────────────
export const iconMail = (s = 22) => svg(s, s,
  `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`);

export const iconDice = (s = 22) => svg(s, s,
  `<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M16 8h.01"/><path d="M8 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/>`);

export const iconSparkles = (s = 16) => svg(s, s,
  `<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>`);

export const iconCheckCircle = (s = 18) => svg(s, s,
  `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>`);

export const iconSend = (s = 18) => svg(s, s,
  `<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>`);

export const iconPenTool = (s = 14) => svg(s, s,
  `<circle cx="12" cy="12" r="3"/><path d="M12 2v7"/><path d="m4.93 4.93 4.24 4.24"/><path d="M2 12h7"/><path d="m4.93 19.07 4.24-4.24"/><path d="M12 22v-7"/><path d="m19.07 19.07-4.24-4.24"/><path d="M22 12h-7"/><path d="m19.07 4.93-4.24 4.24"/>`);

export const iconStamp = (s = 22) => svg(s, s,
  `<path d="M5 22h14"/><path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77Z"/><path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13"/>`);

// ── Priority / expiry icons ─────────────────────────────────────
export const iconClock = (s = 14) => svg(s, s,
  `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`);

export const iconAlertTriangle = (s = 14) => svg(s, s,
  `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>`);
