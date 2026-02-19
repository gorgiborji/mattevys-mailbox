import { useStore } from '../store/useStore';
import { CATEGORIES, COSTS, CATEGORY_ICONS } from '../lib/constants';
import styles from './FilterPills.module.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  ...CATEGORIES.map((c) => ({ key: c, label: c, Icon: CATEGORY_ICONS[c] })),
  ...COSTS.map((c) => ({ key: c, label: c })),
];

export default function FilterPills() {
  const activeFilter = useStore((s) => s.activeFilter);
  const setActiveFilter = useStore((s) => s.setActiveFilter);

  return (
    <div className={styles.bar} role="tablist" aria-label="Filter ideas">
      {FILTERS.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`${styles.pill} ${activeFilter === key ? styles.active : ''}`}
          onClick={() => setActiveFilter(key)}
          role="tab"
          aria-selected={activeFilter === key}
        >
          {Icon && <Icon size={14} />}
          {label}
        </button>
      ))}
    </div>
  );
}
