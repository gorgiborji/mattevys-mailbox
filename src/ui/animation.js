import { $ } from './dom.js';
import { setFormDisabled, setAnimating } from '../actions/ui.js';
import { iconHeartFilled } from './icons.js';

const TIMINGS = {
  foldDelay: 80,
  fold: 280,
  shrink: 110,
  overlayIn: 130,
  hover: 280,
  drop: 440,
  impact: 180,
  hearts: 360,
  overlayOut: 200,
};

const EASING = {
  fold: 'cubic-bezier(0.42, 0, 0.2, 1)',
  shrink: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
};

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSequence(phases) {
  for (const phase of phases) {
    phase.run();
    await wait(phase.ms);
  }
}

function getAnimationVariant() {
  if (document.body.classList.contains('version-3')) return 'anim-style-playful';
  if (document.body.classList.contains('version-2')) return 'anim-style-gentle';
  return 'anim-style-default';
}

function cleanupAnimationUI(card) {
  $.overlay.style.display = 'none';
  $.overlay.style.transition = '';
  $.overlay.classList.remove('visible', 'impact');
  $.overlay.classList.remove('anim-style-default', 'anim-style-gentle', 'anim-style-playful');
  $.animBallot.style.animation = '';
  $.animBox.style.animation = '';
  $.animHearts.innerHTML = '';
  card.style.animation = '';
  card.style.transform = '';
  card.style.opacity = '';
  card.style.transition = '';
}

export async function playSubmitAnimation(onComplete) {
  const card = $.submissionCard;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  setFormDisabled(true);
  setAnimating(true);

  try {
    if (reduceMotion) {
      $.overlay.style.display = 'flex';
      $.overlay.classList.add('visible', getAnimationVariant());
      $.overlay.style.transition = 'opacity 120ms ease';
      await wait(120);
      $.overlay.classList.remove('visible');
      await wait(100);
      await onComplete();
      return;
    }

    $.overlay.classList.add(getAnimationVariant());

    await runSequence([
      {
        name: 'fold_card',
        ms: TIMINGS.foldDelay,
        run: () => {
          card.style.transition = 'none';
          card.style.animation = `cardFold ${TIMINGS.fold}ms ${EASING.fold} forwards`;
        },
      },
      {
        name: 'shrink_card',
        ms: TIMINGS.fold,
        run: () => {
          card.style.animation = 'none';
          card.style.transform = 'scale(0.64) translateY(-12px)';
          card.style.transition = `transform ${TIMINGS.shrink}ms ${EASING.shrink}`;
          card.style.opacity = '0.45';
        },
      },
      {
        name: 'show_overlay',
        ms: TIMINGS.overlayIn,
        run: () => {
          card.style.opacity = '0';
          $.overlay.style.display = 'flex';
          positionAnimElements();
          requestAnimationFrame(() => {
            $.overlay.classList.add('visible');
          });
        },
      },
      {
        name: 'pre_drop_hover',
        ms: TIMINGS.hover,
        run: () => {
          $.animBallot.style.animation = `ballotHover ${TIMINGS.hover}ms ease-in-out forwards`;
        },
      },
      {
        name: 'drop_ballot',
        ms: TIMINGS.drop,
        run: () => {
          $.animBallot.style.animation = `ballotDrop ${TIMINGS.drop}ms cubic-bezier(0.18, 0.8, 0.28, 1) forwards`;
        },
      },
      {
        name: 'impact',
        ms: TIMINGS.impact,
        run: () => {
          $.overlay.classList.add('impact');
          $.animBox.style.animation = `boxCompress ${TIMINGS.impact}ms ease-out forwards`;
          spawnHearts();
        },
      },
      {
        name: 'resolve',
        ms: TIMINGS.hearts,
        run: () => {
          $.overlay.classList.remove('impact');
          $.overlay.classList.remove('visible');
        },
      },
    ]);

    await wait(TIMINGS.overlayOut);
    await onComplete();
  } finally {
    cleanupAnimationUI(card);
    setAnimating(false);
  }
}

export function positionAnimElements() {
  const boxRect = $.animBox.getBoundingClientRect();
  const overlayRect = $.overlay.getBoundingClientRect();

  $.animBallot.style.position = 'absolute';
  $.animBallot.style.left = `${boxRect.left - overlayRect.left + boxRect.width / 2 - 43}px`;
  $.animBallot.style.top = `${boxRect.top - overlayRect.top - 92}px`;
}

export function spawnHearts() {
  $.animHearts.innerHTML = '';
  const boxRect = $.animBox.getBoundingClientRect();
  const overlayRect = $.overlay.getBoundingClientRect();
  const baseX = boxRect.left - overlayRect.left + boxRect.width / 2;
  const baseY = boxRect.top - overlayRect.top + 34;

  const heartPlan = [
    { x: -24, driftX: -46, driftY: -74, scale: 0.95, delay: 0, color: 'var(--blush)' },
    { x: 22, driftX: 42, driftY: -68, scale: 1.05, delay: 30, color: '#D06A7D' },
    { x: 0, driftX: 0, driftY: -92, scale: 1.12, delay: 70, color: '#B44156' },
    { x: -10, driftX: -20, driftY: -56, scale: 0.82, delay: 120, color: '#F2C4CE' },
  ];

  heartPlan.forEach((plan, index) => {
    const h = document.createElement('span');
    h.className = 'floating-heart';
    h.innerHTML = iconHeartFilled(18);
    h.style.left = `${baseX + plan.x}px`;
    h.style.top = `${baseY}px`;
    h.style.animationDelay = `${plan.delay}ms`;
    h.style.setProperty('--drift-x', `${plan.driftX}px`);
    h.style.setProperty('--drift-y', `${plan.driftY}px`);
    h.style.setProperty('--heart-scale', String(plan.scale));
    h.style.color = plan.color;
    h.dataset.heartIndex = String(index);
    $.animHearts.appendChild(h);
  });
}
