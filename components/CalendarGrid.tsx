
import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { CalendarEvent } from '../types';

interface CalendarGridProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  isGoogleLinked: boolean;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ events }) => {
  const today = new Date();

  const days = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d;
  });

  const getEventsForDay = (date: Date) => {
    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999);
    return events.filter(e => {
      try {
        const eStart = new Date(e.start);
        const eEnd   = new Date(e.end);
        if (isNaN(eStart.getTime())) return false;
        return eStart < dayEnd && eEnd > dayStart;
      } catch { return false; }
    });
  };

  const getMultiDayLabel = (event: CalendarEvent, currentDay: Date) => {
    try {
      const start = new Date(event.start); start.setHours(0,0,0,0);
      const end   = new Date(event.end);
      if (end.getHours() === 0 && end.getMinutes() === 0) end.setMilliseconds(-1);
      end.setHours(0,0,0,0);
      const durationMs  = end.getTime() - start.getTime();
      const daysDuration = Math.max(1, Math.ceil(durationMs / 86400000) + 1);
      if (daysDuration <= 1) return null;
      const current = new Date(currentDay); current.setHours(0,0,0,0);
      const dayIndex = Math.floor((current.getTime() - start.getTime()) / 86400000) + 1;
      if (dayIndex > daysDuration || dayIndex < 1) return null;
      return `${dayIndex}/${daysDuration}`;
    } catch { return null; }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 tablet-landscape:grid-cols-4 gap-2 sm:gap-3 h-full min-h-0">
      {days.map((day, i) => {
        const dayEvents = getEventsForDay(day);
        const isToday = i === 0;
        const dayLabel = i === 0 ? 'Today'
          : i === 1 ? 'Tomorrow'
          : day.toLocaleDateString('en-US', { weekday: 'long' });
        const dateLabel = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return (
          <GlassCard
            key={i}
            className={`h-full flex flex-col ${isToday ? 'widget-calendar-today border' : 'widget-calendar-col border'}`}
            noContentPadding
          >
            {/* Column header */}
            <div className="px-3 pt-3 pb-2 flex-shrink-0">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-[13px] font-black uppercase tracking-tight ${isToday ? 'widget-calendar-text-today' : 'widget-calendar-text-header'}`}
                >
                  {dayLabel}
                </span>
                <span className="text-[11px] font-bold widget-calendar-text-sub opacity-70">
                  {dateLabel}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-3 h-px bg-current opacity-[0.07] flex-shrink-0" />

            {/* Events */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
              {dayEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-current opacity-15" />
                </div>
              ) : (
                <div className="flex flex-col">
                  {dayEvents.map((event, idx) => {
                    const multiDayLabel = getMultiDayLabel(event, day);
                    const colorClass = event.color || 'blue';
                    let timeString = 'All Day';
                    if (!event.isAllDay) {
                      try {
                        timeString = new Date(event.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                      } catch { timeString = '—'; }
                    }
                    return (
                      <div
                        key={`${event.id}_${i}_${idx}`}
                        className={`px-3 py-2.5 event-card ${colorClass}`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider opacity-80">
                            {!event.isAllDay && <Clock size={10} strokeWidth={3} className="flex-shrink-0" />}
                            <span>{timeString}</span>
                          </div>
                          {multiDayLabel && (
                            <span className="text-[9px] font-black opacity-60 uppercase tracking-tight">
                              Day {multiDayLabel}
                            </span>
                          )}
                        </div>
                        <div
                          className="font-bold leading-tight"
                          style={{ fontSize: 'clamp(0.85rem, 1.8vmin, 1rem)' }}
                        >
                          {event.title}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-[10px] font-bold mt-0.5 opacity-70 truncate">
                            <MapPin size={9} strokeWidth={2.5} className="flex-shrink-0" />
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
  );
};
