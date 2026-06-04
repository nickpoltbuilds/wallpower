
import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { fetchOnThisDay } from '../services/api';

interface Fact {
  year: number;
  text: string;
}

export const OnThisDayWidget: React.FC = () => {
  const [fact, setFact] = useState<Fact | null>(null);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const load = async () => {
    setLoading(true);
    const result = await fetchOnThisDay();
    setFact(result);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 500);
    load();
  };

  return (
    <GlassCard
      title="On This Day"
      icon={<span className="text-sm leading-none">📅</span>}
      className="h-full widget-onthisday"
      action={
        <button onClick={handleRefresh} className="opacity-40 hover:opacity-80 transition-opacity">
          <RefreshCw
            size={13}
            style={{
              transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)',
              transition: spinning ? 'transform 0.5s ease' : 'none',
            }}
          />
        </button>
      }
    >
      <div className="h-full flex flex-col justify-center px-1 pb-2 space-y-1.5">
        {loading && !fact ? (
          <div className="flex flex-col space-y-2 w-full">
            <div className="skeleton h-3 w-1/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-4/5 rounded" />
          </div>
        ) : fact ? (
          <>
            <p
              className="font-black widget-onthisday-sub"
              style={{ fontSize: 'clamp(0.65rem, 1.6vmin, 0.75rem)' }}
            >
              {fact.year}
            </p>
            <p
              className="font-bold leading-snug opacity-90"
              style={{ fontSize: 'clamp(0.8rem, 2vmin, 0.95rem)' }}
            >
              {fact.text}
            </p>
          </>
        ) : (
          <p className="opacity-50 text-center" style={{ fontSize: '0.8rem' }}>
            Unavailable
          </p>
        )}
      </div>
    </GlassCard>
  );
};
