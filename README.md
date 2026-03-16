# Family Hub

A zero-configuration family dashboard designed to live on a wall-mounted tablet or always-on screen. Shows the weather, today's school lunch, your Google Calendar, and a daily dad joke — all in one glanceable view.

**No API keys required.** All data comes from free, public APIs.

---

## Features

- **Weather** — Current conditions, feels-like, hourly sparkline, and 3-day forecast via [Open-Meteo](https://open-meteo.com/)
- **School Lunch** — Today's menu from [MealViewer](https://www.mealviewer.com/), with food emoji matching and localStorage caching
- **4-Day Calendar** — Connects to any Google Calendar (or other iCal feed) via the secret iCal URL; handles recurring events, multi-day events, and color-coding by category
- **Dad Joke** — Rotates every 4 hours from [icanhazdadjoke.com](https://icanhazdadjoke.com/)
- **3 Themes** — Dark, Light, and Sunset; persisted across sessions
- **12/24-hour clock** — Configurable in Settings
- **Tablet-first layout** — Two-column widget grid on tablets, four-column on desktop; large readable text throughout
- **PWA-ready** — Add to home screen on iOS/Android for a full-screen kiosk experience

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [npm](https://www.npmjs.com/) 9 or later

### Run locally

```bash
git clone https://github.com/nickpoltbuilds/family-hub.git
cd family-hub
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Click the ⚙️ button (bottom-right corner) to configure your family name, location, school, and calendar.

### Build for production

```bash
npm run build       # outputs to dist/
npm run preview     # preview the production build locally
```

---

## Deploy to Vercel (recommended)

Vercel is the easiest deployment target because the included serverless function (`/api/lunch`) runs automatically — this proxies the MealViewer lunch API to avoid CORS restrictions.

1. Fork this repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your fork
3. Click **Deploy** — no environment variables needed

That's it. Vercel auto-detects the Vite + serverless setup.

### Other hosting options

The app is a static site and works on any host (Netlify, GitHub Pages, S3, etc.). The only caveat is the school lunch feature:

- The `/api/lunch` serverless function only runs on Vercel (or any platform that supports `@vercel/node`)
- Without it, the app falls back to three public CORS proxies (corsproxy.io → allorigins.win → thingproxy.freeboard.io)
- If you self-host on a server you control, you can add your own equivalent proxy endpoint

---

## Configuration

All settings are stored **on-device only** in `localStorage` — nothing is sent to any server.

Open the ⚙️ settings panel (bottom-right corner) to configure:

| Setting | Description |
|---------|-------------|
| **Family Name** | Displayed as the page title |
| **Location** | City used for weather (e.g. `Portland, OR`) |
| **Clock Format** | 12-hour or 24-hour |
| **Theme** | Dark, Light, or Sunset |
| **School Name** | Display label for the lunch widget |
| **MealViewer School ID** | Identifier used to fetch the lunch menu (see below) |
| **Refresh Interval** | How often weather & calendar auto-refresh |
| **Google Calendar iCal URL** | Secret iCal URL from Google Calendar (see below) |

### Finding your MealViewer School ID

MealViewer is used by thousands of US school districts. To find your school's ID:

1. Go to [schools.mealviewer.com](https://schools.mealviewer.com/)
2. Search for your school by name
3. Click on your school — the URL becomes `schools.mealviewer.com/school/{SCHOOL_ID}`
4. Copy that `SCHOOL_ID` value into Settings

If your school doesn't use MealViewer, the lunch widget will show "Menu unavailable."

### Connecting Google Calendar

1. Open [Google Calendar](https://calendar.google.com) on desktop
2. Click the **⋮** menu next to the calendar you want → **Settings and sharing**
3. Scroll to **Integrate calendar** → copy the **Secret address in iCal format** URL
4. Paste it into Settings → Google Calendar iCal URL

> **Note:** The "secret address" is a private link that lets anyone with it read your calendar. Treat it like a password. It is stored only on your device and never transmitted to any server.

Events are color-coded automatically by keyword:

| Color | Keywords matched |
|-------|-----------------|
| 🔵 Blue | school, class, work, meeting |
| 🟠 Orange | soccer, gym, practice, game, ballet, swim, tennis |
| 🟣 Purple | birthday, party, dinner, anniversary |
| 🔴 Red | trash, doctor, dentist, vet, appointment |
| 🟢 Green | everything else |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite 5](https://vitejs.dev/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) + CSS custom properties |
| Icons | [Lucide React](https://lucide.dev/) |
| Serverless | [Vercel Functions](https://vercel.com/docs/functions) (`/api/lunch`) |
| Weather | [Open-Meteo](https://open-meteo.com/) (no key required) |
| Geocoding | [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) + [Nominatim](https://nominatim.org/) fallback |
| Lunch | [MealViewer API](https://www.mealviewer.com/) (no key required) |
| Calendar | Custom iCal parser (no external library) |
| Jokes | [icanhazdadjoke.com](https://icanhazdadjoke.com/) (no key required) |

No database. No authentication. No build-time secrets.

---

## Browser Support

Modern browsers from 2020 onward. Tested on:

- Chrome / Edge 103+
- Safari 15+ / iOS 15+ (AbortSignal.timeout polyfill included for older devices)
- Firefox 103+

Internet Explorer is not supported.

---

## Security Notes

- **No API keys** are stored in the codebase or required at build time
- **All user settings** (family name, location, school ID, calendar URL) are stored in the user's browser `localStorage` only — they never leave the device
- **CORS proxies** are used as fallback for fetching the Google Calendar iCal feed and school lunch data. The proxies used are `corsproxy.io`, `allorigins.win`, and `thingproxy.freeboard.io`. These are third-party services; if you require full data privacy, deploy on Vercel (which handles lunch via its own serverless proxy) and use a self-hosted iCal proxy
- **School lunch data** is public information (school cafeteria menus), but your Google Calendar URL is a private secret link — treat it accordingly and don't share it

---

## Troubleshooting

### Lunch menu shows "Unavailable"
1. Verify your School ID is correct (check `schools.mealviewer.com/school/{YOUR_ID}` in a browser)
2. Some districts only post menus day-of — try refreshing after 7am
3. If your school is not in the MealViewer system, the feature won't work

### Google Calendar not loading
1. Make sure you copied the **Secret address** (iCal format), not the public HTML link
2. The URL should start with `https://calendar.google.com/calendar/ical/` and contain a long random token
3. Note that Google Calendar changes take up to 12 hours to appear in iCal feeds

### Weather not loading
1. Check that your location setting is a recognizable city name (e.g. `Austin, TX` not just `Austin`)
2. Open-Meteo is the primary source — no rate limits, no key needed. NOAA is the fallback (US only)

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

---

## License

[MIT](LICENSE) — free to use, modify, and deploy for personal or commercial purposes.
