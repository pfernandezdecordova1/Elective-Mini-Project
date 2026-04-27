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

function getUVLabel(uv) {
  if (uv <= 2)  return { label: 'Low',       color: '#a9e34b' };
  if (uv <= 5)  return { label: 'Moderate',  color: '#ffd43b' };
  if (uv <= 7)  return { label: 'High',      color: '#ffa94d' };
  if (uv <= 10) return { label: 'Very High', color: '#ff6b6b' };
  return              { label: 'Extreme',   color: '#cc5de8' };
}

function getWeatherTip(code, humidity, windSpeed) {
  if ([95, 96, 99].includes(code)) return 'Thunderstorm expected — stay indoors and avoid open areas.';
  if ([65, 82].includes(code))     return 'Heavy rain today — bring a waterproof jacket! ☔';
  if ([61, 63, 51, 53, 55, 80, 81].includes(code)) return 'Rain expected — don\'t forget your umbrella! 🌂';
  if ([71, 73, 75, 85, 86].includes(code)) return 'Snow is falling — drive carefully and layer up! ❄️';
  if ([56, 57, 66, 67].includes(code)) return 'Freezing rain — watch out for icy surfaces! 🧊';
  if ([45, 48].includes(code)) return 'Foggy conditions — reduce speed if driving. 🌫️';
  if (windSpeed > 40)  return 'Very windy outside — secure loose objects. 💨';
  if (humidity > 85)   return 'High humidity today — it may feel hotter than it is. 💧';
  if ([0, 1].includes(code)) return 'Beautiful clear sky — great day to go outside! ☀️';
  if ([2, 3].includes(code)) return 'Cloudy skies today — a light layer might help. 🧥';
  return 'Have a great day! 🌈';
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
  startParticles(theme);
}

// ── Canvas Particle System ────────────────────────────────────────────────────
const canvas = $('weather-canvas');
const ctx    = canvas.getContext('2d');
let particles   = [];
let animFrameId = null;
let activeTheme = '';

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function stopParticles() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  particles = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function startParticles(theme) {
  stopParticles();
  activeTheme = theme;

  if (theme === 'rain' || theme === 'storm') {
    const count = theme === 'storm' ? 180 : 100;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len:   Math.random() * 20 + 10,
        speed: Math.random() * 8 + 10,
        opacity: Math.random() * 0.4 + 0.2,
      });
    }
    animFrameId = requestAnimationFrame(drawRain);

    if (theme === 'storm') scheduleLightning();
  }

  if (theme === 'snow') {
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r:     Math.random() * 4 + 1,
        speed: Math.random() * 1.2 + 0.3,
        drift: (Math.random() - 0.5) * 0.6,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
    animFrameId = requestAnimationFrame(drawSnow);
  }

  if (theme === 'fog') {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        w: Math.random() * 400 + 200,
        h: Math.random() * 80 + 40,
        speed: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.07 + 0.03,
      });
    }
    animFrameId = requestAnimationFrame(drawFog);
  }

  if (theme === 'sunny') {
    animFrameId = requestAnimationFrame(drawSunRays);
  }
}

function drawRain() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.strokeStyle = 'rgba(180,210,255,1)';
  ctx.lineWidth   = 1;
  for (const p of particles) {
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - 2, p.y + p.len);
    ctx.stroke();
    p.y += p.speed;
    p.x -= 1;
    if (p.y > canvas.height) {
      p.y = -p.len;
      p.x = Math.random() * canvas.width;
    }
  }
  ctx.restore();
  if (activeTheme === 'rain' || activeTheme === 'storm') {
    animFrameId = requestAnimationFrame(drawRain);
  }
}

let lastLightning = 0;
function scheduleLightning() {
  if (activeTheme !== 'storm') return;
  const delay = Math.random() * 5000 + 2000;
  setTimeout(() => {
    if (activeTheme !== 'storm') return;
    flashLightning();
    scheduleLightning();
  }, delay);
}

