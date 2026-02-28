'use client';

import React, { useState } from 'react';
import { User, AtSign, Stethoscope, Palette, Bell, Save, Loader2 } from 'lucide-react';

export default function DoctorSettingsPage() {
  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. Evelyn Reed',
    email: 'e.reed@hakim.ai',
    specialization: 'Cardiology',
    bio: 'Experienced cardiologist with a focus on preventative care and digital health innovations.',
    themePreference: 'light',
    notifications: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Mock save operation
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl border border-[#141414]/5 shadow-sm">
      <h2 className="text-2xl font-bold mb-2">Doctor Profile & Settings</h2>
      <p className="text-sm text-[#141414]/50 mb-8">Manage your personal information, preferences, and notifications.</p>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-4 h-4" />
              <input type="text" value={doctorInfo.name} onChange={(e) => setDoctorInfo({...doctorInfo, name: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Email Address</label>
            <div className="relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-4 h-4" />
              <input type="email" value={doctorInfo.email} disabled className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-[#141414]/10 rounded-xl text-sm text-gray-400 cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Specialization</label>
          <div className="relative">
            <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-4 h-4" />
            <input type="text" value={doctorInfo.specialization} onChange={(e) => setDoctorInfo({...doctorInfo, specialization: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Biography</label>
          <textarea value={doctorInfo.bio} onChange={(e) => setDoctorInfo({...doctorInfo, bio: e.target.value})} rows={4} className="w-full p-4 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm"></textarea>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#141414]/5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">UI Theme</label>
            <div className="flex gap-2">
              <button onClick={() => setDoctorInfo({...doctorInfo, themePreference: 'light'})} className={`flex-1 py-3 rounded-xl text-sm font-bold ${doctorInfo.themePreference === 'light' ? 'bg-[#141414] text-white' : 'bg-gray-100'}`}>Light</button>
              <button onClick={() => setDoctorInfo({...doctorInfo, themePreference: 'dark'})} className={`flex-1 py-3 rounded-xl text-sm font-bold ${doctorInfo.themePreference === 'dark' ? 'bg-[#141414] text-white' : 'bg-gray-100'}`}>Dark</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Notifications</label>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl h-full">
                <div>
                    <label className="font-bold text-sm">Enable Email Notifications</label>
                </div>
                <button 
                    onClick={() => setDoctorInfo({ ...doctorInfo, notifications: !doctorInfo.notifications })}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${doctorInfo.notifications ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'}`}>
                    <span className="w-5 h-5 bg-white rounded-full shadow block transform" />
                </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#141414]/5">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Integrations</label>
            <a href="/api/auth/gdrive/connect" className="w-full max-w-xs px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 0 0 10-10h-2a8 8 0 0 1-8 8v2z"/><path d="M2 12a10 10 0 0 1 10-10v2a8 8 0 0 0-8 8H2z"/><path d="m16.5 10.5-4-4-4 4"/><path d="m12.5 6.5 v8"/></svg>
              Connect Google Drive
            </a>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-[#141414]/5 flex justify-end">
        <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/10 flex items-center gap-2">
          {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
