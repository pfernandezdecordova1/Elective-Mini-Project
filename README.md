# Weather Dashboard — Elective Mini Project

A weather dashboard built with vanilla HTML, CSS, and JavaScript that fetches real weather data from the free [Open-Meteo API](https://open-meteo.com) — no API key required.

## Live Site

> Deploy to GitHub Pages and add the link here:  
> **https://your-username.github.io/Elective-Mini-Project/**

## Screenshot

> Add a screenshot after deploying.

---

## What the Dashboard Shows

| Feature | Details |
|---|---|
| **Current conditions** | Temperature, weather description + icon, humidity, wind speed, today's high/low |
| **7-day forecast** | Icon, description, high & low temperature for each day |
| **City search** | Type any city — geocoded via Open-Meteo's free Geocoding API |
| **Unit toggle** | Switch between °C and °F with one click |
| **Persistent city** | `localStorage` remembers your last searched city |
| **Weather themes** | Background gradient changes to match the current conditions (sunny, cloudy, rain, storm, snow, fog) |
| **Loading state** | Spinner shown while the API is loading |
| **Error handling** | Friendly error message + Retry button if the API fails or city is not found |

## API Used

**[Open-Meteo](https://open-meteo.com)**  
- No sign-up or API key required  
- Weather endpoint: `https://api.open-meteo.com/v1/forecast`  
- Geocoding endpoint: `https://geocoding-api.open-meteo.com/v1/search`

Fields used: `temperature_2m`, `wind_speed_10m`, `relative_humidity_2m`, `weather_code`, `temperature_2m_max`, `temperature_2m_min`

---

## What I Learned About Working with APIs

Working with this project taught me several key things about fetching and displaying API data:

- **`fetch()` and async/await**: The Fetch API returns a Promise, so you need `async/await` (or `.then()`) to handle the response without blocking the page. I learned how to `await` the fetch itself *and* the `.json()` call that parses the response body.
- **Understanding JSON structure**: I used the raw API URL in my browser first to see the exact shape of the response before writing any JavaScript. This made it much easier to target the right fields (e.g., `data.current.temperature_2m`).
- **Weather codes are just numbers**: Open-Meteo returns codes like `0`, `2`, `63` instead of text descriptions. I built a lookup object that maps each code to a human-readable description, an emoji icon, and a CSS theme class.
- **Geocoding**: To let users search by city name, I used a second API call to the Open-Meteo Geocoding endpoint, which returns coordinates and a timezone string — both needed for the weather request.
- **Error handling matters**: Network requests fail for many reasons. Wrapping calls in `try/catch` and showing a friendly UI message (with a Retry button) makes the app feel polished and safe to use.
- **`localStorage` for persistence**: Saving the user's last city to `localStorage` meant the dashboard feels personalized without any backend.

---

## Iteration Log

### Iteration 1 — Fetch and Display
**Goal:** Get data from the API and display it on the page.

- Created the HTML page with placeholder structure
- Wrote a `fetch()` call to Open-Meteo for Boston (hard-coded)
- Logged the response JSON to the console to understand its shape
- Displayed current temperature, humidity, and weather code on the page

**Learning:** The API response has two top-level keys — `current` (a flat object) and `daily` (parallel arrays indexed by day). The trickiest part was realizing `.json()` also returns a Promise, so it needs its own `await`.

---

### Iteration 2 — Design and Data
**Goal:** Make it look like a real weather app and show more data.

- Added the 7-day forecast grid (rendered from `daily.time`, `daily.temperature_2m_max/min`, `daily.weather_code`)
- Built the `WEATHER_INFO` lookup object — maps ~25 WMO codes to descriptions, emoji icons, and theme names
- Applied CSS custom properties (`--bg-start`, `--bg-end`, etc.) so a single class swap on `<body>` changes the entire color palette
- Styled with CSS Grid (forecast cards) and Flexbox (header, current conditions) with mobile-first media queries
- Showed the location name passed from the geocoding result

**Learning:** Mapping weather codes with a plain object is clean and fast. CSS custom properties (variables) swapped via a body class make theming effortless — changing just `--bg-start` and `--bg-end` is enough to give a completely different feel for sun vs. storm.

---

### Iteration 3 — Interactivity and Polish
**Goal:** Add user interaction and make it feel complete.

- **City search** — input + button calls the Geocoding API, then loads weather for the returned coordinates; `localStorage` saves the preference
- **°C / °F toggle** — re-renders all temperatures without a new network request
- **Loading spinner** — shown immediately on any fetch; hidden once data arrives
- **Error handling** — `try/catch` around every fetch; descriptive messages (e.g., "City not found") plus a Retry button
- **Responsive layout** — tested on mobile (375 px); search bar and forecast grid reflow cleanly
- **Hover lift effect** on forecast cards for interactivity feedback

**Learning:** Separating *fetching* from *rendering* (keeping raw °C data in `currentData` and re-running `renderWeather()` on unit toggle) avoided redundant API calls. Edge cases handled: invalid JSON in `localStorage`, geocoding returning zero results, HTTP errors from both APIs.

---

## File Structure

```
index.html   ← markup and layout
style.css    ← all styles including weather-based color themes
app.js       ← API calls, rendering logic, interactivity
README.md    ← this file
```

## How to Run Locally

Just open `index.html` in a browser — no build step or server required. The Fetch API calls are made to public HTTPS endpoints.
