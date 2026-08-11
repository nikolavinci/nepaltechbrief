import { fetchArticles } from '@/lib/api';
import Link from 'next/link';

export default async function SearchPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ lang: string }>,
  searchParams: Promise<{ q?: string }>
}) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q || '';
  const isEn = lang === 'en';

  let articles: any[] = [];
  
  if (q) {
    const { data } = await fetchArticles(1, 48, q);
    articles = data || [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold mb-2">
          {isEn ? 'Search Results' : 'खोज परिणाम'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {isEn ? `Showing results for: "${q}"` : `"${q}" को लागि परिणामहरू`}
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="py-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            {isEn ? 'No articles found' : 'कुनै लेख फेला परेन'}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isEn 
              ? 'We couldn\'t find any news matching your search query. Try checking your spelling or using more general keywords.' 
              : 'हामीले तपाईंको खोजसँग मिल्ने कुनै समाचार फेला पार्न सकेनौं। कृपया हिज्जे जाँच गर्नुहोस् वा सामान्य कुञ्जी शब्दहरू प्रयोग गर्नुहोस्।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article) => (
            <Link 
              href={`/${lang}/news/${article.slug}`} 
              key={article.id} 
              className="group flex flex-col bg-background border rounded-xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="w-full aspect-video bg-muted relative overflow-hidden">
                {article.featured_image ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${article.featured_image}`} 
                    alt={isEn ? article.title_en : article.title_np || article.title_en} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <svg className="w-10 h-10 opacity-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                )}
                
                <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {isEn ? article.category?.name_en : article.category?.name_np}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-3">
                  {isEn ? article.title_en : article.title_np || article.title_en}
                </h3>
                
                <div className="mt-auto pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${article.author?.id}`} alt="" />
                    </div>
                    <span className="font-medium truncate max-w-[100px]">{article.author?.name}</span>
                  </div>
                  <time>
                    {new Date(article.published_at || article.created_at).toLocaleDateString(isEn ? 'en-US' : 'ne-NP', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
