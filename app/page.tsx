import styles from './Story.module.css';
import Link from 'next/link';
import { db } from '../db';
import { storiesTable } from '../db/schema';
import { desc } from 'drizzle-orm';
import { ThemeToggle } from './components/ThemeToggle';
import NewsletterForm from './components/NewsletterForm';

export const dynamic = 'force-dynamic';

const FEATURED_COUNT = 4;

export default async function Feed() {
  const allStories = await db.select().from(storiesTable).orderBy(desc(storiesTable.createdAt));
  const featured = allStories.slice(0, FEATURED_COUNT);

  return (
    <>
      {/* ── Trust Bar ── */}
      <div className={styles.trustBar}>
        <span><span className={styles.trustCheck}>✓</span> {allStories.length > 0 ? `${allStories.length}+` : '100+'} founder stories & interviews</span>
        <span><span className={styles.trustStars}>★★★★★</span> From $1 to $10K — every win featured</span>
        <span><span className={styles.trustCheck}>✓</span> Real products. Real revenue. Real people.</span>
      </div>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logoArea}>
            <div className={styles.logoIcon}>M</div>
            <span>MRR Stories</span>
          </Link>
          <nav className={styles.navLinks}>
            <Link href="/stories">Case Studies</Link>
            <Link href="#">Newsletter</Link>
            <Link href="#">Ideas</Link>
          </nav>
          <div className={styles.navActions}>
            <ThemeToggle />
            <Link href="/sign-in" className={styles.loginBtn}>Login</Link>
            <Link href="/dashboard" className={styles.submitBtn}>Write a Story</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className={styles.heroWrapper}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>How indie hackers made their <span style={{color:'#22c55e'}}>first dollar</span> and what happened next</h1>
            <p className={styles.heroSub}>Every week we interview solopreneurs & indie builders who got paid for the first time. Their product, their journey, their exact numbers — no fluff, no hype.</p>
            <NewsletterForm 
              formClassName={styles.heroForm}
              inputClassName={styles.heroInput}
              btnClassName={styles.heroBtn}
              placeholder="Get new stories in your inbox"
              buttonText="Subscribe Free"
            />
            <div className={styles.heroPoof}>
              <div className={styles.avatarRow}>
                {['Alex','Sam','Jordan','Chris','Dana','Morgan','Taylor','Casey'].map(name => (
                  <img key={name} src={`https://ui-avatars.com/api/?name=${name}&background=random&color=fff`} alt={name} />
                ))}
              </div>
              <span>Join builders sharing their first wins</span>
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroPhoneMock}>
              <div className={styles.phoneScreen}>
                <div className={styles.phoneAppBar}>
                  <div className={styles.phoneAppDot} />
                  <span>MRR Stories</span>
                </div>
                <div className={styles.phoneCard}>
                  <div className={styles.phoneTrend}>🔥 FEATURED THIS WEEK</div>
                  <div className={styles.phoneCardTitle}>How I Made My First $47 Selling a Notion Template</div>
                  <div className={styles.phoneCardSub}>A 22-year-old's story of going from 0 to first customer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.heroClip} />
      </div>

      {/* ── Case Study Feed ── */}
      <main className={styles.feedSection}>
        <h2 className={styles.feedTitle}>
          Real founders. Real products. From <span className={styles.underlineZero}>first dollar</span> to <span className={styles.underlineMill}>growing business</span>:
        </h2>

        {featured.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No case studies published yet.</h3>
            <p>Head over to the dashboard to publish your first story.</p>
            <Link href="/dashboard" className={styles.emptyBtn}>Go to Dashboard →</Link>
          </div>
        ) : (
          <div className={styles.caseGrid}>
            {featured.map((story) => (
              <Link href={`/stories/${story.slug}`} key={story.id} className={styles.caseCard}>
                <div className={styles.caseCardImg} style={{ backgroundImage: `url(${story.heroImageUrl || ''})` }}>
                  <span className={styles.revenueBadge}>{story.revenue}/mo</span>
                </div>
                <div className={styles.caseCardBody}>
                  <span className={styles.caseStudyTag}>founder story</span>
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

        {allStories.length > FEATURED_COUNT && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <Link href="/stories" className={styles.emptyBtn}>
              View All {allStories.length} Stories →
            </Link>
          </div>
        )}
      </main>

      {/* ── Bottom CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaAvatars}>
          {['Alex','Sam','Jordan','Chris','Dana','Morgan','Taylor','Casey','Pat','Jamie'].map(name => (
            <img key={name} src={`https://ui-avatars.com/api/?name=${name}&background=random&color=fff`} alt={name} />
          ))}
        </div>
        <h2 className={styles.ctaTitle}>
          Made your first dollar? <span className={styles.ctaUnderline}>We want to feature you.</span>
        </h2>
        <p style={{color:'rgba(255,255,255,0.65)', fontSize:'1rem', marginBottom:'28px', maxWidth:'520px', margin:'0 auto 28px', lineHeight:1.7}}>
          It doesn't matter if it's $1, $50, $500, or $5,000 — if you got paid for something you built, your story belongs here. Drop your email and we'll reach out.
        </p>
        <NewsletterForm 
          formClassName={styles.ctaForm}
          inputClassName={styles.ctaInput}
          btnClassName={styles.ctaBtn}
          placeholder="Your email — we'll reach out"
          buttonText="Share My Story"
        />
      </section>

      {/* ── Footer ── */}
      <footer className={styles.siteFooter}>
        <div className={styles.siteFooterInner}>
          <Link href="/" className={styles.footerLogo}>
            <div className={styles.logoIcon}>M</div>
            <span>MRR Stories</span>
          </Link>
          <nav className={styles.footerNav}>
            <Link href="#">About</Link>
            <Link href="#">Support</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Terms of Use</Link>
            <span>𝕏</span>
            <span>▶</span>
          </nav>
        </div>
      </footer>
    </>
  );
}
