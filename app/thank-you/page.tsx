"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import styles from './ThankYou.module.css';

export default function ThankYouPage() {
  const router = useRouter();

  useEffect(() => {
    // Confetti from sides
    const duration = 2000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b35c3', '#22c55e', '#a5b4fc', '#ffffff'] 
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b35c3', '#22c55e', '#a5b4fc', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Redirect after 3 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Awesome, you're in!
        </h1>
        <p className={styles.description}>
          Thanks for subscribing. We've added you to the list and will start sending you the best stories soon.
        </p>
        <p className={styles.subtext}>
          Redirecting you back to the homepage in 3 seconds...
        </p>
      </div>
    </div>
  );
}
