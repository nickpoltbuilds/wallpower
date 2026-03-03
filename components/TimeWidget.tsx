
import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSun, Sun, CloudLightning, Snowflake } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface TimeWidgetProps {
  weatherCondition?: string;
}

const WeatherIcon: React.FC<{ condition: string }> = ({ condition }) => {
  const c = condition.toLowerCase();
  const cls = 'opacity-60';
  const size = 16;
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return <CloudRain size={size} className={cls} />;
  if (c.includes('snow') || c.includes('blizzard') || c.includes('flurr')) return <Snowflake size={size} className={cls} />;
  if (c.includes('storm') || c.includes('thunder')) return <CloudLightning size={size} className={cls} />;
  if (c.includes('partly') || c.includes('scattered') || c.includes('mostly clear')) return <CloudSun size={size} className={cls} />;
  if (c.includes('cloud') || c.includes('overcast') || c.includes('fog') || c.includes('haze')) return <Cloud size={size} className={cls} />;
  return <Sun size={size} className={cls} />;
};

export const TimeWidget: React.FC<TimeWidgetProps> = ({ weatherCondition = '' }) => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours   = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const weekday  = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

  return (
    <GlassCard className="h-full widget-time overflow-hidden" noContentPadding>
      {/* Ambient animated background layer */}
      <div className="absolute inset-0 animate-ambient pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 60%, rgba(255,255,255,0.07) 0%, transparent 65%)',
          }}
        />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center gap-2 py-5 px-4">
        {/* Time */}
        <div className="flex items-end leading-none tabular-nums select-none">
          <span
            className="font-black tracking-tighter"
            style={{ fontSize: 'clamp(2.8rem, 8vmin, 5rem)' }}
          >
            {hours}:{minutes}
          </span>
          <span
            className="font-bold tracking-tighter mb-1 ml-1 opacity-50"
            style={{ fontSize: 'clamp(1rem, 2.5vmin, 1.75rem)' }}
          >
            {seconds}
          </span>
        </div>

        {/* Date row */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.15)' }}
          >
            <span className="widget-time-sub text-[11px] font-black tracking-widest">
              {weekday}
            </span>
            <span className="w-1 h-1 rounded-full bg-current opacity-25" />
            <span className="text-[11px] font-black tracking-tight opacity-90">
              {monthDay}
            </span>
            {weatherCondition && (
              <>
                <span className="w-1 h-1 rounded-full bg-current opacity-25" />
                <WeatherIcon condition={weatherCondition} />
              </>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
