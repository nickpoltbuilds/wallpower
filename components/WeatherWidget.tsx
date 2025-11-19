
import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSun, Sun, CloudLightning, Snowflake, RefreshCw, AlertCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { WeatherData } from '../types';
import { fetchWeather } from '../services/gemini';

interface WeatherWidgetProps {
  location: string;
  refreshInterval: number; // minutes
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
    // Convert minutes to milliseconds
    const intervalMs = refreshInterval * 60 * 1000;
    const interval = setInterval(loadWeather, intervalMs);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, refreshInterval]);

  const getWeatherIcon = (condition: string, className: string = "w-8 h-8") => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className={`${className} text-blue-400`} />;
    if (c.includes('snow') || c.includes('blizzard')) return <Snowflake className={`${className} text-white`} />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className={`${className} text-yellow-400`} />;
    if (c.includes('partly')) return <CloudSun className={`${className} text-orange-300`} />;
    if (c.includes('cloud') || c.includes('overcast') || c.includes('fog')) return <Cloud className={`${className} text-gray-400`} />;
    return <Sun className={`${className} text-yellow-500`} />;
  };

  return (
    <GlassCard 
      title="Weather Forecast" 
      icon={<CloudSun size={20} />} 
      action={
        <button onClick={loadWeather} className={`text-white/50 hover:text-white ${loading ? 'animate-spin' : ''}`}>
          <RefreshCw size={16} />
        </button>
      }
      className="h-full"
    >
      {weather ? (
        <div className="flex flex-col h-full justify-between">
          {/* Top Section: Current Weather */}
          <div className="flex items-center justify-between mt-0">
            <div>
              <div className="text-5xl lg:text-6xl font-bold text-white tracking-tighter">{Math.round(weather.currentTemp)}°</div>
              <div className="text-white/60 text-sm font-medium capitalize truncate max-w-[120px] flex items-center gap-2">
                 {weather.condition}
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-white/90 font-medium truncate max-w-[120px] mb-1">{weather.location}</div>
              <div className="flex gap-3 text-sm text-white/50">
                <span className="font-medium text-white/80">H: {Math.round(weather.high)}°</span>
                <span>L: {Math.round(weather.low)}°</span>
              </div>
            </div>
          </div>

          {/* Flexible Spacer */}
          <div className="mt-auto min-h-[10px]"></div>

          {/* Bottom Section: Forecast Grid (Compact) */}
          <div className="grid grid-cols-3 gap-2">
            {weather.forecast.map((day, i) => (
              <div key={i} className="flex flex-col items-center bg-white/5 rounded-xl p-2">
                <span className="text-[9px] text-white/40 uppercase font-bold mb-1">{day.day.slice(0,3)}</span>
                {getWeatherIcon(day.icon, "w-6 h-6")}
                <div className="mt-0.5 text-sm font-bold text-white">{Math.round(day.high)}°</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-white/30">
          {loading ? (
             <div className="animate-pulse flex flex-col items-center gap-2">
                <CloudSun className="animate-bounce" />
                <span>Forecasting...</span>
             </div>
          ) : error ? (
             <div className="flex flex-col items-center text-center p-4">
                <AlertCircle className="mb-2 text-red-400 opacity-80" size={24} />
                <p className="text-sm text-white/60 mb-3">Unable to load weather</p>
                <button 
                    onClick={loadWeather} 
                    className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold text-white transition-colors"
                >
                    Retry
                </button>
             </div>
          ) : (
             "Add location in settings"
          )}
        </div>
      )}
    </GlassCard>
  );
};
