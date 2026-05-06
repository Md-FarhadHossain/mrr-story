import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import NewsletterForm from '../../components/NewsletterForm';
import styles from './about.module.css';
import type { Metadata } from 'next';
import { Target, TrendingUp, Users, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About | MRR Story',
  description: 'Stop staring at revenue dashboards. Start stealing the blueprints. The raw case studies of the manual tactics founders used to get off the ground.',
  alternates: {
    canonical: 'https://www.mrrstory.com/about',
  },
  openGraph: {
    title: 'About | MRR Story',
    description: 'Stop staring at revenue dashboards. Start stealing the blueprints. The raw case studies of the manual tactics founders used to get off the ground.',
    url: 'https://www.mrrstory.com/about',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.main}>
        {/* ── Hero Section ── */}
        <header className={styles.hero}>
          <div className={styles.heroGlow}></div>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>The Origin Story</p>
            <h1 className={styles.headline}>
              Stop staring at <span className={styles.headlineAccent}>revenue dashboards.</span><br />
              Start stealing the blueprints.
            </h1>
            <p className={styles.heroSub}>
              We document the unscalable, messy reality of how founders cross the $0 to $1 gap.
            </p>
          </div>
        </header>

        {/* ── The Problem Section ── */}
        <section className={styles.problemSection}>
          <div className={styles.problemCard}>
            <div className={styles.quoteIcon}>"</div>
            <p className={styles.para}>
              If you spend more than five minutes in the indie hacker space, you will see it.
            </p>
            <p className={styles.para}>
              The <strong className={styles.highlight}>$10,000 MRR Stripe screenshot</strong>. The "just keep shipping" platitudes. 
              The endless flexes of the finish line with absolutely <strong className={styles.highlight}>zero context on how the race was actually run.</strong>
            </p>
            <p className={styles.paraLarge}>
              It drove me completely insane.
            </p>
          </div>
        </section>

        {/* ── The Solution Section ── */}
        <section className={styles.solutionSection}>
          <div className={styles.solutionText}>
            <p className={styles.para}>
              It is <strong>rarely glamorous</strong>. It is almost never a "viral launch."
            </p>
            <p className={styles.para}>
              When I looked at the SaaS and indie hacker community, I realized everyone was starving for the actual, 
              messy reality of how to cross the <strong>$0 to $1 gap</strong> — but nobody was sharing it.
            </p>
            <blockquote className={styles.pullQuote}>
              So, I built MRR Story to document the dirt.
            </blockquote>
            <p className={styles.para}>
              I don't care about a founder's profit margins on day 400. <strong>I care about day 1 to day 30.</strong>
            </p>
            <p className={styles.para}>
              I track down profitable solo founders and force them to pull back the curtain on the unscalable, 
              embarrassing, and highly manual things they had to do to get their first paying user.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><Users size={24} /></div>
              <h3>Cold Outreach</h3>
              <p>The exact 30 awkward cold DMs they sent to land their first beta users.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><Zap size={24} /></div>
              <h3>Manual Hustle</h3>
              <p>The 3 hours of free consulting they gave away just to secure one subscriber.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><Target size={24} /></div>
              <h3>Failed Attempts</h3>
              <p>The early landing pages that completely bombed and why they failed.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><TrendingUp size={24} /></div>
              <h3>Winning Pivots</h3>
              <p>The exact micro-pivots and pricing changes that finally made the offer convert.</p>
            </div>
          </div>
        </section>

        {/* ── Bottom Statement ── */}
        <section className={styles.bottomStatement}>
          <h2 className={styles.bottomTitle}>No highlight reels. No fake hustle culture.</h2>
          <p className={styles.bottomSub}>
            Just the raw case studies of the manual blueprints founders used to get off the ground.
            If you are tired of survivor bias and just want the exact, unscalable frameworks that actually print MRR — <strong>you are in the right place.</strong>
          </p>
          <div className={styles.dividerCenter} />
          <p className={styles.signoff}>I document a new story every single week.</p>
        </section>

        {/* ── Hard CTA ── */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaGlow}></div>
          <div className={styles.ctaContent}>
            <p className={styles.ctaLabel}>GET THE BLUEPRINTS</p>
            <h2 className={styles.ctaTitle}>
              One story. Every Tuesday. Real numbers.
            </h2>
            <p className={styles.ctaSub}>
              No Stripe flex. No hustle porn. Just the unscalable, manual tactics founders used to get their first paying customer — delivered to your inbox weekly.
            </p>
            <NewsletterForm
              formClassName={styles.ctaForm}
              inputClassName={styles.ctaInput}
              btnClassName={styles.ctaBtn}
              placeholder="Your email address"
              buttonText="Send Me The Blueprints →"
            />
            <p className={styles.ctaNote}>Free. Unsubscribe anytime. No spam.</p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
