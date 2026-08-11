import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WebStories } from "@/components/home/WebStories";
import { fetchArticles } from '@/lib/api';

export default async function HomePage() {
  // Fetch real articles from Laravel API (Expanded limit to 100 to populate all sections)
  const { data: articles } = await fetchArticles(1, 100);
  
  const getArticlesByCategory = (slug: string) => articles.filter((a: any) => a.category?.slug === slug);
  
  const gadgetsNews = getArticlesByCategory('gadgets');
  const telecomNews = getArticlesByCategory('telecom');
  const startupNews = getArticlesByCategory('startups');
  const appsNews = getArticlesByCategory('apps-software');
  const techNews = getArticlesByCategory('tech-news');

  // Fallbacks in case a category is empty
  const mainLead = articles[0];
  const subLeads = articles.slice(1, 4);
  const latestNews = articles.slice(0, 6);
  const trendingNews = articles.slice(4, 9);
  const editorsPicks = articles.slice(10, 14);

  const getImageUrl = (article: any) => {
    if (!article || !article.featured_image) return 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
    if (article.featured_image.startsWith('http')) return article.featured_image;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${article.featured_image}`;
  };

  const getTitle = (article: any) => {
    if (!article) return 'लेख लोड हुँदैछ...';
    return article.title_np || article.title_en;
  };

  return (
    <div className="container max-w-[1400px] mx-auto px-4 py-6">

      {/* Top Ad Leaderboard */}
      <a href="https://nikolavinci.com" target="_blank" rel="noopener noreferrer" className="w-full h-24 sm:h-32 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border border-zinc-800 flex items-center justify-between px-8 mb-8 relative group overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop')] opacity-20 group-hover:opacity-30 transition-opacity bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col justify-center">
          <span className="text-white font-extrabold text-xl sm:text-3xl leading-tight tracking-tight">Need a Custom Website?</span>
          <span className="text-zinc-400 text-sm sm:text-base font-medium">Elevate your brand with Nikola Vinci's premium web solutions.</span>
        </div>
        <div className="relative z-10 hidden sm:block">
          <span className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-sm group-hover:bg-primary group-hover:text-white transition-colors">Start Building</span>
        </div>
        <div className="absolute top-1 right-1 px-1 bg-black/50 text-[10px] text-zinc-500 uppercase rounded z-10">Ad</div>
      </a>

      {/* Main Orchestration Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
        
        {/* Left Side: Hero Section (75%) */}
        <section className="xl:col-span-9 flex flex-col gap-6">
          {/* Main Lead Story */}
          {mainLead ? (
            <Link href={`/news/${mainLead.slug}`} className="group">
              <div className="aspect-[21/9] bg-muted overflow-hidden relative border-b-4 border-primary">
                <img 
                  src={getImageUrl(mainLead)} 
                  alt={getTitle(mainLead)} 
                  className="object-cover w-full h-full group-hover:scale-105 group-hover:blur-sm transition-all duration-700 bg-muted"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded text-white max-w-4xl drop-shadow-md">
                  <span className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider mb-3 inline-block px-2 py-1 shadow-sm">
                    {mainLead.category?.name_np || 'समाचार'}
                  </span>
                  <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white group-hover:text-cyan-400 transition-colors text-balance drop-shadow-lg font-heading">
                    {getTitle(mainLead)}
                  </h1>
                </div>
              </div>
            </Link>
          ) : (
            <div className="aspect-[21/9] bg-muted border flex items-center justify-center">
              <p className="text-muted-foreground font-bold">कुनै समाचार भेटिएन।</p>
            </div>
          )}

          {/* Sub Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {subLeads.map((item: any, idx: number) => (
              <Link href={`/news/${item.slug}`} key={idx} className="group flex flex-col gap-3">
                <div className="aspect-video bg-muted overflow-hidden rounded">
                  <img 
                    src={getImageUrl(item)} 
                    alt={getTitle(item)} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 bg-muted"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading leading-snug group-hover:text-primary transition-colors">
                    {getTitle(item)}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Right Side: Sidebar (25%) */}
        <aside className="xl:col-span-3 flex flex-col gap-6">
          
          {/* Timeline Section */}
          <div className="bg-card shadow-sm border border-border/50 rounded-2xl p-6 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
            <h3 className="text-xl font-extrabold uppercase tracking-tight mb-4 flex items-center gap-2 border-b border-border pb-3 font-heading text-primary">
              <span className="w-2.5 h-2.5 bg-destructive rounded-full animate-pulse shadow-[0_0_8px_rgba(225,29,72,0.6)]"></span>
              ताजा अपडेट
            </h3>
            
            <div className="flex flex-col relative before:absolute before:inset-y-0 before:left-1.5 before:w-0.5 before:bg-border pt-2">
              {latestNews.map((item: any, idx: number) => (
                <Link href={`/news/${item.slug}`} key={idx} className="relative pl-6 py-3 group">
                  <div className="absolute left-0 top-4 w-3.5 h-3.5 bg-background border-2 border-primary rounded-full group-hover:scale-125 group-hover:bg-primary transition-all shadow-sm z-10"></div>
                  <time className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block group-hover:text-primary/70 transition-colors">
                    {new Date(item.published_at || item.created_at).toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' })}
                  </time>
                  <h3 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2 font-heading">
                    {getTitle(item)}
                  </h3>
                </Link>
              ))}
            </div>
            
            <Link href={`/category/tech-news`} className="block text-center mt-6 text-sm font-bold text-primary hover:underline">
              थप समाचारहरू हेर्नुहोस् &rarr;
            </Link>
          </div>

        </aside>

      </div>

      {/* Editor's Picks Section */}
      <section className="mb-12 bg-muted/30 p-8 rounded-3xl border border-border/50">
        <div className="flex items-center justify-between mb-8 border-b-2 border-foreground pb-2">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight flex items-center gap-2 font-heading">
            सम्पादकको छनोट
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {editorsPicks.map((item: any, idx: number) => (
            <Link href={`/news/${item.slug}`} key={idx} className="group flex flex-col gap-4 bg-card p-4 rounded-xl shadow-sm border border-border/50 hover:border-primary/40 hover:shadow-md transition-all">
              <div className="w-full aspect-[4/3] bg-muted rounded overflow-hidden relative">
                <img 
                  src={getImageUrl(item)} 
                  alt={getTitle(item)} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-1 uppercase rounded shadow-sm">
                  {item.category?.name_np || 'विशेष'}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading leading-tight group-hover:text-primary transition-colors line-clamp-3 mb-2">
                  {getTitle(item)}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Web Stories */}
      <div className="mt-8 mb-12">
        <WebStories articles={articles.slice(20, 28)} />
      </div>

      <Separator className="my-8 h-[2px] bg-primary/20" />

      {/* Category Section: Apps & Software */}
      {(appsNews.length > 0 || true) && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6 border-b-2 border-orange-500 pb-2">
            <h2 className="text-3xl font-extrabold text-orange-500 uppercase tracking-tight flex items-center gap-2 font-heading">
              <span className="w-4 h-4 bg-orange-500 inline-block rounded-sm"></span>
              एप्स र सफ्टवेयर
            </h2>
            <Link href={`/category/apps-software`} className="text-sm font-semibold hover:underline text-orange-500 px-3 py-1 rounded">
              सबै हेर्नुहोस् →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(appsNews.length > 0 ? appsNews : articles.slice(10, 13)).slice(0, 3).map((item: any, idx: number) => (
              <Link href={item ? `/news/${item.slug}` : '#'} key={idx} className="group flex flex-col gap-3">
                <div className="aspect-video bg-muted overflow-hidden rounded">
                  <img 
                    src={getImageUrl(item)} 
                    alt={getTitle(item)} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-bold text-xl leading-snug font-heading group-hover:text-orange-500 transition-colors line-clamp-2">
                  {getTitle(item)}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2">
                   {item.body_np?.replace(/<[^>]+>/g, '') || item.body_en?.replace(/<[^>]+>/g, '')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Category Section: Gadgets */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 border-b-2 border-primary pb-2">
          <h2 className="text-3xl font-extrabold text-primary uppercase tracking-tight flex items-center gap-2 font-heading">
            <span className="w-4 h-4 bg-primary inline-block rounded-sm"></span>
            ग्याजेट्स
          </h2>
          <Link href={`/category/gadgets`} className="text-sm font-semibold hover:underline text-primary px-3 py-1 rounded">
            सबै हेर्नुहोस् →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(gadgetsNews.length > 0 ? gadgetsNews : articles.slice(15, 19)).slice(0, 4).map((item: any, idx: number) => (
            <Card key={idx} className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow group bg-card">
              <CardContent className="p-4 flex flex-col h-full">
                <Link href={item ? `/news/${item.slug}` : '#'} className="flex flex-col h-full">
                  <div className="aspect-video bg-muted overflow-hidden mb-4 rounded relative">
                    <img 
                      src={getImageUrl(item)} 
                      alt={getTitle(item)} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-bold font-heading text-lg leading-snug group-hover:text-primary transition-colors line-clamp-3">
                    {getTitle(item)}
                  </h3>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Split Section: Telecom (1/2) & Startups (1/2) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 mt-12">
        
        {/* Telecom */}
        <div>
          <div className="flex items-center justify-between mb-6 border-b-2 border-purple-600 pb-2">
            <h2 className="text-3xl font-extrabold text-purple-600 uppercase tracking-tight flex items-center gap-2 font-heading">
              <span className="w-4 h-4 bg-purple-600 inline-block rounded-sm"></span>
              टेलिकम
            </h2>
            <Link href={`/category/telecom`} className="text-sm font-semibold hover:underline text-purple-600">
              सबै हेर्नुहोस् →
            </Link>
          </div>
          
          <div className="flex flex-col gap-6">
            {(telecomNews.length > 0 ? telecomNews : articles.slice(5, 9)).slice(0, 4).map((item: any, idx: number) => (
              <Link href={item ? `/news/${item.slug}` : '#'} key={idx} className="group flex gap-4 bg-card p-3 rounded-lg border border-border/40 hover:border-purple-600/30 hover:shadow-sm transition-all">
                <div className="w-1/3 aspect-video bg-muted overflow-hidden flex-shrink-0 rounded">
                  <img src={getImageUrl(item)} alt="Telecom Mini" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold font-heading leading-snug group-hover:text-purple-600 transition-colors line-clamp-3">
                    {getTitle(item)}
                  </h4>
                  <time className="text-xs text-muted-foreground mt-2">
                    {new Date(item.published_at || item.created_at).toLocaleDateString('ne-NP')}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Startups */}
        <div>
          <div className="flex items-center justify-between mb-6 border-b-2 border-emerald-600 pb-2">
            <h2 className="text-3xl font-extrabold text-emerald-600 uppercase tracking-tight flex items-center gap-2 font-heading">
              <span className="w-4 h-4 bg-emerald-600 inline-block rounded-sm"></span>
              स्टार्टअप
            </h2>
            <Link href={`/category/startups`} className="text-sm font-semibold hover:underline text-emerald-600">
              सबै हेर्नुहोस् →
            </Link>
          </div>
          
          <div className="flex flex-col gap-6">
            {(startupNews.length > 0 ? startupNews : articles.slice(10, 14)).slice(0, 4).map((item: any, idx: number) => (
              <Link href={item ? `/news/${item.slug}` : '#'} key={idx} className="group flex gap-4 bg-card p-3 rounded-lg border border-border/40 hover:border-emerald-600/30 hover:shadow-sm transition-all">
                <div className="w-1/3 aspect-video bg-muted overflow-hidden flex-shrink-0 rounded">
                  <img src={getImageUrl(item)} alt="Startup Mini" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold font-heading leading-snug group-hover:text-emerald-600 transition-colors line-clamp-3">
                    {getTitle(item)}
                  </h4>
                  <time className="text-xs text-muted-foreground mt-2">
                    {new Date(item.published_at || item.created_at).toLocaleDateString('ne-NP')}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </section>

      {/* Bottom Ad Leaderboard */}
      <a href="https://nikolavinci.com" target="_blank" rel="noopener noreferrer" className="w-full h-24 sm:h-32 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border border-zinc-800 flex items-center justify-between px-8 mb-12 relative group overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop')] opacity-20 group-hover:opacity-30 transition-opacity bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col justify-center">
          <span className="text-white font-extrabold text-xl sm:text-3xl leading-tight tracking-tight">Transform Your Digital Presence</span>
          <span className="text-zinc-400 text-sm sm:text-base font-medium">Nikola Vinci custom website solutions. Get a free consultation today.</span>
        </div>
        <div className="relative z-10 hidden sm:block">
          <span className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-sm group-hover:bg-primary group-hover:text-white transition-colors">Contact Us</span>
        </div>
        <div className="absolute top-1 right-1 px-1 bg-black/50 text-[10px] text-zinc-500 uppercase rounded z-10">Ad</div>
      </a>

    </div>
  );
}
