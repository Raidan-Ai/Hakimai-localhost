import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Send, Trash2, Loader2, CheckCircle2, AlertCircle, Info, Megaphone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function SystemNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'WARNING' | 'CRITICAL',
  });

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification),
      });
      if (res.ok) {
        setNewNotification({ title: '', message: '', type: 'INFO' });
        fetchNotifications();
      }
    } catch (error) {
      console.error('Send failed:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      fetchNotifications();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-serif italic mb-1">System Alerts & Notifications</h3>
          <p className="text-sm text-[#141414]/40 uppercase tracking-widest font-bold">Admin-Generated Push Alerts</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {user?.role === 'ADMIN' && (
          <div className="col-span-5">
            <div className="bg-white rounded-[32px] p-8 border border-[#141414]/5 shadow-sm sticky top-8">
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2"><Send size={20} className="text-emerald-500" /> Broadcast New Alert</h4>
              <form onSubmit={handleSend} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Alert Title</label>
                  <input 
                    type="text"
                    required
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    placeholder="e.g. System Maintenance"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Message Content</label>
                  <textarea 
                    required
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    placeholder="Enter the alert message for all doctors..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Alert Severity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['INFO', 'WARNING', 'CRITICAL'].map((type) => (
                      <button 
                        key={type}
                        type="button"
                        onClick={() => setNewNotification({ ...newNotification, type: type as any })}
                        className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${
                          newNotification.type === type 
                            ? 'bg-[#141414] text-white border-[#141414]' 
                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {sending ? <Loader2 className="animate-spin" /> : <Megaphone size={18} />}
                  Broadcast to All Doctors
                </button>
              </form>
            </div>
          </div>
        )}

        <div className={user?.role === 'ADMIN' ? 'col-span-7' : 'col-span-12'}>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
              </div>
            ) : (
              notifications.map((notif) => (
                <motion.div 
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-6 rounded-[32px] border flex gap-4 group ${
                    notif.type === 'CRITICAL' ? 'bg-red-50 border-red-100' :
                    notif.type === 'WARNING' ? 'bg-amber-50 border-amber-100' :
                    'bg-white border-[#141414]/5'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    notif.type === 'CRITICAL' ? 'bg-white text-red-500' :
                    notif.type === 'WARNING' ? 'bg-white text-amber-500' :
                    'bg-gray-50 text-emerald-500'
                  }`}>
                    {notif.type === 'CRITICAL' ? <AlertCircle size={24} /> :
                     notif.type === 'WARNING' ? <AlertCircle size={24} /> :
                     <Info size={24} />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm">{notif.title}</h4>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <button 
                      onClick={() => handleDelete(notif.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </motion.div>
              ))
            )}

            {!loading && notifications.length === 0 && (
              <div className="text-center py-12 bg-white rounded-[32px] border border-[#141414]/5 space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <Bell className="text-gray-300 w-8 h-8" />
                </div>
                <p className="text-sm text-gray-400 font-medium">No system notifications yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
