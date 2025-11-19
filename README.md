# FamilyHub AI Dashboard 🏠

Welcome to your new intelligent family dashboard! This web application is designed to run on an iPad or tablet mounted on your kitchen wall.

---

## 🌟 Key Features

1.  **Always-On Clock:** A large, clear display of the current time.
2.  **AI Weather Agent:** Finds the forecast for your location automatically.
3.  **Smart School Lunch:** Fetches today's menu directly from MealViewer schools.
4.  **Dual-Mode Calendar:**
    *   **Local Mode:** Add events by voice/typing (e.g., "Soccer tomorrow at 5").
    *   **Google Sync:** Connect to your real Google Calendar securely.

---

## ⚙️ How to Configure

Click the **Gear Icon (⚙️)** in the top-right to open Settings.

### 1. 📅 Google Calendar Setup (Secure)
This method keeps your calendar private but allows the dashboard to read it.

1.  Go to **calendar.google.com** on a computer.
2.  Click the **Gear Icon** (top right) > **Settings**.
3.  On the left sidebar, click the name of the calendar you want to sync (e.g., "Family").
4.  Scroll all the way down to the section **"Integrate calendar"**.
5.  Look for the field: **Secret address in iCal format**.
    *   *Warning:* Do not share this link with others.
6.  Copy that full URL (it ends in `.ics`).
7.  Paste it into the **"Secret Address"** field in the dashboard settings.

### 2. 🍎 School Lunch
1.  **School Name:** Enter the name (e.g., "East Silver Spring ES").
2.  **School ID:** Enter the ID found in your school's MealViewer URL.
    *   *Example:* `https://schools.mealviewer.com/school/EastSilverSpringES` -> ID is `EastSilverSpringES`.

---

## ❓ Troubleshooting

### "No menu found"
1.  Check the School ID.
2.  Click the link to view online to confirm the school has posted a menu for today.

### "Google Calendar not loading"
1.  Double-check you copied the **Secret Address** and not the Public Address.
2.  The Secret Address should start with `https://calendar.google.com/calendar/ical/...` and contain a long random code.