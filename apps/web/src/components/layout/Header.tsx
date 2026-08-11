'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50 shadow-sm">
      {/* Top breaking news bar */}
      <div className="bg-primary text-primary-foreground text-xs py-2 px-4 flex justify-between items-center">
        <div>
          <span className="font-bold mr-2 tracking-wide">ताजा अपडेट:</span>
          <span>प्रविधिको दुनियाँमा आजको मुख्य समाचार यहाँ हेर्नुहोस्।</span>
        </div>
        <div className="hidden sm:block font-medium" suppressHydrationWarning>
          {new Date().toLocaleDateString('ne-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
        <div className="flex items-center gap-8">
          <Link href={`/`} className="text-3xl font-extrabold tracking-tighter text-blue-600 dark:text-blue-400" aria-label="NepTechNews Home">
            NepTech<span className="text-orange-500">News</span>
          </Link>
          <nav className="hidden lg:flex gap-6 text-base font-semibold" aria-label="Main Navigation">
            <Link href={`/category/tech-news`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">टेक न्युज</Link>
            <Link href={`/category/gadgets`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">ग्याजेट्स</Link>
            <Link href={`/category/apps-software`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">एप्स र सफ्टवेयर</Link>
            <Link href={`/category/telecom`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">टेलिकम</Link>
            <Link href={`/category/startups`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">स्टार्टअप</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 border rounded-full hover:bg-muted transition-colors text-muted-foreground" 
            aria-label={isSearchOpen ? "Close Search" : "Open Search"}
            aria-expanded={isSearchOpen}
          >
            {isSearchOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            )}
          </button>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="absolute top-full right-0 mt-2 p-4 bg-background border rounded-lg shadow-xl z-50 w-full sm:w-96 animate-in slide-in-from-top-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input 
                type="search" 
                placeholder="समाचार खोज्नुहोस्..." 
                className="flex-1 px-4 py-2 bg-muted border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                aria-label="Search Input"
              />
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors" aria-label="Submit Search">
                खोज
              </button>
            </form>
          </div>
        )}

      </div>
    </header>
  );
}
