'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Category } from '@/lib/api';

export default function CategoriesAdminPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [nameEn, setNameEn] = useState('');
  const [nameNp, setNameNp] = useState('');
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (cat?: Category) => {
    if (cat) {
      setCurrentId(cat.id);
      setNameEn(cat.name_en);
      setNameNp(cat.name_np || '');
    } else {
      setCurrentId(null);
      setNameEn('');
      setNameNp('');
    }
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!session) return;
    const method = currentId ? 'PUT' : 'POST';
    const url = currentId ? `${API_URL}/categories/${currentId}` : `${API_URL}/categories`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any).accessToken}`
        },
        body: JSON.stringify({ name_en: nameEn, name_np: nameNp })
      });
      if (res.ok) {
        setIsOpen(false);
        fetchCategories();
      } else {
        alert('Failed to save category');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!session || !confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(session as any).accessToken}`
        }
      });
      if (res.ok) {
        fetchCategories();
      } else {
        alert('Failed to delete');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading categories...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={() => openModal()}>Add Category</Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name (English)</TableHead>
              <TableHead>Name (Nepali)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.id}</TableCell>
                <TableCell className="font-medium">{cat.name_en}</TableCell>
                <TableCell>{cat.name_np}</TableCell>
                <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openModal(cat)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(cat.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No categories found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name (English)</label>
              <Input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="e.g. Technology" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name (Nepali)</label>
              <Input value={nameNp} onChange={e => setNameNp(e.target.value)} placeholder="e.g. प्रविधि" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
