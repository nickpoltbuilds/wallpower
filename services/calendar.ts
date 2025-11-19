
import { CalendarEvent } from "../types";

// --- Helpers ---

// Unfold lines according to RFC 5545: Lines starting with space/tab are continuations of previous line
const unfoldIcsLines = (icsData: string): string[] => {
  const rawLines = icsData.split(/\r\n|\n|\r/);
  const unfolded: string[] = [];
  
  for (const line of rawLines) {
    if (line.length === 0) continue;
    if (line.startsWith(' ') || line.startsWith('\t')) {
      // Continuation line
      if (unfolded.length > 0) {
        unfolded[unfolded.length - 1] += line.substring(1);
      }
    } else {
      unfolded.push(line);
    }
  }
  return unfolded;
};

const parseIcsDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();

  // Remove any TZID prefix if present in the value
  const cleanStr = dateStr.split(':').pop() || dateStr;

  const year = parseInt(cleanStr.substring(0, 4));
  const month = parseInt(cleanStr.substring(4, 6)) - 1;
  const day = parseInt(cleanStr.substring(6, 8));

  if (cleanStr.length === 8) {
    // All day event (YYYYMMDD) - set to midnight local
    return new Date(year, month, day);
  }

  if (cleanStr.includes('T')) {
    const timePart = cleanStr.split('T')[1];
    const hour = parseInt(timePart.substring(0, 2));
    const minute = parseInt(timePart.substring(2, 4));
    const second = parseInt(timePart.substring(4, 6));
    
    if (cleanStr.endsWith('Z')) {
        // UTC
        return new Date(Date.UTC(year, month, day, hour, minute, second));
    } else {
        // Local (Floating) - treat as local time
        return new Date(year, month, day, hour, minute, second);
    }
  }
  
  return new Date();
};

const assignColor = (title: string): CalendarEvent['color'] => {
    const lower = title.toLowerCase();
    if (lower.includes('birthday') || lower.includes('party') || lower.includes('dinner')) return 'purple';
    if (lower.includes('soccer') || lower.includes('gym') || lower.includes('sport') || lower.includes('game') || lower.includes('practice')) return 'orange';
    if (lower.includes('school') || lower.includes('class') || lower.includes('meet') || lower.includes('no school')) return 'green';
    if (lower.includes('trash') || lower.includes('pickup') || lower.includes('doctor') || lower.includes('dentist')) return 'red';
    return 'blue';
};

// --- Recurrence Engine ---

