
import React, { useEffect, useState } from 'react';
import { Utensils, ExternalLink } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { LunchMenu } from '../types';
import { fetchSchoolLunch } from '../services/gemini';

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
        setLoading(true);
        const data = await fetchSchoolLunch(schoolName, schoolId);
        setMenu(data);
        setLoading(false);
    };
    loadMenu();
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
      // Soft Green Background
      className="h-full bg-emerald-100"
      darkText={true}
      action={
        schoolId ? (
            <button onClick={handleOpenMenu} className="text-emerald-600/50 hover:text-emerald-800 transition-colors">
                <ExternalLink size={14} />
            </button>
        ) : undefined
      }
    >
        {loading ? (
            <div className="h-full flex items-center justify-center text-emerald-600/50 animate-pulse text-xs font-bold">Loading...</div>
        ) : allEntrees.length > 0 ? (
            <div className="flex flex-col h-full pt-2">
                <div className="flex flex-col gap-3">
                    {allEntrees.map((item, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            <span className="text-sm font-bold text-emerald-900 leading-tight">
                                {item}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-2">
                <span className="text-2xl mb-2 opacity-50">🥗</span>
                <p className="text-emerald-800 text-xs font-bold mb-2">
                    {menu?.main === 'Unavailable' ? "Menu Unavailable" : "Add ID"}
                </p>
                {schoolId && (
                    <button 
                        onClick={handleOpenMenu}
                        className="px-3 py-1.5 rounded-lg bg-emerald-200 hover:bg-emerald-300 text-[10px] font-bold text-emerald-800 transition-colors"
                    >
                        View Online
                    </button>
                )}
            </div>
        )}
    </GlassCard>
  );
};
