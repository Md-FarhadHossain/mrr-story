import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: '404 — Page Not Found | MRR Story',
  description: 'Oops! The page you are looking for does not exist. Head back to discover real indie hacker stories.',
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      {/* Decorative grid */}
      <div className={styles.gridOverlay} />

      {/* Animated blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />

      {/* Floating emojis */}
      <span className={styles.floatingEmoji} aria-hidden="true">🚀</span>
      <span className={styles.floatingEmoji} aria-hidden="true">💸</span>
      <span className={styles.floatingEmoji} aria-hidden="true">📈</span>
      <span className={styles.floatingEmoji} aria-hidden="true">🎯</span>

      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>M</div>
          <span>MRR Story</span>
        </Link>
      </header>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.inner}>
          {/* Big 404 */}
          <div className={styles.errorCode} aria-hidden="true">404</div>

          {/* Pill badge */}
          <div className={styles.pill}>
            <span className={styles.pillDot} />
            Page not found
          </div>

          {/* Headline */}
          <h1 className={styles.title}>
            Looks like this page <span className={styles.accent}>didn&apos;t make revenue</span>
          </h1>

          {/* Sub */}
          <p className={styles.sub}>
            The page you&apos;re looking for might have been moved, deleted, or maybe you took a wrong turn. Either way — let&apos;s get you back to the good stuff.
          </p>

          {/* CTAs */}
          <div className={styles.actions}>
            <Link href="/" className={styles.btnPrimary}>
              <span>🏠</span>
              Back to Homepage
            </Link>
            <Link href="/stories" className={styles.btnSecondary}>
              <span>📚</span>
              Browse Case Studies
            </Link>
          </div>

          {/* Quick nav links */}
          <div className={styles.linksSection}>
            <p className={styles.linksLabel}>Or explore these</p>
            <div className={styles.links}>
              <Link href="/newsletter" className={styles.link}>
                <span className={styles.linkIcon}>✉️</span>
                Newsletter
              </Link>
              <Link href="/stories" className={styles.link}>
                <span className={styles.linkIcon}>🔥</span>
                Trending Stories
              </Link>
              <Link href="/" className={styles.link}>
                <span className={styles.linkIcon}>💡</span>
                Latest Posts
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
