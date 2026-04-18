import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin, Star, Clock, Zap, Wifi, Droplets, ParkingSquare, Shield,
  Moon, Accessibility, Check, X as XIcon, Bookmark, BookmarkCheck,
  ArrowLeft, MessageSquare, BatteryCharging, Plug, Smartphone,
  Navigation2, Play, ChevronDown, ChevronRight,
  Share2, Phone, AlertTriangle, Activity, TrendingUp, Bolt, Wind, Thermometer,
  Cloud, Coffee, Utensils, TreePine, Building2, Store, ShoppingBag
} from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { Badge, PlugBadge } from '../components/common/Badge'
import { Navbar } from '../components/layout/Navbar'
import { getStationById } from '../services/stationService'
// import { getSlotsByStation } from '../services/slotService'
import { useAuthStore } from '../store/authStore'
// import { formatRelativeTime, formatDate } from '../utils/formatTime'
// import { formatINR } from '../utils/formatCurrency'
import { useWeather } from '../hooks/useWeather'
// import { submitReview as submitReviewService } from '../services/reviewService'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

/* ─── Config ─────────────────────────────────────────────────── */

const STATUS_CFG = {
  active: {
    label: 'Active',
    color: 'text-gray-900',
    bg: 'bg-black',
    border: 'border-black'
  },
  available: {
    label: 'Available',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200'
  },
  occupied: {
    label: 'Occupied', 
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-100'
  },
  maintenance: {
    label: 'Maintenance',
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-100'
  },
  inactive: {
    label: 'Inactive',
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-100'
  },
  faulty: {
    label: 'Faulty',
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-100'
  }
}

/* ─── Helpers ─────────────────────────────────────────────────── */

/* 
const getStatusColor = (status) => {
  const s = status?.toLowerCase()
  if (s === 'available') return 'text-gray-600 border border-gray-200 bg-gray-50'
  if (s === 'occupied' || s === 'maintenance') return 'text-gray-400 border border-gray-100 bg-gray-50'
  return 'text-gray-400 border border-gray-100 bg-gray-50'
}
*/

/* ─── Amenity Card ─────────────────────────────────────────────── */
function AmenityCard({ item }) {
  const getIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'cafe':        return <Coffee size={18} />
      case 'restaurant':  return <Utensils size={18} />
      case 'park':        return <TreePine size={18} />
      case 'atm':         return <Building2 size={18} />
      case 'store':       return <ShoppingBag size={18} />
      case 'convenience': return <Store size={18} />
      default:            return <MapPin size={18} />
    }
  }

  return (
    <div className="flex items-center justify-between p-5 border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all bg-white mb-2">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 border border-gray-100 flex items-center justify-center text-gray-400 font-medium">
          {getIcon(item.type)}
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm tracking-tight">{item.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-gray-400 font-medium leading-none">
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>
            <span className="text-[10px] text-gray-400 font-medium leading-none">• Open Now</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-medium text-gray-900">{item.distance}</p>
        <p className="text-[10px] text-gray-400 font-normal">
          {Math.round((parseFloat(item.distance) / 5) * 60)} min walk
        </p>
      </div>
    </div>
  )
}

