
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
    const interval = setInterval(loadJoke, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard 
      title="Dad Joke" 
      icon={<Smile size={18} />} 
      // Vibrant Yellow Background
      className="h-full bg-yellow-300"
      darkText={true}
      action={
        <button onClick={loadJoke} className={`text-yellow-800/50 hover:text-yellow-900 ${loading ? 'animate-spin' : ''}`}>
          <RefreshCw size={14} />
        </button>
      }
    >
      <div className="h-full flex items-center justify-center p-2 text-center">
        <p className="text-sm md:text-base font-bold text-yellow-950 leading-snug">
            {joke ? `"${joke}"` : "Thinking..."}
        </p>
      </div>
    </GlassCard>
  );
};
