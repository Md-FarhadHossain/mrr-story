import styles from '../../Story.module.css';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import TableOfContents from '../../components/TableOfContents';
import { db } from '../../../db';
import { storiesTable } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ThemeToggle } from '../../components/ThemeToggle';

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

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  const fetchedStories = await db.select().from(storiesTable).where(eq(storiesTable.slug, slug)).limit(1);
  const story = fetchedStories[0];

  if (!story) {
    return notFound();
  }

  const headers = extractHeaders(story.content);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logoArea}>
            <div className={styles.logoIcon}>M</div>
            <span>MRR Stories</span>
          </Link>
          <nav className={styles.navLinks}>
            <Link href="/">Case Studies</Link>
            <Link href="#">Newsletter</Link>
            <Link href="#">Ideas</Link>
          </nav>
          <div className={styles.navActions}>
            <ThemeToggle />
            <Link href="#" className={styles.loginBtn}>Login</Link>
            <Link href="/dashboard" className={styles.submitBtn}>Write a Story</Link>
          </div>
        </div>
      </header>

      <main className={styles.mainLayout}>
        <TableOfContents title={story.title} headers={headers} />

        <article className={styles.article}>
          <div className={styles.articleMeta}>
            <span className={styles.badge}>Interview</span>
            <span className={styles.date}>
              {story.createdAt ? new Date(story.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
            </span>
          </div>
          
          <h1 className={styles.articleTitle}>{story.title}</h1>


          {story.heroImageUrl && (
            <img src={story.heroImageUrl} alt="Hero" className={styles.heroImage} />
          )}

          <div className={styles.contentBlock}>
            <ReactMarkdown
              rehypePlugins={[rehypeSlug]}
              components={{
                h2: ({node, ...props}) => <h2 className={styles.markdownHeader} {...props} />,
                h3: ({node, ...props}) => <h3 className={styles.markdownHeader} {...props} />,
                p: ({node, ...props}) => <p className={styles.markdownParagraph} {...props} />,
                img: ({node, ...props}) => <img className={styles.markdownImage} style={{maxWidth: '100%', height: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)', margin: '16px 0', display: 'block'}} {...props} />
              }}
            >
              {story.content}
            </ReactMarkdown>
          </div>
        </article>

        <aside className={styles.sidebar}>
          {/* ── About Widget ── */}
          <div className={styles.aboutWidget}>
            {/* Header */}
            <div className={styles.aboutHeader}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(story.founderName)}&background=6366f1&color=fff&size=80&bold=true`}
                alt={story.founderName}
                className={styles.aboutAvatar}
              />
              <div className={styles.aboutHeaderInfo}>
                <span className={styles.aboutBadge}>Founder</span>
                <h3 className={styles.aboutFounderName}>{story.founderName}</h3>
                <p className={styles.aboutBusinessName}>{story.businessName}</p>
              </div>
            </div>

            {/* Stats rows */}
            <div className={styles.aboutStats}>
              <div className={styles.aboutStatRow}>
                <span className={styles.aboutStatLabel}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Revenue / mo
                </span>
                <span className={styles.aboutStatValue + ' ' + styles.aboutStatGreen}>{story.revenue}</span>
              </div>

              {story.customers && (
                <div className={styles.aboutStatRow}>
                  <span className={styles.aboutStatLabel}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Customers
                  </span>
                  <span className={styles.aboutStatValue}>{story.customers}</span>
                </div>
              )}

              {story.niche && (
                <div className={styles.aboutStatRow}>
                  <span className={styles.aboutStatLabel}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    Niche
                  </span>
                  <span className={styles.aboutStatValue + ' ' + styles.aboutStatNiche}>{story.niche}</span>
                </div>
              )}

              <div className={styles.aboutStatRow}>
                <span className={styles.aboutStatLabel}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Founders
                </span>
                <span className={styles.aboutStatValue}>1</span>
              </div>
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
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${story.productUrl.replace(/^https?:\/\//, '').split('/')[0]}&sz=32`}
                      alt=""
                      width="16"
                      height="16"
                      style={{ borderRadius: '3px', flexShrink: 0 }}
                    />
                    <span>{story.productUrl.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ── CTA Widget ── */}
          <div className={styles.ctaWidget}>
            <h3>MRR Stories</h3>
            <p>Read 4,000+ case studies of successful founders.</p>
            <Link href="/" className={styles.ctaButton}>See more Case Studies</Link>
          </div>
        </aside>
      </main>
    </>
  );
}
