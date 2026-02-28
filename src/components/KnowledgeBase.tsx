import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Upload, Search, FileText, Database, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function KnowledgeBase() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/knowledge');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('title', e.target.files[0].name);
    formData.append('type', 'DOCUMENT');

    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-serif italic mb-1">Medical Knowledge Base (RAG)</h3>
          <p className="text-sm text-[#141414]/40 uppercase tracking-widest font-bold">Local Research & Drug Generics</p>
        </div>
        {user?.role === 'ADMIN' && (
          <label className="cursor-pointer px-6 py-3 bg-[#141414] text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-[#141414]/10">
            {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
            Upload Medical Data
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>

      <div className="bg-white rounded-[32px] p-8 border border-[#141414]/5 shadow-sm">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search local medical research, drug databases, or lab protocols..."
            className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <FileText className="text-emerald-500 w-5 h-5" />
                  </div>
                  {user?.role === 'ADMIN' && (
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <h4 className="font-bold text-sm mb-2 line-clamp-2">{item.title}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">
                    {item.type}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Database className="text-gray-300 w-8 h-8" />
            </div>
            <p className="text-sm text-gray-400 font-medium">No medical data indexed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
