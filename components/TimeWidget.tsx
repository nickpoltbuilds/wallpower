
import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';

export const TimeWidget: React.FC = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <GlassCard className="h-full bg-indigo-600 text-white border-none">
      <div className="h-full flex flex-col items-center justify-center text-center">
        {/* Massive Time */}
        <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-none">
          {formatTime(date)}
        </h1>
        {/* Clean Date */}
        <div className="mt-2 px-4 py-1 bg-black/20 rounded-full">
            <p className="text-xs font-bold tracking-wide uppercase text-white/90">
            {formatDate(date)}
            </p>
        </div>
      </div>
    </GlassCard>
  );
};
