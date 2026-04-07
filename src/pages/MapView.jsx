import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Star, Filter, X, ChevronRight, Zap } from 'lucide-react'
import { stations } from '../mock/stations'
import { useMapStore } from '../store/mapStore'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { formatDistance } from '../utils/plugTypes'
import { Navbar } from '../components/layout/Navbar'

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const STATUS_COLORS = { active: '#15803D', busy: '#B45309', inactive: '#B91C1C', faulty: '#A8A29E' }

function createStationIcon(status) {
  const color = STATUS_COLORS[status] || '#A8A29E'
  return L.divIcon({
    html: `<div style="width:28px;height:28px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #FAFAF9;box-shadow:0 2px 4px rgba(0,0,0,0.2)"></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })
}

function MapController() {
  const map = useMap()
  const { mapCenter, mapZoom } = useMapStore()
  useEffect(() => { map.setView(mapCenter, mapZoom) }, [mapCenter, mapZoom])
  return null
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={11} className={s <= Math.round(rating) ? 'star-filled fill-current' : 'star-empty fill-current'} />
      ))}
    </div>
  )
}

export default function MapView() {
  const navigate = useNavigate()
  const { selectedStation, setSelectedStation, clearSelectedStation, filters, setFilter, resetFilters } = useMapStore()
  const [showFilters, setShowFilters] = useState(false)
  const [filtered, setFiltered] = useState(stations)

  useEffect(() => { document.title = 'Map — ChargeNet' }, [])

  useEffect(() => {
    let result = [...stations]
    if (filters.availability === 'available') result = result.filter(s => s.availableChargers > 0)
    if (filters.plugType && filters.plugType !== 'all') {
      // simplified filter by status for demo
    }
    setFiltered(result)
  }, [filters])

  const PLUG_OPTIONS = [
    { value: 'all', label: 'All Types' },
    { value: 'CCS2', label: 'CCS2' },
    { value: 'Type2', label: 'Type 2' },
    { value: 'CHAdeMO', label: 'CHAdeMO' },
  ]
  const AVAIL_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available Now' },
  ]

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <div className="w-72 flex-shrink-0 bg-background border-r border-border flex flex-col overflow-hidden z-10 hidden md:flex">
          {/* Filter Bar */}
          <div className="p-3 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-primary">{filtered.length} stations</span>
              <button onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors">
                <Filter size={13} /> Filters
              </button>
            </div>
            {showFilters && (
              <div className="space-y-2 mt-2">
                <div>
                  <label className="text-xs text-muted font-medium">Plug Type</label>
                  <select value={filters.plugType} onChange={e => setFilter('plugType', e.target.value)}
                    className="w-full mt-1 bg-surface border border-border rounded-lg text-xs px-2 py-1.5 text-primary focus:outline-none">
                    {PLUG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted font-medium">Availability</label>
                  <select value={filters.availability} onChange={e => setFilter('availability', e.target.value)}
                    className="w-full mt-1 bg-surface border border-border rounded-lg text-xs px-2 py-1.5 text-primary focus:outline-none">
                    {AVAIL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <button onClick={resetFilters} className="text-xs text-danger hover:underline">Reset filters</button>
              </div>
            )}
          </div>
          {/* Station List */}
          <div className="overflow-y-auto flex-1">
            {filtered.map(station => (
              <button
                key={station.id}
                onClick={() => setSelectedStation(station)}
                className={`w-full p-3 border-b border-border text-left hover:bg-surface transition-colors ${selectedStation?.id === station.id ? 'bg-[#F0FDFA]' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{station.name}</p>
                    <p className="text-xs text-muted mt-0.5 truncate">{station.city}</p>
                  </div>
                  <Badge variant={station.status} showDot label={station.status.charAt(0).toUpperCase() + station.status.slice(1)} />
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted">
                  <StarRating rating={station.rating} />
                  <span>{station.rating}</span>
                  <span>·</span>
                  <span>{formatDistance(station.distance)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="w-full h-full"
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapController />
            {filtered.map(station => (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={createStationIcon(station.status)}
                eventHandlers={{ click: () => setSelectedStation(station) }}
              />
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute top-3 right-3 bg-background border border-border rounded-xl p-3 z-[1000]"
               style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <p className="text-xs font-semibold text-primary mb-2">Legend</p>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2 mb-1 last:mb-0">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-xs text-muted capitalize">{status}</span>
              </div>
            ))}
          </div>

          {/* Bottom Slide-Up Panel */}
          {selectedStation && (
            <div className="slide-up-panel absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-[1000] md:max-w-xs md:left-auto md:bottom-4 md:right-4 md:rounded-xl md:border">
              <button onClick={clearSelectedStation} className="absolute top-3 right-3 text-muted hover:text-primary">
                <X size={16} />
              </button>
              <div className="flex items-start justify-between pr-6">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{selectedStation.name}</p>
                  <p className="text-xs text-muted mt-0.5">{selectedStation.city}</p>
                </div>
                <Badge variant={selectedStation.status} label={selectedStation.status.charAt(0).toUpperCase() + selectedStation.status.slice(1)} className="ml-2 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted mt-2">
                <span className="text-success font-medium">{selectedStation.availableChargers}/{selectedStation.totalChargers} chargers free</span>
                <span>·</span>
                <span>{formatDistance(selectedStation.distance)}</span>
              </div>
              <Button
                variant="primary" size="sm" fullWidth className="mt-3"
                onClick={() => navigate(`/station/${selectedStation.id}`)}
              >
                View Details <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
