import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Send, Paperclip, X, Shield, Zap, FileText, ImageIcon, Loader2, Trash2, Mic, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import RegistrationForm from './RegistrationForm';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STORAGE_KEY = 'hakim_chat_history';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  isSecure?: boolean;
  files?: FilePreview[];
  audioBase64?: string;
}

interface FilePreview {
  name: string;
  type: string;
  preview: string;
  size: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trialEnded, setTrialEnded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Note: blob URLs in files.preview will be invalid after refresh
        setMessages(parsed);
      } catch (e) {
        console.error('Failed to parse saved messages', e);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear the clinical chat history?')) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && files.length === 0) || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      files: [...files]
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setFiles([]);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('prompt', input);
    // Convert FilePreview back to File objects for upload
    const fileObjects = await Promise.all(files.map(async f => {
      const res = await fetch(f.preview);
      const blob = await res.blob();
      return new File([blob], f.name, { type: f.type });
    }));

    if (fileObjects.length > 0) {
      // For simplicity, we handle one file upload at a time in this example.
      // The backend is set up for a single file with `upload.single('file')`
      formData.append('file', fileObjects[0]);
    }

    try {
      // The orchestrator response is now handled by the server after potential S3 upload
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      const decision = await response.json();

      if (decision.type === 'TRIAL_ENDED') {
        setTrialEnded(true);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: decision.text,
          model: decision.model,
          isSecure: decision.isSecure
        }]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "An error occurred during clinical reasoning. Please check system status.",
        model: 'System Error'
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-3xl border border-[#141414]/5 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-6 border-b border-[#141414]/5 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="text-lg font-bold">Clinical AI Orchestrator</h3>
          <p className="text-xs text-[#141414]/40">Multimodal PHI-Aware Reasoning</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[10px] font-bold text-red-600 hover:bg-red-100 transition-colors"
            title="Clear History"
          >
            <Trash2 size={12} /> CLEAR
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600">
            <Shield size={12} /> HIPAA SECURE
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {trialEnded ? (
          <RegistrationForm />
        ) : (
          <>
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                  <Activity className="text-emerald-600 w-8 h-8" />
                </div>
                <h4 className="text-xl font-serif italic mb-2">How can I assist your clinical workflow?</h4>
                <p className="text-sm text-[#141414]/50">
                  Upload radiology images or patient records. Our orchestrator will automatically route sensitive data to local sovereign AI.
                </p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  {msg.model && (
                    <div className={cn(
                      "flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      msg.isSecure ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {msg.model}
                    </div>
                  )}
                  
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-[#141414] text-white rounded-tr-none" 
                      : "bg-gray-100 text-[#141414] rounded-tl-none"
                  )}>
                    {msg.content}
                    
                    {msg.audioBase64 && (
                        <div className="mt-3">
                            <button onClick={() => alert('play audio')} className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-700 rounded-lg text-xs font-bold">
                                <Play size={14} />
                                Play Response
                            </button>
                        </div>
                    )}

                    {msg.files && msg.files.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.files.map((file, fi) => (
                          <div key={fi} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg border border-white/10">
                            {file.type.includes('image') ? <ImageIcon size={14} /> : <FileText size={14} />}
                            <span className="text-[10px] truncate max-w-[100px]">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <div className="flex items-center gap-3 text-[#141414]/40 italic text-xs">
                <Loader2 className="animate-spin" size={14} />
                Orchestrating clinical reasoning...
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gray-50/50 border-t border-[#141414]/5 chat-input">
        {/* File Previews */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-3 mb-4 overflow-x-auto pb-2"
            >
              {files.map((file, i) => (
                <div key={i} className="relative group flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl border border-[#141414]/10 bg-white overflow-hidden flex flex-col items-center justify-center p-2">
                    {file.type.includes('image') ? (
                      <img src={file.preview} alt="preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <FileText className="text-emerald-500 w-8 h-8" />
                    )}
                    <p className="text-[8px] mt-1 truncate w-full text-center">{file.name}</p>
                  </div>
                  <button 
                    onClick={() => removeFile(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="relative">
          <div {...getRootProps()} className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer p-2 rounded-full transition-colors upload-button",
            isDragActive ? "bg-emerald-100 text-emerald-600" : "hover:bg-gray-200 text-[#141414]/40"
          )}>
            <input {...getInputProps()} />
            <Paperclip size={20} />
          </div>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe symptoms or ask about clinical findings..."
            className="w-full pl-14 pr-28 py-4 bg-white border border-[#141414]/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
          />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
                onClick={() => alert('Start recording...')}
                className={cn(
                    "p-2 rounded-full transition-colors drive-button",
                    isRecording ? "bg-red-500/20 text-red-600 animate-pulse" : "hover:bg-gray-200 text-[#141414]/40"
                )}
            >
                <Mic size={18} />
            </button>
            <button 
              type="submit"
              disabled={isLoading || (!input.trim() && files.length === 0)}
              className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        
        <p className="mt-3 text-[10px] text-center text-[#141414]/30 uppercase tracking-widest font-bold">
          Encrypted & HIPAA Compliant Session
        </p>
      </div>
    </div>
  );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