function flashLightning() {
  const x = Math.random() * canvas.width;
  let alpha = 0.7;
  const fade = () => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#fffde7';
    ctx.lineWidth   = 2;
    ctx.shadowColor = '#fff';
    ctx.shadowBlur  = 20;
    ctx.beginPath();
    let cx = x, cy = 0;
    ctx.moveTo(cx, cy);
    while (cy < canvas.height * 0.6) {
      cx += (Math.random() - 0.5) * 60;
      cy += Math.random() * 80 + 30;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.restore();
    alpha -= 0.08;
    if (alpha > 0) requestAnimationFrame(fade);
  };
  requestAnimationFrame(fade);
}

function drawSnow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  for (const p of particles) {
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle   = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    p.y += p.speed;
    p.x += p.drift;
    if (p.y > canvas.height) {
      p.y = -p.r;
      p.x = Math.random() * canvas.width;
    }
    if (p.x > canvas.width)  p.x = 0;
    if (p.x < 0)              p.x = canvas.width;
  }
  ctx.restore();
  if (activeTheme === 'snow') {
    animFrameId = requestAnimationFrame(drawSnow);
  }
}

function drawFog() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  for (const p of particles) {
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.w / 2);
    grad.addColorStop(0, `rgba(200,210,220,${p.opacity})`);
    grad.addColorStop(1, 'rgba(200,210,220,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.speed;
    if (p.x > canvas.width + p.w / 2)  p.x = -p.w / 2;
    if (p.x < -p.w / 2)                p.x = canvas.width + p.w / 2;
  }
  ctx.restore();
  if (activeTheme === 'fog') {
    animFrameId = requestAnimationFrame(drawFog);
  }
}

let sunAngle = 0;
function drawSunRays() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  const cx = canvas.width * 0.85;
  const cy = canvas.height * 0.12;
  const numRays = 12;
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2 + sunAngle;
    const x1    = cx + Math.cos(angle) * 60;
    const y1    = cy + Math.sin(angle) * 60;
    const x2    = cx + Math.cos(angle) * 140;
    const y2    = cy + Math.sin(angle) * 140;
    const grad  = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, 'rgba(255,230,100,0.18)');
    grad.addColorStop(1, 'rgba(255,230,100,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 8;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();
  sunAngle += 0.003;
  if (activeTheme === 'sunny') {
    animFrameId = requestAnimationFrame(drawSunRays);
  }
}

