'use client';

import { useRef, useTransition, useEffect } from 'react';

/** Strip common markdown syntax from pasted text so plain inputs show clean text. */
function handlePlainTextPaste(e: React.ClipboardEvent<HTMLInputElement>) {
  const raw = e.clipboardData.getData('text/plain');
  if (!raw) return;
  // Strip bold/italic/strikethrough/inline-code markers and heading hashes
  const clean = raw
    .replace(/^#{1,6}\s+/gm, '')        // headings
    .replace(/\*\*(.+?)\*\*/g, '$1')    // bold **text**
    .replace(/\*(.+?)\*/g, '$1')        // italic *text*
    .replace(/__(.+?)__/g, '$1')        // bold __text__
    .replace(/_(.+?)_/g, '$1')          // italic _text_
    .replace(/~~(.+?)~~/g, '$1')        // strikethrough ~~text~~
    .replace(/`(.+?)`/g, '$1')          // inline code `code`
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links [text](url)
    .trim();
  if (clean === raw) return; // nothing to strip, let browser handle it normally
  e.preventDefault();
  const input = e.currentTarget;
  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? 0;
  const current = input.value;
  const next = current.slice(0, start) + clean + current.slice(end);
  // Use native input setter so React's onChange fires correctly
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  nativeInputValueSetter?.call(input, next);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.setSelectionRange(start + clean.length, start + clean.length);
}
import styles from './Dashboard.module.css';
import { saveStory } from './actions';
import { ThemeToggle } from '../components/ThemeToggle';
import RichTextEditor from '../components/RichTextEditor';
import ImageUploader from '../components/ImageUploader';
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
              onPaste={handlePlainTextPaste}
            />
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Business Name</label>
              <input type="text" name="businessName" required placeholder="LeadFlow" className={styles.input} onPaste={handlePlainTextPaste} />
            </div>
            <div className={styles.formGroup}>
              <label>Founder Name</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" name="founderName" required placeholder="Adrian Berisha" className={styles.input} style={{ flex: 1 }} onPaste={handlePlainTextPaste} />
                <select name="founderType" className={styles.input} style={{ width: 'auto' }}>
                  <option value="Founder">Founder</option>
                  <option value="Co-Founder">Co-Founder</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Revenue / Month</label>
              <input type="text" name="revenue" required placeholder="$100K" className={styles.input} onPaste={handlePlainTextPaste} />
            </div>
            <div className={styles.formGroup}>
              <label>Profile Image (Optional)</label>
              <ImageUploader name="profileImageUrl" />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Twitter / Social URL (Optional)</label>
              <input type="url" name="twitterUrl" placeholder="https://x.com/username" className={styles.input} onPaste={handlePlainTextPaste} />
            </div>
            <div className={styles.formGroup}>
              <label>Product URL (Optional)</label>
              <input type="url" name="productUrl" placeholder="https://yourbusiness.com" className={styles.input} onPaste={handlePlainTextPaste} />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Paying Customers (Optional)</label>
              <input type="text" name="customers" placeholder="e.g. 40 paying customers" className={styles.input} onPaste={handlePlainTextPaste} />
            </div>
            <div className={styles.formGroup}>
              <label>Niche / Market (Optional)</label>
              <input type="text" name="niche" placeholder="e.g. AI Marketing Automation for Reddit" className={styles.input} onPaste={handlePlainTextPaste} />
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

