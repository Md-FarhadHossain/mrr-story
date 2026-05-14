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
import StoryFAQ from '../../components/StoryFAQ';

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

import GithubSlugger from 'github-slugger';

function extractHeaders(markdown: string) {
  const headers: { id: string; text: string }[] = [];
  const slugger = new GithubSlugger();
  const regex = /^(?:##|###)\s+(.+?)\s*$/gm;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    let rawText = match[1];
    
    // Strip formatting before slugifying
    const cleanText = rawText.replace(/(\*\*|__|\\*|_|`)/g, '').trim();
    
    let id = slugger.slug(cleanText);
    
    if (!id) id = `header-${headers.length}`;
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
    keywords: blog.metaKeywords ? blog.metaKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : undefined,
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

  // Parse FAQ items
  const faqItems: { q: string; a: string }[] = (() => {
    try { return blog.faq ? JSON.parse(blog.faq) : []; }
    catch { return []; }
  })();

  const jsonLd: object[] = [
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

  // Add FAQPage schema if there are FAQ items
  if (faqItems.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": { "@type": "Answer", "text": item.a },
      })),
    });
  }

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

          {/* ── FAQ Section ── */}
          {faqItems.length > 0 && <StoryFAQ items={faqItems} />}
        </article>

        <aside className={styles.sidebar}>
          {/* ── Premium Newsletter CTA Widget ── */}
          <div style={{
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 40px rgba(99,102,241,0.12)',
          }}>
            {/* Gradient header band */}
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%)',
              padding: '28px 24px 20px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative blobs */}
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '100px', height: '100px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              }} />
              <div style={{
                position: 'absolute', bottom: '-30px', left: '-15px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
              }} />

              {/* Emoji with animated pulse ring */}
              <div style={{ position: 'relative', display: 'inline-flex', marginBottom: '14px' }}>
                <div style={{
                  position: 'absolute', inset: '-6px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  📬
                </div>
              </div>

              <h3 style={{
                color: '#fff', fontSize: '1.15rem', fontWeight: 800,
                margin: '0 0 8px', lineHeight: 1.3,
                position: 'relative', zIndex: 1,
              }}>
                Get Weekly Founder Insights
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem',
                margin: 0, lineHeight: 1.6,
                position: 'relative', zIndex: 1,
              }}>
                4–7 real stories, growth tactics &amp; revenue breakdowns — every Tuesday.
              </p>
            </div>

            {/* Body */}
            <div style={{
              background: 'var(--bg-card)',
              padding: '20px 24px 24px',
            }}>
              {/* Avatar stack + social proof */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                marginBottom: '18px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(168,85,247,0.04) 100%)',
                border: '1px solid rgba(99,102,241,0.12)',
              }}>
                {/* Mini avatar stack */}
                <div style={{ display: 'flex', flexShrink: 0 }}>
                  {['4f46e5','7c3aed','a855f7'].map((c, idx) => (
                    <div key={idx} style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: `#${c}`,
                      border: '2px solid var(--bg-card)',
                      marginLeft: idx === 0 ? 0 : '-8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', color: '#fff', fontWeight: 700,
                    }}>
                      {['F','S','B'][idx]}
                    </div>
                  ))}
                </div>
                <p style={{
                  fontSize: '0.75rem', color: 'var(--text-secondary)',
                  margin: 0, lineHeight: 1.4,
                }}>
                  <strong style={{ color: 'var(--text-primary)' }}>2,400+ founders</strong> already reading
                </p>
              </div>

              {/* Trust bullets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {[
                  'Real revenue numbers & strategies',
                  'Zero fluff, 100% actionable',
                  'Unsubscribe any time, no spam',
                ].map((point, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                href="/newsletter"
                style={{
                  display: 'block',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  padding: '13px 20px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  letterSpacing: '0.2px',
                  boxShadow: '0 4px 16px rgba(79,70,229,0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                🚀 Join the Newsletter — Free
              </Link>

              <p style={{
                textAlign: 'center', fontSize: '0.7rem',
                color: 'var(--text-secondary)', marginTop: '10px', opacity: 0.7,
              }}>
                Trusted by indie hackers &amp; bootstrappers worldwide
              </p>
            </div>
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
