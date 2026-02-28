'use client';

import React from 'react';
import { UploadCloud, BookOpen } from 'lucide-react';

export default function KnowledgeBasePage() {
  // In a real app, you would use a library like react-dropzone for file uploads.
  const handleUpload = () => {
    // This would trigger a file upload to a backend endpoint like /api/admin/knowledge-base/upload.
    // The backend would then:
    // 1. Save the file to a secure location.
    // 2. Create a KnowledgeBase entry in the database.
    // 3. Trigger a background job (e.g., using BullMQ or a serverless function) to:
    //    a. Chunk the document (PDF, TXT, etc.) into smaller pieces.
    //    b. Generate embeddings for each chunk using a local model (e.g., via Ollama).
    //    c. Store the embeddings in a vector database (e.g., ChromaDB, PGVector).
    //    d. Mark the KnowledgeBase entry as `vectorized = true`.
    alert('File upload initiated. Vectorization will happen in the background.');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
            <BookOpen className="text-green-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Local AI Knowledge Base</h3>
            <p className="text-sm text-gray-500">Manage the local RAG database for the sovereign AI model.</p>
          </div>
        </div>

        <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center">
          <UploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="font-bold mb-2">Upload Local Medical Documents</p>
          <p className="text-sm text-gray-500 mb-4">PDFs, TXT files, and other documents will be vectorized for the local AI.</p>
          <button onClick={handleUpload} className="px-6 py-3 bg-[#141414] text-white rounded-xl font-bold text-sm">
            Upload Files
          </button>
        </div>

        {/* This would list the uploaded and vectorized documents */}
      </div>
    </div>
  );
}
