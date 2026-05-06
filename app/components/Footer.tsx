import Link from 'next/link';
import styles from '../Story.module.css';

export default function Footer() {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.siteFooterInner}>
        <Link href="/" className={styles.footerLogo}>
          <div className={styles.logoIcon}>M</div>
          <span>MRR Story</span>
        </Link>
        <nav className={styles.footerNav}>
          <Link href="/about">About</Link>
          <Link href="/support">Support</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms of Use</Link>
          <a href="https://x.com/mrrstory" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">𝕏</a>
        </nav>
        <p className={styles.footerCopy}>© {new Date().getFullYear()} MRR Story. All rights reserved.</p>
      </div>
    </footer>
  );
}
