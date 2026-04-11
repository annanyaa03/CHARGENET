import { useState, useEffect } from 'react'
import { fetchWeather, fetchAirQuality } from '../services/weatherService'

export function useWeather(lat, lng) {
  const [weather, setWeather] = useState(null)
  const [aqi, setAqi] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lat || !lng) return

    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([fetchWeather(lat, lng), fetchAirQuality(lat, lng)])
      .then(([weatherData, aqiData]) => {
        if (!cancelled) {
          setWeather(weatherData)
          setAqi(aqiData)
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [lat, lng])

  return { weather, aqi, loading, error }
}
