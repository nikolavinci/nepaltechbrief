import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function WebStoryViewer({ 
  params 
}: { 
  params: Promise<{ lang: string, id: string }> 
}) {
  const { lang, id } = await params;
  const isEn = lang === 'en';

  const storyId = parseInt(id);
  if (isNaN(storyId)) return notFound();

  // Simple manual navigation simulation
  const nextId = storyId + 1;
  const prevId = storyId > 1 ? storyId - 1 : 1;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center sm:p-4">
      
      {/* Mobile-style Container */}
      <div className="relative w-full h-full sm:w-[400px] sm:h-[800px] sm:max-h-[90vh] sm:rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl shadow-black">
        
        {/* Background Image */}
        <img 
          src={`https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop&sig=${storyId + 100}`} 
          alt="Story Background" 
          className="absolute inset-0 object-cover w-full h-full opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />

        {/* Progress Bar (Fake) */}
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
          <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white w-full rounded-full"></div>
          </div>
          <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white w-[30%] rounded-full"></div>
          </div>
          <div className="h-1 flex-1 bg-white/30 rounded-full"></div>
        </div>

        {/* Top Controls */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
              NTN
            </div>
            <span className="text-white font-semibold text-sm">NepTechNews</span>
            <span className="text-white/60 text-xs ml-2">2h</span>
          </div>
          
          <Link href={`/${lang}`} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Link>
        </div>

        {/* Content */}
        <div className="absolute bottom-16 left-6 right-6 z-10">
          <span className="bg-primary text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded mb-4 inline-block">
            {isEn ? 'Tech News' : 'प्रविधि समाचार'}
          </span>
          <h1 className="text-white font-extrabold text-3xl leading-tight mb-4 drop-shadow-lg">
            {isEn 
              ? `The untold story of the new tech startup boom in the valley - Part ${storyId}` 
              : `उपत्यकामा नयाँ प्राविधिक स्टार्टअप बुमको नभनिएको कथा - भाग ${storyId}`}
          </h1>
          <p className="text-white/90 text-lg leading-snug drop-shadow-md">
            {isEn 
              ? 'Hundreds of new founders are flocking to the capital as new policies make it easier than ever to secure seed funding and launch digital products.'
              : 'नयाँ नीतिहरूले बीउ कोष सुरक्षित गर्न र डिजिटल उत्पादनहरू लन्च गर्न पहिले भन्दा सजिलो बनाएपछि सयौं नयाँ संस्थापकहरू राजधानीतर्फ ओइरिरहेका छन्।'}
          </p>
        </div>

        {/* Manual Navigation Tap Zones */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-20">
          {storyId > 1 && (
            <Link href={`/${lang}/web-stories/${prevId}`} className="w-full h-full block" aria-label="Previous story" />
          )}
        </div>
        <div className="absolute inset-y-0 right-0 w-2/3 z-20">
          <Link href={`/${lang}/web-stories/${nextId}`} className="w-full h-full block" aria-label="Next story" />
        </div>

        {/* Swipe Up Hint */}
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center justify-center text-white/70 animate-bounce z-10 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          <span className="text-xs uppercase font-bold tracking-widest mt-1">
            {isEn ? 'Read Article' : 'लेख पढ्नुहोस्'}
          </span>
        </div>
      </div>
    </div>
  );
}
