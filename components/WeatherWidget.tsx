
import React, { useEffect, useState, useCallback } from 'react';
import {
  Cloud, CloudRain, CloudSun, Sun, CloudLightning, Snowflake, RefreshCw
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { WeatherData } from '../types';
import { fetchWeather } from '../services/api';

interface WeatherWidgetProps {
  location: string;
  refreshInterval: number;
  onWeatherUpdate?: (condition: string) => void;
}

// ─── Icon helpers ────────────────────────────────────────────────────────────

function getIconComponent(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return CloudRain;
  if (c.includes('snow') || c.includes('blizzard') || c.includes('flurr'))  return Snowflake;
  if (c.includes('storm') || c.includes('thunder'))                         return CloudLightning;
  if (c.includes('partly') || c.includes('scattered') || c.includes('mostly clear')) return CloudSun;
  if (c.includes('cloud') || c.includes('overcast') || c.includes('fog') || c.includes('haze')) return Cloud;
  return Sun;
}

const BigIcon: React.FC<{ condition: string }> = ({ condition }) => {
  const Icon = getIconComponent(condition);
  return <Icon style={{ width: 'clamp(30px, 6vmin, 44px)', height: 'clamp(30px, 6vmin, 44px)' }} className="opacity-90 flex-shrink-0" />;
};

const SmallIcon: React.FC<{ condition: string }> = ({ condition }) => {
  const Icon = getIconComponent(condition);
  return <Icon size={14} className="opacity-80 flex-shrink-0" />;
};

// ─── Temperature → colour (for range bars) ────────────────────────────────

function tempColor(f: number): string {
  if (f <= 28) return '#bfdbfe'; // icy blue
  if (f <= 40) return '#93c5fd';
  if (f <= 50) return '#6ee7b7'; // teal
  if (f <= 62) return '#86efac'; // green
  if (f <= 72) return '#fde68a'; // yellow
  if (f <= 82) return '#fb923c'; // orange
  return '#f87171';              // red
}

// ─── Forecast row with Apple-style temp bar ───────────────────────────────────

interface ForecastRowProps {
  day:     WeatherData['forecast'][0];
  weekMin: number;
  weekMax: number;
}

const ForecastRow: React.FC<ForecastRowProps> = ({ day, weekMin, weekMax }) => {
  const range    = weekMax - weekMin || 1;
  const leftPct  = ((day.low  - weekMin) / range) * 100;
  const widthPct = Math.max(((day.high - day.low) / range) * 100, 10);

  return (
    <div className="flex items-center space-x-2 h-[32px]">
      {/* Day label */}
      <span className="text-[13px] font-black opacity-85 w-8 flex-shrink-0 tracking-tight">
        {day.day.slice(0, 3)}
      </span>

      {/* Weather icon */}
      <SmallIcon condition={day.icon} />

      {/* Low temp */}
      <span className="text-[13px] font-black tabular-nums opacity-45 w-7 text-right flex-shrink-0">
        {Math.round(day.low)}°
      </span>

      {/* Temperature range bar */}
      <div
        className="flex-1 relative rounded-full overflow-hidden"
        style={{ height: '5px', background: 'var(--bar-track)' }}
      >
        <div
          className="absolute h-full rounded-full"
          style={{
            left:       `${leftPct}%`,
            width:      `${widthPct}%`,
            background: `linear-gradient(to right, ${tempColor(day.low)}, ${tempColor(day.high)})`,
          }}
        />
      </div>

      {/* High temp */}
      <span className="text-[13px] font-black tabular-nums w-7 flex-shrink-0">
        {Math.round(day.high)}°
      </span>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonWeather = () => (
  <div className="flex flex-col h-full px-3.5 pt-3 pb-3 space-y-3">
    {/* Current */}
    <div className="flex items-center space-x-3">
      <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex flex-col space-y-1.5 flex-1">
        <div className="skeleton h-9 w-20 rounded-lg" />
        <div className="skeleton h-3 w-28 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    </div>
    {/* Forecast rows */}
    <div className="flex flex-col space-y-1.5 mt-auto">
      {[0,1,2].map(i => <div key={i} className="skeleton h-6 w-full rounded" />)}
    </div>
  </div>
);

// ─── Main widget ──────────────────────────────────────────────────────────────

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location, refreshInterval, onWeatherUpdate }) => {
  const [weather, setWeather]   = useState<WeatherData | null>(null);
  const [loading, setLoading]   = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [error, setError]       = useState(false);

  const loadWeather = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setError(false);
    try {
      const data = await fetchWeather(location);
      if (data) {
        setWeather(data);
        onWeatherUpdate?.(data.condition);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [location, onWeatherUpdate]);

  useEffect(() => {
    loadWeather();
    const iv = setInterval(loadWeather, refreshInterval * 60_000);
    return () => clearInterval(iv);
  }, [loadWeather, refreshInterval]);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 520);
    loadWeather();
  };

  // Forecast rows = tomorrow + 2 more days (skip today at index 0)
  const forecastDays  = weather?.forecast.slice(1, 4) ?? [];
  const allDays       = weather?.forecast ?? [];
  const weekMin = Math.min(...allDays.map(d => d.low),  99);
  const weekMax = Math.max(...allDays.map(d => d.high), -99);

  return (
    <GlassCard className="h-full widget-weather overflow-hidden" noContentPadding>
      {/* Refresh button — absolute so it doesn't affect layout */}
      <button
        onClick={handleRefresh}
        className="absolute top-2.5 right-3 z-10 opacity-35 hover:opacity-80 transition-opacity"
        aria-label="Refresh weather"
      >
        <RefreshCw
          size={12}
          style={{
            transform:  spinning ? 'rotate(360deg)' : 'none',
            transition: spinning ? 'transform 0.52s ease' : 'none',
          }}
        />
      </button>

      {/* ── Loading skeleton ── */}
      {loading && !weather ? (
        <SkeletonWeather />
      ) : weather ? (

        <div className="h-full flex flex-col justify-between px-3.5 pt-3 pb-3 min-h-0 overflow-hidden">

          {/* ── Current conditions ── */}
          <div className="flex-shrink-0 flex items-center space-x-3">
            <BigIcon condition={weather.condition} />

            {/* Big temp */}
            <div
              className="font-black tracking-tighter leading-none tabular-nums flex-shrink-0"
              style={{ fontSize: 'clamp(1.9rem, 5.2vmin, 2.9rem)' }}
            >
              {Math.round(weather.currentTemp)}°
            </div>

            {/* Condition · H/L · feels · location — right column truncates instead of overlapping */}
            <div className="flex-1 min-w-0 flex flex-col items-end justify-center leading-tight">
              <span className="text-[13px] font-bold opacity-65 text-right truncate w-full">
                {weather.condition}
              </span>
              <span className="text-[12px] font-black tabular-nums mt-0.5">
                <span style={{ color: tempColor(weather.high) }}>H:{Math.round(weather.high)}°</span>
                <span className="opacity-40 ml-1.5">L:{Math.round(weather.low)}°</span>
              </span>
              {weather.feelsLike !== undefined && weather.feelsLike !== weather.currentTemp && (
                <span className="text-[11px] font-bold opacity-40 mt-0.5">
                  Feels {weather.feelsLike}°
                </span>
              )}
              <span className="text-[11px] font-black uppercase tracking-wider opacity-35 truncate w-full text-right mt-0.5">
                {weather.location.split(',')[0]}
              </span>
            </div>
          </div>

          {/* ── 3-day forecast ── */}
          {forecastDays.length > 0 && (
            <div className="flex-shrink-0 flex flex-col space-y-0">
              <div className="h-px mb-1.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
              {forecastDays.map((day, i) => (
                <ForecastRow key={i} day={day} weekMin={weekMin} weekMax={weekMax} />
              ))}
            </div>
          )}
        </div>

      ) : error ? (
        <div className="h-full flex flex-col items-center justify-center space-y-3 px-4 opacity-70">
          <Cloud size={28} className="opacity-40" />
          <p className="text-[13px] font-black uppercase tracking-wider opacity-60">Unavailable</p>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-lg text-[12px] font-black uppercase tracking-wider hover:opacity-80"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          >
            Retry
          </button>
        </div>
      ) : null}
    </GlassCard>
  );
};
