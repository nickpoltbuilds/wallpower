
import React from 'react';
import { MapPin } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { CalendarEvent } from '../types';

interface CalendarGridProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  isGoogleLinked: boolean;
  use24Hour?: boolean;
}

const parseTime = (dateStr: string, use24Hour: boolean): { hour: string; ampm: string } => {
  try {
    const d = new Date(dateStr);
    const h = d.getHours();
    const m = d.getMinutes();
    const minStr = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
    if (use24Hour) {
      return { hour: `${String(h).padStart(2, '0')}${minStr}`, ampm: '' };
    }
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return { hour: `${h12}${minStr}`, ampm };
  } catch {
    return { hour: '—', ampm: '' };
  }
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({ events, use24Hour = false }) => {
  const today = new Date();

  const days = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d;
  });

  const getEventsForDay = (date: Date) =>
    events
      .filter(e => {
        try {
          const eStart = new Date(e.start);
          const eEnd   = new Date(e.end);
          const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
          const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999);
          if (isNaN(eStart.getTime())) return false;
          return eStart < dayEnd && eEnd > dayStart;
        } catch { return false; }
      })
      .sort((a, b) => {
        // All-day events first, then chronological
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      });

  const getMultiDayLabel = (event: CalendarEvent, currentDay: Date) => {
    try {
      const start = new Date(event.start); start.setHours(0,0,0,0);
      const end   = new Date(event.end);
      if (end.getHours() === 0 && end.getMinutes() === 0) end.setMilliseconds(-1);
      end.setHours(0,0,0,0);
      const durationMs   = end.getTime() - start.getTime();
      const daysDuration = Math.max(1, Math.ceil(durationMs / 86400000) + 1);
      if (daysDuration <= 1) return null;
      const current  = new Date(currentDay); current.setHours(0,0,0,0);
      const dayIndex = Math.floor((current.getTime() - start.getTime()) / 86400000) + 1;
      if (dayIndex > daysDuration || dayIndex < 1) return null;
      return `${dayIndex}/${daysDuration}`;
    } catch { return null; }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 h-full min-h-0">
      {days.map((day, i) => {
        const dayEvents = getEventsForDay(day);
        const isToday   = i === 0;
        const dayLabel  = i === 0 ? 'Today'
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
            <div className="px-4 pt-3.5 pb-2.5 flex-shrink-0 flex items-baseline justify-between">
              <span className={`text-[15px] font-black uppercase tracking-tight leading-none ${isToday ? 'widget-calendar-text-today' : 'widget-calendar-text-header'}`}>
                {dayLabel}
              </span>
              <span className="text-[13px] font-semibold widget-calendar-text-sub opacity-55 tabular-nums">
                {dateLabel}
              </span>
            </div>

            <div className="mx-4 h-px bg-current opacity-[0.07] flex-shrink-0" />

            {/* Events */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 py-1.5 px-2 flex flex-col gap-1">
              {dayEvents.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-15">Free</span>
                </div>
              ) : (
                dayEvents.map((event, idx) => {
                  const multiDayLabel     = getMultiDayLabel(event, day);
                  const colorClass        = event.color || 'blue';
                  const { hour, ampm }    = event.isAllDay
                    ? { hour: '', ampm: '' }
                    : parseTime(event.start, use24Hour);

                  return (
                    <div
                      key={`${event.id}_${i}_${idx}`}
                      className={`event-card ${colorClass} flex items-stretch rounded-lg overflow-hidden`}
                      style={{ borderLeftWidth: '4px' }}
                    >
                      {/* ── Time column ── */}
                      <div
                        className="flex flex-col items-center justify-center py-3 flex-shrink-0 text-center"
                        style={{ background: 'rgba(0,0,0,0.14)', width: '54px' }}
                      >
                        {event.isAllDay ? (
                          <span className="text-[9px] font-black uppercase tracking-widest leading-[1.4] opacity-70">
                            ALL<br />DAY
                          </span>
                        ) : (
                          <>
                            <span className="text-[19px] font-black tabular-nums leading-none tracking-tight">
                              {hour}
                            </span>
                            <span className="text-[10px] font-black uppercase opacity-55 mt-0.5 tracking-wider">
                              {ampm}
                            </span>
                          </>
                        )}
                      </div>

                      {/* ── Content column ── */}
                      <div className="flex flex-col justify-center px-3 py-2.5 min-w-0 flex-1">
                        <span
                          className="font-bold leading-tight block"
                          style={{ fontSize: 'clamp(0.875rem, 1.9vmin, 1rem)' }}
                        >
                          {event.title}
                        </span>

                        {(event.location || multiDayLabel) && (
                          <div className="flex items-center justify-between gap-1 mt-1 opacity-60">
                            {event.location && (
                              <div className="flex items-center gap-1 text-[11px] font-semibold min-w-0">
                                <MapPin size={10} strokeWidth={2.5} className="flex-shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            {multiDayLabel && (
                              <span className="text-[10px] font-black uppercase tracking-tight ml-auto flex-shrink-0 opacity-70">
                                {multiDayLabel}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
