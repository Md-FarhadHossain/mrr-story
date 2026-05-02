'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Dashboard.module.css';
import { ThemeToggle } from '../components/ThemeToggle';
import { BookOpen, PenSquare, Edit3, FileText } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.dashboardLayout}>
      {/* Shared Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>M</div>
            MRR Story
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link
            href="/dashboard"
            className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}
          >
            <PenSquare size={16} /> Write a Story
          </Link>
          <Link
            href="/dashboard/stories"
            className={`${styles.navItem} ${pathname.startsWith('/dashboard/stories') ? styles.active : ''}`}
          >
            <BookOpen size={16} /> My Stories
          </Link>
          <div style={{ height: '20px' }}></div>
          <Link
            href="/dashboard/blogs/new"
            className={`${styles.navItem} ${pathname === '/dashboard/blogs/new' ? styles.active : ''}`}
          >
            <Edit3 size={16} /> Write a Blog
          </Link>
          <Link
            href="/dashboard/blogs"
            className={`${styles.navItem} ${pathname === '/dashboard/blogs' && !pathname.includes('new') ? styles.active : ''}`}
          >
            <FileText size={16} /> My Blogs
          </Link>
        </nav>
      </aside>

      {/* Page content fills the right side */}
      <div className={styles.mainContent}>
        {children}
      </div>
    </div>
  );
}
