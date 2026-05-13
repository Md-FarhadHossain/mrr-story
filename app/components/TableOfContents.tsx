'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../Story.module.css';

interface Header {
  id: string;
  text: string;
}

interface TableOfContentsProps {
  title: string;
  headers: Header[];
}

const OVERVIEW_ID = 'overview';

export default function TableOfContents({ title, headers }: TableOfContentsProps) {
  // Default to 'overview' so the first item is always highlighted on load
  const [activeId, setActiveId] = useState<string>(OVERVIEW_ID);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const handleScroll = () => {
      // If at the top of the page, Overview is active
      if (window.scrollY < 100) {
        setActiveId(OVERVIEW_ID);
        return;
      }

      // The trigger line is 40% down the viewport
      const triggerY = window.scrollY + window.innerHeight * 0.4;
      
      let currentActive = OVERVIEW_ID;

      // Find the last header that has passed the trigger line
      for (const header of headers) {
        const element = document.getElementById(header.id);
        if (element) {
          const elementTop = element.getBoundingClientRect().top + window.scrollY;
          if (elementTop <= triggerY) {
            currentActive = header.id;
          }
        }
      }

      setActiveId(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Call once to set initial state if page is already scrolled on load
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headers]);

  // Auto-scroll the TOC list so the active item is always visible
  useEffect(() => {
    if (!activeId || !listRef.current) return;
    const activeEl = itemRefs.current[activeId];
    if (!activeEl) return;

    const list = listRef.current;
    const itemTop = activeEl.offsetTop;
    const itemBottom = itemTop + activeEl.offsetHeight;
    const listScrollTop = list.scrollTop;
    const listHeight = list.clientHeight;

    if (itemTop < listScrollTop) {
      list.scrollTo({ top: itemTop - 16, behavior: 'smooth' });
    } else if (itemBottom > listScrollTop + listHeight) {
      list.scrollTo({ top: itemBottom - listHeight + 16, behavior: 'smooth' });
    }
  }, [activeId]);

  return (
    <aside className={styles.leftSidebar}>
      <p className={styles.leftSidebarLabel}>In this story</p>
      <h2 className={styles.leftSidebarTitle}>{title}</h2>
      <div className={styles.tocList} ref={listRef}>
        {/* ── Overview item — always first, active by default ── */}
        <a
          href="#"
          ref={(el) => { itemRefs.current[OVERVIEW_ID] = el; }}
          className={`${styles.tocItem} ${activeId === OVERVIEW_ID ? styles.active : ''} ${activeId !== OVERVIEW_ID ? styles.completed : ''}`}
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setActiveId(OVERVIEW_ID);
          }}
        >
          <div className={styles.circle}></div>
          <span>Overview</span>
        </a>

        {headers.map((header, index) => {
          const isActive = activeId === header.id;
          const activeIndex = headers.findIndex((h) => h.id === activeId);
          // A header is "completed" only when a real section (not overview) is active
          const isCompleted = activeId !== OVERVIEW_ID && activeIndex !== -1 && index < activeIndex;

          return (
            <a
              key={header.id}
              href={`#${header.id}`}
              ref={(el) => { itemRefs.current[header.id] = el; }}
              className={`${styles.tocItem} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
              onClick={(e) => {
                e.preventDefault();
                const elem = document.getElementById(header.id);
                if (elem) {
                  const STICKY_HEADER_HEIGHT = 80;
                  const top = elem.getBoundingClientRect().top + window.scrollY - STICKY_HEADER_HEIGHT;
                  window.scrollTo({ top, behavior: 'smooth' });
                }
              }}
            >
              <div className={styles.circle}></div>
              <span>{header.text}</span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}
