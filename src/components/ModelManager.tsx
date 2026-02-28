import React, { useState, useEffect } from 'react';
import { Cpu, Download, Loader2, CheckCircle2, AlertCircle, Trash2, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';

interface Model {
  name: string;
  size: number;
  modified_at: string;
}

export default function ModelManager() {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <div className="p-8"><p className="text-red-500">Access Denied. Admin privileges required.</p></div>;
  }
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pullingModel, setPullingModel] = useState('');
  const [pullProgress, setPullProgress] = useState<{ status: string; completed?: number; total?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/admin/models');
      const data = await res.json();
      setModels(data.models || []);
      setError(null);
    } catch (err) {
      setError('Failed to connect to local Ollama instance.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handlePullModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pullingModel) return;

    setPullProgress({ status: 'Initiating pull...' });
    
    try {
      const response = await fetch('/api/admin/pull-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pullingModel }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            setPullProgress(data);
            if (data.status === 'success') {
              setPullingModel('');
              fetchModels();
            }
          } catch (e) {
            // Partial JSON chunk, ignore
          }
        }
      }
    } catch (err) {
      setError('Failed to pull model. Check your internet connection.');
    } finally {
      setPullProgress(null);
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Box className="text-emerald-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Local AI Model Manager</h3>
            <p className="text-sm text-[#141414]/40">Manage LLM assets on the clinic's edge server.</p>
          </div>
        </div>

        <form onSubmit={handlePullModel} className="flex gap-4 mb-12">
          <div className="flex-1 relative">
            <Download className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-4 h-4" />
            <input
              type="text"
              value={pullingModel}
              onChange={(e) => setPullingModel(e.target.value)}
              placeholder="Enter model name (e.g., llava-med, llama3)"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-[#141414]/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={!!pullProgress || !pullingModel}
            className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {pullProgress ? <Loader2 className="animate-spin w-4 h-4" /> : <Download size={16} />}
            {pullProgress ? 'Pulling...' : 'Pull Model'}
          </button>
        </form>

        <AnimatePresence>
          {pullProgress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-100"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-widest">
                  {pullProgress.status}
                </span>
                {pullProgress.completed && pullProgress.total && (
                  <span className="text-xs font-bold text-emerald-700">
                    {Math.round((pullProgress.completed / pullProgress.total) * 100)}%
                  </span>
                )}
              </div>
              <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-600"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: pullProgress.completed && pullProgress.total 
                      ? `${(pullProgress.completed / pullProgress.total) * 100}%` 
                      : '100%' 
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#141414]/30 mb-4">Installed Models</h4>
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-600" /></div>
          ) : models.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-[#141414]/10">
              <p className="text-sm text-[#141414]/40 italic">No models found on local instance.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {models.map((model) => (
                <div key={model.name} className="p-6 bg-white border border-[#141414]/5 rounded-2xl flex items-center justify-between hover:border-emerald-200 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                      <Cpu className="text-[#141414]/20 group-hover:text-emerald-600 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{model.name}</p>
                      <p className="text-[10px] text-[#141414]/30 uppercase tracking-wider font-bold">
                        {formatSize(model.size)} • Modified {new Date(model.modified_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest">
                      Active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3 text-xs font-bold">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
