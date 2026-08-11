import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${lang}/login`);
  }

  const role = (session.user as any).role;

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b">
          <Link href={`/${lang}/admin`} className="text-xl font-bold text-primary">
            CMS Dashboard
          </Link>
          <div className="mt-2 text-xs text-muted-foreground">
            Logged in as {role}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href={`/${lang}/admin`} className="block px-4 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            Overview
          </Link>
          <Link href={`/${lang}/admin/articles`} className="block px-4 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            Articles
          </Link>
          <Link href={`/${lang}/admin/categories`} className="block px-4 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            Categories
          </Link>
          <Link href={`/${lang}/admin/feeds`} className="block px-4 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            RSS Feeds
          </Link>
          <Link href={`/${lang}/admin/media`} className="block px-4 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            Media Library
          </Link>
          {role === 'super_admin' && (
            <>
              <Link href={`/${lang}/admin/users`} className="block px-4 py-2 rounded-md hover:bg-muted font-medium transition-colors">
                Users
              </Link>
              <Link href={`/${lang}/admin/settings`} className="block px-4 py-2 rounded-md hover:bg-muted font-medium transition-colors">
                Settings (AI)
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t">
          <Link href={`/${lang}`} className="block text-center text-sm px-4 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">
            View Live Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden border-b bg-background p-4 flex items-center justify-between sticky top-0 z-10">
          <Link href={`/${lang}/admin`} className="text-lg font-bold text-primary">
            CMS Dashboard
          </Link>
          <span className="text-xs px-2 py-1 bg-muted rounded">{role}</span>
        </header>
        
        <div className="p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
