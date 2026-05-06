import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from '../legal.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | MRR Story',
  description: 'Read the MRR Story Privacy Policy to understand how we collect, use, and protect your information.',
  alternates: {
    canonical: 'https://www.mrrstory.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | MRR Story',
    description: 'Read the MRR Story Privacy Policy to understand how we collect, use, and protect your information.',
    url: 'https://www.mrrstory.com/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroEyebrow}>Legal</div>
        <h1 className={styles.heroTitle}>Privacy Policy</h1>
        <p className={styles.heroSub}>
          We care about your privacy. Here's exactly what we collect, why we collect it,
          and how we keep it safe.
        </p>
        <div className={styles.heroClip} />
      </div>

      {/* ── Content ── */}
      <div className={styles.contentWrapper}>
        <span className={styles.lastUpdated}>Last updated: May 2025</span>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>📋</span>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <div className={styles.sectionBody}>
            <p>
              MRR Story ("we", "us", or "our") is committed to protecting the personal information
              of our readers and subscribers. This Privacy Policy explains what data we collect when
              you visit <a href="https://www.mrrstory.com">mrrstory.com</a>, how we use it, and the
              choices you have.
            </p>
            <p>
              By using our website, you agree to the collection and use of information in accordance
              with this policy.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>📥</span>
          <h2 className={styles.sectionTitle}>Information We Collect</h2>
          <div className={styles.sectionBody}>
            <p><strong>Information you provide voluntarily:</strong></p>
            <ul>
              <li>Email address (when subscribing to our newsletter)</li>
              <li>Name (optional, when submitting a story or contacting support)</li>
              <li>Story information (if you submit your founder story for publication)</li>
            </ul>
            <p style={{ marginTop: '16px' }}><strong>Information collected automatically:</strong></p>
            <ul>
              <li>Pages visited and time spent on the site (via Google Analytics)</li>
              <li>Browser type, device type, and operating system</li>
              <li>Referring URLs and general geographic location (country/city level)</li>
              <li>IP address (anonymized where possible)</li>
            </ul>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
          <div className={styles.sectionBody}>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Send you our newsletter with new founder stories and updates</li>
              <li>Respond to your support inquiries and story submissions</li>
              <li>Analyze site traffic to improve content and user experience</li>
              <li>Protect the security and integrity of our platform</li>
            </ul>
            <p>
              We do <strong>not</strong> sell, rent, or trade your personal information to third parties.
              Ever.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>🍪</span>
          <h2 className={styles.sectionTitle}>Cookies & Tracking</h2>
          <div className={styles.sectionBody}>
            <p>
              We use cookies and similar tracking technologies to enhance your experience on our site.
              Specifically, we use Google Analytics to understand how visitors interact with our content.
            </p>
            <ul>
              <li><strong>Analytics cookies:</strong> Help us understand page views, traffic sources, and user behavior (anonymized)</li>
              <li><strong>Functional cookies:</strong> Remember your preferences such as dark/light mode</li>
            </ul>
            <p>
              You can opt out of Google Analytics tracking by using the{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                Google Analytics Opt-out Browser Add-on
              </a>.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>📧</span>
          <h2 className={styles.sectionTitle}>Email & Newsletter</h2>
          <div className={styles.sectionBody}>
            <p>
              When you subscribe to our newsletter, your email address is stored securely and used
              solely to send you new story notifications and occasional platform updates.
            </p>
            <ul>
              <li>You can unsubscribe at any time using the link in any email</li>
              <li>We do not send spam or sell your email to advertisers</li>
              <li>We use industry-standard email service providers with their own security practices</li>
            </ul>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>🔐</span>
          <h2 className={styles.sectionTitle}>Data Security</h2>
          <div className={styles.sectionBody}>
            <p>
              We implement reasonable technical and organizational measures to protect your personal
              information against unauthorized access, alteration, disclosure, or destruction. Our
              website uses HTTPS encryption for all data in transit.
            </p>
            <p>
              However, no method of transmission over the internet is 100% secure. While we strive
              to protect your data, we cannot guarantee absolute security.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>⚖️</span>
          <h2 className={styles.sectionTitle}>Your Rights</h2>
          <div className={styles.sectionBody}>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Ask us to correct any inaccurate information</li>
              <li><strong>Deletion:</strong> Request that we delete your personal data</li>
              <li><strong>Unsubscribe:</strong> Opt out of marketing emails at any time</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{' '}
              <a href="mailto:support@mrrstory.com">support@mrrstory.com</a>.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>🔄</span>
          <h2 className={styles.sectionTitle}>Changes to This Policy</h2>
          <div className={styles.sectionBody}>
            <p>
              We may update this Privacy Policy from time to time. When we do, we'll update the
              "Last updated" date at the top of this page. We encourage you to review this page
              periodically to stay informed.
            </p>
            <p>
              Questions about this policy? Reach us at{' '}
              <a href="mailto:support@mrrstory.com">support@mrrstory.com</a>.
            </p>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
