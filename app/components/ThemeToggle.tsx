'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={styles.toggleBtn}
      aria-label="Toggle theme"
    >
      {/* Always render both icons — CSS hides the inactive one */}
      <span className={styles.sunIcon}><Sun size={17} /></span>
      <span className={styles.moonIcon}><Moon size={17} /></span>
    </button>
  );
}
