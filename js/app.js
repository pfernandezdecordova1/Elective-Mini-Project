const DEFAULT_CITY     = 'Boston';
const DEFAULT_LAT      = 42.36;
const DEFAULT_LON      = -71.06;
const DEFAULT_TIMEZONE = 'America/New_York';

const WEATHER_API   = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

let currentUnit     = 'C';
let currentData     = null;
let currentCityName = '';

const WEATHER_INFO = {
  0:  { desc: 'Clear Sky',               icon: '☀️',  theme: 'sunny'  },
  1:  { desc: 'Mainly Clear',            icon: '🌤️', theme: 'sunny'  },
  2:  { desc: 'Partly Cloudy',           icon: '⛅',  theme: 'cloudy' },
  3:  { desc: 'Overcast',                icon: '☁️',  theme: 'cloudy' },
  45: { desc: 'Foggy',                   icon: '🌫️', theme: 'fog'    },
  48: { desc: 'Icy Fog',                 icon: '🌫️', theme: 'fog'    },
  51: { desc: 'Light Drizzle',           icon: '🌦️', theme: 'rain'   },
  53: { desc: 'Drizzle',                 icon: '🌦️', theme: 'rain'   },
  55: { desc: 'Heavy Drizzle',           icon: '🌧️', theme: 'rain'   },
  56: { desc: 'Freezing Drizzle',        icon: '🌨️', theme: 'snow'   },
  57: { desc: 'Heavy Freezing Drizzle',  icon: '🌨️', theme: 'snow'   },
  61: { desc: 'Light Rain',              icon: '🌧️', theme: 'rain'   },
  63: { desc: 'Rain',                    icon: '🌧️', theme: 'rain'   },
  65: { desc: 'Heavy Rain',              icon: '🌧️', theme: 'rain'   },
  66: { desc: 'Light Freezing Rain',     icon: '🌨️', theme: 'snow'   },
  67: { desc: 'Freezing Rain',           icon: '🌨️', theme: 'snow'   },
  71: { desc: 'Light Snow',              icon: '🌨️', theme: 'snow'   },
  73: { desc: 'Snow',                    icon: '❄️',  theme: 'snow'   },
  75: { desc: 'Heavy Snow',              icon: '❄️',  theme: 'snow'   },
  77: { desc: 'Snow Grains',             icon: '🌨️', theme: 'snow'   },
  80: { desc: 'Light Showers',           icon: '🌦️', theme: 'rain'   },
  81: { desc: 'Showers',                 icon: '🌧️', theme: 'rain'   },
  82: { desc: 'Heavy Showers',           icon: '⛈️',  theme: 'storm'  },
  85: { desc: 'Light Snow Showers',      icon: '🌨️', theme: 'snow'   },
  86: { desc: 'Heavy Snow Showers',      icon: '❄️',  theme: 'snow'   },
  95: { desc: 'Thunderstorm',            icon: '⛈️',  theme: 'storm'  },
  96: { desc: 'Thunderstorm + Hail',     icon: '⛈️',  theme: 'storm'  },
  99: { desc: 'Severe Thunderstorm',     icon: '⛈️',  theme: 'storm'  },
};

function getWeatherInfo(code) {
  return WEATHER_INFO[code] ?? { desc: 'Unknown', icon: '🌡️', theme: 'clear' };
}

function toFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

function formatTemp(tempC) {
  if (currentUnit === 'F') {
    return `${Math.round(toFahrenheit(tempC))}°F`;
  }
  return `${Math.round(tempC)}°C`;
}

function getDayLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date  = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date - today) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function getTimeLabel() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const $ = (id) => document.getElementById(id);

function showLoading() {
  $('loading').classList.remove('hidden');
  $('error').classList.add('hidden');
  $('weather-content').classList.add('hidden');
}

function showError(msg) {
  $('loading').classList.add('hidden');
  $('error-message').textContent = msg;
  $('error').classList.remove('hidden');
  $('weather-content').classList.add('hidden');
}

function showContent() {
  $('loading').classList.add('hidden');
  $('error').classList.add('hidden');
  $('weather-content').classList.remove('hidden');
}

function applyTheme(theme) {
  document.body.className = document.body.className
    .split(' ')
    .filter((c) => !c.startsWith('theme-'))
    .join(' ')
    .trim();
  document.body.classList.add(`theme-${theme}`);
}

