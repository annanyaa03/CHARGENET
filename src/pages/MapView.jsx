import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin, Star, Filter, X, ChevronRight, Zap, Search,
  Navigation2, Clock, Wifi, Droplets, ParkingSquare,
  ShieldCheck, Lightbulb, Accessibility, ChevronLeft,
  BatteryCharging, SlidersHorizontal, CheckCircle2
} from 'lucide-react'
import { useMapStore } from '../store/mapStore'
import { formatDistance } from '../utils/plugTypes'
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
  active:   { color: '#10B981', bg: '#D1FAE5', label: 'Active',    ring: '#6EE7B7' },
  busy:     { color: '#F59E0B', bg: '#FEF3C7', label: 'Busy',      ring: '#FCD34D' },
  inactive: { color: '#EF4444', bg: '#FEE2E2', label: 'Inactive',  ring: '#FCA5A5' },
  faulty:   { color: '#6B7280', bg: '#F3F4F6', label: 'Faulty',    ring: '#D1D5DB' },
}

const createMarkerIcon = (isSelected) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${isSelected ? '16px' : '12px'};
        height: ${isSelected ? '16px' : '12px'};
        background: ${isSelected ? '#111' : '#374151'};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        ${isSelected ? `
          animation: pulse 1.5s ease infinite;
        ` : ''}
      "></div>
      ${isSelected ? `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          border: 2px solid #111;
          border-radius: 50%;
          animation: ripple 1.5s ease infinite;
          opacity: 0.4;
        "></div>
      ` : ''}
    `,
    iconSize: [isSelected ? 16 : 12, isSelected ? 16 : 12],
    iconAnchor: [isSelected ? 8 : 6, isSelected ? 8 : 6]
  })
}

function MapResetControl({ onReset }) {
  const map = useMap()
  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <button
        onClick={(e) => {
          e.stopPropagation()
          map.flyTo([20.5937, 78.9629], 5, { animate: true, duration: 1.5 })
          if (onReset) onReset()
        }}
        className="bg-white border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all shadow-sm flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
        </svg>
        All India
      </button>
    </div>
  )
}

function MapController({ center, zoom, onMoveEnd, station }) {
  const map = useMap()
  const prevStation = useRef(null)
  
  useEffect(() => {
    if (station) {
      if (prevStation.current?.id === station.id) return
      prevStation.current = station
      
      map.flyTo([station.lat, station.lng], 15, { animate: true, duration: 1.2, easeLinearity: 0.25 })
    } else if (center) {
      map.setView(center, zoom, { animate: true })
      prevStation.current = null
    }
  }, [center, zoom, map, station])

  useEffect(() => {
    const handleMove = () => {
      const newCenter = map.getCenter()
      const newZoom = map.getZoom()
      onMoveEnd?.([newCenter.lat, newCenter.lng], newZoom)
    }
    map.on('moveend', handleMove)
    return () => map.off('moveend', handleMove)
  }, [map, onMoveEnd])

  return null
}

// Intentionally removed: map click used to zoom + interfere with card visibility

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={11}
          className={s <= Math.round(rating) ? 'text-gray-700 fill-gray-700' : 'text-gray-400'} />
      ))}
    </div>
  )
}

const facilityIcons = {
  restrooms:       { icon: Droplets,       label: 'Restrooms' },
  drinkingWater:   { icon: Droplets,       label: 'Water' },
  coveredParking:  { icon: ParkingSquare,  label: 'Covered Parking' },
  cctv:            { icon: ShieldCheck,    label: 'CCTV' },
  nightLighting:   { icon: Lightbulb,      label: 'Night Lighting' },
  wheelchairAccess:{ icon: Accessibility,  label: 'Accessible' },
}

const STATUS_TABS = ['all', 'active', 'busy', 'inactive', 'faulty']

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

export default function MapView() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialQuery = queryParams.get('q') || ''

  const { selectedStation, setSelectedStation, clearSelectedStation, filters, setFilter, resetFilters } = useMapStore()
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [statusTab, setStatusTab] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [view, setView] = useState('list')
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [mapZoom, setMapZoom] = useState(defaultZoom)
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [isFlying, setIsFlying] = useState(false)
  const [cardTop, setCardTop] = useState(16)
  const listRef = useRef(null)
  const stationRefs = useRef({})
  const mapContainerRef = useRef(null)

  const updateCardPosition = useCallback(() => {
    if (selectedStation?.id && stationRefs.current[selectedStation.id] && mapContainerRef.current) {
      const itemNode = stationRefs.current[selectedStation.id]
      if (!itemNode.isConnected) return

      const itemRect = itemNode.getBoundingClientRect()
      const mapRect = mapContainerRef.current.getBoundingClientRect()
      
      let newTop = itemRect.top - mapRect.top
      
      const minTop = 16
      const maxTop = Math.max(16, mapRect.height - 380)
      
      if (newTop < minTop) newTop = minTop
      if (newTop > maxTop) newTop = maxTop
      
      setCardTop(newTop)
    }
  }, [selectedStation])

  useEffect(() => {
    const listEl = listRef.current
    if (listEl) {
      listEl.addEventListener('scroll', updateCardPosition)
      window.addEventListener('resize', updateCardPosition)
      updateCardPosition()
      return () => {
        listEl.removeEventListener('scroll', updateCardPosition)
        window.removeEventListener('resize', updateCardPosition)
      }
    }
  }, [updateCardPosition, selectedStation])

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return null
    
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return (R * c).toFixed(1)
  }

  const filtered = useMemo(() => {
    let result = [...stations]
    if (statusTab !== 'all') result = result.filter(s => s.status === statusTab)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
      )
    }
    if (filters.availability === 'available') result = result.filter(s => s.availableChargers > 0)
    return result
  }, [stations, statusTab, searchQuery, filters])

  const fetchStations = useCallback(async (latArg, lngArg, zoomArg) => {
    // Step 1: Load from cache INSTANTLY
    const cached = localStorage.getItem('chargenet_stations')
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        const isOld = Date.now() - timestamp > 5 * 60 * 1000 // 5 minutes
        
        if (!isOld) {
          // Use fresh cached data immediately
          setStations(data)
          setLoading(false)
          return 
        } else {
          // Show stale cache while fetching fresh data
          setStations(data)
        }
      } catch (e) {
        console.error('Cache parse error:', e)
      }
    }

    if (stations.length === 0) setLoading(true)
    
    try {
      const targetLat = latArg ?? mapCenter[0]
      const targetLng = lngArg ?? mapCenter[1]
      const targetZoom = zoomArg ?? mapZoom
      
      // Calculate search radius based on zoom level
      const baseRadius = Math.pow(2, 14 - targetZoom) * 2
      const radius = targetZoom < 8 ? Math.max(100, baseRadius) : Math.max(5, baseRadius)
      
      const res = await getStations({ 
        lat: targetLat, 
        lng: targetLng, 
        radius: targetZoom >= 6 ? Math.min(1000, radius) : null 
      })
      
      const data = res.data || []
      setStations(data)
      
      // Save to cache
      localStorage.setItem('chargenet_stations', JSON.stringify({
        data: data,
        timestamp: Date.now()
      }))
    } catch (err) {
      console.error('Failed to fetch stations:', err)
    } finally {
      setLoading(false)
    }
  }, [mapCenter, mapZoom, stations.length])

  // Initial Geolocation
  useEffect(() => {
    document.title = 'Find Stations — ChargeNet'
    clearSelectedStation()
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          // DO NOT CHANGE MAP CENTER so it stays in India!
          setUserLocation({ lat: latitude, lng: longitude })
          fetchStations(defaultCenter[0], defaultCenter[1], defaultZoom)
        },
        (err) => {
          console.log('Location denied:', err)
          setMapCenter(defaultCenter)
          setUserLocation({ lat: defaultCenter[0], lng: defaultCenter[1] })
          fetchStations(defaultCenter[0], defaultCenter[1], defaultZoom) // Fallback to India center
        }
      )
    } else {
      setMapCenter(defaultCenter)
      setUserLocation({ lat: defaultCenter[0], lng: defaultCenter[1] })
      fetchStations(defaultCenter[0], defaultCenter[1], defaultZoom)
    }
  }, [clearSelectedStation, fetchStations])

  // Debounced map-move fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      // Fetch if map has moved from initial or on mount
      fetchStations()
    }, 1000)
    return () => clearTimeout(timer)
  }, [mapCenter, mapZoom, fetchStations])


  const handleStationClick = (station) => {
    setSelectedStation(station)
    setIsFlying(true)
    setTimeout(() => setIsFlying(false), 1400)
    
    if (window.innerWidth < 768) {
      setView('map')
    }
    
    // Scroll to station in list
    if (stationRefs.current[station.id]) {
      stationRefs.current[station.id].scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      })
    }
    
    // Ensure position updates immediately after click
    requestAnimationFrame(() => updateCardPosition())
  }

  const handleMarkerClick = (station) => {
    handleStationClick(station)
  }

  const counts = {
    all:      stations.length,
    active:   stations.filter(s => s.status === 'active').length,
    busy:     stations.filter(s => s.status === 'busy').length,
    inactive: stations.filter(s => s.status === 'inactive').length,
    faulty:   stations.filter(s => s.status === 'faulty').length,
  }

  const AVAIL_OPTIONS = [
    { value: 'all', label: 'All Stations' },
    { value: 'available', label: 'Available Now' },
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden" style={{ paddingTop: 72 }}>
      <Navbar solid={true} />

      {/* Ping animation */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
        }
        .station-card-active { border-left: 3px solid #10B981; }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
        .badge-external { background: #EEF2FF; color: #4F46E5; border: 1px solid #E0E7FF; }
      `}</style>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden border-b border-gray-100 bg-white">
          <button
            onClick={() => setView('list')}
            className={`flex-1 py-3 text-xs font-medium ${
              view === 'list' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}>
            List View
          </button>
          <button
            onClick={() => setView('map')}
            className={`flex-1 py-3 text-xs font-medium ${
              view === 'map' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}>
            Map View
          </button>
        </div>

        {/* ─── Sidebar ─── */}
        <div
          className={`w-full md:w-[340px] flex-shrink-0 bg-white border-r border-gray-100 flex-col transition-all duration-300 ease-in-out h-full z-20 ${view === 'map' ? 'hidden md:flex' : 'flex'}`}
          style={{ width: sidebarCollapsed ? 0 : 340, minWidth: sidebarCollapsed ? 0 : 340, overflow: 'hidden' }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
            {/* Search */}
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search stations, cities…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {STATUS_TABS.map(tab => {
                const cfg = STATUS_CONFIG[tab]
                const active = statusTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setStatusTab(tab)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-none text-xs font-semibold transition-all ${
                      active
                        ? tab === 'all'
                          ? 'bg-gray-900 text-white'
                          : `text-white`
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    style={active && tab !== 'all' ? { background: cfg.color } : {}}
                  >
                    {tab === 'all' ? `All (${counts.all})` : `${cfg.label} (${counts[tab]})`}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filters Row */}
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <span className="text-xs text-gray-500 font-medium">{filtered.length} station{filtered.length !== 1 ? 's' : ''} found</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-none transition-all ${
                showFilters ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <SlidersHorizontal size={13} /> Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="px-5 py-4 bg-gray-50/50 flex-shrink-0 space-y-4 border-b border-gray-100">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Availability</label>
                <div className="flex gap-2 mt-2">
                  {AVAIL_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => setFilter('availability', o.value)}
                      className={`flex-1 py-1.5 rounded-none text-xs font-semibold transition-all ${
                        filters.availability === o.value
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200 shadow-sm'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors px-1">
                Reset all filters
              </button>
            </div>
          )}

          {/* Station List */}
          <div className="flex-1 overflow-y-auto sidebar-scroll" ref={listRef}>
            {loading && stations.length === 0 ? (
              Array(6).fill(0).map((_, i) => <StationSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                <MapPin size={32} className="text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-700">No stations found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query</p>
              </div>
            ) : (
              filtered.map(station => (
                <div
                  key={station.id}
                  ref={el => stationRefs.current[station.id] = el}
                  onClick={() => handleStationClick(station)}
                  className={`px-5 py-4 cursor-pointer border-b border-gray-50 transition-all duration-150 active:bg-gray-100 ${
                    selectedStation?.id === station.id
                      ? 'bg-gray-50 border-l-2 border-l-gray-900 pl-4'
                      : 'hover:bg-gray-50 border-l-2 border-l-transparent hover:pl-5'
                  }`}>
                  
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-1">
                    <p className={`text-sm leading-snug pr-4 transition-all ${
                      selectedStation?.id === station.id
                        ? 'font-semibold text-gray-900'
                        : 'font-medium text-gray-900'
                    }`}>
                      {station.name}
                    </p>
                    <span className="text-xs border border-gray-200 text-gray-400 px-2 py-0.5 flex-shrink-0 uppercase tracking-wider">
                      {station.status}
                    </span>
                  </div>

                  {/* City + Distance */}
                  <p className="text-xs text-gray-400 mb-2">
                    {station.city} · {userLocation ? calculateDistance(userLocation.lat, userLocation.lng, station.lat, station.lng) : '...'} km
                  </p>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(star => (
                        <svg key={star} className={`w-3 h-3 ${star <= Math.round(station.rating || 0) ? 'text-gray-600' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                      <span className="text-xs text-gray-400 ml-1">
                        {station.totalReviews || 0} reviews
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {station.available_slots ?? station.total_slots ?? 2}/{station.total_slots ?? 3} free
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── Collapse Toggle ─── */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-6 h-10 bg-white border border-gray-200 rounded-none shadow-md text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all"
          style={{ left: sidebarCollapsed ? 0 : 340 }}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* ─── Map Area ─── */}
        <div ref={mapContainerRef} className={`flex-1 relative ${view === 'list' ? 'hidden md:block' : 'block'}`}>
          {isFlying && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white border border-gray-200 px-4 py-2 flex items-center gap-2 shadow-sm pointer-events-none rounded-xl">
              <div className="w-3 h-3 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
              <span className="text-xs font-semibold text-gray-700">Navigating to station...</span>
            </div>
          )}

          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            className="w-full h-full"
            zoomControl={false}
          >
            <ZoomControl position="bottomright" />
            <MapResetControl onReset={() => clearSelectedStation()} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapController 
              center={mapCenter} 
              zoom={mapZoom} 
              station={selectedStation}
              onMoveEnd={(newCenter, newZoom) => {
                setMapCenter(newCenter)
                setMapZoom(newZoom)
              }} 
            />

            {filtered.map(station => (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={createMarkerIcon(selectedStation?.id === station.id)}
                eventHandlers={{
                  click: () => handleMarkerClick(station)
                }}
              >
                <Popup closeButton={false} className="custom-popup">
                  <div className="bg-white w-64 shadow-lg border border-gray-200">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900 leading-snug pr-2">
                          {station.name}
                        </p>
                        <span className="text-xs border border-gray-200 text-gray-500 px-2 py-0.5 flex-shrink-0 uppercase tracking-wider">
                          {station.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {station.address}, {station.city}
                      </p>
                    </div>
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Available</span>
                        <span className="text-xs font-medium text-gray-900">
                          {station.available_slots ?? station.total_slots ?? 2}/{station.total_slots ?? 3} free
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {Array(station.total_slots ?? 3).fill(0).map((_, i) => (
                          <div key={i} className={`h-1 flex-1 ${i < (station.available_slots ?? station.total_slots ?? 2) ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
                        ))}
                      </div>
                    </div>
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(star => (
                            <svg key={star} className={`w-3 h-3 ${star <= Math.round(station.rating || 0) ? 'text-gray-700' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{(station.rating || 0).toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {userLocation ? calculateDistance(userLocation.lat, userLocation.lng, station.lat, station.lng) : '...'} km away
                      </span>
                    </div>
                    <div className="p-3">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/station/${station.slug || station.id}`); }} className="w-full bg-gray-900 text-white py-2.5 text-xs font-medium uppercase tracking-widest hover:bg-black transition-all">
                        Show More Details
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-[1001] flex items-center justify-center transition-all">
              <div className="bg-white p-5 shadow-2xl border border-gray-100 flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">Updating Stations...</p>
              </div>
            </div>
          )}

          {/* Legend Card — hidden when detail card is open to avoid overlap */}
          {!selectedStation && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-none p-3.5 z-[1000] shadow-lg">
              <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2.5">Station Status</p>
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                <div key={status} className="flex items-center gap-2 mb-1.5 last:mb-0">
                  <div className="w-2.5 h-2.5 rounded-none flex-shrink-0" style={{ background: cfg.color }} />
                  <span className="text-xs text-gray-600 font-medium">{cfg.label}</span>
                  <span className="ml-auto text-xs text-gray-400 font-semibold">{counts[status]}</span>
                </div>
              ))}
              <div className="h-px bg-gray-100 my-2" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-none bg-gray-900" />
                <span className="text-[11px] text-gray-500">Total: {stations.length}</span>
              </div>
            </div>
          )}

          {/* ─── Station Detail Card — floats over map, bottom-left of map area ─── */}
          {selectedStation && (() => {
            const cfg = STATUS_CONFIG[selectedStation.status] || STATUS_CONFIG.faulty
            const facilities = Object.entries(selectedStation.facilities || {})
              .filter(([, v]) => v)
              .map(([k]) => facilityIcons[k])
              .filter(Boolean)
            return (
              <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-none shadow-2xl border border-gray-200 overflow-hidden"
                style={{
                  width: 360,
                  zIndex: 1002,
                  animation: 'cardSlideUp 0.25s cubic-bezier(0,0,0.2,1)'
                }}
              >
                <style>{`
                  @keyframes cardSlideUp {
                    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
                    to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
                  }
                `}</style>

                {/* Top color bar */}
                <div className="h-1 w-full" style={{ background: cfg.color }} />

                <div className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs border border-gray-200 text-gray-500 px-2.5 py-1 uppercase tracking-wider bg-white inline-flex items-center">
                          <span className="w-1.5 h-1.5 rounded-none inline-block mr-1" style={{ background: cfg.color }} />
                          {cfg.label}
                        </span>
                        {selectedStation.isExternal && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wide badge-external">
                            {selectedStation.source}
                          </span>
                        )}
                      </div>
                      <p className="text-base font-bold text-gray-900 leading-tight">{selectedStation.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{selectedStation.address}, {selectedStation.city}</p>
                    </div>
                    <button
                      onClick={clearSelectedStation}
                      className="flex-shrink-0 w-7 h-7 rounded-none bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="bg-gray-50 rounded-none p-2.5 text-center">
                      <p className="text-base font-bold text-gray-900">
                        {selectedStation.available_slots ?? selectedStation.total_slots ?? 2}/{selectedStation.total_slots ?? 3}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">Chargers Free</p>
                    </div>
                    <div className="bg-gray-50 rounded-none p-2.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <span className="text-base font-bold text-gray-900">{(selectedStation.rating || 0).toFixed(1)}</span>
                        <Star size={11} className="text-gray-700 fill-gray-700 mb-0.5" />
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">{selectedStation.totalReviews || 0} Reviews</p>
                    </div>
                    <div className="bg-gray-50 rounded-none p-2.5 text-center">
                      <p className="text-base font-bold text-gray-900">
                        {userLocation
                          ? `${calculateDistance(userLocation.lat, userLocation.lng, selectedStation.lat, selectedStation.lng)} km`
                          : '—'}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">Away</p>
                    </div>
                  </div>

                  {/* Hours */}
                  {selectedStation.openHours && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
                      <Clock size={13} className="text-gray-400 flex-shrink-0" />
                      <span className="font-medium">Open:</span>
                      <span>{selectedStation.openHours}</span>
                    </div>
                  )}

                  {/* Facilities */}
                  {facilities.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Facilities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {facilities.map(({ icon: Icon, label }) => (
                          <div key={label} className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-none text-[11px] text-gray-600 font-medium">
                            <Icon size={11} className="text-gray-400" />
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA button */}
                  <button
                    onClick={() => navigate(`/station/${selectedStation.slug || selectedStation.id}`)}
                    className="mt-3.5 w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-none flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                  >
                    Show More Details
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
