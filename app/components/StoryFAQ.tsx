'use client';

import { useState } from 'react';
import styles from '../Story.module.css';

interface FAQItem {
  q: string;
  a: string;
}

interface StoryFAQProps {
  items: FAQItem[];
}

export default function StoryFAQ({ items }: StoryFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));

  return (
    <section className={styles.storyFaqSection} aria-label="Frequently Asked Questions">
      <div className={styles.storyFaqInner}>
        <h2 className={styles.storyFaqTitle}>Frequently Asked Questions</h2>
        <div className={styles.storyFaqList}>
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`${styles.storyFaqItem} ${isOpen ? styles.storyFaqItemOpen : ''}`}
              >
                <button
                  type="button"
                  className={styles.storyFaqQuestion}
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  id={`faq-q-${i}`}
                  aria-controls={`faq-a-${i}`}
                >
                  <span>{item.q}</span>
                  <span
                    className={styles.storyFaqChevron}
                    aria-hidden="true"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={styles.storyFaqAnswer}
                  style={{
                    maxHeight: isOpen ? '600px' : '0',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className={styles.storyFaqAnswerInner}>
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
