'use client';

import { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStory } from '../../../actions';
import { ThemeToggle } from '../../../../components/ThemeToggle';
import RichTextEditor from '../../../../components/RichTextEditor';
import ImageUploader from '../../../../components/ImageUploader';
import styles from '../../../Dashboard.module.css';
import { countries } from '@/lib/countries';

/** Strip common markdown syntax from pasted text so plain inputs show clean text. */
function handlePlainTextPaste(e: React.ClipboardEvent<HTMLInputElement>) {
  const raw = e.clipboardData.getData('text/plain');
  if (!raw) return;
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
  if (clean === raw) return;
  e.preventDefault();
  const input = e.currentTarget;
  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? 0;
  const current = input.value;
  const next = current.slice(0, start) + clean + current.slice(end);
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  nativeInputValueSetter?.call(input, next);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.setSelectionRange(start + clean.length, start + clean.length);
}

interface EditStoryFormProps {
  story: any;
}

export default function EditStoryForm({ story }: EditStoryFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const clientAction = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateStory(story.id, formData);
        alert('Story updated successfully!');
        router.push('/dashboard/stories');
      } catch (error: any) {
        alert(error.message || 'Failed to update story');
      }
    });
  };

  return (
    <form ref={formRef} action={clientAction} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <div>
          <p className={styles.topbarTitle}>Edit Story</p>
          <p className={styles.topbarSub}>Editing: {story.title}</p>
        </div>
        <div className={styles.actionArea}>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Split pane ── */}
      <div className={styles.splitPane}>

        {/* ── Left: Editor ── */}
        <div className={styles.editorPane}>
          {/* Story Title */}
          <div className={styles.storyTitleWrap}>
            <span className={styles.storyTitleLabel}>Story Title</span>
            <input
              type="text"
              name="title"
              required
              defaultValue={story.title}
              placeholder="e.g. My AI App Makes $100K/Month"
              className={styles.titleInput}
              onPaste={handlePlainTextPaste}
              autoFocus
            />
          </div>

          {/* Rich Text Editor */}
          <div className={styles.editorWrap}>
            <span className={styles.editorLabel}>Story Content</span>
            <RichTextEditor
              name="content"
              defaultValue={story.content}
              placeholder="Who are you and what business did you start?..."
            />
          </div>
        </div>

        {/* ── Right: Properties panel ── */}
        <aside className={styles.propertiesPanel}>
          <div className={styles.propertiesHeader}>
            <p className={styles.propertiesHeaderTitle}>Story Details</p>
          </div>

          <div className={styles.propertiesBody}>

            {/* Business Name */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Business Name *</label>
              <input
                type="text"
                name="businessName"
                defaultValue={story.businessName}
                required
                placeholder="LeadFlow"
                className={styles.input}
                onPaste={handlePlainTextPaste}
              />
            </div>

            {/* Founder */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Founder Name *</label>
              <div className={styles.propRow}>
                <input
                  type="text"
                  name="founderName"
                  defaultValue={story.founderName}
                  required
                  placeholder="Adrian Berisha"
                  className={styles.input}
                  onPaste={handlePlainTextPaste}
                />
                <select name="founderType" defaultValue={story.founderType || 'Founder'} className={`${styles.input} ${styles.founderSelect}`}>
                  <option value="Founder">Founder</option>
                  <option value="Co-Founder">Co-Founder</option>
                </select>
              </div>
            </div>

            {/* Revenue */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Revenue / Month *</label>
              <input
                type="text"
                name="revenue"
                defaultValue={story.revenue}
                required
                placeholder="$100K"
                className={styles.input}
                onPaste={handlePlainTextPaste}
              />
            </div>

            {/* Profile Image */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Profile Image</label>
              <ImageUploader name="profileImageUrl" defaultValue={story.profileImageUrl || ''} />
            </div>

            {/* Twitter */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Twitter / Social URL</label>
              <input
                type="url"
                name="twitterUrl"
                defaultValue={story.twitterUrl || ''}
                placeholder="https://x.com/username"
                className={styles.input}
                onPaste={handlePlainTextPaste}
              />
            </div>

            {/* Product URL */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Product URL</label>
              <input
                type="url"
                name="productUrl"
                defaultValue={story.productUrl || ''}
                placeholder="https://yourbusiness.com"
                className={styles.input}
                onPaste={handlePlainTextPaste}
              />
            </div>

            {/* Paying Customers */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Paying Customers</label>
              <input
                type="text"
                name="customers"
                defaultValue={story.customers || ''}
                placeholder="e.g. 40 paying customers"
                className={styles.input}
                onPaste={handlePlainTextPaste}
              />
            </div>

            {/* Niche */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Niche / Market</label>
              <input
                type="text"
                name="niche"
                defaultValue={story.niche || ''}
                placeholder="e.g. AI Marketing Automation for Reddit"
                className={styles.input}
                onPaste={handlePlainTextPaste}
              />
            </div>

            {/* Location */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Location</label>
              <select name="location" defaultValue={story.location || ''} className={styles.input}>
                <option value="">Select a location</option>
                {countries.map((country) => (
                  <option key={country.code || country.name} value={country.name}>
                    {country.name} {country.flag}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </aside>
      </div>
    </form>
  );
}
