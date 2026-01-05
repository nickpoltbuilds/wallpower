
import { CalendarEvent } from "../types";

/**
 * Standard iCal unfolding: lines starting with a space/tab are continuations of the previous line.
 * Uses a more robust regex for splitting to handle different line ending styles.
 */
const unfoldIcsLines = (icsData: string): string[] => {
  const rawLines = icsData.split(/\r\n|\n|\r/);
  const unfolded: string[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (line.length === 0) continue;
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (unfolded.length > 0) {
        unfolded[unfolded.length - 1] += line.substring(1);
      }
    } else {
      unfolded.push(line);
    }
  }
  return unfolded;
};

/**
 * Robust iCal date parser. 
 * Correctly handles:
 * - DTSTART;TZID=America/New_York:20231025T170000
 * - DTSTART;VALUE=DATE:20231025
 * - DTSTART:20231025T170000Z
 */
const parseIcsDateValue = (line: string): Date | null => {
  // Extract value after the first colon
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return null;
  const value = line.substring(colonIndex + 1).trim();
  
  // Extract just the numbers/letters for the date match
  const match = value.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (!match) return null;

  const [_, year, month, day, hour, min, sec, isUtc] = match;
  const y = parseInt(year);
  const m = parseInt(month) - 1;
  const d = parseInt(day);

  if (!hour) {
    // All day event: Treat as local midnight on that date
    return new Date(y, m, d, 0, 0, 0);
  }

  const h = parseInt(hour);
  const mi = parseInt(min);
  const s = parseInt(sec);

  if (isUtc) {
    return new Date(Date.UTC(y, m, d, h, mi, s));
  }
  
  // Floating time: No timezone info, assume local device time
  return new Date(y, m, d, h, mi, s);
};

