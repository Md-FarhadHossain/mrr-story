'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { deleteStory, unpublishStory, publishStory } from '../actions';
import { Pencil, Trash2, ExternalLink, EyeOff, Eye } from 'lucide-react';
import styles from './StoryActions.module.css';

interface StoryActionsProps {
  id: number;
  slug: string;
  isDraft?: boolean | null;
}

export default function StoryActions({ id, slug, isDraft }: StoryActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      startTransition(async () => {
        try {
          await deleteStory(id);
        } catch (error) {
          alert('Failed to delete story');
        }
      });
    }
  };

  const handleUnpublish = () => {
    if (window.confirm('Are you sure you want to unpublish this story? It will be moved to drafts.')) {
      startTransition(async () => {
        try {
          await unpublishStory(id);
        } catch (error) {
          alert('Failed to unpublish story');
        }
      });
    }
  };

  const handlePublish = () => {
    if (window.confirm('Are you sure you want to publish this story? It will be visible to everyone.')) {
      startTransition(async () => {
        try {
          await publishStory(id);
        } catch (error) {
          alert('Failed to publish story');
        }
      });
    }
  };

  return (
    <div className={styles.actions}>
      {isDraft && (
        <button
          onClick={handlePublish}
          disabled={isPending}
          className={styles.iconBtn}
          title="Publish story"
        >
          <Eye size={15} />
        </button>
      )}
      {!isDraft && (
        <button
          onClick={handleUnpublish}
          disabled={isPending}
          className={styles.iconBtn}
          title="Unpublish story"
        >
          <EyeOff size={15} />
        </button>
      )}
      <Link href={`/dashboard/stories/${id}/edit`} className={styles.iconBtn} title="Edit story">
        <Pencil size={15} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className={`${styles.iconBtn} ${styles.deleteBtn}`}
        title="Delete story"
      >
        <Trash2 size={15} />
      </button>
      <Link href={`/stories/${slug}`} className={`${styles.iconBtn} ${styles.viewBtn}`} title="View story" target="_blank">
        <ExternalLink size={15} />
      </Link>
    </div>
  );
}
