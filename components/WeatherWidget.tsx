
import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSun, Sun, CloudLightning, Snowflake, RefreshCw } from 'lucide-react';
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
    const baseClass = `${className} opacity-90`; 
    if (c.includes('rain') || c.includes('drizzle') || c.includes('showers')) return <CloudRain className={baseClass} />;
    if (c.includes('snow') || c.includes('blizzard') || c.includes('flurries')) return <Snowflake className={baseClass} />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className={baseClass} />;
    if (c.includes('partly') || c.includes('scattered')) return <CloudSun className={baseClass} />;
    if (c.includes('cloud') || c.includes('overcast') || c.includes('fog') || c.includes('haze')) return <Cloud className={baseClass} />;
    return <Sun className={baseClass} />;
  };

  return (
    <GlassCard 
      title="Forecast" 
      icon={<CloudSun size={18} />} 
      className="h-full widget-weather"
      noContentPadding={true}
      action={
        <button onClick={loadWeather} className={`opacity-50 hover:opacity-100 ${loading ? 'animate-spin' : ''}`}>
          <RefreshCw size={14} />
        </button>
      }
    >
      {weather ? (
        <div className="flex flex-col h-full justify-between px-4 pb-3 pt-1">
          {/* Main Temperature Section */}
          <div className="flex items-center gap-4 pt-1">
             {getWeatherIcon(weather.condition, "w-12 h-12 lg:w-14 lg:h-14")}
             <div className="text-6xl lg:text-7xl font-black tracking-tighter leading-none">
                {Math.round(weather.currentTemp)}°
             </div>
          </div>

          {/* Details Section: Location and H/L summary */}
          <div className="flex items-center justify-between px-0.5 my-1">
              <div className="text-[11px] font-black opacity-70 uppercase tracking-widest truncate max-w-[130px]">
                  {weather.location.split(',')[0]}
              </div>
              <div className="text-[11px] font-black opacity-100 bg-black/10 dark:bg-white/10 rounded-md px-2 py-1 flex gap-2">
                  <span>H:{Math.round(weather.high)}°</span>
                  <span className="opacity-30">/</span>
                  <span>L:{Math.round(weather.low)}°</span>
              </div>
          </div>

          {/* Forecast Grid - Compact */}
          <div className="grid grid-cols-3 gap-2">
            {weather.forecast.map((day, i) => (
              <div key={i} className="flex flex-col items-center justify-center bg-white/30 dark:bg-white/10 rounded-lg p-1.5 shadow-sm backdrop-blur-sm">
                <span className="text-[9px] opacity-70 uppercase font-black mb-0.5">{day.day.slice(0,3)}</span>
                {getWeatherIcon(day.icon, "w-5 h-5 mb-0.5")}
                <div className="text-sm font-black">{Math.round(day.high)}°</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center opacity-50 p-4">
          {loading ? (
             <div className="animate-pulse flex flex-col items-center gap-2">
                <CloudSun className="animate-bounce" />
             </div>
          ) : error ? (
             <div className="flex flex-col items-center text-center">
                <p className="text-xs font-bold mb-2">Unavailable</p>
                <button onClick={loadWeather} className="px-3 py-1 bg-current bg-opacity-10 rounded-full text-[10px] font-bold">Retry</button>
             </div>
          ) : null}
        </div>
      )}
    </GlassCard>
  );
};
