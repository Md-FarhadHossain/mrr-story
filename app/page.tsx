import styles from './Story.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '../db';
import { storiesTable } from '../db/schema';
import { desc } from 'drizzle-orm';
import { ThemeToggle } from './components/ThemeToggle';
import Navbar from './components/Navbar';
import NewsletterForm from './components/NewsletterForm';
import Footer from './components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "MRR Story - How Indie Hackers Made Their First Dollar",
  description: "Discover how indie hackers and solopreneurs made their first dollar and built profitable businesses. Real founders, real products, real revenue.",
  alternates: {
    canonical: 'https://www.mrrstory.com',
  },
  openGraph: {
    title: "MRR Story - How Indie Hackers Made Their First Dollar",
    description: "Discover how indie hackers and solopreneurs made their first dollar and built profitable businesses. Real founders, real products, real revenue.",
    url: 'https://www.mrrstory.com',
    type: 'website',
    images: [
      {
        url: 'https://www.mrrstory.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MRR Story - Indie Hacker & Solopreneur Success Stories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://www.mrrstory.com/og-image.png'],
  },
};

export const revalidate = 60;

const FEATURED_COUNT = 4;

const faqs = [
  {
    question: "What is MRR Story?",
    answer: "MRR Story is a collection of case studies from successful indie hackers and solopreneurs sharing exactly how they built their products and made their first dollars."
  },
  {
    question: "How do founders get featured?",
    answer: "If you've made your first dollar from a product you've built, simply drop your email in the form below or contact us directly. We review every submission."
  },
  {
    question: "Are the revenue numbers verified?",
    answer: "Yes, we work closely with founders to verify their revenue claims through Stripe dashboards or other payment processor screenshots before publishing their stories."
  },
  {
    question: "Is the newsletter really free?",
    answer: "Absolutely. We send out a curated digest of 4-7 founder stories, case studies, and growth hacks every Tuesday, completely free."
  }
];

export default async function Feed() {
  const allStories = await db.select().from(storiesTable).orderBy(desc(storiesTable.createdAt));
  const featured = allStories.slice(0, FEATURED_COUNT);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* ── Header ── */}
      {/* ── Header ── */}
      <Navbar />

      {/* ── Hero ── */}
      <div className={styles.heroWrapper}>
        <div className={styles.heroInner}>
          {/* Left: Headline + form + social proof */}
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>The exact <span style={{color:'#22c55e'}}>playbooks &amp; case studies</span> of successful indie hackers</h1>
            <p className={styles.heroSub}>Inside the Businesses Built by Indie Hackers &amp; SaaS Founders. Real case studies from solopreneurs who built profitable products with exact numbers and full breakdowns.</p>
            <NewsletterForm 
              formClassName={styles.heroForm}
              inputClassName={styles.heroInput}
              btnClassName={styles.heroBtn}
              placeholder="Your email here"
              buttonText="Subscribe (It's Free)"
            />
            <div className={styles.heroPoof}>
              <div className={styles.avatarRow}>
                {allStories.filter(s => s.profileImageUrl).slice(0, 7).map(story => (
                  <Image 
                    key={story.id} 
                    src={story.profileImageUrl!} 
                    alt={`Avatar of ${story.founderName}`} 
                    width={40}
                    height={40}
                  />
                ))}
              </div>
              <span className={styles.heroPoofText}>Join thousands of founders</span>
            </div>
          </div>

          {/* Right: Single-column infinite scrolling founder ticker */}
          <div className={styles.heroRight}>
            <div className={styles.founderTickerWrapper}>
              {/* Gradient fades at top and bottom */}
              <div className={styles.founderTickerFadeTop} />
              <div className={styles.founderTickerFadeBottom} />

              {/* Single Column — scrolls up */}
              <div className={styles.founderTickerTrackUp}>
                {[...allStories.filter(s => s.profileImageUrl), ...allStories.filter(s => s.profileImageUrl)].map((story, idx) => (
                  <div key={`up-${story.id}-${idx}`} className={styles.founderTickerCard}>
                    <Image
                      src={story.profileImageUrl!}
                      alt={story.founderName}
                      className={styles.founderTickerAvatar}
                      width={44}
                      height={44}
                    />
                    <div className={styles.founderTickerInfo}>
                      <span className={styles.founderTickerName}>{story.founderName}</span>
                      <span className={styles.founderTickerBiz}>{story.businessName}</span>
                    </div>
                    {story.revenue && (
                      <div className={styles.founderTickerRevenue}>
                        <span className={styles.mrrLabel}>MRR</span>
                        <span className={styles.mrrValue}>{story.revenue}</span>
                      </div>
                    )}
                  </div>
                ))}
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
                <div className={styles.caseCardImg} style={{ backgroundImage: `url(${story.profileImageUrl || story.heroImageUrl || ''})` }}>
                  <span className={styles.revenueBadge}>{story.revenue}/mo</span>
                </div>
                <div className={styles.caseCardBody}>
                  <span className={styles.caseStudyTag}>{story.tags ? story.tags.split(',')[0].trim().toLowerCase() : 'founder story'}</span>
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

      {/* ── FAQ Section ── */}
      <section className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          {faqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>{faq.question}</h3>
              <p className={styles.faqAnswer}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaAvatars}>
          {allStories.filter(s => s.profileImageUrl).slice(0, 10).map(story => (
            <Image 
              key={story.id} 
              src={story.profileImageUrl!} 
              alt={`Avatar of ${story.founderName}`} 
              width={48}
              height={48}
            />
          ))}
        </div>
        <h2 className={styles.ctaTitle}>
          Made your first dollar? <span className={styles.ctaUnderline}>We want to feature you.</span>
        </h2>
        <p className={styles.ctaSub}>
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
      <Footer />
    </>
  );
}
