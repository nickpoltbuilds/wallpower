
import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSun, Sun, CloudLightning, Snowflake, RefreshCw, AlertCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { WeatherData } from '../types';
import { fetchWeather } from '../services/gemini';

interface WeatherWidgetProps {
  location: string;
  refreshInterval: number;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location, refreshInterval }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadWeather = async () => {
    if (!location) return;
    setLoading(true);
    setError(false);
    try {
        const data = await fetchWeather(location);
        if (data) {
            setWeather(data);
        } else {
            setError(true);
        }
    } catch (e) {
        console.error("Widget load error:", e);
        setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWeather();
    const intervalMs = refreshInterval * 60 * 1000;
    const interval = setInterval(loadWeather, intervalMs);
    return () => clearInterval(interval);
  }, [location, refreshInterval]);

  const getWeatherIcon = (condition: string, className: string = "w-8 h-8") => {
    const c = condition.toLowerCase();
    // Darker icons for light background
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className={`${className} text-blue-600`} />;
    if (c.includes('snow') || c.includes('blizzard')) return <Snowflake className={`${className} text-sky-400`} />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className={`${className} text-purple-600`} />;
    if (c.includes('partly')) return <CloudSun className={`${className} text-orange-500`} />;
    if (c.includes('cloud') || c.includes('overcast') || c.includes('fog')) return <Cloud className={`${className} text-slate-500`} />;
    return <Sun className={`${className} text-yellow-500`} />;
  };

  return (
    <GlassCard 
      title="Forecast" 
      icon={<CloudSun size={18} />} 
      // Light Blue Background
      className="h-full bg-sky-100"
      darkText={true}
      action={
        <button onClick={loadWeather} className={`text-slate-400 hover:text-slate-600 ${loading ? 'animate-spin' : ''}`}>
          <RefreshCw size={14} />
        </button>
      }
    >
      {weather ? (
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-start justify-between mt-1">
            <div>
              <div className="text-5xl font-black text-slate-800 tracking-tighter leading-none">{Math.round(weather.currentTemp)}°</div>
              <div className="text-slate-600 text-xs font-bold capitalize mt-1">
                 {weather.condition}
              </div>
            </div>
            <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{weather.location}</div>
                <div className="inline-flex bg-white/60 rounded-lg px-2 py-1 gap-2 text-xs text-slate-600 font-bold">
                    <span>H: {Math.round(weather.high)}°</span>
                    <span className="text-slate-400">|</span>
                    <span>L: {Math.round(weather.low)}°</span>
                </div>
            </div>
          </div>

          <div className="mt-auto min-h-[4px]"></div>

          {/* Forecast Grid */}
          <div className="grid grid-cols-3 gap-2">
            {weather.forecast.map((day, i) => (
              <div key={i} className="flex flex-col items-center bg-white rounded-xl p-2 shadow-sm">
                <span className="text-[9px] text-slate-400 uppercase font-black mb-1">{day.day.slice(0,3)}</span>
                {getWeatherIcon(day.icon, "w-5 h-5")}
                <div className="mt-1 text-xs font-bold text-slate-800">{Math.round(day.high)}°</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-slate-400">
          {loading ? (
             <div className="animate-pulse flex flex-col items-center gap-2">
                <CloudSun className="animate-bounce" />
             </div>
          ) : error ? (
             <div className="flex flex-col items-center text-center">
                <p className="text-xs font-bold mb-2">Unavailable</p>
                <button onClick={loadWeather} className="px-3 py-1 bg-slate-200 rounded-full text-[10px] font-bold text-slate-600">Retry</button>
             </div>
          ) : null}
        </div>
      )}
    </GlassCard>
  );
};
