import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin, X, ChevronRight, Search, Clock,
  Droplets, ParkingSquare, ShieldCheck,
  Lightbulb, Accessibility, ChevronLeft,
  SlidersHorizontal, Zap
} from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { getStations, deduplicateStations } from '../services/stationService'
import { useAuthStore } from '../store/authStore'

// ─── Constants ────────────────────────────────────────────────────────────────
const defaultCenter = [20.5937, 78.9629] // Center of India
const defaultZoom   = 5

const STATUS_CONFIG = {
  active:   { color: '#10B981', label: 'Active'   },
  busy:     { color: '#F59E0B', label: 'Busy'     },
  inactive: { color: '#EF4444', label: 'Inactive' },
  faulty:   { color: '#6B7280', label: 'Faulty'   },
}

const STATUS_TABS     = ['all', 'active', 'busy', 'inactive']
const CHARGER_TYPES   = ['All', 'CCS', 'CHAdeMO', 'Type 2', 'NACS']
const SORT_OPTIONS    = [
  { value: 'distance',   label: 'Distance'     },
  { value: 'rating',     label: 'Rating'       },
  { value: 'available',  label: 'Availability' },
]

// Demo charger type mapping (in real app comes from station.charger_types)
const STATION_CHARGER_TYPES = (station) => {
  const types = station.charger_types || station.plug_types
  if (Array.isArray(types) && types.length) return types.slice(0, 2)
  // Fallback pattern based on id hash so each station gets consistent types
  const h = (station.id || '').charCodeAt(0) % 3
  return [['CCS', 'T2'], ['CCS', 'CHAdeMO'], ['T2', 'NACS']][h] || ['CCS', 'T2']
}

// ─── Formatting helpers ────────────────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null
  const R    = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function fmtDist(km) {
  if (km == null || isNaN(km)) return null
  if (km < 1)   return '< 1 km'
  if (km > 100) return `${Math.round(km)} km`
  return `${km.toFixed(1)} km`
}

// ─── Leaflet icon setup ────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function createMarkerIcon(station) {
  const available = station.available_slots || 0
  const total = station.total_slots || 3
  
  let color = '#111827'  // available - dark
  if (available === 0) {
    color = '#9CA3AF'    // all busy - gray
  } else if (available < total / 2) {
    color = '#374151'    // half busy - medium
  }
  
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 10px;
        height: 10px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [10, 10],
    iconAnchor: [5, 5]
  })
}

// ─── Map sub-components ────────────────────────────────────────────────────────
function MapController({ station, onMoveEnd }) {
  const map    = useMap()
  const prevId = useRef(null)

  useEffect(() => {
    if (!station) return
    if (prevId.current === station.id) return
    prevId.current = station.id
    map.flyTo([station.lat, station.lng], 14, { animate: true, duration: 1.0 })
  }, [station, map])

  useEffect(() => {
    const fn = () => { const c = map.getCenter(); onMoveEnd?.([c.lat, c.lng], map.getZoom()) }
    map.on('moveend', fn)
    return () => map.off('moveend', fn)
  }, [map, onMoveEnd])

  return null
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: onMapClick })
  return null
}

function MapResetControl({ onReset }) {
  const map = useMap()
  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <button
        onClick={e => { e.stopPropagation(); map.flyTo(defaultCenter, defaultZoom, { animate: true, duration: 1.4 }); onReset?.() }}
        className="bg-white border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all shadow-sm flex items-center gap-1.5"
      >
        <MapPin size={12} /> All India
      </button>
    </div>
  )
}

// ─── UI atoms ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => <div className={`animate-pulse bg-gray-100 ${className}`} />

const StationSkeleton = () => (
  <div className="px-5 py-4 border-b border-gray-50">
    <Skeleton className="h-4 w-44 mb-2" />
    <Skeleton className="h-3 w-28 mb-3" />
    <div className="flex gap-2"><Skeleton className="h-5 w-12" /><Skeleton className="h-5 w-12" /></div>
  </div>
)

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-px">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating || 0) ? 'text-gray-700' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

