'use client';

import { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStory } from '../../../actions';
import { ThemeToggle } from '../../../../components/ThemeToggle';
import RichTextEditor from '../../../../components/RichTextEditor';
import styles from '../../../Dashboard.module.css';
import { countries } from '@/lib/countries';

interface EditStoryFormProps {
  story: any;
}

export default function EditStoryForm({ story }: EditStoryFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const clientAction = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateStory(story.id, formData);
        alert('Story updated successfully!');
        router.push('/dashboard/stories');
      } catch (error: any) {
        alert(error.message || 'Failed to update story');
      }
    });
  };

  return (
    <form ref={formRef} action={clientAction}>
      <header className={styles.topbar}>
        <h1 className={styles.topbarTitle}>Edit Story</h1>
        <div className={styles.actionArea}>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className={styles.editorContainer}>
        <div className={styles.card}>
          <div className={styles.formGroup}>
            <label>Story Title</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={story.title}
              placeholder="e.g. My AI App Makes $100K/Month"
              className={`${styles.input} ${styles.titleInput}`}
            />
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Business Name</label>
              <input type="text" name="businessName" defaultValue={story.businessName} required placeholder="LeadFlow" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Founder Name</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" name="founderName" defaultValue={story.founderName} required placeholder="Adrian Berisha" className={styles.input} style={{ flex: 1 }} />
                <select name="founderType" defaultValue={story.founderType || 'Founder'} className={styles.input} style={{ width: 'auto' }}>
                  <option value="Founder">Founder</option>
                  <option value="Co-Founder">Co-Founder</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Revenue / Month</label>
              <input type="text" name="revenue" defaultValue={story.revenue} required placeholder="$100K" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Profile Image URL (Optional)</label>
              <input type="url" name="profileImageUrl" defaultValue={story.profileImageUrl || ''} placeholder="https://example.com/photo.jpg" className={styles.input} />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Twitter / Social URL (Optional)</label>
              <input type="url" name="twitterUrl" defaultValue={story.twitterUrl || ''} placeholder="https://x.com/username" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Product URL (Optional)</label>
              <input type="url" name="productUrl" defaultValue={story.productUrl || ''} placeholder="https://yourbusiness.com" className={styles.input} />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Paying Customers (Optional)</label>
              <input type="text" name="customers" defaultValue={story.customers || ''} placeholder="e.g. 40 paying customers" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Niche / Market (Optional)</label>
              <input type="text" name="niche" defaultValue={story.niche || ''} placeholder="e.g. AI Marketing Automation for Reddit" className={styles.input} />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Location (Optional)</label>
              <select name="location" defaultValue={story.location || ''} className={styles.input}>
                <option value="">Select a location</option>
                {countries.map((country) => (
                  <option key={country.code || country.name} value={country.name}>
                    {country.name} {country.flag}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup} />
          </div>

          <div className={styles.formGroup}>
            <label>Story Content</label>
            <RichTextEditor
              name="content"
              defaultValue={story.content}
              placeholder="Who are you and what business did you start?..."
            />
          </div>
        </div>
      </div>
    </form>
  );
}

