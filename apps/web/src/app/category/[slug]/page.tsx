import Link from 'next/link';
import { fetchArticles } from '@/lib/api';

export default async function CategoryPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const categorySlug = slug;

  // Capitalize category name for display
  const titleEn = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  const titleNp = categorySlug === 'politics' ? 'राजनीति' 
                : categorySlug === 'business' ? 'व्यापार' 
                : categorySlug === 'technology' || categorySlug === 'tech-news' ? 'प्रविधि' 
                : categorySlug === 'gadgets' ? 'ग्याजेट्स'
                : categorySlug === 'apps-software' ? 'एप्स र सफ्टवेयर'
                : categorySlug === 'telecom' ? 'टेलिकम'
                : categorySlug === 'startups' ? 'स्टार्टअप'
                : titleEn;

  // Fetch articles and filter by category (or map tech-news to technology)
  const { data: articles } = await fetchArticles(1, 40);
  const categoryArticles = articles.filter((a: any) => 
    a.category?.slug === categorySlug || 
    (categorySlug === 'tech-news' && a.category?.slug === 'technology')
  );

  const getImageUrl = (item: any) => {
    if (!item || !item.featured_image) return 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
    if (item.featured_image.startsWith('http')) return item.featured_image;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.featured_image}`;
  };

  const getTitle = (item: any) => {
    if (!item) return 'लेख लोड हुँदैछ...';
    return item.title_np || item.title_en;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-10 border-b-2 border-primary pb-4 inline-block">
        <h1 className="text-4xl font-bold font-heading">{titleNp}</h1>
      </header>

      {categoryArticles.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-xl">कुनै लेख फेला परेन।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryArticles.map((item: any, i: number) => (
            <Link href={`/news/${item.slug}`} key={i} className="group flex flex-col gap-4 border border-border/50 p-4 rounded-xl bg-card hover:border-primary/40 hover:shadow-md transition-all">
              <div className="w-full aspect-video bg-muted rounded overflow-hidden relative">
                <img 
                  src={getImageUrl(item)} 
                  alt={getTitle(item)} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col flex-1">
                <h2 className="text-xl font-bold font-heading leading-tight group-hover:text-primary transition-colors line-clamp-3 mb-2">
                  {getTitle(item)}
                </h2>
                <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground font-medium border-t border-border/40">
                  <time>
                    {new Date(item.published_at || item.created_at).toLocaleDateString('ne-NP')}
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
