import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Coffee, Utensils, TreePine, Building2, Store, ShoppingBag,
  MapPin, AlertTriangle
} from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { getStationById } from '../services/stationService'
import { useAuthStore } from '../store/authStore'
import { useWeather } from '../hooks/useWeather'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

/* ─── Helpers ─────────────────────────────────────────────────── */

const formatAddress = (station) => {
  if (!station) return ''
  const addr = station.address || ''
  const city = station.city || ''
  const state = station.state || ''
  
  const hasCity = addr.toLowerCase().includes(city.toLowerCase())
  const hasState = addr.toLowerCase().includes(state.toLowerCase())
  
  let result = addr
  if (!hasCity && city) result += ', ' + city
  if (!hasState && state) result += ', ' + state
  
  return result
}

function AmenityCard({ item }) {
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'cafe':        return <Coffee size={15} />
      case 'restaurant':  return <Utensils size={15} />
      case 'park':        return <TreePine size={15} />
      case 'atm':         return <Building2 size={15} />
      case 'store':       return <ShoppingBag size={15} />
      case 'convenience': return <Store size={15} />
      default:            return <MapPin size={15} />
    }
  }

  return (
    <div className="py-4 px-4 -mx-4 flex items-center justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-all duration-300 group rounded-sm">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 border border-gray-100 flex items-center justify-center text-gray-400">
          {getIcon(item.type)}
        </div>
        <div>
          <p className="text-sm font-normal text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-400 capitalize mt-0.5">
            {item.type} · Open Now
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">{item.distance}</p>
        <p className="text-xs text-gray-300">
          {Math.round((parseFloat(item.distance) / 5) * 60)} min walk
        </p>
      </div>
    </div>
  )
}

/* ─── facilityConfig ───────────────────────────────────────────── */
const facilityConfig = {
  'Parking':      { description: 'Free parking available' },
  'WiFi':         { description: 'High speed WiFi' },
  'Restroom':     { description: 'Clean restrooms' },
  'CCTV':         { description: '24/7 surveillance' },
  'Waiting Area': { description: 'Comfortable seating' },
  'Food Court':   { description: 'Food and beverages' },
  'EV Shop':      { description: 'EV accessories shop' },
  'First Aid':    { description: 'Medical assistance' }
}

/* ─── Star SVG ─────────────────────────────────────────────────── */
const StarIcon = ({ filled, size = 'sm' }) => {
  const cls = size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'
  return (
    <svg
      className={`${cls} ${filled ? 'text-gray-800' : 'text-gray-200'}`}
      fill="currentColor"
      viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

/* ─── Stars Row ────────────────────────────────────────────────── */
const StarsRow = ({ rating, size }) =>
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <StarIcon key={s} filled={s <= Math.round(rating)} size={size} />
    ))}
  </div>

/* ─── Main Component ───────────────────────────────────────────── */
const TABS = ['Chargers', 'Reviews', 'Facilities', 'Nearby Places']

const StationDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, toggleSavedStation } = useAuthStore()

  const [activeTab, setActiveTab] = useState('Chargers')
  const [station, setStation] = useState(null)
  const [chargers, setChargers] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState('')
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [distance, setDistance] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const { weather, aqi } = useWeather(station?.lat, station?.lng)
  const isSaved = user?.savedStations?.includes(station?.id)

  useEffect(() => {
    if (station && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const R = 6371
          const dLat = (station.lat - pos.coords.latitude) * Math.PI / 180
          const dLng = (station.lng - pos.coords.longitude) * Math.PI / 180
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(pos.coords.latitude * Math.PI / 180) *
            Math.cos(station.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          setDistance((R * c).toFixed(1))
        },
        (err) => console.error('Location error:', err)
      )
    }
  }, [station])

  /* ── API Configuration ── */
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  const fetchChargers = useCallback(async (stationId) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/stations/${stationId}/chargers`)
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
      const result = await response.json()
      setChargers(result.data?.chargers || [])
    } catch (err) {
      console.error('Chargers fetch error:', err)
      setChargers([])
    }
  }, [API_URL])

  const fetchReviews = useCallback(async (stationId) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/stations/${stationId}/reviews`)
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
      const result = await response.json()
      setReviews(result.data?.reviews || [])
    } catch (err) {
      console.error('Reviews fetch error:', err)
      setReviews([])
    }
  }, [API_URL])

  const fetchNearbyPlacesData = useCallback(async (city) => {
    try {
      const getNearbyPlaces = (stationCity) => [
        { id: '1', name: `${stationCity} Cafe`, type: 'cafe', distance: '0.2 km' },
        { id: '2', name: `${stationCity} Diner`, type: 'restaurant', distance: '0.4 km' },
        { id: '3', name: 'Central Park', type: 'park', distance: '0.6 km' },
        { id: '4', name: 'General Store', type: 'store', distance: '0.5 km' },
      ]
      setNearbyPlaces(getNearbyPlaces(city))
    } catch (error) { console.error(error) }
  }, [])

  const loadData = useCallback(async () => {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
      const url = isUUID
        ? `${API_URL}/api/v1/stations/${slug}`
        : `${API_URL}/api/v1/stations/slug/${slug}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Station not found: ${response.status}`)
      
      const result = await response.json()
      const stationData = result.data?.station || result.data
      
      if (stationData) {
        setStation(stationData)
        document.title = `${stationData.name} — ChargeNet`
        fetchChargers(stationData.id)
        fetchReviews(stationData.id)
        fetchNearbyPlacesData(stationData.city)
      }
    } catch (err) {
      console.error('Failed to load station:', err)
      toast.error('Failed to load station details')
    } finally {
      setLoading(false)
    }
  }, [slug, API_URL, fetchChargers, fetchReviews, fetchNearbyPlacesData])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (!station?.id) return
    
    // Poll every 30 seconds for charger updates instead of realtime WebSocket
    const interval = setInterval(() => {
      fetchChargers(station.id)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [station?.id, fetchChargers])

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-sm text-gray-400 animate-pulse tracking-tight">Syncing station data...</div>
    </div>
  )

  /* ── Not found ── */
  if (!station) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle size={32} className="text-gray-200 mb-4" />
      <h1 className="text-lg font-normal text-gray-900 mb-4">Station not found</h1>
      <button onClick={() => navigate(-1)} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Go back</button>
    </div>
  )

  /* ── Derived values ── */
  const avgRating = station.rating || 0
  const minPrice = chargers.length > 0
    ? Math.min(...chargers.map(c => parseFloat(c.price_per_kwh) || 0)).toFixed(2)
    : '0.00'
  const aqiLevel = aqi?.aqiLabel || 'Good'
  const availableCount = chargers.filter(c => c.status === 'available').length

  const filteredPlaces = selectedCategory === 'All'
    ? nearbyPlaces
    : nearbyPlaces.filter(p => {
        const cat = selectedCategory.toLowerCase()
        if (cat === 'restaurants') return p.type === 'restaurant'
        if (cat === 'cafes') return p.type === 'cafe'
        if (cat === 'parks') return p.type === 'park'
        if (cat === 'stores') return p.type === 'store' || p.type === 'convenience'
        if (cat === 'atms') return p.type === 'atm'
        return true
      })

  const facilities = Array.isArray(station.facilities)
    ? station.facilities
    : (station.facilities ? Object.keys(station.facilities).filter(k => station.facilities[k]) : [])

  const submitReview = async () => {
    if (!isAuthenticated) return navigate('/login')
    if (userRating === 0) return toast.error('Please select a rating')
    if (!userComment.trim()) return toast.error('Please add a comment')
    const toastId = toast.loading('Submitting review...')
    try {
      const { error } = await supabase.from('reviews').insert({
        station_id: station.id,
        user_name: user?.name || user?.email?.split('@')[0] || 'Anonymous',
        rating: userRating,
        comment: userComment
      })
      if (error) throw error
      toast.success('Review submitted!', { id: toastId })
      setUserRating(0); setUserComment(''); fetchReviews(station.id)
    } catch (err) { toast.error('Failed to submit review', { id: toastId }) }
  }

  const handleShare = () => {
    const url = window.location.origin + '/station/' + station.slug
    if (navigator.share) {
      navigator.share({ title: station.name, text: station.address, url })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    }
  }

  const toggleSave = () => {
    if (!isAuthenticated) return navigate('/login')
    toggleSavedStation(station.id)
    toast.success(isSaved ? 'Removed' : 'Saved')
  }

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased pb-24">
      <Navbar solid={true} />

      {/* ── Thin top bar ── */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-6">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-5">
            <button
              onClick={handleShare}
              className="text-xs text-gray-400 hover:text-gray-900 transition-colors px-2 py-1 hover:bg-gray-50 rounded-sm">
              Share
            </button>
            <button
              onClick={toggleSave}
              className={`text-xs transition-colors px-2 py-1 rounded-sm ${isSaved ? 'text-gray-800 hover:bg-gray-50' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">

          {/* ════════════ LEFT COLUMN ════════════ */}
          <div className="lg:col-span-7">

            {/* Station header */}
            <div className="mb-8 pb-8 border-b border-gray-100">

              {/* Name */}
              <h1 className="text-4xl font-normal text-gray-900 tracking-tight mb-2">
                {station.name}
              </h1>

              <div className="flex items-center gap-4 mb-4 flex-wrap">
                {/* Status */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  <span className="text-xs text-gray-500 capitalize">{station.status}</span>
                </div>

                <span className="text-gray-200 text-xs">|</span>

                {/* Rating */}
                {reviews.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <StarsRow rating={avgRating} />
                    <span className="text-xs text-gray-500">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-200 text-xs">·</span>
                    <span className="text-xs text-gray-400">{reviews.length} reviews</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-300">No reviews yet</span>
                )}

                <span className="text-gray-200 text-xs">|</span>

                {/* Hours */}
                <span className="text-xs text-gray-400">Open 24/7</span>

                {distance && (
                  <>
                    <span className="text-gray-200 text-xs">|</span>
                    <span className="text-xs text-gray-400">{distance} km away</span>
                  </>
                )}
              </div>

              {/* Address – single clean line, no duplication */}
              <p className="text-sm text-gray-400 mb-4">
                {formatAddress(station)}
              </p>

              {/* Tags */}
              {station.tags?.length > 0 && (
                <div className="flex gap-1.5 mb-5">
                  {station.tags.map((tag, i) => (
                    <span key={i} className="text-xs border border-gray-100 px-2 py-0.5 text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 divide-x divide-gray-100 border border-gray-100 mb-8 overflow-hidden rounded-sm">
              <div className="px-4 py-3 hover:bg-gray-50 transition-colors duration-300">
                <p className="text-xs text-gray-400 mb-1">Chargers</p>
                <p className="text-sm text-gray-900">{availableCount}/{chargers.length} free</p>
              </div>
              <div className="px-4 py-3 hover:bg-gray-50 transition-colors duration-300">
                <p className="text-xs text-gray-400 mb-1">From</p>
                <p className="text-sm text-gray-900">₹{minPrice}/kWh</p>
              </div>
              <div className="px-4 py-3 hover:bg-gray-50 transition-colors duration-300">
                <p className="text-xs text-gray-400 mb-1">Weather</p>
                <p className="text-sm text-gray-900">{weather?.temp ?? '—'}°C</p>
              </div>
              <div className="px-4 py-3 hover:bg-gray-50 transition-colors duration-300">
                <p className="text-xs text-gray-400 mb-1">Air quality</p>
                <p className="text-sm text-gray-900">{aqiLevel}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 mb-8">
              <div className="flex overflow-x-auto">
                {TABS.map(tab => {
                  const count =
                    tab === 'Chargers' ? chargers.length :
                    tab === 'Reviews' ? reviews.length :
                    null
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-3 text-xs transition-all border-b-2 -mb-px whitespace-nowrap hover:bg-gray-50/50 rounded-t-sm ${
                        activeTab === tab
                          ? 'border-gray-900 text-gray-900 font-medium'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}>
                      {tab}
                      {count !== null && count > 0 && (
                        <span className={`ml-1.5 text-xs ${activeTab === tab ? 'text-gray-700' : 'text-gray-300'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── CHARGERS TAB ── */}
            {activeTab === 'Chargers' && (
              <div className="divide-y divide-gray-100">
                {chargers.map(charger => (
                    <div 
                      key={charger.id}
                      className="flex items-center justify-between py-4 px-4 -mx-4 hover:bg-gray-50/80 transition-all duration-300 group rounded-sm">
                    
                    {/* Left - all info on two lines max */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base text-gray-900 font-semibold">
                          {charger.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 border ${
                          charger.status === 'available'
                            ? 'border-gray-200 text-gray-500'
                            : 'border-gray-100 text-gray-300'
                        }`}>
                          {charger.status === 'available'
                            ? 'Available'
                            : charger.status === 'occupied'
                            ? 'In use'
                            : 'Maintenance'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {charger.power_kw} kW · ₹{parseFloat(charger.price_per_kwh).toFixed(2)}/kWh
                      </p>
                    </div>

                    {/* Right */}
                    {charger.status === 'available' ? (
                      <button
                        onClick={() => navigate(`/book/${station.id}`)}
                        className="text-xs border border-gray-200 text-gray-600 px-4 py-1.5 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all opacity-0 group-hover:opacity-100">
                        Book
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">
                        {charger.status === 'occupied' ? 'In use' : '—'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── REVIEWS TAB ── */}
            {activeTab === 'Reviews' && (
              <div>
                {reviews.length > 0 && (
                  <div className="flex items-start gap-10 pb-8 border-b border-gray-100 mb-8">
                    {/* Score */}
                    <div className="flex-shrink-0">
                      <p className="text-5xl font-light text-gray-900 mb-1">{avgRating.toFixed(1)}</p>
                      <StarsRow rating={avgRating} size="lg" />
                      <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
                    </div>

                    {/* Bars */}
                    <div className="flex-1 space-y-2 pt-1">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length
                        const pct = reviews.length ? (count / reviews.length) * 100 : 0
                        return (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-3">{star}</span>
                            <div className="flex-1 h-1 bg-gray-100">
                              <div className="h-full bg-gray-800 transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-300 w-4">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Review list */}
                <div className="space-y-0 mb-10">
                  {reviews.length === 0 && (
                    <p className="text-sm text-gray-400">No reviews yet. Be the first to review.</p>
                  )}
                  {reviews.map(review => (
                    <div key={review.id} className="py-6 px-4 -mx-4 hover:bg-gray-50/50 transition-all duration-300 rounded-sm group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                            {(review.user_name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-700">{review.user_name}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <StarsRow rating={review.rating} />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed pl-11">{review.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Write review */}
                <div className="border border-gray-100 p-5">
                  <p className="text-xs text-gray-400 mb-4">Write a review</p>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setUserRating(star)} className="p-0.5">
                        <svg
                          className={`w-5 h-5 transition-colors ${
                            star <= userRating ? 'text-gray-800' : 'text-gray-200 hover:text-gray-400'
                          }`}
                          fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={userComment}
                    onChange={e => setUserComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full border border-gray-200 p-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 resize-none mb-3"
                  />
                  <button
                    onClick={submitReview}
                    disabled={!userRating || !userComment}
                    className="text-xs bg-gray-900 text-white px-5 py-2.5 hover:bg-black transition-colors disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed">
                    Submit review
                  </button>
                </div>
              </div>
            )}

            {/* ── FACILITIES TAB ── */}
            {activeTab === 'Facilities' && (
              <div>
                {facilities.length === 0 ? (
                  <p className="text-sm text-gray-400">No facility information available.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-0">
                    {facilities.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 py-4 px-4 -mx-4 border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-300 rounded-sm">
                        <div className="w-1.5 h-1.5 bg-gray-300 flex-shrink-0 mt-1.5" />
                        <div>
                          <p className="text-sm text-gray-700">{f}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{facilityConfig[f]?.description || 'On-site facility available'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── NEARBY PLACES TAB ── */}
            {activeTab === 'Nearby Places' && (
              <div>
                <div className="flex gap-2 flex-wrap mb-6">
                  {['All', 'Restaurants', 'Cafes', 'Parks', 'Stores', 'ATMs'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3 py-1.5 transition-all ${
                        selectedCategory === cat
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-200 text-gray-500 hover:border-gray-400'
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>

                <div>
                  {filteredPlaces.length === 0 ? (
                    <p className="text-sm text-gray-400">No places in this category.</p>
                  ) : (
                    filteredPlaces.map((place) => (
                      <AmenityCard key={place.id} item={place} />
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

          {/* ════════════ RIGHT SIDEBAR ════════════ */}
          <div className="lg:col-span-5">
            <div className="sticky top-20">

              <div className="border border-gray-200 divide-y divide-gray-100 overflow-hidden rounded-sm">
                {/* Section 1: Book button */}
                <div className="p-5 hover:bg-gray-50/30 transition-colors duration-300">
                  <button
                    onClick={() => navigate(`/book/${station.id}`)}
                    className="w-full bg-gray-900 text-white py-3 text-sm font-normal hover:bg-black transition-colors mb-2">
                    Book a Slot
                  </button>
                  <p className="text-xs text-center text-gray-400">
                    Free cancellation available
                  </p>
                </div>

                {/* Section 2: Availability */}
                <div className="p-5 hover:bg-gray-50/30 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">Availability</p>
                    <span className="text-xs text-gray-400">Live</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-2xl font-light text-gray-900">
                      {availableCount}
                    </span>
                    <span className="text-sm text-gray-400">
                      of {chargers.length} free
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {chargers.map((c, i) => (
                      <div key={i}
                        className={`h-1 flex-1 ${
                        c.status === 'available'
                          ? 'bg-gray-900'
                          : 'bg-gray-200'
                      }`}></div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Weather */}
                <div className="p-5 hover:bg-gray-50/30 transition-colors duration-300">
                  <p className="text-xs text-gray-400 mb-3">Current conditions</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-light text-gray-900">
                      {weather?.temp ?? '—'}
                    </span>
                    <span className="text-sm text-gray-400">°C</span>
                  </div>
                  <p className="text-xs text-gray-500 capitalize mb-4">
                    {weather?.weatherLabel || ''}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Humidity', value: weather?.humidity != null ? `${weather.humidity}%` : '—' },
                      { label: 'Wind', value: weather?.windKmh != null ? `${weather.windKmh} km/h` : '—' },
                      { label: 'Feels like', value: weather?.feelsLike != null ? `${weather.feelsLike}°C` : '—' },
                      { label: 'Air quality', value: aqiLevel }
                    ].map((item, i) => (
                      <div key={i}>
                        <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                        <p className="text-xs text-gray-700 font-normal">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Station details */}
                <div className="p-5 hover:bg-gray-50/30 transition-colors duration-300">
                  <p className="text-xs text-gray-400 mb-3">Station details</p>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Network', value: 'ChargeNet' },
                      { label: 'Chargers', value: chargers.length },
                      { label: 'From', value: `₹${minPrice}/kWh` },
                      { label: 'Hours', value: '24/7' },
                      { label: 'Distance', value: distance ? `${distance} km` : '—' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{item.label}</span>
                        <span className="text-xs text-gray-700">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Fixed Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex items-center justify-between z-20 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">
              From ₹{minPrice}/kWh
            </p>
            <p className="text-sm text-gray-900 font-medium tracking-tight">
              {availableCount} of {chargers.length} chargers free
            </p>
          </div>
          <button
            onClick={() => navigate(`/book/${station.id}`)}
            className="bg-gray-900 text-white px-8 py-3 text-sm font-normal hover:bg-black transition-all duration-300 shadow-sm">
            Book a Slot
          </button>
        </div>
      </div>
    </div>
  )
}

export default StationDetail
