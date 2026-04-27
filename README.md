# Weather Dashboard — Elective Mini Project

A weather dashboard built with vanilla HTML, CSS, and JavaScript that fetches real weather data from the free [Open-Meteo API](https://open-meteo.com) — no API key used. 

## Live Site
- https://pfernandezdecordova1.github.io/ElectiveMiniProject


## What the Dashboard Shows

The dashboard shows current conditions (temperature, weather description + icon, humidity, wind speed, and today's high/low) along with a 7-day forecast displaying an icon, description, and high & low temperature for each day. Users can search for any city, which is geocoded via Open-Meteo's free Geocoding API, and toggle between °C and °F with one click. The last searched city is saved with localStorage. The background gradient changes to match current conditions (sunny, cloudy, rain, storm, snow, or fog), a spinner is shown while data loads, and a friendly error message with a Retry button appears if the API fails or a city is not found.


## What I Learned About Working with APIs

- `fetch()` is how JavaScript talks to an API — it sends a request and waits for data to come back
- You need `async/await` so the page doesn't freeze while waiting for the API response
- API data comes back as JSON, which looks like a JavaScript object — you have to call `.json()` to actually read it
- I pasted the API URL into my browser first to see what the data looked like before writing any code
- The weather API gives back a number (called a weather code) instead of words like "sunny" — I had to build my own lookup to turn those numbers into descriptions and icons
- To let users search by city name, I had to make a second API call to convert the city name into coordinates
- I wrapped all my API calls in `try/catch` so that if something goes wrong, the app shows a friendly error message instead of just breaking
- I used `localStorage` to save the user's last city so it still shows up the next time they open the page

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
