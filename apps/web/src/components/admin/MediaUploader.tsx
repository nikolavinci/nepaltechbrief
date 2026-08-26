"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function MediaUploader({ accessToken }: { accessToken: string }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData,
      });

      if (res.ok) {
        // Force server components to re-fetch
        router.refresh();
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleUpload} 
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="bg-[#2271b1] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#135e96] transition-colors flex items-center gap-2 shadow-sm text-[13px] disabled:opacity-50"
      >
        {uploading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        )}
        {uploading ? 'Uploading...' : 'Add New'}
      </button>
    </div>
  );
}
