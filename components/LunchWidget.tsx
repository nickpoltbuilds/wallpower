import React, { useEffect, useState } from 'react';
import { Utensils, ExternalLink, ChefHat } from 'lucide-react';
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
    if (schoolId) {
      window.open(`https://schools.mealviewer.com/school/${schoolId}`, '_blank');
    }
  };

  // Combine main and sides into a single list for display, limited to first 2 items
  const allEntrees = menu && menu.main !== 'Unavailable' 
    ? [menu.main, ...(menu.sides || [])].slice(0, 2)
    : [];

  return (
    <GlassCard 
      title="School Lunch" 
      icon={<Utensils size={20} />} 
      className="h-full bg-gradient-to-br from-green-900/20 to-teal-900/20"
      action={
        schoolId ? (
            <button onClick={handleOpenMenu} className="text-white/30 hover:text-white transition-colors">
                <ExternalLink size={14} />
            </button>
        ) : undefined
      }
    >
        {loading ? (
            <div className="h-full flex items-center justify-center text-white/30 animate-pulse text-sm">Checking menu...</div>
        ) : allEntrees.length > 0 ? (
            <div className="flex flex-col h-full pt-2">
                <div className="flex items-center gap-2 mb-4 opacity-60">
                     <ChefHat size={16} className="text-green-400" />
                     <span className="text-xs font-bold uppercase tracking-wider text-green-200">Today's Menu</span>
                </div>
                
                <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                    {allEntrees.map((item, i) => (
                        <div key={i} className="relative pl-4 py-1">
                            {/* Bullet point line */}
                            <div className="absolute left-0 top-3 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                            <span className="text-md font-medium text-white leading-snug block">
                                {item}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <span className="text-2xl mb-2">🍽️</span>
                <p className="text-white/60 text-sm mb-3">
                    {menu?.main === 'Unavailable' 
                        ? "No menu found for today." 
                        : "Add school ID in settings"}
                </p>
                {schoolId && (
                    <button 
                        onClick={handleOpenMenu}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors border border-white/10"
                    >
                        View Menu Online
                    </button>
                )}
            </div>
        )}
    </GlassCard>
  );
};