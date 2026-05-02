'use client';

import { useRef, useTransition, useEffect, useState } from 'react';
import styles from '../../../Dashboard.module.css';
import { updateBlog } from '../../../blogActions';
import { ThemeToggle } from '../../../../components/ThemeToggle';
import RichTextEditor from '../../../../components/RichTextEditor';
import { useSession } from '@/lib/auth-client';
import SignOutButton from '../../../SignOutButton';
import { useRouter } from 'next/navigation';

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
      fontSize: '0.78rem',
      fontWeight: 500,
      color: isOver ? '#ef4444' : isClose ? '#f59e0b' : 'var(--text-secondary)',
      transition: 'color 0.2s',
    }}>
      {count}/{limit} {isOver ? '⚠ Over limit' : ''}
    </span>
  );
}

export default function EditBlogForm({ blog }: { blog: any }) {
  const { data: session, isPending: isSessionPending } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [title, setTitle] = useState(blog.title || '');
  const [description, setDescription] = useState(blog.description || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    blog.tags ? blog.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
  );
  const [slugPreview, setSlugPreview] = useState(blog.slug || '');
  const [customSlug, setCustomSlug] = useState(blog.slug || '');

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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) return null;

  const clientAction = async (formData: FormData) => {
    // Inject tags as comma-separated string
    formData.set('tags', selectedTags.join(','));
    startTransition(async () => {
      try {
        await updateBlog(blog.id, formData);
        alert('Blog updated successfully!');
        router.push('/dashboard/blogs');
      } catch (error: any) {
        alert(error.message || 'Failed to update blog');
      }
    });
  };

  return (
    <form ref={formRef} action={clientAction}>
      <input type="hidden" name="tags" value={selectedTags.join(',')} />
      <header className={styles.topbar}>
        <div>
          <h1 className={styles.topbarTitle}>Edit Blog Post</h1>
          <p className="text-sm text-[var(--text-secondary)]">Update your insights</p>
        </div>
        <div className={styles.actionArea}>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>

      <div className={styles.editorContainer}>
        <div className={styles.card}>

          {/* ── SEO Section Header ── */}
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              🎯 SEO Settings
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Fill in these fields carefully — they directly impact how Google ranks this post.
            </p>
          </div>

          {/* ── Blog Title + Character Counter ── */}
          <div className={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ margin: 0 }}>Blog Title <span style={{ color: '#ef4444' }}>*</span></label>
              <CharCounter value={title} limit={TITLE_LIMIT} />
            </div>
            <input
              type="text"
              name="title"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 10 Proven Ways to Increase Your SaaS MRR"
              className={`${styles.input} ${styles.titleInput}`}
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              This will be the &lt;h1&gt; on the page. Keep it under 60 characters for Google.
            </p>
          </div>

          {/* ── URL Slug ── */}
          <div className={styles.formGroup}>
            <label>URL Slug <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>(auto-generated if left empty)</span></label>
            <input
              type="text"
              name="slug"
              value={customSlug}
              onChange={e => setCustomSlug(e.target.value)}
              placeholder="e.g. increase-mrr-10-ways"
              className={styles.input}
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Preview: <strong style={{ color: '#6366f1' }}>mrrstory.com/blog/{slugPreview || '...'}</strong>
            </p>
          </div>

          {/* ── Focus Keyword ── */}
          <div className={styles.formGroup}>
            <label>Focus Keyword <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>(Optional)</span></label>
            <input
              type="text"
              name="focusKeyword"
              defaultValue={blog.focusKeyword || ''}
              placeholder="e.g. increase MRR, SaaS revenue growth"
              className={styles.input}
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Keep this in mind as you write — use it naturally in your title, description, and content.
            </p>
          </div>

          {/* ── SEO Description + Character Counter ── */}
          <div className={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ margin: 0 }}>SEO Description <span style={{ color: '#ef4444' }}>*</span></label>
              <CharCounter value={description} limit={DESC_LIMIT} />
            </div>
            <textarea
              name="description"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Write a compelling hook under 160 characters containing your focus keyword..."
              className={styles.input}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* ── Categories / Tags ── */}
          <div className={styles.formGroup}>
            <label>Categories / Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
              {BLOG_CATEGORIES.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '20px',
                    border: selectedTags.includes(tag) ? '2px solid #6366f1' : '1px solid var(--border-color)',
                    background: selectedTags.includes(tag) ? 'rgba(99,102,241,0.12)' : 'transparent',
                    color: selectedTags.includes(tag) ? '#6366f1' : 'var(--text-secondary)',
                    fontWeight: selectedTags.includes(tag) ? 600 : 400,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Selected: {selectedTags.join(', ')}
              </p>
            )}
          </div>

          {/* ── Cover Image ── */}
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Cover Image URL <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>(Optional)</span></label>
              <input
                type="url"
                name="coverImageUrl"
                defaultValue={blog.coverImageUrl || ''}
                placeholder="https://example.com/cover.jpg"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Cover Image Alt Text <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>(Optional)</span></label>
              <input
                type="text"
                name="coverImageAlt"
                defaultValue={blog.coverImageAlt || ''}
                placeholder="e.g. Chart showing MRR growth over 12 months"
                className={styles.input}
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Describe the image using your focus keyword for SEO.
              </p>
            </div>
          </div>

          {/* ── Content Section Header ── */}
          <div style={{ margin: '24px 0 16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              ✍️ Blog Content
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Use H2 and H3 for headings — never H1 (the blog title is already the H1). Use the Code Block button for code snippets.
            </p>
          </div>

          {/* ── Blog Content ── */}
          <div className={styles.formGroup}>
            <RichTextEditor
              name="content"
              defaultValue={blog.content}
              placeholder="Write your blog post here... Use H2/H3 for sections, and Code Block for code snippets."
            />
          </div>

        </div>
      </div>
    </form>
  );
}
