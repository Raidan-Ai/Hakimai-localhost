import React, { useState, useEffect } from 'react';
import { Mic, Save, Loader2, UploadCloud } from 'lucide-react';

const PREDEFINED_VOICES = {
  male: ['tts-1', 'echo', 'onyx'],
  female: ['tts-1-hd', 'nova', 'shimmer'],
};

export default function VoiceSettings() {
  const [config, setConfig] = useState({
    ttsMaleModel: 'tts-1',
    ttsFemaleModel: 'tts-1-hd',
  });
  const [isSaving, setIsSaving] = useState(false);

  // In a real app, you'd fetch this from /api/admin/config

  const handleSave = () => {
    setIsSaving(true);
    // Mock save
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm mt-8">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center">
                <Mic className="text-cyan-600 w-6 h-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold">Voice & TTS Models</h3>
                <p className="text-sm text-[#141414]/40">Configure the Text-to-Speech voice models.</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                Male Voice Model
                </label>
                <select
                    value={config.ttsMaleModel || ''}
                    onChange={(e) => setConfig({ ...config, ttsMaleModel: e.target.value })}
                    className="w-full px-6 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 appearance-none"
                >
                  {PREDEFINED_VOICES.male.map(voice => <option key={voice} value={voice}>{voice}</option>)}
                  <option value="custom">Custom...</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                Female Voice Model
                </label>
                <select
                    value={config.ttsFemaleModel || ''}
                    onChange={(e) => setConfig({ ...config, ttsFemaleModel: e.target.value })}
                    className="w-full px-6 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 appearance-none"
                >
                    {PREDEFINED_VOICES.female.map(voice => <option key={voice} value={voice}>{voice}</option>)}
                    <option value="custom">Custom...</option>
                </select>
            </div>
        </div>
        <div className="mt-6 pt-6 border-t border-[#141414]/5 flex justify-end">
             <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-[#141414] rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                <UploadCloud size={16} />
                Upload New Model (Placeholder)
            </button>
        </div>
    </div>
  );
}
