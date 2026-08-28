import Link from 'next/link';
import { fetchAuthors, fetchArticlesByAuthor } from '@/lib/api';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const authors = await fetchAuthors();
  return authors.map((author: any) => ({
    slug: author.slug || author.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  }));
}

export default async function AuthorProfilePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  const authors = await fetchAuthors();
  const author = authors.find((a: any) => 
    (a.slug || a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) === slug
  );

  if (!author) {
    return notFound();
  }

  const authorName = author.name;
  let authorImage = '';
  if (author.avatar_urls) {
    authorImage = author.avatar_urls['96'] || author.avatar_urls['48'] || author.avatar_urls['24'];
  } else {
    authorImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=e2e8f0&color=64748b&bold=true&size=150`;
  }
  
  // Extract role if available in WordPress (if exposed via REST API, often under 'roles')
  // We'll map WP roles to Nepali
  let authorRole = 'लेखक';
  if (author.roles && author.roles.includes('administrator')) authorRole = 'सम्पादक (Editor)';
  else if (author.roles && author.roles.includes('editor')) authorRole = 'सम्पादक (Editor)';
  else if (author.roles && author.roles.includes('author')) authorRole = 'वरिष्ठ लेखक (Senior Author)';
  else if (author.roles && author.roles.includes('contributor')) authorRole = 'योगदानकर्ता (Contributor)';
  else if (author.description && author.description.includes('प्रविधि')) authorRole = 'प्रविधि पत्रकार (Tech Journalist)';

  const authorDesc = author.description || `${authorName} प्रविधि र डिजिटल अर्थतन्त्रमा विशेषज्ञता हासिल गरेका एक अनुभवी पत्रकार हुन्।`;

  // Fetch actual articles by this author ID
  const { data: authorArticles } = await fetchArticlesByAuthor(author.id, 1, 40);

  const getImageUrl = (item: any) => {
    if (!item || !item.featured_image) return 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
    if (item.featured_image.startsWith('http')) return item.featured_image;
    if (process.env.NODE_ENV === 'development') return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.featured_image}`;
    return `/nepaltechbrief${item.featured_image}`;
  };

  const getTitle = (item: any) => {
    if (!item) return 'शीर्षक उपलब्ध छैन...';
    return item.title_np || item.title_en;
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: authorName,
    url: `https://neptechbrief.com/author/${slug}`,
    image: authorImage,
    description: author.description || undefined,
    jobTitle: authorRole
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-h-[70vh]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Author Bio Section */}
      <section className="bg-muted/30 p-8 rounded-2xl border border-border/50 shadow-sm mb-12 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-background shadow-lg flex-shrink-0 bg-card">
          <img 
            src={authorImage} 
            alt={authorName} 
            className="object-cover w-full h-full drop-shadow-md"
          />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-2 font-heading">{authorName}</h1>
          <p className="text-primary font-semibold tracking-wide uppercase text-sm mb-4">
            {authorRole}
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-2xl text-lg mb-6">
            {authorDesc}
          </p>
          
          <div className="flex items-center justify-center md:justify-start gap-4">
            {/* Mock Social Links */}
            <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors border border-border/50">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="mailto:author@NepTechBrief.com" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors border border-border/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
          </div>
        </div>
      </section>
      
      {/* Author's Articles Grid */}
      <div className="flex items-center justify-between mb-8 border-b-2 border-foreground pb-2">
        <h2 className="text-2xl font-bold uppercase tracking-tight font-heading">
          {authorName} द्वारा लेखहरू
        </h2>
      </div>

      {authorArticles.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-xl">कुनै लेख फेला परेन।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {authorArticles.map((item: any, i: number) => (
            <Link href={`/news/${item.slug}`} key={i} className="group flex flex-col gap-4 border border-border/50 p-4 rounded-xl bg-card hover:border-primary/40 hover:shadow-md transition-all">
              <div className="w-full aspect-video bg-muted rounded overflow-hidden relative">
                <img 
                  src={getImageUrl(item)} 
                  alt={getTitle(item)} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2 block">
                  {item.category?.name_np || 'प्रविधि'}
                </span>
                <h3 className="text-xl font-bold font-heading leading-tight group-hover:text-primary transition-colors line-clamp-3 mb-2">
                  {getTitle(item)}
                </h3>
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
      
      {authorArticles.length > 0 && (
        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-muted hover:bg-primary hover:text-primary-foreground font-bold rounded-full transition-colors border border-border/50 shadow-sm hover:shadow">
            थप लेखहरू लोड गर्नुहोस्
          </button>
        </div>
      )}

    </div>
  );
}
