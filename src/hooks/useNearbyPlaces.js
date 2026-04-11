import { useState, useEffect } from 'react'
import { fetchNearbyPlaces } from '../services/placesService'

export function useNearbyPlaces(lat, lng, radiusMetres = 500) {
  const [places, setPlaces] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lat || !lng) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchNearbyPlaces(lat, lng, radiusMetres)
      .then(data => { if (!cancelled) setPlaces(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [lat, lng, radiusMetres])

  return { places, loading, error }
}
