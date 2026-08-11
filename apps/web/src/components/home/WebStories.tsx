import Link from 'next/link';

export function WebStories({ articles }: { articles: any[] }) {
  if (!articles || articles.length === 0) return null;

  const getImageUrl = (article: any) => {
    if (!article || !article.featured_image) return null;
    if (article.featured_image.startsWith('http')) return article.featured_image;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${article.featured_image}`;
  };

  const getTitle = (article: any) => {
    return article.title_np || article.title_en;
  };

  return (
    <section className="mb-12 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-foreground uppercase tracking-tight flex items-center gap-2">
          <span className="w-4 h-4 bg-gradient-to-tr from-pink-500 to-orange-500 inline-block rounded-full animate-pulse"></span>
          वेब स्टोरी
        </h2>
        <Link href={`/web-stories`} className="text-sm font-semibold hover:underline">
          सबै हेर्नुहोस् →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {articles.map((article) => {
          const imageUrl = getImageUrl(article);
          if (!imageUrl) return null;

          return (
            <Link 
              href={`/news/${article.slug}`} 
              key={article.id} 
              className="group relative flex-shrink-0 w-40 sm:w-48 lg:w-56 aspect-[9/16] rounded-xl overflow-hidden snap-start shadow-sm hover:shadow-xl transition-all"
            >
              <img 
                src={imageUrl} 
                alt={getTitle(article)} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 bg-muted" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase px-2 py-0.5 rounded mb-2 inline-block">
                  {article.category?.name_np}
                </span>
                <h3 className="text-white font-bold text-sm sm:text-base leading-tight group-hover:text-primary transition-colors line-clamp-3">
                  {getTitle(article)}
                </h3>
              </div>
              
              {/* Story Indicator Lines */}
              <div className="absolute top-2 left-2 right-2 flex gap-1">
                <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-full rounded-full"></div>
                </div>
                <div className="h-1 flex-1 bg-white/30 rounded-full"></div>
                <div className="h-1 flex-1 bg-white/30 rounded-full"></div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
