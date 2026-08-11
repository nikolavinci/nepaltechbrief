import { ArticleForm } from '@/components/admin/ArticleForm';
import { fetchCategories } from '@/lib/api';
import { auth } from '@/auth';

export default async function AdminArticleCreatePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth();
  
  // We need the token to pass to the client component so it can make authenticated requests
  const accessToken = (session as any)?.accessToken;

  const categories = await fetchCategories();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Write New Article</h1>
        <p className="text-muted-foreground">Draft your bilingual news article below.</p>
      </div>

      <ArticleForm 
        lang={lang} 
        accessToken={accessToken} 
        categories={categories} 
      />
    </div>
  );
}
