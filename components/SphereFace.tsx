
import React, { useEffect, useState } from 'react';

export const SphereFace: React.FC = () => {
  const [blink, setBlink] = useState(false);
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 });
  const [mood, setMood] = useState<'neutral' | 'happy' | 'sleepy'>('neutral');

  useEffect(() => {
    // Random blinking
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, Math.random() * 4000 + 2000);

    // Random looking around
    const lookInterval = setInterval(() => {
      setLookOffset({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 4
      });
    }, 3000);

    // Update mood based on hour
    const updateMood = () => {
      const hour = new Date().getHours();
      if (hour >= 22 || hour < 7) setMood('sleepy');
      else if (hour >= 11 && hour < 14) setMood('happy');
      else setMood('neutral');
    };
    updateMood();
    const moodCheck = setInterval(updateMood, 60000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(lookInterval);
      clearInterval(moodCheck);
    };
  }, []);

  return (
    <div className="relative aspect-square w-[clamp(72px,18vmin,160px)] flex items-center justify-center">
      {/* The Sphere Body */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#ffcc33] via-[#ff9900] to-[#cc6600] shadow-[0_0_40px_rgba(255,153,0,0.4)] animate-pulse-slow">
         {/* Subtle Surface Texture/Glow */}
         <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]" />
      </div>

      <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full drop-shadow-lg">
        {/* Left Eye */}
        <g transform={`translate(35, 45) scale(1, ${blink ? 0.1 : (mood === 'sleepy' ? 0.6 : 1)})`}>
          <circle cx="0" cy="0" r="8" fill="black" />
          <circle cx={lookOffset.x * 0.4} cy={lookOffset.y * 0.4} r="3" fill="white" opacity="0.4" />
        </g>

        {/* Right Eye */}
        <g transform={`translate(65, 45) scale(1, ${blink ? 0.1 : (mood === 'sleepy' ? 0.6 : 1)})`}>
          <circle cx="0" cy="0" r="8" fill="black" />
          <circle cx={lookOffset.x * 0.4} cy={lookOffset.y * 0.4} r="3" fill="white" opacity="0.4" />
        </g>

        {/* Mouth */}
        <path
          d={mood === 'happy' ? "M 40 65 Q 50 72 60 65" : (mood === 'sleepy' ? "M 45 68 L 55 68" : "M 42 67 Q 50 70 58 67")}
          stroke="black"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
    </div>
  );
};
