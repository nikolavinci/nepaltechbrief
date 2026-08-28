import { fetchArticles } from '@/lib/api';

export async function GET() {
  const { data: articles } = await fetchArticles(1, 100);
  
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const recentArticles = articles.filter((article: any) => {
    const pubDate = new Date(article.published_at || article.created_at);
    return pubDate >= twoDaysAgo;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ` + recentArticles.map((article: any) => {
    const pubDate = new Date(article.published_at || article.created_at).toISOString();
    const title = (article.title_np || article.title_en || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
  <url>
    <loc>https://neptechbrief.com/news/` + article.slug + `</loc>
    <news:news>
      <news:publication>
        <news:name>NepTechBrief</news:name>
        <news:language>ne</news:language>
      </news:publication>
      <news:publication_date>` + pubDate + `</news:publication_date>
      <news:title>` + title + `</news:title>
    </news:news>
  </url>`;
  }).join('') + `
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800'
    }
  });
}
