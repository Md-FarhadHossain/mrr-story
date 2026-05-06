import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from '../legal.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | MRR Story',
  description: 'Read the MRR Story Terms of Use including our content disclaimer, acceptable use policy, and intellectual property guidelines.',
  alternates: {
    canonical: 'https://www.mrrstory.com/terms',
  },
  openGraph: {
    title: 'Terms of Use | MRR Story',
    description: 'Read the MRR Story Terms of Use including our content disclaimer, acceptable use policy, and intellectual property guidelines.',
    url: 'https://www.mrrstory.com/terms',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroEyebrow}>Legal</div>
        <h1 className={styles.heroTitle}>Terms of Use</h1>
        <p className={styles.heroSub}>
          Please read these terms carefully before using MRR Story. By accessing our site,
          you agree to these terms.
        </p>
        <div className={styles.heroClip} />
      </div>

      {/* ── Content ── */}
      <div className={styles.contentWrapper}>
        <span className={styles.lastUpdated}>Last updated: May 2025</span>

        {/* ── Research Disclaimer — moved from stories ── */}
        <div className={styles.disclaimerBox}>
          <div className={styles.disclaimerBoxIcon}>📋</div>
          <div className={styles.disclaimerBoxBody}>
            <div className={styles.disclaimerBoxTitle}>Research-Based Content Disclaimer</div>
            <p className={styles.disclaimerBoxText}>
              Many case studies published on MRR Story are <strong>research-based</strong> and have
              not been directly verified through a personal interview with the founder. Information is
              compiled from publicly available sources — including podcasts, blog posts, social media
              threads, Product Hunt pages, and press coverage — and presented in an interview-style
              format for readability. We make every effort to ensure accuracy, but we cannot guarantee
              that all figures or statements are current or fully verified. If you are a featured
              founder and wish to correct or remove your story, please contact us at{' '}
              <a href="mailto:support@mrrstory.com" style={{ color: '#92400e', fontWeight: 700 }}>
                support@mrrstory.com
              </a>.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>📄</span>
          <h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
          <div className={styles.sectionBody}>
            <p>
              By accessing or using MRR Story at <a href="https://www.mrrstory.com">mrrstory.com</a>{' '}
              (the "Site"), you agree to be bound by these Terms of Use. If you do not agree to these
              terms, please do not use the Site.
            </p>
            <p>
              We reserve the right to update or modify these Terms at any time without prior notice.
              Your continued use of the Site after any changes constitutes your acceptance of the
              new Terms.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitle}>Content & Accuracy</h2>
          <div className={styles.sectionBody}>
            <p>
              MRR Story publishes case studies, articles, and resources about indie hackers, solopreneurs,
              and bootstrapped founders. Our content is provided for <strong>informational and
              inspirational purposes only</strong> and does not constitute financial, legal, or business
              advice.
            </p>
            <ul>
              <li>Revenue figures and metrics are reported as found in public sources and may not reflect current numbers</li>
              <li>Business outcomes described in case studies are not typical or guaranteed results</li>
              <li>Readers should independently verify information before making business decisions</li>
            </ul>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitle}>Research-Based Stories</h2>
          <div className={styles.sectionBody}>
            <p>
              Some stories on MRR Story are compiled through secondary research rather than direct
              founder interviews. In these cases:
            </p>
            <ul>
              <li>Information is sourced from publicly available materials only</li>
              <li>Stories are presented in an interview-style format for readability — this is a stylistic choice, not a representation that an actual interview was conducted</li>
              <li>We strive for accuracy but cannot guarantee every detail is current or complete</li>
              <li>Featured founders may request corrections or removal at any time</li>
            </ul>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>©️</span>
          <h2 className={styles.sectionTitle}>Intellectual Property</h2>
          <div className={styles.sectionBody}>
            <p>
              All content on MRR Story — including text, images, logos, and design — is owned by
              MRR Story or its content contributors and is protected by applicable copyright and
              intellectual property laws.
            </p>
            <ul>
              <li>You may share links to our content freely</li>
              <li>You may quote short excerpts with proper attribution and a link back to the original</li>
              <li>You may <strong>not</strong> reproduce full articles, case studies, or substantial portions of our content without written permission</li>
              <li>You may <strong>not</strong> use our content for commercial purposes without prior written consent</li>
            </ul>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>🚫</span>
          <h2 className={styles.sectionTitle}>Acceptable Use</h2>
          <div className={styles.sectionBody}>
            <p>When using MRR Story, you agree not to:</p>
            <ul>
              <li>Scrape, crawl, or systematically extract content from the Site without permission</li>
              <li>Use the Site in any way that violates applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to any part of the Site or its infrastructure</li>
              <li>Submit false, misleading, or defamatory information through any contact form</li>
              <li>Impersonate any person or entity, including MRR Story staff or featured founders</li>
            </ul>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>🔗</span>
          <h2 className={styles.sectionTitle}>Third-Party Links</h2>
          <div className={styles.sectionBody}>
            <p>
              MRR Story may contain links to third-party websites, products, or services. These links
              are provided for convenience and do not constitute an endorsement. We are not responsible
              for the content, privacy practices, or availability of any third-party site.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>⚠️</span>
          <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
          <div className={styles.sectionBody}>
            <p>
              To the fullest extent permitted by law, MRR Story shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of the Site or reliance
              on any content published here.
            </p>
            <p>
              The content on MRR Story is provided "as is" without warranties of any kind, express or
              implied, including but not limited to warranties of accuracy, completeness, or fitness
              for a particular purpose.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionIcon}>📬</span>
          <h2 className={styles.sectionTitle}>Contact</h2>
          <div className={styles.sectionBody}>
            <p>
              If you have questions about these Terms of Use, would like to report a content issue,
              or wish to request a correction or removal, please contact us:
            </p>
            <p>
              📧 <a href="mailto:support@mrrstory.com"><strong>support@mrrstory.com</strong></a>
            </p>
            <p>
              We aim to respond to all legal and content inquiries within 2 business days.
            </p>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
