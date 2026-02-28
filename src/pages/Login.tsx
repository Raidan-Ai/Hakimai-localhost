import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login({ onSignup }: { onSignup: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-10 border border-[#141414]/5 shadow-xl"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
            <Shield className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">HAKIM AI</h1>
          <p className="text-sm text-[#141414]/40 uppercase tracking-widest font-bold mt-2">Enterprise Clinical Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-[#141414]/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="doctor@hakim.raidan.pro"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-[#141414]/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-100">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-[#141414]/10 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Log In to System'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-[#141414]/5 text-center">
          <p className="text-sm text-[#141414]/40">Don't have an account?</p>
          <button 
            onClick={onSignup}
            className="mt-2 text-sm font-bold text-emerald-600 hover:underline"
          >
            Register as a New Doctor
          </button>
        </div>
      </motion.div>
    </div>
  );
}
