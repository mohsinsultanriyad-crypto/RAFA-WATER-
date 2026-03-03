
import React from 'react';
import { X, Phone, Mail, MapPin, ShieldCheck, Share2, MessageCircle, Zap, Bookmark, MessageSquare } from 'lucide-react';
import { Job } from '../types';
import { toggleSaveJob, getLocalData } from '../services/api';

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
  const [isSaved, setIsSaved] = React.useState(getLocalData().savedJobIds.includes(job.id));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Job: ${job.jobRole} in ${job.city}`,
        text: `Check out this job posting for ${job.jobRole} in ${job.city} on Saudi Job!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Sharing not supported on this browser');
    }
  };

  const handleSave = () => {
    const saved = toggleSaveJob(job.id);
    setIsSaved(saved);
  };

  const formatWhatsAppNumber = (num: string) => {
    let cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('05') && cleaned.length === 10) {
      return '966' + cleaned.substring(1);
    }
    if (cleaned.startsWith('5') && cleaned.length === 9) {
      return '966' + cleaned;
    }
    return cleaned;
  };

  const whatsappUrl = `https://wa.me/${formatWhatsAppNumber(job.phoneNumber)}?text=${encodeURIComponent(`Hello, I am interested in the ${job.jobRole} position in ${job.city} that I saw on Saudi Job.`)}`;

  const isUrgentNow = job.isUrgent && (job.urgentUntil ? job.urgentUntil > Date.now() : true);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className={`p-2 rounded-full transition-colors ${isSaved ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
              <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
              <Share2 size={20} />
            </button>
          </div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Job Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 no-scrollbar">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{job.jobRole}</h1>
              {isUrgentNow && (
                <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full flex items-center animate-pulse shrink-0">
                  <Zap size={10} className="mr-1 fill-red-600" />
                  URGENT
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                <MapPin size={14} className="mr-1.5" />
                {job.city}
              </div>
              {job.company && (
                <div className="flex items-center text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <ShieldCheck size={14} className="mr-1.5" />
                  {job.company}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Job Description</h3>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{job.description}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Employer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 mr-4">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Posted by</div>
                    <div className="font-bold text-gray-900">{job.fullName}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <a href={`tel:${job.phoneNumber}`} className="flex items-center p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-200 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3 shrink-0">
                      <Phone size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Call</div>
                      <div className="font-bold text-gray-900 text-xs truncate">{job.phoneNumber}</div>
                    </div>
                  </a>
                  <a href={`mailto:${job.email}`} className="flex items-center p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-200 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mr-3 shrink-0">
                      <Mail size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Email</div>
                      <div className="font-bold text-gray-900 text-xs truncate">{job.email}</div>
                    </div>
                  </a>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <h4 className="text-xs font-bold text-amber-800 uppercase mb-1">Disclaimer</h4>
            <p className="text-[10px] text-amber-700 leading-tight">
              Saudi Job is a platform for connecting employers and workers. We are not responsible for the accuracy of job postings or the conduct of users. Please verify all details before proceeding.
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center shadow-lg shadow-green-200 active:scale-95 transition-all"
          >
            <MessageCircle size={20} className="mr-2" /> APPLY VIA WHATSAPP
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
