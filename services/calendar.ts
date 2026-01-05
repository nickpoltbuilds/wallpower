
import { CalendarEvent } from "../types";

const unfoldIcsLines = (icsData: string): string[] => {
  const rawLines = icsData.split(/\r\n|\n|\r/);
  const unfolded: string[] = [];
  for (const line of rawLines) {
    if (line.length === 0) continue;
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (unfolded.length > 0) unfolded[unfolded.length - 1] += line.substring(1);
    } else unfolded.push(line);
  }
  return unfolded;
};

const parseIcsDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const cleanStr = dateStr.includes(':') ? dateStr.split(':').pop()! : dateStr;
  
  const year = parseInt(cleanStr.substring(0, 4));
  const month = parseInt(cleanStr.substring(4, 6)) - 1;
  const day = parseInt(cleanStr.substring(6, 8));

  if (cleanStr.length === 8) {
    return new Date(year, month, day);
  }

  if (cleanStr.includes('T')) {
    const timePart = cleanStr.split('T')[1];
    const hour = parseInt(timePart.substring(0, 2));
    const minute = parseInt(timePart.substring(2, 4));
    const second = parseInt(timePart.substring(4, 6));

    if (cleanStr.endsWith('Z')) {
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
    return new Date(year, month, day, hour, minute, second);
  }
  return new Date();
};

const assignColor = (title: string): CalendarEvent['color'] => {
    const lower = title.toLowerCase();
    if (lower.includes('birthday') || lower.includes('party') || lower.includes('dinner')) return 'purple';
    if (lower.includes('soccer') || lower.includes('gym') || lower.includes('sport') || lower.includes('game') || lower.includes('practice')) return 'orange';
    if (lower.includes('school') || lower.includes('class') || lower.includes('no school')) return 'green';
    if (lower.includes('trash') || lower.includes('pickup') || lower.includes('doctor') || lower.includes('dentist')) return 'red';
    return 'blue';
};

const expandRecurringEvents = (events: CalendarEvent[], windowStart: Date, windowEnd: Date): CalendarEvent[] => {
  const expanded: CalendarEvent[] = [];
  
  events.forEach(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const duration = eventEnd.getTime() - eventStart.getTime();

    if (eventEnd >= windowStart && eventStart <= windowEnd) {
        expanded.push(event);
    }

    if (!event.rrule) return;

    const rules = event.rrule.split(';').reduce((acc, part) => {
        const [k, v] = part.split('=');
        if (k && v) acc[k] = v;
        return acc;
    }, {} as any);

    const freq = rules.FREQ;
    const interval = parseInt(rules.INTERVAL || '1');
    const count = rules.COUNT ? parseInt(rules.COUNT) : null;
    let untilDate = rules.UNTIL ? parseIcsDate(rules.UNTIL) : null;
    if (untilDate) untilDate.setHours(23, 59, 59);

    let d = new Date(eventStart);
    let instancesFound = 1;

    if (!count && d < windowStart) {
        const oneDay = 1000 * 60 * 60 * 24;
        const dist = windowStart.getTime() - d.getTime();
        if (freq === 'DAILY') d.setDate(d.getDate() + Math.floor((dist / oneDay) / interval) * interval);
        else if (freq === 'WEEKLY') d.setDate(d.getDate() + Math.floor((dist / (oneDay * 7)) / interval) * 7 * interval);
        d.setDate(d.getDate() - 7);
    }

    let iterations = 0;
    while (d <= windowEnd && iterations < 500) {
        iterations++;
        if (untilDate && d > untilDate) break;
        if (count && instancesFound >= count) break;

        let isMatch = false;
        if (freq === 'DAILY') {
            const dayDiff = Math.round((d.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff > 0 && dayDiff % interval === 0) isMatch = true;
        } else if (freq === 'WEEKLY') {
            const dayDiff = Math.round((d.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff > 0 && dayDiff % (7 * interval) === 0) isMatch = true;
        }

        if (isMatch) {
            instancesFound++;
            const instanceStart = new Date(d);
            instanceStart.setHours(eventStart.getHours(), eventStart.getMinutes(), eventStart.getSeconds());
            const instanceEnd = new Date(instanceStart.getTime() + duration);
            
            if (instanceEnd >= windowStart && instanceStart <= windowEnd) {
                expanded.push({ ...event, id: `${event.id}_${d.getTime()}`, start: instanceStart.toISOString(), end: instanceEnd.toISOString() });
            }
        }
        d.setDate(d.getDate() + 1);
    }
  });

  return expanded;
};

export const fetchGoogleCalendarEvents = async (icalUrl: string): Promise<CalendarEvent[]> => {
    if (!icalUrl || !icalUrl.startsWith('http')) {
        console.warn("Invalid Calendar URL provided.");
        return [];
    }
    
    let icsData = '';
    // We try 'raw' proxies first as they are most likely to return plain text ICS
    const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(icalUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(icalUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(icalUrl)}`,
        `https://thingproxy.freeboard.io/fetch/${icalUrl}`
    ];

    let success = false;
    for (const p of proxies) {
        try {
            console.log(`Attempting calendar fetch via: ${p}`);
            const res = await fetch(p);
            if (res.ok) { 
                const text = await res.text();
                // Check if the response is actually an ICS file
                if (text && text.includes('BEGIN:VCALENDAR')) {
                    icsData = text;
                    success = true;
                    console.log("Successfully retrieved ICS data.");
                    break; 
                } else {
                    console.warn(`Proxy ${p} returned non-ICS data or empty response.`);
                }
            }
        } catch (e) { 
            console.error(`Proxy ${p} failed fetch check.`);
        }
    }

    if (!success || !icsData) {
        console.error("Critical: All calendar proxies failed. Please check your Secret iCal URL.");
        return [];
    }

    const events: CalendarEvent[] = [];
    const lines = unfoldIcsLines(icsData);
    let current: Partial<CalendarEvent> & { rrule?: string } = {};
    let inEvent = false;

    lines.forEach(line => {
        if (line === 'BEGIN:VEVENT') { inEvent = true; current = {}; }
        else if (line === 'END:VEVENT') {
            inEvent = false;
            if (current.title && current.start) {
                if (!current.end) current.end = new Date(new Date(current.start).getTime() + 3600000).toISOString();
                current.id = current.id || Math.random().toString(36).substr(2, 9);
                current.color = assignColor(current.title);
                events.push(current as CalendarEvent);
            }
        } else if (inEvent) {
            const idx = line.indexOf(':');
            if (idx === -1) return;
            const keyPart = line.substring(0, idx);
            const val = line.substring(idx + 1);
            const key = keyPart.split(';')[0];
            if (key === 'SUMMARY') current.title = val.replace(/\\,/g, ',');
            else if (key === 'DTSTART') current.start = parseIcsDate(val).toISOString();
            else if (key === 'DTEND') current.end = parseIcsDate(val).toISOString();
            else if (key === 'RRULE') current.rrule = val;
            else if (key === 'LOCATION') current.location = val.replace(/\\,/g, ',');
            else if (key === 'UID') current.id = val;
        }
    });

    const now = new Date();
    const winS = new Date(now); winS.setDate(now.getDate() - 1); winS.setHours(0,0,0,0);
    const winE = new Date(now); winE.setDate(now.getDate() + 14); winE.setHours(23,59,59,999);
    
    const expanded = expandRecurringEvents(events, winS, winE);
    const unique = Array.from(new Map(expanded.map(item => [`${item.title}_${item.start}`, item])).values());
    return unique.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
};
