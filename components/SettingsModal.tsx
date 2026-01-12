
import React from 'react';
import { X } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  if (!isOpen) return null;

  const handleChange = (key: keyof AppSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-950">
            <h2 className="text-xl font-bold">Dashboard Settings</h2>
            <button onClick={onClose} className="text-white/50 hover:text-white">
                <X size={24} />
            </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Section: General */}
            <div className="space-y-3">
                <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest">General</h3>
                <div>
                    <label className="block text-xs text-white/50 font-bold mb-2">Family Name</label>
                    <input 
                        type="text" 
                        value={localSettings.familyName}
                        onChange={(e) => handleChange('familyName', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs text-white/50 font-bold mb-2">Location (City, State)</label>
                    <input 
                        type="text" 
                        value={localSettings.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    />
                </div>
                
                {/* THEME SELECTOR */}
                <div>
                    <label className="block text-xs text-white/50 font-bold mb-2">Visual Theme</label>
                    <select
                        value={localSettings.theme || 'dark'}
                        onChange={(e) => handleChange('theme', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none appearance-none capitalize"
                    >
                        <option value="dark">Modern Dark</option>
                        <option value="light">Modern Light</option>
                        <option value="trek">Star Trek (LCARS)</option>
                        <option value="forest">Cozy Forest</option>
                        <option value="cyber">Cyberpunk</option>
                        <option value="nordic">Nordic Minimal</option>
                        <option value="sunset">Sunset Warmth</option>
                        <option value="midnight">Midnight Premium</option>
                    </select>
                </div>
            </div>

            <hr className="border-white/5" />

            {/* Section: System */}
            <div className="space-y-3">
                <h3 className="text-yellow-400 text-xs font-bold uppercase tracking-widest">System</h3>
                <div>
                    <label className="block text-xs text-white/50 font-bold mb-2">Data Refresh Rate</label>
                    <select
                        value={localSettings.refreshInterval}
                        onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none appearance-none"
                    >
                        <option value={5}>Every 5 Minutes</option>
                        <option value={10}>Every 10 Minutes</option>
                        <option value={15}>Every 15 Minutes</option>
                        <option value={30}>Every 30 Minutes</option>
                        <option value={60}>Every Hour</option>
                    </select>
                </div>
            </div>

            <hr className="border-white/5" />

            {/* Section: School */}
            <div className="space-y-3">
                <h3 className="text-green-400 text-xs font-bold uppercase tracking-widest">School Lunch</h3>
                <div>
                    <label className="block text-xs text-white/50 font-bold mb-2">School Name</label>
                    <input 
                        type="text" 
                        value={localSettings.schoolName}
                        onChange={(e) => handleChange('schoolName', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs text-white/50 font-bold mb-2">School ID (MealViewer)</label>
                    <input 
                        type="text" 
                        value={localSettings.schoolId || ''}
                        onChange={(e) => handleChange('schoolId', e.target.value)}
                        placeholder="e.g. EastSilverSpringES"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none text-xs"
                    />
                </div>
            </div>

            <hr className="border-white/5" />

            {/* Section: Calendar */}
            <div className="space-y-3">
                <h3 className="text-purple-400 text-xs font-bold uppercase tracking-widest">Google Calendar Integration</h3>
                <div>
                    <label className="block text-xs text-white/50 font-bold mb-2">Secret Address in iCal format</label>
                    <input 
                        type="text" 
                        value={localSettings.googleCalendarIcalUrl || ''}
                        onChange={(e) => handleChange('googleCalendarIcalUrl', e.target.value)}
                        placeholder="https://calendar.google.com/calendar/ical/..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none text-xs font-mono break-all"
                    />
                </div>
            </div>
        </div>

        <div className="p-6 pt-4 bg-slate-950 border-t border-white/10">
            <button 
                onClick={() => { onSave(localSettings); onClose(); }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
            >
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};
