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
import { eq, not, desc, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ThemeToggle } from '../../components/ThemeToggle';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Metadata } from 'next';
import { countries } from '@/lib/countries';
import ImageZoom from '../../components/ImageZoom';
import StoryFAQ from '../../components/StoryFAQ';

export const revalidate = 60;

import GithubSlugger from 'github-slugger';

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
  // 5. Remove bold/italic markers surrounding a heading that might have been accidentally added
  out = out.replace(/^\s*([*_]{1,3})(#{1,6}\s+[\s\S]*?)\1/gm, '$2');
  // 6. Ensure headings always have a blank line before them (fixes Tiptap missing newlines after images)
  out = out.replace(/^(#{1,6}\s+[A-Za-z0-9])/gm, '\n\n$1').replace(/\n{3,}/g, '\n\n').trimStart();
  return out;
}

function extractHeaders(markdown: string) {
  const headers: { id: string; text: string }[] = [];
  const slugger = new GithubSlugger();
  // Match both ## and ### heading tags and trim excess whitespace
  const regex = /^(?:##|###)\s+(.+?)\s*$/gm;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    let rawText = match[1];
    
    // Strip markdown formatting BEFORE generating the ID so it exactly matches the text node rehypeSlug sees
    const cleanText = rawText.replace(/(\*\*|__|\*|_|`)/g, '').trim();
    
    let id = slugger.slug(cleanText);
    
    if (!id) id = `header-${headers.length}`;
    
    headers.push({ id, text: cleanText });
  }
  return headers;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const fetchedStories = await db.select().from(storiesTable).where(and(eq(storiesTable.slug, slug), eq(storiesTable.isDraft, false))).limit(1);
  const story = fetchedStories[0];

  if (!story) {
    return { title: 'Story Not Found' };
  }

  const cleanContent = sanitizeMarkdown(story.content)
    // Remove markdown images: ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // Remove markdown links: [text](url) -> keep text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Remove raw HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Remove remaining markdown syntax chars
    .replace(/[#*_>`~\[\]]/g, '')
    // Collapse extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
  const description = cleanContent.length > 155 ? cleanContent.substring(0, 152) + '...' : cleanContent;

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
  
  const fetchedStories = await db.select().from(storiesTable).where(and(eq(storiesTable.slug, slug), eq(storiesTable.isDraft, false))).limit(1);
  const story = fetchedStories[0];

  if (!story) {
    return notFound();
  }

  // --- Algo for similar stories ---
  const allOtherStories = await db.select()
    .from(storiesTable)
    .where(and(not(eq(storiesTable.slug, slug)), eq(storiesTable.isDraft, false)))
    .orderBy(desc(storiesTable.createdAt))
    .limit(10);

  const sameNiche = allOtherStories.filter(s => s.niche === story.niche);
  const others = allOtherStories.filter(s => s.niche !== story.niche);
  const similarStories = [...sameNiche, ...others].slice(0, 4);

  const headers = extractHeaders(sanitizeMarkdown(story.content));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": story.title,
      "description": story.content
        ? sanitizeMarkdown(story.content)
            .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/<[^>]*>?/gm, '')
            .replace(/[#*_>`~\[\]]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 160)
        : undefined,
      "image": story.heroImageUrl || story.profileImageUrl ? [story.heroImageUrl || story.profileImageUrl] : [],
      "datePublished": story.createdAt ? new Date(story.createdAt).toISOString() : undefined,
      "dateModified": story.createdAt ? new Date(story.createdAt).toISOString() : undefined,
      "url": `https://www.mrrstory.com/stories/${slug}`,
      "author": {
        "@type": "Person",
        "name": story.founderName || "Founder",
        ...(story.twitterUrl ? { "sameAs": [story.twitterUrl] } : {}),
        ...(story.productUrl ? { "url": story.productUrl } : {})
      },
      "publisher": {
        "@type": "Organization",
        "@id": "https://www.mrrstory.com/#organization",
        "name": "MRR Story",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.mrrstory.com/og-image.png",
          "width": 1200,
          "height": 630
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.mrrstory.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Case Studies",
          "item": "https://www.mrrstory.com/stories"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": story.title,
          "item": `https://www.mrrstory.com/stories/${slug}`
        }
      ]
    }
  ];

  // FAQ JSON-LD — only added when FAQ items exist
  const faqItems: { q: string; a: string }[] = (() => {
    try { return story.faq ? JSON.parse(story.faq) : []; }
    catch { return []; }
  })();

  if (faqItems.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    } as any);
  }

  // --- Split content to inject mobile card after TL;DR ---
  const h2Match = story.content.match(/(^|\n)## /);
  let beforeContent = story.content;
  let afterContent = '';

  if (h2Match !== null && h2Match.index !== undefined) {
    const actualSplitIndex = story.content[h2Match.index] === '\n' ? h2Match.index + 1 : h2Match.index;
    beforeContent = story.content.substring(0, actualSplitIndex);
    afterContent = story.content.substring(actualSplitIndex);
  }

  // --- Extracted Markdown Components ---
  const markdownComponents = {
    h2: ({node, ...props}: any) => <h2 className={styles.markdownHeader} {...props} />,
    h3: ({node, ...props}: any) => <h3 className={styles.markdownHeader} {...props} />,
    p: ({node, ...props}: any) => <p className={styles.markdownParagraph} {...props} />,
    blockquote: ({node, ...props}: any) => <blockquote className={styles.markdownBlockquote} {...props} />,
    ul: ({node, ...props}: any) => <ul className={styles.markdownList} {...props} />,
    ol: ({node, ...props}: any) => <ol className={styles.markdownOrderedList} {...props} />,
    li: ({node, ...props}: any) => <li className={styles.markdownListItem} {...props} />,
    img: ({node, ...props}: any) => <ImageZoom src={props.src || ''} alt={props.alt || ''} className={styles.markdownImage} style={{maxWidth: '100%', height: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)', margin: '16px 0', display: 'block'}} {...props as any} />
  };

  // --- Extracted Mobile Founder Card ---
  const mobileFounderCardElement = (
    <div className={styles.mobileFounderCard}>
      <div
        className={styles.mobileFounderHero}
        style={{
          backgroundImage: story.profileImageUrl
            ? `url(${story.profileImageUrl})`
            : undefined,
        }}
      >
        <div className={styles.mobileFounderScrim} />
        <div className={styles.mobileFounderRevenuePill}>
          <span className={styles.mobileFounderRevenuePillDot} />
          <span className={styles.mobileFounderRevenuePillText}>{story.revenue}<span className={styles.mobileFounderRevenuePillSub}>/mo</span></span>
        </div>
        <div className={styles.mobileFounderHeroBottom}>
          <div className={styles.mobileFounderHeroId}>
            <p className={styles.mobileFounderHeroName}>{story.founderName}</p>
            <p className={styles.mobileFounderHeroRole}>
              {story.founderType || 'Founder'} · <strong>{story.businessName}</strong>
            </p>
          </div>
          {story.location && (() => {
            const country = countries.find(c => c.name === story.location);
            return (
              <span className={styles.mobileFounderHeroLoc}>
                {country?.code && (
                  <Image
                    src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                    width={16} height={12} alt="" aria-hidden="true"
                    style={{ borderRadius: '3px', display: 'block' }}
                  />
                )}
                {story.location}
              </span>
            );
          })()}
        </div>
      </div>
      <div className={styles.mobileFounderChips}>
        {story.customers && (
          <div className={styles.mobileFounderChip}>
            <span className={styles.mobileFounderChipVal}>{story.customers}</span>
            <span className={styles.mobileFounderChipKey}>customers</span>
          </div>
        )}
        {story.startedYear && (
          <div className={styles.mobileFounderChip}>
            <span className={styles.mobileFounderChipVal}>{story.startedYear}</span>
            <span className={styles.mobileFounderChipKey}>started</span>
          </div>
        )}
        <div className={styles.mobileFounderChip}>
          <span className={styles.mobileFounderChipVal}>
            {story.numberOfFounders && story.numberOfFounders > 1 ? story.numberOfFounders : 'solo'}
          </span>
          <span className={styles.mobileFounderChipKey}>
            {story.numberOfFounders && story.numberOfFounders > 1 ? 'founders' : 'founder'}
          </span>
        </div>
        <div className={styles.mobileFounderChip}>
          <span className={styles.mobileFounderChipVal}>
            {story.numberOfEmployees ?? 0}
          </span>
          <span className={styles.mobileFounderChipKey}>
            {story.numberOfEmployees === 1 ? 'employee' : 'employees'}
          </span>
        </div>
        {story.founderAge && (
          <div className={styles.mobileFounderChip}>
            <span className={styles.mobileFounderChipVal}>{story.founderAge}</span>
            <span className={styles.mobileFounderChipKey}>years old</span>
          </div>
        )}
      </div>
      {story.niche && (
        <div className={styles.mobileFounderNicheRow}>
          <span className={styles.mobileFounderNicheRowLabel}>Niche</span>
          <span className={styles.mobileFounderNicheRowValue}>{story.niche}</span>
        </div>
      )}
      <div className={styles.mobileFounderActions}>
        {story.productUrl && (
          <a
            href={story.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.mobileFounderActionBtn} ${styles.mobileFounderActionProduct}`}
          >
            <Globe size={16} />
            Visit {story.businessName}
          </a>
        )}
        {story.twitterUrl && (
          <a
            href={story.twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.mobileFounderActionBtn} ${styles.mobileFounderActionTwitter}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            @{story.twitterUrl.replace(/.*\//, '')}
          </a>
        )}
      </div>
      
      {/* ── Mobile Research-Based Tag ── */}
      <div style={{ margin: '0 16px 16px', padding: '14px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <span style={{ fontSize: '1rem', marginTop: '1px' }}>🔍</span>
          <div>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Research-Based</strong>
            <p style={{ margin: 0, lineHeight: 1.4 }}>
              This story is compiled from public sources and presented in an interview format for a better reading experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

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
            {beforeContent && (
              <ReactMarkdown
                rehypePlugins={[rehypeSlug, rehypeRaw]}
                components={markdownComponents}
              >
                {sanitizeMarkdown(beforeContent)}
              </ReactMarkdown>
            )}

            {/* Render the mobile founder card right after the TL;DR and before the first H2 */}
            {mobileFounderCardElement}

            {afterContent && (
              <ReactMarkdown
                rehypePlugins={[rehypeSlug, rehypeRaw]}
                components={markdownComponents}
              >
                {sanitizeMarkdown(afterContent)}
              </ReactMarkdown>
            )}
          </div>

          {/* FAQ accordion — only rendered when FAQ items exist */}
          {faqItems.length > 0 && (
            <StoryFAQ items={faqItems} />
          )}

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
                            alt=""
                            aria-hidden="true"
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
                <span className={styles.aboutStatValue}>{story.numberOfFounders || 1}</span>
              </div>

              <div className={styles.aboutStatBox}>
                <span className={styles.aboutStatLabel}>Employees</span>
                <span className={styles.aboutStatValue}>{story.numberOfEmployees ?? 0}</span>
              </div>

              {story.startedYear && (
                <div className={styles.aboutStatBox}>
                  <span className={styles.aboutStatLabel}>Started</span>
                  <span className={styles.aboutStatValue}>{story.startedYear}</span>
                </div>
              )}

              {story.founderAge && (
                <div className={styles.aboutStatBox}>
                  <span className={styles.aboutStatLabel}>Age</span>
                  <span className={styles.aboutStatValue}>{story.founderAge} yrs</span>
                </div>
              )}

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

          {/* ── Research-Based Tag ── */}
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>🔍</span>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Research-Based</strong>
                <p style={{ margin: 0, lineHeight: 1.4 }}>
                  This story is compiled from public sources and presented in an interview format for a better reading experience.
                </p>
              </div>
            </div>
          </div>

          {/* ── CTA Widget ── */}
          <div className={styles.ctaWidget} style={{ marginTop: '24px' }}>
            <h3>MRR Story</h3>
            <p>A growing library of case studies from successful indie hackers and solopreneurs.</p>
            <Link href="/" className={styles.ctaButton}>See more Case Studies</Link>
          </div>
        </aside>
      </main>

      {similarStories.length > 0 && (
        <section className={styles.feedSection} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '60px', marginTop: '20px', maxWidth: '1200px' }}>
          <h2 className={styles.feedTitle} style={{ textAlign: 'left', marginBottom: '30px' }}>
            More Case Studies
          </h2>
          <div className={styles.caseGrid}>
            {similarStories.map((s) => (
              <Link href={`/stories/${s.slug}`} key={s.id} className={styles.caseCard}>
                <div className={styles.caseCardImg} style={{ backgroundImage: `url(${s.profileImageUrl || s.heroImageUrl || ''})` }}>
                  {s.revenue && <span className={styles.revenueBadge}>{s.revenue}/mo</span>}
                </div>
                <div className={styles.caseCardBody}>
                  <span className={styles.caseStudyTag}>founder story</span>
                  <h3 className={styles.caseCardTitle}>{s.title}</h3>
                  <p className={styles.caseCardBreaks}>
                    <strong>{s.founderName}</strong> shares:
                  </p>
                  <ul className={styles.caseCardBullets}>
                    <li>✓ What the product is & how they built it</li>
                    <li>✓ How they got their very first paying customer</li>
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
