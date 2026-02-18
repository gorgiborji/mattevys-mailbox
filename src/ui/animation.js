import { $ } from './dom.js';
import { setFormDisabled, setAnimating } from '../actions/ui.js';

export function playSubmitAnimation(onComplete) {
  const card = $.submissionCard;

  // Step 1: Lock inputs (0ms)
  setFormDisabled(true);
  setAnimating(true);

  setTimeout(() => {
    // Step 2: Card fold (100ms - 400ms)
    card.style.transition = 'none';
    card.style.animation = 'cardFold 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards';

    setTimeout(() => {
      // Scale down
      card.style.animation = 'none';
      card.style.transform = 'scale(0.6) translateY(-10px)';
      card.style.transition = 'transform 100ms ease';
      card.style.opacity = '0.5';

      // Step 3: Show overlay + envelope (400ms)
      setTimeout(() => {
        card.style.opacity = '0';

        // Show overlay
        $.overlay.style.display = 'flex';
        // Position envelope above the box
        positionAnimElements();

        requestAnimationFrame(() => {
          $.overlay.classList.add('visible');

          // Pulse envelope
          $.animEnvelope.style.animation = 'envelopePulse 200ms ease 150ms';

          // Step 4: Drop envelope into box (650ms)
          setTimeout(() => {
            $.animEnvelope.style.animation = 'envelopeDrop 350ms ease-in forwards';

            // Box pulse when envelope arrives
            setTimeout(() => {
              $.animBox.style.animation = 'boxPulse 100ms ease';

              // Spawn floating hearts
              spawnHearts();

              // Step 5: Fade out overlay and refresh (1000ms)
              setTimeout(() => {
                $.overlay.style.transition = 'opacity 0.2s ease';
                $.overlay.classList.remove('visible');
                setTimeout(() => {
                  $.overlay.style.display = 'none';
                  $.overlay.style.transition = '';
                  $.animEnvelope.style.animation = '';
                  $.animBox.style.animation = '';
                  card.style.animation = '';
                  card.style.transform = '';
                  card.style.opacity = '';
                  card.style.transition = '';
                  setAnimating(false);
                  onComplete();
                }, 200);
              }, 350);
            }, 250);
          }, 400);
        });
      }, 100);
    }, 300);
  }, 100);
}

export function positionAnimElements() {
  // Center envelope above the box
  const boxRect     = $.animBox.getBoundingClientRect();
  const overlayRect = $.overlay.getBoundingClientRect();
  $.animEnvelope.style.position = 'absolute';
  $.animEnvelope.style.left = (boxRect.left - overlayRect.left + boxRect.width / 2 - 40) + 'px';
  $.animEnvelope.style.top  = (boxRect.top  - overlayRect.top  - 80) + 'px';
}

export function spawnHearts() {
  $.animHearts.innerHTML = '';
  const count = 5;
  for (let i = 0; i < count; i++) {
    const h = document.createElement('span');
    h.className = 'floating-heart';
    h.textContent = '\u2764\uFE0F';
    const boxRect     = $.animBox.getBoundingClientRect();
    const overlayRect = $.overlay.getBoundingClientRect();
    const baseX   = boxRect.left - overlayRect.left + boxRect.width / 2;
    const offsetX = (Math.random() - 0.5) * 60;
    const dur     = 600 + Math.random() * 300;
    const delay   = Math.random() * 200;
    h.style.left              = (baseX + offsetX) + 'px';
    h.style.top               = (boxRect.top - overlayRect.top + boxRect.height * 0.5) + 'px';
    h.style.animationDuration = dur + 'ms';
    h.style.animationDelay    = delay + 'ms';
    $.animHearts.appendChild(h);
  }
}
