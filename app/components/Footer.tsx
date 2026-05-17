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
          <Link href="/sitemap.xml">Sitemap</Link>
          <a href="https://x.com/mrrstory" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">𝕏</a>
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '32px 0 16px', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Featured on</span>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="https://www.tinystartups.com/startup/mrr-story" target="_blank" rel="noopener noreferrer"
               className={styles.featuredBadge}
               style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 14px 8px 12px', borderRadius: '10px', textDecoration: 'none', fontFamily: "'Inter',system-ui,sans-serif", background: 'linear-gradient(#0E0B1F,#0E0B1F) padding-box,linear-gradient(90deg,#3525E6,#D81FE0,#22B8F0) border-box', border: '1.5px solid transparent', color: '#fff', transition: 'transform 0.2s ease, filter 0.2s ease' }}
            >
              <svg width="28" height="28" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="tsg" x1=".1" y1="0" x2=".9" y2="1">
                    <stop offset="0%" stopColor="#3525E6"/>
                    <stop offset="55%" stopColor="#D81FE0"/>
                    <stop offset="100%" stopColor="#22B8F0"/>
                  </linearGradient>
                </defs>
                <path d="M50 6C52 32 68 48 94 50C68 52 52 68 50 94C48 68 32 52 6 50C32 48 48 32 50 6Z" fill="url(#tsg)"/>
              </svg>
              <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '7px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Launched on</span>
                <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff' }}>Tiny Startups</span>
              </span>
            </a>
          </div>
        </div>

        <p className={styles.footerCopy}>© {new Date().getFullYear()} MRR Story. All rights reserved.</p>
      </div>
    </footer>
  );
}
