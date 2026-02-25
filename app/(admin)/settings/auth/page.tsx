'use client';

import React, { useState } from 'react';
import { Lock, Save, Loader2, Globe } from 'lucide-react';

export default function AdminAuthSettingsPage() {
  const [authConfig, setAuthConfig] = useState({
    isGoogleLoginEnabled: true,
    googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
    googleClientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    isLinkedinLoginEnabled: false,
    linkedinClientId: '',
    linkedinClientSecret: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // In a real app, this would post to /api/admin/config
    console.log('Saving Auth Config:', authConfig);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl border border-[#141414]/5 shadow-sm">
      <h2 className="text-2xl font-bold mb-2">Authentication & OAuth Providers</h2>
      <p className="text-sm text-[#141414]/50 mb-8">Manage how users can sign in to Hakim AI.</p>

      <div className="space-y-8">
        {/* Google Provider */}
        <div className="p-6 border border-gray-100 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Google Login</h3>
            <button 
                onClick={() => setAuthConfig({ ...authConfig, isGoogleLoginEnabled: !authConfig.isGoogleLoginEnabled })}
                className={`w-12 h-6 rounded-full flex items-center transition-colors ${authConfig.isGoogleLoginEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'}`}>
                <span className="w-5 h-5 bg-white rounded-full shadow block transform" />
            </button>
          </div>
          <div className={`space-y-4 transition-opacity ${authConfig.isGoogleLoginEnabled ? 'opacity-100' : 'opacity-50'}`}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Google Client ID</label>
              <input type="text" value={authConfig.googleClientId} onChange={(e) => setAuthConfig({...authConfig, googleClientId: e.target.value})} disabled={!authConfig.isGoogleLoginEnabled} className="w-full px-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Google Client Secret</label>
              <input type="password" value={authConfig.googleClientSecret} onChange={(e) => setAuthConfig({...authConfig, googleClientSecret: e.target.value})} disabled={!authConfig.isGoogleLoginEnabled} className="w-full px-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm" />
            </div>
          </div>
        </div>

        {/* LinkedIn Provider */}
        <div className="p-6 border border-gray-100 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">LinkedIn Login</h3>
            <button 
                onClick={() => setAuthConfig({ ...authConfig, isLinkedinLoginEnabled: !authConfig.isLinkedinLoginEnabled })}
                className={`w-12 h-6 rounded-full flex items-center transition-colors ${authConfig.isLinkedinLoginEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'}`}>
                <span className="w-5 h-5 bg-white rounded-full shadow block transform" />
            </button>
          </div>
          <div className={`space-y-4 transition-opacity ${authConfig.isLinkedinLoginEnabled ? 'opacity-100' : 'opacity-50'}`}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">LinkedIn Client ID</label>
              <input type="text" value={authConfig.linkedinClientId} onChange={(e) => setAuthConfig({...authConfig, linkedinClientId: e.target.value})} disabled={!authConfig.isLinkedinLoginEnabled} className="w-full px-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">LinkedIn Client Secret</label>
              <input type="password" value={authConfig.linkedinClientSecret} onChange={(e) => setAuthConfig({...authConfig, linkedinClientSecret: e.target.value})} disabled={!authConfig.isLinkedinLoginEnabled} className="w-full px-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-[#141414]/5 flex justify-end">
        <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-[#141414] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-[#141414]/10 flex items-center gap-2">
          {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
          {isSaving ? 'Saving...' : 'Save Auth Settings'}
        </button>
      </div>
    </div>
  );
}
