import styles from '../../Story.module.css';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import TableOfContents from '../../components/TableOfContents';
import { db } from '../../../db';
import { blogsTable } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ThemeToggle } from '../../components/ThemeToggle';
import Navbar from '../../components/Navbar';
import { Metadata } from 'next';
import ImageZoom from '../../components/ImageZoom';

export const revalidate = 60;

function sanitizeMarkdown(md: string): string {
  if (!md) return '';
  let out = md;
  out = out.replace(/\\(#{1,6}\s+)/g, '$1');
  out = out.replace(/(#{1,6}\s+)\\(#{1,6}\s*)/g, '$1');
  out = out.replace(/(#{1,6}\s+)(#{1,6}\s*)/g, '$1');
  out = out.replace(/(<h[1-6][^>]*>)\s*\\?(#{1,6})\s*/g, '$1');
  out = out.replace(/([^\n])\n?(#{1,6}\s+[A-Za-z0-9])/g, '$1\n\n$2');
  return out;
}

function extractHeaders(markdown: string) {
  const headers: { id: string; text: string }[] = [];
  const regex = /^(?:##|###)\s+(.+?)\s*$/gm;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const text = match[1];
    let id = text.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (!id) id = `header-${headers.length}`;
    headers.push({ id, text });
  }
  return headers;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const fetchedBlogs = await db.select().from(blogsTable).where(eq(blogsTable.slug, slug)).limit(1);
  const blog = fetchedBlogs[0];

  if (!blog) {
    return { title: 'Blog Not Found' };
  }

  const imageUrl = blog.coverImageUrl || undefined;

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      title: blog.title,
      description: blog.description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  const fetchedBlogs = await db.select().from(blogsTable).where(eq(blogsTable.slug, slug)).limit(1);
  const blog = fetchedBlogs[0];

  if (!blog) {
    return notFound();
  }

  const headers = extractHeaders(sanitizeMarkdown(blog.content));

  return (
    <>
      {/* ── Header ── */}
      <Navbar />

      <main className={styles.mainLayout}>
        <TableOfContents title={blog.title} headers={headers} />

        <article className={styles.article}>
          <div className={styles.articleMeta}>
            <span className={styles.badge} style={{ background: '#6366f1', color: '#fff' }}>Article</span>
            <span className={styles.date}>
              {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </span>
          </div>
          
          <h1 className={styles.articleTitle}>{blog.title}</h1>

          {blog.coverImageUrl && (
            <img src={blog.coverImageUrl} alt={blog.title} className={styles.heroImage} />
          )}

          <div className={styles.contentBlock}>
            <ReactMarkdown
              rehypePlugins={[rehypeSlug, rehypeRaw]}
              components={{
                h2: ({node, ...props}) => <h2 className={styles.markdownHeader} {...props} />,
                h3: ({node, ...props}) => <h3 className={styles.markdownHeader} {...props} />,
                p: ({node, ...props}) => <p className={styles.markdownParagraph} {...props} />,
                img: ({node, ...props}) => <ImageZoom src={props.src || ''} alt={props.alt || ''} className={styles.markdownImage} style={{maxWidth: '100%', height: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)', margin: '16px 0', display: 'block'}} {...props as any} />
              }}
            >
              {sanitizeMarkdown(blog.content)}
            </ReactMarkdown>
          </div>
        </article>

        <aside className={styles.sidebar}>
          {/* ── CTA Widget ── */}
          <div className={styles.ctaWidget}>
            <h3>Enjoyed this post?</h3>
            <p>Join our newsletter to get more insights, case studies, and growth hacks delivered to your inbox.</p>
            <Link href="/newsletter" className={styles.ctaButton}>Subscribe</Link>
          </div>
        </aside>
      </main>

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
