import Link from 'next/link';
import { db } from '../../db';
import { blogsTable } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { ThemeToggle } from '../components/ThemeToggle';
import Navbar from '../components/Navbar';
import { Metadata } from 'next';
import styles from '../Story.module.css';
import NewsletterForm from '../components/NewsletterForm';

export const metadata: Metadata = {
  title: "Blog - MRR Story",
  description: "Read SEO-friendly articles, insights, and growth hacks from the MRR Story team.",
};

export const dynamic = 'force-dynamic';

export default async function BlogFeed() {
  const allBlogs = await db.select().from(blogsTable).orderBy(desc(blogsTable.createdAt));

  return (
    <>
      {/* ── Header ── */}
      {/* ── Header ── */}
      <Navbar />

      {/* ── Hero ── */}
      <div className={styles.heroWrapper} style={{ padding: '60px 20px', minHeight: 'auto', textAlign: 'center' }}>
        <h1 className={styles.heroTitle} style={{ fontSize: '3rem', margin: '0 auto 20px', maxWidth: '800px' }}>
          Insights & <span style={{color:'#6366f1'}}>Growth Hacks</span>
        </h1>
        <p className={styles.heroSub} style={{ margin: '0 auto', maxWidth: '600px' }}>
          Read the latest articles, SEO guides, and marketing strategies to grow your indie business.
        </p>
      </div>

      {/* ── Blog Feed ── */}
      <main className={styles.feedSection} style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 100px' }}>
        {allBlogs.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No blog posts published yet.</h3>
            <p>Check back later for new articles.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {allBlogs.map((blog) => (
              <Link href={`/blog/${blog.slug}`} key={blog.id} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '24px', 
                  padding: '24px', 
                  borderRadius: '16px', 
                  background: 'var(--card-bg)', 
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  alignItems: 'center',
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--text-secondary)';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)';
                }}>
                  {blog.coverImageUrl && (
                    <div style={{
                      width: '200px',
                      height: '140px',
                      borderRadius: '12px',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundImage: `url(${blog.coverImageUrl})`,
                      flexShrink: 0
                    }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                      {blog.title}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '16px' }}>
                      {blog.description}
                    </p>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-color)' }} />
                      <span style={{ color: '#6366f1', fontWeight: 500 }}>Read Article →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