const parseIcsDuration = (durationStr: string): number => {
  const regex = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
  const matches = durationStr.match(regex);
  if (!matches) return 3600000;
  
  const days = parseInt(matches[1] || '0');
  const hours = parseInt(matches[2] || '0');
  const minutes = parseInt(matches[3] || '0');
  const seconds = parseInt(matches[4] || '0');
  
  return (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000;
};

const assignColor = (title: string): CalendarEvent['color'] => {
    const lower = (title || "").toLowerCase();
    if (lower.includes('birthday') || lower.includes('party') || lower.includes('dinner') || lower.includes('anniversary')) return 'purple';
    if (lower.includes('soccer') || lower.includes('gym') || lower.includes('sport') || lower.includes('game') || lower.includes('practice') || lower.includes('ballet') || lower.includes('swim') || lower.includes('tennis')) return 'orange';
    if (lower.includes('school') || lower.includes('class') || lower.includes('no school') || lower.includes('early dismissal') || lower.includes('work') || lower.includes('meeting')) return 'blue';
    if (lower.includes('trash') || lower.includes('pickup') || lower.includes('doctor') || lower.includes('dentist') || lower.includes('vet') || lower.includes('appointment')) return 'red';
    return 'green';
};

interface ExpansionRules {
    FREQ?: string;
    INTERVAL?: string;
    UNTIL?: string;
    COUNT?: string;
    BYDAY?: string;
}

const expandRecurringEvents = (events: (CalendarEvent & { rrule?: string, exdates?: string[] })[], windowStart: Date, windowEnd: Date): CalendarEvent[] => {
  const expanded: CalendarEvent[] = [];
  const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  
  events.forEach(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    if (isNaN(eventStart.getTime())) return;
    
    const duration = eventEnd.getTime() - eventStart.getTime();

    // Base event
    if (eventEnd >= windowStart && eventStart <= windowEnd) {
        expanded.push(event);
    }

    if (!event.rrule) return;

    const rules: ExpansionRules = event.rrule.split(';').reduce((acc, part) => {
        const [k, v] = part.split('=');
        if (k && v) acc[k.toUpperCase() as keyof ExpansionRules] = v.toUpperCase();
        return acc;
    }, {} as any);

    const freq = rules.FREQ;
    const interval = parseInt(rules.INTERVAL || '1');
    const count = rules.COUNT ? parseInt(rules.COUNT) : Infinity;
    const untilDate = rules.UNTIL ? parseIcsDateValue(`UNTIL:${rules.UNTIL}`) : null;
    const byDay = rules.BYDAY ? rules.BYDAY.split(',') : null;
    const exdates = new Set(event.exdates || []);

    let d = new Date(eventStart);
    let instancesFound = 0;
    
    // Skip-ahead logic
    if (!rules.COUNT && d < windowStart) {
        const msInDay = 86400000;
        const timeDiff = windowStart.getTime() - d.getTime();
        
        if (freq === 'DAILY') {
            const skip = Math.floor(timeDiff / (msInDay * interval)) * interval;
            d.setDate(d.getDate() + Math.max(0, skip - interval));
        } else if (freq === 'WEEKLY') {
            const skip = Math.floor(timeDiff / (msInDay * 7 * interval)) * interval;
            d.setDate(d.getDate() + Math.max(0, skip - 1) * 7);
        } else if (freq === 'MONTHLY') {
            const monthsDiff = (windowStart.getFullYear() - d.getFullYear()) * 12 + (windowStart.getMonth() - d.getMonth());
            const skip = Math.floor(monthsDiff / interval) * interval;
            d.setMonth(d.getMonth() + Math.max(0, skip - interval));
        } else if (freq === 'YEARLY') {
            const yearsDiff = windowStart.getFullYear() - d.getFullYear();
            const skip = Math.floor(yearsDiff / interval) * interval;
            d.setFullYear(d.getFullYear() + Math.max(0, skip - interval));
        }
    }

    let iterations = 0;
    const maxIterations = 2000; 

    while (d <= windowEnd && iterations < maxIterations) {
        iterations++;
        if (untilDate && d > untilDate) break;

        let isMatch = false;
        if (freq === 'DAILY') {
            const dayDiff = Math.round((d.getTime() - eventStart.getTime()) / 86400000);
            if (dayDiff >= 0 && dayDiff % interval === 0) isMatch = true;
        } else if (freq === 'WEEKLY') {
            const dayDiff = Math.round((d.getTime() - eventStart.getTime()) / 86400000);
            const weekDiff = Math.floor(dayDiff / 7);
            if (weekDiff >= 0 && weekDiff % interval === 0) {
                if (byDay) {
                    const currentDayName = dayNames[d.getDay()];
                    if (byDay.some(bd => bd.includes(currentDayName))) isMatch = true;
                } else if (d.getDay() === eventStart.getDay()) {
                    isMatch = true;
                }
            }
        } else if (freq === 'MONTHLY') {
            const monthDiff = (d.getFullYear() - eventStart.getFullYear()) * 12 + (d.getMonth() - eventStart.getMonth());
            if (monthDiff >= 0 && monthDiff % interval === 0 && d.getDate() === eventStart.getDate()) {
                isMatch = true;
            }
        } else if (freq === 'YEARLY') {
            const yearDiff = d.getFullYear() - eventStart.getFullYear();
            if (yearDiff >= 0 && yearDiff % interval === 0 && d.getMonth() === eventStart.getMonth() && d.getDate() === eventStart.getDate()) {
                isMatch = true;
            }
        }

        if (isMatch) {
            instancesFound++;
            if (instancesFound > count) break;

            const instanceStart = new Date(d);
            instanceStart.setHours(eventStart.getHours(), eventStart.getMinutes(), eventStart.getSeconds());
            const instanceEnd = new Date(instanceStart.getTime() + duration);
            
            const isNotBaseEvent = Math.abs(instanceStart.getTime() - eventStart.getTime()) > 5000;
            const isInWindow = instanceEnd >= windowStart && instanceStart <= windowEnd;
            const exKey = instanceStart.toISOString().split('T')[0].replace(/-/g, '');
            const isNotExcluded = !exdates.has(exKey);

            if (isInWindow && isNotBaseEvent && isNotExcluded) {
                expanded.push({ 
                    ...event, 
                    id: `${event.id}_${instanceStart.getTime()}`, 
                    start: instanceStart.toISOString(), 
                    end: instanceEnd.toISOString() 
                });
            }
        }
        
        if (freq === 'MONTHLY' && !byDay) {
            d.setMonth(d.getMonth() + 1);
        } else if (freq === 'YEARLY') {
            d.setFullYear(d.getFullYear() + 1);
        } else {
            d.setDate(d.getDate() + 1);
        }
    }
  });

  return expanded;
};

