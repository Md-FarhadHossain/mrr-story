import Link from 'next/link';
import { db } from '../../db';
import { blogsTable } from '../../db/schema';
import { desc } from 'drizzle-orm';
import Navbar from '../components/Navbar';
import { Metadata } from 'next';
import styles from '../Story.module.css';
import blogStyles from './blog.module.css';

export const metadata: Metadata = {
  title: "Blog - MRR Story",
  description: "Read SEO-friendly articles, insights, and growth hacks from the MRR Story team.",
};

export const dynamic = 'force-dynamic';

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
                          {blog.tags && (
                            <span className={blogStyles.tag}>{blog.tags.split(',')[0].trim()}</span>
                          )}
                        </div>
                      ) : (
                        <div className={blogStyles.cardImagePlaceholder}>
                          {blog.tags && (
                            <span className={blogStyles.tag}>{blog.tags.split(',')[0].trim()}</span>
                          )}
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
      <footer className={styles.siteFooter}>
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
          </nav>
        </div>
      </footer>
    </>
  );
}
