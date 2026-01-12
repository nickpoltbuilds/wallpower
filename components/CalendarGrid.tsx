
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
        try {
            const eStart = new Date(e.start);
            const eEnd = new Date(e.end);
            if (isNaN(eStart.getTime())) return false;
            
            // Overlap logic: Event starts before the day ends AND event ends after the day starts.
            return eStart < dayEnd && eEnd > dayStart;
        } catch { return false; }
    });
  };

  const getMultiDayLabel = (event: CalendarEvent, currentDay: Date) => {
      try {
          const start = new Date(event.start);
          start.setHours(0,0,0,0);
          const end = new Date(event.end);
          if (end.getHours() === 0 && end.getMinutes() === 0) {
              end.setMilliseconds(-1);
          }
          end.setHours(0,0,0,0);
          
          const durationMs = end.getTime() - start.getTime();
          const daysDuration = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1);
          
          if (daysDuration <= 1) return null;

          const current = new Date(currentDay);
          current.setHours(0,0,0,0);
          const diffTime = current.getTime() - start.getTime();
          const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
          
          if (dayIndex > daysDuration || dayIndex < 1) return null; 
          return `(Day ${dayIndex}/${daysDuration})`;
      } catch { return null; }
  };

  const handleAddEvent = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    const newEvents = await generateCalendarEvents(input, new Date().toISOString());
    if (newEvents && newEvents.length > 0) {
        setEvents(prev => [...prev, ...newEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()));
        setInput('');
        setShowInput(false);
    }
    setIsProcessing(false);
  };

  return (
    <div className="h-full flex flex-col">

        {showInput && !isGoogleLinked && (
            <div className="mb-4 mx-1 p-3 bg-neutral-800 rounded-xl border border-neutral-700">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., 'Grandma coming for dinner Sunday at 5pm'"
                    className="w-full bg-transparent text-white text-md focus:outline-none resize-none placeholder-neutral-500 mb-2 font-medium"
                    rows={1}
                />
                <div className="flex justify-end">
                    <button 
                        onClick={handleAddEvent}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-bold text-white transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? 'Thinking...' : 'Add'}
                    </button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 tablet-landscape:grid-cols-4 gap-2 sm:gap-3 flex-1 min-h-0">
            {days.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const isToday = i === 0;
                
                return (
                    <GlassCard 
                        key={i} 
                        className={`h-full flex flex-col ${isToday ? 'widget-calendar-today' : 'widget-calendar-col'}`}
                        noContentPadding={true}
                    >
                        <div className="p-3 border-b border-current border-opacity-10">
                            <h3 className={`text-sm font-black uppercase ${isToday ? 'widget-calendar-text-today' : 'widget-calendar-text-header'}`}>
                                {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : day.toLocaleDateString('en-US', { weekday: 'long' })}, {day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                            </h3>
                        </div>

                        <div className="flex-1 p-0 overflow-y-auto custom-scrollbar">
                            {dayEvents.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-10">
                                    <div className="w-1.5 h-1.5 bg-current rounded-full mb-2"></div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-[1px]">
                                    {dayEvents.map((event, idx) => {
                                        const multiDayLabel = getMultiDayLabel(event, day);
                                        const colorClass = event.color || 'blue';
                                        let timeString = 'ALL DAY';
                                        
                                        if (!event.isAllDay) {
                                            try {
                                                timeString = new Date(event.start).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
                                            } catch { timeString = '---'; }
                                        }
                                        
                                        return (
                                            <div 
                                                key={`${event.id}_${i}_${idx}`} 
                                                className={`p-3 event-card ${colorClass} transition-all`}
                                            >
                                                <div className="flex items-start justify-between mb-0.5">
                                                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-tight">
                                                        {!event.isAllDay && <Clock size={12} strokeWidth={3} />}
                                                        <span>{timeString}</span>
                                                    </div>
                                                    {multiDayLabel && (
                                                        <span className="text-[10px] opacity-80 font-black uppercase tracking-tighter">
                                                            {multiDayLabel}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="font-bold text-lg leading-tight">
                                                    {event.title}
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center gap-1 text-[10px] font-bold mt-1 opacity-90 truncate">
                                                        <MapPin size={10} strokeWidth={2.5} />
                                                        {event.location}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </GlassCard>
                );
            })}
        </div>
    </div>
  );
};
