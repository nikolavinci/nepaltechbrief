import Link from 'next/link';

export function OpinionEditorials({ articles }: { articles: any[] }) {
  if (!articles || articles.length === 0) return null;

  const getTitle = (article: any) => article.title_np || article.title_en;
  
  const getAvatar = (name: string) => {
    if (!name) name = "Sanjay K.C";
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `/nepaltechbrief/storage/authors/${slug}.jpg`;
  };

  const getAuthorName = (article: any) => {
    // If the article has an author relation, use it, else default to authors list based on id
    if (article.author?.name) return article.author.name;
    const authors = ["Sanjay K.C", "Sandhya K.C", "Saanvi KC", "Sonu Karki"];
    return authors[article.id % authors.length];
  };

  return (
    <section className="mb-12 border border-zinc-800 rounded-xl bg-[#0a0a0a] p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
        <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
          <span className="w-3 h-3 bg-zinc-300 inline-block rounded-full"></span>
          Opinion & Editorials
        </h2>
        <Link href={`/category/opinions`} className="text-xs font-semibold hover:underline text-zinc-400">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
        {articles.slice(0, 4).map((article) => {
          const author = getAuthorName(article);
          return (
            <Link 
              href={`/news/${article.slug}`} 
              key={article.id} 
              className="group flex flex-col items-center text-center gap-3"
            >
              <div className="w-24 h-24 rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700 group-hover:border-red-600 transition-colors shadow-lg relative">
                 <img 
                   src={getAvatar(author)} 
                   alt={author} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform bg-zinc-800"
                 />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm leading-tight group-hover:text-red-500 transition-colors line-clamp-3 mb-2">
                  {getTitle(article)}
                </h3>
                <span className="text-[10px] text-red-700 uppercase font-bold tracking-widest block">
                  {author}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
