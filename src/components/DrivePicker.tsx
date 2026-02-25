import React, { useState, useEffect } from 'react';
import { Folder, FileText, Image, Loader2, X, ChevronRight, Home } from 'lucide-react';
import { motion } from 'motion/react';

// Mock data to simulate API response. This will be replaced by a real API call.
const mockFiles = [
    { id: '1', name: 'Patient Reports', mimeType: 'application/vnd.google-apps.folder' },
    { id: '2', name: 'X-Rays Q1 2026', mimeType: 'application/vnd.google-apps.folder' },
    { id: '3', name: 'report-john-doe.pdf', mimeType: 'application/pdf', size: '2.1 MB' },
    { id: '4', name: 'chest-xray-jane-smith.jpg', mimeType: 'image/jpeg', size: '5.4 MB' },
    { id: '5', name: 'research-notes.txt', mimeType: 'text/plain', size: '12 KB' },
];

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
}

interface DrivePickerProps {
  onFileSelect: (file: { id: string; name: string }) => void;
  onClose: () => void;
}

export default function DrivePicker({ onFileSelect, onClose }: DrivePickerProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [path, setPath] = useState<{ id: string; name: string }[]>([{ id: 'root', name: 'My Drive' }]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentFolderId = path[path.length - 1].id;

  useEffect(() => {
    const fetchDriveFiles = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedFile(null);
      try {
        // TODO: Replace with a real API call to `/api/drive/list-files`
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setFiles(mockFiles);

      } catch (err: any) {
        setError(err.message || 'Could not connect to Google Drive.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriveFiles();
  }, [currentFolderId]);

  const handleFileClick = (file: DriveFile) => {
    if (file.mimeType.includes('folder')) {
      setPath([...path, { id: file.id, name: file.name }]);
    } else if (isSelectable(file)) {
      setSelectedFile(file.id === selectedFile?.id ? null : file);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setPath(path.slice(0, index + 1));
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <Folder className="w-6 h-6 text-sky-500" />;
    if (mimeType.startsWith('application/pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (mimeType.startsWith('image/')) return <Image className="w-6 h-6 text-purple-500" />;
    return <FileText className="w-6 h-6 text-gray-400" />;
  };

  const isSelectable = (file: DriveFile) => {
      return file.mimeType.startsWith('application/pdf') || file.mimeType.startsWith('image/');
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl h-[70vh] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Select from Google Drive</h2>
            <p className="text-xs text-gray-400">Select a PDF report or medical image to analyze.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </header>

        <nav className="p-4 border-b border-gray-100 flex items-center gap-2 text-sm">
          {path.map((p, i) => (
            <React.Fragment key={p.id}>
              <button
                onClick={() => handleBreadcrumbClick(i)}
                className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100"
              >
                {i === 0 && <Home size={14} />}
                <span>{p.name}</span>
              </button>
              {i < path.length - 1 && <ChevronRight size={16} className="text-gray-300" />}
            </React.Fragment>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-8">{error}</div>
          ) : (
            <div className="space-y-2">
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  disabled={!file.mimeType.includes('folder') && !isSelectable(file)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors ${
                    selectedFile?.id === file.id
                      ? 'bg-indigo-500 text-white'
                      : 'hover:bg-gray-50'
                  } ${!file.mimeType.includes('folder') && !isSelectable(file) ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {getFileIcon(file.mimeType)}
                  <span className="flex-1 font-medium text-sm truncate">{file.name}</span>
                  <span className={`text-xs ${selectedFile?.id === file.id ? 'text-white/70' : 'text-gray-400'}`}>{file.size}</span>
                </button>
              ))}
            </div>
          )}
        </main>

        <footer className="p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => selectedFile && onFileSelect(selectedFile)}
            disabled={!selectedFile}
            className="px-6 py-3 bg-[#141414] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Select File for Analysis
          </button>
        </footer>
      </div>
    </motion.div>
  );
}
