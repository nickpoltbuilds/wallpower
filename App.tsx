
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

const DEFAULT_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Soccer Practice', start: new Date(new Date().setHours(17, 0)).toISOString(), end: new Date(new Date().setHours(18, 30)).toISOString(), color: 'orange' },
  { id: '2', title: 'Trash Pickup', start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), end: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), color: 'green' },
];

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaults: AppSettings = {
        familyName: 'Poltstetlers',
        location: 'Silver Spring, MD',
        schoolName: 'East Silver Spring Elementary',
        schoolId: 'EastSilverSpringES',
        googleCalendarIcalUrl: 'https://calendar.google.com/calendar/ical/nicholaspolt%40gmail.com/private-d92d7d00ac0f9415e38c6e1be652dfca/basic.ics',
        refreshInterval: 5,
        theme: 'dark'
    };

    try {
        const saved = localStorage.getItem('familyHubSettings');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge checks
            if (!parsed.googleCalendarIcalUrl && defaults.googleCalendarIcalUrl) parsed.googleCalendarIcalUrl = defaults.googleCalendarIcalUrl;
            if (!parsed.refreshInterval) parsed.refreshInterval = defaults.refreshInterval;
            if (!parsed.theme) parsed.theme = defaults.theme;
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

  useEffect(() => {
      const updateGreeting = () => {
          const hour = new Date().getHours();
          if (hour < 12) setGreeting("Good Morning");
          else if (hour < 18) setGreeting("Good Afternoon");
          else setGreeting("Good Evening");
      };
      updateGreeting();
      const timer = setInterval(updateGreeting, 60 * 60 * 1000); 
      return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('familyHubSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (settings.googleCalendarIcalUrl && settings.googleCalendarIcalUrl.length > 10) {
        setIsGoogleLinked(true);
        loadGoogleEvents();
    } else {
        setIsGoogleLinked(false);
    }
  }, [settings.googleCalendarIcalUrl]);

  const loadGoogleEvents = async () => {
      if (settings.googleCalendarIcalUrl) {
          const googleEvents = await fetchGoogleCalendarEvents(settings.googleCalendarIcalUrl);
          if (googleEvents.length > 0) {
              setEvents(googleEvents);
          }
      }
  };

  useEffect(() => {
      if (!isGoogleLinked) return;
      const intervalMs = settings.refreshInterval * 60 * 1000;
      const interval = setInterval(loadGoogleEvents, intervalMs);
      return () => clearInterval(interval);
  }, [isGoogleLinked, settings.refreshInterval]);

  return (
    <div className="h-screen w-full p-4 md:p-6 relative flex flex-col bg-app" data-theme={settings.theme || 'dark'}>
      
      {/* Header */}
      <header className="flex justify-between items-end mb-4 flex-shrink-0">
        <div>
            <h1 className="text-4xl font-black app-header-text tracking-tighter">
                {greeting}, <span className="app-header-accent">{settings.familyName}</span>
            </h1>
        </div>
        <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 app-header-text transition-all"
        >
            <Settings size={20} />
        </button>
      </header>

      <div className="relative z-10 flex-1 flex flex-col gap-4 min-h-0">
        
        {/* Top Row: Status Widgets */}
        <div className="h-[28%] grid grid-cols-1 md:grid-cols-4 gap-4">
            <TimeWidget />
            <WeatherWidget 
                location={settings.location} 
                refreshInterval={settings.refreshInterval} 
            />
            <LunchWidget schoolName={settings.schoolName} schoolId={settings.schoolId} />
            <DadJokeWidget />
        </div>

        {/* Bottom Row: Calendar Grid */}
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
