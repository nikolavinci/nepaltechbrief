import { LoginForm } from '@/components/auth/LoginForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth();

  // If already logged in, redirect to admin
  if (session?.user) {
    redirect(`/${lang}/admin`);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-background border rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary mb-2">NepTechNews</h1>
          <p className="text-muted-foreground text-sm">Sign in to the CMS Admin Dashboard</p>
        </div>
        
        <LoginForm lang={lang} />
        
        <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
          <p>SuperAdmin, Chief Editor, Category Editor, or Journalist access required.</p>
        </div>
      </div>
    </div>
  );
}
