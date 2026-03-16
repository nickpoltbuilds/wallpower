
import React, { useEffect, useState, useCallback } from 'react';
import { Utensils, ExternalLink, RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { LunchMenu } from '../types';
import { fetchSchoolLunch } from '../services/gemini';
import { getFoodEmoji } from '../services/foodEmoji';

interface LunchWidgetProps {
  schoolName: string;
  schoolId?: string;
}

const SkeletonLunch = () => (
  <div className="flex flex-col gap-3 pt-2">
    <div className="skeleton h-6 w-4/5 rounded-lg" />
    <div className="skeleton h-6 w-3/5 rounded-lg" />
  </div>
);

export const LunchWidget: React.FC<LunchWidgetProps> = ({ schoolName, schoolId }) => {
  const [menu, setMenu] = useState<LunchMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const loadMenu = useCallback(async () => {
    if (!schoolName) return;
    setLoading(true);
    const data = await fetchSchoolLunch(schoolName, schoolId);
    setMenu(data);
    setLoading(false);
  }, [schoolName, schoolId]);

  useEffect(() => {
    loadMenu();

    // Refresh at 5am each day
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleRefresh = () => {
      const now = new Date();
      const next = new Date();
      next.setHours(5, 0, 0, 0);
      if (now >= next) next.setDate(next.getDate() + 1);
      timeoutId = setTimeout(() => { loadMenu(); scheduleRefresh(); }, next.getTime() - now.getTime());
    };
    scheduleRefresh();
    return () => clearTimeout(timeoutId);
  }, [loadMenu]);

  const handleOpenMenu = () => {
    if (schoolId) window.open(`https://schools.mealviewer.com/school/${schoolId}`, '_blank');
  };

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 500);
    loadMenu();
  };

  const allEntrees = menu && menu.main !== 'Unavailable' && !menu.isWeekend
    ? [menu.main, ...(menu.sides || [])].slice(0, 3)
    : [];

  const isWeekend = menu?.isWeekend === true;
  const isUnavailable = !loading && menu?.main === 'Unavailable' && !isWeekend;
  const noId = !schoolId;

  return (
    <GlassCard
      title="School Lunch"
      icon={<Utensils size={14} />}
      className="h-full widget-lunch"
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="opacity-40 hover:opacity-80 transition-opacity"
          >
            <RefreshCw
              size={12}
              style={{
                transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)',
                transition: spinning ? 'transform 0.5s ease' : 'none',
              }}
            />
          </button>
          {schoolId && (
            <button onClick={handleOpenMenu} className="opacity-40 hover:opacity-80 transition-opacity">
              <ExternalLink size={12} />
            </button>
          )}
        </div>
      }
    >
      {loading && !menu ? (
        <SkeletonLunch />
      ) : isWeekend ? (
        <div className="h-full flex flex-col items-center justify-center text-center gap-1 pb-2">
          <span className="text-3xl">🏫</span>
          <p className="text-sm font-black uppercase tracking-widest opacity-60 mt-1">No school today</p>
        </div>
      ) : noId ? (
        <div className="h-full flex flex-col items-center justify-center text-center gap-2 pb-2">
          <span className="text-2xl opacity-40">🥗</span>
          <p className="text-xs font-black uppercase tracking-wider opacity-60">Add school ID in settings</p>
        </div>
      ) : allEntrees.length > 0 ? (
        <div className="flex flex-col gap-2.5 pt-1">
          {allEntrees.map((item, i) => (
            <div key={i} className="flex gap-2.5 items-center group">
              <span className="text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                {getFoodEmoji(item)}
              </span>
              <span
                className="font-bold leading-tight"
                style={{ fontSize: 'clamp(0.95rem, 2.5vmin, 1.2rem)' }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      ) : isUnavailable ? (
        <div className="h-full flex flex-col items-center justify-center text-center gap-2 pb-2">
          <span className="text-2xl opacity-40">🍽️</span>
          <p className="text-xs font-black uppercase tracking-wider opacity-60">Menu unavailable</p>
          {schoolId && (
            <button
              onClick={handleOpenMenu}
              className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-opacity hover:opacity-70"
              style={{ background: 'rgba(0,0,0,0.15)' }}
            >
              View online
            </button>
          )}
        </div>
      ) : null}
    </GlassCard>
  );
};
