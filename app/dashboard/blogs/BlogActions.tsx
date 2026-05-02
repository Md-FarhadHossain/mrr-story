'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { deleteBlog } from '../blogActions';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import styles from '../stories/StoryActions.module.css';

interface BlogActionsProps {
  id: number;
  slug: string;
}

export default function BlogActions({ id, slug }: BlogActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      startTransition(async () => {
        try {
          await deleteBlog(id);
        } catch (error) {
          alert('Failed to delete blog');
        }
      });
    }
  };

  return (
    <div className={styles.actions}>
      <Link href={`/dashboard/blogs/edit/${id}`} className={styles.iconBtn} title="Edit blog">
        <Pencil size={15} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className={`${styles.iconBtn} ${styles.deleteBtn}`}
        title="Delete blog"
      >
        <Trash2 size={15} />
      </button>
      <Link href={`/blog/${slug}`} className={`${styles.iconBtn} ${styles.viewBtn}`} title="View blog" target="_blank">
        <ExternalLink size={15} />
      </Link>
    </div>
  );
}
