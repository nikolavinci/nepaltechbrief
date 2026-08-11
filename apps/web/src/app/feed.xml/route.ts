import { fetchArticles } from '@/lib/api';

export async function GET(request: Request) {
  // Fetch latest 20 published articles
  const { data: articles } = await fetchArticles(1, 20);
  
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const feedUrl = `${siteUrl}/feed.xml`;
  const title = 'नेपटेकन्युज - नवीनतम प्रविधि समाचार';
  const description = 'नेपालको प्रमुख डिजिटल समाचार प्लेटफर्म जसमा प्रविधि, एआई, र स्टार्टअपका खबरहरू समावेश छन्।';

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${siteUrl}</link>
    <description>${description}</description>
    <language>ne-NP</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    
    ${articles.map((article: any) => {
      const articleTitle = article.title_np || article.title_en;
      const articleBody = article.body_np || article.body_en;
      const articleUrl = `${siteUrl}/news/${article.slug}`;
      const pubDate = new Date(article.published_at || article.created_at).toUTCString();
      
      // Strip HTML and truncate for description
      const plainText = articleBody ? articleBody.replace(/<[^>]+>/g, '') : '';
      const itemDesc = plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;

      return `
    <item>
      <title><![CDATA[${articleTitle}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${itemDesc}]]></description>
    </item>`;
    }).join('')}
    
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
