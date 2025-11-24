
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string; // ISO string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  location?: string;
  isAllDay?: boolean;
  rrule?: string; // Recurrence Rule string
}

export interface WeatherData {
  currentTemp: number;
  condition: string;
  high: number;
  low: number;
  location: string;
  forecast: Array<{
    day: string;
    icon: string;
    high: number;
    low: number;
  }>;
}

export interface LunchMenu {
  main: string;
  sides: string[];
  date: string;
}

export interface AppSettings {
  familyName: string;
  location: string;
  schoolName: string;
  schoolId: string;
  googleCalendarIcalUrl?: string;
  refreshInterval: number; // in minutes
  theme: 'dark' | 'light' | 'trek' | 'forest' | 'cyber';
}
