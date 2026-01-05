
import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent, LunchMenu, WeatherData } from "../types";

// --- Calendar AI ---

export const generateCalendarEvents = async (prompt: string, currentDate: string): Promise<CalendarEvent[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Current date is ${currentDate}. Extract calendar events from this text: "${prompt}". 
      Assign a color (blue, green, purple, orange, red) based on the type of activity (e.g. sports=orange, school=blue, party=purple).
      Return a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              start: { type: Type.STRING, description: "ISO 8601 Date String" },
              end: { type: Type.STRING, description: "ISO 8601 Date String" },
              color: { type: Type.STRING, enum: ['blue', 'green', 'purple', 'orange', 'red'] },
              location: { type: Type.STRING }
            },
            required: ["title", "start", "end", "color", "id"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Gemini Calendar Error:", error);
    return [];
  }
};

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

// --- Weather Service (Open-Meteo Geocoding First) ---

const getCoordinates = async (location: string) => {
    // Priority: Open-Meteo Geocoder (Less restrictive)
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

    // Fallback: Nominatim
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
                    dailyForecasts.push({
                        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
                        icon: icon, high: high, low: low
                    });
                    processedDays.add(dayKey);
                    if (dailyForecasts.length >= 3) break;
                }

                return {
                    currentTemp,
                    condition: currentCondition,
                    high: dailyForecasts[0]?.high || currentTemp,
                    low: dailyForecasts[0]?.low || currentTemp,
                    location: city,
                    forecast: dailyForecasts
                };
            }
        }
    } catch (noaaError) {
        console.warn("NOAA failed.");
    }

    try {
        const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&foreground_days=4`;
        const res = await fetch(omUrl);
        const data = await res.json();
        const forecast = data.daily.time.slice(0, 3).map((t: string, i: number) => ({
            day: new Date(t + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
            icon: mapWmoCode(data.daily.weather_code[i]),
            high: data.daily.temperature_2m_max[i],
            low: data.daily.temperature_2m_min[i]
        }));
        return {
            currentTemp: data.current.temperature_2m,
            condition: "Varies",
            high: data.daily.temperature_2m_max[0],
            low: data.daily.temperature_2m_min[0],
            location: city,
            forecast: forecast
        };
    } catch (e) {
        return null;
    }
};

const findAllEntrees = (node: any, found: Set<string>) => {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(child => findAllEntrees(child, found)); return; }
    if (typeof node === 'object') {
        if (node.item_Type && node.item_Type.toLowerCase() === 'entree' && node.item_Name) found.add(node.item_Name);
        Object.values(node).forEach(child => findAllEntrees(child, found));
    }
};

export const fetchSchoolLunch = async (schoolName: string, schoolId?: string): Promise<LunchMenu> => {
    const date = new Date();
    const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
    if (!schoolId) return { main: 'Unavailable', sides: [], date: date.toDateString() };
    const apiUrl = `https://api.mealviewer.com/api/v4/school/${schoolId}/${dateStr}/${dateStr}/0`;
    try {
        let rawData: any = null;
        const proxies = [
            (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
            (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        ];
        for (const p of proxies) {
            try {
                const res = await fetch(p(apiUrl));
                if (res.ok) { rawData = await res.json(); break; }
            } catch (e) { continue; }
        }
        if (!rawData) return { main: 'Unavailable', sides: [], date: date.toDateString() };
        const entrees = new Set<string>();
        if (rawData.menuSchedules) {
            rawData.menuSchedules.forEach((s: any) => {
                if (s.menuBlocks) s.menuBlocks.forEach((b: any) => {
                    if (b.blockName?.toLowerCase().includes('lunch')) findAllEntrees(b, entrees);
                });
            });
        }
        const entreeList = Array.from(entrees);
        return entreeList.length > 0 ? { main: entreeList[0], sides: entreeList.slice(1), date: date.toDateString() } : { main: 'Unavailable', sides: [], date: date.toDateString() };
    } catch (e) { return { main: 'Unavailable', sides: [], date: date.toDateString() }; }
};
