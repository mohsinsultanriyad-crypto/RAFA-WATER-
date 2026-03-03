import React, { useState, useEffect } from 'react';
import { Settings, Trash2, Edit3, AlertCircle, Mail, CheckCircle2, Briefcase, MapPin, Zap, Shield } from 'lucide-react';
import { Job } from '../types';
import { getGlobalJobs, deleteGlobalJob, updateGlobalJob } from '../services/api';
import LegalScreen from './LegalScreen';

const ManageScreen: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [showLegal, setShowLegal] = useState(false);
  
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [customCity, setCustomCity] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah', 'Khobar', 'Dhahran', 'Abha', 'Tabuk'];

  const handleEditClick = (job: Job) => {
    if (cities.includes(job.city)) {
      setCustomCity('');
      setEditingJob(job);
    } else {
      setCustomCity(job.city);
      setEditingJob({ ...job, city: 'Other' });
    }
  };

  if (showLegal) {
    return <LegalScreen onBack={() => setShowLegal(false)} />;
  }

  const handleVerify = () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setIsVerified(true);
    loadMyJobs();
  };

  const loadMyJobs = async () => {
    setLoading(true);
    try {
      const allJobs = await getGlobalJobs();
      const myJobs = allJobs.filter(job => job.email.toLowerCase() === email.toLowerCase());
      setJobs(myJobs);
    } catch (err) {
      setError('Failed to load jobs');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteGlobalJob(id, email);
    if (success) {
      setJobs(jobs.filter(j => j.id !== id));
      setShowDeleteConfirm(null);
    } else {
      alert('Delete failed');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    const jobToUpdate = { ...editingJob };
    if (jobToUpdate.city === 'Other') {
      jobToUpdate.city = customCity || 'Other';
    }

    try {
      const updated = await updateGlobalJob(jobToUpdate.id, email, jobToUpdate);
      setJobs(jobs.map(j => j.id === updated.id ? updated : j));
      setEditingJob(null);
    } catch (err) {
      alert('Update failed');
    }
  };

  if (!isVerified) {
    return (
      <div className="pb-24 px-6 py-12 animate-in fade-in duration-500">
        <div className="text-center mb-10">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-50">
            <Settings className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Manage My Jobs</h2>
          <p className="text-gray-500 text-sm mt-2">Enter your email to edit or delete your posts</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Verification Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="email" 
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-4 shadow-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-500 font-bold ml-1">{error}</p>}
            <button 
              onClick={handleVerify}
              className="w-full bg-gray-900 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all"
            >
              ACCESS MY POSTS
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <button 
              onClick={() => setShowLegal(true)}
              className="w-full flex items-center justify-center gap-2 text-gray-400 font-bold text-xs hover:text-green-600 transition-colors"
            >
              <Shield size={14} />
              Terms, Privacy & Disclaimer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-6 py-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">My Postings</h2>
          <p className="text-gray-500 text-xs mt-1">Managing jobs for: {email}</p>
        </div>
        <button onClick={() => setIsVerified(false)} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">
          Logout
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-gray-400">Loading your posts...</div>
      ) : jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{job.jobRole}</h3>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <MapPin size={12} className="mr-1" />
                    {job.city}
                  </div>
                </div>
                {job.isUrgent && (
                  <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center">
                    <Zap size={10} className="mr-1 fill-red-600" />
                    URGENT
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleEditClick(job)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(job.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>

              {showDeleteConfirm === job.id && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                  <p className="text-xs text-red-800 font-bold mb-3">Are you sure you want to delete this post?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 bg-white text-gray-600 rounded-lg text-[10px] font-bold">Cancel</button>
                    <button onClick={() => handleDelete(job.id)} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold">Yes, Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Briefcase size={32} />
          </div>
          <p className="text-gray-500 font-bold">No jobs found</p>
          <p className="text-xs text-gray-400 mt-1">You haven't posted any jobs with this email.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[80vh]">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Job Post</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input 
                required
                placeholder="Job Role"
                value={editingJob.jobRole}
                onChange={(e) => setEditingJob({...editingJob, jobRole: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
              <select 
                required
                value={editingJob.city}
                onChange={(e) => setEditingJob({...editingJob, city: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              >
                {['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah', 'Khobar', 'Dhahran', 'Abha', 'Tabuk', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {editingJob.city === 'Other' && (
                <input 
                  required
                  placeholder="Enter city name"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none animate-in slide-in-from-top-2"
                />
              )}
              <textarea 
                required
                placeholder="Description"
                value={editingJob.description}
                onChange={(e) => setEditingJob({...editingJob, description: e.target.value})}
                rows={4}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
              />
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-xs font-bold text-gray-600">Urgent Hiring?</span>
                <input 
                  type="checkbox"
                  checked={editingJob.isUrgent}
                  onChange={(e) => setEditingJob({...editingJob, isUrgent: e.target.checked})}
                  className="w-4 h-4 text-green-600"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setEditingJob(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageScreen;
