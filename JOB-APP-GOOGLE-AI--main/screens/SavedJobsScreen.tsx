
import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { getGlobalJobs, getLocalData, toggleSaveJob } from '../services/api';
import JobCard from '../components/JobCard';
import JobDetailsModal from '../components/JobDetailsModal';
import { Bookmark, Search, Loader2 } from 'lucide-react';

const SavedJobsScreen: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const loadSavedJobs = async () => {
    setLoading(true);
    try {
      const allJobs = await getGlobalJobs();
      const localData = getLocalData();
      const filtered = allJobs.filter(job => localData.savedJobIds.includes(job.id));
      setSavedJobs(filtered);
    } catch (error) {
      console.error('Failed to load saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const handleUnsave = (id: string) => {
    toggleSaveJob(id);
    setSavedJobs(prev => prev.filter(job => job.id !== id));
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Saved Jobs</h2>
            <p className="text-xs text-gray-400 mt-1">Jobs you've bookmarked for later</p>
          </div>
          <div className="bg-green-100 p-3 rounded-2xl">
            <Bookmark className="text-green-600" size={24} />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <span className="text-sm font-medium">Loading your bookmarks...</span>
            </div>
          ) : savedJobs.length > 0 ? (
            savedJobs.map(job => (
              <div key={job.id} className="relative">
                <JobCard 
                  job={job} 
                  onClick={() => setSelectedJob(job)} 
                  onToggleSave={(saved) => {
                    if (!saved) {
                      setSavedJobs(prev => prev.filter(j => j.id !== job.id));
                    }
                  }}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="text-gray-200" size={32} />
              </div>
              <p className="text-gray-500 font-medium">No saved jobs yet</p>
              <p className="text-xs text-gray-400 mt-1 px-10">
                Tap the bookmark icon on any job to save it here.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={() => {
            setSelectedJob(null);
            // Refresh list in case they unsaved from modal
            const localData = getLocalData();
            if (!localData.savedJobIds.includes(selectedJob.id)) {
                setSavedJobs(prev => prev.filter(j => j.id !== selectedJob.id));
            }
          }}
        />
      )}
    </div>
  );
};

export default SavedJobsScreen;