function renderWeather() {
  if (!currentData) return;

  const { current, daily } = currentData;
  const info = getWeatherInfo(current.weather_code);

  applyTheme(info.theme);

  $('city-name').textContent     = currentCityName;
  $('last-updated').textContent  = `Updated ${getTimeLabel()}`;
  $('current-icon').textContent  = info.icon;
  $('current-desc').textContent  = info.desc;
  $('current-temp').textContent  = formatTemp(current.temperature_2m);
  $('current-high').textContent  = formatTemp(daily.temperature_2m_max[0]);
  $('current-low').textContent   = formatTemp(daily.temperature_2m_min[0]);
  $('current-humidity').textContent = `${current.relative_humidity_2m}%`;
  $('current-wind').textContent  = `${Math.round(current.wind_speed_10m)} km/h`;
  $('detail-high').textContent   = formatTemp(daily.temperature_2m_max[0]);
  $('detail-low').textContent    = formatTemp(daily.temperature_2m_min[0]);

  const container = $('forecast-container');
  container.innerHTML = '';

  for (let i = 1; i < daily.time.length; i++) {
    const dayInfo = getWeatherInfo(daily.weather_code[i]);
    const card    = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <div class="forecast-day">${getDayLabel(daily.time[i])}</div>
      <div class="forecast-icon">${dayInfo.icon}</div>
      <div class="forecast-desc">${dayInfo.desc}</div>
      <div class="forecast-temps">
        <span class="forecast-high">${formatTemp(daily.temperature_2m_max[i])}</span>
        <span class="forecast-low">${formatTemp(daily.temperature_2m_min[i])}</span>
      </div>
    `;
    container.appendChild(card);
  }

  showContent();
}

async function fetchWeatherData(lat, lon, timezone) {
  const params = new URLSearchParams({
    latitude:   lat,
    longitude:  lon,
    timezone:   timezone,
    forecast_days: 8,
    current:    'temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code',
    daily:      'temperature_2m_max,temperature_2m_min,weather_code',
  });
  const res = await fetch(`${WEATHER_API}?${params}`);
  if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
  return res.json();
}

async function fetchGeocode(city) {
  const params = new URLSearchParams({
    name:     city,
    count:    1,
    language: 'en',
    format:   'json',
  });
  const res = await fetch(`${GEOCODING_API}?${params}`);
  if (!res.ok) throw new Error(`Geocoding API returned ${res.status}`);
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${city}" not found. Try a different name.`);
  }
  return data.results[0];
}

async function loadWeather(cityName, lat, lon, timezone) {
  showLoading();
  try {
    const data        = await fetchWeatherData(lat, lon, timezone);
    currentData       = data;
    currentCityName   = cityName;
    localStorage.setItem(
      'weatherPreference',
      JSON.stringify({ cityName, lat, lon, timezone })
    );
    renderWeather();
  } catch (err) {
    showError(err.message || 'Failed to load weather data. Please try again.');
  }
}

async function handleSearch() {
  const input    = $('search-input');
  const cityName = input.value.trim();
  if (!cityName) return;

  showLoading();
  try {
    const loc         = await fetchGeocode(cityName);
    const displayName = [loc.name, loc.admin1, loc.country]
      .filter(Boolean)
      .join(', ');
    await loadWeather(
      displayName,
      loc.latitude,
      loc.longitude,
      loc.timezone || 'auto'
    );
    input.value = '';
  } catch (err) {
    showError(err.message || 'Could not find that city. Please try again.');
  }
}

function toggleUnit() {
  currentUnit        = currentUnit === 'C' ? 'F' : 'C';
  $('unit-toggle').textContent = currentUnit === 'C' ? '°F' : '°C';
  renderWeather();
}

$('search-btn').addEventListener('click', handleSearch);
$('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});
$('unit-toggle').addEventListener('click', toggleUnit);
$('retry-btn').addEventListener('click', () => {
  const saved = localStorage.getItem('weatherPreference');
  if (saved) {
    try {
      const { cityName, lat, lon, timezone } = JSON.parse(saved);
      loadWeather(cityName, lat, lon, timezone);
      return;
    } catch {
    }
  }
  loadWeather(DEFAULT_CITY, DEFAULT_LAT, DEFAULT_LON, DEFAULT_TIMEZONE);
});

(function init() {
  const saved = localStorage.getItem('weatherPreference');
  if (saved) {
    try {
      const { cityName, lat, lon, timezone } = JSON.parse(saved);
      loadWeather(cityName, lat, lon, timezone);
      return;
    } catch {
      localStorage.removeItem('weatherPreference');
    }
  }
  loadWeather(DEFAULT_CITY, DEFAULT_LAT, DEFAULT_LON, DEFAULT_TIMEZONE);
})();
