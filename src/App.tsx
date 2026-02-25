import React, { useState, useEffect } from 'react';
import { Activity, HeartPulse, Stethoscope, Syringe, Shield, Users, FileText, Lock, Search, Menu, Bell, MessageSquare, BookOpen, Search as SearchIcon, Radio, Mic, ScanLine, AlertCircle, Settings, Globe, Box, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChatPage from './components/ChatPage';
import OutbreakRadar from './components/OutbreakRadar';
import AISettings from './components/AISettings';
import PrivacyLock from './components/PrivacyLock';
import Footer from './components/Footer';
import { DisclaimerPage, PrivacyPage, TermsPage } from './components/legal/LegalPages';
import NetworkSettings from './components/NetworkSettings';
import ModelManager from './components/ModelManager';
import AdvancedSettings from './components/AdvancedSettings';
import { syncOfflineData } from './lib/offlineSync';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pubmedQuery, setPubmedQuery] = useState('');
  const [pubmedResult, setPubmedResult] = useState<any>(null);
  const [isSearchingPubmed, setIsSearchingPubmed] = useState(false);
  
  // Scribe State
  const [isRecording, setIsRecording] = useState(false);
  const [scribeResult, setScribeResult] = useState<any>(null);
  
  // Digitization State
  const [isDigitizing, setIsDigitizing] = useState(false);
  const [digitizeResult, setDigitizeResult] = useState<any>(null);

  useEffect(() => {
    // Attempt to sync offline data on mount
    syncOfflineData();
    
    // Check online status
    const handleOnline = () => syncOfflineData();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handlePubmedSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubmedQuery.trim()) return;
    
    setIsSearchingPubmed(true);
    try {
      const response = await fetch('/api/pubmed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: pubmedQuery })
      });
      const data = await response.json();
      setPubmedResult(data);
    } catch (error) {
      console.error('PubMed search error:', error);
    } finally {
      setIsSearchingPubmed(false);
    }
  };

  const startScribe = async () => {
    setIsRecording(true);
    // Simulate 3 seconds of recording
    setTimeout(async () => {
      setIsRecording(false);
      try {
        const response = await fetch('/api/scribe', { method: 'POST' });
        const data = await response.json();
        setScribeResult(data);
      } catch (error) {
        console.error('Scribe error:', error);
      }
    }, 3000);
  };

  const handleDigitize = async () => {
    setIsDigitizing(true);
    try {
      const response = await fetch('/api/digitize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: 'MOCK_DATA' })
      });
      const data = await response.json();
      setDigitizeResult(data.data);
    } catch (error) {
      console.error('Digitization error:', error);
    } finally {
      setIsDigitizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-sans text-[#141414]">
      <PrivacyLock />
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-[#141414] text-white p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Shield className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">HAKIM AI</h1>
        </div>

        <div className="space-y-2 flex-1">
          <NavItem 
            icon={<Activity size={20} />} 
            label="Clinical Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<HeartPulse size={20} />} 
            label="Outbreak Radar" 
            active={activeTab === 'radar'} 
            onClick={() => setActiveTab('radar')} 
          />
          <NavItem 
            icon={<MessageSquare size={20} />} 
            label="AI Orchestrator" 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')} 
          />
          <NavItem 
            icon={<BookOpen size={20} />} 
            label="PubMed RAG" 
            active={activeTab === 'pubmed'} 
            onClick={() => setActiveTab('pubmed')} 
          />
          <NavItem 
            icon={<Stethoscope size={20} />} 
            label="Patient Records" 
            active={activeTab === 'patients'} 
            onClick={() => setActiveTab('patients')} 
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="AI Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
          <NavItem 
            icon={<Globe size={20} />} 
            label="Network Config" 
            active={activeTab === 'network'} 
            onClick={() => setActiveTab('network')} 
          />
          <NavItem 
            icon={<Box size={20} />} 
            label="Model Manager" 
            active={activeTab === 'models'} 
            onClick={() => setActiveTab('models')} 
          />
          <NavItem 
            icon={<Zap size={20} />} 
            label="Advanced" 
            active={activeTab === 'advanced'} 
            onClick={() => setActiveTab('advanced')} 
          />
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
              DR
            </div>
            <div>
              <p className="text-sm font-medium">Dr. Aris</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Cardiology</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="ml-64 p-8">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-serif italic mb-1">
              {activeTab === 'dashboard' && 'Clinical Decision Support'}
              {activeTab === 'radar' && 'Epidemiological Outbreak Radar'}
              {activeTab === 'chat' && 'AI Orchestrator'}
              {activeTab === 'pubmed' && 'Medical Literature RAG'}
              {activeTab === 'patients' && 'Patient Records'}
              {activeTab === 'settings' && 'AI Provider Settings'}
              {activeTab === 'network' && 'Runtime Network Configuration'}
              {activeTab === 'models' && 'Local AI Model Manager'}
              {activeTab === 'advanced' && 'Advanced Configuration'}
              {activeTab === 'legal-disclaimer' && 'Legal Disclaimer'}
              {activeTab === 'legal-privacy' && 'Privacy Policy'}
              {activeTab === 'legal-terms' && 'Terms of Service'}
            </h2>
            <p className="text-sm text-[#141414]/50 uppercase tracking-widest font-medium">System Status: Operational</p>
          </div>
          <div className="flex items-center gap-4">
            {!navigator.onLine && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100">
                <AlertCircle size={14} /> OFFLINE MODE ACTIVE
              </div>
            )}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/30 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search patient ID..." 
                className="pl-10 pr-4 py-2 bg-white border border-[#141414]/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button className="p-2 rounded-full bg-white border border-[#141414]/10 hover:bg-gray-50 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              <div className="col-span-12 grid grid-cols-4 gap-6 mb-6">
                <StatCard label="Active Cases" value="24" trend="+3 today" />
                <StatCard label="AI Confidence" value="98.2%" trend="High" />
                <StatCard label="Avg. Triage Time" value="4.2m" trend="-12%" />
                <StatCard label="Clinic Load" value="Optimal" trend="Normal" />
              </div>

              {/* Advanced Tools Section */}
              <div className="col-span-12 grid grid-cols-2 gap-6 mb-6">
                {/* Scribe Tool */}
                <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Mic size={20} className="text-indigo-500" /> Dialect Scribe AI</h3>
                    {isRecording && <div className="flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Recording...</div>}
                  </div>
                  {!scribeResult ? (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                      <button 
                        onClick={startScribe}
                        disabled={isRecording}
                        className="w-16 h-16 bg-indigo-500 text-white rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                      >
                        <Mic size={24} />
                      </button>
                      <p className="mt-4 text-sm text-[#141414]/40">Start consultation scribe (Yemeni Dialect Optimized)</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-[#141414]/5">
                        <p className="text-[10px] uppercase tracking-widest text-[#141414]/40 font-bold mb-2">Transcription</p>
                        <p className="text-sm font-medium italic">"{scribeResult.transcription}"</p>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold mb-2">Structured SOAP Note</p>
                        <div className="grid grid-cols-2 gap-4 text-[10px]">
                          <div><span className="font-bold">Subjective:</span> {scribeResult.soapNote.subjective}</div>
                          <div><span className="font-bold">Assessment:</span> {scribeResult.soapNote.assessment}</div>
                        </div>
                      </div>
                      <button onClick={() => setScribeResult(null)} className="text-xs text-indigo-600 font-bold">New Scribe</button>
                    </div>
                  )}
                </div>

                {/* Digitization Tool */}
                <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><ScanLine size={20} className="text-emerald-500" /> Legacy Archive Digitizer</h3>
                  </div>
                  {!digitizeResult ? (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                      <button 
                        onClick={handleDigitize}
                        disabled={isDigitizing}
                        className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                      >
                        {isDigitizing ? <Loader2 className="animate-spin" /> : <ScanLine size={24} />}
                      </button>
                      <p className="mt-4 text-sm text-[#141414]/40">Scan handwritten medical record (Gemini Vision)</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold mb-2">Extracted Patient Data</p>
                        <div className="space-y-2">
                          <p className="text-sm font-bold">{digitizeResult.patientName}</p>
                          <p className="text-xs text-[#141414]/60">{digitizeResult.history}</p>
                          <div className="flex flex-wrap gap-2">
                            {digitizeResult.medications.map((m: any, i: number) => (
                              <span key={i} className="px-2 py-1 bg-white rounded-md text-[10px] border border-emerald-100">{m.name} {m.dosage}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setDigitizeResult(null)} className="text-xs text-emerald-600 font-bold">Scan Another</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-8 bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">Recent Clinical Cases</h3>
                  <button className="text-sm font-medium text-emerald-600 hover:underline">View all cases</button>
                </div>
                
                <div className="space-y-0">
                  <TableHeader />
                  <DataRow id="C-8921" patient="Sarah Jenkins" status="Review Required" model="Gemini 3 Pro" time="12m ago" />
                  <DataRow id="C-8920" patient="Michael Chen" status="Completed" model="Gemini 3 Pro" time="45m ago" />
                  <DataRow id="C-8919" patient="Elena Rodriguez" status="In Progress" model="Gemini 3 Pro" time="1h ago" />
                  <DataRow id="C-8918" patient="David Wilson" status="Completed" model="Gemini 3 Pro" time="3h ago" />
                </div>
              </div>

              <div className="col-span-4 space-y-6">
                <div className="bg-[#141414] text-white rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="text-emerald-400 w-5 h-5" />
                    <h3 className="font-bold">Compliance Status</h3>
                  </div>
                  <div className="space-y-4">
                    <ComplianceItem label="HIPAA Encryption" status="Active" />
                    <ComplianceItem label="Audit Logging" status="Active" />
                    <ComplianceItem label="Data Residency" status="US-East-1" />
                  </div>
                  <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
                    View Audit Logs
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'radar' && (
            <motion.div 
              key="radar"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <OutbreakRadar />
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <ChatPage />
            </motion.div>
          )}

          {activeTab === 'pubmed' && (
            <motion.div 
              key="pubmed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm mb-8">
                <h3 className="text-xl font-bold mb-6">Evidence-Based Literature Search</h3>
                <form onSubmit={handlePubmedSearch} className="flex gap-4">
                  <input 
                    type="text" 
                    value={pubmedQuery}
                    onChange={(e) => setPubmedQuery(e.target.value)}
                    placeholder="Enter a clinical question (e.g., 'Efficacy of SGLT2 inhibitors in heart failure')"
                    className="flex-1 px-6 py-4 bg-gray-50 border border-[#141414]/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button 
                    type="submit"
                    disabled={isSearchingPubmed}
                    className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isSearchingPubmed ? 'Searching...' : 'Ask PubMed'}
                  </button>
                </form>
              </div>

              {pubmedResult && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100">
                    <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                      <BookOpen size={18} /> Synthesis of Evidence
                    </h4>
                    <p className="text-emerald-800 leading-relaxed">
                      {pubmedResult.answer}
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
                    <h4 className="font-bold mb-6">Supporting Citations</h4>
                    <div className="space-y-4">
                      {pubmedResult.citations.map((cite: any, i: number) => (
                        <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-[#141414]/5">
                          <p className="text-xs font-bold text-emerald-600 mb-1">{cite.id}</p>
                          <p className="text-sm font-bold mb-1">{cite.title}</p>
                          <p className="text-[10px] text-[#141414]/40 uppercase tracking-wider">
                            {cite.journal} • {cite.year}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AISettings />
            </motion.div>
          )}

          {activeTab === 'legal-disclaimer' && (
            <motion.div 
              key="legal-disclaimer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DisclaimerPage />
            </motion.div>
          )}

          {activeTab === 'legal-privacy' && (
            <motion.div 
              key="legal-privacy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PrivacyPage />
            </motion.div>
          )}

          {activeTab === 'legal-terms' && (
            <motion.div 
              key="legal-terms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TermsPage />
            </motion.div>
          )}

          {activeTab === 'network' && (
            <motion.div 
              key="network"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <NetworkSettings />
            </motion.div>
          )}

          {activeTab === 'models' && (
            <motion.div 
              key="models"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ModelManager />
            </motion.div>
          )}

          {activeTab === 'advanced' && (
            <motion.div 
              key="advanced"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdvancedSettings />
            </motion.div>
          )}
        </AnimatePresence>

        <Footer onNavigate={setActiveTab} />
      </main>
    </div>
  );
}

function Loader2(props: any) {
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function StatCard({ label, value, trend }: { label: string, value: string, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-[#141414]/5 shadow-sm">
      <p className="text-[10px] uppercase tracking-widest text-[#141414]/40 font-bold mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-2xl font-bold">{value}</h4>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>
      </div>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="grid grid-cols-5 py-4 border-b border-[#141414]/5">
      <span className="text-[10px] uppercase tracking-wider text-[#141414]/30 font-bold">Case ID</span>
      <span className="text-[10px] uppercase tracking-wider text-[#141414]/30 font-bold">Patient</span>
      <span className="text-[10px] uppercase tracking-wider text-[#141414]/30 font-bold">Status</span>
      <span className="text-[10px] uppercase tracking-wider text-[#141414]/30 font-bold">AI Model</span>
      <span className="text-[10px] uppercase tracking-wider text-[#141414]/30 font-bold">Timestamp</span>
    </div>
  );
}

function DataRow({ id, patient, status, model, time }: { id: string, patient: string, status: string, model: string, time: string }) {
  return (
    <motion.div 
      whileHover={{ x: 4 }}
      className="grid grid-cols-5 py-5 border-b border-[#141414]/5 items-center cursor-pointer group"
    >
      <span className="font-mono text-xs text-[#141414]/60">{id}</span>
      <span className="text-sm font-bold">{patient}</span>
      <span className="text-xs">
        <span className={`px-2 py-1 rounded-full ${
          status === 'Completed' ? 'bg-gray-100 text-gray-600' : 
          status === 'Review Required' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {status}
        </span>
      </span>
      <span className="text-xs text-[#141414]/60 italic font-serif">{model}</span>
      <span className="text-xs text-[#141414]/40">{time}</span>
    </motion.div>
  );
}

function ComplianceItem({ label, status }: { label: string, status: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
        <span className="text-xs font-medium text-emerald-400">{status}</span>
      </div>
    </div>
  );
}