const expandRecurringEvents = (events: CalendarEvent[], windowStart: Date, windowEnd: Date): CalendarEvent[] => {
  const expanded: CalendarEvent[] = [];
  
  // Map for day names in RRULE to JS getDay() integers
  const dayMap: {[key: string]: number} = { 'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6 };

  events.forEach(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const duration = eventEnd.getTime() - eventStart.getTime();

    // 1. Add the base event if it falls in window
    if (eventEnd >= windowStart && eventStart <= windowEnd) {
        expanded.push(event);
    }

    // 2. If no RRULE, we are done with this event
    if (!event.rrule) return;

    // 3. Parse RRULE
    const rules = event.rrule.split(';').reduce((acc, part) => {
        const [k, v] = part.split('=');
        acc[k] = v;
        return acc;
    }, {} as any);

    const freq = rules.FREQ;
    const interval = parseInt(rules.INTERVAL || '1');
    const count = rules.COUNT ? parseInt(rules.COUNT) : null;
    
    let untilDate: Date | null = null;
    if (rules.UNTIL) {
        untilDate = parseIcsDate(rules.UNTIL);
        // Adjust UNTIL to end of that day to be inclusive
        untilDate.setHours(23, 59, 59, 999);
    }

    // Start checking from the event start date, but we can skip ahead to windowStart for efficiency if simple
    // However, for complex rules (COUNT), we must iterate from start.
    // For UNTIL, we can't skip past it.
    
    // Optimization: We iterate day by day.
    // Since we only care about a small window (4 days), but event might have started years ago.
    // Iterating 5 years of daily events is slow.
    // BUT, we need to know if we hit COUNT.
    
    // FAST PATH: If no COUNT, jump to windowStart
    let d = new Date(eventStart);
    let instancesFound = 0;

    // If we have a COUNT, we must simulate from start. If not, we can optimize start time.
    if (!count) {
        if (d < windowStart) {
            // Fast forward logic for simple frequencies could go here.
            // For now, let's just set 'd' to windowStart minus a buffer (e.g. 1 interval) to ensure we catch overlap?
            // Actually, relying on loop is safer for correctness unless performance hits.
            // Given this is for a family calendar (few hundred events), linear scan is likely fine 
            // IF we filter out really old stuff. But "Hugo" event started long ago.
            
            // Let's try a hybrid. If FREQ=WEEKLY, jump to near windowStart.
            const oneDay = 1000 * 60 * 60 * 24;
            const distToWindow = windowStart.getTime() - d.getTime();
            
            if (distToWindow > 0) {
                if (freq === 'DAILY') {
                    const jumps = Math.floor((distToWindow / oneDay) / interval);
                    d.setDate(d.getDate() + (jumps * interval));
                } else if (freq === 'WEEKLY') {
                    const oneWeek = oneDay * 7;
                    const jumps = Math.floor((distToWindow / oneWeek) / interval);
                    d.setDate(d.getDate() + (jumps * 7 * interval));
                } else if (freq === 'YEARLY') {
                    const years = windowStart.getFullYear() - d.getFullYear();
                    d.setFullYear(d.getFullYear() + years);
                }
                // Back up one step to be safe
                d.setDate(d.getDate() - 1); 
            }
        }
    }

    const MAX_ITERATIONS = 2000; // Safety break
    let loops = 0;

    // Loop until we pass the window end OR hit UNTIL OR hit COUNT
    while (d <= windowEnd && loops < MAX_ITERATIONS) {
        loops++;
        
        // Check limits
        if (untilDate && d > untilDate) break;
        if (count && instancesFound >= count) break;

        // Check match
        let isMatch = false;
        
        // Determine if 'd' matches rule relative to eventStart
        // Note: This simple engine assumes 'd' increments by 1 day.
        // The jumps above might put us mid-interval, so we need to be careful.
        // For robustness in this simplified engine, we check conditions.

        // --- DAILY ---
        if (freq === 'DAILY') {
            const diffTime = d.getTime() - eventStart.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays % interval === 0) isMatch = true;
        }
        // --- WEEKLY ---
        else if (freq === 'WEEKLY') {
             // For weekly, we check if we are in a valid week index, AND if the day matches.
             // Simple version: check BYDAY
             if (rules.BYDAY) {
                const days = rules.BYDAY.split(',');
                const currentDayStr = Object.keys(dayMap).find(key => dayMap[key] === d.getDay());
                
                // Check if we are in correct week interval
                // Calculate weeks from start
                const diffTime = d.getTime() - eventStart.getTime();
                const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

                if (diffWeeks >= 0 && diffWeeks % interval === 0) {
                     if (currentDayStr && days.includes(currentDayStr)) isMatch = true;
                }
             } else {
                // Standard weekly: same day of week
                const diffTime = d.getTime() - eventStart.getTime();
                const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));
                // Ensure it's exactly the same day of week
                if (d.getDay() === eventStart.getDay() && diffWeeks >= 0 && diffTime % (1000 * 60 * 60 * 24 * 7) === 0) { // rough check
                     // better:
                     const dayDiff = Math.round((d.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24));
                     if (dayDiff % (7 * interval) === 0) isMatch = true;
                }
             }
        }
        // --- MONTHLY ---
        else if (freq === 'MONTHLY') {
            if (rules.BYMONTHDAY) {
                if (d.getDate() === parseInt(rules.BYMONTHDAY)) {
                     // Check interval
                     const monthDiff = (d.getFullYear() - eventStart.getFullYear()) * 12 + (d.getMonth() - eventStart.getMonth());
                     if (monthDiff % interval === 0) isMatch = true;
                }
            } else {
                if (d.getDate() === eventStart.getDate()) {
                     const monthDiff = (d.getFullYear() - eventStart.getFullYear()) * 12 + (d.getMonth() - eventStart.getMonth());
                     if (monthDiff % interval === 0) isMatch = true;
                }
            }
        }
        // --- YEARLY ---
        else if (freq === 'YEARLY') {
             if (d.getMonth() === eventStart.getMonth() && d.getDate() === eventStart.getDate()) {
                 const yearDiff = d.getFullYear() - eventStart.getFullYear();
                 if (yearDiff % interval === 0) isMatch = true;
             }
        }

        if (isMatch) {
            instancesFound++;
            
            // We only add to expanded list if it is INSIDE the window
            // AND it is not the original start date (already added)
            const instanceStart = new Date(d);
            // Preserve time from original event
            instanceStart.setHours(eventStart.getHours(), eventStart.getMinutes(), eventStart.getSeconds());
            
            const instanceEnd = new Date(instanceStart.getTime() + duration);

            if (instanceEnd >= windowStart && instanceStart <= windowEnd) {
                 // Don't duplicate the base event
                if (instanceStart.getTime() !== eventStart.getTime()) {
                    expanded.push({
                        ...event,
                        id: `${event.id}_${d.getTime()}`,
                        start: instanceStart.toISOString(),
                        end: instanceEnd.toISOString(),
                        // Inherit properties
                        isAllDay: event.isAllDay,
                        color: event.color,
                        title: event.title,
                        location: event.location
                    });
                }
            }
        }

        // Increment D
        d.setDate(d.getDate() + 1);
    }
  });

  return expanded;
};

