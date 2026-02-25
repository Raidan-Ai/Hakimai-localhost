import React, { useState } from 'react';
import { Mail, User, Lock, Loader2 } from 'lucide-react';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('Submitting your registration...');

    // In a real app, you would post to your /api/register endpoint
    setTimeout(() => {
      setIsSubmitting(false);
      setMessage('Registration successful! Please log in.');
      // Redirect to login page or update app state
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-lg max-w-md mx-auto text-center">
      <h3 className="text-2xl font-bold mb-2">Trial Ended</h3>
      <p className="text-sm text-[#141414]/50 mb-8">Please register to continue using Hakim AI.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-4 h-4" />
            <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
        </div>
        <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-4 h-4" />
            <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
        </div>
        <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-4 h-4" />
            <input
                type="password"
                placeholder="Password"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#141414]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
        </div>
        <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#141414] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Register Now'}
        </button>
      </form>
      {message && <p className="mt-4 text-xs text-emerald-600 font-bold">{message}</p>}
    </div>
  );
}
