import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
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

function createStationIcon(status, selected = false) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.faulty
  const size = selected ? 20 : 14
  const pulse = selected ? `
    <div style="
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:${size + 16}px;height:${size + 16}px;
      border-radius:0;
      background:${cfg.color}33;
      animation:ping 1.4s cubic-bezier(0,0,.2,1) infinite;
    "></div>` : ''
  return L.divIcon({
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse}
        <div style="
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:${size}px;height:${size}px;
          background:${cfg.color};
          border-radius:50% 50% 50% 0;
          transform:translate(-50%,-50%) rotate(-45deg);
          border:2.0px solid white;
          box-shadow:0 4px 12px ${cfg.color}66;
        "></div>
      </div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  })
}

function MapController({ center, zoom, onMoveEnd }) {
  const map = useMap()
  
  useEffect(() => {
    if (center) map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])

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

function MapEvents({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    },
  })
  return null
}

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
          setMapCenter([latitude, longitude])
          setMapZoom(defaultZoom) // Keep zoomed out as requested
          setUserLocation({ lat: latitude, lng: longitude })
          fetchStations(latitude, longitude, defaultZoom)
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


  const handleSelectStation = (station) => {
    setSelectedStation(station)
    setMapCenter([station.lat, station.lng])
    setMapZoom(13)
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
          <div className="flex-1 overflow-y-auto sidebar-scroll">
            {loading && stations.length === 0 ? (
              Array(6).fill(0).map((_, i) => <StationSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                <MapPin size={32} className="text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-700">No stations found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query</p>
              </div>
            ) : (
              filtered.map(station => {
                const cfg = STATUS_CONFIG[station.status] || STATUS_CONFIG.faulty
                const isSelected = selectedStation?.id === station.id
                const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, station.lat, station.lng) : null;
                const distanceText = distance ? `${distance} km` : 'Calculating...';
                return (
                  <button
                    key={station.id}
                    onClick={() => handleSelectStation(station)}
                    className={`w-full text-left py-4 px-4 border-b border-gray-50 transition-all duration-150 last:border-0 hover:bg-gray-50/80 cursor-pointer ${isSelected ? 'bg-gray-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate transition-colors text-gray-800">
                          {station.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-400 truncate">{station.city} · {distanceText}</p>
                          {station.isExternal && (
                            <span className="px-1.5 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider badge-external">
                              Public
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs border border-gray-200 text-gray-500 px-2.5 py-1 uppercase tracking-wider bg-white">
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={station.rating} />
                        <span className="text-xs text-gray-500 font-medium">{station.rating}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          {station.totalReviews || 0} {station.totalReviews === 1 ? 'review' : 'reviews'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <BatteryCharging size={12} className={station.availableChargers > 0 ? 'text-emerald-500' : 'text-gray-300'} />
                        <span className={`font-semibold ${station.availableChargers > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {station.availableChargers}/{station.totalChargers}
                        </span>
                        <span className="text-gray-400">free</span>
                      </div>
                    </div>
                  </button>
                )
              })
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
        <div className={`flex-1 relative ${view === 'list' ? 'hidden md:block' : 'block'}`}>
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapController 
              center={mapCenter} 
              zoom={mapZoom} 
              onMoveEnd={(newCenter, newZoom) => {
                setMapCenter(newCenter)
                setMapZoom(newZoom)
              }} 
            />
            <MapEvents 
              onMapClick={(latlng) => {
                setMapCenter([latlng.lat, latlng.lng])
                setMapZoom((prev) => Math.min(prev + 2, 14)) // Zoom in slightly on click
              }} 
            />
            {filtered.map(station => (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={createStationIcon(station.status, selectedStation?.id === station.id)}
                eventHandlers={{
                  click: () => handleSelectStation(station)
                }}
              >
                <Popup className="custom-popup" closeButton={false}>
                  <div className="p-2">
                    <p className="font-medium text-sm mb-1">{station.name}</p>
                    <p className="text-xs text-gray-500 mb-2">{station.city}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/station/${station.slug || station.id}`);
                      }}
                      className="text-xs bg-gray-900 text-white px-3 py-1.5 hover:bg-black transition-all w-full"
                    >
                      View station
                    </button>
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

          {/* Legend Card */}
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

          {/* Zoom Controls */}
          <div className="absolute bottom-8 right-4 flex flex-col gap-1.5 z-[1000]">
            <button
              onClick={() => setMapZoom(z => Math.min(z + 1, 18))}
              className="w-9 h-9 bg-white border border-gray-200 rounded-none shadow-md text-gray-700 hover:bg-gray-50 flex items-center justify-center text-lg font-light transition-all hover:shadow-lg"
            >+</button>
            <button
              onClick={() => setMapZoom(z => Math.max(z - 1, 3))}
              className="w-9 h-9 bg-white border border-gray-200 rounded-none shadow-md text-gray-700 hover:bg-gray-50 flex items-center justify-center text-lg font-light transition-all hover:shadow-lg"
            >−</button>
            <button
              onClick={() => { setMapCenter(defaultCenter); setMapZoom(defaultZoom); clearSelectedStation() }}
              className="w-9 h-9 bg-white border border-gray-200 rounded-none shadow-md text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-all hover:shadow-lg"
              title="Reset view"
            >
              <Navigation2 size={15} />
            </button>
          </div>

          {/* ─── Station Detail Panel ─── */}
          {selectedStation && (() => {
            const cfg = STATUS_CONFIG[selectedStation.status] || STATUS_CONFIG.faulty
            const facilities = Object.entries(selectedStation.facilities || {})
              .filter(([, v]) => v)
              .map(([k]) => facilityIcons[k])
              .filter(Boolean)
            return (
              <div
                className="absolute bottom-4 left-4 bg-white rounded-none shadow-2xl z-[1000] border border-gray-100 overflow-hidden"
                style={{ width: 340, animation: 'slideUp 0.25s ease' }}
              >
                <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>

                {/* Top color bar */}
                <div className="h-1 w-full" style={{ background: cfg.color }} />

                <div className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                         <span className="text-xs border border-gray-200 text-gray-500 px-2.5 py-1 uppercase tracking-wider bg-white inline-flex items-center">
                          <span className="w-1.5 h-1.5 rounded-none inline-block bg-gray-400 mr-1" />
                          {cfg.label}
                        </span>
                        {selectedStation.isExternal && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wide badge-external">
                            {selectedStation.source}
                          </span>
                        )}
                      </div>
                      <p className="text-base font-bold text-gray-900 leading-tight">{selectedStation.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{selectedStation.address}</p>
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
                      <p className="text-base font-bold text-gray-900">{selectedStation.availableChargers}/{selectedStation.totalChargers}</p>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">Chargers Free</p>
                    </div>
                    <div className="bg-gray-50 rounded-none p-2.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <span className="text-base font-bold text-gray-900">{selectedStation.rating}</span>
                        <Star size={11} className="text-gray-700 fill-gray-700 mb-0.5" />
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">{selectedStation.totalReviews} Reviews</p>
                    </div>
                    <div className="bg-gray-50 rounded-none p-2.5 text-center">
                      <p className="text-base font-bold text-gray-900">{formatDistance(selectedStation.distance)}</p>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">Away</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
                    <Clock size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="font-medium">Open:</span>
                    <span>{selectedStation.openHours}</span>
                  </div>

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
                    onClick={() => navigate(`/station/${selectedStation.slug}`)}
                    className="mt-3.5 w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-none flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                  >
                    View Full Details
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
