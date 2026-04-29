'use client';

import { useEffect } from 'react';
import styles from './ConfirmationModal.module.css';

export default function ConfirmationModal({ onClose }: { onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Top accent bar */}
        <div className={styles.topBar} />

        {/* Icon */}
        <div className={styles.iconRing}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        {/* Headline */}
        <h2 className={styles.title}>Check your inbox!</h2>

        {/* Body */}
        <p className={styles.body}>
          We just sent a <strong>confirmation link</strong> to your email address.
          Click it to complete your subscription and start receiving stories.
        </p>

        {/* Nudge box */}
        <div className={styles.nudgeBox}>
          <span className={styles.nudgeIcon}>💡</span>
          <p className={styles.nudgeText}>
            <strong>Don't forget to confirm!</strong> Once you verify, you'll get hand-picked founder stories delivered to you <strong>3× a week</strong> no spam, ever.
          </p>
        </div>

        <p className={styles.hint}>
          Can't find it? Check your <em>Spam</em> or <em>Promotions</em> folder.
        </p>

        {/* Close */}
        <button className={styles.closeBtn} onClick={onClose}>
          Got it, I'll check my email →
        </button>

        <button className={styles.dismissText} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
