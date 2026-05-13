import styles from '../Story.module.css';
import Link from 'next/link';
import { db } from '../../db';
import { storiesTable } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { ThemeToggle } from '../components/ThemeToggle';
import Navbar from '../components/Navbar';
import NewsletterForm from '../components/NewsletterForm';
import Footer from '../components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indie Hacker Success Stories Database | MRR Story',
  description:
    'Browse our complete database of indie hacker and solopreneur success stories. Read real case studies with exact revenue numbers, growth strategies, and first-dollar moments from bootstrapped founders.',
  alternates: {
    canonical: 'https://www.mrrstory.com/stories',
  },
  openGraph: {
    title: 'Indie Hacker Success Stories Database | MRR Story',
    description:
      'Browse our complete database of indie hacker and solopreneur success stories. Read real case studies with exact revenue numbers, growth strategies, and first-dollar moments.',
    url: 'https://www.mrrstory.com/stories',
    type: 'website',
    images: [
      {
        url: 'https://www.mrrstory.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MRR Story - Indie Hacker Success Stories Database',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Indie Hacker Success Stories Database | MRR Story',
    description:
      'Browse our complete database of indie hacker and solopreneur success stories. Real case studies with exact revenue numbers and first-dollar moments.',
    images: ['https://www.mrrstory.com/og-image.png'],
  },
};

export const revalidate = 60;

export default async function StoriesPage() {
  const allStories = await db.select().from(storiesTable).orderBy(desc(storiesTable.createdAt));

  return (
    <>
      {/* ── Header ── */}
      {/* ── Header ── */}
      <Navbar />

      {/* ── Case Study Feed ── */}
      <main className={styles.feedSection} style={{ paddingTop: '80px', minHeight: '80vh' }}>
        <h1 className={styles.feedTitle} style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
          All Founder Stories
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px' }}>
          Dive into our entire database of {allStories.length} indie hacker interviews and revenue breakdowns.
        </p>

        {allStories.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No case studies published yet.</h3>
            <p>Head over to the dashboard to publish your first story.</p>
            <Link href="/dashboard" className={styles.emptyBtn}>Go to Dashboard →</Link>
          </div>
        ) : (
          <div className={styles.caseGrid}>
            {allStories.map((story) => (
              <Link href={`/stories/${story.slug}`} key={story.id} className={styles.caseCard}>
                <div className={styles.caseCardImg} style={{ backgroundImage: `url(${story.profileImageUrl || story.heroImageUrl || ''})` }}>
                  <span className={styles.revenueBadge}>{story.revenue}/mo</span>
                </div>
                <div className={styles.caseCardBody}>
                  <span className={styles.caseStudyTag}>founder story</span>
                  <h3 className={styles.caseCardTitle}>{story.title}</h3>
                  <p className={styles.caseCardBreaks}>
                    <strong>{story.founderName}</strong> shares:
                  </p>
                  <ul className={styles.caseCardBullets}>
                    <li>✓ What the product is & how they built it</li>
                    <li>✓ How they got their very first paying customer</li>
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
