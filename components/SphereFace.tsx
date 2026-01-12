
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';

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

// Weather particle component
const WeatherParticles: React.FC<{ weatherType: string }> = ({ weatherType }) => {
  const particles = useMemo(() => {
    const count = weatherType === 'snowy' ? 8 : weatherType === 'rainy' ? 12 : weatherType === 'sunny' ? 6 : 0;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      size: weatherType === 'snowy' ? 3 + Math.random() * 4 : 2,
    }));
  }, [weatherType]);

  if (weatherType === 'rainy') {
    return (
      <g className="weather-particles">
        {particles.map((p) => (
          <line
            key={p.id}
            x1={p.x}
            y1={-5}
            x2={p.x - 3}
            y2={5}
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
            style={{
              animation: `raindrop-fall ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </g>
    );
  }

  if (weatherType === 'snowy') {
    return (
      <g className="weather-particles">
        {particles.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={-10}
            r={p.size}
            fill="white"
            opacity="0.8"
            style={{
              animation: `snowflake-drift ${p.duration + 1}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </g>
    );
  }

  if (weatherType === 'sunny') {
    return (
      <g className="weather-particles" style={{ animation: 'sun-ray-pulse 4s ease-in-out infinite' }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={i}
            x1={50 + Math.cos((angle * Math.PI) / 180) * 55}
            y1={50 + Math.sin((angle * Math.PI) / 180) * 55}
            x2={50 + Math.cos((angle * Math.PI) / 180) * 65}
            y2={50 + Math.sin((angle * Math.PI) / 180) * 65}
            stroke="#fbbf24"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </g>
    );
  }

  if (weatherType === 'stormy') {
    return (
      <g className="weather-particles">
        <path
          d="M 75 5 L 70 20 L 78 20 L 68 35"
          stroke="#fbbf24"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: 'lightning-flash 4s ease-in-out infinite' }}
        />
      </g>
    );
  }

  return null;
};

export const SphereFace: React.FC<SphereFaceProps> = ({ weatherCondition = 'clear' }) => {
  const [blink, setBlink] = useState(false);
  const [wink, setWink] = useState(false);
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 });
  const [targetLook, setTargetLook] = useState({ x: 0, y: 0 });
  const [bounce, setBounce] = useState(false);
  const [eyebrowRaise, setEyebrowRaise] = useState(false);
  const [cheekPuff, setCheekPuff] = useState(false);
  const [showTongue, setShowTongue] = useState(false);
  const [squint, setSquint] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth eye tracking interpolation
  useEffect(() => {
    let animationFrame: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      setLookOffset((prev) => ({
        x: lerp(prev.x, targetLook.x, 0.08),
        y: lerp(prev.y, targetLook.y, 0.08),
      }));
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetLook]);

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
      hour,
    };
  }, []);

  // Determine mood based on time, weather, and day
  const mood: Mood = useMemo(() => {
    const { hour, isMonday, isFriday, isWeekend } = dayInfo;

    if (hour >= 22 || hour < 7) return 'sleepy';
    if (weatherType === 'stormy') return 'worried';
    if (weatherType === 'rainy') return 'cozy';
    if (isFriday && hour >= 12) return 'excited';
    if (isMonday && hour < 12) return 'sleepy';
    if (isWeekend) return 'happy';
    if (weatherType === 'sunny' && hour >= 10 && hour < 16) return 'happy';
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
    if (showTongue) return 'M 38 65 Q 50 75 62 65';
    if (cheekPuff) return 'M 42 66 Q 50 62 58 66';
    switch (mood) {
      case 'happy':
        return 'M 38 65 Q 50 75 62 65';
      case 'excited':
        return 'M 35 62 Q 50 78 65 62';
      case 'sleepy':
        return 'M 45 68 L 55 68';
      case 'worried':
        return 'M 40 70 Q 50 65 60 70';
      case 'cozy':
        return 'M 42 66 Q 50 70 58 66';
      default:
        return 'M 40 66 Q 50 72 60 66';
    }
  }, [mood, showTongue, cheekPuff]);

  // Eye scale based on mood and state
  const getEyeScale = useCallback(
    (isRightEye: boolean) => {
      if (blink) return 0.1;
      if (wink && isRightEye) return 0.1;
      if (squint) return 0.6;
      switch (mood) {
        case 'sleepy':
          return 0.5;
        case 'excited':
          return 1.15;
        case 'worried':
          return 1.1;
        default:
          return 1;
      }
    },
    [mood, blink, wink, squint]
  );

  // Animation class based on mood and state
  const getMoodAnimationClass = useCallback(() => {
    if (bounce) return 'sphere-bounce-squash';
    if (wiggle) return 'sphere-wiggle';
    if (mood === 'sleepy') return 'sphere-sleepy';
    if (mood === 'excited') return 'sphere-float';
    return 'sphere-breathe';
  }, [mood, bounce, wiggle]);

  // Random behaviors with personality
  useEffect(() => {
    // Random blinking (more frequent)
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
    }, 2000 + Math.random() * 2500);

    // Occasional double-blink
    const doubleBlinkInterval = setInterval(() => {
      if (Math.random() < 0.2) {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          setTimeout(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 100);
          }, 150);
        }, 100);
      }
    }, 8000);

    // Occasional wink
    const winkInterval = setInterval(() => {
      if (Math.random() < 0.12 && mood === 'happy') {
        setWink(true);
        setTimeout(() => setWink(false), 250);
      }
    }, 6000);

    // Random looking around with smooth targeting
    const lookInterval = setInterval(() => {
      setTargetLook({
        x: (Math.random() - 0.5) * 12,
        y: (Math.random() - 0.5) * 6,
      });
    }, 2000 + Math.random() * 1500);

    // Eyebrow raise moments
    const eyebrowInterval = setInterval(() => {
      if (Math.random() < 0.15 && (mood === 'happy' || mood === 'excited')) {
        setEyebrowRaise(true);
        setTimeout(() => setEyebrowRaise(false), 600);
      }
    }, 5000);

    // Cheek puff (thinking/playful)
    const cheekInterval = setInterval(() => {
      if (Math.random() < 0.1 && mood !== 'worried' && mood !== 'sleepy') {
        setCheekPuff(true);
        setTimeout(() => setCheekPuff(false), 800);
      }
    }, 10000);

    // Tongue peek (rare, playful)
    const tongueInterval = setInterval(() => {
      if (Math.random() < 0.08 && mood === 'happy') {
        setShowTongue(true);
        setTimeout(() => setShowTongue(false), 500);
      }
    }, 15000);

    // Squint (bright sun or thinking)
    const squintInterval = setInterval(() => {
      if (weatherType === 'sunny' && Math.random() < 0.1) {
        setSquint(true);
        setTimeout(() => setSquint(false), 700);
      }
    }, 8000);

    // Wiggle (excitement burst)
    const wiggleInterval = setInterval(() => {
      if (mood === 'excited' && Math.random() < 0.25) {
        setWiggle(true);
        setTimeout(() => setWiggle(false), 600);
      }
    }, 4000);

    // Bounce on Friday afternoons or random happy moments
    const bounceInterval = setInterval(() => {
      const day = new Date().getDay();
      const hour = new Date().getHours();
      if ((day === 5 && hour >= 12 && Math.random() < 0.3) || (mood === 'excited' && Math.random() < 0.15)) {
        setBounce(true);
        setTimeout(() => setBounce(false), 700);
      }
    }, 5000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(doubleBlinkInterval);
      clearInterval(winkInterval);
      clearInterval(lookInterval);
      clearInterval(eyebrowInterval);
      clearInterval(cheekInterval);
      clearInterval(tongueInterval);
      clearInterval(squintInterval);
      clearInterval(wiggleInterval);
      clearInterval(bounceInterval);
    };
  }, [mood, weatherType]);

  // Mouse tracking for interactive eye following
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || !isHovered) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;
      setTargetLook({
        x: Math.max(-8, Math.min(8, deltaX * 16)),
        y: Math.max(-4, Math.min(4, deltaY * 8)),
      });
    },
    [isHovered]
  );

  // Accessory component
  const Accessory = () => {
    // Sunglasses for sunny weather during day
    if (weatherType === 'sunny' && dayInfo.hour >= 9 && dayInfo.hour < 18) {
      return (
        <g className="transition-all duration-500" style={{ transform: isHovered ? 'translateY(-2px)' : 'translateY(0)' }}>
          {/* Left lens */}
          <ellipse cx="35" cy="44" rx="12" ry="10" fill="#1a1a1a" opacity="0.9" />
          {/* Right lens */}
          <ellipse cx="65" cy="44" rx="12" ry="10" fill="#1a1a1a" opacity="0.9" />
          {/* Bridge */}
          <path d="M 47 44 Q 50 42 53 44" stroke="#1a1a1a" strokeWidth="2" fill="none" />
          {/* Lens shine - animated */}
          <ellipse cx="30" cy="41" rx="3" ry="2" fill="white" opacity="0.3" className="eye-sparkle" />
          <ellipse cx="60" cy="41" rx="3" ry="2" fill="white" opacity="0.3" className="eye-sparkle" style={{ animationDelay: '0.5s' }} />
        </g>
      );
    }

    // Umbrella for rainy weather
    if (weatherType === 'rainy') {
      return (
        <g transform="translate(65, 10) scale(0.4)" className="transition-transform duration-300" style={{ transform: `translate(65px, 10px) scale(0.4) rotate(${isHovered ? -5 : 0}deg)` }}>
          {/* Umbrella canopy */}
          <path d="M 0 30 Q 30 -10 60 30 L 30 30 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          {/* Handle */}
          <line x1="30" y1="30" x2="30" y2="60" stroke="#78350f" strokeWidth="3" />
          <path d="M 30 60 Q 30 70 20 70" stroke="#78350f" strokeWidth="3" fill="none" />
        </g>
      );
    }

    // Snowflake accessory for snowy - multiple animated
    if (weatherType === 'snowy') {
      return (
        <g>
          <text x="72" y="22" fontSize="14" fill="#60a5fa" style={{ animation: 'snowflake-drift 3s ease-in-out infinite' }}>
            ❄
          </text>
          <text x="20" y="18" fontSize="10" fill="#93c5fd" style={{ animation: 'snowflake-drift 4s ease-in-out 1s infinite' }}>
            ❄
          </text>
        </g>
      );
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative aspect-square w-[clamp(72px,18vmin,160px)] flex items-center justify-center transition-transform duration-300 ${getMoodAnimationClass()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setTargetLook({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      style={{ '--sphere-glow': colors.glow } as React.CSSProperties}
    >
      {/* The Sphere Body */}
      <div
        className="absolute inset-0 rounded-full shadow-lg sphere-glow-pulse transition-all duration-700"
        style={{
          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.via} 50%, ${colors.to} 100%)`,
          boxShadow: `
            0 0 40px ${colors.glow},
            inset 0 -10px 30px rgba(0,0,0,0.2),
            inset 0 10px 30px rgba(255,255,255,0.15)
          `,
          transform: isHovered ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        {/* Highlight/shine layer */}
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-300"
          style={{
            background: 'radial-gradient(ellipse 50% 30% at 35% 25%, rgba(255,255,255,0.5), transparent)',
            opacity: isHovered ? 0.8 : 0.6,
          }}
        />
        {/* Secondary subtle highlight */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(ellipse 30% 20% at 65% 70%, rgba(255,255,255,0.15), transparent)',
          }}
        />
      </div>

      <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full drop-shadow-lg overflow-visible">
        {/* Weather particles behind face */}
        <WeatherParticles weatherType={weatherType} />

        {/* Eyebrows */}
        {(eyebrowRaise || mood === 'worried' || mood === 'excited') && (
          <g style={{ transition: 'transform 0.2s ease-out', transform: eyebrowRaise ? 'translateY(-3px)' : 'translateY(0)' }}>
            {mood === 'worried' ? (
              <>
                <line x1="27" y1="32" x2="40" y2="36" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="73" y1="32" x2="60" y2="36" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M 27 34 Q 32 30 40 33" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 73 34 Q 68 30 60 33" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
              </>
            )}
          </g>
        )}

        {/* Left Eye */}
        <g
          style={{
            transform: `translate(35px, 45px) scale(1, ${getEyeScale(false)})`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <circle cx="0" cy="0" r="8" fill="black" />
          {/* Eye shine/sparkle */}
          <circle
            cx={-2 + lookOffset.x * 0.3}
            cy={-2 + lookOffset.y * 0.3}
            r="3"
            fill="white"
            opacity="0.7"
            className="eye-sparkle"
          />
          {/* Pupil movement */}
          <circle cx={lookOffset.x * 0.4} cy={lookOffset.y * 0.4} r="4" fill="#1a1a1a" />
        </g>

        {/* Right Eye (can wink) */}
        <g
          style={{
            transform: `translate(65px, 45px) scale(1, ${getEyeScale(true)})`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <circle cx="0" cy="0" r="8" fill="black" />
          {/* Eye shine/sparkle */}
          <circle
            cx={-2 + lookOffset.x * 0.3}
            cy={-2 + lookOffset.y * 0.3}
            r="3"
            fill="white"
            opacity="0.7"
            className="eye-sparkle"
            style={{ animationDelay: '0.3s' }}
          />
          {/* Pupil movement */}
          <circle cx={lookOffset.x * 0.4} cy={lookOffset.y * 0.4} r="4" fill="#1a1a1a" />
        </g>

        {/* Cheek puff indicators */}
        {cheekPuff && (
          <>
            <ellipse cx="22" cy="55" rx="6" ry="5" fill={colors.via} opacity="0.4" style={{ animation: 'cheek-puff 0.8s ease-in-out' }} />
            <ellipse cx="78" cy="55" rx="6" ry="5" fill={colors.via} opacity="0.4" style={{ animation: 'cheek-puff 0.8s ease-in-out' }} />
          </>
        )}

        {/* Blush cheeks - sunny hot day or happy */}
        {((weatherType === 'sunny' && dayInfo.hour >= 12 && dayInfo.hour < 17) || (mood === 'happy' && isHovered)) && !cheekPuff && (
          <g style={{ animation: 'blush-appear 0.5s ease-out forwards' }}>
            <ellipse cx="22" cy="58" rx="7" ry="4" fill="#f87171" opacity="0.35" />
            <ellipse cx="78" cy="58" rx="7" ry="4" fill="#f87171" opacity="0.35" />
          </g>
        )}

        {/* Mouth */}
        <path
          d={mouthPath}
          stroke="black"
          strokeWidth="2.5"
          fill={mood === 'excited' || showTongue ? 'black' : 'none'}
          strokeLinecap="round"
          style={{ transition: 'all 0.3s ease-out' }}
        />

        {/* Open mouth for excited - with teeth hint */}
        {mood === 'excited' && !showTongue && (
          <>
            <ellipse cx="50" cy="68" rx="8" ry="5" fill="#ff6b6b" opacity="0.8" />
            <path d="M 44 65 L 56 65" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </>
        )}

        {/* Tongue */}
        {showTongue && (
          <ellipse
            cx="50"
            cy="72"
            rx="5"
            ry="4"
            fill="#f87171"
            style={{ animation: 'tongue-peek 0.5s ease-out', transformOrigin: '50px 68px' }}
          />
        )}

        {/* Accessory */}
        <Accessory />
      </svg>
    </div>
  );
};
