import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin, Star, Clock, Zap, Wifi, Droplets, ParkingSquare, Shield,
  Moon, Accessibility, Check, X as XIcon, Bookmark, BookmarkCheck,
  ArrowLeft, MessageSquare, BatteryCharging, Plug, Smartphone,
  Navigation2, Coffee, TreePine, Utensils, Play, ChevronDown, ChevronRight,
  Share2, Phone, AlertTriangle, Activity, TrendingUp, Bolt
} from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { Badge, PlugBadge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { stations } from '../mock/stations'
import { chargers } from '../mock/chargers'
import { reviews } from '../mock/reviews'
import { amenities } from '../mock/amenities'
import { useAuthStore } from '../store/authStore'
import { formatRelativeTime, formatDate } from '../utils/formatTime'
import { formatINR } from '../utils/formatCurrency'
import toast from 'react-hot-toast'

/* ─── Helpers ─────────────────────────────────────────────────── */

const STATUS_CFG = {
  active:   { label: 'Active',   color: '#10B981', bg: '#D1FAE5', ring: '#6EE7B7' },
  busy:     { label: 'Busy',     color: '#F59E0B', bg: '#FEF3C7', ring: '#FCD34D' },
  inactive: { label: 'Inactive', color: '#EF4444', bg: '#FEE2E2', ring: '#FCA5A5' },
  faulty:   { label: 'Faulty',   color: '#6B7280', bg: '#F3F4F6', ring: '#D1D5DB' },
}

function StarRating({ rating, size = 14, interactive = false, onRate }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          onClick={() => interactive && onRate?.(s)}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`transition-colors ${interactive ? 'cursor-pointer' : ''} ${
            s <= (hover || Math.round(rating))
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

/* ─── Charger Card ─────────────────────────────────────────────── */
function ChargerCard({ charger, stationId }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const cfg = STATUS_CFG[charger.status] || STATUS_CFG.faulty
  const utilizationPct = Math.min(100, (charger.sessionsToday / 20) * 100)

  const handleBook = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    navigate(`/station/${stationId}/book/${charger.id}`)
  }

  return (
    <div className="group transition-all duration-200 py-6 border-b border-gray-100 last:border-0 relative">
      <div className="pr-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-gray-900 text-sm">{charger.company}</p>
            <p className="text-xs text-gray-400 mt-0.5">{charger.appName} App</p>
          </div>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Plug + Power */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-xs font-semibold text-gray-700">
            <Plug size={12} className="text-gray-400" />
            {charger.plugType}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700">
            <Zap size={12} />
            {charger.powerKw} kW
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg text-xs font-semibold text-emerald-700">
            ₹{charger.pricePerKwh}/kWh
          </span>
        </div>

        {/* Today utilization bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-gray-400 font-medium">Today's Usage</span>
            <span className="text-[11px] font-bold text-gray-600">{charger.sessionsToday} sessions</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${utilizationPct}%`, background: cfg.color }}
            />
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mb-3">
          Last active: {formatRelativeTime(charger.lastActiveAt)}
        </p>



        <button
          onClick={handleBook}
          disabled={charger.status === 'inactive' || charger.status === 'faulty'}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
            charger.status === 'active'
              ? 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
              : charger.status === 'busy'
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {charger.status === 'active' ? 'Book Slot' : charger.status === 'busy' ? 'Join Queue' : 'Unavailable'}
        </button>
      </div>
    </div>
  )
}



/* ─── Facility Row ─────────────────────────────────────────────── */
const FACILITY_MAP = {
  restrooms:        { icon: Droplets,      label: 'Restrooms' },
  drinkingWater:    { icon: Droplets,      label: 'Drinking Water' },
  coveredParking:   { icon: ParkingSquare, label: 'Covered Parking' },
  cctv:             { icon: Shield,        label: 'CCTV Surveillance' },
  nightLighting:    { icon: Moon,          label: 'Night Lighting' },
  wheelchairAccess: { icon: Accessibility, label: 'Wheelchair Accessible' },
}

