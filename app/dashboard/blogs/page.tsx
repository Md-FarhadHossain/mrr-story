import Link from 'next/link';
import { db } from '../../../db';
import { blogsTable } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import styles from '../Dashboard.module.css';
import pageStyles from '../stories/StoriesPage.module.css';
import { ThemeToggle } from '../../components/ThemeToggle';
import BlogActions from './BlogActions';
import { BookOpen, Edit3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardBlogs() {
  const blogs = await db.select().from(blogsTable).orderBy(desc(blogsTable.createdAt));

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <h1 className={styles.topbarTitle}>My Blogs</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {blogs.length} {blogs.length === 1 ? 'blog' : 'blogs'} published
          </p>
        </div>
        <div className={styles.actionArea}>
          <ThemeToggle />
          <Link href="/dashboard/blogs/new" className={pageStyles.newStoryBtn}>
            <Edit3 size={15} />
            Write New Blog
          </Link>
        </div>
      </header>

      <div className={styles.editorContainer}>
        {blogs.length === 0 ? (
          <div className={pageStyles.emptyState}>
            <div className={pageStyles.emptyIcon}><BookOpen size={40} /></div>
            <h3>No blogs yet</h3>
            <p>Share your thoughts and ideas to attract customers.</p>
            <Link href="/dashboard/blogs/new" className={pageStyles.newStoryBtn}>
              <Edit3 size={15} /> Write your first blog
            </Link>
          </div>
        ) : (
          <div className={pageStyles.storyList}>
            {blogs.map((blog, index) => (
              <div key={blog.id} className={pageStyles.storyCard}>
                <div className={pageStyles.storyIndex}>{String(index + 1).padStart(2, '0')}</div>
                <div className={pageStyles.storyInfo}>
                  <h3 className={pageStyles.storyTitle}>
                    {blog.title}
                    {blog.isDraft && <span style={{ marginLeft: '8px', fontSize: '0.7rem', backgroundColor: '#fbbf24', color: '#78350f', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Draft</span>}
                  </h3>
                  <div className={pageStyles.storyMeta}>
                    <span className={pageStyles.date}>
                      {blog.createdAt
                        ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className={pageStyles.storyActions}>
                  <BlogActions id={blog.id} slug={blog.slug} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
