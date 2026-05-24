import Link from 'next/link';
import { db } from '../../../db';
import { storiesTable } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import styles from '../Dashboard.module.css';
import pageStyles from './StoriesPage.module.css';
import { ThemeToggle } from '../../components/ThemeToggle';
import StoryActions from './StoryActions';
import { BookOpen, PenSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardStories() {
  const stories = await db.select().from(storiesTable).orderBy(desc(storiesTable.createdAt));

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <h1 className={styles.topbarTitle}>My Stories</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} published
          </p>
        </div>
        <div className={styles.actionArea}>
          <ThemeToggle />
          <Link href="/dashboard" className={pageStyles.newStoryBtn}>
            <PenSquare size={15} />
            Write New Story
          </Link>
        </div>
      </header>

      <div className={styles.editorContainer}>
        {stories.length === 0 ? (
          <div className={pageStyles.emptyState}>
            <div className={pageStyles.emptyIcon}><BookOpen size={40} /></div>
            <h3>No stories yet</h3>
            <p>Share your founder journey and inspire others.</p>
            <Link href="/dashboard" className={pageStyles.newStoryBtn}>
              <PenSquare size={15} /> Write your first story
            </Link>
          </div>
        ) : (
          <div className={pageStyles.storyList}>
            {stories.map((story, index) => (
              <div key={story.id} className={pageStyles.storyCard}>
                <div className={pageStyles.storyIndex}>{String(index + 1).padStart(2, '0')}</div>
                <div className={pageStyles.storyInfo}>
                  <h3 className={pageStyles.storyTitle}>
                    {story.title}
                    {story.isDraft && <span style={{ marginLeft: '8px', fontSize: '0.7rem', backgroundColor: '#fbbf24', color: '#78350f', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Draft</span>}
                  </h3>
                  <div className={pageStyles.storyMeta}>
                    <span className={pageStyles.businessTag}>{story.businessName}</span>
                    <span className={pageStyles.dot} />
                    <span className={pageStyles.date}>
                      {story.createdAt
                        ? new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className={pageStyles.storyActions}>
                  <StoryActions id={story.id} slug={story.slug} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

