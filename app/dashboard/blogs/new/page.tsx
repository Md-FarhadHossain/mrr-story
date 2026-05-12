'use client';

import { useRef, useTransition, useEffect, useState } from 'react';
import styles from '../../Dashboard.module.css';
import { saveBlog } from '../../blogActions';
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
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [slugPreview, setSlugPreview] = useState('');
  const [customSlug, setCustomSlug] = useState('');

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

  if (isSessionPending) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!session) return null;

  const clientAction = async (formData: FormData) => {
    formData.set('tags', selectedTags.join(','));
    startTransition(async () => {
      try {
        await saveBlog(formData);
        toast.success('Blog published successfully!');
        router.push('/dashboard/blogs');
      } catch (error: any) {
        toast.error(error.message || 'Failed to publish blog');
      }
    });
  };

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
