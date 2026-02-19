import { Mail } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <svg
        className={styles.postmark}
        width="160"
        height="160"
        viewBox="0 0 160 160"
        aria-hidden="true"
      >
        <circle cx="80" cy="80" r="72" fill="none" stroke="#E0C9A6" strokeWidth="2" strokeDasharray="6 4" />
        <circle cx="80" cy="80" r="58" fill="none" stroke="#E0C9A6" strokeWidth="1" strokeDasharray="4 5" />
        <line x1="16" y1="72" x2="144" y2="72" stroke="#E0C9A6" strokeWidth="1.5" />
        <line x1="16" y1="80" x2="144" y2="80" stroke="#E0C9A6" strokeWidth="1.5" />
        <line x1="16" y1="88" x2="144" y2="88" stroke="#E0C9A6" strokeWidth="1.5" />
      </svg>

      <div className={styles.content}>
        <h1 className={styles.title}>
          <Mail size={24} className={styles.titleIcon} />
          {' '}Mattevy&#39;s Mailbox
        </h1>
        <p className={styles.tagline}>&ldquo;Drop your ideas. We&#39;ll make memories.&rdquo;</p>
        <p className={styles.names}>Matt &nbsp;&middot;&nbsp; Evy</p>
      </div>

      <p className={styles.divider}>&middot; &middot; &middot;</p>
    </header>
  );
}
