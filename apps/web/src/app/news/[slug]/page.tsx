import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchArticle, fetchArticles } from '@/lib/api';
import { AdBannerSidebar } from '@/components/ads/AdBannerSidebar';
import { DynamicAd } from '@/components/ads/DynamicAd';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) return {};

  const title = article.title_np || article.title_en;
  
  // Create a plain text description by stripping HTML from the body and taking first 160 chars
  const bodyText = article.body_np || article.body_en;
  const plainText = bodyText.replace(/<[^>]+>/g, '');
  const description = plainText.length > 160 ? plainText.substring(0, 160) + '...' : plainText;

  const featuredImage = article.featured_image 
    ? (article.featured_image.startsWith('http') 
        ? article.featured_image 
        : (process.env.NODE_ENV === 'development' 
            ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${article.featured_image}` 
            : `/nepaltechbrief${article.featured_image}`))
    : '/placeholder-og.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.published_at || article.created_at,
      authors: [article.author?.name || 'NepTechBrief Editor'],
      images: [featuredImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [featuredImage],
    },
    robots: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'Googlebot-News': 'index, follow',
      'news_keywords': article.category?.name_en || 'Technology, News',
    }
  };
}

export async function generateStaticParams() {
  const { data: articles } = await fetchArticles(1, 100);
  return articles.map((article: any) => ({
    slug: article.slug,
  }));
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const article = await fetchArticle(slug);
  if (!article) notFound();

  const featuredImage = article.featured_image 
    ? (article.featured_image.startsWith('http') 
        ? article.featured_image 
        : (process.env.NODE_ENV === 'development' 
            ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${article.featured_image}` 
            : `/nepaltechbrief${article.featured_image}`))
    : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://neptechbrief.com/news/${slug}`
    },
    headline: article.title_np || article.title_en,
    image: [featuredImage],
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.created_at,
    author: [{
      '@type': 'Person',
      name: article.author?.name || 'NepTechBrief Editor',
      url: `https://neptechbrief.com/author/${article.author?.slug || 'editor'}`
    }],
    publisher: {
      '@type': 'Organization',
      name: 'NepTechBrief',
      logo: {
        '@type': 'ImageObject',
        url: 'https://neptechbrief.com/logo.png'
      }
    }
  };

  const { data: recentArticles } = await fetchArticles(1, 15);
  const otherArticles = recentArticles.filter((a: any) => a.slug !== slug);
  const relatedNews = otherArticles.slice(0, 2);
  const trendingNews = otherArticles.slice(2, 7);
  const latestNews = otherArticles.slice(7, 11);

  // Strip duplicate featured image from body
  let cleanBody = article.body_np || article.body_en;
  if (article.featured_image) {
    // Aggressively remove the very first image tag in the body
    cleanBody = cleanBody.replace(/<img[^>]*>/i, '');
  }

  // Strip "appeared first on" spam links
  cleanBody = cleanBody.replace(/<p[^>]*>\s*The post\s*<a[^>]*>.*?<\/a>\s*appeared first on\s*<a[^>]*>.*?<\/a>\.?\s*<\/p>/ig, '');
  cleanBody = cleanBody.replace(/The post\s*<a[^>]*>.*?<\/a>\s*appeared first on\s*<a[^>]*>.*?<\/a>\.?/ig, '');

  const paragraphs = cleanBody.split('</p>');
  const midPoint = Math.floor(paragraphs.length / 2);
  const firstHalf = paragraphs.slice(0, midPoint).join('</p>') + (paragraphs.length > 0 ? '</p>' : '');
  const secondHalf = paragraphs.slice(midPoint).join('</p>');

  const getImageUrl = (item: any) => {
    if (!item || !item.featured_image) return 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
    if (item.featured_image.startsWith('http')) return item.featured_image;
    if (process.env.NODE_ENV === 'development') return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.featured_image}`;
    return `/nepaltechbrief${item.featured_image}`;
  };

  const getTitle = (item: any) => {
    if (!item) return 'लेख लोड हुँदैछ...';
    return item.title_np || item.title_en;
  };

  const authorName = article.author?.name || 'Editor';
  const authorSlug = article.author?.slug || authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const authorImage = article.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=e2e8f0&color=64748b&bold=true&size=150`;
  const authorDesc = article.author?.description || `${authorName} प्रविधि र डिजिटल अर्थतन्त्रमा विशेषज्ञता हासिल गरेका एक अनुभवी पत्रकार हुन्। उनले पछिल्लो समयमा नेपालको स्टार्टअप इकोसिस्टम र प्रविधि क्षेत्रमा भइरहेका परिवर्तनहरूलाई नजिकबाट नियालिरहेका छन्।`;

  return (
    <div className="container mx-auto px-4 py-8 xl:py-12 max-w-7xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Article Content */}
        <article className="lg:col-span-8">
      {/* Article Header */}
      <header className="mb-8 border-b pb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link href={`/technology`} className="text-primary font-bold text-sm uppercase hover:underline">
            प्रविधि
          </Link>
          <span className="text-muted-foreground text-sm">•</span>
          <time className="text-muted-foreground text-sm">
            {new Date(article.published_at || article.created_at || Date.now()).toLocaleDateString('ne-NP', { 
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </time>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          {article.title_np || article.title_en}
        </h1>

        <Link href={`/author/${authorSlug}`} className="flex items-center gap-4 pt-4 border-t border-dashed hover:opacity-80 transition-opacity group">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-transparent group-hover:border-primary transition-colors relative">
            <Image src={authorImage} alt={authorName} fill sizes="48px" className="object-cover" />
          </div>
          <div>
            <p className="font-semibold text-sm group-hover:text-primary transition-colors">
              {authorName}
            </p>
          </div>
        </Link>
            </header>

      <DynamicAd position="ad_below_title_1" />
      <DynamicAd position="ad_below_title_2" />

      {/* Featured Image */}
      <figure className="mb-12">
        <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden relative">
          <Image 
            src={featuredImage} 
            alt="Featured Image" 
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            priority
            className="object-cover"
          />
        </div>
      </figure>

      {/* Article Body */}
      <article className="prose dark:prose-invert prose-headings:font-heading prose-a:text-primary max-w-none tracking-wide text-foreground/90 text-justify text-[18px] sm:text-[19px] md:text-[20px] leading-[1.9] prose-p:text-justify prose-p:text-[18px] sm:prose-p:text-[19px] md:prose-p:text-[20px] prose-p:leading-[1.9]">
        <div dangerouslySetInnerHTML={{ __html: firstHalf }} />
        <DynamicAd position="article_mid" />
        <div dangerouslySetInnerHTML={{ __html: secondHalf }} />
      </article>
        {/* Author Bio Box */}
        <div className="my-12 p-6 md:p-8 bg-muted/30 border border-border/50 rounded-2xl flex flex-col md:flex-row gap-6 items-center md:items-start transition-colors hover:border-primary/30 group/bio">
          <Link href={`/author/${authorSlug}`} className="w-24 h-24 rounded-full overflow-hidden border-2 border-transparent flex-shrink-0 group-hover/bio:border-primary/50 transition-colors bg-card p-2 shadow-sm relative">
            <Image src={authorImage} alt={authorName} fill sizes="96px" className="object-cover drop-shadow-sm" />
          </Link>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
              <Link href={`/author/${authorSlug}`} className="text-xl font-bold font-heading hover:text-primary transition-colors">
                {authorName}
              </Link>
            </div>
            <p className="text-muted-foreground mb-4 text-sm md:text-base leading-relaxed">
              {authorDesc}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <a href="#" aria-label="Author Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" aria-label="Author LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>

      {/* Related Stories */}
      <footer className="border-t pt-8">
        <h3 className="text-2xl font-bold mb-6">
          सम्बन्धित समाचारहरू
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relatedNews.map((item: any, i: number) => (
            <Link href={`/news/${item.slug}`} key={i} className="flex gap-4 group border border-border/50 p-4 rounded-xl hover:shadow-md transition-all bg-card hover:border-primary/30">
              <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                <Image 
                  src={getImageUrl(item)} 
                  alt="Related Story" 
                  fill
                  sizes="96px"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-3 mb-2 font-heading text-lg">
                  {getTitle(item)}
                </h4>
                <time className="text-xs text-muted-foreground font-medium">
                  {new Date(item.published_at || item.created_at).toLocaleDateString('ne-NP')}
                </time>
              </div>
            </Link>
          ))}
        </div>
      </footer>
    </article>

      {/* Right Sidebar */}
      <aside className="lg:col-span-4 space-y-8">
        
        {/* Sidebar Ad */}
        <AdBannerSidebar />

        {/* Trending Widget */}
        <div className="bg-card shadow-sm p-6 rounded-2xl border border-border/50">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-border pb-3 font-heading text-primary">
            <span className="w-2.5 h-2.5 bg-destructive rounded-full animate-pulse shadow-[0_0_8px_rgba(225,29,72,0.6)]"></span>
            अहिले ट्रेन्डिङ
          </h3>
          <ul className="space-y-4 pt-2">
            {trendingNews.map((item: any, i: number) => (
              <li key={i}>
                <Link href={`/news/${item.slug}`} className="group flex gap-4 items-start">
                  <span className="text-4xl font-black text-muted-foreground/20 group-hover:text-primary/30 transition-colors font-heading leading-none mt-1">
                    {i + 1}
                  </span>
                  <h4 className="font-bold leading-snug group-hover:text-primary transition-colors font-heading text-[1.1rem]">
                    {getTitle(item)}
                  </h4>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent News Widget */}
        <div className="bg-card shadow-sm p-6 rounded-2xl border border-border/50">
          <h3 className="text-xl font-bold mb-4 border-b border-border pb-3 font-heading">
            भर्खरै
          </h3>
          <div className="flex flex-col gap-5 pt-2">
            {latestNews.map((item: any, i: number) => (
              <Link href={`/news/${item.slug}`} key={i} className="group flex gap-4 items-center">
                <div className="w-24 aspect-[4/3] bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                  <Image 
                    src={getImageUrl(item)} 
                    alt="Recent thumbnail" 
                    fill
                    sizes="96px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors font-heading">
                  {getTitle(item)}
                </h4>
              </Link>
            ))}
          </div>
        </div>

      </aside>

      </div>
    </div>
  );
}


