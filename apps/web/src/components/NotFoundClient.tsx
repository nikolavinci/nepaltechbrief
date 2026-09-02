'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { fetchArticles, fetchCategories, Article, Category } from '@/lib/api';
import Link from 'next/link';

export function NotFoundClient() {
  const pathname = usePathname();
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        // Extract keywords from pathname
        const pathSegments = pathname.split('/').filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1] || '';
        // Replace dashes and underscores with spaces, remove common file extensions
        const keywords = lastSegment.replace(/[-_]/g, ' ').replace(/\.[a-z0-9]+$/i, '');
        
        if (keywords.length > 2) {
          const res = await fetchArticles(1, 3, keywords);
          setSuggestions(res.data || []);
        }

        const cats = await fetchCategories();
        setCategories(cats || []);
      } catch (error) {
        console.error('Failed to fetch suggestions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [pathname]);

  if (loading) return <div className="mt-8 text-gray-500">Loading suggestions...</div>;

  return (
    <div className="w-full max-w-4xl mt-12 text-left">
      {suggestions.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white text-center">
            You might be looking for...
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestions.map((article) => (
              <Link 
                key={article.id} 
                href={`/news/${article.slug}`}
                className="group flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
              >
                {article.featured_image && (
                  <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={article.featured_image} 
                      alt={article.title_en} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title_en}
                  </h4>
                  <span className="text-sm text-blue-600 mt-2 mt-auto">Read article &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Or explore our categories
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.slice(0, 8).map(cat => (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 rounded-full text-sm transition-colors border border-gray-200 dark:border-gray-700"
              >
                {cat.name_en}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