function FacilityRow({ facilityKey, available }) {
  const { icon: Icon, label } = FACILITY_MAP[facilityKey] || {}
  if (!Icon) return null
  return (
    <div className={`flex items-center gap-3 py-3 transition-colors`}>
      <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
        available ? 'text-emerald-600' : 'text-gray-400'
      }`}>
        <Icon size={16} />
      </div>
      <span className={`text-sm font-medium ${available ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
      <div className="ml-auto">
        {available
          ? <Check size={16} className="text-emerald-500" />
          : <XIcon size={16} className="text-gray-300" />}
      </div>
    </div>
  )
}

/* ─── Review Card ──────────────────────────────────────────────── */
function ReviewCard({ review }) {
  return (
    <div className="py-6 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {review.reviewerName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">{review.reviewerName}</p>
            <p className="text-xs text-gray-400">{formatDate(review.date)}</p>
          </div>
          <StarRating rating={review.rating} size={12} />
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
      {review.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {review.tags.map(tag => (
            <span key={tag} className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Amenity Card ─────────────────────────────────────────────── */
function AmenityCard({ item }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-base flex-shrink-0">
        {item.type === 'Park' ? <TreePine size={18} className="text-green-600" /> : item.type === 'Cafe' ? <Coffee size={18} className="text-orange-600" /> : <Utensils size={18} className="text-orange-600" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {item.rating && (
            <span className="flex items-center gap-0.5 text-xs text-amber-500 font-medium">
              <Star size={10} className="fill-amber-400" /> {item.rating}
            </span>
          )}
          <span className="text-xs text-gray-400">{item.distance}m away</span>
        </div>
      </div>
      {item.isOpen !== undefined && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
          item.isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}>
          {item.isOpen ? 'Open' : 'Closed'}
        </span>
      )}
    </div>
  )
}

/* ─── Main Component ───────────────────────────────────────────── */
const REVIEW_TAGS = [
  'Fast Charging', 'Clean', 'Safe', 'Good Location', 'Reliable',
  'Easy Payment', 'Covered Parking', 'Accessible', 'Crowded',
  'Needs Maintenance', 'Friendly Staff', 'Reasonable Price'
]

const TABS = ['Chargers', 'Reviews', 'Nearby', 'Facilities']

export default function StationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, toggleSavedStation } = useAuthStore()
  const [activeTab, setActiveTab] = useState('Nearby')
  const [reviewModal, setReviewModal] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [userRating, setUserRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [sharePopup, setSharePopup] = useState(false)

  const station = stations.find(s => s.id === id)
  const stationChargers = chargers.filter(c => c.stationId === id)
  const stationReviews = reviews.filter(r => r.stationId === id)
  const stationAmenities = amenities[id]
  const isSaved = user?.savedStations?.includes(id)

  const cfg = station ? (STATUS_CFG[station.status] || STATUS_CFG.faulty) : null

  useEffect(() => {
    if (station) document.title = `${station.name} — ChargeNet`
  }, [station])

  if (!station) return (
    <PageWrapper>
      <PageContainer>
        <div className="text-center py-20 text-gray-400">Station not found.</div>
      </PageContainer>
    </PageWrapper>
  )

  const avgRating = stationReviews.length
    ? stationReviews.reduce((a, r) => a + r.rating, 0) / stationReviews.length
    : 0
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: stationReviews.filter(r => r.rating === star).length,
    pct: (stationReviews.filter(r => r.rating === star).length / (stationReviews.length || 1)) * 100,
  }))

  const handleToggleSave = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    toggleSavedStation(id)
    toast.success(isSaved ? 'Removed from saved' : 'Station saved!')
  }

  const handleSubmitReview = () => {
    if (userRating === 0) { toast.error('Please select a star rating'); return }
    toast.success('Review submitted! Thank you.')
    setReviewModal(false)
    setUserRating(0); setReviewText(''); setSelectedTags([])
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: station.name, text: station.address, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  const availPct = station.totalChargers > 0
    ? Math.round((station.availableChargers / station.totalChargers) * 100)
    : 0

  return (
    <PageWrapper>
      <PageContainer className="!max-w-7xl !py-6">

        {/* ─── Back ─── */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={16} /> Back to map
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* ─── LEFT COLUMN ─── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Hero Header ── */}
            <div className="pb-8 border-b border-gray-100">
              <div className="pt-0">
                {/* Title row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: cfg.color }} />
                        {cfg.label}
                      </span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 leading-tight">{station.name}</h1>
                    <div className="flex items-start gap-1.5 text-sm text-gray-500 mt-1.5">
                      <MapPin size={15} className="flex-shrink-0 mt-0.5" />
                      <span>{station.address}</span>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleShare}
                      className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={handleToggleSave}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        isSaved
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Rating + hours */}
                <div className="flex flex-wrap items-center gap-5 mb-5 text-sm">
                  <div className="flex items-center gap-2">
                    <StarRating rating={avgRating} size={15} />
                    <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-400">({stationReviews.length} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={14} />
                    <span>{station.openHours}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Navigation2 size={14} />
                    <span>{(station.distance / 1000).toFixed(1)} km away</span>
                  </div>
                </div>

                {/* Quick summary pills */}
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-700">
                    <BatteryCharging size={13} className={station.availableChargers > 0 ? 'text-emerald-500' : 'text-red-400'} />
                    {station.availableChargers}/{station.totalChargers} chargers free
                  </span>
                  {stationReviews.length > 0 && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl text-xs font-semibold text-amber-700">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      {avgRating.toFixed(1)} · {stationReviews.length} reviews
                    </span>
                  )}
                  {stationChargers.length > 0 && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-semibold text-blue-700">
                      <Zap size={13} />
                      From ₹{Math.min(...stationChargers.map(c => c.pricePerKwh))}/kWh
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Content Tabs ── */}
            <div className="pt-2">
              <div className="flex border-b border-gray-100 px-4 pt-2">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                      activeTab === tab
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                    {tab === 'Chargers' && (
                      <span className="ml-1.5 text-[11px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                        {stationChargers.length}
                      </span>
                    )}
                    {tab === 'Reviews' && (
                      <span className="ml-1.5 text-[11px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                        {stationReviews.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* ── Chargers Tab ── */}
                {activeTab === 'Chargers' && (
                  <div>
                    {stationChargers.length === 0 ? (
                      <div className="text-center py-12">
                        <BatteryCharging size={40} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No chargers listed for this station</p>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {stationChargers.map(c => (
                          <ChargerCard key={c.id} charger={c} stationId={id} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Reviews Tab ── */}
                {activeTab === 'Reviews' && (
                  <div>
                    {/* Rating Summary */}
                    <div className="flex items-start gap-8 py-6 mb-5 border-b border-gray-100">
                      <div className="text-center flex-shrink-0">
                        <p className="text-5xl font-black text-gray-900 leading-none">{avgRating.toFixed(1)}</p>
                        <StarRating rating={avgRating} size={16} />
                        <p className="text-xs text-gray-400 mt-1">{stationReviews.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {ratingBreakdown.map(({ star, count, pct }) => (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                            <span className="text-gray-500 w-2">{star}</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-gray-400 w-4 text-right">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-gray-700">{stationReviews.length} Reviews</p>
                      <button
                        onClick={() => { if (!isAuthenticated) { navigate('/login'); return } setReviewModal(true) }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
                      >
                        <MessageSquare size={13} /> Write a Review
                      </button>
                    </div>

                    {stationReviews.length === 0 ? (
                      <div className="text-center py-10">
                        <MessageSquare size={36} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No reviews yet. Be the first!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stationReviews.map(r => <ReviewCard key={r.id} review={r} />)}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Nearby Tab ── */}
                {activeTab === 'Nearby' && (
                  <div>
                    {!stationAmenities ? (
                      <div className="text-center py-12">
                        <TreePine size={36} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No nearby places listed</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {stationAmenities.restaurants?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center text-sm text-orange-600"><Utensils size={14} /></div>
                              <h3 className="text-sm font-bold text-gray-800">Restaurants & Cafes</h3>
                              <span className="ml-auto text-xs text-gray-400 font-medium">{stationAmenities.restaurants.length} nearby</span>
                            </div>
                            <div className="space-y-2">
                              {stationAmenities.restaurants.map((r, i) => (
                                <div key={r.id} className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group cursor-default">
                                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-lg flex-shrink-0">
                                    {r.type === 'Cafe' ? <Coffee size={18} className="text-orange-600" /> : <Utensils size={18} className="text-orange-600" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{r.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-gray-400 font-medium">{r.type}</span>
                                      <span className="text-gray-300">·</span>
                                      <span className="text-xs text-gray-400">{r.distance}m away</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                    {r.rating && (
                                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                                        <Star size={10} className="fill-amber-400 text-amber-400" /> {r.rating}
                                      </span>
                                    )}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      r.isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                                    }`}>
                                      {r.isOpen ? 'Open Now' : 'Closed'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {stationAmenities.parks?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center text-sm text-green-600"><TreePine size={14} /></div>
                              <h3 className="text-sm font-bold text-gray-800">Parks & Recreation</h3>
                              <span className="ml-auto text-xs text-gray-400 font-medium">{stationAmenities.parks.length} nearby</span>
                            </div>
                            <div className="space-y-2">
                              {stationAmenities.parks.map(p => (
                                <div key={p.id} className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-default">
                                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-lg flex-shrink-0 text-green-600"><TreePine size={20} /></div>
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">{p.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{p.distance}m away</p>
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-50 text-green-600">Park</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-[11px] text-gray-400 text-center pt-1">Distances are approximate walking distances from the station.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Facilities Tab ── */}
                {activeTab === 'Facilities' && (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.keys(FACILITY_MAP).map(key => (
                        <FacilityRow key={key} facilityKey={key} available={station.facilities?.[key]} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="lg:sticky lg:top-[90px] self-start space-y-6">
              <div className="pb-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-900">Availability</p>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </div>
                {/* Progress circle-like bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">{station.availableChargers} free</span>
                    <span className="text-gray-400">{station.totalChargers} total</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${availPct}%`, background: cfg.color }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 text-right">{availPct}% available</p>
                </div>
              </div>
              <div className="py-6">
                <button
                  onClick={() => {
                    if (!isAuthenticated) { navigate('/login'); return }
                    const available = stationChargers.find(c => c.status === 'active') || stationChargers[0]
                    if (available) {
                      navigate(`/station/${id}/book/${available.id}`)
                    } else {
                      toast.error('No chargers available at this station')
                    }
                  }}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <BatteryCharging size={16} /> Book a Slot
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-2">Instant confirmation · Free cancellation</p>
              </div>

            <div className="py-6 border-b border-gray-100">
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-900">Station Info</p>
              </div>
              <div className="p-4 space-y-3 text-sm">
                {[
                  { label: 'City', value: station.city },
                  { label: 'Open Hours', value: station.openHours },
                  { label: 'Total Chargers', value: station.totalChargers },
                  { label: 'Available Now', value: station.availableChargers, highlight: station.availableChargers > 0 },
                  { label: 'Distance', value: `${(station.distance / 1000).toFixed(1)} km` },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between gap-2">
                    <span className="text-gray-400 font-medium">{row.label}</span>
                    <span className={`font-bold text-right ${row.highlight ? 'text-emerald-600' : 'text-gray-800'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="py-6 border-b border-gray-100">
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-900">Get Directions</p>
              </div>
              <div className="p-4 space-y-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors hover:no-underline"
                >
                  <Navigation2 size={15} /> Open in Google Maps
                </a>
                <p className="text-[11px] text-gray-400 text-center">{station.address}</p>
              </div>
            </div>

            {station.status !== 'active' ? (
              <div className="py-6">
                <div className="flex items-start gap-4 py-4">
                  <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Station Notice</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      This station is currently {station.status}. We recommend finding an alternative nearby.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </PageContainer>

      {/* ─── Review Modal ─── */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Write a Review">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Your Rating</label>
            <StarRating rating={userRating} size={32} interactive onRate={setUserRating} />
            {userRating > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][userRating]}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Your Experience</label>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              rows={4}
              placeholder="How was the charging experience? Was the station clean and accessible?"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setReviewModal(false)}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              Submit Review
            </button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  )
}
