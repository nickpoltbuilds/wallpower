
import React, { useState, useEffect, useCallback } from 'react';
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
  {
    id: '1',
    title: 'Soccer Practice',
    start: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(18, 30, 0, 0)).toISOString(),
    color: 'orange',
  },
  {
    id: '2',
    title: 'Trash Pickup',
    start: (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0,0,0,0); return d.toISOString(); })(),
    end: (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(23,59,0,0); return d.toISOString(); })(),
    color: 'green',
    isAllDay: true,
  },
];

const DEFAULTS: AppSettings = {
  familyName: 'Poltstetlers',
  location: 'Silver Spring, MD',
  schoolName: 'East Silver Spring Elementary',
  schoolId: 'EastSilverSpringES',
  googleCalendarIcalUrl: '',
  refreshInterval: 5,
  theme: 'dark',
  use24Hour: false,
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('familyHubSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old theme values to new 3-theme system
        const validThemes = ['dark', 'light', 'sunset'];
        if (!validThemes.includes(parsed.theme)) parsed.theme = 'dark';
        return { ...DEFAULTS, ...parsed };
      }
    } catch (e) {}
    return DEFAULTS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('familyHubSettings', JSON.stringify(settings));
  }, [settings]);

  const loadGoogleEvents = useCallback(async () => {
    const url = settings.googleCalendarIcalUrl;
    if (!url || url.length <= 15) {
      setEvents(DEFAULT_EVENTS);
      return;
    }
    try {
      const result = await fetchGoogleCalendarEvents(url);
      if (result.success) setEvents(result.events);
    } catch (e) {}
  }, [settings.googleCalendarIcalUrl]);

  useEffect(() => {
    const url = settings.googleCalendarIcalUrl;
    const linked = Boolean(url && url.length > 15);
    setIsGoogleLinked(linked);
    if (linked) {
      loadGoogleEvents();
    } else {
      setEvents(DEFAULT_EVENTS);
    }
  }, [settings.googleCalendarIcalUrl]);

  useEffect(() => {
    if (!isGoogleLinked) return;
    const interval = setInterval(loadGoogleEvents, settings.refreshInterval * 60000);
    return () => clearInterval(interval);
  }, [isGoogleLinked, settings.refreshInterval, loadGoogleEvents]);

  return (
    <div
      className="h-screen w-full relative flex flex-col bg-app overflow-hidden"
      data-theme={settings.theme}
    >
      {/* Settings trigger */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="settings-btn absolute bottom-4 right-4 z-50 p-2.5 rounded-full app-header-text transition-opacity opacity-40 hover:opacity-100"
        style={{ background: 'rgba(255,255,255,0.08)' }}
        aria-label="Open settings"
      >
        <Settings size={18} />
      </button>

      {/* Main layout */}
      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 md:p-5 min-h-0">

        {/* Top widget row — 2-col on tablet/mobile, 4-col on lg+ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 flex-shrink-0"
          style={{ gridAutoRows: 'clamp(160px, 26vh, 260px)' }}
        >
          <TimeWidget weatherCondition={weatherCondition} use24Hour={settings.use24Hour} />
          <WeatherWidget
            location={settings.location}
            refreshInterval={settings.refreshInterval}
            onWeatherUpdate={setWeatherCondition}
          />
          <LunchWidget schoolName={settings.schoolName} schoolId={settings.schoolId} />
          <DadJokeWidget />
        </div>

        {/* Calendar — fills remaining space */}
        <div className="flex-1 min-h-0">
          <CalendarGrid events={events} setEvents={setEvents} isGoogleLinked={isGoogleLinked} use24Hour={settings.use24Hour} />
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
