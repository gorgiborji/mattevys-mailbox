import { $ } from './dom.js';

const TOTAL_STEPS = 3;
let currentStep = 0;

export function getWizardStep() {
  return currentStep;
}

export function goToStep(step) {
  if (step < 0 || step >= TOTAL_STEPS) return;
  currentStep = step;

  // Slide the wizard slider
  $.wizardSlider.style.transform = `translateX(-${step * 100}%)`;

  // Update progress bar fill
  $.wizardFill.style.width = `${((step + 1) / TOTAL_STEPS) * 100}%`;

  // Update dots
  $.wizardProgress.querySelectorAll('.wizard-dot').forEach(dot => {
    const s = Number(dot.dataset.step);
    dot.classList.toggle('active', s <= step);
  });

  // Update nav buttons
  $.wizardPrev.style.visibility = step === 0 ? 'hidden' : 'visible';

  if (step < TOTAL_STEPS - 1) {
    $.wizardNext.style.display = '';
    $.submitBtn.style.display = 'none';
  } else {
    $.wizardNext.style.display = 'none';
    $.submitBtn.style.display = '';
  }
}

export function resetWizard() {
  goToStep(0);
}

export function setupWizard() {
  // Initial state
  goToStep(0);

  $.wizardNext.addEventListener('click', (e) => {
    e.preventDefault();
    // On step 0, require title before proceeding
    if (currentStep === 0 && !$.titleInput.value.trim()) {
      $.titleInput.focus();
      $.titleInput.style.borderBottomColor = 'var(--stamp-red)';
      setTimeout(() => { $.titleInput.style.borderBottomColor = ''; }, 1000);
      return;
    }
    goToStep(currentStep + 1);
  });

  $.wizardPrev.addEventListener('click', (e) => {
    e.preventDefault();
    goToStep(currentStep - 1);
  });
}
