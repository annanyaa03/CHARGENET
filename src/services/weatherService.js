// Open-Meteo — completely free, no API key required
// Docs: https://open-meteo.com/en/docs

const CACHE_DURATION_MS = 30 * 60 * 1000 // 30 minutes

const WMO_CODES = {
  0: { label: 'Clear Sky', emoji: '☀️' },
  1: { label: 'Mainly Clear', emoji: '🌤️' },
  2: { label: 'Partly Cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Foggy', emoji: '🌫️' },
  48: { label: 'Foggy', emoji: '🌫️' },
  51: { label: 'Light Drizzle', emoji: '🌦️' },
  53: { label: 'Drizzle', emoji: '🌦️' },
  55: { label: 'Heavy Drizzle', emoji: '🌧️' },
  61: { label: 'Light Rain', emoji: '🌧️' },
  63: { label: 'Rain', emoji: '🌧️' },
  65: { label: 'Heavy Rain', emoji: '🌧️' },
  71: { label: 'Light Snow', emoji: '🌨️' },
  73: { label: 'Snow', emoji: '❄️' },
  80: { label: 'Rain Showers', emoji: '🌦️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
}

function getCacheKey(lat, lng) {
  return `weather_${lat.toFixed(2)}_${lng.toFixed(2)}`
}

function getFromCache(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_DURATION_MS) {
      sessionStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch (err) {
    // Session storage may be blocked; ignore
  }
}

export async function fetchWeather(lat, lng) {
  const key = getCacheKey(lat, lng)
  const cached = getFromCache(key)
  if (cached) return cached

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&wind_speed_unit=kmh&timezone=Asia%2FKolkata`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather fetch failed')
  const json = await res.json()

  const c = json.current
  const wmo = WMO_CODES[c.weather_code] || { label: 'Unknown', emoji: '🌡️' }
  const data = {
    temp: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    windKmh: Math.round(c.wind_speed_10m),
    weatherCode: c.weather_code,
    weatherLabel: wmo.label,
    weatherEmoji: wmo.emoji,
  }

  setCache(key, data)
  return data
}

export async function fetchAirQuality(lat, lng) {
  const key = `aqi_${lat.toFixed(2)}_${lng.toFixed(2)}`
  const cached = getFromCache(key)
  if (cached) return cached

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm2_5,european_aqi`

  const res = await fetch(url)
  if (!res.ok) throw new Error('AQI fetch failed')
  const json = await res.json()

  const aqi = json.current?.european_aqi ?? null
  const pm25 = json.current?.pm2_5 ?? null

  let aqiLabel = 'Unknown'
  let aqiColor = '#6B7280'
  if (aqi !== null) {
    if (aqi <= 20) { aqiLabel = 'Good'; aqiColor = '#10B981' }
    else if (aqi <= 40) { aqiLabel = 'Fair'; aqiColor = '#84CC16' }
    else if (aqi <= 60) { aqiLabel = 'Moderate'; aqiColor = '#F59E0B' }
    else if (aqi <= 80) { aqiLabel = 'Poor'; aqiColor = '#F97316' }
    else { aqiLabel = 'Very Poor'; aqiColor = '#EF4444' }
  }

  const data = { aqi, pm25, aqiLabel, aqiColor }
  setCache(key, data)
  return data
}
