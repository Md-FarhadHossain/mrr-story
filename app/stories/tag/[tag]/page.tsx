import styles from '../../../Story.module.css';
import Link from 'next/link';
import { db } from '../../../../db';
import { storiesTable } from '../../../../db/schema';
import { desc } from 'drizzle-orm';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { Metadata } from 'next';
import GithubSlugger from 'github-slugger';

export const revalidate = 60;

type Props = {
  params: { tag: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tagStr = params.tag.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${tagStr} Success Stories & Case Studies | MRR Story`,
    description: `Browse our database of ${tagStr} indie hacker and solopreneur success stories. Real case studies with exact revenue numbers and growth strategies.`,
    alternates: {
      canonical: `https://www.mrrstory.com/stories/tag/${params.tag}`,
    },
    openGraph: {
      title: `${tagStr} Success Stories & Case Studies | MRR Story`,
      description: `Browse our database of ${tagStr} indie hacker and solopreneur success stories. Real case studies with exact revenue numbers.`,
      url: `https://www.mrrstory.com/stories/tag/${params.tag}`,
      type: 'website',
      images: [
        {
          url: 'https://www.mrrstory.com/og-image.png',
          width: 1200,
          height: 630,
          alt: `MRR Story - ${tagStr} Success Stories`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tagStr} Success Stories & Case Studies | MRR Story`,
      description: `Browse our database of ${tagStr} indie hacker and solopreneur success stories.`,
      images: ['https://www.mrrstory.com/og-image.png'],
    },
  };
}

export default async function TagPage({ params }: Props) {
  const allStories = await db.select().from(storiesTable).orderBy(desc(storiesTable.createdAt));
  
  const slugger = new GithubSlugger();
  const filteredStories = allStories.filter((story) => {
    if (!story.tags) return false;
    const storyTags = story.tags.split(',').map(t => t.trim());
    return storyTags.some(t => {
      slugger.reset();
      return slugger.slug(t) === params.tag;
    });
  });

  // Find the original formatting of the tag (e.g. "AI SaaS" instead of "Ai Saas")
  let displayTag = params.tag.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  if (filteredStories.length > 0 && filteredStories[0].tags) {
    const tagsArray = filteredStories[0].tags.split(',').map(t => t.trim());
    const match = tagsArray.find(t => {
      slugger.reset();
      return slugger.slug(t) === params.tag;
    });
    if (match) displayTag = match;
  }

  return (
    <>
      <Navbar />

      <main className={styles.feedSection} style={{ paddingTop: '80px', minHeight: '80vh' }}>
        <div style={{ marginBottom: '16px' }}>
          <Link href="/stories" style={{ color: 'var(--accent-purple)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '500' }}>
            ← All Stories
          </Link>
        </div>
        <h1 className={styles.feedTitle} style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
          {displayTag} Stories
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px' }}>
          Dive into {filteredStories.length} {displayTag} indie hacker interviews and revenue breakdowns.
        </p>

        {filteredStories.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No case studies found for this tag.</h3>
            <p>Check back later or browse all stories.</p>
            <Link href="/stories" className={styles.emptyBtn}>Browse All Stories →</Link>
          </div>
        ) : (
          <div className={styles.caseGrid}>
            {filteredStories.map((story) => (
              <Link href={`/stories/${story.slug}`} key={story.id} className={styles.caseCard}>
                <div className={styles.caseCardImg} style={{ backgroundImage: `url(${story.profileImageUrl || story.heroImageUrl || ''})` }}>
                  <span className={styles.revenueBadge}>{story.revenue}/mo</span>
                </div>
                <div className={styles.caseCardBody}>
                  <span className={styles.caseStudyTag}>{story.tags ? story.tags.split(',')[0].trim().toLowerCase() : 'founder story'}</span>
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
