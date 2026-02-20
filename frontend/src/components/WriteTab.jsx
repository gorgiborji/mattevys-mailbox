import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, MapPin, Stamp, Send } from 'lucide-react';
import { useCreateIdea } from '../hooks/useIdeas';
import { useStore } from '../store/useStore';
import { CATEGORIES, COSTS, EASE_OUT } from '../lib/constants';
import styles from './WriteTab.module.css';

const TOTAL_STEPS = 3;

const stepVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  active: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

export default function WriteTab() {
  const step = useStore((s) => s.wizardStep);
  const setStep = useStore((s) => s.setWizardStep);
  const selectedCost = useStore((s) => s.selectedCost);
  const selectedCategory = useStore((s) => s.selectedCategory);
  const setSelectedCost = useStore((s) => s.setSelectedCost);
  const setSelectedCategory = useStore((s) => s.setSelectedCategory);
  const resetForm = useStore((s) => s.resetForm);
  const username = useStore((s) => s.username);
  const setUsername = useStore((s) => s.setUsername);
  const setShowEnvelope = useStore((s) => s.setShowEnvelope);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const createIdea = useCreateIdea();

  const titleRef = useRef(null);
  const descRef = useRef(null);
  const locationRef = useRef(null);
  const nameRef = useRef(null);
  const directionRef = useRef(1);

  // Auto-focus the first input on the current step
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 0) titleRef.current?.focus();
      if (step === 2) locationRef.current?.focus();
    }, 350);
    return () => clearTimeout(timer);
  }, [step]);

  // Pre-fill saved username
  useEffect(() => {
    if (username && nameRef.current) {
      nameRef.current.value = username;
    }
  }, [username]);

  const goNext = useCallback(() => {
    if (step === 0 && !titleRef.current?.value.trim()) {
      titleRef.current?.focus();
      titleRef.current?.classList.add(styles.shake);
      setTimeout(() => titleRef.current?.classList.remove(styles.shake), 600);
      return;
    }
    directionRef.current = 1;
    setStep(step + 1);
  }, [step, setStep]);

  const goPrev = useCallback(() => {
    directionRef.current = -1;
    setStep(step - 1);
  }, [step, setStep]);

  // Enter key advances wizard (on text inputs only)
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (step < TOTAL_STEPS - 1) {
          goNext();
        }
      }
    },
    [step, goNext],
  );

  const handleSubmit = useCallback(async () => {
    const title = titleRef.current?.value.trim();
    if (!title) return;

    const name = nameRef.current?.value.trim() || '';
    if (name) setUsername(name);

    const ideaData = {
      title,
      description: descRef.current?.value.trim() || null,
      cost: selectedCost || null,
      category: selectedCategory || null,
      location: locationRef.current?.value.trim() || null,
      added_by: name || null,
      hearted: false,
      done: false,
    };

    const animationStart = Date.now();
    const minAnimationMs = 1400;
    setShowEnvelope(true);

    const waitForAnimation = async () => {
      const elapsed = Date.now() - animationStart;
      const remaining = Math.max(0, minAnimationMs - elapsed);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
    };

    try {
      await createIdea.mutateAsync(ideaData);
      await waitForAnimation();
      if (titleRef.current) titleRef.current.value = '';
      if (descRef.current) descRef.current.value = '';
      if (locationRef.current) locationRef.current.value = '';
      resetForm();
      setShowEnvelope(false);
      setActiveTab('box');
    } catch {
      await waitForAnimation();
      setShowEnvelope(false);
    }
  }, [
    selectedCost,
    selectedCategory,
    createIdea,
    resetForm,
    setShowEnvelope,
    setActiveTab,
    setUsername,
  ]);

  const canSubmit = step === TOTAL_STEPS - 1;

  return (
    <div className={styles.writeTab}>
      <p className={styles.sectionLabel}>
        <PenLine size={16} className={styles.sectionIcon} /> New Idea
      </p>

      {/* Progress bar */}
      <div className={styles.progress}>
        <div className={styles.track}>
          <motion.div
            className={styles.fill}
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          />
        </div>
        <div className={styles.dots}>
          {[0, 1, 2].map((s) => (
            <motion.span
              key={s}
              className={styles.dot}
              animate={{
                backgroundColor: s <= step ? 'var(--blush)' : 'var(--border)',
                scale: s <= step ? 1.3 : 1,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            />
          ))}
        </div>
      </div>

      {/* Postcard form */}
      <div className={styles.postcard}>
        <span className={styles.watermark} aria-hidden="true">
          write your idea&hellip;
        </span>
        <Stamp size={22} className={styles.stamp} />

        {/* Wizard steps */}
        <div className={styles.viewport}>
          <AnimatePresence
            mode="wait"
            custom={directionRef.current}
            initial={false}
          >
            {step === 0 && (
              <motion.div
                key="step0"
                className={styles.step}
                custom={directionRef.current}
                variants={stepVariants}
                initial="enter"
                animate="active"
                exit="exit"
                transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                <input
                  ref={titleRef}
                  className={styles.fieldTitle}
                  type="text"
                  placeholder="What's the idea?"
                  maxLength={120}
                  autoComplete="off"
                  onKeyDown={handleKeyDown}
                />
                <input
                  ref={descRef}
                  className={styles.fieldDesc}
                  type="text"
                  placeholder="Describe it in one line..."
                  maxLength={240}
                  autoComplete="off"
                  onKeyDown={handleKeyDown}
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                className={styles.step}
                custom={directionRef.current}
                variants={stepVariants}
                initial="enter"
                animate="active"
                exit="exit"
                transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                <p className={styles.stepLabel}>Pick a vibe</p>
                <div className={styles.chipGroup} role="radiogroup" aria-label="Cost level">
                  {COSTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.chip} ${selectedCost === c ? styles.chipSelected : ''}`}
                      onClick={() => setSelectedCost(c)}
                      role="radio"
                      aria-checked={selectedCost === c}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div
                  className={styles.chipGroup}
                  role="radiogroup"
                  aria-label="Category"
                  style={{ marginTop: 10 }}
                >
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.chip} ${selectedCategory === c ? styles.chipSelected : ''}`}
                      onClick={() => setSelectedCategory(c)}
                      role="radio"
                      aria-checked={selectedCategory === c}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                className={styles.step}
                custom={directionRef.current}
                variants={stepVariants}
                initial="enter"
                animate="active"
                exit="exit"
                transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                <p className={styles.stepLabel}>Almost done!</p>
                <div className={styles.fieldRow}>
                  <MapPin size={14} className={styles.fieldIcon} />
                  <input
                    ref={locationRef}
                    className={styles.fieldLocation}
                    type="text"
                    placeholder="Where? (optional)"
                    maxLength={100}
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        nameRef.current?.focus();
                      }
                    }}
                  />
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.sigLabel}>Signed:</span>
                  <input
                    ref={nameRef}
                    className={styles.sigInput}
                    type="text"
                    placeholder="Your name"
                    maxLength={40}
                    autoComplete="off"
                    defaultValue={username}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                  <Send size={14} className={styles.sigIcon} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className={styles.nav}>
          {step > 0 ? (
            <button type="button" className={styles.prevBtn} onClick={goPrev}>
              &larr; Back
            </button>
          ) : (
            <span />
          )}
          {!canSubmit ? (
            <button type="button" className={styles.nextBtn} onClick={goNext}>
              Next &rarr;
            </button>
          ) : (
            <motion.button
              type="button"
              className={styles.sendBtn}
              onClick={handleSubmit}
              disabled={createIdea.isPending}
              whileTap={{ scale: 0.97 }}
            >
              {createIdea.isPending ? 'Sending...' : 'Send it'}
            </motion.button>
          )}
        </div>

        {createIdea.isError && (
          <p className={styles.error} role="alert">
            Couldn&rsquo;t send &mdash; check your connection and try again.
          </p>
        )}
      </div>
    </div>
  );
}
