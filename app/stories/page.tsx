import styles from '../Story.module.css';
import Link from 'next/link';
import { db } from '../../db';
import { storiesTable } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { ThemeToggle } from '../components/ThemeToggle';
import Navbar from '../components/Navbar';
import NewsletterForm from '../components/NewsletterForm';

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

      {/* ── Footer ── */}
      <footer className={styles.siteFooter} style={{ marginTop: 'auto' }}>
        <div className={styles.siteFooterInner}>
          <Link href="/" className={styles.footerLogo}>
            <div className={styles.logoIcon}>M</div>
            <span>MRR Story</span>
          </Link>
          <nav className={styles.footerNav}>
            <Link href="#">About</Link>
            <Link href="#">Support</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Terms of Use</Link>
            <span>𝕏</span>
            <span>▶</span>
          </nav>
        </div>
      </footer>
    </>
  );
}
