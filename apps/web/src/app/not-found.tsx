import Link from 'next/link';
import { NotFoundClient } from '@/components/NotFoundClient';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center min-h-[70vh] flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <NotFoundClient />
      
      <Link 
        href="/" 
        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
