
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
    <GlassCard className="h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-400/20">
      <div className="h-full flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tighter drop-shadow-2xl transition-all">
          {formatTime(date)}
        </h1>
        <p className="text-xs text-blue-200 mt-1 font-bold tracking-widest uppercase opacity-80">
          {formatDate(date)}
        </p>
      </div>
    </GlassCard>
  );
};
