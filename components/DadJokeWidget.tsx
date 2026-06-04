
import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { fetchDadJoke } from '../services/api';

export const DadJokeWidget: React.FC = () => {
  const [joke, setJoke] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const loadJoke = async () => {
    setLoading(true);
    const newJoke = await fetchDadJoke();
    setJoke(newJoke);
    setLoading(false);
  };

  useEffect(() => {
    loadJoke();
    const interval = setInterval(loadJoke, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 500);
    loadJoke();
  };

  return (
    <GlassCard
      title="Dad Joke"
      icon={<span className="text-sm leading-none">😄</span>}
      className="h-full widget-joke"
      action={
        <button
          onClick={handleRefresh}
          className="opacity-40 hover:opacity-80 transition-opacity"
        >
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
      <div className="h-full flex items-center justify-center px-1 pb-2">
        {loading && !joke ? (
          <div className="flex flex-col space-y-2 w-full">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-4/5 rounded" />
            <div className="skeleton h-4 w-3/5 rounded" />
          </div>
        ) : (
          <p
            className="font-bold leading-snug text-center opacity-90"
            style={{ fontSize: 'clamp(0.85rem, 2.2vmin, 1.05rem)' }}
          >
            {joke && `"${joke}"`}
          </p>
        )}
      </div>
    </GlassCard>
  );
};
