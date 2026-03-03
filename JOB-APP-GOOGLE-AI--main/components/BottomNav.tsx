
import React from 'react';
import { Home, PlusSquare, Bell, Settings, Bookmark } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  badgeCount?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, badgeCount = 0 }) => {
  const tabs = [
    { id: 'ALL_JOBS' as TabType, label: 'Home', icon: Home },
    { id: 'POST_JOB' as TabType, label: 'Post', icon: PlusSquare },
    { id: 'SAVED_JOBS' as TabType, label: 'Saved', icon: Bookmark },
    { id: 'ALERTS' as TabType, label: 'Alerts', icon: Bell },
  ];

  return (
    <nav className="bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 z-20 px-4 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isAlerts = tab.id === 'ALERTS';
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-all relative ${
                isActive ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isAlerts && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full border-2 border-white">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
