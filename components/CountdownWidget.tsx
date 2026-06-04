
import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';

interface CountdownWidgetProps {
  label?: string;
  date?: string; // YYYY-MM-DD
}

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({ label, date }) => {
  const [days, setDays] = useState<number | null>(null);
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    if (!date) { setDays(null); return; }

    const calc = () => {
      const target = new Date(date + 'T00:00:00');
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diff = Math.round((target.getTime() - now.getTime()) / 86400000);
      setIsPast(diff < 0);
      setDays(Math.abs(diff));
    };

    calc();

    // Recalculate at midnight
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timeout = setTimeout(calc, msUntilMidnight);
    return () => clearTimeout(timeout);
  }, [date]);

  const dayWord = days === 1 ? 'day' : 'days';

  return (
    <GlassCard
      title="Countdown"
      icon={<span className="text-sm leading-none">⏳</span>}
      className="h-full widget-countdown"
    >
      <div className="h-full flex flex-col items-center justify-center pb-2 space-y-1">
        {!date ? (
          <p
            className="widget-countdown-sub font-medium opacity-60 text-center leading-snug"
            style={{ fontSize: 'clamp(0.75rem, 1.8vmin, 0.85rem)' }}
          >
            Set a countdown<br />in Settings
          </p>
        ) : days === 0 ? (
          <>
            <p style={{ fontSize: 'clamp(2rem, 6vmin, 3rem)', lineHeight: 1 }}>🎉</p>
            <p className="font-black widget-countdown-sub" style={{ fontSize: 'clamp(0.78rem, 2vmin, 0.9rem)' }}>
              Today!
            </p>
            {label && (
              <p className="font-bold opacity-75 text-center" style={{ fontSize: 'clamp(0.7rem, 1.7vmin, 0.8rem)' }}>
                {label}
              </p>
            )}
          </>
        ) : (
          <>
            <p
              className="font-black tabular-nums"
              style={{ fontSize: 'clamp(2.5rem, 8vmin, 4rem)', lineHeight: 1 }}
            >
              {days}
            </p>
            <p
              className="font-black widget-countdown-sub"
              style={{ fontSize: 'clamp(0.65rem, 1.6vmin, 0.75rem)' }}
            >
              {isPast ? `${dayWord} ago` : `${dayWord} to go`}
            </p>
            {label && (
              <p
                className="font-bold opacity-75 text-center"
                style={{ fontSize: 'clamp(0.7rem, 1.8vmin, 0.82rem)', marginTop: '0.15rem' }}
              >
                {label}
              </p>
            )}
          </>
        )}
      </div>
    </GlassCard>
  );
};
