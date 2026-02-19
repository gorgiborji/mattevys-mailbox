import { Mail, Heart, Inbox, Archive } from "lucide-react";
import {
  useIdeas,
  selectTopPicks,
  selectBox,
  selectArchive,
} from "../hooks/useIdeas";
import styles from "./Header.module.css";

function StatPill({ label, value, Icon }) {
  return (
    <div className={styles.statPill}>
      <Icon size={14} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function Header() {
  const { data: ideas = [] } = useIdeas();

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <Mail size={24} className={styles.titleIcon} /> Matt &amp; Evy&rsquo;s
          Datebox
        </h1>
        <p className={styles.tagline}>
          A date-night dropbox with a handcrafted soul.
        </p>
      </div>

      <div className={styles.stats}>
        <StatPill
          label="Top Picks"
          value={selectTopPicks(ideas).length}
          Icon={Heart}
        />
        <StatPill label="In Box" value={selectBox(ideas).length} Icon={Inbox} />
        <StatPill
          label="Archive"
          value={selectArchive(ideas).length}
          Icon={Archive}
        />
      </div>
    </header>
  );
}
