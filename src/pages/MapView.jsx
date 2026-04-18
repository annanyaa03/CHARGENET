import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin, Star, X, ChevronRight, Search,
  Clock, Droplets, ParkingSquare,
  ShieldCheck, Lightbulb, Accessibility, ChevronLeft,
  SlidersHorizontal
} from 'lucide-react'
import { useMapStore } from '../store/mapStore'
import { Navbar } from '../components/layout/Navbar'
import { getStations } from '../services/stationService'

const defaultCenter = [20.5937, 78.9629]
const defaultZoom = 5

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const STATUS_CONFIG = {
  active:   { color: '#10B981', label: 'Active'   },
  busy:     { color: '#F59E0B', label: 'Busy'     },
  inactive: { color: '#EF4444', label: 'Inactive' },
  faulty:   { color: '#6B7280', label: 'Faulty'   },
}

const createMarkerIcon = (isSelected) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${isSelected ? '18px' : '12px'};
        height: ${isSelected ? '18px' : '12px'};
        background: ${isSelected ? '#111' : '#374151'};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        transition: all 0.25s ease;
      "></div>
      ${isSelected ? `
        <div style="
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 36px; height: 36px;
          border: 2px solid rgba(17,17,17,0.35);
          border-radius: 50%;
          animation: markerPulse 1.5s ease-out infinite;
        "></div>
      ` : ''}
    `,
    iconSize: [isSelected ? 18 : 12, isSelected ? 18 : 12],
    iconAnchor: [isSelected ? 9 : 6, isSelected ? 9 : 6],
  })
}

// ── Flies to the selected station whenever it changes ──
function MapController({ station, onMoveEnd }) {
  const map = useMap()
  const prevId = useRef(null)

  useEffect(() => {
    if (!station) return
    if (prevId.current === station.id) return
    prevId.current = station.id
    map.flyTo([station.lat, station.lng], 14, { animate: true, duration: 1.0 })
  }, [station, map])

  useEffect(() => {
    const handleMove = () => {
      const c = map.getCenter()
      onMoveEnd?.([c.lat, c.lng], map.getZoom())
    }
    map.on('moveend', handleMove)
    return () => map.off('moveend', handleMove)
  }, [map, onMoveEnd])

  return null
}

// ── Closes card when user clicks the map background ──
function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: onMapClick })
  return null
}

// ── "All India" reset button rendered inside the map ──
function MapResetControl({ onReset }) {
  const map = useMap()
  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <button
        onClick={(e) => {
          e.stopPropagation()
          map.flyTo(defaultCenter, defaultZoom, { animate: true, duration: 1.5 })
          onReset?.()
        }}
        className="bg-white border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all shadow-sm flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
        </svg>
        All India
      </button>
    </div>
  )
}

const facilityIcons = {
  restrooms:        { icon: Droplets,      label: 'Restrooms'       },
  drinkingWater:    { icon: Droplets,      label: 'Water'           },
  coveredParking:   { icon: ParkingSquare, label: 'Covered Parking' },
  cctv:             { icon: ShieldCheck,   label: 'CCTV'            },
  nightLighting:    { icon: Lightbulb,     label: 'Night Lighting'  },
  wheelchairAccess: { icon: Accessibility, label: 'Accessible'      },
}

const STATUS_TABS = ['all', 'active', 'busy', 'inactive']

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 ${className}`}></div>
)
const StationSkeleton = () => (
  <div className="py-5 border-b border-gray-100 px-4">
    <Skeleton className="h-4 w-48 mb-2" />
    <Skeleton className="h-3 w-32 mb-3" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
    </div>
  </div>
)

const StarRow = ({ rating, size = 'w-3 h-3' }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`${size} ${s <= Math.round(rating || 0) ? 'text-gray-700' : 'text-gray-200'}`}
        fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </div>
)

