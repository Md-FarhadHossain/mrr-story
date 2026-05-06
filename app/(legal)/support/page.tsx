import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from '../legal.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support | MRR Story',
  description: 'Get help with MRR Story. Contact our team at support@mrrstory.com.',
  alternates: {
    canonical: 'https://www.mrrstory.com/support',
  },
  openGraph: {
    title: 'Support | MRR Story',
    description: 'Get help with MRR Story. Contact our team at support@mrrstory.com.',
    url: 'https://www.mrrstory.com/support',
    type: 'website',
  },
};

export default function SupportPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroEyebrow}>We're Here to Help</div>
        <h1 className={styles.heroTitle}>Support Center</h1>
        <p className={styles.heroSub}>
          Have a question, suggestion, or something isn't working right?
          We're a small team and we personally respond to every message.
        </p>
        <div className={styles.heroClip} />
      </div>

      {/* ── Content ── */}
      <div className={styles.contentWrapper}>

        {/* Main CTA */}
        <div className={styles.supportCta}>
          <p className={styles.supportCtaTitle}>📬 Email Us Directly</p>
          <p className={styles.supportCtaSub}>
            The fastest way to get help. We typically respond within 24–48 hours on business days.
          </p>
          <a href="mailto:support@mrrstory.com" className={styles.emailBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            support@mrrstory.com
          </a>
        </div>

        {/* FAQ */}
        <div className={styles.section}>
          <span className={styles.sectionIcon}>❓</span>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.sectionBody}>
            <p><strong>How do I get my story featured on MRR Story?</strong></p>
            <p>
              Email us at <a href="mailto:support@mrrstory.com">support@mrrstory.com</a> with
              a brief description of your business, your revenue milestone, and how you got your first
              paying customer. We'll take it from there.
            </p>

            <p style={{ marginTop: '24px' }}><strong>Is it free to be featured?</strong></p>
            <p>
              Yes, 100% free. We publish stories because we believe in the indie hacker community,
              not to charge for coverage.
            </p>

            <p style={{ marginTop: '24px' }}><strong>How do you collect story information?</strong></p>
            <p>
              We compile information from publicly available sources — podcasts, interviews, blog posts,
              and social media. Some stories are submitted directly by founders. All research-based
              stories are clearly labeled with our research disclaimer.
            </p>

            <p style={{ marginTop: '24px' }}><strong>I found an error in a story. What should I do?</strong></p>
            <p>
              Please email us immediately at <a href="mailto:support@mrrstory.com">support@mrrstory.com</a> with
              the article link and the correction. We'll review and update the content within 48 hours.
            </p>

            <p style={{ marginTop: '24px' }}><strong>Can I request that my story be removed?</strong></p>
            <p>
              Absolutely. If you are a founder featured in a story and would like it removed or updated,
              simply email us and we'll process the request promptly.
            </p>

            <p style={{ marginTop: '24px' }}><strong>How do I unsubscribe from the newsletter?</strong></p>
            <p>
              Every newsletter email contains an unsubscribe link at the bottom. Click it and you'll be
              instantly removed. You can also email us to unsubscribe manually.
            </p>
          </div>
        </div>

        {/* Response time */}
        <div className={styles.section}>
          <span className={styles.sectionIcon}>⏱️</span>
          <h2 className={styles.sectionTitle}>What to Expect</h2>
          <div className={styles.sectionBody}>
            <ul>
              <li>General inquiries: response within <strong>1–2 business days</strong></li>
              <li>Story submissions: response within <strong>3–5 business days</strong></li>
              <li>Error corrections: addressed within <strong>24–48 hours</strong></li>
              <li>Removal requests: processed within <strong>24 hours</strong></li>
            </ul>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
