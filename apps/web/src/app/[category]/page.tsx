import Link from 'next/link';

export default async function CategoryPage({ 
  params 
}: { 
  params: Promise<{ category: string }> 
}) {
  const { category } = await params;

  // Capitalize category name for display
  const titleEn = category.charAt(0).toUpperCase() + category.slice(1);
  const titleNp = category === 'politics' ? 'राजनीति' 
                : category === 'business' ? 'व्यापार' 
                : category === 'technology' ? 'प्रविधि' 
                : category === 'news' ? 'समाचार' 
                : titleEn;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-10 border-b-2 border-primary pb-4 inline-block">
        <h1 className="text-4xl font-bold">{titleNp}</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Link href={`/news/${category}-story-${i}`} key={i} className="group flex flex-col gap-4">
            <div className="w-full aspect-video bg-muted rounded overflow-hidden">
              <img 
                src={`https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop&sig=${i}`} 
                alt="Category Article" 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-3 mb-2">
                पछिल्लो {titleNp} प्रवृत्तिको विस्तृत कभरेज र गहन विश्लेषण भाग {i}
              </h2>
              <time className="text-sm text-muted-foreground block">
                {new Date().toLocaleDateString('ne-NP')}
              </time>
              <p className="mt-2 text-muted-foreground line-clamp-2">
                यो लेखको संक्षिप्त अंश हो जसले पाठकलाई शीर्षकको बारेमा अलि बढी सन्दर्भ दिन्छ।
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
