import Link from 'next/link';
import { db } from '../../db';
import { blogsTable } from '../../db/schema';
import { desc } from 'drizzle-orm';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Metadata } from 'next';
import styles from '../Story.module.css';
import blogStyles from './blog.module.css';

export const metadata: Metadata = {
  title: "Indie Hacker Blog: Growth Hacks & Revenue Playbooks | MRR Story",
  description: "Actionable growth hacks, SEO strategies, and marketing playbooks for indie hackers and bootstrapped SaaS founders. Learn how to scale your startup from zero to MRR.",
  alternates: {
    canonical: 'https://www.mrrstory.com/blog',
  },
  openGraph: {
    title: "Indie Hacker Blog: Growth Hacks & Revenue Playbooks | MRR Story",
    description: "Actionable growth hacks, SEO strategies, and marketing playbooks for indie hackers and bootstrapped SaaS founders. Learn how to scale your startup from zero to MRR.",
    url: 'https://www.mrrstory.com/blog',
    type: 'website',
    images: [
      {
        url: 'https://www.mrrstory.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MRR Story Blog - Growth Hacks & Playbooks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Indie Hacker Blog: Growth Hacks & Revenue Playbooks | MRR Story",
    description: "Actionable growth hacks, SEO strategies, and marketing playbooks for indie hackers and bootstrapped SaaS founders.",
    images: ['https://www.mrrstory.com/og-image.png'],
  },
};

export const revalidate = 60;

function formatDate(date: Date | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Pull the first image URL from Tiptap/Markdown content.
 *  Handles both Markdown  ![alt](url)  and HTML  <img src="url"> */
function extractFirstImage(content: string | null): string | null {
  if (!content) return null;
  // Markdown syntax: ![alt text](https://...)
  const mdMatch = content.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
  if (mdMatch) return mdMatch[1];
  // HTML syntax: <img src="https://...">
  const htmlMatch = content.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/);
  if (htmlMatch) return htmlMatch[1];
  return null;
}


export default async function BlogFeed() {
  const allBlogs = await db.select().from(blogsTable).orderBy(desc(blogsTable.createdAt));

  return (
    <>
      <Navbar />

      {/* ── Page Header ── */}
      <div className={blogStyles.pageHeader}>
        <p className={blogStyles.pageEyebrow}>📝 MRR Story Blog</p>
        <h1 className={blogStyles.pageTitle}>
          Insights &amp; <span className={blogStyles.pageTitleAccent}>Growth Hacks</span>
        </h1>
        <p className={blogStyles.pageSubtitle}>
          SEO guides, marketing strategies, and revenue breakdowns for indie hackers and SaaS founders.
        </p>
      </div>

      <main className={blogStyles.main}>
        {allBlogs.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No blog posts published yet.</h3>
            <p>Check back later for new articles.</p>
          </div>
        ) : (
          <>
            <div className={blogStyles.grid}>
              {allBlogs.map((blog) => (
                <Link href={`/blog/${blog.slug}`} key={blog.id} className={blogStyles.cardLink}>
                  <article className={blogStyles.card}>
                    {(() => {
                      const img = blog.coverImageUrl || extractFirstImage(blog.content);
                      return img ? (
                        <div
                          className={blogStyles.cardImage}
                          style={{ backgroundImage: `url(${img})` }}
                        >
                        </div>
                      ) : (
                        <div className={blogStyles.cardImagePlaceholder}>
                        </div>
                      );
                    })()}
                    <div className={blogStyles.cardBody}>
                      <p className={blogStyles.cardDate}>{formatDate(blog.createdAt)}</p>
                      <h2 className={blogStyles.cardTitle}>{blog.title}</h2>
                      <p className={blogStyles.cardDesc}>{blog.description}</p>
                      <span className={blogStyles.cardReadMore}>Read Article →</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <Footer />
    </>
  );
}
