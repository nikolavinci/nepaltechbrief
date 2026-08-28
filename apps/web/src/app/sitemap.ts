import { MetadataRoute } from 'next';
import { fetchArticles } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: articles } = await fetchArticles(1, 1000);
  
  const newsEntries: MetadataRoute.Sitemap = articles.map((article: any) => ({
    url: "https://neptechbrief.com/news/$({article.slug})",
    lastModified: new Date(article.updated_at || article.created_at || Date.now()),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://neptechbrief.com',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://neptechbrief.com/team',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...newsEntries,
  ];
}
