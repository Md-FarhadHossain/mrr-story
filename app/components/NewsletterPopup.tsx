'use client';

import { useEffect, useState, useActionState } from 'react';
import styles from './NewsletterPopup.module.css';
import { subscribeToNewsletter } from '../actions/newsletter';

/* ─── localStorage keys ─────────────────────────────────────── */
const KEY_SUBSCRIBED   = 'nl_subscribed';      // permanent flag
const KEY_DISMISSED_AT = 'nl_dismissed_at';    // timestamp of last close
const ONE_WEEK_MS      = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS    = 5_000;                // 5 s after page load

/* ─── helpers ────────────────────────────────────────────────── */
function shouldShowPopup(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(KEY_SUBSCRIBED) === 'true') return false;

  const dismissedAt = localStorage.getItem(KEY_DISMISSED_AT);
  if (!dismissedAt) return true; // first visit

  const elapsed = Date.now() - Number(dismissedAt);
  return elapsed >= ONE_WEEK_MS;
}

/* ─── Component ─────────────────────────────────────────────── */
export default function NewsletterPopup() {
  const [visible, setVisible]   = useState(false);
  const [closing, setClosing]   = useState(false);
  const [done, setDone]         = useState(false);
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, null);

  /* Show after delay (SSR-safe) */
  useEffect(() => {
    if (!shouldShowPopup()) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  /* On successful subscribe → mark as subscribed & close */
  useEffect(() => {
    if (state?.success) {
      localStorage.setItem(KEY_SUBSCRIBED, 'true');
      setDone(true);
      // Close after short celebration delay
      setTimeout(() => animatedClose(true), 2200);
    }
  }, [state]);

  /* Animated close */
  const animatedClose = (subscribed = false) => {
    setClosing(true);
    if (!subscribed) {
      localStorage.setItem(KEY_DISMISSED_AT, String(Date.now()));
    }
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 280);
  };

  if (!visible) return null;

  return (
    <div
      className={`${styles.overlay} ${closing ? styles.closing : ''}`}
      onClick={() => animatedClose(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Subscribe to our newsletter"
    >
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* Top accent */}
        <div className={styles.topStrip} />

        {/* Close X */}
        <button
          className={styles.closeBtn}
          onClick={() => animatedClose(false)}
          aria-label="Close newsletter popup"
        >
          ✕
        </button>

        {/* Badge */}
        <div className={styles.badge}>
          <span>📬</span> Free Newsletter
        </div>

        {/* Headline */}
        <h2 className={styles.title}>
          {done ? '🎉 You\'re in!' : 'Get founder stories in your inbox'}
        </h2>

        {done ? (
          /* ── Success state ── */
          <p className={styles.sub}>
            Check your email and click the confirmation link to complete your
            subscription. Real stories. No spam. Ever.
          </p>
        ) : (
          <>
            {/* Sub-text */}
            <p className={styles.sub}>
              Join indie hackers learning how solopreneurs hit their first $1k MRR.
              Delivered 3× a week — free forever.
            </p>

            {/* Social proof */}
            <div className={styles.socialProof}>
              <div className={styles.avatars}>
                <span>JD</span>
                <span>KL</span>
                <span>AR</span>
              </div>
              <span>Join 2,400+ founders already subscribed</span>
            </div>

            {/* Bullets */}
            <ul className={styles.bullets}>
              <li>Real revenue numbers from real founders</li>
              <li>How they got their first customers</li>
              <li>No fluff — just actionable stories</li>
            </ul>

            {/* Form */}
            <form action={formAction} className={styles.form}>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                className={styles.input}
                required
                disabled={isPending}
                autoComplete="email"
                id="popup-newsletter-email"
              />
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isPending}
                id="popup-newsletter-submit"
              >
                {isPending ? 'Joining…' : 'Subscribe'}
              </button>
            </form>

            {state?.error && (
              <p className={styles.errorText}>{state.error}</p>
            )}

            {/* Dismiss link */}
            <p className={styles.dismiss}>
              Already subscribed?{' '}
              <button
                className={styles.dismissLink}
                onClick={() => animatedClose(false)}
              >
                No thanks, dismiss
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
