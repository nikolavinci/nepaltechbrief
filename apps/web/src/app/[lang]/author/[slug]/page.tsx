import { fetchArticles } from '@/lib/api';
import { getDeterministicAuthor, getPokemonAvatar } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const AUTHORS = ['Sanjay K.C', 'Sandhya K.C', 'Saanvi KC', 'Sonu Karki'];
  const params: any[] = [];
  
  for (const lang of ['en', 'np']) {
    for (const name of AUTHORS) {
      params.push({ lang, slug: name.toLowerCase().replace(/[\s.]+/g, '-') });
    }
  }
  
  return params;
}

export default async function AuthorPage({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = await params;
  const isEn = lang === 'en';

  const AUTHORS = [
    { name: 'Sanjay K.C', role: 'Editor in Chief' },
    { name: 'Sandhya K.C', role: 'Tech Correspondent' },
    { name: 'Saanvi KC', role: 'Startup Analyst' },
    { name: 'Sonu Karki', role: 'Gadget Reviewer' }
  ];

  const author = AUTHORS.find(a => a.name.toLowerCase().replace(/[\s.]+/g, '-') === slug);
  if (!author) {
    notFound();
  }

  const avatar = getPokemonAvatar(author.name);
  
  // Fetch a large batch and filter deterministically
  const { data: allArticles } = await fetchArticles(1, 100);
  const articles = allArticles.filter((a: any) => getDeterministicAuthor(a.slug).name === author.name);

  const getImageUrl = (article: any) => {
    if (!article || !article.featured_image) return 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
    if (article.featured_image.startsWith('http')) return article.featured_image;
    if (process.env.NODE_ENV === 'development') return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${article.featured_image}`;
    return `/nepaltechbrief${article.featured_image}`;
  };

  const getTitle = (article: any) => {
    return isEn ? article.title_en : (article.title_np || article.title_en);
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-muted p-8 rounded-xl mb-12 border">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden bg-white shrink-0 shadow-inner p-4 border flex items-center justify-center">
          <img src={avatar} alt={author.name} className="w-full h-full object-contain" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl font-extrabold mb-2 text-primary">{author.name}</h1>
          <p className="text-xl text-muted-foreground font-semibold mb-4">{author.role}</p>
          <p className="text-foreground/80 leading-relaxed max-w-2xl">
            {isEn 
              ? `${author.name} is a renowned ${author.role.toLowerCase()} contributing high-quality insights and breaking news to NepTechBrief. With a deep passion for technology and digital transformation, they bring the latest updates straight to you.`
              : `${author.name} नेपटेकन्युजका एक प्रख्यात ${author.role.toLowerCase()} हुन्। प्रविधि र डिजिटल रूपान्तरणमा गहिरो लगाव राख्ने उहाँले तपाईंलाई पछिल्ला अपडेटहरू निरन्तर उपलब्ध गराउनुहुन्छ।`
            }
          </p>
        </div>
      </div>

      <h2 className="text-3xl font-extrabold mb-8 border-b-2 border-primary pb-2 uppercase tracking-tight flex items-center gap-2">
        <span className="w-4 h-4 bg-primary inline-block rounded-sm"></span>
        {isEn ? `Articles by ${author.name}` : `${author.name} का लेखहरू`}
      </h2>

      {articles.length === 0 ? (
        <p className="text-muted-foreground text-lg py-8 text-center">{isEn ? 'No articles found for this author yet.' : 'यस लेखकका कुनै लेखहरू फेला परेनन्।'}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: any) => (
            <Link href={`/${lang}/news/${article.slug}`} key={article.id} className="group flex flex-col gap-3 bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
              <div className="aspect-video bg-muted overflow-hidden relative">
                <img 
                  src={getImageUrl(article)} 
                  alt={getTitle(article)} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-primary/90 backdrop-blur text-primary-foreground text-[10px] font-bold uppercase px-2 py-1 rounded">
                    {isEn ? article.category?.name_en : article.category?.name_np}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-3">
                  {getTitle(article)}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
