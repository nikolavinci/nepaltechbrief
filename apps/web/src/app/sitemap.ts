import { MetadataRoute } from 'next';
import { fetchArticles, fetchCategories } from '@/lib/api';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Base URLs
  const sitemap: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ];

  try {
    // Fetch all articles
    const { data: articles } = await fetchArticles(1, 100);
    
    // Add URLs for each article
    articles.forEach(article => {
      sitemap.push({
        url: `${baseUrl}/news/${article.slug}`,
        lastModified: new Date(article.updated_at || article.created_at || new Date()),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    });

    // Fetch categories
    const categories = await fetchCategories();
    categories.forEach(category => {
      sitemap.push({
        url: `${baseUrl}/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.6,
      });
    });
  } catch (error) {
    console.error('Failed to generate dynamic sitemap:', error);
  }

  return sitemap;
}
