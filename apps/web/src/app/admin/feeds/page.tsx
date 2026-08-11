'use client';

import { useState, useEffect } from 'react';
import { RssFeed, fetchRssFeeds, createRssFeed, updateRssFeed, deleteRssFeed, Category, fetchCategories } from '@/lib/api';

export default function AdminFeedsPage() {
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [lang, setLang] = useState('en');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [feedsData, catsData] = await Promise.all([
        fetchRssFeeds(),
        fetchCategories()
      ]);
      setFeeds(feedsData);
      setCategories(catsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingFeed(null);
    setName('');
    setUrl('');
    setLang('en');
    setCategoryId('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (feed: RssFeed) => {
    setEditingFeed(feed);
    setName(feed.name);
    setUrl(feed.url);
    setLang(feed.lang);
    setCategoryId(feed.category_id);
    setIsActive(feed.is_active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryId === '') return;
    
    try {
      if (editingFeed) {
        await updateRssFeed(editingFeed.id, { name, url, lang, category_id: categoryId as number, is_active: isActive });
      } else {
        await createRssFeed({ name, url, lang, category_id: categoryId as number, is_active: isActive });
      }
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      alert("Error saving feed. Ensure URL is unique and valid.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this RSS feed?')) return;
    try {
      await deleteRssFeed(id);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Failed to delete feed.");
    }
  };

  const handleToggleActive = async (feed: RssFeed) => {
    try {
      await updateRssFeed(feed.id, { is_active: !feed.is_active });
      loadData();
    } catch (e) {
      alert("Failed to toggle status");
    }
  };

  if (loading) return <div>Loading RSS Feeds...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">RSS Feeds</h1>
        <button 
          onClick={openNewModal}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:opacity-90"
        >
          + Add Feed
        </button>
      </div>

      <div className="bg-background border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">URL</th>
                <th className="px-6 py-3 font-medium">Language</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {feeds.map((feed) => (
                <tr key={feed.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-semibold">{feed.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{feed.url}</td>
                  <td className="px-6 py-4 text-muted-foreground">{feed.lang.toUpperCase()}</td>
                  <td className="px-6 py-4 text-muted-foreground">{feed.category?.name_en}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleActive(feed)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${feed.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}`}
                    >
                      {feed.is_active ? 'ACTIVE' : 'PAUSED'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEditModal(feed)} className="text-primary hover:underline font-bold">Edit</button>
                      <button onClick={() => handleDelete(feed.id)} className="text-red-500 hover:underline font-bold">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {feeds.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No RSS Feeds found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md overflow-hidden border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold">{editingFeed ? 'Edit RSS Feed' : 'Add New Feed'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Feed Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-md" 
                  required 
                  placeholder="e.g. BBC Technology"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">RSS URL</label>
                <input 
                  type="url" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-md" 
                  required 
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <select 
                    value={lang} 
                    onChange={(e) => setLang(e.target.value)} 
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="en">English</option>
                    <option value="np">Nepali</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(Number(e.target.value))} 
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)} 
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Sync Active</label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:opacity-90"
                >
                  Save Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
