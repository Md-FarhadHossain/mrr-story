'use server';

import { db } from '../../db';
import { blogsTable } from '../../db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

function buildSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function saveBlog(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const coverImageUrl = formData.get('coverImageUrl') as string;
  const coverImageAlt = formData.get('coverImageAlt') as string;
  const focusKeyword = formData.get('focusKeyword') as string;
  const tags = formData.get('tags') as string;
  const content = formData.get('content') as string;
  const customSlug = formData.get('slug') as string;

  if (!title || !description || !content) {
    throw new Error('Title, description, and content are required');
  }

  // Use user-provided slug if given, otherwise derive from title
  const slug = customSlug ? buildSlug(customSlug) : buildSlug(title);

  await db.insert(blogsTable).values({
    slug,
    title,
    description,
    coverImageUrl: coverImageUrl || null,
    coverImageAlt: coverImageAlt || null,
    focusKeyword: focusKeyword || null,
    tags: tags || null,
    content,
  });

  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/dashboard/blogs');
}

export async function deleteBlog(id: number) {
  await db.delete(blogsTable).where(eq(blogsTable.id, id));
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/dashboard/blogs');
}

export async function updateBlog(id: number, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const coverImageUrl = formData.get('coverImageUrl') as string;
  const coverImageAlt = formData.get('coverImageAlt') as string;
  const focusKeyword = formData.get('focusKeyword') as string;
  const tags = formData.get('tags') as string;
  const content = formData.get('content') as string;
  const customSlug = formData.get('slug') as string;

  if (!title || !description || !content) {
    throw new Error('Title, description, and content are required');
  }

  const slug = customSlug ? buildSlug(customSlug) : buildSlug(title);

  await db.update(blogsTable).set({
    slug,
    title,
    description,
    coverImageUrl: coverImageUrl || null,
    coverImageAlt: coverImageAlt || null,
    focusKeyword: focusKeyword || null,
    tags: tags || null,
    content,
  }).where(eq(blogsTable.id, id));

  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/dashboard/blogs');
  revalidatePath(`/blog/${slug}`);
}
