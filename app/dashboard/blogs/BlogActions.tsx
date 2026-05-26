'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { deleteBlog, unpublishBlog, publishBlog } from '../blogActions';
import { Pencil, Trash2, ExternalLink, EyeOff, Eye } from 'lucide-react';
import styles from '../stories/StoryActions.module.css';

interface BlogActionsProps {
  id: number;
  slug: string;
  isDraft?: boolean | null;
}

export default function BlogActions({ id, slug, isDraft }: BlogActionsProps) {
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

  const handleUnpublish = () => {
    if (window.confirm('Are you sure you want to unpublish this blog? It will be moved to drafts.')) {
      startTransition(async () => {
        try {
          await unpublishBlog(id);
        } catch (error) {
          alert('Failed to unpublish blog');
        }
      });
    }
  };

  const handlePublish = () => {
    if (window.confirm('Are you sure you want to publish this blog? It will be visible to everyone.')) {
      startTransition(async () => {
        try {
          await publishBlog(id);
        } catch (error) {
          alert('Failed to publish blog');
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
          title="Publish blog"
        >
          <Eye size={15} />
        </button>
      )}
      {!isDraft && (
        <button
          onClick={handleUnpublish}
          disabled={isPending}
          className={styles.iconBtn}
          title="Unpublish blog"
        >
          <EyeOff size={15} />
        </button>
      )}
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
