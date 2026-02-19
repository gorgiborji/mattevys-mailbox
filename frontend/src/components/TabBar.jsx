import { PenLine, Inbox, Archive } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import styles from './TabBar.module.css';

const TABS = [
  { key: 'write', label: 'Write', Icon: PenLine },
  { key: 'box', label: 'The Box', Icon: Inbox },
  { key: 'archive', label: 'Archive', Icon: Archive },
];

export default function TabBar() {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);

  return (
    <nav className={styles.bar} aria-label="Main navigation">
      {TABS.map(({ key, label, Icon }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            className={`${styles.btn} ${isActive ? styles.active : ''}`}
            onClick={() => setActiveTab(key)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={styles.icon}>
              <Icon size={22} />
            </span>
            <span className={styles.label}>{label}</span>
            {isActive && (
              <motion.span
                className={styles.indicator}
                layoutId="tab-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
