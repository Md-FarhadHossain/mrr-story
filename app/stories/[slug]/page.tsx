import Image from 'next/image';
import styles from '../../Story.module.css';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import TableOfContents from '../../components/TableOfContents';
import { Globe } from 'lucide-react';
import { db } from '../../../db';
import { storiesTable } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ThemeToggle } from '../../components/ThemeToggle';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Metadata } from 'next';
import { countries } from '@/lib/countries';
import ImageZoom from '../../components/ImageZoom';

export const revalidate = 60;

/**
 * Fix content saved by tiptap-markdown / Tiptap HTML that has `###` either:
 * 1. Backslash-escaped at start of line: `\### text` → `### text`
 * 2. Literally inside an HTML heading tag: `<h3>### text</h3>` → `<h3>text</h3>`
 */
function sanitizeMarkdown(md: string): string {
  if (!md) return '';
  let out = md;
  // 1. Remove backslash escapes before headings: `\### ` -> `### `
  out = out.replace(/\\(#{1,6}\s+)/g, '$1');
  // 2. Remove escaped hashes inside an already valid heading: `### \### Hello` -> `### Hello`
  out = out.replace(/(#{1,6}\s+)\\(#{1,6}\s*)/g, '$1');
  // 3. Remove literal unescaped hashes inside an already valid heading: `### ### Hello` -> `### Hello`
  out = out.replace(/(#{1,6}\s+)(#{1,6}\s*)/g, '$1');
  // 4. Remove hashes from the start of HTML headings: `<h3>### Hello</h3>` -> `<h3>Hello</h3>`
  out = out.replace(/(<h[1-6][^>]*>)\s*\\?(#{1,6})\s*/g, '$1');
  // 5. Ensure headings always have a blank line before them (fixes Tiptap missing newlines after images)
  // Matches any non-newline character, an optional single newline, then the heading marker
  out = out.replace(/([^\n])\n?(#{1,6}\s+[A-Za-z0-9])/g, '$1\n\n$2');
  return out;
}

function extractHeaders(markdown: string) {
  const headers: { id: string; text: string }[] = [];
  // Match both ## and ### heading tags and trim excess whitespace
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
  const fetchedStories = await db.select().from(storiesTable).where(eq(storiesTable.slug, slug)).limit(1);
  const story = fetchedStories[0];

  if (!story) {
    return { title: 'Story Not Found' };
  }

  const cleanContent = sanitizeMarkdown(story.content).replace(/<[^>]*>?/gm, '').replace(/[#*_>\[\]]/g, '');
  const description = cleanContent.length > 150 ? cleanContent.substring(0, 147) + '...' : cleanContent;

  const imageUrl = story.heroImageUrl || story.profileImageUrl || undefined;

  return {
    title: story.title,
    description: description,
    alternates: {
      canonical: `https://www.mrrstory.com/stories/${slug}`,
    },
    openGraph: {
      title: story.title,
      description: description,
      type: 'article',
      publishedTime: story.createdAt ? new Date(story.createdAt).toISOString() : undefined,
      authors: story.founderName ? [story.founderName] : undefined,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      title: story.title,
      description: description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  const fetchedStories = await db.select().from(storiesTable).where(eq(storiesTable.slug, slug)).limit(1);
  const story = fetchedStories[0];

  if (!story) {
    return notFound();
  }
  const headers = extractHeaders(sanitizeMarkdown(story.content));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": story.title,
    "image": story.heroImageUrl || story.profileImageUrl ? [story.heroImageUrl || story.profileImageUrl] : [],
    "datePublished": story.createdAt ? new Date(story.createdAt).toISOString() : undefined,
    "author": {
      "@type": "Person",
      "name": story.founderName || "Founder"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MRR Story",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.mrrstory.com/favicon.ico"
      }
    }
  };

  return (
    <>
      {/* ── JSON-LD Schema ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Header ── */}
      <Navbar />

      <main className={styles.mainLayout}>
        <TableOfContents title={story.title} headers={headers} />

        <article className={styles.article}>
          <div className={styles.articleMeta}>
            <span className={styles.badge}>Case Study</span>
            <span className={styles.date}>
              {story.createdAt ? new Date(story.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
            </span>
          </div>
          
          <h1 className={styles.articleTitle}>{story.title}</h1>

          {story.heroImageUrl && (
            <Image
              src={story.heroImageUrl}
              alt={story.title}
              width={1200}
              height={800}
              className={styles.heroImage}
              style={{ maxHeight: '500px', objectFit: 'cover', objectPosition: 'center', width: '100%', height: 'auto', borderRadius: '16px', marginBottom: '40px', display: 'block' }}
            />
          )}

          <div className={styles.contentBlock}>
            <ReactMarkdown
              rehypePlugins={[rehypeSlug, rehypeRaw]}
              components={{
                h2: ({node, ...props}) => <h2 className={styles.markdownHeader} {...props} />,
                h3: ({node, ...props}) => <h3 className={styles.markdownHeader} {...props} />,
                p: ({node, ...props}) => <p className={styles.markdownParagraph} {...props} />,
                blockquote: ({node, ...props}) => <blockquote className={styles.markdownBlockquote} {...props} />,
                img: ({node, ...props}) => <ImageZoom src={props.src || ''} alt={props.alt || ''} className={styles.markdownImage} style={{maxWidth: '100%', height: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)', margin: '16px 0', display: 'block'}} {...props as any} />
              }}
            >
              {sanitizeMarkdown(story.content)}
            </ReactMarkdown>
          </div>

          {/* Disclaimer moved to /terms */}
        </article>

        <aside className={styles.sidebar}>
          {/* ── About Widget ── */}
          <div className={styles.aboutWidget}>
            {/* Header Cover & Info */}
            <div className={styles.aboutHeaderCover}></div>
            <div className={styles.aboutHeaderContent}>
              <Image
                src={
                  story.profileImageUrl
                    ? story.profileImageUrl
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(story.founderName)}&background=6366f1&color=fff&size=80&bold=true`
                }
                alt={story.founderName}
                width={64}
                height={64}
                className={styles.aboutAvatar}
              />
              <div className={styles.aboutHeaderInfo}>
                <h3 className={styles.aboutFounderName}>{story.founderName}</h3>
                <p className={styles.aboutBusinessName}>{story.founderType || 'Founder'} of <strong>{story.businessName}</strong></p>
                {story.location && (
                  (() => {
                    const country = countries.find(c => c.name === story.location);
                    return (
                      <p className="text-sm mt-1 text-[var(--text-secondary)] flex items-center gap-2">
                        {country?.code && (
                          <Image
                            src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                            width={16}
                            height={12}
                            alt={country.name}
                            style={{ borderRadius: '2px', marginRight: '6px' }}
                          />
                        )}
                        <span>{story.location}</span>
                      </p>
                    );
                  })()
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.aboutStatsGrid}>
              <div className={styles.aboutStatBox}>
                <span className={styles.aboutStatLabel}>Revenue / mo</span>
                <span className={styles.aboutStatValue + ' ' + styles.aboutStatGreen}>{story.revenue}</span>
              </div>

              {story.customers && (
                <div className={styles.aboutStatBox}>
                  <span className={styles.aboutStatLabel}>Customers</span>
                  <span className={styles.aboutStatValue}>{story.customers}</span>
                </div>
              )}

              <div className={styles.aboutStatBox}>
                <span className={styles.aboutStatLabel}>Founders</span>
                <span className={styles.aboutStatValue}>1</span>
              </div>

              {story.niche && (
                <div className={`${styles.aboutStatBox} ${styles.aboutStatBoxFull}`}>
                  <span className={styles.aboutStatLabel}>Niche</span>
                  <span className={styles.aboutStatValue + ' ' + styles.aboutStatNiche}>{story.niche}</span>
                </div>
              )}
            </div>

            {/* Connect links */}
            <div className={styles.aboutConnect}>
              <p className={styles.aboutConnectTitle}>Connect</p>
              <div className={styles.aboutLinks}>
                {story.twitterUrl && (
                  <a
                    href={story.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.aboutLinkBtn + ' ' + styles.aboutLinkTwitter}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    <span>@{story.twitterUrl.replace(/.*\//,'')}</span>
                  </a>
                )}
                {story.productUrl && (
                  <a
                    href={story.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.aboutLinkBtn + ' ' + styles.aboutLinkProduct}
                  >
                    <Globe size={16} style={{ flexShrink: 0 }} />
                    <span>{story.productUrl.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ── CTA Widget ── */}
          <div className={styles.ctaWidget}>
            <h3>MRR Story</h3>
            <p>Read 4,000+ case studies of successful founders.</p>
            <Link href="/" className={styles.ctaButton}>See more Case Studies</Link>
          </div>
        </aside>
      </main>
      <Footer />
    </>
  );
}
