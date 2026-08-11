import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${lang}/login`);
  }
  
  const accessToken = (session as any)?.accessToken;
  let analytics = null;
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      cache: 'no-store' // always fetch fresh data for dashboard
    });
    
    if (res.ok) {
      analytics = await res.json();
    }
  } catch (err) {
    console.error('Failed to load analytics', err);
  }

  const metrics = analytics?.metrics || { total_articles: 0, published_articles: 0, draft_articles: 0, total_users: 0, total_categories: 0 };
  const recentArticles = analytics?.recent_articles || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {session.user.name}!</p>
        </div>
        <Link href={`/${lang}/admin/articles/create`} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          New Article
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-background border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
              <h3 className="text-2xl font-black">{metrics.total_articles}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-background border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Published</p>
              <h3 className="text-2xl font-black">{metrics.published_articles}</h3>
            </div>
          </div>
        </div>

        <div className="bg-background border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 Z"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Drafts</p>
              <h3 className="text-2xl font-black">{metrics.draft_articles}</h3>
            </div>
          </div>
        </div>

        <div className="bg-background border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-black">{metrics.total_users}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-muted/30">
          <h3 className="font-bold text-lg">Recent Activity</h3>
          <Link href={`/${lang}/admin/articles`} className="text-sm text-primary hover:underline font-medium">View All</Link>
        </div>
        <div className="divide-y">
          {recentArticles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No recent articles found.</div>
          ) : (
            recentArticles.map((article: any) => (
              <div key={article.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                    {article.featured_image ? (
                      <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${article.featured_image}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-tight mb-1">
                      {lang === 'en' ? article.title_en : article.title_np || article.title_en}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {article.author?.name}
                      </span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${article.status === 'published' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
                        {article.status}
                      </span>
                      <span>•</span>
                      <time>{new Date(article.created_at).toLocaleDateString()}</time>
                    </div>
                  </div>
                </div>
                <Link 
                  href={`/${lang}/admin/articles/edit?id=${article.id}`} 
                  className="px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-muted transition-colors flex-shrink-0 ml-4"
                >
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
