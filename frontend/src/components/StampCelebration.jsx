import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CONFETTI_COLORS, EASE_OUT } from '../lib/constants';
import styles from './Overlays.module.css';

const CONFETTI_COUNT = 40;

export default function StampCelebration() {
  const setShowStamp = useStore((s) => s.setShowStamp);

  // Auto-dismiss after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowStamp(false), 2100);
    return () => clearTimeout(timer);
  }, [setShowStamp]);

  const confetti = useMemo(
    () =>
      Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
        id: i,
        color:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 6,
        isCircle: Math.random() > 0.5,
        driftX: (Math.random() - 0.5) * 300,
        driftY: -100 - Math.random() * 200,
        spin: Math.random() * 720 - 360,
        duration: 0.6 + Math.random() * 0.6,
        delay: 0.3 + Math.random() * 0.15,
        startX: 40 + Math.random() * 20,
        startY: 40 + Math.random() * 20,
      })),
    [],
  );

  return (
    <motion.div
      className={styles.stampOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Wax seal stamp */}
      <motion.div
        className={styles.seal}
        initial={{ scale: 3, rotate: -15, opacity: 0 }}
        animate={{
          scale: [3, 0.9, 1.05, 1],
          rotate: [-15, 3, -1, 0],
          opacity: [0, 1, 1, 1],
        }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="55" fill="#C0392B" opacity="0.9" />
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="#FDF6EC"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <text
            x="60"
            y="52"
            textAnchor="middle"
            fill="#FDF6EC"
            fontFamily="Caveat, cursive"
            fontSize="22"
            fontWeight="700"
          >
            DONE
          </text>
          <path
            d="M50 68 56 74 70 60"
            stroke="#FDF6EC"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* Confetti burst */}
      {confetti.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: p.driftX,
            y: p.driftY - 50,
            scale: [0, 1, 0.5],
            rotate: p.spin,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            position: 'absolute',
            left: `${p.startX}%`,
            top: `${p.startY}%`,
            width: p.size,
            height: p.isCircle ? p.size : p.size * 1.5,
            borderRadius: p.isCircle ? '50%' : 2,
            background: p.color,
            pointerEvents: 'none',
          }}
        />
      ))}
    </motion.div>
  );
}
