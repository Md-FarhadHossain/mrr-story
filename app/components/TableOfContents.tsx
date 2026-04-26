'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    // Determine which section is currently active using IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        // We look for intersecting entries. If multiple, last one in array might not be best.
        // Usually, scrolling down triggers the next one, scrolling up triggers the previous.
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0px -70% 0px' } // Adjust margins so it activates when near the top of viewport
    );

    headers.forEach((header) => {
      const element = document.getElementById(header.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headers]);

  return (
    <aside className={styles.leftSidebar}>
      <h2 className={styles.leftSidebarTitle}>{title}</h2>
      <div className={styles.tocList}>
        {headers.map((header, index) => {
          const isActive = activeId === header.id;
          const activeIndex = headers.findIndex((h) => h.id === activeId);
          // If no active item, nothing is completed. Otherwise, items before active are completed.
          const isCompleted = activeIndex !== -1 && index < activeIndex;

          return (
            <a
              key={header.id}
              href={`#${header.id}`}
              className={`${styles.tocItem} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
              onClick={(e) => {
                e.preventDefault();
                const elem = document.getElementById(header.id);
                if (elem) {
                  elem.scrollIntoView({ behavior: 'smooth' });
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
