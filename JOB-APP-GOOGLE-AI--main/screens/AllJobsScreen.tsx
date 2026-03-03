
import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { getGlobalJobs, markAsViewedLocal } from '../services/api';
import JobCard from '../components/JobCard';
import JobDetailsModal from '../components/JobDetailsModal';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

const AllJobsScreen: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    const data = await getGlobalJobs();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleJobClick = (job: Job) => {
    markAsViewedLocal(job.id);
    setSelectedJob(job);
  };

  const filteredJobs = jobs.filter(job => 
    job.jobRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-24">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-gray-900">Explore Jobs</h2>
          <button 
            onClick={loadJobs}
            disabled={loading}
            className={`p-2 bg-white rounded-full shadow-sm border border-gray-100 transition-all ${loading ? 'animate-spin opacity-50' : 'active:scale-90'}`}
          >
            <RefreshCw size={18} className="text-green-600" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by role or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-12 py-4 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 bg-green-50 p-2 rounded-lg">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Job List */}
        <div className="mt-4 space-y-4">
          {loading && jobs.length === 0 ? (
            <div className="py-20 text-center text-gray-400 animate-pulse">Syncing with server...</div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <JobCard 
                key={job.id}
                job={job} 
                onClick={() => handleJobClick(job)} 
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-300" size={32} />
              </div>
              <p className="text-gray-500 font-medium">No jobs found matching your search</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-2 text-green-600 font-bold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};

export default AllJobsScreen;
