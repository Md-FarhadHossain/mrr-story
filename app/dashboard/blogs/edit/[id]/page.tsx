import { db } from '../../../../../db';
import { blogsTable } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import EditBlogForm from './EditBlogForm';

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const blogs = await db.select().from(blogsTable).where(eq(blogsTable.id, parseInt(id, 10))).limit(1);
  const blog = blogs[0];

  if (!blog) {
    return notFound();
  }

  return <EditBlogForm blog={blog} />;
}
