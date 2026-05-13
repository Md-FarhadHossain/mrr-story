'use server';

import { db } from '../../db';
import { storiesTable } from '../../db/schema';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export async function saveStory(formData: FormData) {
  const title = formData.get('title') as string;
  const businessName = formData.get('businessName') as string;
  const founderName = formData.get('founderName') as string;
  const founderType = formData.get('founderType') as string || 'Founder';
  const revenue = formData.get('revenue') as string;
  const customers = formData.get('customers') as string;
  const niche = formData.get('niche') as string;
  const productUrl = formData.get('productUrl') as string;
  const heroImageUrl = formData.get('heroImageUrl') as string;
  const profileImageUrl = formData.get('profileImageUrl') as string;
  const twitterUrl = formData.get('twitterUrl') as string;
  const location = formData.get('location') as string;
  const tags = formData.get('tags') as string;
  const content = formData.get('content') as string;
  const faq = formData.get('faq') as string;

  if (!title || !businessName || !founderName || !revenue || !content) {
    throw new Error('All required fields must be filled');
  }

  // Auto-generate SEO-friendly URL Slug from Title
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const [newStory] = await db.insert(storiesTable).values({
    slug,
    title,
    businessName,
    founderName,
    founderType,
    revenue,
    customers: customers || null,
    niche: niche || null,
    productUrl: productUrl || null,
    heroImageUrl: heroImageUrl || null,
    profileImageUrl: profileImageUrl || null,
    twitterUrl: twitterUrl || null,
    location: location || null,
    tags: tags || null,
    content,
    faq: faq || null,
  }).returning({ id: storiesTable.id });

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/stories');

  return newStory.id;
}

export async function deleteStory(id: number) {
  await db.delete(storiesTable).where(eq(storiesTable.id, id));
  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/stories');
}

export async function updateStory(id: number, formData: FormData) {
  const title = formData.get('title') as string;
  const businessName = formData.get('businessName') as string;
  const founderName = formData.get('founderName') as string;
  const founderType = formData.get('founderType') as string || 'Founder';
  const revenue = formData.get('revenue') as string;
  const customers = formData.get('customers') as string;
  const niche = formData.get('niche') as string;
  const productUrl = formData.get('productUrl') as string;
  const heroImageUrl = formData.get('heroImageUrl') as string;
  const profileImageUrl = formData.get('profileImageUrl') as string;
  const twitterUrl = formData.get('twitterUrl') as string;
  const location = formData.get('location') as string;
  const tags = formData.get('tags') as string;
  const content = formData.get('content') as string;
  const faq = formData.get('faq') as string;

  if (!title || !businessName || !founderName || !revenue || !content) {
    throw new Error('All required fields must be filled');
  }

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  await db.update(storiesTable).set({
    slug,
    title,
    businessName,
    founderName,
    founderType,
    revenue,
    customers: customers || null,
    niche: niche || null,
    productUrl: productUrl || null,
    heroImageUrl: heroImageUrl || null,
    profileImageUrl: profileImageUrl || null,
    twitterUrl: twitterUrl || null,
    location: location || null,
    tags: tags || null,
    content,
    faq: faq || null,
  }).where(eq(storiesTable.id, id));

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/stories');
  revalidatePath(`/stories/${slug}`);
}
