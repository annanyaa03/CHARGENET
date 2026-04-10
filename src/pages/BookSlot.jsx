import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, MapPin, Star, Clock, Zap, BatteryCharging,
  Filter, ChevronDown, ArrowRight, Plug, Shield,
  Sparkles, SlidersHorizontal, X as XIcon
} from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { stations } from '../mock/stations'
import { chargers } from '../mock/chargers'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

/* ─── Status Config ────────────────────────────────────────── */
const STATUS_CFG = {
  active:   { label: 'Available', color: '#10B981', bg: '#D1FAE5', dot: '#34D399' },
  busy:     { label: 'Busy',      color: '#F59E0B', bg: '#FEF3C7', dot: '#FBBF24' },
  inactive: { label: 'Offline',   color: '#EF4444', bg: '#FEE2E2', dot: '#F87171' },
  faulty:   { label: 'Faulty',    color: '#6B7280', bg: '#F3F4F6', dot: '#9CA3AF' },
}

const CITIES = ['All Cities', ...new Set(stations.map(s => s.city).sort())]
const PLUG_TYPES = ['All Types', ...new Set(chargers.map(c => c.plugType).sort())]
const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest First' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'available', label: 'Most Available' },
  { value: 'price', label: 'Lowest Price' },
]

/* ─── Station Card ─────────────────────────────────────────── */
function StationBookCard({ station, stationChargers, onBook }) {
  const cfg = STATUS_CFG[station.status] || STATUS_CFG.faulty
  const activeChargers = stationChargers.filter(c => c.status === 'active')
  const minPrice = stationChargers.length > 0
    ? Math.min(...stationChargers.map(c => c.pricePerKwh))
    : 0
  const maxPower = stationChargers.length > 0
    ? Math.max(...stationChargers.map(c => c.powerKw))
    : 0
  const plugTypes = [...new Set(stationChargers.map(c => c.plugType))]

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${cfg.color}40, ${cfg.color})` }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.dot }} />
                {cfg.label}
              </span>
              {station.openHours === '24/7' && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">24/7</span>
              )}
            </div>
            <h3 className="text-base font-black text-gray-900 leading-tight truncate group-hover:text-gray-700 transition-colors">
              {station.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
              <MapPin size={11} className="flex-shrink-0" />
              <span className="truncate">{station.address}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-sm font-black text-gray-900">{station.rating}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">{station.totalReviews} reviews</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-black text-gray-900 leading-none">{station.availableChargers}</p>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">of {station.totalChargers} free</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-black text-gray-900 leading-none">{maxPower}</p>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">kW max</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-black text-gray-900 leading-none">₹{minPrice}</p>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">per kWh</p>
          </div>
        </div>

        {/* Plug types */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {plugTypes.map(pt => (
            <span key={pt} className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg text-[11px] font-semibold text-blue-700">
              <Plug size={10} />
              {pt}
            </span>
          ))}
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg text-[11px] font-semibold text-gray-500">
            <Clock size={10} />
            {station.openHours}
          </span>
        </div>

        {/* Distance + Book Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-gray-400 font-medium">
            {(station.distance / 1000).toFixed(1)} km away
          </div>
          <button
            onClick={() => onBook(station)}
            disabled={station.status === 'inactive' || station.status === 'faulty'}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              station.status === 'active'
                ? 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 hover:-translate-y-0.5'
                : station.status === 'busy'
                ? 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {station.status === 'active' ? 'Book Now' : station.status === 'busy' ? 'Join Queue' : 'Unavailable'}
            {(station.status === 'active' || station.status === 'busy') && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ────────────────────────────────────────────── */
export default function BookSlot() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('All Cities')
  const [plugType, setPlugType] = useState('All Types')
  const [sort, setSort] = useState('distance')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    document.title = 'Book a Slot — ChargeNet'
    window.scrollTo(0, 0)
  }, [])

  const handleBook = (station) => {
    if (!isAuthenticated) { navigate('/login'); return }
    const stationChgrs = chargers.filter(c => c.stationId === station.id)
    const available = stationChgrs.find(c => c.status === 'active') || stationChgrs[0]
    if (available) {
      navigate(`/station/${station.id}/book/${available.id}`)
    } else {
      toast.error('No chargers available')
    }
  }

  const filtered = useMemo(() => {
    let result = [...stations]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
      )
    }

    // City filter
    if (city !== 'All Cities') {
      result = result.filter(s => s.city === city)
    }

    // Plug type filter
    if (plugType !== 'All Types') {
      const stationIdsWithPlug = new Set(
        chargers.filter(c => c.plugType === plugType).map(c => c.stationId)
      )
      result = result.filter(s => stationIdsWithPlug.has(s.id))
    }

    // Sort
    switch (sort) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'available':
        result.sort((a, b) => b.availableChargers - a.availableChargers)
        break
      case 'price': {
        const getMin = (sId) => {
          const c = chargers.filter(x => x.stationId === sId)
          return c.length > 0 ? Math.min(...c.map(x => x.pricePerKwh)) : 999
        }
        result.sort((a, b) => getMin(a.id) - getMin(b.id))
        break
      }
      default:
        result.sort((a, b) => a.distance - b.distance)
    }

    return result
  }, [search, city, plugType, sort])

  const activeCount = filtered.filter(s => s.status === 'active').length
  const totalChargers = filtered.reduce((acc, s) => acc + s.availableChargers, 0)

  return (
    <PageWrapper>
      <PageContainer className="!max-w-7xl !py-0">

        {/* ── Hero Header ── */}
        <div className="pt-12 pb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Smart Booking</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-3">
            Book a Slot
          </h1>
          <p className="text-gray-500 text-base max-w-xl font-medium">
            Find the perfect charging station near you and reserve your slot instantly. 
            Real-time availability, transparent pricing.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700">{activeCount} stations active</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 border border-blue-100 rounded-xl">
              <BatteryCharging size={13} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-700">{totalChargers} chargers free</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 border border-gray-100 rounded-xl">
              <Shield size={13} className="text-gray-500" />
              <span className="text-xs font-bold text-gray-600">Instant confirmation</span>
            </div>
          </div>
        </div>

        {/* ── Search & Filters ── */}
        <div className="sticky top-[72px] lg:top-[80px] z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="Search by station name, city, or address..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <XIcon size={12} className="text-gray-600" />
                </button>
              )}
            </div>

            {/* Filter toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 h-12 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  showFilters
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <SlidersHorizontal size={15} />
                Filters
                {(city !== 'All Cities' || plugType !== 'All Types') && (
                  <span className="w-5 h-5 rounded-full bg-white/20 text-[11px] font-bold flex items-center justify-center">
                    {(city !== 'All Cities' ? 1 : 0) + (plugType !== 'All Types' ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="h-12 pl-4 pr-8 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Expandable filter row */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">City</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="h-10 pl-3 pr-8 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Plug Type</label>
                <select
                  value={plugType}
                  onChange={e => setPlugType(e.target.value)}
                  className="h-10 pl-3 pr-8 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  {PLUG_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {(city !== 'All Cities' || plugType !== 'All Types') && (
                <button
                  onClick={() => { setCity('All Cities'); setPlugType('All Types') }}
                  className="self-end h-10 px-4 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Results ── */}
        <div className="pb-16">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-bold text-gray-500">
              <span className="text-gray-900">{filtered.length}</span> stations found
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
                <Search size={32} className="text-gray-200" />
              </div>
              <p className="text-lg font-bold text-gray-400 mb-2">No stations found</p>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Try adjusting your search or filters to find available charging stations.
              </p>
              <button
                onClick={() => { setSearch(''); setCity('All Cities'); setPlugType('All Types') }}
                className="mt-6 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(station => (
                <StationBookCard
                  key={station.id}
                  station={station}
                  stationChargers={chargers.filter(c => c.stationId === station.id)}
                  onBook={handleBook}
                />
              ))}
            </div>
          )}
        </div>

      </PageContainer>
    </PageWrapper>
  )
}
