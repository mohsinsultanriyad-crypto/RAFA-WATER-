
import React, { useState, useRef } from 'react';
import { ShieldCheck, Settings } from 'lucide-react';

interface HeaderProps {
  onAdminGesture: () => void;
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminGesture, onSettingsClick }) => {
  const [tapCount, setTapCount] = useState(0);
  const timerRef = useRef<number | null>(null);

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (timerRef.current) window.clearTimeout(timerRef.current);

    if (newCount >= 5) {
      onAdminGesture();
      setTapCount(0);
    } else {
      timerRef.current = window.setTimeout(() => {
        setTapCount(0);
      }, 2000);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10 select-none shadow-sm">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer active:scale-95 transition-transform"
          onClick={handleLogoTap}
        >
          <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-gray-900 leading-none">
              SAUDI <span className="text-green-600">JOB</span>
            </h1>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              Kingdom of Saudi Arabia
            </p>
          </div>
        </div>
        
        <button 
          onClick={onSettingsClick}
          className="p-2 text-gray-400 hover:text-green-600 active:scale-90 transition-all"
        >
          <Settings size={24} />
        </button>
      </div>
      {tapCount > 0 && tapCount < 5 && (
        <div className="absolute top-full left-0 w-full h-0.5 bg-gray-50">
          <div 
            className="h-full bg-green-500 transition-all duration-300" 
            style={{ width: `${(tapCount / 5) * 100}%` }}
          />
        </div>
      )}
    </header>
  );
};

export default Header;
