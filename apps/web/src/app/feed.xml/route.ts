import { fetchArticles } from '@/lib/api';

export async function GET() {
  const { data: articles } = await fetchArticles(1, 50);

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>NepTechBrief</title>
    <link>https://neptechbrief.com</link>
    <description>Nepal's Premier Technology News</description>
    <language>ne-NP</language>
    <atom:link href="https://neptechbrief.com/feed.xml" rel="self" type="application/rss+xml" />
    ` + articles.map((article: any) => {
      const pubDate = new Date(article.published_at || article.created_at).toUTCString();
      const title = (article.title_np || article.title_en || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const authorName = article.author?.name || 'Editor';
      
      let cleanBody = (article.body_np || article.body_en || '').replace(/<[^>]+>/g, '');
      const excerpt = cleanBody.substring(0, 160).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '...';

      return `
    <item>
      <title>` + title + `</title>
      <link>https://neptechbrief.com/news/` + article.slug + `</link>
      <guid>https://neptechbrief.com/news/` + article.slug + `</guid>
      <pubDate>` + pubDate + `</pubDate>
      <dc:creator>` + authorName + `</dc:creator>
      <description>` + excerpt + `</description>
    </item>`;
    }).join('') + `
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800'
    }
  });
}
