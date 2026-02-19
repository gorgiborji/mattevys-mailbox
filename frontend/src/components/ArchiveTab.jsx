import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Archive } from 'lucide-react';
import { useIdeas, selectArchive } from '../hooks/useIdeas';
import IdeaCard from './IdeaCard';
import styles from './ArchiveTab.module.css';

export default function ArchiveTab() {
  const { data: ideas = [] } = useIdeas();

  const archived = useMemo(() => selectArchive(ideas), [ideas]);

  return (
    <section className={styles.section}>
      <h2 className={styles.header}>
        <Archive size={20} className={styles.icon} /> Archive
        {archived.length > 0 && (
          <span className={styles.count}>({archived.length})</span>
        )}
      </h2>

      <div className={styles.cardList}>
        <AnimatePresence mode="popLayout">
          {archived.map((idea, i) => (
            <IdeaCard key={idea.id} idea={idea} index={i} isArchived />
          ))}
        </AnimatePresence>
      </div>

      {archived.length === 0 && (
        <p className={styles.empty}>
          Nothing archived yet — you&rsquo;ve got dates to go on!
        </p>
      )}
    </section>
  );
}
