import React from 'react';
import { Shield, Lock, AlertTriangle, ChevronLeft } from 'lucide-react';

interface LegalScreenProps {
  onBack: () => void;
}

const LegalScreen: React.FC<LegalScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white pb-24 animate-in slide-in-from-bottom-10 duration-300">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-black text-gray-900">Legal Information</h2>
      </div>

      <div className="px-6 py-8 space-y-10">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Terms & Conditions</h3>
          </div>
          <div className="text-sm text-gray-600 space-y-4 leading-relaxed">
            <p>Welcome to Saudi Job. By using our platform, you agree to the following terms:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Users must provide accurate information when posting jobs.</li>
              <li>Spamming or posting fraudulent job offers is strictly prohibited.</li>
              <li>We reserve the right to remove any content that violates our community standards.</li>
              <li>Jobs are automatically removed from the public feed after 15 days.</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <Lock size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Privacy Policy</h3>
          </div>
          <div className="text-sm text-gray-600 space-y-4 leading-relaxed">
            <p>Your privacy is important to us. Here is how we handle your data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>We collect your name, phone number, and email only for job posting and verification purposes.</li>
              <li>Your phone number is made public so workers can contact you via WhatsApp or Call.</li>
              <li>We do not sell your personal information to third parties.</li>
              <li>Local data like saved jobs and viewed jobs are stored only on your device.</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Disclaimer</h3>
          </div>
          <div className="text-sm text-gray-600 space-y-4 leading-relaxed">
            <p className="font-bold text-amber-800">Job Responsibility:</p>
            <p>Saudi Job is a neutral platform. We do not vet employers or workers. Users are solely responsible for verifying the legitimacy of any job offer or candidate.</p>
            <p>We are not liable for any disputes, financial losses, or conduct arising from connections made through this platform.</p>
          </div>
        </section>
      </div>

      <div className="px-6 mt-10">
        <div className="bg-gray-50 rounded-3xl p-6 text-center border border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Saudi Job v1.0.0</p>
          <p className="text-[10px] text-gray-400 mt-1">© 2025 Saudi Job. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LegalScreen;
