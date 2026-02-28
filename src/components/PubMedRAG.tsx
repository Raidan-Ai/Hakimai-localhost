import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, Loader2, FileText, ExternalLink } from 'lucide-react';

interface Citation {
  id: string;
  title: string;
  journal: string;
  year: string;
  url?: string;
}

interface PubMedResult {
  answer: string;
  citations: Citation[];
}

export default function PubMedRAG() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<PubMedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/pubmed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch evidence from PubMed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('PubMed search error:', err);
      setError(err.message || 'An unexpected error occurred during the search.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[32px] p-8 border border-[#141414]/5 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <BookOpen className="text-emerald-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Evidence-Based Literature Search</h3>
            <p className="text-sm text-[#141414]/40 uppercase tracking-widest font-bold">PubMed RAG Orchestrator</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a clinical question (e.g., 'Efficacy of SGLT2 inhibitors in heart failure')"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-[#141414]/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg shadow-[#141414]/10 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search size={18} />}
            {loading ? 'Searching...' : 'Ask PubMed'}
          </button>
        </form>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-2"
        >
          <Loader2 className="w-4 h-4" /> {error}
        </motion.div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-emerald-50 rounded-[32px] p-8 border border-emerald-100 shadow-sm">
            <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <BookOpen size={20} /> Synthesis of Evidence
            </h4>
            <div className="text-emerald-800 leading-relaxed text-sm prose prose-emerald max-w-none">
              {result.answer}
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-[#141414]/5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold flex items-center gap-2">
                <FileText size={20} className="text-gray-400" /> Supporting Citations
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30">
                {result.citations.length} Sources Found
              </span>
            </div>
            <div className="grid gap-4">
              {result.citations.map((cite, i) => (
                <div key={cite.id} className="p-6 rounded-2xl bg-gray-50 border border-[#141414]/5 hover:border-emerald-200 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{cite.id}</span>
                    {cite.url && (
                      <a href={cite.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-emerald-500 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  <h5 className="font-bold text-sm mb-2 group-hover:text-emerald-900 transition-colors">{cite.title}</h5>
                  <div className="flex items-center gap-2 text-[10px] text-[#141414]/40 uppercase tracking-wider font-bold">
                    <span>{cite.journal}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{cite.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!result && !loading && (
        <div className="text-center py-20 bg-white rounded-[32px] border border-[#141414]/5 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-gray-300 w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-gray-400">Ready for Clinical Query</h4>
          <p className="text-xs text-gray-300 mt-1">Enter a question above to synthesize medical literature.</p>
        </div>
      )}
    </div>
  );
}
