import { useEffect, useRef, useMemo } from 'react';
import { motion, animate } from 'framer-motion';
import { Heart } from 'lucide-react';
import { EASE_OUT } from '../lib/constants';
import styles from './Overlays.module.css';

export default function EnvelopeAnimation() {
  const envelopeRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    // Sequenced animation — replaces the 6-level nested setTimeout chain.
    // Each step awaits the previous, so timing never drifts.
    let cancelled = false;

    async function play() {
      const envelope = envelopeRef.current;
      const box = boxRef.current;
      if (!envelope || !box) return;

      // Envelope pulse
      await animate(envelope, { scale: [1, 1.08, 1] }, { duration: 0.3 }).finished;
      if (cancelled) return;

      // Envelope drop into box
      await animate(
        envelope,
        { y: 80, rotate: [0, -5, 2, -1, 0], opacity: [1, 1, 1, 0.5, 0] },
        { duration: 0.5, ease: [0.55, 0, 1, 0.45] },
      ).finished;
      if (cancelled) return;

      // Box bounce when envelope arrives
      await animate(box, { scale: [1, 1.05, 1] }, { duration: 0.15 }).finished;
    }

    play();

    return () => {
      cancelled = true;
    };
  }, []);

  const hearts = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 60,
        delay: 0.8 + Math.random() * 0.2,
        duration: 0.6 + Math.random() * 0.3,
      })),
    [],
  );

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Envelope */}
      <motion.div ref={envelopeRef} className={styles.envelope}>
        <svg
          width="80"
          height="56"
          viewBox="0 0 80 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="1" y="1" width="78" height="54" rx="5" fill="#E8D5B7" stroke="#3D2B1F" strokeWidth="1.5" />
          <line x1="1" y1="1" x2="40" y2="30" stroke="#3D2B1F" strokeWidth="1.5" />
          <line x1="79" y1="1" x2="40" y2="30" stroke="#3D2B1F" strokeWidth="1.5" />
          <line x1="1" y1="55" x2="36" y2="33" stroke="#3D2B1F" strokeWidth="1.5" />
          <line x1="79" y1="55" x2="44" y2="33" stroke="#3D2B1F" strokeWidth="1.5" />
          <path d="M35 18 38 22 46 14" stroke="#C0392B" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      {/* Ballot box */}
      <motion.div ref={boxRef} className={styles.ballotBox}>
        <svg
          width="100"
          height="120"
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="5" y="20" width="90" height="95" rx="6" fill="#FDF6EC" stroke="#3D2B1F" strokeWidth="2" />
          <rect x="5" y="20" width="90" height="22" rx="6" fill="#E8D5B7" stroke="#3D2B1F" strokeWidth="2" />
          <rect x="30" y="24" width="40" height="8" rx="2" fill="#3D2B1F" />
          <path d="M22 82 c0-4 4-7 8-7s8 3 8 7-4 7-8 7-8-3-8-7z" fill="none" stroke="#F2C4CE" strokeWidth="1.5" />
          <path d="M62 82 c0-4 4-7 8-7s8 3 8 7-4 7-8 7-8-3-8-7z" fill="none" stroke="#F2C4CE" strokeWidth="1.5" />
          <rect x="42" y="78" width="16" height="12" rx="2" fill="none" stroke="#E8D5B7" strokeWidth="1.5" />
          <path d="M42 78 50 84 58 78" stroke="#E8D5B7" strokeWidth="1.5" fill="none" />
        </svg>
      </motion.div>

      {/* Floating hearts */}
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className={styles.floatingHeart}
          initial={{ y: 0, x: h.x, scale: 0.8, opacity: 0.8 }}
          animate={{ y: -90, scale: 1.3, opacity: 0 }}
          transition={{ delay: h.delay, duration: h.duration, ease: 'linear' }}
        >
          <Heart size={18} fill="currentColor" />
        </motion.span>
      ))}
    </motion.div>
  );
}
