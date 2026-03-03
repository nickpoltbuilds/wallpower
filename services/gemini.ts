
import { CalendarEvent, LunchMenu, WeatherData } from "../types";

// --- Dad Joke API ---
export const fetchDadJoke = async (): Promise<string> => {
    try {
        const res = await fetch('https://icanhazdadjoke.com/', {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'FamilyHub/1.0 (https://github.com/familyhub)'
            }
        });
        if (!res.ok) throw new Error('Failed to fetch joke');
        const data = await res.json();
        return data.joke;
    } catch (e) {
        return "I'm afraid for the calendar. Its days are numbered.";
    }
};

// --- Weather Service ---

const getCoordinates = async (location: string) => {
    try {
        const cleanLocation = location.includes(',') ? location.split(',')[0].trim() : location;
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanLocation)}&count=1&language=en&format=json`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name };
        }
    } catch (e) {
        console.warn("Open-Meteo Geocoding failed, trying Nominatim...");
    }

    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'FamilyHub/1.0 (contact: dashboard-app@example.com)' }
        });
        const data = await res.json();
        if (data && data.length > 0) {
            const result = data[0];
            return { lat: parseFloat(result.lat), lon: parseFloat(result.lon), name: result.display_name.split(',')[0] };
        }
    } catch (e) {
        console.warn("Nominatim Geocoding failed.");
    }

    return null;
};

const mapNoaaIcon = (iconUrl: string): string => {
    if (!iconUrl) return 'sunny';
    const parts = iconUrl.split('/');
    let code = parts[parts.length - 1].split('?')[0].split(',')[0];
    if (code.includes('_')) code = code.split('_')[0];

    const map: {[key: string]: string} = {
        'skc': 'sunny', 'few': 'sunny', 'sct': 'partly-cloudy', 'bkn': 'partly-cloudy',
        'ovc': 'cloudy', 'wind': 'cloudy', 'snow': 'snow', 'rain': 'rain', 'shra': 'rain',
        'tsra': 'storm', 'fzra': 'rain', 'mix': 'rain', 'dust': 'cloudy', 'fog': 'cloudy',
        'smoke': 'cloudy', 'haze': 'cloudy', 'hot': 'sunny', 'cold': 'sunny', 'blizzard': 'snow'
    };
    if (code.includes('rain')) return 'rain';
    if (code.includes('snow')) return 'snow';
    if (code.includes('thunder')) return 'storm';
    return map[code] || 'sunny';
};

const mapWmoCode = (code: number): string => {
    if (code === 0) return 'sunny';
    if (code <= 3) return 'partly-cloudy';
    if (code <= 48) return 'cloudy';
    if (code <= 67) return 'rain';
    if (code <= 77) return 'snow';
    if (code <= 82) return 'rain';
    if (code <= 86) return 'snow';
    if (code <= 99) return 'storm';
    return 'sunny';
};

export const fetchWeather = async (locationQuery: string): Promise<WeatherData | null> => {
    const coords = await getCoordinates(locationQuery);
    if (!coords) return null;

    const city = coords.name || locationQuery.split(',')[0];

    // Try Open-Meteo first (no CORS issues, reliable)
    try {
        const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,apparent_temperature&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&forecast_days=4`;
        const res = await fetch(omUrl);
        const data = await res.json();

        if (data.current && data.daily) {
            // 4 days of daily forecast (today + 3 more)
            const forecast = data.daily.time.slice(0, 4).map((t: string, i: number) => ({
                day: new Date(t + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
                icon: mapWmoCode(data.daily.weather_code[i]),
                high: Math.round(data.daily.temperature_2m_max[i]),
                low: Math.round(data.daily.temperature_2m_min[i])
            }));

            const wmoConditions: {[key: number]: string} = {
                0: 'Clear', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
                45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
                61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Light Snow', 73: 'Snow',
                75: 'Heavy Snow', 80: 'Showers', 81: 'Showers', 82: 'Heavy Showers',
                95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
            };
            const condition = wmoConditions[data.current.weather_code] || 'Partly Cloudy';

            // Build hourly sparkline: next 13 hours from current hour
            const hourlyTimes: string[] = data.hourly?.time ?? [];
            const hourlyTemps: number[] = data.hourly?.temperature_2m ?? [];
            const now = new Date();
            let startIdx = 0;
            for (let i = 0; i < hourlyTimes.length - 1; i++) {
                // Open-Meteo local times: "2024-03-03T14:00"
                const [dp, tp] = hourlyTimes[i].split('T');
                const [y, mo, d] = dp.split('-').map(Number);
                const h = parseInt(tp);
                const t = new Date(y, mo - 1, d, h, 0, 0);
                if (t <= now) startIdx = i;
                else break;
            }
            const hourlySlice = hourlyTimes.slice(startIdx, startIdx + 13);
            const hourly = hourlySlice.map((t, idx) => {
                const h = parseInt(t.split('T')[1]);
                const ampm = h >= 12 ? 'pm' : 'am';
                const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                return {
                    label: idx === 0 ? 'Now' : `${h12}${ampm}`,
                    temp: Math.round(hourlyTemps[startIdx + idx] ?? 0),
                };
            });

            return {
                currentTemp: Math.round(data.current.temperature_2m),
                feelsLike: Math.round(data.current.apparent_temperature),
                condition,
                high: Math.round(data.daily.temperature_2m_max[0]),
                low: Math.round(data.daily.temperature_2m_min[0]),
                location: city,
                hourly,
                forecast
            };
        }
    } catch (e) {
        console.warn("Open-Meteo forecast failed, trying NOAA...");
    }

    // Fallback: NOAA (US only, requires CORS proxy)
    try {
        const proxies = [
            (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
            (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        ];

        let pointsData: any = null;
        for (const proxyFn of proxies) {
            try {
                const pointsUrl = proxyFn(`https://api.weather.gov/points/${coords.lat},${coords.lon}`);
                const res = await fetch(pointsUrl, { headers: { 'User-Agent': 'FamilyHub/1.0' } });
                if (res.ok) { pointsData = await res.json(); break; }
            } catch (e) { continue; }
        }

        if (pointsData) {
            const forecastUrlRaw = pointsData.properties.forecast;
            const forecastHourlyUrlRaw = pointsData.properties.forecastHourly;

            let forecastData: any = null;
            let hourlyData: any = null;

            for (const proxyFn of proxies) {
                try {
                    const res = await fetch(proxyFn(forecastUrlRaw), { headers: { 'User-Agent': 'FamilyHub/1.0' } });
                    if (res.ok) { forecastData = await res.json(); break; }
                } catch (e) { continue; }
            }

            for (const proxyFn of proxies) {
                try {
                    const res = await fetch(proxyFn(forecastHourlyUrlRaw), { headers: { 'User-Agent': 'FamilyHub/1.0' } });
                    if (res.ok) { hourlyData = await res.json(); break; }
                } catch (e) { continue; }
            }

            if (forecastData) {
                const periods = forecastData.properties.periods;
                const hourlyPeriods = hourlyData?.properties?.periods || [];

                const currentTemp = hourlyPeriods[0]?.temperature || periods[0].temperature;
                const currentCondition = hourlyPeriods[0]?.shortForecast || periods[0].shortForecast;

                const dailyForecasts: any[] = [];
                const processedDays = new Set();
                for (const period of periods) {
                    const date = new Date(period.startTime);
                    const dayKey = date.toDateString();
                    if (processedDays.has(dayKey)) continue;

                    const dayPeriods = periods.filter((p: any) => new Date(p.startTime).toDateString() === dayKey);
                    let high = -999, low = 999, icon = '';
                    dayPeriods.forEach((p: any) => {
                        if (p.isDaytime) { high = p.temperature; icon = mapNoaaIcon(p.icon); }
                        else { low = p.temperature; if (!icon) icon = mapNoaaIcon(p.icon); }
                    });
                    if (high === -999) high = low;
                    if (low === 999) low = high;
                    dailyForecasts.push({ day: date.toLocaleDateString('en-US', { weekday: 'long' }), icon, high, low });
                    processedDays.add(dayKey);
                    if (dailyForecasts.length >= 4) break;
                }

                return {
                    currentTemp,
                    condition: currentCondition,
                    high: dailyForecasts[0]?.high || currentTemp,
                    low: dailyForecasts[0]?.low || currentTemp,
                    location: city,
                    hourly: [], // NOAA fallback: no hourly sparkline data
                    forecast: dailyForecasts
                };
            }
        }
    } catch (noaaError) {
        console.warn("NOAA failed.");
    }

    return null;
};

// --- School Lunch Service ---

const LUNCH_PROXIES = [
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

const getLunchCacheKey = (schoolId: string, dateStr: string) => `lunch_${schoolId}_${dateStr}`;

const findAllEntrees = (node: any, found: Set<string>) => {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(child => findAllEntrees(child, found)); return; }
    if (typeof node === 'object') {
        if (node.item_Type && node.item_Type.toLowerCase().includes('entree') && node.item_Name) {
            found.add(node.item_Name);
        }
        Object.values(node).forEach(child => findAllEntrees(child, found));
    }
};

export const fetchSchoolLunch = async (schoolName: string, schoolId?: string): Promise<LunchMenu> => {
    const date = new Date();
    const day = date.getDay();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${mm}-${dd}-${yyyy}`;
    const isoDate = `${yyyy}-${mm}-${dd}`;

    // Weekend detection
    if (day === 0 || day === 6) {
        return { main: 'No School Today', sides: [], date: date.toDateString(), isWeekend: true };
    }

    if (!schoolId) return { main: 'Unavailable', sides: [], date: date.toDateString() };

    // Check localStorage cache
    const cacheKey = getLunchCacheKey(schoolId, isoDate);
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached) as LunchMenu;
            console.log(`Lunch: cache hit for ${isoDate}`);
            return parsed;
        }
    } catch (e) { /* ignore cache errors */ }

    const apiUrl = `https://api.mealviewer.com/api/v4/school/${schoolId}/${dateStr}/${dateStr}/0`;

    try {
        let rawData: any = null;

        for (const proxyFn of LUNCH_PROXIES) {
            try {
                const res = await fetch(proxyFn(apiUrl), {
                    headers: { 'Accept': 'application/json' },
                    signal: AbortSignal.timeout(8000),
                });
                if (res.ok) {
                    rawData = await res.json();
                    break;
                }
            } catch (e) { continue; }
        }

        if (!rawData || !rawData.menuSchedules) {
            return { main: 'Unavailable', sides: [], date: date.toDateString() };
        }

        const entrees = new Set<string>();

        // Pass 1: Only search blocks that contain 'lunch' in the name
        rawData.menuSchedules.forEach((s: any) => {
            if (s.menuBlocks) s.menuBlocks.forEach((b: any) => {
                if (b.blockName?.toLowerCase().includes('lunch')) findAllEntrees(b, entrees);
            });
        });

        // Pass 2: If no entrees found, search ALL blocks (fallback)
        if (entrees.size === 0) {
            rawData.menuSchedules.forEach((s: any) => {
                if (s.menuBlocks) s.menuBlocks.forEach((b: any) => findAllEntrees(b, entrees));
            });
        }

        const entreeList = Array.from(entrees);
        const result: LunchMenu = entreeList.length > 0
            ? { main: entreeList[0], sides: entreeList.slice(1), date: date.toDateString() }
            : { main: 'Unavailable', sides: [], date: date.toDateString() };

        // Cache successful results (not "Unavailable")
        if (result.main !== 'Unavailable') {
            try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch (e) { /* ignore */ }
        }

        return result;
    } catch (e) {
        return { main: 'Unavailable', sides: [], date: date.toDateString() };
    }
};

// Keep CalendarEvent type usage for iCal parsing in calendar.ts
export type { CalendarEvent };
