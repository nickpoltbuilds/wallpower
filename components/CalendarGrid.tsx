
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
  
  // Create array of next 4 days
  const days = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d;
  });

  const getEventsForDay = (date: Date) => {
    // Define the day boundaries
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return events.filter(e => {
        const eStart = new Date(e.start);
        const eEnd = new Date(e.end);

        // Check for OVERLAP: (StartA <= EndB) and (EndA >= StartB)
        // Logic: The event matches this day if it starts before the day ends AND ends after the day starts
        return eStart <= dayEnd && eEnd >= dayStart;
    });
  };

  const getMultiDayLabel = (event: CalendarEvent, currentDay: Date) => {
      // Only applicable for all-day or long events
      const start = new Date(event.start);
      start.setHours(0,0,0,0);
      
      const end = new Date(event.end);
      end.setHours(0,0,0,0); // Normalize to midnight for day diff calculation
      
      const durationMs = end.getTime() - start.getTime();
      const daysDuration = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
      
      if (daysDuration <= 1) return null;

      // Calculate current day index
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

  const getColorStyles = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/20 border-blue-500/30 text-blue-100';
      case 'green': return 'bg-green-500/20 border-green-500/30 text-green-100';
      case 'purple': return 'bg-purple-500/20 border-purple-500/30 text-purple-100';
      case 'orange': return 'bg-orange-500/20 border-orange-500/30 text-orange-100';
      case 'red': return 'bg-red-500/20 border-red-500/30 text-red-100';
      default: return 'bg-white/10 border-white/10 text-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col">
        {/* Header / Action Bar */}
        <div className="flex justify-between items-center mb-2 px-1">
            <div className="flex items-center gap-2 text-white/70">
                <Calendar size={18} className="text-blue-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest">
                    {isGoogleLinked ? 'Google Calendar' : 'Family Calendar'}
                </h2>
            </div>
            {!isGoogleLinked && (
                <button 
                    onClick={() => setShowInput(!showInput)}
                    className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-[10px] font-bold text-white"
                >
                    <Plus size={12} /> Add Event
                </button>
            )}
        </div>

        {/* AI Input for Local Mode */}
        {showInput && !isGoogleLinked && (
            <div className="mb-4 mx-1 p-3 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-md">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., 'Grandma coming for dinner Sunday at 5pm'"
                    className="w-full bg-transparent text-white text-sm focus:outline-none resize-none placeholder-white/30 mb-2 font-light"
                    rows={1}
                />
                <div className="flex justify-end">
                    <button 
                        onClick={handleAddEvent}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-[10px] font-bold text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? 'AI is thinking...' : 'Add to Calendar'}
                    </button>
                </div>
            </div>
        )}

        {/* 4-Column Grid */}
        <div className="grid grid-cols-4 gap-3 flex-1 min-h-0">
            {days.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const isToday = i === 0;
                
                return (
                    <GlassCard 
                        key={i} 
                        className={`h-full flex flex-col ${isToday ? 'bg-gradient-to-b from-blue-900/20 to-white/5 border-blue-500/30' : ''}`}
                    >
                        {/* Column Header */}
                        <div className={`p-3 border-b border-white/5 ${isToday ? 'bg-blue-500/10' : ''}`}>
                            <h3 className={`text-sm font-bold ${isToday ? 'text-blue-300' : 'text-white'}`}>
                                {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : day.toLocaleDateString('en-US', { weekday: 'long' })}
                            </h3>
                            <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider mt-0.5">
                                {day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Events List */}
                        <div className="flex-1 p-2 overflow-y-auto space-y-2 custom-scrollbar">
                            {dayEvents.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-white/10">
                                    <div className="w-1 h-1 bg-white/20 rounded-full mb-2"></div>
                                    <span className="text-[9px] font-medium uppercase tracking-widest">No Events</span>
                                </div>
                            ) : (
                                dayEvents.map((event) => {
                                    const multiDayLabel = getMultiDayLabel(event, day);
                                    
                                    return (
                                        <div 
                                            key={`${event.id}_${i}`} 
                                            className={`p-2 rounded-lg border ${getColorStyles(event.color)} relative group transition-all hover:scale-[1.01]`}
                                        >
                                            <div className="flex items-start justify-between mb-0.5">
                                                <div className="flex items-center gap-1 text-[10px] font-bold opacity-80">
                                                    {!event.isAllDay && <Clock size={9} />}
                                                    <span>
                                                        {event.isAllDay 
                                                            ? 'All Day' 
                                                            : new Date(event.start).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})
                                                        }
                                                    </span>
                                                </div>
                                                {multiDayLabel && (
                                                    <span className="text-[8px] opacity-50 bg-black/20 px-1 rounded-sm leading-none py-0.5">
                                                        {multiDayLabel}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="font-bold text-xs leading-snug mb-0.5">
                                                {event.title}
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-1 text-[9px] opacity-60 truncate">
                                                    <MapPin size={8} />
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
