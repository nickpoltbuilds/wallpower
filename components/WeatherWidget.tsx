
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

  // Use currentColor (inherit from parent text color) for icons so they adapt to themes
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
          {/* Top Section: Icon + Temp left, Loc + HL right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               {getWeatherIcon(weather.condition, "w-10 h-10 lg:w-12 lg:h-12")}
               <div className="text-5xl lg:text-6xl font-black tracking-tighter leading-none">
                  {Math.round(weather.currentTemp)}°
               </div>
            </div>
            
            <div className="text-right flex flex-col items-end justify-center">
                <div className="text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1 max-w-[80px] truncate">
                    {weather.location.split(',')[0]}
                </div>
                <div className="text-xs font-bold opacity-90 bg-black/5 rounded-md px-2 py-1 whitespace-nowrap">
                    H:{Math.round(weather.high)}° L:{Math.round(weather.low)}°
                </div>
            </div>
          </div>

          {/* Flexible Spacer */}
          <div className="flex-1 min-h-[5px]"></div>

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
