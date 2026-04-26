'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { deleteStory } from '../actions';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import styles from './StoryActions.module.css';

interface StoryActionsProps {
  id: number;
  slug: string;
}

export default function StoryActions({ id, slug }: StoryActionsProps) {
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

  return (
    <div className={styles.actions}>
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