/* ─── facilityConfig ───────────────────────────────────────────── */
const facilityConfig = {
  'Parking': { description: 'Free parking available' },
  'WiFi': { description: 'High speed WiFi' },
  'Restroom': { description: 'Clean restrooms' },
  'CCTV': { description: '24/7 surveillance' },
  'Waiting Area': { description: 'Comfortable seating' },
  'Food Court': { description: 'Food and beverages' },
  'EV Shop': { description: 'EV accessories shop' },
  'First Aid': { description: 'Medical assistance' }
}

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
  // const [loadingPlaces, setLoadingPlaces] = useState(false)
  const [distance, setDistance] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const { weather, aqi /*, loading: weatherLoading */ } = useWeather(station?.lat, station?.lng)
  const isSaved = user?.savedStations?.includes(station?.id)

  useEffect(() => {
    if (station && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const R = 6371;
          const dLat = (station.lat - pos.coords.latitude) * Math.PI / 180;
          const dLng = (station.lng - pos.coords.longitude) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(pos.coords.latitude * Math.PI/180) * 
            Math.cos(station.lat * Math.PI/180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          setDistance((R * c).toFixed(1))
        },
        (err) => console.error('Location error:', err)
      )
    }
  }, [station])

  const fetchChargers = useCallback(async (stationId) => {
    try {
      const { data, error } = await supabase.from('chargers').select('*').eq('station_id', stationId)
      if (!error) setChargers(data || [])
    } catch (err) { console.error(err) }
  }, [])

  const fetchReviews = useCallback(async (stationId) => {
    try {
      const { data, error } = await supabase.from('reviews').select('*').eq('station_id', stationId).order('created_at', { ascending: false })
      if (!error) setReviews(data || [])
    } catch (err) { console.error(err) }
  }, [])

  const fetchNearbyPlacesData = useCallback(async (city) => {
    // setLoadingPlaces(true)
    try {
      // Mocked nearby places for now as per previous logic
      const getNearbyPlaces = (stationCity) => [
        { id: '1', name: `${stationCity} Cafe`, type: 'cafe', distance: '0.2 km' },
        { id: '2', name: `${stationCity} Diner`, type: 'restaurant', distance: '0.4 km' },
        { id: '3', name: 'Central Park', type: 'park', distance: '0.6 km' },
        { id: '4', name: 'General Store', type: 'store', distance: '0.5 km' },
      ]
      setNearbyPlaces(getNearbyPlaces(city))
    } catch (error) { console.error(error) }
    // finally { setLoadingPlaces(false) }
  }, [])

  const loadData = useCallback(async () => {
    try {
      const res = await getStationById(slug)
      if (res.success) {
        setStation(res.data)
        document.title = `${res.data.name} — ChargeNet`
        fetchChargers(res.data.id)
        fetchReviews(res.data.id)
        fetchNearbyPlacesData(res.data.city)
      }
    } catch (err) {
      console.error('Failed to load station:', err)
      toast.error('Failed to load station details')
    } finally {
      setLoading(false)
    }
  }, [slug, fetchChargers, fetchReviews, fetchNearbyPlacesData])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!station?.id) return
    const channel = supabase
      .channel(`station-chargers-${station.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chargers', filter: `station_id=eq.${station.id}` }, () => loadData())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [station?.id, loadData])

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-sm font-medium text-gray-400 animate-pulse tracking-tight">Syncing Station Data...</div>
    </div>
  )

  if (!station) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle size={48} className="text-gray-200 mb-4" />
      <h1 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Station Not Found</h1>
      <button onClick={() => navigate(-1)} className="text-sm font-medium text-gray-500 hover:text-gray-900">Go Back</button>
    </div>
  )

  // Use native rating directly from the station schema 
  const avgRating = station.rating || 0
  const reviewCount = station.reviewCount || 0
  const minPrice = chargers.length > 0 ? Math.min(...chargers.map(c => parseFloat(c.price_per_kwh) || 0)).toFixed(2) : '0.00'
  const aqiLevel = aqi?.aqiLabel || 'Good'

  const availableCount = chargers.filter(c => c.status === 'available').length
  // const availablePct = chargers.length > 0 ? (availableCount / chargers.length) * 100 : 0
  // const occupiedPct = chargers.length > 0 ? Math.round((chargers.filter(c => c.status === 'occupied').length / chargers.length) * 100) : 0

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
      navigator.share({ title: station.name, text: station.address, url: url })
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

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Navbar solid={true} />
      
      {/* SECTION 1 - Top Bar */}
      <div className="bg-white sticky top-[72px] lg:top-[80px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-all flex items-center gap-1">
              ← Back to stations
            </button>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleShare}
                className="text-xs text-gray-400 hover:text-gray-600 transition-all">
                Share
              </button>
              <button 
                onClick={toggleSave}
                className={`text-xs transition-all flex items-center gap-1 ${isSaved ? 'text-gray-900 font-medium' : 'text-gray-400 hover:text-gray-600'}`}>
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 - Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7">

            {/* Station Header */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></div>
                <span className={`text-[11px] font-medium tracking-wide text-gray-500`}>
                   {station.status === 'active' ? 'Active' : station.status}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-5 leading-snug tracking-tight">
                {station.name}
              </h1>

              <p className="text-gray-500 mb-8 font-normal text-[15px] leading-relaxed">
                {station.address}, {station.city}, {station.state}
              </p>

              {/* TAGS - FIX 6 */}
              {station.tags?.length > 0 && (
                <div className="flex gap-1.5 mb-8">
                  {station.tags.map((tag, i) => (
                    <span key={i}
                      className="text-xs border border-gray-100 px-2 py-0.5 text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* RATING ROW - FIX 2 */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(star => (
                    <svg key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= Math.round(avgRating)
                          ? 'text-gray-900'
                          : 'text-gray-200'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-900 font-medium">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">
                  {reviewCount} reviews
                </span>
                <span className="text-gray-200">·</span>
                <span className="text-sm text-gray-400">
                  Open 24/7
                </span>
                <span className="text-gray-200">·</span>
                <span className="text-sm text-gray-400">
                  {distance} km away
                </span>
              </div>

              {/* QUICK INFO PILLS - FIX 3 */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <span className="text-xs text-gray-500 border border-gray-200 px-3 py-1">
                  {availableCount}/{chargers.length} free
                </span>
                <span className="text-xs text-gray-500 border border-gray-200 px-3 py-1">
                  from ₹{minPrice}/kWh
                </span>
                <span className="text-xs text-gray-500 border border-gray-200 px-3 py-1">
                  {weather?.temp}°C · {weather?.weatherLabel}
                </span>
                <span className="text-xs text-gray-500 border border-gray-200 px-3 py-1">
                  AQI {aqiLevel}
                </span>
              </div>
            </div>

            {/* TABS - FIX 10 */}
            <div className="border-b border-gray-100 mb-8 overflow-x-auto">
              <div className="flex min-w-max">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-xs transition-all border-b-2 -mb-px ${
                      activeTab === tab
                        ? 'border-gray-900 text-gray-900 font-medium'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}>
                    {tab}
                    {(tab === 'Chargers' || tab === 'Reviews') && (
                      <span className={`ml-1.5 text-xs ${
                        activeTab === tab
                          ? 'text-gray-900'
                          : 'text-gray-300'
                      }`}>
                        {tab === 'Chargers' ? chargers.length : reviews.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="mb-20">
              {activeTab === 'Chargers' && (
                <div className="bg-white">
                  {chargers.map(charger => (
                    <div key={charger.id} className="group px-6 -mx-6 hover:bg-gray-50 transition-all py-6 border-b border-gray-100 last:border-0">
                      
                      {/* Top Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-base font-medium text-gray-900">
                            {charger.type} Charger
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {charger.power_kw} kW · ChargeNet Network
                          </p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 border ${
                          charger.status === 'available'
                            ? 'border-gray-200 text-gray-600'
                            : 'border-gray-100 text-gray-300'
                        }`}>
                          {charger.status.charAt(0).toUpperCase() + charger.status.slice(1)}
                        </span>
                      </div>

                      {/* Price + Book Row */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          ₹{parseFloat(charger.price_per_kwh).toFixed(2)}/kWh
                        </p>
                        {charger.status === 'available' ? (
                          <button
                            onClick={() => navigate(`/book/${station.slug}`)}
                            className="text-xs text-gray-700 border border-gray-300 px-5 py-2 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
                            Book Slot
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">
                            {charger.status === 'occupied' ? 'In use' : 'Maintenance'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Reviews' && (
                <div className="space-y-12">
                  <div className="p-10 border border-gray-100 bg-gray-50/30 grid lg:grid-cols-3 gap-12 items-center">
                    <div className="text-center lg:border-r border-gray-100">
                      <p className="text-5xl font-semibold text-gray-900 tracking-tight">{avgRating.toFixed(1)}</p>
                      <div className="flex justify-center my-4 -space-x-1">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} size={16} fill={star <= Math.round(avgRating) ? '#EAB308' : 'none'} className={star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-100'} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 font-medium">{reviews.length} independent reviews</p>
                    </div>
                    <div className="lg:col-span-2 space-y-2.5">
                      {[5,4,3,2,1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length
                        const pct = reviews.length ? (count/reviews.length)*100 : 0
                        return (
                          <div key={star} className="flex items-center gap-4 text-[10px] font-medium text-gray-400">
                            <span className="w-2">{star}</span>
                            <div className="flex-1 h-0.5 bg-gray-100 overflow-hidden"><div className="h-full bg-gray-300 transition-all duration-700" style={{ width: `${pct}%` }}></div></div>
                            <span className="w-5 text-right">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="group px-6 -mx-6 hover:bg-gray-50 transition-all py-8 border-b border-gray-100 last:border-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 border border-gray-100 text-gray-400 flex items-center justify-center text-xs font-semibold">{(review.user_name || 'A').charAt(0).toUpperCase()}</div>
                            <div>
                                <p className="text-[14px] font-medium text-gray-900 leading-tight">{review.user_name}</p>
                                <p className="text-[11px] text-gray-400 font-normal mt-0.5">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} size={11} fill={star <= review.rating ? '#EAB308' : 'none'} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-100'} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 font-normal leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border border-gray-100 p-10 bg-white">
                    <h3 className="text-sm font-semibold text-gray-900 mb-8 tracking-tight">Write a Review</h3>
                    <div className="flex gap-2 mb-8">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} onClick={() => setUserRating(star)} className={`w-9 h-9 flex items-center justify-center border transition-all ${star <= userRating ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 text-gray-200'}`}>
                          <Star size={18} fill={star <= userRating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                    <textarea value={userComment} onChange={e => setUserComment(e.target.value)} placeholder="Describe your charging experience at this terminal..." rows={4} className="w-full border border-gray-100 p-5 text-sm font-normal focus:outline-none focus:border-gray-300 resize-none transition-all placeholder-gray-300" />
                    <button onClick={submitReview} disabled={!userRating || !userComment} className="mt-5 px-10 py-3.5 bg-gray-900 text-white text-xs font-medium transition-all disabled:opacity-20 disabled:cursor-not-allowed">Post Verified Review</button>
                  </div>
                </div>
              )}

              {activeTab === 'Facilities' && (() => {
                const facilities = Array.isArray(station.facilities) ? station.facilities : (station.facilities ? Object.keys(station.facilities).filter(k => station.facilities[k]) : []);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {facilities.map(f => (
                      <div key={f} className="border border-gray-50 p-6 flex flex-col gap-4 bg-white hover:border-gray-100 hover:bg-gray-50 transition-all group">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{f}</p>
                          <div className="w-1.5 h-1.5 bg-gray-200"></div>
                        </div>
                        <p className="text-[11px] text-gray-400 font-normal leading-relaxed">{facilityConfig[f]?.description || 'On-site facility available'}</p>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {activeTab === 'Nearby Places' && (
                <div className="space-y-10">
                  <div className="flex gap-4 border-b border-gray-50 pb-4 overflow-x-auto">
                    {['All', 'Restaurants', 'Cafes', 'Parks', 'Stores', 'ATMs'].map(cat => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`text-xs font-medium py-1 transition-all border-b-2 -mb-px ${
                        selectedCategory === cat ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'
                      }`}>{cat}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {nearbyPlaces.map(place => (
                      <AmenityCard key={place.id} item={place} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR - FIX 9, 10, 11, 12 */}
          <div className="lg:col-span-5 lg:pl-12">
            <div className="sticky top-24">

              {/* FIX 5 - Book Button */}
              <button
                onClick={() => navigate(`/book/${station.slug}`)}
                className="w-full bg-gray-900 text-white py-3.5 text-xs tracking-widest uppercase hover:bg-black transition-all mb-1.5">
                Book a Charging Slot
              </button>
              <p className="text-xs text-gray-400 text-center mb-10">
                Free cancellation available
              </p>

              {/* FIX 6 - Availability */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-400">Availability</p>
                  <p className="text-xs text-gray-400">Live</p>
                </div>
                
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-light text-gray-900">
                    {availableCount}
                  </span>
                  <span className="text-sm text-gray-400">
                    of {chargers.length} chargers free
                  </span>
                </div>

                {/* Charger Dots */}
                <div className="flex gap-1.5">
                  {chargers.map((c, i) => (
                    <div key={i}
                      className={`h-1 flex-1 ${
                      c.status === 'available'
                        ? 'bg-gray-900'
                        : 'bg-gray-200'
                    }`}>
                    </div>
                  ))}
                </div>
              </div>

              {/* FIX 7 - Current conditions */}
              <div className="mb-10">
                <p className="text-xs text-gray-400 mb-5">Current conditions</p>
                
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-light text-gray-900">
                    {weather?.temp}
                  </span>
                  <span className="text-sm text-gray-400">°C</span>
                </div>
                
                <p className="text-xs text-gray-500 capitalize mb-6">
                  {weather?.weatherLabel}
                </p>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { label: 'Humidity', value: `${weather?.humidity}%` },
                    { label: 'Wind', value: `${weather?.windKmh} km/h` },
                    { label: 'Feels like', value: `${weather?.feelsLike}°C` },
                    { label: 'Air quality', value: aqiLevel }
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                      <p className="text-xs font-medium text-gray-700">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FIX 8 - Station Details */}
              <div>
                <p className="text-xs text-gray-400 mb-4">Station details</p>
                <div className="space-y-3">
                  {[
                    { label: 'Network', value: 'ChargeNet' },
                    { label: 'Chargers', value: chargers.length },
                    { label: 'From', value: `₹${minPrice}/kWh` },
                    { label: 'Hours', value: '24/7' },
                    { label: 'Distance', value: distance ? `${distance} km` : 'Calculating...' }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between">
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

      {/* FOOTER SECTION CTA */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Ready to power up?</h2>
              <p className="text-gray-500 mb-8 text-[15px]">Secure your terminal at {station.name} in just a few clicks.</p>
              <button onClick={() => navigate(`/book/${station.slug}`)} className="bg-gray-900 text-white px-10 py-4 text-xs font-medium hover:bg-black transition-all">Start Booking Session</button>
          </div>
      </section>
    </div>
  )
}

export default StationDetail