export const fetchGoogleCalendarEvents = async (icalUrl: string): Promise<{ events: CalendarEvent[], success: boolean, message?: string }> => {
    if (!icalUrl || icalUrl.length < 15) return { events: [], success: false, message: "Invalid URL" };
    
    let targetUrl = icalUrl.trim();
    if (targetUrl.startsWith('webcal://')) {
        targetUrl = 'https://' + targetUrl.substring(9);
    }
    
    if (!targetUrl.startsWith('http')) return { events: [], success: false, message: "Invalid URL protocol" };

    // Use a unique cache buster per request
    const urlWithBuster = targetUrl + (targetUrl.includes('?') ? '&' : '?') + 'cachebust=' + Date.now();
    
    let icsData = '';
    const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(urlWithBuster)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(urlWithBuster)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(urlWithBuster)}`,
        `https://proxy.cors.sh/${urlWithBuster}` // Fallback proxy
    ];

    let success = false;
    let errorMsg = "Network timeout";

    for (const p of proxies) {
        try {
            console.log(`Syncing via: ${p}`);
            const res = await fetch(p);
            if (res.ok) { 
                const text = await res.text();
                if (text && text.toUpperCase().includes('BEGIN:VCALENDAR')) {
                    icsData = text;
                    success = true;
                    break; 
                } else {
                    errorMsg = "Proxy returned non-calendar data";
                }
            } else {
                errorMsg = `Proxy error: ${res.status}`;
            }
        } catch (e) {
            console.warn(`Proxy ${p} failed.`);
            errorMsg = "Network connection failed";
        }
    }

    if (!success || !icsData) return { events: [], success: false, message: errorMsg };

    const events: (CalendarEvent & { rrule?: string, exdates?: string[] })[] = [];
    const lines = unfoldIcsLines(icsData);
    let current: Partial<CalendarEvent> & { rrule?: string, exdates?: string[], duration?: string } = {};
    let inEvent = false;

    lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;
        
        const keyPart = line.substring(0, colonIndex);
        const value = line.substring(colonIndex + 1);
        const key = keyPart.split(';')[0].toUpperCase();

        if (key === 'BEGIN' && value === 'VEVENT') {
            inEvent = true;
            current = {};
        } else if (key === 'END' && value === 'VEVENT') {
            inEvent = false;
            if (current.title && current.start) {
                if (!current.end) {
                    const durationMs = current.duration ? parseIcsDuration(current.duration) : 3600000;
                    current.end = new Date(new Date(current.start).getTime() + durationMs).toISOString();
                }
                current.id = current.id || Math.random().toString(36).substring(2, 11);
                current.color = assignColor(current.title);
                events.push(current as CalendarEvent);
            }
        } else if (inEvent) {
            if (key === 'SUMMARY') {
                current.title = value.replace(/\\,/g, ',').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
            }
            else if (key === 'DTSTART') {
              const d = parseIcsDateValue(line);
              if (d) {
                  current.start = d.toISOString();
                  if (keyPart.includes('VALUE=DATE')) {
                      current.isAllDay = true;
                  }
              }
            }
            else if (key === 'DTEND') {
              const d = parseIcsDateValue(line);
              if (d) current.end = d.toISOString();
            }
            else if (key === 'DURATION') current.duration = value;
            else if (key === 'RRULE') current.rrule = value;
            else if (key === 'EXDATE') {
              const parts = value.split(',');
              current.exdates = (current.exdates || []).concat(parts.map(p => p.split('T')[0]));
            }
            else if (key === 'LOCATION') {
                current.location = value.replace(/\\,/g, ',').replace(/\\n/g, ' ').replace(/\\\\/g, '\\');
            }
            else if (key === 'UID') {
                current.id = value;
            }
        }
    });

    const now = new Date();
    const winS = new Date(now); winS.setDate(now.getDate() - 3); winS.setHours(0,0,0,0);
    const winE = new Date(now); winE.setDate(now.getDate() + 30); winE.setHours(23,59,59,999);
    
    const expanded = expandRecurringEvents(events, winS, winE);
    
    // Final deduplication and sorting
    const uniqueMap = new Map();
    expanded.forEach(item => {
        const key = `${item.id}_${item.start}`;
        if (!uniqueMap.has(key)) uniqueMap.set(key, item);
    });
    
    return { 
        events: Array.from(uniqueMap.values()).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
        success: true 
    };
};
