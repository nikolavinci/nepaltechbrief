import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-zinc-950 text-zinc-300 py-16 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
        
        {/* Brand & Social Column */}
        <div className="md:col-span-4">
          <Link href={`/`} className="text-3xl font-extrabold tracking-tighter text-blue-500 hover:text-blue-400 transition-colors inline-block mb-4" aria-label="NepTechNews Home">
            NepTech<span className="text-orange-500">News</span>
          </Link>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed max-w-sm">
            नेपालको मुटुबाट विश्वसामु उच्च गुणस्तरको डिजिटल पत्रकारिता प्रदान गर्दै। हामी प्रविधि, स्टार्टअप, र ग्याजेट समाचारहरूको लागि तपाईंको भरपर्दो स्रोत हौं।
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-blue-600 text-white transition-colors" aria-label="Visit our Facebook page" title="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-blue-400 text-white transition-colors" aria-label="Visit our Twitter page" title="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
          </div>
        </div>
        
        {/* Categories Column */}
        <div className="md:col-span-3">
          <h3 className="font-bold text-white mb-6 uppercase tracking-wider">सुचना</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href={`/category/tech-news`} className="hover:text-blue-500 transition-colors" aria-label="Go to Tech News Category">टेक न्युज</Link></li>
            <li><Link href={`/category/gadgets`} className="hover:text-blue-500 transition-colors" aria-label="Go to Gadgets Category">ग्याजेट्स</Link></li>
            <li><Link href={`/category/apps-software`} className="hover:text-blue-500 transition-colors" aria-label="Go to Apps Category">एप्स र सफ्टवेयर</Link></li>
            <li><Link href={`/category/telecom`} className="hover:text-blue-500 transition-colors" aria-label="Go to Telecom Category">टेलिकम</Link></li>
          </ul>
        </div>

        {/* Company Column */}
        <div className="md:col-span-3">
          <h3 className="font-bold text-white mb-6 uppercase tracking-wider">कम्पनी</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href={`/about`} className="hover:text-blue-500 transition-colors" aria-label="Read About Us">हाम्रो बारेमा</Link></li>
            <li><Link href={`/contact`} className="hover:text-blue-500 transition-colors" aria-label="Contact Us">सम्पर्क</Link></li>
            <li><Link href={`/team`} className="hover:text-blue-500 transition-colors" aria-label="Meet the Editorial Team">सम्पादकीय टोली</Link></li>
          </ul>
        </div>

        {/* Legal Column */}
        <div className="md:col-span-2">
          <h3 className="font-bold text-white mb-6 uppercase tracking-wider">कानूनी</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href={`/privacy`} className="hover:text-blue-500 transition-colors" aria-label="Read Privacy Policy">गोपनीयता नीति</Link></li>
            <li><Link href={`/terms`} className="hover:text-blue-500 transition-colors" aria-label="Read Terms of Service">सेवाका सर्तहरु</Link></li>
            <li><Link href={`/sitemap.xml`} className="hover:text-blue-500 transition-colors flex items-center gap-2" aria-label="View Sitemap">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
              साइटम्याप
            </Link></li>
            <li><a href={`/feed.xml`} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors flex items-center gap-2 text-orange-400" aria-label="RSS Feed">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
              आरएसएस फिड
            </a></li>
          </ul>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>© {currentYear} NepTechNews. सर्वाधिकार सुरक्षित।</p>
        <p>परिशुद्धताका साथ डिजाइन र विकास गरिएको।</p>
      </div>
    </footer>
  );
}
