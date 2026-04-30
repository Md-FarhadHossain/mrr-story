'use client';

import { useRef, useTransition, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { saveStory } from './actions';
import { ThemeToggle } from '../components/ThemeToggle';
import RichTextEditor from '../components/RichTextEditor';
import { useSession } from '@/lib/auth-client';
import SignOutButton from './SignOutButton';
import { useRouter } from 'next/navigation';
import { countries } from '@/lib/countries';

export default function Dashboard() {
  const { data: session, isPending: isSessionPending } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/admin');
    }
  }, [session, isSessionPending, router]);

  if (isSessionPending) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) return null;

  const clientAction = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await saveStory(formData);
        alert('Story saved successfully to database!');
        formRef.current?.reset();
      } catch (error: any) {
        alert(error.message || 'Failed to save story');
      }
    });
  };

  return (
    <form ref={formRef} action={clientAction}>
      <header className={styles.topbar}>
        <div>
          <h1 className={styles.topbarTitle}>New Story</h1>
          <p className="text-sm text-[var(--text-secondary)]">Welcome back, {session.user.name}</p>
        </div>
        <div className={styles.actionArea}>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Publishing...' : 'Publish Story'}
          </button>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>

      <div className={styles.editorContainer}>
        <div className={styles.card}>
          <div className={styles.formGroup}>
            <label>Story Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. My AI App Makes $100K/Month"
              className={`${styles.input} ${styles.titleInput}`}
            />
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Business Name</label>
              <input type="text" name="businessName" required placeholder="LeadFlow" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Founder Name</label>
              <input type="text" name="founderName" required placeholder="Adrian Berisha" className={styles.input} />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Revenue / Month</label>
              <input type="text" name="revenue" required placeholder="$100K" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Profile Image URL (Optional)</label>
              <input type="url" name="profileImageUrl" placeholder="https://example.com/photo.jpg" className={styles.input} />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Twitter / Social URL (Optional)</label>
              <input type="url" name="twitterUrl" placeholder="https://x.com/username" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Product URL (Optional)</label>
              <input type="url" name="productUrl" placeholder="https://yourbusiness.com" className={styles.input} />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Paying Customers (Optional)</label>
              <input type="text" name="customers" placeholder="e.g. 40 paying customers" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Niche / Market (Optional)</label>
              <input type="text" name="niche" placeholder="e.g. AI Marketing Automation for Reddit" className={styles.input} />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Location (Optional)</label>
              <select name="location" className={styles.input}>
                <option value="">Select a location</option>
                {countries.map((country) => (
                  <option key={country.code || country.name} value={country.name}>
                    {country.name} {country.flag}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup} />
          </div>

          <div className={styles.formGroup}>
            <label>Story Content</label>
            <RichTextEditor
              name="content"
              placeholder="Who are you and what business did you start?..."
            />
          </div>
        </div>
      </div>
    </form>
  );
}

