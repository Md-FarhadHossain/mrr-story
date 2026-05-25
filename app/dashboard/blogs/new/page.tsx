'use client';

import { useRef, useTransition, useEffect, useState, useCallback } from 'react';
import styles from '../../Dashboard.module.css';
import { saveBlog, saveBlogDraft, updateBlog } from '../../blogActions';
import { ThemeToggle } from '../../../components/ThemeToggle';
import RichTextEditor from '../../../components/RichTextEditor';
import ImageUploader from '../../../components/ImageUploader';
import { useSession } from '@/lib/auth-client';
import SignOutButton from '../../SignOutButton';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const BLOG_CATEGORIES = [
  'Marketing', 'Growth', 'Bootstrapping', 'SaaS', 'Product',
  'Revenue', 'SEO', 'Fundraising', 'Indie Hacking', 'Automation',
];

const TITLE_LIMIT = 60;
const DESC_LIMIT = 160;

function CharCounter({ value, limit }: { value: string; limit: number }) {
  const count = value.length;
  const isOver = count > limit;
  const isClose = count > limit * 0.85;
  return (
    <span style={{
      fontSize: '0.72rem',
      fontWeight: 600,
      color: isOver ? '#ef4444' : isClose ? '#f59e0b' : 'var(--text-secondary)',
      transition: 'color 0.2s',
      letterSpacing: '0.04em',
    }}>
      {count}/{limit} {isOver ? '⚠' : ''}
    </span>
  );
}

