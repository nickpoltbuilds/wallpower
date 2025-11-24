
import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';

export const TimeWidget: React.FC = () => {
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

  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <GlassCard className="h-full bg-indigo-600 text-white border-none">
      <div className="h-full flex flex-col items-center justify-center text-center">
        {/* Massive Time (24h) */}
        <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-1">
          {formatTime(date)}
        </h1>
        
        {/* Elegant Date Stack */}
        <div className="flex flex-col items-center">
            <p className="text-indigo-200 text-xs font-bold tracking-[0.2em] uppercase mb-0.5">
                {weekday}
            </p>
            <p className="text-xl lg:text-2xl font-bold text-white leading-tight">
                {monthDay}
            </p>
        </div>
      </div>
    </GlassCard>
  );
};
