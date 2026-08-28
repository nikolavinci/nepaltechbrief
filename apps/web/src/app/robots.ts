import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: [
      'https://neptechbrief.com/sitemap.xml',
      'https://neptechbrief.com/news-sitemap.xml',
    ],
  };
}
