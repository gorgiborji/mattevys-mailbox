import {
  iconMail, iconPenLine, iconInbox, iconArchive,
  iconHeart, iconHeartFilled, iconDice, iconX, iconSparkles,
  iconMapPin, iconStamp, iconPenTool, iconCheckCircle,
  iconUtensils, iconLeaf, iconFlame, iconZap, iconPalette,
  iconClock, iconAlertTriangle,
} from './icons.js';

/**
 * Injects SVG icons into all static placeholder elements on page load.
 * This replaces Apple emojis with consistent Lucide line icons.
 */
export function injectStaticIcons() {
  const set = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  // Header
  set('header-icon', iconMail(22));

  // Tab bar
  set('tab-icon-write', iconPenLine(22));
  set('tab-icon-box', iconInbox(22));
  set('tab-icon-archive', iconArchive(22));

  // Section labels & headers
  set('section-write-icon', iconMail(18));
  set('section-heart-icon', iconHeartFilled(18));
  set('section-box-icon', iconInbox(18));
  set('section-archive-icon', iconCheckCircle(18));

  // Form decorations
  set('stamp-icon', iconStamp(22));
  set('location-icon', iconMapPin(14));
  set('signature-icon', iconPenTool(14));

  // Filter pill icons
  set('filter-food-icon', iconUtensils(14));
  set('filter-outdoors-icon', iconLeaf(14));
  set('filter-cozy-icon', iconFlame(14));
  set('filter-adventure-icon', iconZap(14));
  set('filter-culture-icon', iconPalette(14));

  // Priority & expiry
  set('priority-urgent-icon', iconAlertTriangle(14));
  set('expires-icon', iconClock(14));
  set('filter-urgent-icon', iconAlertTriangle(14));

  // Surprise FAB + modal
  set('surprise-fab-icon', iconDice(24));
  set('surprise-close-icon', iconX(20));
  set('surprise-cta-sparkle', iconSparkles(16));
}
