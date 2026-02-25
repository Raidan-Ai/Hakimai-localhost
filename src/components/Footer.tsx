import React from 'react';
import { Twitter, Linkedin, Facebook, Instagram, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    { icon: <Twitter size={18} />, url: 'https://twitter.com/RaidanAi', label: 'Twitter' },
    { icon: <Linkedin size={18} />, url: 'https://linkedin.com/company/RaidanAi', label: 'LinkedIn' },
    { icon: <Facebook size={18} />, url: 'https://facebook.com/RaidanAi', label: 'Facebook' },
    { icon: <Instagram size={18} />, url: 'https://instagram.com/RaidanAi', label: 'Instagram' },
  ];

  return (
    <footer className="bg-white border-t border-[#141414]/5 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#141414] rounded-lg flex items-center justify-center">
                <Shield className="text-emerald-400 w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">HAKIM AI</span>
            </div>
            <p className="text-sm text-[#141414]/50 max-w-sm leading-relaxed">
              Advanced clinical decision support system developed by RaidanPro. 
              Empowering healthcare professionals with sovereign, secure, and ethical AI.
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#141414]/30 mb-6">Legal & Compliance</h4>
            <ul className="space-y-4">
              <li>
                <button onClick={() => onNavigate('legal-disclaimer')} className="text-sm text-[#141414]/60 hover:text-[#141414] transition-colors">
                  Disclaimer (إخلاء المسؤولية)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal-privacy')} className="text-sm text-[#141414]/60 hover:text-[#141414] transition-colors">
                  Privacy Policy (سياسة الخصوصية)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal-terms')} className="text-sm text-[#141414]/60 hover:text-[#141414] transition-colors">
                  Terms of Service (شروط الاستخدام)
                </button>
              </li>
            </ul>
          </div>

          {/* Social Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#141414]/30 mb-6">Connect with RaidanPro</h4>
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <a 
                  key={i} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-50 border border-[#141414]/5 flex items-center justify-center text-[#141414]/40 hover:bg-[#141414] hover:text-white hover:border-[#141414] transition-all"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#141414]/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#141414]/40 font-medium">
            © {currentYear} RaidanPro. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30">
              Sovereign AI Infrastructure
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