export default function NewBlog() {
  const { data: session, isPending: isSessionPending } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [slugPreview, setSlugPreview] = useState('');
  const [customSlug, setCustomSlug] = useState('');
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

  // Auto-generate slug preview from title when custom slug is empty
  useEffect(() => {
    if (!customSlug) {
      const auto = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlugPreview(auto);
    } else {
      setSlugPreview(customSlug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, ''));
    }
  }, [title, customSlug]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveDraft = async () => {
    if (!formRef.current) return;
    setIsDraftSaving(true);
    try {
      const formData = new FormData(formRef.current);
      formData.set('tags', selectedTags.join(','));
      const newDraftId = await saveBlogDraft(formData, draftId || undefined);
      if (!draftId) {
        setDraftId(newDraftId);
        window.history.replaceState(null, '', `/dashboard/blogs/${newDraftId}/edit`);
      }
      setLastSaved(new Date());
      toast.success('Draft saved');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsDraftSaving(false);
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
  }, [draftId, selectedTags]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!formRef.current) return;
      const formData = new FormData(formRef.current);
      formData.set('tags', selectedTags.join(','));
      if (formData.get('title')) {
        saveBlogDraft(formData, draftId || undefined).then(id => {
          if (!draftId) {
            setDraftId(id);
            window.history.replaceState(null, '', `/dashboard/blogs/${id}/edit`);
          }
          setLastSaved(new Date());
        }).catch(console.error);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [draftId, selectedTags]);

  const clientAction = async (formData: FormData) => {
    formData.set('tags', selectedTags.join(','));
    startTransition(async () => {
      try {
        if (draftId) {
          await updateBlog(draftId, formData);
        } else {
          await saveBlog(formData);
        }
        toast.success('Blog published successfully!');
        router.push('/dashboard/blogs');
      } catch (error: any) {
        toast.error(error.message || 'Failed to publish blog');
      }
    });
  };

  if (isSessionPending) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!session) return null;

  return (
    <form ref={formRef} action={clientAction} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <input type="hidden" name="tags" value={selectedTags.join(',')} />

      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <div>
          <p className={styles.topbarTitle}>New Blog Post</p>
          <p className={styles.topbarSub}>Share your insights with the world</p>
        </div>
        <div className={styles.actionArea}>
          {lastSaved && <span style={{fontSize: '12px', color: 'var(--text-secondary)'}}>Saved {lastSaved.toLocaleTimeString()}</span>}
          <button type="button" onClick={handleSaveDraft} disabled={isDraftSaving} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            {isDraftSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Publishing...' : 'Publish Blog'}
          </button>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>

      {/* ── Split pane ── */}
      <div className={styles.splitPane}>

        {/* ── Left: Editor ── */}
        <div className={styles.editorPane}>
          {/* Blog Title */}
          <div className={styles.storyTitleWrap}>
            <span className={styles.storyTitleLabel}>Blog Title</span>
            <input
              type="text"
              name="title"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 10 Proven Ways to Increase Your SaaS MRR"
              className={styles.titleInput}
              autoFocus
            />
          </div>

          {/* Rich Text Editor */}
          <div className={styles.editorWrap}>
            <span className={styles.editorLabel}>Blog Content</span>
            <RichTextEditor
              name="content"
              placeholder="Write your blog post here… Use H2/H3 for sections, and Code Block for code snippets."
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
                  <span className={styles.faqEditorHint}>Shown at the bottom of the blog as collapsible Q&amp;A — great for SEO.</span>
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
                        placeholder="e.g. How do I get started with this strategy?"
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
            <p className={styles.propertiesHeaderTitle}>SEO &amp; Metadata</p>
          </div>

          <div className={styles.propertiesBody}>

            {/* URL Slug */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>URL Slug <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.7rem' }}>(auto if empty)</span></label>
              <input
                type="text"
                name="slug"
                value={customSlug}
                onChange={e => setCustomSlug(e.target.value)}
                placeholder="increase-mrr-10-ways"
                className={styles.input}
              />
              {slugPreview && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '5px', wordBreak: 'break-all' }}>
                  /blog/<strong style={{ color: '#6366f1' }}>{slugPreview}</strong>
                </p>
              )}
            </div>

            {/* Focus Keyword */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Focus Keyword <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.7rem' }}>(optional)</span></label>
              <input
                type="text"
                name="focusKeyword"
                placeholder="e.g. SaaS revenue growth"
                className={styles.input}
              />
            </div>

            {/* Meta Keywords */}
            <div className={styles.propGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className={styles.propLabel} style={{ margin: 0 }}>Meta Keywords</label>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>optional</span>
              </div>
              <textarea
                name="metaKeywords"
                placeholder="e.g. SaaS growth, bootstrapping, indie hacking, MRR"
                className={styles.input}
                rows={3}
                style={{ resize: 'vertical' }}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px', lineHeight: 1.5 }}>
                Comma-separated keywords for the{' '}
                <code style={{ fontSize: '0.68rem', background: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: '3px' }}>&lt;meta name="keywords"&gt;</code>{' '}tag.
              </p>
            </div>

            {/* SEO Description */}
            <div className={styles.propGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className={styles.propLabel} style={{ margin: 0 }}>SEO Description *</label>
                <CharCounter value={description} limit={DESC_LIMIT} />
              </div>
              <textarea
                name="description"
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="A compelling hook under 160 chars with your focus keyword…"
                className={styles.input}
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Categories / Tags */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Categories / Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {BLOG_CATEGORIES.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '4px 11px',
                      borderRadius: '20px',
                      border: selectedTags.includes(tag) ? '2px solid #6366f1' : '1px solid var(--border-color)',
                      background: selectedTags.includes(tag) ? 'rgba(99,102,241,0.12)' : 'transparent',
                      color: selectedTags.includes(tag) ? '#6366f1' : 'var(--text-secondary)',
                      fontWeight: selectedTags.includes(tag) ? 600 : 400,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Cover Image</label>
              <ImageUploader name="coverImageUrl" defaultValue="" />
            </div>

            {/* Cover Image Alt */}
            <div className={styles.propGroup}>
              <label className={styles.propLabel}>Cover Image Alt</label>
              <input
                type="text"
                name="coverImageAlt"
                placeholder="Describe the image for SEO"
                className={styles.input}
              />
            </div>

          </div>
        </aside>
      </div>
    </form>
  );
}
