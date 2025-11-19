import React, { useState } from 'react';
import { Calendar, Plus, Mic } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { CalendarEvent } from '../types';
import { generateCalendarEvents } from '../services/gemini';

interface CalendarWidgetProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, setEvents }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInput, setShowInput] = useState(false);

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

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/20 border-blue-500/50 text-blue-200';
      case 'green': return 'bg-green-500/20 border-green-500/50 text-green-200';
      case 'purple': return 'bg-purple-500/20 border-purple-500/50 text-purple-200';
      case 'orange': return 'bg-orange-500/20 border-orange-500/50 text-orange-200';
      case 'red': return 'bg-red-500/20 border-red-500/50 text-red-200';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-200';
    }
  };

  const formatEventTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatEventDate = (isoString: string) => {
     const date = new Date(isoString);
     const today = new Date();
     const tomorrow = new Date(today);
     tomorrow.setDate(tomorrow.getDate() + 1);

     if (date.toDateString() === today.toDateString()) return 'Today';
     if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
     return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <GlassCard 
      title="Upcoming Events" 
      icon={<Calendar size={20} />}
      className="h-full flex flex-col"
      action={
        <button 
            onClick={() => setShowInput(!showInput)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
            <Plus size={16} />
        </button>
      }
    >
      {showInput && (
        <div className="mb-4 p-3 bg-black/20 rounded-xl border border-white/10">
            <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 'Piano lesson every Tuesday at 4pm', 'Dentist tomorrow 10am'"
                className="w-full bg-transparent text-white text-md focus:outline-none resize-none placeholder-white/30 mb-2"
                rows={2}
            />
            <div className="flex justify-end gap-2">
                <button 
                    onClick={handleAddEvent}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                    {isProcessing ? 'Thinking...' : 'Add to Calendar'}
                </button>
            </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {events.length === 0 ? (
            <div className="text-center text-white/30 py-10 text-sm">
                No upcoming events. <br/> Click + to add via AI.
            </div>
        ) : (
            events.map((event) => (
            <div key={event.id} className={`p-3 rounded-xl border flex gap-4 items-center ${getColorClass(event.color)}`}>
                <div className="flex flex-col items-center justify-center w-14 text-center border-r border-white/10 pr-4">
                    <span className="text-[10px] uppercase tracking-wider opacity-70 font-bold">
                        {formatEventDate(event.start)}
                    </span>
                    <span className="text-xs font-semibold opacity-90">
                        {formatEventTime(event.start)}
                    </span>
                </div>
                <div>
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    {event.location && <p className="text-xs opacity-60 mt-0.5">{event.location}</p>}
                </div>
            </div>
            ))
        )}
      </div>
    </GlassCard>
  );
};