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
            href="/" 
            className={pathname === '/' || pathname.startsWith('/stories') ? styles.navActive : ''}
          >
            Case Studies
          </Link>
          <Link 
            href="/newsletter" 
            className={pathname === '/newsletter' ? styles.navActive : ''}
          >
            Newsletter
          </Link>
          <Link 
            href="/blog" 
            className={pathname.startsWith('/blog') ? styles.navActive : ''}
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
