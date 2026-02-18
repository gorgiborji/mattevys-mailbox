import { $ } from './dom.js';

const CONFETTI_COLORS = ['#F2C4CE', '#B7C9B0', '#D4C5E2', '#F4A261', '#F4D35E', '#B5C7D3', '#E8C5E5'];
const CONFETTI_COUNT = 40;

export function playStampCelebration() {
  // Show overlay
  $.stampOverlay.style.display = 'flex';

  // Reset seal
  $.stampSeal.classList.remove('stamp-animate');
  $.confettiContainer.innerHTML = '';

  requestAnimationFrame(() => {
    // Stamp slam animation
    $.stampSeal.classList.add('stamp-animate');

    // Spawn confetti after stamp lands
    setTimeout(() => {
      spawnConfetti();
    }, 300);

    // Auto-dismiss
    setTimeout(() => {
      $.stampOverlay.style.opacity = '0';
      setTimeout(() => {
        $.stampOverlay.style.display = 'none';
        $.stampOverlay.style.opacity = '';
        $.stampSeal.classList.remove('stamp-animate');
        $.confettiContainer.innerHTML = '';
      }, 300);
    }, 1800);
  });
}

function spawnConfetti() {
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const size = 6 + Math.random() * 6;
    const isCircle = Math.random() > 0.5;

    piece.style.cssText = `
      background: ${color};
      width: ${size}px;
      height: ${isCircle ? size : size * 1.5}px;
      border-radius: ${isCircle ? '50%' : '2px'};
      left: ${40 + Math.random() * 20}%;
      top: ${40 + Math.random() * 20}%;
      --drift-x: ${(Math.random() - 0.5) * 300}px;
      --drift-y: ${-100 - Math.random() * 200}px;
      --spin: ${Math.random() * 720 - 360}deg;
      animation: confettiBurst ${600 + Math.random() * 600}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      animation-delay: ${Math.random() * 150}ms;
    `;

    $.confettiContainer.appendChild(piece);
  }
}
