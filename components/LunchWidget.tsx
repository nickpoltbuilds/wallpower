
import React, { useEffect, useState } from 'react';
import { Utensils, ExternalLink } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { LunchMenu } from '../types';
import { fetchSchoolLunch } from '../services/gemini';
import { getFoodEmoji } from '../services/foodEmoji';

interface LunchWidgetProps {
  schoolName: string;
  schoolId?: string;
}

export const LunchWidget: React.FC<LunchWidgetProps> = ({ schoolName, schoolId }) => {
  const [menu, setMenu] = useState<LunchMenu | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMenu = async () => {
        if (!schoolName) return;
        setLoading(prev => !prev && !menu); 
        const data = await fetchSchoolLunch(schoolName, schoolId);
        setMenu(data);
        setLoading(false);
    };

    loadMenu();

    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleRefresh = () => {
        const now = new Date();
        const nextRefresh = new Date();
        nextRefresh.setHours(5, 0, 0, 0);
        if (now >= nextRefresh) nextRefresh.setDate(nextRefresh.getDate() + 1);
        const delay = nextRefresh.getTime() - now.getTime();
        console.log(`Next lunch refresh scheduled for: ${nextRefresh.toLocaleString()}`);
        timeoutId = setTimeout(() => {
            loadMenu();
            scheduleRefresh();
        }, delay);
    };
    scheduleRefresh();
    return () => clearTimeout(timeoutId);
  }, [schoolName, schoolId]);

  const handleOpenMenu = () => {
    if (schoolId) window.open(`https://schools.mealviewer.com/school/${schoolId}`, '_blank');
  };

  const allEntrees = menu && menu.main !== 'Unavailable' 
    ? [menu.main, ...(menu.sides || [])].slice(0, 2)
    : [];

  return (
    <GlassCard 
      title="School Lunch" 
      icon={<Utensils size={18} />} 
      className="h-full widget-lunch"
      action={
        schoolId ? (
            <button onClick={handleOpenMenu} className="opacity-50 hover:opacity-100 transition-colors">
                <ExternalLink size={14} />
            </button>
        ) : undefined
      }
    >
        {loading ? (
            <div className="h-full flex items-center justify-center opacity-50 animate-pulse text-xs font-bold">Loading...</div>
        ) : allEntrees.length > 0 ? (
            <div className="flex flex-col h-full pt-2">
                <div className="flex flex-col gap-3">
                    {allEntrees.map((item, i) => {
                        const emoji = getFoodEmoji(item);
                        return (
                            <div key={i} className="flex gap-3 items-start group">
                                <span className="text-3xl flex-shrink-0 lunch-emoji transition-transform duration-300 group-hover:scale-110">
                                    {emoji}
                                </span>
                                <span className="text-lg font-bold leading-tight pt-1">
                                    {item}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-2">
                <span className="text-2xl mb-2 opacity-50">🥗</span>
                <p className="text-xs font-bold mb-2 opacity-80">
                    {menu?.main === 'Unavailable' ? "Menu Unavailable" : "Add ID"}
                </p>
                {schoolId && (
                    <button 
                        onClick={handleOpenMenu}
                        className="px-3 py-1.5 rounded-lg bg-current bg-opacity-10 hover:bg-opacity-20 text-[10px] font-bold transition-colors"
                    >
                        View Online
                    </button>
                )}
            </div>
        )}
    </GlassCard>
  );
};
