import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent, LunchMenu, WeatherData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Calendar AI ---

export const generateCalendarEvents = async (prompt: string, currentDate: string): Promise<CalendarEvent[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
        console.warn("Dad joke fetch failed:", e);
        return "I'm afraid for the calendar. Its days are numbered."; // Fallback joke
    }
};

// --- Weather Service (NOAA + Open-Meteo Failover) ---

// Helper to get Lat/Lon from City string
const getCoordinates = async (location: string) => {
    // Strategy 1: Nominatim (OpenStreetMap) - Best for "City, State" inputs
    try {
        // Nominatim requires a User-Agent
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'FamilyHub/1.0 (familyhub@example.com)' }
        });
        const data = await res.json();
        
        if (data && data.length > 0) {
            const result = data[0];
            // Extract city name from display_name for cleaner UI
            const displayName = result.display_name || location;
            const city = displayName.split(',')[0];
            return { 
                lat: parseFloat(result.lat), 
                lon: parseFloat(result.lon), 
                name: city, 
                admin1: '' 
            };
        }
    } catch (e) {
        console.warn("Nominatim geocoding failed, falling back to Open-Meteo:", e);
    }

    // Strategy 2: Open-Meteo (Fallback) - Best for simple City names
    try {
        // Open-Meteo struggles with "Silver Spring, MD". It prefers just "Silver Spring".
        // Clean the input: remove state if comma exists
        const cleanLocation = location.includes(',') ? location.split(',')[0].trim() : location;
        
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanLocation)}&count=1&language=en&format=json`);
        const data = await res.json();
        if (!data.results || data.results.length === 0) {
            console.warn("Geocoding failed: No results for", location);
            return null;
        }
        return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name, admin1: data.results[0].admin1 };
    } catch (e) {
        console.error("Geocoding API error:", e);
        return null;
    }
};

// NOAA Icon Mapper
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

// Open-Meteo Icon Mapper
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

const mapWmoCondition = (code: number): string => {
    const map: Record<number, string> = {
        0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Rime Fog', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
        56: 'Light Freezing Drizzle', 57: 'Freezing Drizzle', 61: 'Light Rain', 63: 'Rain', 
        65: 'Heavy Rain', 66: 'Light Freezing Rain', 67: 'Heavy Freezing Rain',
        71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
        80: 'Light Showers', 81: 'Showers', 82: 'Violent Showers',
        85: 'Snow Showers', 86: 'Heavy Snow Showers', 95: 'Thunderstorm', 
        96: 'Thunderstorm w/ Hail', 99: 'Heavy Thunderstorm'
    };
    return map[code] || 'Unknown';
};

export const fetchWeather = async (locationQuery: string): Promise<WeatherData | null> => {
    const coords = await getCoordinates(locationQuery);
    if (!coords) return null;

    const city = coords.name || locationQuery.split(',')[0];
    
    // --- Strategy 1: NOAA (via Proxy rotation) ---
    try {
        // Proxy rotation for NOAA because it's flaky with CORS and headers
        const proxies = [
            (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
            (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        ];

        let pointsData: any = null;
        let lastError: any = null;

        // Step 1: Get Grid Points
        for (const proxyFn of proxies) {
            try {
                const pointsUrl = proxyFn(`https://api.weather.gov/points/${coords.lat},${coords.lon}`);
                const res = await fetch(pointsUrl, {
                    headers: { 'User-Agent': 'FamilyHub/1.0 (familyhub@example.com)' }
                });
                if (!res.ok) throw new Error(`Points ${res.status}`);
                pointsData = await res.json();
                break; // Success
            } catch (e) {
                lastError = e;
                continue;
            }
        }

        if (!pointsData) throw lastError || new Error("All NOAA proxies failed for Points");
        
        // Step 2: Get Forecast (Daily) AND Hourly
        const forecastUrlRaw = pointsData.properties.forecast;
        const forecastHourlyUrlRaw = pointsData.properties.forecastHourly;

        let forecastData: any = null;
        let hourlyData: any = null;

        // Fetch Daily Forecast
        for (const proxyFn of proxies) {
            try {
                const forecastUrl = proxyFn(forecastUrlRaw);
                const res = await fetch(forecastUrl, {
                     headers: { 'User-Agent': 'FamilyHub/1.0 (familyhub@example.com)' }
                });
                if (!res.ok) throw new Error(`Forecast ${res.status}`);
                forecastData = await res.json();
                break;
            } catch (e) {
                continue;
            }
        }

        if (!forecastData) throw new Error("All NOAA proxies failed for Forecast");

        // Fetch Hourly Forecast (for accurate current temp)
        if (forecastHourlyUrlRaw) {
            for (const proxyFn of proxies) {
                try {
                    const hourlyUrl = proxyFn(forecastHourlyUrlRaw);
                    const res = await fetch(hourlyUrl, {
                         headers: { 'User-Agent': 'FamilyHub/1.0 (familyhub@example.com)' }
                    });
                    if (!res.ok) throw new Error(`Hourly ${res.status}`);
                    hourlyData = await res.json();
                    break;
                } catch (e) {
                    console.warn("Hourly forecast fetch failed:", e);
                    continue;
                }
            }
        }

        const periods = forecastData.properties.periods;
        if (!periods || periods.length === 0) throw new Error("No NOAA periods");

        console.log("Weather Source: NOAA");

        // Process NOAA Data
        // Use Hourly for current temp if available, otherwise fallback to first Daily period (which is High or Low)
        const currentPeriod = hourlyData?.properties?.periods?.[0] || periods[0];
        const currentTemp = currentPeriod.temperature;
        const currentCondition = currentPeriod.shortForecast;

        const dailyForecasts: any[] = [];
        const processedDays = new Set();

        for (const period of periods) {
            const date = new Date(period.startTime);
            const dayKey = date.toDateString(); 
            if (processedDays.has(dayKey)) continue;

            const dayPeriods = periods.filter((p: any) => new Date(p.startTime).toDateString() === dayKey);
            let high = -999, low = 999, icon = '';

            dayPeriods.forEach((p: any) => {
                if (p.isDaytime) {
                    high = p.temperature;
                    icon = mapNoaaIcon(p.icon);
                } else {
                    low = p.temperature;
                    if (!icon) icon = mapNoaaIcon(p.icon);
                }
            });

            if (high === -999) high = low; 
            if (low === 999) low = high;   

            dailyForecasts.push({
                day: date.toLocaleDateString('en-US', { weekday: 'long' }),
                icon: icon,
                high: high,
                low: low
            });
            processedDays.add(dayKey);
            if (dailyForecasts.length >= 3) break;
        }

        return {
            currentTemp: currentTemp,
            condition: currentCondition,
            high: dailyForecasts[0]?.high || periods[0].temperature,
            low: dailyForecasts[0]?.low || periods[0].temperature,
            location: city,
            forecast: dailyForecasts
        };

    } catch (noaaError) {
        console.warn("NOAA failed, switching to Open-Meteo fallback:", noaaError);
    }

    // --- Strategy 2: Open-Meteo (Fallback) ---
    try {
        console.log("Attempting Open-Meteo Fallback...");
        const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&foreground_days=4`;
        const res = await fetch(omUrl);
        if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
        const data = await res.json();

        console.log("Weather Source: Open-Meteo");

        const forecast = data.daily.time.slice(0, 3).map((t: string, i: number) => {
             const d = new Date(t + 'T00:00:00');
             return {
                day: d.toLocaleDateString('en-US', { weekday: 'long' }),
                icon: mapWmoCode(data.daily.weather_code[i]),
                high: data.daily.temperature_2m_max[i],
                low: data.daily.temperature_2m_min[i]
             };
        });

        return {
            currentTemp: data.current.temperature_2m,
            condition: mapWmoCondition(data.current.weather_code),
            high: data.daily.temperature_2m_max[0],
            low: data.daily.temperature_2m_min[0],
            location: city,
            forecast: forecast
        };
    } catch (omError) {
        console.error("All weather providers failed:", omError);
        return null;
    }
};


// --- School Lunch (MealViewer Robust Parsing) ---

// Recursive helper to find any object with item_Type = Entree
const findAllEntrees = (node: any, found: Set<string>) => {
    if (!node) return;

    if (Array.isArray(node)) {
        node.forEach(child => findAllEntrees(child, found));
        return;
    }

    if (typeof node === 'object') {
        // Check if current node is an Entree item
        // We look for "Entree" (case-insensitive) in item_Type
        if (node.item_Type && typeof node.item_Type === 'string' && node.item_Type.toLowerCase() === 'entree') {
            if (node.item_Name && typeof node.item_Name === 'string') {
                found.add(node.item_Name);
            }
        }
        
        // Continue recursion through all values of the object
        Object.values(node).forEach(child => findAllEntrees(child, found));
    }
};

export const fetchSchoolLunch = async (schoolName: string, schoolId?: string): Promise<LunchMenu> => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${month}-${day}-${year}`;
    
    if (!schoolId) return { main: 'Unavailable', sides: [], date: date.toDateString() };

    // Use "0" as blockId to get all blocks, we filter later/recursively
    const apiUrl = `https://api.mealviewer.com/api/v4/school/${schoolId}/${dateStr}/${dateStr}/0`;

    try {
        let rawData: any = null;
        let errors: string[] = [];

        // Strategy: Try robust proxy rotation
        const proxies = [
            // Proxy 1: CorsProxy.io (Often most reliable for this type of JSON)
            async (signal: AbortSignal) => {
                const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(apiUrl)}`, { signal });
                if (!res.ok) throw new Error(`CorsProxy ${res.status}`);
                return await res.json();
            },
            // Proxy 2: AllOrigins RAW (Direct JSON) with timestamp to bust cache
            async (signal: AbortSignal) => {
                const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}&t=${Date.now()}`, { signal });
                if (!res.ok) throw new Error(`AllOrigins ${res.status}`);
                return await res.json();
            },
            // Proxy 3: CodeTabs (Backup)
            async (signal: AbortSignal) => {
                const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`, { signal });
                if (!res.ok) throw new Error(`CodeTabs ${res.status}`);
                return await res.json();
            }
        ];

        for (const proxyAttempt of proxies) {
            try {
                const controller = new AbortController();
                // Increase timeout to 15 seconds for slow proxies
                const timeoutId = setTimeout(() => controller.abort(), 15000); 
                
                // Race the fetch vs timeout
                rawData = await Promise.race([
                    proxyAttempt(controller.signal),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 15000)
                    )
                ]);
                
                clearTimeout(timeoutId);
                if (rawData) break; 
            } catch (e: any) {
                errors.push(e.message || String(e));
                continue;
            }
        }

        if (!rawData) {
            console.error("All lunch proxies failed:", errors.join(', '));
            return { main: 'Unavailable', sides: [], date: date.toDateString() };
        }

        // STRICT Filtering: Only search for Entrees within LUNCH blocks
        // This prevents picking up "Breakfast Entrees" (like Pancakes)
        const entrees = new Set<string>();
        
        let lunchBlockFound = false;

        if (rawData.menuSchedules && Array.isArray(rawData.menuSchedules)) {
             rawData.menuSchedules.forEach((schedule: any) => {
                 // Only look into schedules that have menuBlocks
                 if (schedule.menuBlocks && Array.isArray(schedule.menuBlocks)) {
                     schedule.menuBlocks.forEach((block: any) => {
                         // Check if this is a Lunch block
                         const blockName = block.blockName ? block.blockName.toLowerCase() : '';
                         if (blockName.includes('lunch')) {
                             lunchBlockFound = true;
                             // Only search inside THIS block
                             findAllEntrees(block, entrees);
                         }
                     });
                 }
             });
        }

        // If structure was totally unexpected (no menuSchedules), fallback to full scan
        // but this is rare for MealViewer API.
        if (!lunchBlockFound && !entrees.size) {
            // Only fallback scan if we genuinely found nothing structured
             findAllEntrees(rawData, entrees);
        }

        const entreeList = Array.from(entrees);

        if (entreeList.length > 0) {
            return {
                main: entreeList[0],
                sides: entreeList.slice(1),
                date: date.toDateString()
            };
        } else {
            // If we got data but no entrees found, log for debugging
            console.warn("Data received but no entrees found in LUNCH block.");
            return { main: 'Unavailable', sides: [], date: date.toDateString() };
        }

    } catch (error) {
        console.error("Lunch API Error:", error);
        return { main: 'Unavailable', sides: [], date: date.toDateString() };
    }
};