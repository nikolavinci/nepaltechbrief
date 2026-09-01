"use client";

import { useEffect, useState, useRef } from "react";

interface AdData {
  id: number;
  type: string;
  title: string;
  image_url: string;
  image_mobile_url?: string;
  code: string;
  click_url: string;
  disabled?: boolean;
}

export function DynamicAd({ position }: { position: "top" | "bottom" | "between_sections" | "sidebar" | "article_mid" | "ad_below_title_1" | "ad_below_title_2" | "ad_below_featured_1" | "ad_below_featured_2" | "ad_mid_1" | "ad_mid_2" | "ad_bottom_1" | "ad_bottom_2" }) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [loading, setLoading] = useState(true);
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchAd() {
      try {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.neptechbrief.com/wp-json/wp/v2";
        const apiUrl = baseApiUrl.replace(/\/wp\/v2\/?$/, '');
        // Fetch from /promos instead of /ads to prevent adblockers from blocking the JSON payload. Also added cache busting.
        const res = await fetch(`${apiUrl}/neptech/v1/promos?position=${position}&t=${Date.now()}`, { cache: 'no-store' });
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.disabled) {
            setAd(null); // disabled globally
          } else if (data && data.id) {
            setAd(data);
          }
        }
      } catch (e) {
        console.error("Ad fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAd();
  }, [position]);

  useEffect(() => {
    // If it's a 3rd party script (like AdSense), dangerouslySetInnerHTML won't execute <script> tags.
    // So we use ContextualFragment to safely parse and execute scripts inside the container!
    if (ad && ad.type === "third_party" && ad.code && codeRef.current) {
      codeRef.current.innerHTML = "";
      try {
        const fragment = document.createRange().createContextualFragment(ad.code);
        codeRef.current.appendChild(fragment);
      } catch (err) {
        console.error("Error rendering 3rd party ad code", err);
      }
    }
  }, [ad]);

  if (loading) return null;

  if (!ad) return null; // Ad position disabled or no ads exist

  if (ad.type === "third_party") {
    return (
      <div className="w-full flex justify-center items-center my-6 overflow-hidden">
        <div ref={codeRef} className="max-w-full" />
      </div>
    );
  }

  return (
    <a 
      href={ad.click_url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`block w-full relative group overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all border border-border/20 ${position === 'sidebar' ? 'my-4' : 'my-8 max-h-[130px]'}`}
    >
      <picture>
        {ad.image_mobile_url && <source media="(max-width: 768px)" srcSet={ad.image_mobile_url} />}
        <img 
          src={ad.image_url} 
          alt={ad.title} 
          className="w-full h-full object-cover rounded-2xl" 
        />
      </picture>
      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 text-[9px] text-white uppercase rounded-sm z-10 backdrop-blur-sm border border-white/20">
        Advertisement
      </div>
    </a>
  );
}



