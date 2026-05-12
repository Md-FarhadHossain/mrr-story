import styles from '../../Story.module.css';
import blogStyles from '../blog.module.css';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import TableOfContents from '../../components/TableOfContents';
import { db } from '../../../db';
import { blogsTable, storiesTable } from '../../../db/schema';
import { eq, ne, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
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
  out = out.replace(/^\s*([*_]{1,3})(#{1,6}\s+[\s\S]*?)\1/gm, '$2');
  out = out.replace(/^(#{1,6}\s+[A-Za-z0-9])/gm, '\n\n$1').replace(/\n{3,}/g, '\n\n').trimStart();
  return out;
}

function extractHeaders(markdown: string) {
  const headers: { id: string; text: string }[] = [];
  const regex = /^(?:##|###)\s+(.+?)\s*$/gm;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    let rawText = match[1];
    let id = rawText.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!id) id = `header-${headers.length}`;
    const cleanText = rawText.replace(/(\*\*|__|\\*|_|`)/g, '').trim();
    headers.push({ id, text: cleanText });
  }
  return headers;
}

function extractFirstImage(content: string | null): string | null {
  if (!content) return null;
  const mdMatch = content.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
  if (mdMatch) return mdMatch[1];
  const htmlMatch = content.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/);
  if (htmlMatch) return htmlMatch[1];
  return null;
}

function formatDate(date: Date | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const fetchedBlogs = await db.select().from(blogsTable).where(eq(blogsTable.slug, slug)).limit(1);
  const blog = fetchedBlogs[0];

  if (!blog) return { title: 'Blog Not Found' };

  const imageUrl = blog.coverImageUrl || undefined;

  return {
    title: blog.title,
    description: blog.description,
    alternates: { canonical: `https://www.mrrstory.com/blog/${slug}` },
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: 'article',
      publishedTime: blog.createdAt ? new Date(blog.createdAt).toISOString() : undefined,
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

  if (!blog) return notFound();

  const headers = extractHeaders(sanitizeMarkdown(blog.content));

  // ── Related blogs: match tags first, fallback to latest ──────────────────
  const allOtherBlogs = await db
    .select()
    .from(blogsTable)
    .where(ne(blogsTable.slug, slug))
    .orderBy(desc(blogsTable.createdAt));

  const currentTags = blog.tags
    ? blog.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];

  // Score each blog by how many tags overlap
  const scored = allOtherBlogs.map((b) => {
    const bTags = b.tags
      ? b.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];
    const overlap = bTags.filter((t) => currentTags.includes(t)).length;
    return { blog: b, score: overlap };
  });

  scored.sort((a, b) => b.score - a.score);
  const relatedBlogs = scored.slice(0, 3).map((s) => s.blog);

  // ── Case studies: 3 latest stories ───────────────────────────────────────
  const caseStudies = await db
    .select()
    .from(storiesTable)
    .orderBy(desc(storiesTable.createdAt))
    .limit(3);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "image": blog.coverImageUrl ? [blog.coverImageUrl] : [],
      "datePublished": blog.createdAt ? new Date(blog.createdAt).toISOString() : undefined,
      "dateModified": blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
      "author": { "@type": "Person", "name": "MRR Story" },
      "publisher": {
        "@type": "Organization",
        "name": "MRR Story",
        "logo": { "@type": "ImageObject", "url": "https://www.mrrstory.com/favicon.ico" },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mrrstory.com/" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.mrrstory.com/blog" },
        { "@type": "ListItem", "position": 3, "name": blog.title, "item": `https://www.mrrstory.com/blog/${slug}` },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
                blockquote: ({node, ...props}) => <blockquote className={styles.markdownBlockquote} {...props} />,
                ul: ({node, ...props}) => <ul className={styles.markdownList} {...props} />,
                ol: ({node, ...props}) => <ol className={styles.markdownOrderedList} {...props} />,
                li: ({node, ...props}) => <li className={styles.markdownListItem} {...props} />,
                img: ({node, ...props}) => <ImageZoom src={props.src || ''} alt={props.alt || ''} className={styles.markdownImage} style={{maxWidth: '100%', height: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)', margin: '16px 0', display: 'block'}} {...props as any} />,
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
            <p>Join our newsletter to get a curated digest of 4-7 founder stories, case studies, and growth hacks delivered to your inbox every Tuesday.</p>
            <Link href="/newsletter" className={styles.ctaButton}>Subscribe</Link>
          </div>
        </aside>
      </main>

      {/* ══════════════════════════════════════════════════════
          RELATED BLOGS SECTION
      ══════════════════════════════════════════════════════ */}
      {relatedBlogs.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedInner}>
            <div className={styles.relatedHeader}>
              <span className={styles.relatedEyebrow}>📝 Keep Reading</span>
              <h2 className={styles.relatedTitle}>More Articles You'll Love</h2>
              <p className={styles.relatedSub}>Hand-picked reads based on what you just finished.</p>
            </div>

            <div className={styles.relatedGrid}>
              {relatedBlogs.map((b) => {
                const img = b.coverImageUrl || extractFirstImage(b.content);
                const firstTag = b.tags ? b.tags.split(',')[0].trim() : null;
                return (
                  <Link key={b.id} href={`/blog/${b.slug}`} className={styles.relatedCardLink}>
                    <article className={styles.relatedCard}>
                      <div
                        className={styles.relatedCardImage}
                        style={img ? { backgroundImage: `url(${img})` } : {}}
                      >
                        {!img && <span className={styles.relatedCardImageIcon}>📝</span>}
                        {firstTag && <span className={styles.relatedCardTag}>{firstTag}</span>}
                      </div>
                      <div className={styles.relatedCardBody}>
                        <p className={styles.relatedCardDate}>{formatDate(b.createdAt)}</p>
                        <h3 className={styles.relatedCardTitle}>{b.title}</h3>
                        <p className={styles.relatedCardDesc}>{b.description}</p>
                        <span className={styles.relatedCardCta}>Read Article →</span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>

            <div className={styles.relatedViewAll}>
              <Link href="/blog" className={styles.relatedViewAllBtn}>View All Articles →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          CASE STUDIES SECTION
      ══════════════════════════════════════════════════════ */}
      {caseStudies.length > 0 && (
        <section className={styles.caseStudiesSection}>
          <div className={styles.relatedInner}>
            <div className={styles.relatedHeader}>
              <span className={styles.relatedEyebrow}>🚀 Real Founders</span>
              <h2 className={styles.relatedTitle}>Case Studies You Might Like</h2>
              <p className={styles.relatedSub}>Read how real founders built businesses from zero to revenue.</p>
            </div>

            <div className={styles.caseStudyGrid}>
              {caseStudies.map((story) => (
                <Link key={story.id} href={`/stories/${story.slug}`} className={styles.caseStudyCardLink}>
                  <article className={styles.caseStudyCard}>
                    <div className={styles.caseStudyCardLeft}>
                      {story.profileImageUrl ? (
                        <img src={story.profileImageUrl} alt={story.founderName} className={styles.caseStudyAvatar} />
                      ) : (
                        <div className={styles.caseStudyAvatarFallback}>
                          {story.founderName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className={styles.caseStudyCardBody}>
                      <div className={styles.caseStudyMeta}>
                        <span className={styles.caseStudyTag}>Case Study</span>
                        {story.niche && <span className={styles.caseStudyNiche}>{story.niche}</span>}
                      </div>
                      <h3 className={styles.caseStudyTitle}>{story.title}</h3>
                      <div className={styles.caseStudyStats}>
                        <span className={styles.caseStudyStat}>
                          <span className={styles.caseStudyStatIcon}>💰</span>
                          {story.revenue}/mo
                        </span>
                        <span className={styles.caseStudyStatDivider}>·</span>
                        <span className={styles.caseStudyStat}>
                          <span className={styles.caseStudyStatIcon}>👤</span>
                          {story.founderName}
                        </span>
                        {story.location && (
                          <>
                            <span className={styles.caseStudyStatDivider}>·</span>
                            <span className={styles.caseStudyStat}>{story.location}</span>
                          </>
                        )}
                      </div>
                      <span className={styles.caseStudyCta}>Read Story →</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            <div className={styles.relatedViewAll}>
              <Link href="/stories" className={styles.caseStudiesViewAllBtn}>Browse All Case Studies →</Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
