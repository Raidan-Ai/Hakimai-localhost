import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Building2, Stethoscope, GraduationCap, Mic, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    workplaceType: 'Clinic',
    specialization: '',
    medicalDegrees: [''],
    voicePrintUrl: '',
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleDegreeChange = (index: number, value: string) => {
    const newDegrees = [...formData.medicalDegrees];
    newDegrees[index] = value;
    setFormData({ ...formData, medicalDegrees: newDegrees });
  };

  const addDegree = () => {
    setFormData({ ...formData, medicalDegrees: [...formData.medicalDegrees, ''] });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F5F5F0] z-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-[40px] p-12 shadow-2xl border border-[#141414]/5 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1.5 bg-gray-100 w-full">
          <motion.div 
            className="h-full bg-emerald-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-serif italic">Welcome to Hakim AI</h2>
                <p className="text-sm text-[#141414]/40 uppercase tracking-widest font-bold">Step 1: Professional Identity</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-3">Workplace Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setFormData({ ...formData, workplaceType: 'Clinic' })}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${formData.workplaceType === 'Clinic' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <Building2 className={formData.workplaceType === 'Clinic' ? 'text-emerald-500' : 'text-gray-400'} />
                      <span className="font-bold text-sm">Private Clinic</span>
                    </button>
                    <button 
                      onClick={() => setFormData({ ...formData, workplaceType: 'Hospital' })}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${formData.workplaceType === 'Hospital' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <Building2 className={formData.workplaceType === 'Hospital' ? 'text-emerald-500' : 'text-gray-400'} />
                      <span className="font-bold text-sm">Hospital / Medical Center</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-3">Medical Specialization</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g. Cardiology, Pediatrics"
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={nextStep}
                disabled={!formData.specialization}
                className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                Continue <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-serif italic">Academic Credentials</h2>
                <p className="text-sm text-[#141414]/40 uppercase tracking-widest font-bold">Step 2: Verification</p>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {formData.medicalDegrees.map((degree, index) => (
                  <div key={index} className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text"
                      value={degree}
                      onChange={(e) => handleDegreeChange(index, e.target.value)}
                      placeholder="e.g. MD, PhD in Cardiology"
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                ))}
                <button 
                  onClick={addDegree}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  + Add Another Degree
                </button>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={nextStep} className="flex-1 py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all">
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-serif italic">Ambient AI Voiceprint</h2>
                <p className="text-sm text-[#141414]/40 uppercase tracking-widest font-bold">Step 3: Speaker Recognition</p>
              </div>

              <div className="p-8 bg-indigo-50 rounded-[32px] border border-indigo-100 text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Mic className="text-indigo-500 w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-indigo-900">Enable Speaker Identification</p>
                  <p className="text-xs text-indigo-700/60 leading-relaxed">
                    Recording a short voice sample allows Hakim AI to distinguish your voice from patients during consultations.
                  </p>
                </div>
                <button className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
                  Record Voice Sample
                </button>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={nextStep} className="flex-1 py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all">
                  Skip for Now <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 py-12"
            >
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-serif italic">All Set, Doctor</h2>
                <p className="text-sm text-[#141414]/40">Your professional profile has been initialized.</p>
              </div>
              <button 
                onClick={handleSubmit}
                className="px-12 py-4 bg-[#141414] text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl"
              >
                Enter Hakim AI
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
