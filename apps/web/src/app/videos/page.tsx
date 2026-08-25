import React from 'react';
import { YouTubeEmbed } from '@next/third-parties/google';

export const metadata = {
  title: 'भिडियो ग्यालेरी - NepTechBrief',
  description: 'सबै मल्टिमिडिया र भिडियो सामग्रीहरू।',
};

export default function VideosPage() {
  const videos = [
    {
      id: "dQw4w9WgXcQ", 
      title: "Exclusive Interview: Tech Minister discussing the new AI policies 1",
      publishedAt: "२०२४-०५-१०",
    },
    {
      id: "jNQXAC9IVRw",
      title: "Exclusive Interview: Tech Minister discussing the new AI policies 2",
      publishedAt: "२०२४-०५-११",
    },
    {
      id: "ScMzIvxBSi4",
      title: "Exclusive Interview: Tech Minister discussing the new AI policies 3",
      publishedAt: "२०२४-०५-१२",
    },
    {
      id: "6ZfuNTqbHE8",
      title: "Nepal's Tech Ecosystem overview - Startups and Innovations",
      publishedAt: "२०२४-०५-१५",
    },
    {
      id: "YQHsXMglC9A",
      title: "Hands-on with the latest gadget releases in Nepal",
      publishedAt: "२०२४-०५-१८",
    },
    {
      id: "V-_O7nl0Ii0",
      title: "Future of AI in everyday life - Panel Discussion",
      publishedAt: "२०२४-०५-२०",
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      <header className="mb-10 border-b-2 border-red-700 pb-4 inline-block">
        <h1 className="text-4xl font-bold font-heading flex items-center gap-3">
          <span className="w-4 h-4 bg-red-600 inline-block rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]"></span>
          मल्टिमिडिया र भिडियो
        </h1>
        <p className="mt-2 text-muted-foreground">
          हाम्रा सबै भिडियो सामग्रीहरू यहाँ एकै ठाउँमा हेर्नुहोस्।
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video, idx) => (
          <div key={idx} className="flex flex-col gap-4 group bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all p-4">
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-black relative">
               <YouTubeEmbed 
                 videoid={video.id}
                 params="autoplay=1"
               />
            </div>
            <div className="flex flex-col flex-1">
              <h2 className="text-lg font-bold font-heading leading-tight group-hover:text-red-500 transition-colors mb-2">
                {video.title}
              </h2>
              <div className="mt-auto pt-3 border-t border-border/40 text-xs text-muted-foreground">
                <time>{video.publishedAt}</time>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