// Dot availability indicator
function AvailDots({ total = 3, avail }) {
  const free = avail ?? total
  return (
    <div className="flex items-center gap-1">
      {Array(Math.min(total, 6)).fill(0).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${i < free ? 'bg-gray-900' : 'bg-gray-200'}`} />
      ))}
      <span className="text-xs text-gray-400 ml-0.5">{free} free</span>
    </div>
  )
}

// Charger type pill
function ChargerPill({ type }) {
  return (
    <span className="text-[10px] border border-gray-200 text-gray-500 px-1.5 py-0.5 leading-none tracking-wide">
      {type}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MapView() {
  const navigate  = useNavigate()
  const { role }  = useAuthStore()
  const location  = useLocation()
  const initQuery = new URLSearchParams(location.search).get('q') || ''

  // ── State ─────────────────────────────────────────────────────────────────
  const [selectedStation, setSelectedStation] = useState(null)
  const [showCard,        setShowCard]        = useState(false)

  const [search,          setSearch]          = useState(initQuery)
  const [statusTab,       setStatusTab]       = useState('all')
  const [showFilters,     setShowFilters]     = useState(false)
  const [localFilters,    setLocalFilters]    = useState({
    chargerType: 'All',
    sortBy:      'distance',
    onlyFree:    false,
  })

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileView,       setMobileView]       = useState('list')

  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [mapZoom,   setMapZoom]   = useState(defaultZoom)
  const [stations,  setStations]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [userLoc,   setUserLoc]   = useState(null)
  const [isFlying,  setIsFlying]  = useState(false)

  const listRef     = useRef(null)
  const itemRefs    = useRef({})

  const hasActiveFilters = localFilters.chargerType !== 'All' || localFilters.sortBy !== 'distance' || localFilters.onlyFree

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStationClick = useCallback((station) => {
    setSelectedStation(station)
    setShowCard(true)
    setIsFlying(true)
    setTimeout(() => setIsFlying(false), 1200)
    if (window.innerWidth < 768) setMobileView('map')
    itemRefs.current[station.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const handleCloseCard = useCallback(() => {
    setShowCard(false)
    setSelectedStation(null)
  }, [])

  const setFilter = (key, val) => setLocalFilters(p => ({ ...p, [key]: val }))

  // ── Fetch stations ─────────────────────────────────────────────────────────
  const fetchStations = useCallback(async (latArg, lngArg, zoomArg) => {
    const cached = localStorage.getItem('chargenet_stations')
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < 5 * 60 * 1000) { 
          setStations(deduplicateStations(data))
          setLoading(false)
          return 
        }
        setStations(deduplicateStations(data))
      } catch { /* ignore */ }
    }
    
    if (stations.length === 0) setLoading(true)
    
    try {
      const lat    = latArg  ?? mapCenter[0]
      const lng    = lngArg  ?? mapCenter[1]
      const zoom   = zoomArg ?? mapZoom
      const base   = Math.pow(2, 14 - zoom) * 2
      const radius = zoom < 8 ? Math.max(100, base) : Math.max(5, base)
      
      const res    = await getStations({ 
        lat, 
        lng, 
        radius: zoom >= 6 ? Math.min(1000, radius) : null,
        limit: 100
      })
      
      const data   = res.data || []
      const uniqueStations = deduplicateStations(data)
      
      setStations(uniqueStations)
      localStorage.setItem('chargenet_stations', JSON.stringify({ 
        data: uniqueStations, 
        timestamp: Date.now() 
      }))
    } catch (err) { 
      console.error('[MapView] Fetch error:', err) 
    } finally { 
      setLoading(false) 
    }
  }, [mapCenter, mapZoom, stations.length])

  // ── Geolocation on mount ───────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Find Stations — ChargeNet'
    const fallback = () => {
      setUserLoc({ lat: defaultCenter[0], lng: defaultCenter[1] })
      fetchStations(defaultCenter[0], defaultCenter[1], defaultZoom)
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => { setUserLoc({ lat: coords.latitude, lng: coords.longitude }); fetchStations(defaultCenter[0], defaultCenter[1], defaultZoom) },
        fallback
      )
    } else fallback()
  }, []) // eslint-disable-line

  // ── Re-fetch on map move ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => fetchStations(), 1400)
    return () => clearTimeout(t)
  }, [mapCenter, mapZoom]) // eslint-disable-line

  // ── Filtered + sorted list ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = [...stations]

    if (statusTab === 'active') r = r.filter(s => (s.available_slots || 0) > 0)
    if (statusTab === 'busy') r = r.filter(s => (s.available_slots || 0) === 0 && s.status !== 'inactive')
    if (statusTab === 'inactive') r = r.filter(s => s.status === 'inactive')

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.address || '').toLowerCase().includes(q)
      )
    }

    // Only free
    if (localFilters.onlyFree) r = r.filter(s => (s.available_slots ?? 1) > 0)

    // Charger type (demo filter — real data would check station.charger_types)
    if (localFilters.chargerType !== 'All') {
      r = r.filter(s => {
        const types = STATION_CHARGER_TYPES(s).join(' ').toLowerCase()
        return types.includes(localFilters.chargerType.toLowerCase().replace(' ', '').replace('type2', 't2'))
      })
    }

    // Sort
    const distOf = s => haversine(userLoc?.lat, userLoc?.lng, s.lat, s.lng) ?? 9999
    if (localFilters.sortBy === 'distance')  r.sort((a, b) => distOf(a) - distOf(b))
    if (localFilters.sortBy === 'rating')    r.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    if (localFilters.sortBy === 'available') r.sort((a, b) => (b.available_slots || 0) - (a.available_slots || 0))

    return r
  }, [stations, statusTab, search, localFilters, userLoc])

  // ── Tab counts ─────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all:      stations.length,
    active:   stations.filter(s => (s.available_slots || 0) > 0).length,
    busy:     stations.filter(s => (s.available_slots || 0) === 0 && s.status !== 'inactive').length,
    inactive: stations.filter(s => s.status === 'inactive').length,
  }), [stations])

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden" style={{ paddingTop: 72 }}>
      <Navbar solid={true} />

      {/* ── Inline keyframes ── */}
      <style>{`
        @keyframes markerPulse {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0;   }
        }
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(18px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);    }
        }
        .card-slide-up { animation: cardSlideUp 0.22s ease-out forwards; }
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
        .city-header { position: sticky; top: 0; z-index: 10; }
      `}</style>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">

        {/* ── Mobile tab bar ── */}
        <div className="flex md:hidden border-b border-gray-100 bg-white flex-shrink-0">
          {['list', 'map'].map(v => (
            <button key={v} onClick={() => setMobileView(v)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize ${mobileView === v ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400'}`}>
              {v} View
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════ */}
        <div
          className={`w-full md:w-[340px] flex-shrink-0 bg-white border-r border-gray-100 flex-col h-full z-20 transition-all duration-300 ${mobileView === 'map' ? 'hidden md:flex' : 'flex'}`}
          style={{ width: sidebarCollapsed ? 0 : 340, minWidth: sidebarCollapsed ? 0 : 340, overflow: 'hidden' }}
        >

          {/* ── Search bar (Improvement 7) ── */}
          <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="Search stations or cities…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors bg-white placeholder-gray-300"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* ── Status tabs ── */}
          <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'busy', label: 'Busy' },
                { key: 'inactive', label: 'Inactive' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusTab(tab.key)}
                  className={`px-3 py-1.5 text-xs transition-all ${
                    statusTab === tab.key
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab.label} ({counts[tab.key]})
                </button>
              ))}
            </div>
          </div>

          {/* ── Count + Filter toggle (Improvement 8) ── */}
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-800">{filtered.length}</span> stations found
            </p>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 transition-all ${showFilters ? 'bg-gray-900 text-white' : 'text-gray-500 border border-gray-200 hover:border-gray-400'}`}>
              <SlidersHorizontal size={12} />
              Filters
              {hasActiveFilters && <span className="w-1.5 h-1.5 bg-gray-900 rounded-full" />}
            </button>
          </div>

          {/* ── Filter panel (Improvement 6) ── */}
          {showFilters && (
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 flex-shrink-0 space-y-3">

              {/* Charger type */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Charger Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {CHARGER_TYPES.map(t => (
                    <button key={t}
                      onClick={() => setFilter('chargerType', t)}
                      className={`text-[11px] px-2.5 py-1 transition-all ${
                        localFilters.chargerType === t
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-200 text-gray-500 hover:border-gray-400 bg-white'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort by */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sort By</p>
                <div className="flex gap-1.5">
                  {SORT_OPTIONS.map(o => (
                    <button key={o.value}
                      onClick={() => setFilter('sortBy', o.value)}
                      className={`text-[11px] px-2.5 py-1 transition-all ${
                        localFilters.sortBy === o.value
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-200 text-gray-500 hover:border-gray-400 bg-white'
                      }`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Only free toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('onlyFree', !localFilters.onlyFree)}
                  className={`w-8 h-4 rounded-full transition-all relative ${localFilters.onlyFree ? 'bg-gray-900' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${localFilters.onlyFree ? 'left-4' : 'left-0.5'}`} />
                </button>
                <span className="text-xs text-gray-500">Available now only</span>
              </div>

              <button onClick={() => setLocalFilters({ chargerType: 'All', sortBy: 'distance', onlyFree: false })}
                className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors">
                Clear all filters
              </button>
            </div>
          )}

          {/* ── Station list (Improvements 1–5, 9, 10) ── */}
          <div className="flex-1 overflow-y-auto sidebar-scroll" ref={listRef}>
            {loading && stations.length === 0
              ? Array(7).fill(0).map((_, i) => <StationSkeleton key={i} />)
              : filtered.length === 0
              ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                  <MapPin size={28} className="text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-600">No stations found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search</p>
                </div>
              )
              : (() => {
                  // ── City grouping (Improvement 10) ──
                  let lastCity = null
                  return filtered.map((station) => {
                    const isSelected   = selectedStation?.id === station.id
                    const distKm       = haversine(userLoc?.lat, userLoc?.lng, station.lat, station.lng)
                    const distLabel    = fmtDist(distKm)
                    const reviewCount  = station.review_count || station.totalReviews || 0
                    const total        = station.total_slots  ?? 3
                    const avail        = station.available_slots ?? total
                    const chargerTypes = STATION_CHARGER_TYPES(station)
                    const showCity     = station.city !== lastCity
                    lastCity           = station.city

                    return (
                      <React.Fragment key={station.id}>

                        {/* ── City group header (Improvement 10) ── */}
                        {showCity && (
                          <div className="city-header px-5 py-1.5 bg-gray-50 border-b border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{station.city}</p>
                          </div>
                        )}

                        {/* ── Station card (Improvements 1, 2, 3, 4, 5, 9) ── */}
                        <div
                          ref={el => itemRefs.current[station.id] = el}
                          onClick={() => handleStationClick(station)}
                          className={`px-5 py-3.5 cursor-pointer border-b border-gray-50 transition-all duration-150 active:bg-gray-100 border-l-2 ${
                            isSelected
                              ? 'bg-gray-50/80 border-l-gray-900'
                              : 'border-l-transparent hover:bg-gray-50 hover:border-l-gray-200'
                          }`}
                        >
                          {/* Row 1: Name */}
                          <div className="flex items-start justify-between mb-1.5">
                            <p className="text-sm font-normal text-gray-900 leading-snug pr-4 flex-1">
                              {station.name}
                            </p>
                            {/* Availability dots */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {Array(total)
                                .fill(0)
                                .map((_, i) => {
                                  const occupied = Math.round((total - avail) * 0.75)
                                  
                                  let dotColor = 'bg-gray-900'
                                  if (i >= avail && i < avail + occupied) {
                                    dotColor = 'bg-gray-300'
                                  } else if (i >= avail + occupied) {
                                    dotColor = 'bg-red-300'
                                  }
                                  
                                  return (
                                    <div 
                                      key={i}
                                      title={
                                        i < avail 
                                          ? 'Available' 
                                          : i < avail + occupied
                                          ? 'Occupied'
                                          : 'Faulty'
                                      }
                                      className={`w-2 h-2 rounded-full ${dotColor}`}>
                                    </div>
                                  )
                                })}
                            </div>
                          </div>

                          {/* Row 2: City + distance */}
                          <p className="text-xs text-gray-400 mb-2">
                            {station.city}
                            {distLabel && <span className="text-gray-300"> · </span>}
                            {distLabel && <span>{distLabel}</span>}
                          </p>

                          {/* Row 3: Bottom row with text and price */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${
                                avail === 0
                                  ? 'text-red-500'
                                  : avail <= 1
                                  ? 'text-yellow-600'
                                  : 'text-gray-700'
                              }`}>
                                {avail === 0 ? 'All in use' : `${avail} free`}
                              </span>
                              <span className="text-gray-200 text-xs">·</span>
                              <span className="text-xs text-gray-400">{total} total</span>
                            </div>
                            <span className="text-xs text-gray-400">from ₹8.50/kWh</span>
                          </div>
                        </div>
                      </React.Fragment>
                    )
                  })
                })()
            }
            <div className="px-5 py-8 flex justify-center border-t border-gray-50 bg-white">
              <span 
                onClick={() => navigate(role === 'owner' ? '/dashboard' : '/user-dashboard')}
                style={{ 
                  color: '#aaa', 
                  fontSize: '13px', 
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                View all in dashboard
              </span>
            </div>
          </div>
        </div>

        {/* ── Sidebar collapse toggle ── */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-5 h-10 bg-white border border-gray-200 shadow-md text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all"
          style={{ left: sidebarCollapsed ? 0 : 340 }}
        >
          <ChevronLeft size={13} className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* ══════════════════════════════════════
            MAP AREA
        ══════════════════════════════════════ */}
        <div className={`flex-1 relative ${mobileView === 'list' ? 'hidden md:block' : 'block'}`}>

          {/* Flying toast */}
          {isFlying && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1002] bg-white border border-gray-200 px-4 py-2 flex items-center gap-2 shadow-sm pointer-events-none">
              <div className="w-3 h-3 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
              <span className="text-xs font-medium text-gray-600">Navigating to station…</span>
            </div>
          )}

          <MapContainer center={defaultCenter} zoom={defaultZoom} className="w-full h-full" zoomControl={false}>
            <ZoomControl position="bottomright" />
            <MapResetControl onReset={handleCloseCard} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapController station={selectedStation} onMoveEnd={(c, z) => { setMapCenter(c); setMapZoom(z) }} />
            <MapClickHandler onMapClick={handleCloseCard} />

            {filtered.map(station => (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={createMarkerIcon(station)}
                eventHandlers={{ click: () => handleStationClick(station) }}
              />
            ))}
          </MapContainer>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-[1001] flex items-center justify-center">
              <div className="bg-white p-5 shadow-xl border border-gray-100 flex flex-col items-center">
                <div className="w-7 h-7 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mb-2.5" />
                <p className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">Updating Stations…</p>
              </div>
            </div>
          )}

          {/* Legend (hidden when card open) */}
          {!showCard && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-100 p-3 z-[1000] shadow-lg">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Status</p>
              {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                <div key={s} className="flex items-center gap-2 mb-1.5 last:mb-0">
                  <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                  <span className="text-xs text-gray-500">{cfg.label}</span>
                  <span className="ml-auto text-xs text-gray-400 font-semibold">{counts[s] ?? 0}</span>
                </div>
              ))}
              <div className="h-px bg-gray-100 my-2" />
              <div className="text-[11px] text-gray-400">Total: <span className="font-semibold text-gray-600">{stations.length}</span></div>
            </div>
          )}

          {/* ══════════════════════════════════════
              STATION PREVIEW CARD
          ══════════════════════════════════════ */}
          {showCard && selectedStation && (() => {
            return (
              <div
                key={selectedStation.id}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1002] w-72 bg-white border border-gray-200 shadow-lg animate-slide-up"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-3">
                      <p className="text-sm font-medium text-gray-900 leading-snug mb-0.5">
                        {selectedStation.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {selectedStation.city}
                      </p>
                    </div>
                    <button
                      onClick={handleCloseCard}
                      className="text-gray-300 hover:text-gray-600 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Availability */}
                <div className="p-4 border-b border-gray-100">
                  {/* Status bar */}
                  <div className="flex gap-1 mb-2">
                    {Array(selectedStation.total_slots || 3).fill(0).map((_, i) => {
                      const avail = selectedStation.available_slots || 0
                      const total = selectedStation.total_slots || 3
                      const occupied = Math.round((total - avail) * 0.75)
                      
                      let barColor = 'bg-gray-900'
                      if (i >= avail && i < avail + occupied) {
                        barColor = 'bg-gray-300'
                      } else if (i >= avail + occupied) {
                        barColor = 'bg-red-200'
                      }
                      
                      return <div key={i} className={`h-1 flex-1 ${barColor}`}></div>
                    })}
                  </div>
                  
                  {/* Availability text */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                        {selectedStation.available_slots || 0}{' '}free
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        {(selectedStation.total_slots || 3) - (selectedStation.available_slots || 0)} in use
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {selectedStation.total_slots || 3} total
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/book/${selectedStation.id}`)}
                    className="flex-1 border border-gray-200 text-gray-600 py-2 text-xs font-normal hover:border-gray-400 transition-colors">
                    Book slot
                  </button>
                  <button
                    onClick={() => navigate(`/station/${selectedStation.slug || selectedStation.id}`)}
                    className="flex-1 bg-gray-900 text-white py-2 text-xs font-normal hover:bg-black transition-colors">
                    View details
                  </button>
                </div>
              </div>
            )
          })()}

        </div>{/* /map area */}
      </div>
    </div>
  )
}