// --- Fetcher ---

export const fetchGoogleCalendarEvents = async (icalUrl: string): Promise<CalendarEvent[]> => {
    if (!icalUrl) return [];
    
    let icsData = '';

    try {
        // Multi-Proxy Strategy
        try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(icalUrl)}&timestamp=${Date.now()}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`AllOrigins status: ${response.status}`);
            const json = await response.json();
            if (!json.contents) throw new Error('Empty contents from AllOrigins');
            icsData = json.contents;
        } catch (primaryError) {
            console.warn("Primary calendar proxy failed, attempting backup...", primaryError);
            const backupUrl = `https://corsproxy.io/?${encodeURIComponent(icalUrl)}`;
            const response = await fetch(backupUrl);
            if (!response.ok) throw new Error(`CorsProxy status: ${response.status}`);
            icsData = await response.text();
        }

        if (!icsData) return [];

        // --- Parse ICS ---
        const events: CalendarEvent[] = [];
        const lines = unfoldIcsLines(icsData); // Use unfolding here
        
        let currentEvent: Partial<CalendarEvent> & { rrule?: string } = {};
        let inEvent = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line === 'BEGIN:VEVENT') {
                inEvent = true;
                currentEvent = {};
                continue;
            }

            if (line === 'END:VEVENT') {
                inEvent = false;
                if (currentEvent.title && currentEvent.start) {
                    if (!currentEvent.end) {
                        // Default to 1 hour
                        const startDate = new Date(currentEvent.start);
                        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                        currentEvent.end = endDate.toISOString();
                    }
                    if (!currentEvent.id) currentEvent.id = Math.random().toString(36).substr(2, 9);
                    currentEvent.color = assignColor(currentEvent.title);
                    events.push(currentEvent as CalendarEvent);
                }
                continue;
            }

            if (!inEvent) continue;

            // Simple Key:Value split
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) continue;

            let keyPart = line.substring(0, colonIndex);
            const value = line.substring(colonIndex + 1);

            // Split params
            const keyParams = keyPart.split(';');
            const key = keyParams[0];

            if (key === 'SUMMARY') {
                currentEvent.title = value;
            } else if (key === 'DTSTART') {
                const date = parseIcsDate(value);
                currentEvent.start = date.toISOString();
                if (keyPart.includes('VALUE=DATE') || value.length === 8) {
                    currentEvent.isAllDay = true;
                }
            } else if (key === 'DTEND') {
                currentEvent.end = parseIcsDate(value).toISOString();
            } else if (key === 'RRULE') {
                currentEvent.rrule = value;
            } else if (key === 'LOCATION') {
                currentEvent.location = value.replace(/\\,/g, ',');
            } else if (key === 'UID') {
                currentEvent.id = value;
            }
        }

        // --- Post-Processing ---
        
        // Display window: Today-1 to Today+4
        const now = new Date();
        const windowStart = new Date(now);
        windowStart.setDate(now.getDate() - 1);
        windowStart.setHours(0,0,0,0);

        const windowEnd = new Date(now);
        windowEnd.setDate(now.getDate() + 7);
        windowEnd.setHours(23,59,59,999);

        const expandedEvents = expandRecurringEvents(events, windowStart, windowEnd);

        return expandedEvents
            .filter(e => {
                // Ensure overlap with window
                const s = new Date(e.start);
                const end = new Date(e.end);
                return end >= windowStart && s <= windowEnd;
            })
            .sort((a, b) => {
                const dateA = new Date(a.start).getTime();
                const dateB = new Date(b.start).getTime();
                if (dateA !== dateB) return dateA - dateB;
                if (a.isAllDay && !b.isAllDay) return -1;
                if (!a.isAllDay && b.isAllDay) return 1;
                return 0;
            });

    } catch (error) {
        console.error("Failed to fetch iCal events:", error);
        return [];
    }
};
