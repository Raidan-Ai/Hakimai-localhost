import React, { useState, useEffect } from 'react';
import { Settings, Server, Cpu, CheckCircle2, AlertCircle, Loader2, Globe, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PROVIDERS = [
  { name: 'Ollama', defaultUrl: 'http://127.0.0.1:11434', defaultModel: 'llava-med:latest' },
  { name: 'LM Studio', defaultUrl: 'http://127.0.0.1:1234/v1', defaultModel: 'mradermacher/Llava-Med-v1.5-7b-GGUF' },
  { name: 'GPT4All', defaultUrl: 'http://127.0.0.1:4891/v1', defaultModel: 'Llava-v1.5-7B' },
  { name: 'Custom OpenAI-Compatible API', defaultUrl: 'http://localhost:8080/v1', defaultModel: 'custom-model' },
];

export default function AISettings() {
  const [provider, setProvider] = useState(PROVIDERS[0].name);
  const [url, setUrl] = useState(PROVIDERS[0].defaultUrl);
  const [model, setModel] = useState(PROVIDERS[0].defaultModel);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Update defaults when provider changes
  useEffect(() => {
    const selected = PROVIDERS.find(p => p.name === provider);
    if (selected) {
      setUrl(selected.defaultUrl);
      setModel(selected.defaultModel);
      setTestResult(null);
    }
  }, [provider]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/admin/ping-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, provider }),
      });
      const data = await response.json();
      setTestResult({ success: data.success, message: data.message });
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to reach the local server.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    // In a real app, this would save to the database via an API call
    alert('Configuration saved successfully. Local AI is now active.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Cpu className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Local AI Provider Configuration</h3>
            <p className="text-sm text-[#141414]/40">Configure sovereign AI engines for offline clinical reasoning.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                AI Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {PROVIDERS.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                Local Endpoint URL
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-4 h-4" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://127.0.0.1:11434"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                Active Model Name
              </label>
              <div className="relative">
                <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-4 h-4" />
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="llava-med:latest"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-4">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <ShieldCheck size={18} /> Sovereign AI Benefits
              </div>
              <ul className="text-xs text-indigo-800/70 space-y-2 list-disc pl-4">
                <li>Zero PHI data leaves the clinic network</li>
                <li>Full clinical reasoning availability during internet outages</li>
                <li>No per-token costs for local inference</li>
                <li>Low-latency processing for radiology images</li>
              </ul>
            </div>

            <div className="mt-6 space-y-4">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="w-full py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isTesting ? <Loader2 className="animate-spin w-4 h-4" /> : <Settings className="w-4 h-4" />}
                {isTesting ? 'Testing Connection...' : 'Test Connection'}
              </button>

              <AnimatePresence>
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl flex items-center gap-3 text-xs font-medium ${
                      testResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}
                  >
                    {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {testResult.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#141414]/5 flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-[#141414] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-[#141414]/10"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
