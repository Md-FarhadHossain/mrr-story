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

export default function TableOfContents({ title, headers }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0px -70% 0px' }
    );

    headers.forEach((header) => {
      const element = document.getElementById(header.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
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
      // Item is above the visible area — scroll up
      list.scrollTo({ top: itemTop - 16, behavior: 'smooth' });
    } else if (itemBottom > listScrollTop + listHeight) {
      // Item is below the visible area — scroll down
      list.scrollTo({ top: itemBottom - listHeight + 16, behavior: 'smooth' });
    }
  }, [activeId]);

  return (
    <aside className={styles.leftSidebar}>
      <p className={styles.leftSidebarLabel}>In this story</p>
      <h2 className={styles.leftSidebarTitle}>{title}</h2>
      <div className={styles.tocList} ref={listRef}>
        {headers.map((header, index) => {
          const isActive = activeId === header.id;
          const activeIndex = headers.findIndex((h) => h.id === activeId);
          const isCompleted = activeIndex !== -1 && index < activeIndex;

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
