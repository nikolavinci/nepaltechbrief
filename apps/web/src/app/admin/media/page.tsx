import { auth } from '@/auth';
import Image from 'next/image';

export default async function AdminMediaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth();
  const accessToken = (session as any)?.accessToken;

  let media: any[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      media = data.data || [];
    }
  } catch (err) {
    console.error('Error fetching media', err);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage all uploaded images and files.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((file) => (
          <div key={file.id} className="border rounded-lg overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow group relative">
            <div className="aspect-square relative bg-muted flex items-center justify-center">
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${file.file_path}`}
                alt={file.file_name}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-2 text-xs truncate">
              {file.file_name}
            </div>
          </div>
        ))}
        {media.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
            No media found. Upload images while writing articles to see them here.
          </div>
        )}
      </div>
    </div>
  );
}
