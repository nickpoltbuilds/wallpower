
import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { SphereFace } from './SphereFace';

interface TimeWidgetProps {
  weatherCondition?: string;
}

export const TimeWidget: React.FC<TimeWidgetProps> = ({ weatherCondition = 'clear' }) => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    });
  };

  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <GlassCard className="h-full widget-time relative overflow-hidden" noContentPadding={true}>
      <div className="h-full flex flex-col items-center justify-between py-3 px-4">
        {/* Sphere Buddy Section */}
        <div className="flex-1 flex items-center justify-center min-h-0">
            <SphereFace weatherCondition={weatherCondition} />
        </div>

        {/* Clock & Date Section - More integrated and compact */}
        <div className="flex flex-col items-center w-full mt-1">
            <div className="flex flex-col items-center gap-0">
                <h1 className="text-[clamp(2.5rem,7vmin,4rem)] font-black tracking-tighter leading-none">
                  {formatTime(date)}
                </h1>
                
                <div className="mt-1 px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 flex items-center gap-2">
                    <span className="widget-time-sub text-fluid-xs font-black tracking-wider uppercase">
                        {weekday}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-current opacity-20" />
                    <span className="text-fluid-xs font-black uppercase tracking-tight">
                        {monthDay}
                    </span>
                </div>
            </div>
        </div>
      </div>
    </GlassCard>
  );
};
