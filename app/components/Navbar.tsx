'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import styles from '../Story.module.css';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/" className={styles.logoArea}>
          <div className={styles.logoIcon}>M</div>
          <span>MRR Story</span>
        </Link>
        <nav className={styles.navLinks}>
          <Link 
            href="/stories"
            style={pathname === '/stories' || pathname.startsWith('/stories/') ? { color: '#fff', fontWeight: 700, borderBottom: '2px solid #fff', paddingBottom: '2px' } : {}}
          >
            Case Studies
          </Link>
          <Link 
            href="/newsletter"
            style={pathname === '/newsletter' ? { color: '#fff', fontWeight: 700, borderBottom: '2px solid #fff', paddingBottom: '2px' } : {}}
          >
            Newsletter
          </Link>
          <Link 
            href="/blog"
            style={pathname.startsWith('/blog') ? { color: '#fff', fontWeight: 700, borderBottom: '2px solid #fff', paddingBottom: '2px' } : {}}
          >
            Blog
          </Link>
        </nav>
        <div className={styles.navActions}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
