import { useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { Heart, X, Check, MapPin, DollarSign, Tag, AlertTriangle, Clock } from "lucide-react";
import { useToggleHeart, useMarkDone, useDeleteIdea } from "../hooks/useIdeas";
import { useStore } from "../store/useStore";
import { CATEGORY_COLORS, CATEGORY_ICONS, EASE_OUT } from "../lib/constants";
import styles from "./IdeaCard.module.css";

const SWIPE_THRESHOLD = 80;
const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

function getExpiryLabel(expiresAt) {
  if (!expiresAt) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiresAt + 'T00:00:00');
  const diffMs = exp - now;
  const days = Math.ceil(diffMs / 86400000);

  if (days < 0) return { text: 'Expired', cls: styles.expiryExpired };
  if (days === 0) return { text: 'Expires today', cls: styles.expiryUrgent };
  if (days === 1) return { text: 'Expires tomorrow', cls: styles.expiryUrgent };
  if (days <= 3) return { text: `Expires in ${days} days`, cls: styles.expirySoon };
  return { text: `Expires in ${days} days`, cls: '' };
}

export default function IdeaCard({ idea, index = 0, isArchived = false }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const toggleHeart = useToggleHeart();
  const markDone = useMarkDone();
  const deleteIdea = useDeleteIdea();
  const setShowStamp = useStore((s) => s.setShowStamp);

  const x = useMotionValue(0);

  // Swipe hint colours: red tint when dragging left, pink when dragging right
  const swipeBg = useTransform(
    x,
    [-120, -30, 0, 30, 120],
    [
      "rgba(192, 57, 43, 0.12)",
      "rgba(192, 57, 43, 0)",
      "rgba(0,0,0,0)",
      "rgba(242, 196, 206, 0)",
      "rgba(242, 196, 206, 0.18)",
    ],
  );

  const handleHeart = useCallback(() => {
    toggleHeart.mutate({ id: idea.id, hearted: !idea.hearted });
  }, [idea.id, idea.hearted, toggleHeart]);

  const handleDone = useCallback(() => {
    setIsRemoving(true);
    // Wait for exit animation, then mutate + celebrate
    setTimeout(() => {
      markDone.mutate(idea.id);
      setShowStamp(true);
    }, 350);
  }, [idea.id, markDone, setShowStamp]);

  const handleDelete = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => {
      deleteIdea.mutate(idea.id);
    }, 350);
  }, [idea.id, deleteIdea]);

  const handleDragEnd = useCallback(
    (_, info) => {
      if (info.offset.x < -SWIPE_THRESHOLD) {
        // Swipe left → show delete confirmation (not instant delete)
        setShowConfirm(true);
      } else if (info.offset.x > SWIPE_THRESHOLD) {
        // Swipe right → toggle heart
        handleHeart();
      }
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    },
    [handleHeart, x],
  );

  const cat = idea.category || "";
  const CategoryIcon = CATEGORY_ICONS[cat];
  const catColor = CATEGORY_COLORS[cat];
  const isUrgent = idea.priority === 'urgent';
  const expiry = getExpiryLabel(idea.expires_at);
  const isExpired = idea.expires_at && new Date(idea.expires_at + 'T00:00:00') < new Date(new Date().toDateString());

  if (isRemoving) {
    return (
      <motion.div
        initial={{ opacity: 1, height: "auto", y: 0 }}
        animate={{ opacity: 0, height: 0, y: 20, marginBottom: 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
      />
    );
  }

  return (
    <motion.div
      layout
      className={`${styles.card} ${isArchived ? styles.archived : ""} ${isExpired ? styles.expired : ""}`}
      style={{ backgroundColor: swipeBg }}
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: isArchived ? 0.65 : 1,
        y: 0,
        rotate: isArchived ? 0 : index % 2 === 0 ? -0.4 : 0.4,
      }}
      transition={{
        delay: index * 0.04,
        duration: 0.35,
        ease: EASE_OUT,
        layout: { type: "spring", stiffness: 300, damping: 30 },
      }}
      drag={isTouchDevice && !isArchived ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={handleDragEnd}
      whileHover={
        !isArchived ? { boxShadow: "0 4px 20px var(--shadow-lg)" } : undefined
      }
    >
      {/* Category gradient band */}
      {(cat || isUrgent) && (
        <div
          className={`${styles.categoryBand} ${isUrgent ? styles.bandUrgent : ""}`}
          style={{
            background: catColor
              ? `linear-gradient(135deg, ${catColor} 0%, ${catColor}26 100%)`
              : undefined,
          }}
        >
          {CategoryIcon && (
            <CategoryIcon size={18} className={styles.categoryIcon} />
          )}
          {isUrgent && (
            <span className={styles.urgentBadge}>
              <AlertTriangle size={12} /> Time-sensitive
            </span>
          )}
        </div>
      )}

      <div className={styles.body}>
        {/* Header row */}
        <div className={styles.header}>
          <h3 className={styles.title}>{idea.title}</h3>
          {!isArchived && (
            <div className={styles.actions}>
              {/* Heart */}
              <motion.button
                className={`${styles.actionBtn} ${styles.heartBtn}`}
                onClick={handleHeart}
                whileTap={{ scale: 1.4 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                data-hearted={idea.hearted || undefined}
                aria-label={
                  idea.hearted ? "Remove from Top Picks" : "Add to Top Picks"
                }
              >
                <Heart
                  size={18}
                  fill={idea.hearted ? "currentColor" : "none"}
                />
              </motion.button>

              {/* Done */}
              {!idea.done && (
                <motion.button
                  className={styles.actionBtn}
                  onClick={handleDone}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Mark as done"
                >
                  <Check size={18} />
                </motion.button>
              )}

              {/* Delete */}
              <motion.button
                className={styles.actionBtn}
                onClick={() => setShowConfirm(true)}
                whileTap={{ scale: 0.9 }}
                aria-label="Delete idea"
              >
                <X size={16} />
              </motion.button>
            </div>
          )}
        </div>

        {/* Description */}
        {idea.description && (
          <p className={styles.description}>{idea.description}</p>
        )}

        {/* Meta info */}
        {(idea.location || idea.cost || idea.category || expiry) && (
          <div className={styles.meta}>
            {idea.location && (
              <span className={styles.metaItem}>
                <MapPin size={14} /> {idea.location}
              </span>
            )}
            {idea.cost && (
              <span className={styles.metaItem}>
                <DollarSign size={14} /> {idea.cost}
              </span>
            )}
            {idea.category && (
              <span className={styles.metaItem}>
                <Tag size={14} /> {idea.category}
              </span>
            )}
            {expiry && (
              <span className={`${styles.metaItem} ${styles.expiryItem} ${expiry.cls}`}>
                <Clock size={14} /> {expiry.text}
              </span>
            )}
          </div>
        )}

        {/* Signature */}
        {idea.added_by && (
          <p className={styles.signature}>&mdash; {idea.added_by}</p>
        )}

        {/* Delete confirmation */}
        {!isArchived && (
          <AnimatePresence>
            {showConfirm && (
              <motion.div
                className={styles.deleteConfirm}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
              >
                <span>Remove this idea?</span>
                <button className={styles.yesBtn} onClick={handleDelete}>
                  Yes
                </button>
                <button
                  className={styles.noBtn}
                  onClick={() => setShowConfirm(false)}
                >
                  No
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
