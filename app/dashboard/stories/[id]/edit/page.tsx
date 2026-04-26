import { db } from '../../../../../db';
import { storiesTable } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import EditStoryForm from './EditStoryForm';

export default async function EditStoryPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const stories = await db.select().from(storiesTable).where(eq(storiesTable.id, parseInt(id, 10))).limit(1);
  const story = stories[0];

  if (!story) {
    return notFound();
  }

  return <EditStoryForm story={story} />;
}
