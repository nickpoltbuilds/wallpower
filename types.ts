
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string; // ISO string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  location?: string;
  isAllDay?: boolean;
  rrule?: string;
}

export interface WeatherData {
  currentTemp: number;
  feelsLike?: number;
  condition: string;
  high: number;
  low: number;
  location: string;
  hourly: Array<{
    label: string;  // "Now", "3pm", "6pm" etc.
    temp: number;
  }>;
  // Index 0 = today, 1 = tomorrow, 2 = +2, 3 = +3
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
  isWeekend?: boolean;
}

export type Widget4Type = 'dadjoke' | 'onthisday' | 'trivia' | 'quote' | 'countdown';

export interface AppSettings {
  familyName: string;
  location: string;
  schoolName: string;
  schoolId: string;
  googleCalendarIcalUrl?: string;
  refreshInterval: number; // in minutes
  theme: 'dark' | 'light' | 'sunset';
  use24Hour: boolean;
  widget4?: Widget4Type;
  countdownLabel?: string;
  countdownDate?: string; // YYYY-MM-DD
}
