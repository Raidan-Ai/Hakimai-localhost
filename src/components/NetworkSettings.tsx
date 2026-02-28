import React, { useState, useEffect } from 'react';
import { Globe, Save, Loader2, CheckCircle2, AlertCircle, Server } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';

export default function NetworkSettings() {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <div className="p-8"><p className="text-red-500">Access Denied. Admin privileges required.</p></div>;
  }
  const [config, setConfig] = useState({
    baseUrl: '',
    aiMode: 'CLOUD',
    activeCloud: 'GEMINI',
    ollamaUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Network configuration updated successfully.' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update configuration.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Globe className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Network & Routing</h3>
            <p className="text-sm text-[#141414]/40">Configure system endpoints and deployment domains.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
              System Base URL
            </label>
            <div className="relative">
              <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-4 h-4" />
              <input
                type="text"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="https://app.clinic.local"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <p className="mt-2 text-[10px] text-[#141414]/30 uppercase font-bold tracking-tight">
              Used for self-referential links and OAuth callbacks.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                Active AI Mode
              </label>
              <select
                value={config.aiMode}
                onChange={(e) => setConfig({ ...config, aiMode: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="CLOUD">Cloud Only (Gemini/OpenAI)</option>
                <option value="LOCAL_EDGE">Local Edge Only (Ollama)</option>
                <option value="HYBRID">Hybrid Intelligent Routing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                Preferred Cloud Provider
              </label>
              <select
                value={config.activeCloud}
                onChange={(e) => setConfig({ ...config, activeCloud: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="GEMINI">Google Gemini</option>
                <option value="OPENAI">OpenAI GPT-4</option>
                <option value="ANTHROPIC">Anthropic Claude</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#141414]/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {message && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                  message.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {message.text}
              </motion.div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-[#141414] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-[#141414]/10 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Update Network Config'}
          </button>
        </div>
      </div>
    </div>
  );
}
