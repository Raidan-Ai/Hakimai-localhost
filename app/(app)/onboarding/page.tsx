'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mic, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const OnboardingStep1 = ({ onNext }) => (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
    <h2 className="text-2xl font-bold mb-2">Professional Information</h2>
    <p className="text-sm text-gray-500 mb-8">Tell us more about your practice.</p>
    {/* Form fields for specialization, workplace, degrees */}
    <button onClick={onNext} className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white rounded-xl font-bold text-sm">Next <ArrowRight size={16} /></button>
  </motion.div>
);

const OnboardingStep2 = ({ onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleRecord = () => {
    setIsRecording(true);
    // In a real app, you would use the MediaRecorder API to capture audio.
    // The resulting blob would be sent to a backend endpoint, e.g., /api/doctor/voice-print
    // which would save it to a secure location (e.g., LOCAL_UPLOAD_DIR) and store the path
    // in the DoctorProfile.voicePrintUrl field. This is critical for training the local Whisper model
    // for speaker diarization and recognition in noisy clinical environments.
    setTimeout(() => {
      setIsRecording(false);
      setIsComplete(true);
    }, 5000); // Simulate 5-second recording
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
      <h2 className="text-2xl font-bold mb-2">Voice Print Capture</h2>
      <p className="text-sm text-gray-500 mb-8">This helps our ambient AI recognize you in noisy environments.</p>
      <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl text-center">
        {!isComplete ? (
          <>
            <p className="text-sm text-gray-600 mb-4 italic">Please read the following text aloud clearly:</p>
            <p className="text-lg font-serif mb-6">"The patient presents with symptoms of acute myocardial infarction, requiring immediate cardiac catheterization."</p>
            <button onClick={handleRecord} disabled={isRecording} className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              {isRecording ? <Loader2 className="animate-spin" /> : <Mic size={24} />}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <p className="font-bold">Voice Print Captured!</p>
          </div>
        )}
      </div>
      <button onClick={onComplete} disabled={!isComplete} className="mt-8 flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-sm">Complete Onboarding</button>
    </motion.div>
  );
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <AnimatePresence mode="wait">
        {step === 1 && <OnboardingStep1 key={1} onNext={() => setStep(2)} />}
        {step === 2 && <OnboardingStep2 key={2} onComplete={() => alert('Onboarding Complete!')} />}
      </AnimatePresence>
    </div>
  );
}