function renderWeather() {
  if (!currentData) return;

  const { current, daily, hourly } = currentData;
  const info = getWeatherInfo(current.weather_code);

  applyTheme(info.theme);

  // ── Tip banner
  const tip = getWeatherTip(current.weather_code, current.relative_humidity_2m, current.wind_speed_10m);
  $('tip-text').textContent = tip;
  $('weather-tip').classList.remove('hidden');

  $('city-name').textContent    = currentCityName;
  $('last-updated').textContent = `Updated ${getTimeLabel()}`;
  $('current-desc').textContent = info.desc;
  $('current-temp').textContent = formatTemp(current.temperature_2m);
  $('current-high').textContent = formatTemp(daily.temperature_2m_max[0]);
  $('current-low').textContent  = formatTemp(daily.temperature_2m_min[0]);
  $('current-humidity').textContent = `${current.relative_humidity_2m}%`;
  $('current-wind').textContent  = `${Math.round(current.wind_speed_10m)} km/h`;
  $('detail-high').textContent   = formatTemp(daily.temperature_2m_max[0]);
  $('detail-low').textContent    = formatTemp(daily.temperature_2m_min[0]);
  $('feels-like').textContent    = formatTemp(current.apparent_temperature);

  const uv      = Math.round(daily.uv_index_max[0]);
  const uvInfo  = getUVLabel(uv);
  $('uv-index').textContent      = uv;
  const uvSpan = $('uv-label');
  uvSpan.textContent             = uvInfo.label;
  uvSpan.style.color             = uvInfo.color;

  // ── Sunrise / Sunset
  const sunriseStr = daily.sunrise[0];  // "YYYY-MM-DDTHH:MM"
  const sunsetStr  = daily.sunset[0];
  const sunrise    = new Date(sunriseStr);
  const sunset     = new Date(sunsetStr);
  const fmt        = { hour: 'numeric', minute: '2-digit' };
  $('sunrise-time').textContent = sunrise.toLocaleTimeString('en-US', fmt);
  $('sunset-time').textContent  = sunset.toLocaleTimeString('en-US', fmt);

  const daylightMs  = sunset - sunrise;
  const daylightH   = Math.floor(daylightMs / 3_600_000);
  const daylightM   = Math.floor((daylightMs % 3_600_000) / 60_000);
  $('daylight-duration').textContent = `${daylightH}h ${daylightM}m of daylight`;

  const now          = new Date();
  const totalMs      = sunset - sunrise;
  const elapsedMs    = Math.max(0, Math.min(now - sunrise, totalMs));
  const progress     = elapsedMs / totalMs;   // 0..1
  const arcLen       = 283;  // approx full arc length
  $('arc-fill').style.strokeDasharray  = arcLen;
  $('arc-fill').style.strokeDashoffset = arcLen * (1 - Math.min(progress, 1));

  // Position sun dot on arc
  const angle    = Math.PI * progress;   // 0 = left, PI = right
  const cx       = 10 + 180 * progress;
  const arcR     = 90;
  const centerX  = 100;
  const centerY  = 100;
  const dotX     = centerX + arcR * Math.cos(Math.PI - angle);
  const dotY     = centerY - arcR * Math.sin(angle);
  $('sun-dot').setAttribute('cx', dotX.toFixed(1));
  $('sun-dot').setAttribute('cy', dotY.toFixed(1));

  // ── Hourly forecast (next 24 slots from current hour)
  const hourlyContainer = $('hourly-container');
  hourlyContainer.innerHTML = '';
  const times  = hourly.time;
  const hTemps = hourly.temperature_2m;
  const hCodes = hourly.weather_code;

  const nowHour   = new Date();
  nowHour.setMinutes(0, 0, 0);
  const nowIso    = nowHour.toISOString().slice(0, 16);
  let startIdx    = times.findIndex(t => t >= nowIso);
  if (startIdx === -1) startIdx = 0;

  for (let i = startIdx; i < Math.min(startIdx + 25, times.length); i++) {
    const hInfo  = getWeatherInfo(hCodes[i]);
    const hDate  = new Date(times[i]);
    const isNow  = i === startIdx;
    const hLabel = isNow ? 'Now' : hDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    const card   = document.createElement('div');
    card.className = 'hourly-card' + (isNow ? ' now' : '');
    card.innerHTML = `
      <span class="hourly-time">${hLabel}</span>
      <span class="hourly-emoji">${hInfo.icon}</span>
      <span class="hourly-temp">${formatTemp(hTemps[i])}</span>
    `;
    hourlyContainer.appendChild(card);
  }

  $('weather-illustration').textContent = info.icon;

  const container = $('forecast-container');
  container.innerHTML = '';

  for (let i = 1; i < daily.time.length; i++) {
    const dayInfo = getWeatherInfo(daily.weather_code[i]);
    const card    = document.createElement('div');
    card.className = 'forecast-card';
    card.style.animationDelay = `${i * 0.06}s`;
    card.innerHTML = `
      <div class="forecast-day">${getDayLabel(daily.time[i])}</div>
      <div class="forecast-emoji">${dayInfo.icon}</div>
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
    latitude:      lat,
    longitude:     lon,
    timezone:      timezone,
    forecast_days: 8,
    current:  'temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code,apparent_temperature',
    daily:    'temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,uv_index_max',
    hourly:   'temperature_2m,weather_code',
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
    const data      = await fetchWeatherData(lat, lon, timezone);
    currentData     = data;
    currentCityName = cityName;
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
  currentUnit = currentUnit === 'C' ? 'F' : 'C';
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
