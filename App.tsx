
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { TimeWidget } from './components/TimeWidget';
import { WeatherWidget } from './components/WeatherWidget';
import { CalendarGrid } from './components/CalendarGrid';
import { LunchWidget } from './components/LunchWidget';
import { DadJokeWidget } from './components/DadJokeWidget';
import { SettingsModal } from './components/SettingsModal';
import { AppSettings, CalendarEvent } from './types';
import { fetchGoogleCalendarEvents } from './services/calendar';

// Default / Initial Data
const DEFAULT_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Soccer Practice', start: new Date(new Date().setHours(17, 0)).toISOString(), end: new Date(new Date().setHours(18, 30)).toISOString(), color: 'orange' },
  { id: '2', title: 'Trash Pickup', start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), end: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), color: 'green' },
];

const App: React.FC = () => {
  // Robust initialization: Merge saved settings with defaults to ensure new fields (like iCal URL) exist
  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaults: AppSettings = {
        familyName: 'Poltstetlers',
        location: 'Silver Spring, MD',
        schoolName: 'East Silver Spring Elementary',
        schoolId: 'EastSilverSpringES',
        googleCalendarIcalUrl: 'https://calendar.google.com/calendar/ical/nicholaspolt%40gmail.com/private-d92d7d00ac0f9415e38c6e1be652dfca/basic.ics',
        refreshInterval: 5 // Default 5 minutes
    };

    try {
        const saved = localStorage.getItem('familyHubSettings');
        if (saved) {
            const parsed = JSON.parse(saved);
            
            // Special handling: If saved URL is empty/missing but we have a specific default now, use the default.
            if (!parsed.googleCalendarIcalUrl && defaults.googleCalendarIcalUrl) {
                parsed.googleCalendarIcalUrl = defaults.googleCalendarIcalUrl;
            }

            // Ensure refreshInterval exists
            if (!parsed.refreshInterval) {
                parsed.refreshInterval = defaults.refreshInterval;
            }

            // Merge defaults with parsed data
            return { ...defaults, ...parsed };
        }
    } catch (e) {
        console.error("Failed to load settings:", e);
    }
    
    return defaults;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>(DEFAULT_EVENTS);
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [greeting, setGreeting] = useState("Good Morning");

  // 0. Determine Greeting based on time
  useEffect(() => {
      const updateGreeting = () => {
          const hour = new Date().getHours();
          if (hour < 12) setGreeting("Good Morning");
          else if (hour < 18) setGreeting("Good Afternoon");
          else setGreeting("Good Evening");
      };
      updateGreeting();
      const timer = setInterval(updateGreeting, 60 * 60 * 1000); // Check every hour
      return () => clearInterval(timer);
  }, []);

  // 1. Persist Settings whenever they change
  useEffect(() => {
    localStorage.setItem('familyHubSettings', JSON.stringify(settings));
  }, [settings]);

  // 2. Handle Google Calendar Connection
  useEffect(() => {
    // Check if Google Calendar is configured with a valid-looking iCal URL
    if (settings.googleCalendarIcalUrl && settings.googleCalendarIcalUrl.length > 10) {
        setIsGoogleLinked(true);
        loadGoogleEvents();
    } else {
        setIsGoogleLinked(false);
        // In local mode, we don't clear events immediately to avoid flash, 
        // but user sees local AI calendar controls.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.googleCalendarIcalUrl]);

  const loadGoogleEvents = async () => {
      if (settings.googleCalendarIcalUrl) {
          const googleEvents = await fetchGoogleCalendarEvents(settings.googleCalendarIcalUrl);
          if (googleEvents.length > 0) {
              setEvents(googleEvents);
          }
      }
  };

  // Auto-refresh Google Calendar based on settings
  useEffect(() => {
      if (!isGoogleLinked) return;
      const intervalMs = settings.refreshInterval * 60 * 1000;
      const interval = setInterval(loadGoogleEvents, intervalMs);
      return () => clearInterval(interval);
  }, [isGoogleLinked, settings.refreshInterval]);

  return (
    <div className="h-screen w-full bg-[#0f172a] p-4 md:p-6 relative selection:bg-blue-500/30 overflow-hidden flex flex-col">
      
      {/* Background Ambient Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center mb-3 flex-shrink-0">
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
                {greeting}, <span className="text-blue-400">{settings.familyName}</span>
            </h1>
            <p className="text-white/50 text-xs mt-1">Here is your daily overview</p>
        </div>
        <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/70 hover:text-white"
        >
            <Settings size={18} />
        </button>
      </header>

      {/* Main Content Area - Flex Column split */}
      <div className="relative z-10 flex-1 flex flex-col gap-4 min-h-0">
        
        {/* Top Row: Status Widgets (Fixed Height ~28% to give Calendar more room) */}
        <div className="h-[28%] grid grid-cols-1 md:grid-cols-4 gap-4">
            <TimeWidget />
            <WeatherWidget 
                location={settings.location} 
                refreshInterval={settings.refreshInterval} 
            />
            <LunchWidget schoolName={settings.schoolName} schoolId={settings.schoolId} />
            <DadJokeWidget />
        </div>

        {/* Bottom Row: Calendar Grid (Takes remaining space) */}
        <div className="flex-1 min-h-0">
            <CalendarGrid 
                events={events} 
                setEvents={setEvents} 
                isGoogleLinked={isGoogleLinked} 
            />
        </div>

      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
};

export default App;
