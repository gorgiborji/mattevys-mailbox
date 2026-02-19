import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice5, X, MapPin, DollarSign, Tag, Sparkles } from 'lucide-react';
import { useIdeas, selectTopPicks, selectBox, useMarkDone } from '../hooks/useIdeas';
import { useStore } from '../store/useStore';
import { CATEGORY_COLORS, CATEGORY_ICONS, EASE_OUT, SPRING } from '../lib/constants';
import styles from './SurpriseMe.module.css';

export default function SurpriseFab() {
  const [open, setOpen] = useState(false);
  const [idea, setIdea] = useState(null);
  const { data: ideas = [] } = useIdeas();
  const markDone = useMarkDone();
  const setShowStamp = useStore((s) => s.setShowStamp);

  const pool = useMemo(
    () => [...selectTopPicks(ideas), ...selectBox(ideas)],
    [ideas],
  );

  const openSurprise = useCallback(() => {
    if (pool.length === 0) return;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setIdea(picked);
    setOpen(true);
  }, [pool]);

  const handleDoIt = useCallback(() => {
    if (!idea) return;
    setOpen(false);
    markDone.mutate(idea.id);
    setShowStamp(true);
    setIdea(null);
  }, [idea, markDone, setShowStamp]);

  const close = useCallback(() => {
    setOpen(false);
    setIdea(null);
  }, []);

  const cat = idea?.category || '';
  const CategoryIcon = CATEGORY_ICONS[cat];
  const catColor = CATEGORY_COLORS[cat] || 'var(--blush)';

  return (
    <>
      {/* Floating action button */}
      <motion.button
        className={styles.fab}
        onClick={openSurprise}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -3, 0] }}
        transition={{
          y: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
        }}
        aria-label="Surprise me — pick a random idea"
      >
        <Dice5 size={24} />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && idea && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <motion.div
              className={styles.modal}
              style={{
                background: `linear-gradient(135deg, ${catColor}33 0%, var(--card-bg) 50%)`,
              }}
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 16 }}
              transition={SPRING}
            >
              <button
                className={styles.closeBtn}
                onClick={close}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {/* Category icon */}
              <motion.div
                className={styles.emoji}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...SPRING, delay: 0.2 }}
              >
                {CategoryIcon ? (
                  <CategoryIcon size={52} />
                ) : (
                  <Dice5 size={52} />
                )}
              </motion.div>

              <h2 className={styles.title}>{idea.title}</h2>

              {idea.description && (
                <p className={styles.desc}>{idea.description}</p>
              )}

              {(idea.location || idea.cost || idea.category) && (
                <div className={styles.meta}>
                  {idea.location && (
                    <span>
                      <MapPin size={14} /> {idea.location}
                    </span>
                  )}
                  {idea.cost && (
                    <span>
                      <DollarSign size={14} /> {idea.cost}
                    </span>
                  )}
                  {idea.category && (
                    <span>
                      <Tag size={14} /> {idea.category}
                    </span>
                  )}
                </div>
              )}

              <motion.button
                className={styles.cta}
                onClick={handleDoIt}
                whileTap={{ scale: 0.98 }}
              >
                Let&rsquo;s do this tonight <Sparkles size={16} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
