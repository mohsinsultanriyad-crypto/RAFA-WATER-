import React, { useState, useEffect } from 'react';
import { Bell, Search, Plus, X, Briefcase, Zap } from 'lucide-react';
import { Job } from '../types';
import { getGlobalJobs, getLocalData, updateAlertRoles, markAsViewedLocal } from '../services/api';
import JobCard from '../components/JobCard';
import JobDetailsModal from '../components/JobDetailsModal';

interface AlertsScreenProps {
  lastCheckTime?: number;
}

const AlertsScreen: React.FC<AlertsScreenProps> = ({ lastCheckTime = 0 }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const commonRoles = [
    'Driver', 'Sales', 'Engineer', 'Teacher', 'Nurse', 'Security', 'Delivery', 'IT',
  'Accountant', 'Manager', 'Receptionist', 'Chef', 'Waiter', 'Electrician', 'Plumber',
  'Marketing', 'HR', 'Pharmacist', 'Doctor', 'Data Entry', 'Warehouse',

  // Construction & Technical Roles
  'Welder', 'Rigger', 'Helper', 'Instrument Technician', 'Electrical Technician',
  'Mechanical Technician', 'AC Technician', 'HVAC Technician', 'Civil Technician',
  'Safety Officer', 'Safety Supervisor', 'Scaffolder', 'Pipe Fitter', 'Fabricator',
  'Mason', 'Steel Fixer', 'Carpenter', 'Painter', 'Tile Mason', 'Gypsum Carpenter',

  // Industrial & Oil/Gas
  'Instrument Fitter', 'Calibration Technician', 'Control Valve Technician',
  'Analyzer Technician', 'Maintenance Technician', 'Plant Operator',
  'Production Operator', 'Utility Operator', 'Boiler Operator',

  // Equipment & Machine Operators
  'Heavy Driver', 'Light Driver', 'Forklift Operator', 'Crane Operator',
  'Tower Crane Operator', 'Excavator Operator', 'Bulldozer Operator',
  'Bobcat Operator', 'Machine Operator', 'CNC Operator',

  // Logistics & Support
  'Storekeeper', 'Warehouse Supervisor', 'Material Coordinator',
  'Logistics Coordinator', 'Procurement Officer', 'Document Controller',

  // Engineering & Office Roles
  'Site Engineer', 'Project Engineer', 'Planning Engineer',
  'QA QC Inspector', 'QA QC Engineer', 'Quantity Surveyor',
  'Draftsman', 'AutoCAD Draftsman', 'Project Manager'
  ];

  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const data = getLocalData();
    setSelectedRoles(data.alertRoles || []);
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getGlobalJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
    setLoading(false);
  };

  const handleAddRole = (role: string) => {
    if (role && !selectedRoles.includes(role)) {
      const updated = [...selectedRoles, role];
      setSelectedRoles(updated);
      updateAlertRoles(updated);
      setNewRole('');
    }
  };

  const handleRemoveRole = (role: string) => {
    const updated = selectedRoles.filter(r => r !== role);
    setSelectedRoles(updated);
    updateAlertRoles(updated);
  };

  const filteredJobs = jobs.filter(job => 
    selectedRoles.some(role => job.jobRole.toLowerCase().includes(role.toLowerCase()))
  );

  return (
    <div className="pb-24 px-6 py-6 animate-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Bell className="text-green-600" />
          Job Alerts
        </h2>
        <p className="text-gray-500 text-sm mt-1">Get notified for roles you care about</p>
      </div>

      {/* Role Selection */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">My Selected Roles</h3>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedRoles.length > 0 ? selectedRoles.map(role => (
            <span key={role} className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
              {role}
              <button onClick={() => handleRemoveRole(role)} className="hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
            </span>
          )) : (
            <p className="text-xs text-gray-400 italic">No roles selected yet</p>
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Add a role (e.g. Driver)"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddRole(newRole)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-12 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
          />
          <button 
            onClick={() => handleAddRole(newRole)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 text-white p-1.5 rounded-lg active:scale-90 transition-transform"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {commonRoles.filter(role => !selectedRoles.includes(role)).map(role => (
            <button 
              key={role}
              onClick={() => handleAddRole(role)}
              className="text-[10px] font-bold text-gray-400 border border-gray-100 px-2 py-1 rounded-lg hover:border-green-200 hover:text-green-600 transition-all"
            >
              + {role}
            </button>
          ))}
          <button 
            onClick={() => inputRef.current?.focus()}
            className="text-[10px] font-bold text-green-600 border border-green-100 bg-green-50 px-2 py-1 rounded-lg hover:bg-green-100 transition-all"
          >
            + Other
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Matching Jobs</h3>
        
        {loading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse">Checking for new jobs...</div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              isNew={job.postedAt > lastCheckTime}
              onClick={() => {
                markAsViewedLocal(job.id);
                setSelectedJob(job);
              }} 
            />
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 px-6">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-500 font-bold">No matching jobs yet</p>
            <p className="text-xs text-gray-400 mt-1">We'll show jobs here as soon as they are posted for your selected roles.</p>
          </div>
        )}
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

export default AlertsScreen;
