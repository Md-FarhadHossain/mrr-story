import { MetadataRoute } from 'next';
import { db } from '../db';
import { storiesTable, blogsTable } from '../db/schema';
import GithubSlugger from 'github-slugger';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.mrrstory.com';

  const [stories, blogs] = await Promise.all([
    db.select().from(storiesTable),
    db.select().from(blogsTable),
  ]);

  const storyUrls = stories.map((story) => ({
    url: `${baseUrl}/stories/${story.slug}`,
    lastModified: story.createdAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogUrls = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.updatedAt || blog.createdAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const slugger = new GithubSlugger();
  const uniqueTags = new Set<string>();
  stories.forEach(story => {
    if (story.tags) {
      story.tags.split(',').forEach(tag => {
        slugger.reset();
        uniqueTags.add(slugger.slug(tag.trim()));
      });
    }
  });

  const tagUrls = Array.from(uniqueTags).map(tag => ({
    url: `${baseUrl}/stories/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/stories`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/newsletter`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    ...storyUrls,
    ...blogUrls,
    ...tagUrls,
  ];
}
