
import React, { useState, useEffect } from 'react';
import { Settings, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
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
        googleCalendarIcalUrl: '',
        refreshInterval: 5,
        theme: 'dark'
    };
    try {
        const saved = localStorage.getItem('familyHubSettings');
        if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch (e) {}
    return defaults;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [greeting, setGreeting] = useState("Good Morning");
  const [weatherCondition, setWeatherCondition] = useState<string>('clear');

  useEffect(() => {
      const updateGreeting = () => {
          const hour = new Date().getHours();
          if (hour < 12) setGreeting("Good Morning");
          else if (hour < 18) setGreeting("Good Afternoon");
          else setGreeting("Good Evening");
      };
      updateGreeting();
      const timer = setInterval(updateGreeting, 3600000); 
      return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('familyHubSettings', JSON.stringify(settings));
  }, [settings]);

  const loadGoogleEvents = async () => {
      const url = settings.googleCalendarIcalUrl;
      if (url && url.length > 15) {
          setIsSyncing(true);
          try {
            const result = await fetchGoogleCalendarEvents(url);
            if (result.success) {
                setEvents(result.events);
                setSyncError(null);
                setLastSyncTime(new Date());
            } else {
                setSyncError(result.message || "Sync Failed");
            }
          } catch (e) {
            setSyncError("Connection Error");
          }
          setIsSyncing(false);
      } else {
          setEvents(DEFAULT_EVENTS);
          setSyncError(null);
          setLastSyncTime(null);
      }
  };

  useEffect(() => {
    if (settings.googleCalendarIcalUrl && settings.googleCalendarIcalUrl.length > 15) {
        setIsGoogleLinked(true);
        loadGoogleEvents();
    } else {
        setIsGoogleLinked(false);
        setEvents(DEFAULT_EVENTS);
        setSyncError(null);
        setLastSyncTime(null);
    }
  }, [settings.googleCalendarIcalUrl]);

  useEffect(() => {
      if (!isGoogleLinked) return;
      const interval = setInterval(loadGoogleEvents, settings.refreshInterval * 60000);
      return () => clearInterval(interval);
  }, [isGoogleLinked, settings.refreshInterval, settings.googleCalendarIcalUrl]);

  const isTrek = settings.theme === 'trek';

  return (
    <div className={`h-screen w-full p-3 sm:p-4 md:p-5 lg:p-6 relative flex bg-app ${isTrek ? 'overflow-hidden' : 'flex-col'}`} data-theme={settings.theme || 'dark'}>
      
      {/* LCARS Sidebar for Trek Theme */}
      {isTrek && (
        <div className="hidden lg:flex flex-col w-[clamp(120px,12vw,180px)] flex-shrink-0 ipad-landscape:hidden xl:flex">
          <div className="lcars-elbow-top w-full mb-3 flex items-end justify-end px-3 pb-1">
            <span className="text-black font-black text-xs">COM: ACCESS</span>
          </div>
          <div className="flex-1 lcars-sidebar flex flex-col p-4 justify-between">
            <div className="flex flex-col gap-2">
              <div className="bg-lcars-blue h-12 rounded-sm flex items-center justify-center text-black font-black text-sm">02-441</div>
              <div className="bg-lcars-peach h-8 rounded-sm"></div>
              <div className="bg-lcars-red h-24 rounded-sm flex items-end justify-center pb-2 text-black font-black text-xs rotate-180 [writing-mode:vertical-lr]">SECTOR 7G</div>
            </div>
            <div className="bg-black/20 p-2 rounded-sm text-[10px] text-black font-black leading-tight">
              STARDATE: {Math.floor(Date.now() / 1000000)}<br/>
              SECURE LINK: ACTIVE
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col ${isTrek ? 'mt-2' : ''}`}>
        <header className="flex justify-between items-end mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
              <h1 className={`${isTrek ? 'text-5xl font-bold uppercase italic' : 'text-4xl font-black'} app-header-text tracking-tighter`}>
                  {greeting}, <span className="app-header-accent">{settings.familyName}</span>
              </h1>
              
              <div className="flex items-center gap-2">
                  {isSyncing ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold app-header-text animate-pulse">
                          <Loader2 size={12} className="animate-spin" />
                          SYNCING
                      </div>
                  ) : syncError ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-[10px] font-bold">
                          <AlertCircle size={12} />
                          {syncError.toUpperCase()}
                      </div>
                  ) : lastSyncTime ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold">
                          <CheckCircle2 size={12} />
                          {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                  ) : null}
              </div>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 app-header-text transition-all">
              <Settings size={20} />
          </button>
        </header>

        <div className="relative z-10 flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 h-[30vh] sm:h-[26vh] lg:h-[22vh]">
              <TimeWidget weatherCondition={weatherCondition} />
              <WeatherWidget location={settings.location} refreshInterval={settings.refreshInterval} onWeatherUpdate={setWeatherCondition} />
              <LunchWidget schoolName={settings.schoolName} schoolId={settings.schoolId} />
              <DadJokeWidget />
          </div>
          <div className="flex-1 min-h-0">
              <CalendarGrid events={events} setEvents={setEvents} isGoogleLinked={isGoogleLinked} />
          </div>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSave={setSettings} />
    </div>
  );
};

export default App;
