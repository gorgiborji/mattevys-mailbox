import { selectChip } from '../actions/ui.js';

export function setupChips(groupId, type) {
  const group = document.getElementById(groupId);

  group.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip || !group.contains(chip)) return;

    const val = chip.dataset.value;
    const wasSelected = chip.classList.contains('selected');

    group.querySelectorAll('.chip').forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-checked', 'false');
    });

    if (!wasSelected) {
      chip.classList.add('selected');
      chip.setAttribute('aria-checked', 'true');
      selectChip(type, val);
    } else {
      selectChip(type, null);
    }
  });
}
