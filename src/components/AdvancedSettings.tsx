import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Save, Loader2, CheckCircle2, AlertCircle, Terminal, Key } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdvancedSettings() {
  const [config, setConfig] = useState({
    remoteGpuUrl: '',
    n8nWebhookUrl: '',
  });
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // In a real app, you'd fetch both config and API keys
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
        setMessage({ type: 'success', text: 'Advanced settings updated successfully.' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateKey = async () => {
      // This is a placeholder for the API key generation logic
      alert("API Key generation logic would be implemented here.")
  }

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Remote GPU Settings */}
      <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Zap className="text-purple-600 w-6 h-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold">Remote GPU & Advanced Tools</h3>
                <p className="text-sm text-[#141414]/40">Configure external compute and automation endpoints.</p>
            </div>
        </div>
        <div className="space-y-6">
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                Remote GPU Endpoint (Optional)
                </label>
                <div className="relative">
                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-4 h-4" />
                    <input
                        type="text"
                        value={config.remoteGpuUrl || ''}
                        onChange={(e) => setConfig({ ...config, remoteGpuUrl: e.target.value })}
                        placeholder="https://your-runpod-id.runpod.net/api/v1/generate"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                </div>
                <p className="mt-2 text-[10px] text-[#141414]/30 uppercase font-bold tracking-tight">
                    For models requiring high-end GPUs. Must be an OpenAI-compatible endpoint.
                </p>
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                n8n Webhook URL (Optional)
                </label>
                <div className="relative">
                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-4 h-4" />
                    <input
                        type="text"
                        value={config.n8nWebhookUrl || ''}
                        onChange={(e) => setConfig({ ...config, n8nWebhookUrl: e.target.value })}
                        placeholder="https://n8n.your-clinic.com/webhook/hakim-agent"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                </div>
                 <p className="mt-2 text-[10px] text-[#141414]/30 uppercase font-bold tracking-tight">
                    Trigger n8n workflows for complex agentic tasks and automations.
                </p>
            </div>
        </div>
      </div>

      {/* API Key Management */}
       <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
                <Key className="text-rose-600 w-6 h-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold">External API Keys</h3>
                <p className="text-sm text-[#141414]/40">Allow external apps (mobile, desktop) to use Hakim AI.</p>
            </div>
        </div>
        <div className="flex gap-4 mb-6">
            <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Enter a name for the new key (e.g., 'Mobile App')"
                className="flex-1 px-6 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            <button
                onClick={handleGenerateKey}
                disabled={isGeneratingKey || !newKeyName}
                className="px-6 py-3 bg-[#141414] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
                {isGeneratingKey ? <Loader2 className="animate-spin"/> : <Key size={16} />}
                Generate New Key
            </button>
        </div>
        <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#141414]/30 mb-4">Active Keys</p>
            {/* Placeholder for API key list */}
            <div className="p-8 text-center bg-gray-50 rounded-2xl border-dashed border-2 border-gray-100">
                <p className="text-sm text-gray-400 italic">API key management UI goes here.</p>
            </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between mt-8 pt-8 border-t border-[#141414]/5">
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
            {isSaving ? 'Saving...' : 'Save Advanced Settings'}
          </button>
      </div>
    </div>
  );
}
