import { Metadata } from 'next';
import Link from 'next/link';
import { db } from '../../db';
import { storiesTable } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { ThemeToggle } from '../components/ThemeToggle';
import Navbar from '../components/Navbar';
import NewsletterForm from '../components/NewsletterForm';
import Footer from '../components/Footer';
import styles from './newsletter.module.css';

export const metadata: Metadata = {
  title: 'Newsletter — Weekly Indie Hacker Stories',
  description:
    'Get real founder stories, revenue breakdowns, and first-dollar moments delivered to your inbox every week. No fluff, no hype — just honest numbers.',
};

export const revalidate = 60;

const PERKS = [
  { emoji: '💸', title: 'Real Revenue Numbers', desc: 'Exact MRR, ARR, and first-dollar breakdowns every issue.' },
  { emoji: '🛠️', title: 'Behind-the-Build', desc: "How founders built it — tech stack, tools, and what they'd do differently." },
  { emoji: '🌍', title: 'Global Founders', desc: 'Stories from 50+ countries. Different markets, same grind.' },
  { emoji: '🎯', title: 'First-Dollar Focus', desc: 'The exact moment everything clicked — and what came next.' },
  { emoji: '📈', title: 'Growth Tactics', desc: 'Channels, campaigns, and cold outreach scripts that actually worked.' },
  { emoji: '🚫', title: 'Zero Fluff Policy', desc: "If it's not useful to a builder, it doesn't make the cut." },
];

export default async function NewsletterPage() {
  const stories = await db
    .select()
    .from(storiesTable)
    .orderBy(desc(storiesTable.createdAt))
    .limit(6);

  return (
    <>
      {/* ── Header ── */}
      {/* ── Header ── */}
      <Navbar />

      <main className={styles.pageWrapper}>

        {/* ── Hero ── */}
        <section className={styles.hero}>
          {/* background blobs */}
          <div className={styles.blob1} />
          <div className={styles.blob2} />

          <div className={styles.heroInner}>
            <span className={styles.heroEyebrow}>📬 Weekly Newsletter</span>
            <h1 className={styles.heroTitle}>
              Every week, one founder.<br />
              One story. <span className={styles.heroAccent}>Real numbers.</span>
            </h1>
            <p className={styles.heroSub}>
              We interview indie hackers who just crossed a milestone — first dollar, first $1K, first $10K — and send you the raw, unfiltered breakdown straight to your inbox.
            </p>

            {/* ── Subscribe Box ── */}
            <div className={styles.subscribeCard}>
              <div className={styles.subscribeCardHeader}>
                <div className={styles.subscribeAvatars}>
                  {stories.filter(s => s.profileImageUrl).slice(0, 6).map(story => (
                    <img
                      key={story.id}
                      src={story.profileImageUrl!}
                      alt={story.founderName}
                    />
                  ))}
                </div>
                <p className={styles.subscriberCount}>
                  <strong>2,400+</strong> founders already subscribed
                </p>
              </div>

              <NewsletterForm
                formClassName={styles.subscribeForm}
                inputClassName={styles.subscribeInput}
                btnClassName={styles.subscribeBtn}
                placeholder="Enter your email address"
                buttonText="Get the stories →"
              />

              <p className={styles.subscribeNote}>
                📅 Every Tuesday morning · No spam · Unsubscribe anytime
              </p>
            </div>
          </div>
        </section>

        {/* ── Perks / What You Get ── */}
        <section className={styles.perksSection}>
          <div className={styles.perksInner}>
            <div className={styles.sectionLabel}>WHAT'S INSIDE EVERY ISSUE</div>
            <h2 className={styles.sectionTitle}>Built for builders. Sent for doers.</h2>
            <div className={styles.perksGrid}>
              {PERKS.map(p => (
                <div key={p.title} className={styles.perkCard}>
                  <span className={styles.perkEmoji}>{p.emoji}</span>
                  <h3 className={styles.perkTitle}>{p.title}</h3>
                  <p className={styles.perkDesc}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Recent Stories ── */}
        {stories.length > 0 && (
          <section className={styles.storiesSection}>
            <div className={styles.storiesInner}>
              <div className={styles.sectionLabel}>FROM PAST ISSUES</div>
              <h2 className={styles.sectionTitle}>Stories you'll find in the newsletter</h2>
              <div className={styles.storiesGrid}>
                {stories.map(story => (
                  <Link href={`/stories/${story.slug}`} key={story.id} className={styles.storyCard}>
                    <div
                      className={styles.storyCardThumb}
                      style={{
                        backgroundImage: story.profileImageUrl
                          ? `url(${story.profileImageUrl})`
                          : story.heroImageUrl
                          ? `url(${story.heroImageUrl})`
                          : undefined,
                      }}
                    >
                      {!story.profileImageUrl && !story.heroImageUrl && (
                        <span className={styles.storyCardInitial}>
                          {story.founderName.charAt(0)}
                        </span>
                      )}
                      <div className={styles.storyRevenuePill}>{story.revenue}/mo</div>
                    </div>
                    <div className={styles.storyCardBody}>
                      <span className={styles.storyTag}>founder story</span>
                      <h3 className={styles.storyCardTitle}>{story.title}</h3>
                      <p className={styles.storyCardFounder}>by {story.founderName}</p>
                    </div>
                    <div className={styles.storyCardArrow}>→</div>
                  </Link>
                ))}
              </div>
              <div className={styles.storiesMore}>
                <Link href="/stories" className={styles.storiesMoreBtn}>
                  Read all {stories.length}+ stories →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Bottom CTA ── */}
        <section className={styles.bottomCta}>
          <div className={styles.bottomCtaInner}>
            <div className={styles.bottomCtaDecor}>✉️</div>
            <h2 className={styles.bottomCtaTitle}>Don't miss next Tuesday's story.</h2>
            <p className={styles.bottomCtaSub}>
              Drop your email below and we'll send you the next founder's story the moment it drops.
            </p>
            <NewsletterForm
              formClassName={styles.bottomCtaForm}
              inputClassName={styles.bottomCtaInput}
              btnClassName={styles.bottomCtaBtn}
              placeholder="your@email.com"
              buttonText="Subscribe free"
            />
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
