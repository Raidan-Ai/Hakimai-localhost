import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Custom hook to monitor user inactivity.
 * @param timeout - Time in milliseconds before triggering idle state.
 */
function useIdleTimeout(timeout: number) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isIdle) return; // Don't reset if already locked

    timerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, timeout);
  }, [timeout, isIdle]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    
    const handleActivity = () => resetTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return { isIdle, setIsIdle };
}

export default function PrivacyLock() {
  const IDLE_TIME = 180 * 1000; // 3 minutes
  const { isIdle, setIsIdle } = useIdleTimeout(IDLE_TIME);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock PIN verification - in production this would verify against session/DB
    if (pin === '1234') {
      setIsIdle(false);
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
      // Shake animation effect handled by motion
    }
  };

  return (
    <AnimatePresence>
      {isIdle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-3xl bg-[#141414]/40"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-[40px] p-12 shadow-2xl border border-[#141414]/5 max-w-md w-full mx-4 text-center"
          >
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Lock className="text-red-500 w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Session Locked</h2>
            <p className="text-sm text-[#141414]/40 mb-8">
              For patient privacy, this session has been locked due to inactivity. Enter your clinical PIN to resume.
            </p>

            <form onSubmit={handleUnlock} className="space-y-6">
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20 w-5 h-5" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setError(false);
                    setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                  }}
                  placeholder="Enter 4-digit PIN"
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${
                    error ? 'border-red-500 ring-2 ring-red-500/10' : 'border-[#141414]/10'
                  } rounded-2xl text-center text-2xl tracking-[1em] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                  autoFocus
                />
              </div>

              {error && (
                <motion.p
                  initial={{ x: -10 }}
                  animate={{ x: [0, -10, 10, -10, 10, 0] }}
                  className="text-xs font-bold text-red-500 uppercase tracking-widest"
                >
                  Invalid Clinical PIN
                </motion.p>
              )}

              <button
                type="submit"
                disabled={pin.length < 4}
                className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Unlock Session <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-[#141414]/5 flex items-center justify-center gap-2 text-[10px] font-bold text-[#141414]/30 uppercase tracking-widest">
              <ShieldAlert size={14} /> HIPAA Physical Safeguard Active
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
