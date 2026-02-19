import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "./store/useStore";
import { useIdeasRealtimeSync } from "./hooks/useIdeas";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import WriteTab from "./components/WriteTab";
import BoxTab from "./components/BoxTab";
import ArchiveTab from "./components/ArchiveTab";
import EnvelopeAnimation from "./components/EnvelopeAnimation";
import StampCelebration from "./components/StampCelebration";
import { EASE_OUT } from "./lib/constants";
import styles from "./App.module.css";

const tabVariants = {
  enter: (direction) => ({ x: `${direction * 30}%`, opacity: 0 }),
  active: { x: 0, opacity: 1, transition: { duration: 0.35, ease: EASE_OUT } },
  exit: (direction) => ({
    x: `${direction * -30}%`,
    opacity: 0,
    transition: { duration: 0.25, ease: EASE_OUT },
  }),
};

function renderTab(tab) {
  switch (tab) {
    case "write":
      return <WriteTab />;
    case "box":
      return <BoxTab />;
    case "archive":
      return <ArchiveTab />;
  }
}

export default function App() {
  useIdeasRealtimeSync();

  const activeTab = useStore((s) => s.activeTab);
  const tabDirection = useStore((s) => s.tabDirection);
  const showEnvelope = useStore((s) => s.showEnvelopeAnimation);
  const showStamp = useStore((s) => s.showStampCelebration);

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <Header />
        <TabBar />
      </aside>

      <main className={styles.main}>
        <AnimatePresence mode="wait" custom={tabDirection} initial={false}>
          <motion.div
            key={activeTab}
            custom={tabDirection}
            variants={tabVariants}
            initial="enter"
            animate="active"
            exit="exit"
          >
            {renderTab(activeTab)}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showEnvelope && <EnvelopeAnimation key="envelope" />}
        {showStamp && <StampCelebration key="stamp" />}
      </AnimatePresence>
    </div>
  );
}
