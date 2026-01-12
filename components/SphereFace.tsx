
import React, { useEffect, useState, useMemo } from 'react';

interface SphereFaceProps {
  weatherCondition?: string;
}

type Mood = 'happy' | 'excited' | 'neutral' | 'sleepy' | 'worried' | 'cozy';

interface FaceColors {
  from: string;
  via: string;
  to: string;
  glow: string;
}

export const SphereFace: React.FC<SphereFaceProps> = ({ weatherCondition = 'clear' }) => {
  const [blink, setBlink] = useState(false);
  const [wink, setWink] = useState(false);
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 });
  const [bounce, setBounce] = useState(false);

  // Determine weather type from condition string
  const weatherType = useMemo(() => {
    const c = weatherCondition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle') || c.includes('showers')) return 'rainy';
    if (c.includes('snow') || c.includes('blizzard') || c.includes('flurries')) return 'snowy';
    if (c.includes('storm') || c.includes('thunder')) return 'stormy';
    if (c.includes('cloud') || c.includes('overcast') || c.includes('fog') || c.includes('haze')) return 'cloudy';
    if (c.includes('partly') || c.includes('scattered')) return 'partly';
    return 'sunny';
  }, [weatherCondition]);

  // Get day of week info
  const dayInfo = useMemo(() => {
    const day = new Date().getDay();
    const hour = new Date().getHours();
    return {
      isMonday: day === 1,
      isFriday: day === 5,
      isWeekend: day === 0 || day === 6,
      hour
    };
  }, []);

  // Determine mood based on time, weather, and day
  const mood: Mood = useMemo(() => {
    const { hour, isMonday, isFriday, isWeekend } = dayInfo;

    // Night time - always sleepy
    if (hour >= 22 || hour < 7) return 'sleepy';

    // Stormy - worried
    if (weatherType === 'stormy') return 'worried';

    // Rainy - cozy
    if (weatherType === 'rainy') return 'cozy';

    // Friday afternoon - excited!
    if (isFriday && hour >= 12) return 'excited';

    // Monday morning - sleepy
    if (isMonday && hour < 12) return 'sleepy';

    // Weekend - happy
    if (isWeekend) return 'happy';

    // Sunny midday - happy
    if (weatherType === 'sunny' && hour >= 10 && hour < 16) return 'happy';

    // Snowy - excited
    if (weatherType === 'snowy') return 'excited';

    return 'neutral';
  }, [weatherType, dayInfo]);

  // Weather-based colors
  const colors: FaceColors = useMemo(() => {
    switch (weatherType) {
      case 'rainy':
        return { from: '#7dd3fc', via: '#38bdf8', to: '#0284c7', glow: 'rgba(56,189,248,0.4)' };
      case 'snowy':
        return { from: '#e0f2fe', via: '#bae6fd', to: '#7dd3fc', glow: 'rgba(186,230,253,0.5)' };
      case 'stormy':
        return { from: '#a78bfa', via: '#7c3aed', to: '#5b21b6', glow: 'rgba(139,92,246,0.4)' };
      case 'cloudy':
        return { from: '#e2e8f0', via: '#cbd5e1', to: '#94a3b8', glow: 'rgba(148,163,184,0.3)' };
      case 'partly':
        return { from: '#fde68a', via: '#fbbf24', to: '#d97706', glow: 'rgba(251,191,36,0.3)' };
      default: // sunny
        return { from: '#ffcc33', via: '#ff9900', to: '#cc6600', glow: 'rgba(255,153,0,0.4)' };
    }
  }, [weatherType]);

  // Mouth path based on mood
  const mouthPath = useMemo(() => {
    switch (mood) {
      case 'happy': return "M 38 65 Q 50 75 62 65";
      case 'excited': return "M 35 62 Q 50 78 65 62";
      case 'sleepy': return "M 45 68 L 55 68";
      case 'worried': return "M 40 70 Q 50 65 60 70";
      case 'cozy': return "M 42 66 Q 50 70 58 66";
      default: return "M 40 66 Q 50 72 60 66";
    }
  }, [mood]);

  // Eye scale based on mood
  const eyeScale = useMemo(() => {
    if (blink) return 0.1;
    if (wink) return 0.1; // for the winking eye
    switch (mood) {
      case 'sleepy': return 0.5;
      case 'excited': return 1.15;
      case 'worried': return 1.1;
      default: return 1;
    }
  }, [mood, blink, wink]);

  // Random behaviors
  useEffect(() => {
    // Random blinking
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, Math.random() * 4000 + 2000);

    // Occasional wink (5% chance instead of blink)
    const winkInterval = setInterval(() => {
      if (Math.random() < 0.15) {
        setWink(true);
        setTimeout(() => setWink(false), 200);
      }
    }, 8000);

    // Random looking around
    const lookInterval = setInterval(() => {
      setLookOffset({
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 5
      });
    }, 2500);

    // Bounce on Friday afternoons
    const bounceInterval = setInterval(() => {
      const day = new Date().getDay();
      const hour = new Date().getHours();
      if (day === 5 && hour >= 12 && Math.random() < 0.3) {
        setBounce(true);
        setTimeout(() => setBounce(false), 500);
      }
    }, 5000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(winkInterval);
      clearInterval(lookInterval);
      clearInterval(bounceInterval);
    };
  }, []);

  // Accessory component
  const Accessory = () => {
    // Sunglasses for sunny weather during day
    if (weatherType === 'sunny' && dayInfo.hour >= 9 && dayInfo.hour < 18) {
      return (
        <g className="transition-opacity duration-500">
          {/* Left lens */}
          <ellipse cx="35" cy="44" rx="12" ry="10" fill="#1a1a1a" opacity="0.9" />
          {/* Right lens */}
          <ellipse cx="65" cy="44" rx="12" ry="10" fill="#1a1a1a" opacity="0.9" />
          {/* Bridge */}
          <path d="M 47 44 Q 50 42 53 44" stroke="#1a1a1a" strokeWidth="2" fill="none" />
          {/* Lens shine */}
          <ellipse cx="30" cy="41" rx="3" ry="2" fill="white" opacity="0.2" />
          <ellipse cx="60" cy="41" rx="3" ry="2" fill="white" opacity="0.2" />
        </g>
      );
    }

    // Umbrella for rainy weather
    if (weatherType === 'rainy') {
      return (
        <g transform="translate(65, 10) scale(0.4)">
          {/* Umbrella canopy */}
          <path d="M 0 30 Q 30 -10 60 30 L 30 30 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          {/* Handle */}
          <line x1="30" y1="30" x2="30" y2="60" stroke="#78350f" strokeWidth="3" />
          <path d="M 30 60 Q 30 70 20 70" stroke="#78350f" strokeWidth="3" fill="none" />
        </g>
      );
    }

    // Snowflake accessory for snowy
    if (weatherType === 'snowy') {
      return (
        <g transform="translate(70, 15)" className="animate-pulse">
          <text fontSize="16" fill="#60a5fa">❄</text>
        </g>
      );
    }

    // Blush cheeks when it's hot (sunny and afternoon)
    if (weatherType === 'sunny' && dayInfo.hour >= 12 && dayInfo.hour < 17) {
      return (
        <g opacity="0.4">
          <ellipse cx="22" cy="58" rx="8" ry="5" fill="#f87171" />
          <ellipse cx="78" cy="58" rx="8" ry="5" fill="#f87171" />
        </g>
      );
    }

    return null;
  };

  return (
    <div
      className={`relative aspect-square w-[clamp(72px,18vmin,160px)] flex items-center justify-center transition-transform duration-300 ${bounce ? 'animate-bounce' : ''}`}
    >
      {/* The Sphere Body */}
      <div
        className="absolute inset-0 rounded-full shadow-lg animate-pulse-slow transition-all duration-700"
        style={{
          background: `linear-gradient(to bottom, ${colors.from}, ${colors.via}, ${colors.to})`,
          boxShadow: `0 0 40px ${colors.glow}`
        }}
      >
        {/* Subtle Surface Texture/Glow */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]" />
      </div>

      <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full drop-shadow-lg">
        {/* Left Eye */}
        <g transform={`translate(35, 45) scale(1, ${blink ? 0.1 : eyeScale})`}>
          <circle cx="0" cy="0" r="8" fill="black" />
          <circle cx={lookOffset.x * 0.4} cy={lookOffset.y * 0.4} r="3" fill="white" opacity="0.4" />
        </g>

        {/* Right Eye (can wink) */}
        <g transform={`translate(65, 45) scale(1, ${blink ? 0.1 : (wink ? 0.1 : eyeScale)})`}>
          <circle cx="0" cy="0" r="8" fill="black" />
          <circle cx={lookOffset.x * 0.4} cy={lookOffset.y * 0.4} r="3" fill="white" opacity="0.4" />
        </g>

        {/* Eyebrows for worried mood */}
        {mood === 'worried' && (
          <>
            <line x1="27" y1="32" x2="40" y2="36" stroke="black" strokeWidth="2" strokeLinecap="round" />
            <line x1="73" y1="32" x2="60" y2="36" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {/* Mouth */}
        <path
          d={mouthPath}
          stroke="black"
          strokeWidth="2.5"
          fill={mood === 'excited' ? 'black' : 'none'}
          strokeLinecap="round"
          className="transition-all duration-500"
        />

        {/* Open mouth for excited */}
        {mood === 'excited' && (
          <ellipse cx="50" cy="68" rx="8" ry="5" fill="#ff6b6b" opacity="0.8" />
        )}

        {/* Accessory */}
        <Accessory />
      </svg>
    </div>
  );
};
