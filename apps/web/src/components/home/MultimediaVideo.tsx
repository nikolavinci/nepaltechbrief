import Link from 'next/link';

export function MultimediaVideo() {
  const videos = [
    {
      id: "dQw4w9WgXcQ", 
      title: "Exclusive Interview: Tech Minister discussing the new AI policies 1",
    },
    {
      id: "jNQXAC9IVRw",
      title: "Exclusive Interview: Tech Minister discussing the new AI policies 2",
    },
    {
      id: "ScMzIvxBSi4",
      title: "Exclusive Interview: Tech Minister discussing the new AI policies 3",
    }
  ];

  return (
    <section className="mb-12 border border-zinc-800 rounded-xl bg-[#0a0a0a] p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4 border-b border-red-700 pb-3">
        <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
          <span className="w-3 h-3 bg-red-600 inline-block rounded-full"></span>
          मल्टिमिडिया र भिडियो
        </h2>
        <Link href="/videos" className="text-xs font-semibold hover:underline text-zinc-300">
          सबै हेर्नुहोस् →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {videos.map((video, idx) => (
          <div key={idx} className="flex flex-col gap-3 group">
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shadow-sm hover:shadow-xl transition-shadow relative">
               <iframe 
                 className="w-full h-full border-none"
                 src={`https://www.youtube.com/embed/${video.id}`}
                 title={video.title}
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
               ></iframe>
            </div>
            <h3 className="text-white font-bold text-sm leading-snug group-hover:text-red-500 transition-colors">
              {video.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}
