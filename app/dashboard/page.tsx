'use client';

import { useRef, useTransition, useEffect, useState, useCallback } from 'react';
import styles from './Dashboard.module.css';
import { saveStory } from './actions';
import { ThemeToggle } from '../components/ThemeToggle';
import RichTextEditor from '../components/RichTextEditor';
import ImageUploader from '../components/ImageUploader';
import { useSession } from '@/lib/auth-client';
import SignOutButton from './SignOutButton';
import { useRouter } from 'next/navigation';
import { countries } from '@/lib/countries';
import { toast } from 'react-hot-toast';

/** Strip common markdown syntax from pasted text so plain inputs show clean text. */
function handlePlainTextPaste(e: React.ClipboardEvent<HTMLInputElement>) {
  const raw = e.clipboardData.getData('text/plain');
  if (!raw) return;
  const clean = raw
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
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

export default function Dashboard() {
  const { data: session, isPending: isSessionPending } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const AVAILABLE_TAGS = [
    { label: 'AI SaaS', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    { label: 'Reddit Growth', color: '#ff4500', bg: 'rgba(255, 69, 0, 0.1)' },
    { label: 'TikTok Marketing', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    { label: 'No-Code', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Solo Dev', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { label: 'Bootstrapped', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'B2B', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
    { label: 'B2C', color: '#84cc16', bg: 'rgba(132, 204, 22, 0.1)' },
  ];

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tagLabel: string) => {
    setSelectedTags(prev => 
      prev.includes(tagLabel)
        ? prev.filter(t => t !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  // FAQ state
  const [faqItems, setFaqItems] = useState<{ q: string; a: string }[]>([]);

  const addFaq = useCallback(() => {
    setFaqItems(prev => [...prev, { q: '', a: '' }]);
  }, []);

  const removeFaq = useCallback((index: number) => {
    setFaqItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateFaq = useCallback((index: number, field: 'q' | 'a', value: string) => {
    setFaqItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/admin');
    }
  }, [session, isSessionPending, router]);

  if (isSessionPending) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  if (!session) return null;

  const clientAction = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const newStoryId = await saveStory(formData);
        toast.success('Story saved successfully!');
        router.push(`/dashboard/stories/${newStoryId}/edit`);
      } catch (error: any) {
        toast.error(error.message || 'Failed to save story');
      }
    });
  };

  return (
    <form ref={formRef} action={clientAction} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <div>
          <p className={styles.topbarTitle}>New Story</p>
          <p className={styles.topbarSub}>Welcome back, {session.user.name}</p>
        </div>
        <div className={styles.actionArea}>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Publishing…' : 'Publish Story'}
          </button>
          <ThemeToggle />
          <SignOutButton />
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
              placeholder="Who are you and what business did you start?…"
            />
          </div>

          {/* ── FAQ Editor ── */}
          <div className={styles.faqEditorWrap}>
            <div className={styles.faqEditorHeader}>
              <div className={styles.faqEditorHeaderLeft}>
                <div className={styles.faqEditorIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div className={styles.faqEditorTitleGroup}>
                  <span className={styles.faqEditorTitle}>FAQ Section</span>
                  <span className={styles.faqEditorHint}>Shown at the bottom of the story as collapsible Q&amp;A — great for SEO.</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.faqAddBtn}
                onClick={addFaq}
                aria-label="Add FAQ item"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add FAQ
              </button>
            </div>

            {faqItems.length === 0 && (
              <div className={styles.faqEmptyState}>
                <div className={styles.faqEmptyStateIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <p className={styles.faqEmptyStateTitle}>No FAQ items yet</p>
                <p className={styles.faqEmptyStateSub}>Click <strong>+ Add FAQ</strong> to add your first question and answer. These help readers and boost SEO.</p>
              </div>
            )}

            <div className={styles.faqEditorList}>
              {faqItems.map((item, i) => (
                <div key={i} className={styles.faqEditorItem}>
                  <div className={styles.faqEditorItemNum}>Q{i + 1}</div>
                  <div className={styles.faqEditorFields}>
                    <div className={styles.faqFieldGroup}>
                      <label className={styles.faqEditorFieldLabel}>Question</label>
                      <textarea
                        className={styles.faqEditorInput}
                        placeholder="e.g. How did you get your first customer?"
                        value={item.q}
                        onChange={e => updateFaq(i, 'q', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className={styles.faqFieldGroup}>
                      <label className={styles.faqEditorFieldLabel}>Answer</label>
                      <textarea
                        className={`${styles.faqEditorInput} ${styles.faqEditorAnswer}`}
                        placeholder="Be specific and helpful — a detailed answer adds more SEO value."
                        value={item.a}
                        onChange={e => updateFaq(i, 'a', e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.faqRemoveBtn}
                    onClick={() => removeFaq(i)}
                    aria-label="Remove FAQ item"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Serialize FAQ as JSON for form submission */}
            <input type="hidden" name="faq" value={JSON.stringify(faqItems)} />
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
                  required
                  placeholder="Adrian Berisha"
                  className={styles.input}
                  onPaste={handlePlainTextPaste}
                />
                <select name="founderType" className={`${styles.input} ${styles.founderSelect}`}>
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
                required
                placeholder="$100K"
                className={styles.input}
                onPaste={handlePlainTextPaste}
              />
            </div>

            {/* Profile Image */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Profile Image</label>
              <ImageUploader name="profileImageUrl" />
            </div>

            {/* Twitter */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Twitter / Social URL</label>
              <input
                type="url"
                name="twitterUrl"
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
                placeholder="e.g. AI Marketing Automation"
                className={styles.input}
                onPaste={handlePlainTextPaste}
              />
            </div>

            {/* Location */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Location</label>
              <select name="location" className={styles.input}>
                <option value="">Select a location</option>
                {countries.map((country) => (
                  <option key={country.code || country.name} value={country.name}>
                    {country.name} {country.flag}
                  </option>
                ))}
              </select>
            </div>

            {/* Started Year + Founder Age — side by side */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Started Year & Founder Age</label>
              <div className={styles.propRow}>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    name="startedYear"
                    placeholder="e.g. 2022"
                    min="2000"
                    max="2099"
                    className={styles.input}
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Year started</span>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    name="founderAge"
                    placeholder="e.g. 24"
                    min="16"
                    max="99"
                    className={styles.input}
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Founder age</span>
                </div>
              </div>
            </div>

            {/* Tags (Clickable Chips) */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Story Tags / Themes</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.label);
                  return (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => toggleTag(tag.label)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: isSelected ? '600' : '500',
                        color: isSelected ? tag.color : 'var(--text-secondary)',
                        backgroundColor: isSelected ? tag.bg : 'var(--bg-secondary)',
                        border: `1px solid ${isSelected ? tag.color : 'var(--border-color)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="tags" value={selectedTags.join(',')} />
            </div>

          </div>
        </aside>
      </div>
    </form>
  );
}
