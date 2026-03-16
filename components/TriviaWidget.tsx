
import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { fetchTrivia } from '../services/api';

interface TriviaState {
  question: string;
  correct: string;
}

export const TriviaWidget: React.FC = () => {
  const [trivia, setTrivia] = useState<TriviaState | null>(null);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const load = async () => {
    setLoading(true);
    setRevealed(false);
    const result = await fetchTrivia();
    setTrivia(result);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 500);
    load();
  };

  return (
    <GlassCard
      title="Trivia"
      icon={<span className="text-sm leading-none">🧠</span>}
      className="h-full widget-trivia"
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
      <div className="h-full flex flex-col justify-between px-1 pb-2 gap-2">
        {loading && !trivia ? (
          <div className="flex flex-col gap-2 w-full mt-1">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-4/5 rounded" />
          </div>
        ) : trivia ? (
          <>
            <p
              className="font-bold leading-snug opacity-90"
              style={{ fontSize: 'clamp(0.78rem, 2vmin, 0.92rem)' }}
            >
              {trivia.question}
            </p>
            {revealed ? (
              <p
                className="font-black widget-trivia-sub"
                style={{ fontSize: 'clamp(0.78rem, 2vmin, 0.9rem)' }}
              >
                ✓ {trivia.correct}
              </p>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="self-start px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-opacity opacity-60 hover:opacity-100"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              >
                Reveal
              </button>
            )}
          </>
        ) : (
          <p className="opacity-50 text-center mt-4" style={{ fontSize: '0.8rem' }}>
            Unavailable
          </p>
        )}
      </div>
    </GlassCard>
  );
};
