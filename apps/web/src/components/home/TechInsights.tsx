import Link from 'next/link';

export function TechInsights({ articles }: { articles: any[] }) {
  if (!articles || articles.length < 5) return null;

  const getTitle = (article: any) => article?.title_np || article?.title_en || 'लेख लोड हुँदैछ...';
  
  const getImageUrl = (article: any) => {
    if (!article || !article.featured_image) return 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
    if (article.featured_image.startsWith('http')) return article.featured_image;
    if (process.env.NODE_ENV === 'development') return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${article.featured_image}`;
    return `/nepaltechbrief${article.featured_image}`;
  };

  const mainArticle = articles[0];
  const bottomArticles = articles.slice(1, 3);
  const sideArticles = articles.slice(3, 5);

  return (
    <section className="mb-12 mt-12 bg-muted/20 border border-border/50 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-8 border-b-2 border-cyan-500 pb-2">
        <h2 className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-tight flex items-center gap-2 font-heading">
          <span className="w-4 h-4 bg-cyan-500 inline-block rounded-sm"></span>
          टेक इनसाइट्स
        </h2>
        <Link href={`/category/insights`} className="text-sm font-semibold hover:underline text-cyan-600 dark:text-cyan-400">
          सबै हेर्नुहोस् →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Insight & Bottom Insights */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Top Big Image */}
          <Link href={mainArticle ? `/news/${mainArticle.slug}` : '#'} className="group flex flex-col rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow bg-card border border-border/50 relative">
            <div className="w-full aspect-square md:aspect-video bg-muted relative overflow-hidden">
              <img 
                src={getImageUrl(mainArticle)} 
                alt={getTitle(mainArticle)}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 text-white drop-shadow-md">
                <span className="bg-cyan-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded shadow-sm mb-2 md:mb-3 inline-block">
                  Insight
                </span>
                <h3 className="text-2xl md:text-4xl font-black font-heading leading-tight group-hover:text-cyan-300 transition-colors">
                  {getTitle(mainArticle)}
                </h3>
              </div>
            </div>
          </Link>
          
          {/* Two Smaller Articles Below (Side-by-Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {bottomArticles.map((article: any, idx: number) => (
              <Link href={article ? `/news/${article.slug}` : '#'} key={idx} className="group flex gap-4 p-4 bg-card rounded-xl shadow-sm border border-border/50 hover:border-cyan-500/50 hover:shadow-md transition-all h-full">
                <div className="w-1/3 aspect-[4/3] bg-muted rounded-lg overflow-hidden relative shrink-0">
                  <img 
                    src={getImageUrl(article)} 
                    alt={getTitle(article)}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold font-heading text-sm md:text-base leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-3">
                    {getTitle(article)}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Side Insights */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {sideArticles.map((article: any, idx: number) => (
            <Link href={article ? `/news/${article.slug}` : '#'} key={idx} className="group flex flex-col gap-3 p-4 bg-card rounded-xl shadow-sm border border-border/50 hover:border-cyan-500/50 hover:shadow-md transition-all h-full">
              <div className="w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden relative">
                <img 
                  src={getImageUrl(article)} 
                  alt={getTitle(article)}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-bold font-heading text-lg leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-3">
                  {getTitle(article)}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
