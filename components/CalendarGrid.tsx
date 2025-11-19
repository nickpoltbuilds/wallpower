
import React, { useState } from 'react';
import { Calendar, Plus, Clock, MapPin } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { CalendarEvent } from '../types';
import { generateCalendarEvents } from '../services/gemini';

interface CalendarGridProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  isGoogleLinked: boolean;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ events, setEvents, isGoogleLinked }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const today = new Date();
  
  const days = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d;
  });

  const getEventsForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return events.filter(e => {
        const eStart = new Date(e.start);
        const eEnd = new Date(e.end);
        return eStart <= dayEnd && eEnd >= dayStart;
    });
  };

  const getMultiDayLabel = (event: CalendarEvent, currentDay: Date) => {
      const start = new Date(event.start);
      start.setHours(0,0,0,0);
      const end = new Date(event.end);
      end.setHours(0,0,0,0);
      const durationMs = end.getTime() - start.getTime();
      const daysDuration = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
      if (daysDuration <= 1) return null;

      const current = new Date(currentDay);
      current.setHours(0,0,0,0);
      const diffTime = current.getTime() - start.getTime();
      const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (dayIndex > daysDuration || dayIndex < 1) return null; 
      return `(Day ${dayIndex}/${daysDuration})`;
  };

  const handleAddEvent = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    const newEvents = await generateCalendarEvents(input, new Date().toISOString());
    if (newEvents.length > 0) {
        setEvents(prev => [...prev, ...newEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()));
        setInput('');
        setShowInput(false);
    }
    setIsProcessing(false);
  };

  // Updated solid color pills for the flat design
  const getColorStyles = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-900 border-l-4 border-blue-500';
      case 'green': return 'bg-green-100 text-green-900 border-l-4 border-green-500';
      case 'purple': return 'bg-purple-100 text-purple-900 border-l-4 border-purple-500';
      case 'orange': return 'bg-orange-100 text-orange-900 border-l-4 border-orange-500';
      case 'red': return 'bg-red-100 text-red-900 border-l-4 border-red-500';
      default: return 'bg-slate-200 text-slate-800 border-l-4 border-slate-500';
    }
  };

  return (
    <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-lg">
                    <Calendar size={16} className="text-black" />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                    {isGoogleLinked ? 'Calendar' : 'Family Calendar'}
                </h2>
            </div>
            {!isGoogleLinked && (
                <button 
                    onClick={() => setShowInput(!showInput)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-black hover:bg-gray-200 transition-colors text-xs font-bold"
                >
                    <Plus size={14} /> Add Event
                </button>
            )}
        </div>

        {showInput && !isGoogleLinked && (
            <div className="mb-4 mx-1 p-3 bg-white rounded-xl border border-slate-200">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., 'Grandma coming for dinner Sunday at 5pm'"
                    className="w-full bg-transparent text-slate-900 text-md focus:outline-none resize-none placeholder-slate-400 mb-2 font-medium"
                    rows={1}
                />
                <div className="flex justify-end">
                    <button 
                        onClick={handleAddEvent}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg bg-black text-xs font-bold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? 'Thinking...' : 'Add'}
                    </button>
                </div>
            </div>
        )}

        {/* 4-Column Grid - Light Gray Background */}
        <div className="grid grid-cols-4 gap-3 flex-1 min-h-0">
            {days.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const isToday = i === 0;
                
                return (
                    <GlassCard 
                        key={i} 
                        // Solid Light Gray/White Background
                        className={`h-full flex flex-col ${isToday ? 'bg-white shadow-xl ring-4 ring-indigo-500/20' : 'bg-slate-100'}`}
                        darkText={true}
                    >
                        <div className="p-3 border-b border-slate-200/50">
                            <h3 className={`text-sm font-black uppercase ${isToday ? 'text-indigo-600' : 'text-slate-800'}`}>
                                {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : day.toLocaleDateString('en-US', { weekday: 'long' })}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                {day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        <div className="flex-1 p-2 overflow-y-auto space-y-2 custom-scrollbar">
                            {dayEvents.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mb-2"></div>
                                </div>
                            ) : (
                                dayEvents.map((event) => {
                                    const multiDayLabel = getMultiDayLabel(event, day);
                                    
                                    return (
                                        <div 
                                            key={`${event.id}_${i}`} 
                                            className={`p-2 rounded-lg shadow-sm ${getColorStyles(event.color)} transition-all hover:scale-[1.01]`}
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex items-center gap-1 text-[10px] font-bold opacity-70">
                                                    {!event.isAllDay && <Clock size={10} />}
                                                    <span>
                                                        {event.isAllDay 
                                                            ? 'ALL DAY' 
                                                            : new Date(event.start).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})
                                                        }
                                                    </span>
                                                </div>
                                                {multiDayLabel && (
                                                    <span className="text-[8px] opacity-60 font-bold">
                                                        {multiDayLabel}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="font-bold text-sm leading-tight mb-0.5">
                                                {event.title}
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-1 text-[9px] opacity-70 truncate font-medium">
                                                    <MapPin size={9} />
                                                    {event.location}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </GlassCard>
                );
            })}
        </div>
    </div>
  );
};
