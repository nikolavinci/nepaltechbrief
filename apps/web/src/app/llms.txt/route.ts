import { fetchArticles } from '@/lib/api';

export async function GET() {
  const { data: articles } = await fetchArticles(1, 25);

  let text = `# NepTechBrief\nNepal's premier technology news platform.\n\n## Recent News\n`;

  articles.forEach((article: any) => {
    const title = article.title_np || article.title_en;
    const date = new Date(article.published_at || article.created_at).toISOString().split('T')[0];
    const url = `https://neptechbrief.com/news/` + article.slug;
    let cleanBody = (article.body_np || article.body_en || '').replace(/<[^>]+>/g, '').trim();
    const excerpt = cleanBody.substring(0, 300) + '...';

    text += `\n### ` + title + `\nDate: ` + date + `\nURL: ` + url + `\nSummary: ` + excerpt + `\n`;
  });

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800'
    }
  });
}
