import { ArticleForm } from '@/components/admin/ArticleForm';
import { fetchCategories, fetchArticle } from '@/lib/api';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';

export default async function AdminArticleEditPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const session = await auth();
  
  const accessToken = (session as any)?.accessToken;

  // We fetch categories
  const categories = await fetchCategories();
  
  // Actually our fetchArticle uses slug. We might need a fetchArticleById, but for now we'll assume the API allows fetch by ID, OR we need to update Laravel to find by ID in show method.
  // Wait, Laravel usually uses ID or Slug. Our ArticleController show() uses slug.
  // We can just fetch all and find, or we can fetch directly from API if we add an endpoint.
  // Let's just fetch it directly using fetch from the server component
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    cache: 'no-store'
  });
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch article');
  }
  
  const article = await res.json();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Article</h1>
        <p className="text-muted-foreground">Update your bilingual news article below.</p>
      </div>

      <ArticleForm 
        lang={lang} 
        accessToken={accessToken} 
        categories={categories} 
        initialData={article}
      />
    </div>
  );
}
