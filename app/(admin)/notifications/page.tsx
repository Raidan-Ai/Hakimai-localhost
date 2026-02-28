'use client';

import React, { useState } from 'react';
import { Bell, Send } from 'lucide-react';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    // In a real app, this would call an API route like /api/admin/notifications
    // which would then create a SystemNotification for each doctor.
    alert(`Notification Sent: ${title}`);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Bell className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Notification Center</h3>
            <p className="text-sm text-gray-500">Broadcast system-wide alerts to all doctors.</p>
          </div>
        </div>

        <div className="space-y-4">
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification Title (e.g., System Update)"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            rows={6}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          />
        </div>

        <button onClick={handleSend} className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#141414] text-white rounded-xl font-bold text-sm">
          <Send size={16} />
          Broadcast Notification
        </button>
      </div>
    </div>
  );
}
