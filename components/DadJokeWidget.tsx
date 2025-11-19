import React, { useEffect, useState } from 'react';
import { Smile, RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { fetchDadJoke } from '../services/gemini';

export const DadJokeWidget: React.FC = () => {
  const [joke, setJoke] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadJoke = async () => {
    setLoading(true);
    const newJoke = await fetchDadJoke();
    setJoke(newJoke);
    setLoading(false);
  };

  useEffect(() => {
    loadJoke();
    // Refresh joke every 4 hours automatically
    const interval = setInterval(loadJoke, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard 
      title="Dad Joke" 
      icon={<Smile size={20} />} 
      className="h-full bg-gradient-to-br from-yellow-900/20 to-orange-900/20"
      action={
        <button onClick={loadJoke} className={`text-white/50 hover:text-white ${loading ? 'animate-spin' : ''}`}>
          <RefreshCw size={14} />
        </button>
      }
    >
      <div className="h-full flex items-center justify-center p-2 text-center">
        <p className="text-sm md:text-base font-medium text-white/90 leading-relaxed italic">
            {joke ? `"${joke}"` : "Thinking of a pun..."}
        </p>
      </div>
    </GlassCard>
  );
};