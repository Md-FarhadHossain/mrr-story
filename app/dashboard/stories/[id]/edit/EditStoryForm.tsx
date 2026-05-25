'use client';

import { useRef, useTransition, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateStory, saveStoryDraft, unpublishStory } from '../../../actions';
import { ThemeToggle } from '../../../../components/ThemeToggle';
import RichTextEditor from '../../../../components/RichTextEditor';
import ImageUploader from '../../../../components/ImageUploader';
import styles from '../../../Dashboard.module.css';
import { countries } from '@/lib/countries';
import { toast } from 'react-hot-toast';

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
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isDraftStatus, setIsDraftStatus] = useState(story.isDraft ?? true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const router = useRouter();

  // Define predefined themes for stories
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

  // Initialize selected tags from the story.tags string (comma separated)
  const initialTags = story.tags ? story.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

  const toggleTag = (tagLabel: string) => {
    setSelectedTags(prev => 
      prev.includes(tagLabel)
        ? prev.filter(t => t !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  // FAQ state — pre-populate from story.faq
  const initialFaq: { q: string; a: string }[] = (() => {
    try { return story.faq ? JSON.parse(story.faq) : []; }
    catch { return []; }
  })();
  const [faqItems, setFaqItems] = useState<{ q: string; a: string }[]>(initialFaq);

  const addFaq = useCallback(() => {
    setFaqItems(prev => [...prev, { q: '', a: '' }]);
  }, []);

  const removeFaq = useCallback((index: number) => {
    setFaqItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateFaq = useCallback((index: number, field: 'q' | 'a', value: string) => {
    setFaqItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  const handleSaveDraft = async () => {
    if (!formRef.current) return;
    setIsDraftSaving(true);
    try {
      const formData = new FormData(formRef.current);
      await saveStoryDraft(formData, story.id);
      setLastSaved(new Date());
      toast.success('Draft saved');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Are you sure you want to unpublish this story? It will be moved to drafts.')) return;
    setIsUnpublishing(true);
    try {
      await unpublishStory(story.id);
      setIsDraftStatus(true);
      toast.success('Story unpublished and moved to drafts');
    } catch (error) {
      toast.error('Failed to unpublish story');
    } finally {
      setIsUnpublishing(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!formRef.current) return;
      const formData = new FormData(formRef.current);
      if (formData.get('title')) {
        saveStoryDraft(formData, story.id)
          .then(() => setLastSaved(new Date()))
          .catch(console.error);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [story.id]);

  const clientAction = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateStory(story.id, formData);
        setIsDraftStatus(false);
        toast.success('Story updated successfully!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to update story');
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
          {lastSaved && <span style={{fontSize: '12px', color: 'var(--text-secondary)'}}>Saved {lastSaved.toLocaleTimeString()}</span>}
          <button type="button" onClick={handleSaveDraft} disabled={isDraftSaving || isUnpublishing} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            {isDraftSaving ? 'Saving...' : 'Save Draft'}
          </button>
          {!isDraftStatus && (
            <button type="button" onClick={handleUnpublish} disabled={isUnpublishing || isDraftSaving} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>
              {isUnpublishing ? 'Unpublishing...' : 'Unpublish'}
            </button>
          )}
          <button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Publish Changes'}
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

            {/* Number of Founders */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Number of Founders</label>
              <input
                type="number"
                name="numberOfFounders"
                defaultValue={story.numberOfFounders || 1}
                min="1"
                className={styles.input}
              />
            </div>

            {/* Number of Employees */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Number of Employees</label>
              <input
                type="number"
                name="numberOfEmployees"
                defaultValue={story.numberOfEmployees ?? 0}
                min="0"
                className={styles.input}
              />
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

            {/* Started Year + Founder Age — side by side */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Started Year & Founder Age</label>
              <div className={styles.propRow}>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    name="startedYear"
                    defaultValue={story.startedYear || ''}
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
                    defaultValue={story.founderAge || ''}
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
