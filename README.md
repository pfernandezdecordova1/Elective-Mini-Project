# Weather Dashboard — Elective Mini Project

A weather dashboard built with vanilla HTML, CSS, and JavaScript that fetches real weather data from the free [Open-Meteo API](https://open-meteo.com) — no API key used. 

## Live Site
- https://pfernandezdecordova1.github.io/electiveminiproject


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
- I used `localStorage` to save the user's last city so it still shows up the next time they open the page. 