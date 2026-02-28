'use client';

import React, { useState, useEffect } from 'react';
import { X, File, Image, Loader2 } from 'lucide-react';

export default function GoogleDrivePicker({ isOpen, onClose, onFileSelect }) {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gdrive/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files from Google Drive');
      }
      const data = await response.json();
      setFiles(data.files);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Select a file from Google Drive</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}
          {error && <div className="text-red-500">{error}</div>}
          {!isLoading && !error && (
            <ul className="space-y-2">
              {files.map(file => (
                <li key={file.id} onClick={() => onFileSelect(file)} className="p-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  {file.mimeType.startsWith('image/') ? <Image size={20} className="text-gray-500" /> : <File size={20} className="text-gray-500" />}
                  <span className="font-medium text-sm">{file.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
