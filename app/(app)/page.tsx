'use client';

import React, { useState } from 'react';
import { Paperclip, Send, Bot, User } from 'lucide-react';
import GoogleDrivePicker from '../components/GoogleDrivePicker';

// For simplicity, sub-components are in the same file.
// In a larger app, these would be in their own files.

const ChatHeader = () => (
  <div className="p-4 bg-white border-b flex items-center gap-4">
    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
      <Bot className="text-emerald-600" />
    </div>
    <div>
      <h2 className="font-bold text-lg">Hakim AI Orchestrator</h2>
      <p className="text-sm text-gray-500">Online - Connected to Local & Cloud Models</p>
    </div>
  </div>
);

const ChatMessages = () => {
  // This would come from state management (e.g., Riverpod/Zustand)
  const messages = [
    { role: 'assistant', content: 'Hello Dr. Reed. How can I assist you today? You can ask a question, upload a local file, or select a file from your connected Google Drive.' },
  ];

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((msg, index) => (
        <div key={index} className={`flex gap-3 my-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'assistant' && <Bot className="w-6 h-6 text-emerald-500 flex-shrink-0" />}
          <div className={`p-3 rounded-2xl max-w-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
            {msg.content}
          </div>
          {msg.role === 'user' && <User className="w-6 h-6 text-blue-500 flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
};

const ChatInput = ({ onGoogleDriveClick }) => {
  return (
    <div className="p-4 bg-white border-t">
      <div className="relative">
        <textarea
          className="w-full p-4 pr-32 rounded-xl bg-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          placeholder="Describe symptoms, ask a question, or upload a file..."
          rows={2}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <Paperclip size={20} />
          </button>
          <button onClick={onGoogleDriveClick} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10.4 17.6 8 15.2l2.4-2.4"/><path d="m13.6 12.4 2.4 2.4-2.4 2.4"/></svg>
          </button>
          <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const [isPickerOpen, setPickerOpen] = useState(false);

  const handleFileSelect = (file) => {
    console.log('Selected file from Google Drive:', file);
    // In a real app, this would trigger a download from the backend and then send to the /api/chat endpoint.
    alert(`Selected: ${file.name}`);
    setPickerOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader />
      <ChatMessages />
      <ChatInput onGoogleDriveClick={() => setPickerOpen(true)} />
      <GoogleDrivePicker 
        isOpen={isPickerOpen} 
        onClose={() => setPickerOpen(false)} 
        onFileSelect={handleFileSelect} 
      />
    </div>
  );
}
