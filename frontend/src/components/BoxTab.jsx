import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Heart, Inbox, TriangleAlert } from 'lucide-react';
import { useIdeas, selectTopPicks, selectBox, applyFilter } from '../hooks/useIdeas';
import { useStore } from '../store/useStore';
import IdeaCard from './IdeaCard';
import FilterPills from './FilterPills';
import SurpriseFab from './SurpriseFab';
import styles from './BoxTab.module.css';

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonHeader}>
        <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
        <div className={styles.skeletonCircle} />
      </div>
      <div className={`${styles.skeletonLine} ${styles.skeletonDesc}`} />
      <div className={`${styles.skeletonLine} ${styles.skeletonMeta}`} />
    </div>
  );
}

export default function BoxTab() {
  const { data: ideas = [], isLoading, isError, error } = useIdeas();
  const activeFilter = useStore((s) => s.activeFilter);

  const topPicks = useMemo(() => applyFilter(selectTopPicks(ideas), activeFilter), [ideas, activeFilter]);
  const theBox = useMemo(() => applyFilter(selectBox(ideas), activeFilter), [ideas, activeFilter]);

  return (
    <div>
      <FilterPills />

      {isError && (
        <p className={styles.error} role="alert">
          <TriangleAlert size={16} /> Couldn&rsquo;t load ideas: {error?.message || 'unknown error'}
        </p>
      )}

      {isLoading && (
        <div className={styles.skeletonList}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionHeader}><Heart size={20} className={styles.sectionIcon} /> Top Picks</h2>
            <div className={styles.cardList}>
              <AnimatePresence mode="popLayout">
                {topPicks.map((idea, i) => <IdeaCard key={idea.id} idea={idea} index={i} />)}
              </AnimatePresence>
            </div>
            {topPicks.length === 0 && <p className={styles.empty}>Heart an idea to pin it here</p>}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionHeader}><Inbox size={20} className={styles.sectionIcon} /> The Box</h2>
            <div className={styles.cardList}>
              <AnimatePresence mode="popLayout">
                {theBox.map((idea, i) => <IdeaCard key={idea.id} idea={idea} index={i} />)}
              </AnimatePresence>
            </div>
            {theBox.length === 0 && <p className={styles.empty}>The box is empty — drop an idea above!</p>}
          </section>
        </>
      )}

      <SurpriseFab />
    </div>
  );
}
