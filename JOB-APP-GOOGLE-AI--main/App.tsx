
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AllJobsScreen from './screens/AllJobsScreen';
import PostJobScreen from './screens/PostJobScreen';
import AlertsScreen from './screens/AlertsScreen';
import ManageScreen from './screens/ManageScreen';
import SavedJobsScreen from './screens/SavedJobsScreen';
import AdminScreen from './screens/AdminScreen';
import { TabType, Job } from './types';
import { Lock, X } from 'lucide-react';
import { getGlobalJobs, getLocalData, saveLocalData } from './services/api';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ALL_JOBS');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [alertBadgeCount, setAlertBadgeCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  
  // Admin Login State
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const checkNewAlerts = async () => {
      try {
        const jobs = await getGlobalJobs();
        const localData = getLocalData();
        const lastCheck = localData.lastAlertCheck || 0;
        
        // Only update lastCheckTime state if we are NOT on the Alerts tab.
        // If we ARE on the Alerts tab, we want to keep the value that was there when we entered.
        if (activeTab !== 'ALERTS') {
          setLastCheckTime(lastCheck);
        }
        
        const newMatchingJobs = jobs.filter(job => 
          job.postedAt > lastCheck && 
          (localData.alertRoles || []).some(role => 
            job.jobRole?.toLowerCase().includes(role.toLowerCase())
          )
        );
        
        setAlertBadgeCount(activeTab === 'ALERTS' ? 0 : newMatchingJobs.length);
      } catch (error) {
        console.error('Failed to check alerts:', error);
      }
    };

    checkNewAlerts();
    const interval = setInterval(checkNewAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'ALERTS') {
      setAlertBadgeCount(0);
      const localData = getLocalData();
      // We don't update lastCheckTime state here because we want AlertsScreen 
      // to see the "previous" check time to highlight new jobs
      localData.lastAlertCheck = Date.now();
      saveLocalData(localData);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId === 'admin' && adminPass === 'saudi_admin_2025') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setActiveTab('ADMIN_PANEL');
      setAdminId('');
      setAdminPass('');
      setLoginError('');
    } else {
      setLoginError('Invalid Admin Credentials');
    }
  };

  const renderScreen = () => {
    if (activeTab === 'ADMIN_PANEL' && isAdmin) {
      return <AdminScreen onLogout={() => {
        setIsAdmin(false);
        setActiveTab('ALL_JOBS');
      }} />;
    }

    switch (activeTab) {
      case 'ALL_JOBS':
        return <AllJobsScreen />;
      case 'POST_JOB':
        return <PostJobScreen onSuccess={() => setActiveTab('ALL_JOBS')} />;
      case 'SAVED_JOBS':
        return <SavedJobsScreen />;
      case 'ALERTS':
        return <AlertsScreen lastCheckTime={lastCheckTime} />;
      case 'MANAGE':
        return <ManageScreen />;
      default:
        return <AllJobsScreen />;
    }
  };

  return (
    <div className="h-screen h-[100dvh] max-w-lg mx-auto bg-gray-50 shadow-2xl relative flex flex-col overflow-hidden">
      <Header 
        onAdminGesture={() => !isAdmin && setShowAdminLogin(true)} 
        onSettingsClick={() => setActiveTab('MANAGE')}
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-24 min-h-0 overscroll-contain">
        {renderScreen()}
      </main>

      {!isAdmin && (
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          badgeCount={alertBadgeCount}
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-green-100 p-3 rounded-2xl">
                <Lock className="text-green-600" size={24} />
              </div>
              <button onClick={() => setShowAdminLogin(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">Admin Access</h3>
            <p className="text-sm text-gray-500 mb-6">Secure portal for staff members only.</p>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="text" 
                placeholder="Admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
              <input 
                type="password" 
                placeholder="Password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
              {loginError && <p className="text-xs text-red-500 font-bold ml-1">{loginError}</p>}
              <button 
                type="submit"
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
