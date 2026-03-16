
import React, { useEffect, useState, useCallback, useId } from 'react';
import {
  Cloud, CloudRain, CloudSun, Sun, CloudLightning, Snowflake, RefreshCw
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { WeatherData } from '../types';
import { fetchWeather } from '../services/gemini';

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
  return <Icon style={{ width: 'clamp(36px, 8vmin, 52px)', height: 'clamp(36px, 8vmin, 52px)' }} className="opacity-90 flex-shrink-0" />;
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

// ─── Sparkline ────────────────────────────────────────────────────────────────

interface SparklineProps {
  data: WeatherData['hourly'];
}

const Sparkline: React.FC<SparklineProps> = ({ data }) => {
  const uid = useId().replace(/:/g, '');
  const gradId = `sf-${uid}`;

  if (data.length < 3) return null;

  const n   = data.length;
  const W   = 100;  // SVG viewBox units (percentage-like)
  const H   = 100;
  const pY  = 12;   // vertical padding in SVG units

  const temps  = data.map(d => d.temp);
  const minT   = Math.min(...temps);
  const maxT   = Math.max(...temps);
  const range  = maxT - minT || 1;

  const toX = (i: number) => (i / (n - 1)) * W;
  const toY = (t: number) => pY + (1 - (t - minT) / range) * (H - 2 * pY);

  const pts = temps.map((t, i) => [toX(i), toY(t)] as [number, number]);

  // Smooth cubic bezier path
  let line = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < n; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cpx = (x0 + x1) / 2;
    line += ` C ${cpx} ${y0} ${cpx} ${y1} ${x1} ${y1}`;
  }
  const fill = `${line} L ${pts[n-1][0]} ${H} L ${pts[0][0]} ${H} Z`;

  // Show labels at "Now", then every 3 hours, then last
  const labelSet = new Set([0, 3, 6, 9, 12].filter(i => i < n));
  labelSet.add(n - 1);
  const labelIdxs = Array.from(labelSet).sort((a, b) => a - b);

  return (
    <div className="flex flex-col w-full">
      {/* SVG curve — stretched horizontally, text-free */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: '42px' }}
        preserveAspectRatio="none"
        role="img"
        aria-label="Hourly temperature forecast"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Fill */}
        <path d={fill} fill={`url(#${gradId})`} />
        {/* Line */}
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
        {/* Current-time dot */}
        <circle cx={pts[0][0]} cy={pts[0][1]} r="3.5"  fill="currentColor" opacity="0.9" />
        <circle cx={pts[0][0]} cy={pts[0][1]} r="7"    fill="currentColor" opacity="0.15" />
      </svg>

      {/* Time labels — HTML so they don't get stretched */}
      <div className="relative w-full" style={{ height: '16px' }}>
        {labelIdxs.map(i => {
          const leftPct = toX(i); // 0–100, matches the SVG x positions
          const isFirst = i === 0;
          const isLast  = i === n - 1;
          return (
            <span
              key={i}
              className="absolute text-[11px] font-black uppercase tracking-wide"
              style={{
                left:      `${leftPct}%`,
                top:       0,
                transform: isFirst ? 'none' : isLast ? 'translateX(-100%)' : 'translateX(-50%)',
                opacity:   0.5,
                lineHeight: '16px',
                whiteSpace: 'nowrap',
              }}
            >
              {data[i].label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

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
    <div className="flex items-center gap-2 h-[30px]">
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
  <div className="flex flex-col h-full px-3.5 pt-3 pb-3 gap-3">
    {/* Current */}
    <div className="flex items-center gap-3">
      <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="skeleton h-9 w-20 rounded-lg" />
        <div className="skeleton h-3 w-28 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    </div>
    {/* Sparkline */}
    <div className="flex flex-col gap-1">
      <div className="skeleton w-full rounded" style={{ height: '42px' }} />
      <div className="skeleton h-3 w-full rounded" />
    </div>
    {/* Forecast rows */}
    <div className="flex flex-col gap-1.5 mt-auto">
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

        <div className="h-full flex flex-col px-3.5 pt-3 pb-3 gap-1.5 min-h-0 overflow-hidden">

          {/* ── Current conditions ── */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <BigIcon condition={weather.condition} />

            <div className="flex-1 min-w-0 flex items-center gap-2.5">
              {/* Big temp */}
              <div
                className="font-black tracking-tighter leading-none tabular-nums flex-shrink-0"
                style={{ fontSize: 'clamp(2.4rem, 7vmin, 3.8rem)' }}
              >
                {Math.round(weather.currentTemp)}°
              </div>

              {/* H / L stacked to the right of the temp */}
              <div className="flex flex-col justify-center gap-0.5">
                <span
                  className="text-[15px] font-black tabular-nums leading-none"
                  style={{ color: tempColor(weather.high) }}
                >
                  H:{Math.round(weather.high)}°
                </span>
                <span className="text-[12px] font-black tabular-nums leading-none opacity-40">
                  L:{Math.round(weather.low)}°
                </span>
              </div>
            </div>

            {/* Condition + location pushed to far right */}
            <div className="flex flex-col items-end flex-shrink-0 max-w-[40%]">
              <span className="text-[13px] font-bold opacity-65 leading-tight text-right truncate w-full">
                {weather.condition}
              </span>
              {weather.feelsLike !== undefined && weather.feelsLike !== weather.currentTemp && (
                <span className="text-[12px] font-bold opacity-40 leading-tight">
                  Feels {weather.feelsLike}°
                </span>
              )}
              <span className="text-[11px] font-black uppercase tracking-wider opacity-35 truncate w-full text-right mt-0.5">
                {weather.location.split(',')[0]}
              </span>
            </div>
          </div>

          {/* ── Hourly sparkline ── */}
          {weather.hourly.length >= 3 && (
            <div className="flex-1 min-h-0 flex items-end pb-1">
              <Sparkline data={weather.hourly} />
            </div>
          )}

          {/* ── 3-day forecast ── */}
          {forecastDays.length > 0 && (
            <div className="flex-shrink-0 flex flex-col gap-0">
              <div className="h-px mb-1.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
              {forecastDays.map((day, i) => (
                <ForecastRow key={i} day={day} weekMin={weekMin} weekMax={weekMax} />
              ))}
            </div>
          )}
        </div>

      ) : error ? (
        <div className="h-full flex flex-col items-center justify-center gap-3 px-4 opacity-70">
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