// ─── Haversine distance ───────────────────────────────────────────────────────
function calcDist(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1)
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MapView() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const initQuery  = new URLSearchParams(location.search).get('q') || ''

  // ── Global store (only used for filters) ─────────────────────────────────
  const { filters, setFilter, resetFilters } = useMapStore()

  // ── Local state ───────────────────────────────────────────────────────────
  const [selectedStation, setSelectedStation] = useState(null)
  const [showCard,        setShowCard]        = useState(false)

  const [searchQuery,      setSearchQuery]      = useState(initQuery)
  const [statusTab,        setStatusTab]        = useState('all')
  const [showFilters,      setShowFilters]      = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [view,             setView]             = useState('list')   // 'list' | 'map' (mobile)
  const [mapCenter,        setMapCenter]        = useState(defaultCenter)
  const [mapZoom,          setMapZoom]          = useState(defaultZoom)
  const [stations,         setStations]         = useState([])
  const [loading,          setLoading]          = useState(true)
  const [userLocation,     setUserLocation]     = useState(null)
  const [isFlying,         setIsFlying]         = useState(false)

  const listRef       = useRef(null)
  const stationRefs   = useRef({})

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStationClick = useCallback((station) => {
    setSelectedStation(station)
    setShowCard(true)
    setIsFlying(true)
    setTimeout(() => setIsFlying(false), 1200)

    // On mobile: switch to map view so card is visible
    if (window.innerWidth < 768) setView('map')

    // Scroll list item into view
    const el = stationRefs.current[station.id]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const handleCloseCard = useCallback(() => {
    setShowCard(false)
    setSelectedStation(null)
  }, [])

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = [...stations]
    if (statusTab !== 'all') r = r.filter(s => s.status === statusTab)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      r = r.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.address || '').toLowerCase().includes(q)
      )
    }
    if (filters.availability === 'available') r = r.filter(s => (s.available_slots ?? 1) > 0)
    return r
  }, [stations, statusTab, searchQuery, filters])

  // ── Fetch stations ────────────────────────────────────────────────────────
  const fetchStations = useCallback(async (latArg, lngArg, zoomArg) => {
    const cached = localStorage.getItem('chargenet_stations')
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setStations(data); setLoading(false); return
        }
        setStations(data) // show stale while re-fetching
      } catch { /* ignore */ }
    }
    if (stations.length === 0) setLoading(true)
    try {
      const lat    = latArg  ?? mapCenter[0]
      const lng    = lngArg  ?? mapCenter[1]
      const zoom   = zoomArg ?? mapZoom
      const base   = Math.pow(2, 14 - zoom) * 2
      const radius = zoom < 8 ? Math.max(100, base) : Math.max(5, base)
      const res    = await getStations({ lat, lng, radius: zoom >= 6 ? Math.min(1000, radius) : null })
      const data   = res.data || []
      setStations(data)
      localStorage.setItem('chargenet_stations', JSON.stringify({ data, timestamp: Date.now() }))
    } catch (err) {
      console.error('Failed to fetch stations:', err)
    } finally {
      setLoading(false)
    }
  }, [mapCenter, mapZoom, stations.length])

  // ── Initial geolocation ───────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Find Stations — ChargeNet'
    const fallback = () => {
      setUserLocation({ lat: defaultCenter[0], lng: defaultCenter[1] })
      fetchStations(defaultCenter[0], defaultCenter[1], defaultZoom)
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setUserLocation({ lat: coords.latitude, lng: coords.longitude })
          fetchStations(defaultCenter[0], defaultCenter[1], defaultZoom)
        },
        fallback
      )
    } else fallback()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced re-fetch on map move ────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => fetchStations(), 1200)
    return () => clearTimeout(t)
  }, [mapCenter, mapZoom]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Counts for tabs ───────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all:      stations.length,
    active:   stations.filter(s => s.status === 'active').length,
    busy:     stations.filter(s => s.status === 'busy').length,
    inactive: stations.filter(s => s.status === 'inactive').length,
  }), [stations])

  const AVAIL_OPTIONS = [
    { value: 'all',       label: 'All Stations'   },
    { value: 'available', label: 'Available Now'  },
  ]

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden" style={{ paddingTop: 72 }}>
      <Navbar solid={true} />

      {/* Global inline styles */}
      <style>{`
        @keyframes markerPulse {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.6; }
          100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0;   }
        }
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);    }
        }
        .card-slide-up {
          animation: cardSlideUp 0.25s ease-out forwards;
        }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
      `}</style>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">

        {/* ── Mobile tab switcher ── */}
        <div className="flex md:hidden border-b border-gray-100 bg-white flex-shrink-0">
          <button onClick={() => setView('list')}
            className={`flex-1 py-3 text-xs font-medium ${view === 'list' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400'}`}>
            List View
          </button>
          <button onClick={() => setView('map')}
            className={`flex-1 py-3 text-xs font-medium ${view === 'map' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400'}`}>
            Map View
          </button>
        </div>

        {/* ════════════════════════════════════════
            SIDEBAR
        ════════════════════════════════════════ */}
        <div
          className={`w-full md:w-[340px] flex-shrink-0 bg-white border-r border-gray-100 flex-col transition-all duration-300 h-full z-20 ${view === 'map' ? 'hidden md:flex' : 'flex'}`}
          style={{ width: sidebarCollapsed ? 0 : 340, minWidth: sidebarCollapsed ? 0 : 340, overflow: 'hidden' }}
        >
          {/* Search */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search stations, cities…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {STATUS_TABS.map(tab => {
                const cfg    = STATUS_CONFIG[tab]
                const active = statusTab === tab
                return (
                  <button key={tab} onClick={() => setStatusTab(tab)}
                    className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? tab === 'all' ? 'bg-gray-900 text-white' : 'text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    style={active && tab !== 'all' ? { background: cfg.color } : {}}>
                    {tab === 'all' ? `All (${counts.all})` : `${cfg.label} (${counts[tab]})`}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filters row */}
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <span className="text-xs text-gray-500 font-medium">
              {filtered.length} station{filtered.length !== 1 ? 's' : ''} found
            </span>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 transition-all ${showFilters ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <SlidersHorizontal size={13} /> Filters
            </button>
          </div>

          {showFilters && (
            <div className="px-5 py-4 bg-gray-50/50 flex-shrink-0 space-y-4 border-b border-gray-100">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Availability</label>
                <div className="flex gap-2 mt-2">
                  {AVAIL_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => setFilter('availability', o.value)}
                      className={`flex-1 py-1.5 text-xs font-semibold transition-all ${
                        filters.availability === o.value
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                      }`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={resetFilters}
                className="text-xs text-red-500 hover:text-red-600 font-medium">
                Reset all filters
              </button>
            </div>
          )}

          {/* ── Station List ── */}
          <div className="flex-1 overflow-y-auto sidebar-scroll" ref={listRef}>
            {loading && stations.length === 0
              ? Array(6).fill(0).map((_, i) => <StationSkeleton key={i} />)
              : filtered.length === 0
              ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                  <MapPin size={32} className="text-gray-300 mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No stations found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query</p>
                </div>
              )
              : filtered.map(station => {
                const isSelected = selectedStation?.id === station.id
                const dist       = calcDist(userLocation?.lat, userLocation?.lng, station.lat, station.lng)
                return (
                  <div
                    key={station.id}
                    ref={el => stationRefs.current[station.id] = el}
                    onClick={() => handleStationClick(station)}
                    className={`px-5 py-4 cursor-pointer border-b border-gray-50 transition-all duration-150 active:bg-gray-100 border-l-2 ${
                      isSelected
                        ? 'bg-gray-50 border-l-gray-900 pl-4'
                        : 'border-l-transparent hover:bg-gray-50 hover:border-l-gray-300'
                    }`}
                  >
                    {/* Name + status badge */}
                    <div className="flex items-start justify-between mb-1">
                      <p className={`text-sm leading-snug pr-4 ${isSelected ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                        {station.name}
                      </p>
                      <span className="text-[10px] border border-gray-200 text-gray-400 px-2 py-0.5 flex-shrink-0 uppercase tracking-wider">
                        {station.status}
                      </span>
                    </div>

                    {/* City + distance */}
                    <p className="text-xs text-gray-400 mb-2">
                      {station.city}{dist ? ` · ${dist} km` : ''}
                    </p>

                    {/* Stars + free slots */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <StarRow rating={station.rating} />
                        <span className="text-xs text-gray-400 ml-1">
                          {station.review_count || station.totalReviews || 0} reviews
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {station.available_slots ?? station.total_slots ?? 2}/
                        {station.total_slots ?? 3} free
                      </span>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>

        {/* ── Sidebar collapse toggle ── */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-6 h-10 bg-white border border-gray-200 shadow-md text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all"
          style={{ left: sidebarCollapsed ? 0 : 340 }}
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* ════════════════════════════════════════
            MAP AREA
        ════════════════════════════════════════ */}
        <div className={`flex-1 relative ${view === 'list' ? 'hidden md:block' : 'block'}`}>

          {/* "Navigating…" toast */}
          {isFlying && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1002] bg-white border border-gray-200 px-4 py-2 flex items-center gap-2 shadow-sm pointer-events-none rounded-xl">
              <div className="w-3 h-3 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
              <span className="text-xs font-semibold text-gray-700">Navigating to station…</span>
            </div>
          )}

          {/* Leaflet map */}
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            className="w-full h-full"
            zoomControl={false}
          >
            <ZoomControl position="bottomright" />
            <MapResetControl onReset={handleCloseCard} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapController
              station={selectedStation}
              onMoveEnd={(c, z) => { setMapCenter(c); setMapZoom(z) }}
            />
            {/* Close card when clicking empty map area */}
            <MapClickHandler onMapClick={handleCloseCard} />

            {/* Markers — no Popup, card handles everything */}
            {filtered.map(station => (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={createMarkerIcon(selectedStation?.id === station.id)}
                eventHandlers={{ click: () => handleStationClick(station) }}
              />
            ))}
          </MapContainer>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-[1001] flex items-center justify-center">
              <div className="bg-white p-5 shadow-2xl border border-gray-100 flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">Updating Stations…</p>
              </div>
            </div>
          )}

          {/* Legend (hidden when card is open) */}
          {!showCard && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-100 p-3.5 z-[1000] shadow-lg">
              <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2.5">Station Status</p>
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                <div key={status} className="flex items-center gap-2 mb-1.5 last:mb-0">
                  <div className="w-2 h-2 flex-shrink-0" style={{ background: cfg.color }} />
                  <span className="text-xs text-gray-600 font-medium">{cfg.label}</span>
                  <span className="ml-auto text-xs text-gray-400 font-semibold">{counts[status] ?? 0}</span>
                </div>
              ))}
              <div className="h-px bg-gray-100 my-2" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-900" />
                <span className="text-[11px] text-gray-500">Total: {stations.length}</span>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              STATION PREVIEW CARD (slides up from bottom)
          ════════════════════════════════════════ */}
          {showCard && selectedStation && (() => {
            const cfg   = STATUS_CONFIG[selectedStation.status] || STATUS_CONFIG.inactive
            const dist  = calcDist(userLocation?.lat, userLocation?.lng, selectedStation.lat, selectedStation.lng)
            const total = selectedStation.total_slots ?? 3
            const avail = selectedStation.available_slots ?? total

            return (
              <div
                key={selectedStation.id}
                className="card-slide-up absolute bottom-6 left-1/2 w-80 bg-white border border-gray-200 shadow-xl z-[1002] overflow-hidden"
                style={{ transform: 'translateX(-50%)' }}
                onClick={e => e.stopPropagation()} // prevent MapClickHandler from firing
              >
                {/* Top status colour bar */}
                <div className="h-1 w-full" style={{ background: cfg.color }} />

                {/* Header */}
                <div className="flex items-start justify-between p-4 border-b border-gray-100">
                  <div className="flex-1 pr-3 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-snug mb-1 truncate">
                      {selectedStation.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {selectedStation.address}, {selectedStation.city}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseCard}
                    className="flex-shrink-0 w-7 h-7 bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-4 border-b border-gray-100 space-y-3">

                  {/* Status + distance */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                      <span className="text-xs text-gray-600 capitalize font-medium">{selectedStation.status}</span>
                    </div>
                    {dist && (
                      <span className="text-xs text-gray-400">{dist} km away</span>
                    )}
                  </div>

                  {/* Availability bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-400">Availability</span>
                      <span className="text-xs font-medium text-gray-700">{avail}/{total} free</span>
                    </div>
                    <div className="flex gap-1">
                      {Array(total).fill(0).map((_, i) => (
                        <div key={i}
                          className={`h-1 flex-1 ${i < avail ? 'bg-gray-900' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    <StarRow rating={selectedStation.rating} />
                    <span className="text-xs text-gray-400 ml-0.5">
                      {(selectedStation.rating || 0).toFixed(1)} · {selectedStation.review_count || selectedStation.totalReviews || 0} reviews
                    </span>
                  </div>

                  {/* Open hours */}
                  {selectedStation.openHours && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={12} className="text-gray-400" />
                      <span>Open: {selectedStation.openHours}</span>
                    </div>
                  )}
                </div>

                {/* Footer — action buttons */}
                <div className="p-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/book/${selectedStation.id}`)}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 text-xs font-medium hover:border-gray-400 hover:text-gray-900 transition-all"
                  >
                    Book slot
                  </button>
                  <button
                    onClick={() => navigate(`/station/${selectedStation.slug || selectedStation.id}`)}
                    className="flex-1 bg-gray-900 text-white py-2.5 text-xs font-medium hover:bg-black transition-all flex items-center justify-center gap-1"
                  >
                    View full details
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )
          })()}

        </div>{/* end map area */}
      </div>
    </div>
  )
}
