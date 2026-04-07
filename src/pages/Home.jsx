import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapPin, Zap, Star, ChevronRight, ArrowRight, Search } from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { stations } from '../mock/stations'
import { formatDistance } from '../utils/plugTypes'

const FILTERS = ['All', 'DC Fast', 'AC Slow', 'Available Now']

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={12} className={s <= Math.round(rating) ? 'star-filled fill-current' : 'star-empty fill-current'} />
      ))}
    </div>
  )
}

function StationCard({ station }) {
  const navigate = useNavigate()
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-primary truncate">{station.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-muted flex-shrink-0" />
            <p className="text-xs text-muted truncate">{station.address.split(',').slice(-2).join(',').trim()}</p>
          </div>
        </div>
        <Badge variant={station.status} label={station.status.charAt(0).toUpperCase() + station.status.slice(1)} className="ml-2 flex-shrink-0" />
      </div>
      <div className="flex items-center gap-3 text-xs text-muted">
        <div className="flex items-center gap-1">
          <StarRating rating={station.rating} />
          <span className="font-medium text-primary">{station.rating}</span>
          <span>({station.totalReviews})</span>
        </div>
        <span>·</span>
        <span>{formatDistance(station.distance)}</span>
        <span>·</span>
        <span className="text-success font-medium">{station.availableChargers}/{station.totalChargers} free</span>
      </div>
      <Button variant="outline" size="sm" fullWidth onClick={() => navigate(`/station/${station.id}`)}>
        View Details <ArrowRight size={13} />
      </Button>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  React.useEffect(() => { document.title = 'ChargeNet — India\'s Smart EV Charging Companion' }, [])

  const featured = stations.filter(s => s.status === 'active').slice(0, 6)

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/map?q=${search}`)
  }

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0FDFA] border border-[#99F6E4] rounded-full text-xs font-medium text-accent mb-6">
            <Zap size={12} /> Now live in 5 cities across India
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-primary leading-tight mb-4">
            Find your next<br />
            <span className="text-accent">charge</span>
          </h1>
          <p className="text-base text-muted max-w-md mx-auto mb-8">
            Discover nearby EV charging stations, check real-time availability, book your slot, and charge with confidence.
          </p>
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by city or area…"
                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <Button type="submit" variant="primary" size="md">Search</Button>
          </form>
        </div>
      </section>

      <PageContainer>
        {/* Filter Pills */}
        <section className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`filter-pill flex-shrink-0 ${activeFilter === f ? 'active' : ''}`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Stations */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Featured Stations</h2>
            <Link to="/map" className="text-sm text-accent flex items-center gap-1 hover:no-underline">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map(station => <StationCard key={station.id} station={station} />)}
          </div>
        </section>

        {/* Map Preview Banner */}
        <section className="mb-12">
          <div className="bg-surface border border-border rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="bg-[#E7F0EE] h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MapPin size={24} color="white" />
                </div>
                <p className="text-sm font-medium text-primary">Interactive Map</p>
                <p className="text-xs text-muted mt-1">Explore 10+ stations across India</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">Explore on Map</p>
                <p className="text-xs text-muted">Color-coded pins by availability</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => navigate('/map')}>
                Open Map <ArrowRight size={13} />
              </Button>
            </div>
          </div>
        </section>

        {/* EV Learn Banner */}
        <section className="mb-12">
          <div className="bg-[#F0FDFA] border border-[#99F6E4] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-primary mb-1">New to EV?</h2>
              <p className="text-sm text-muted">From buying your first EV to planning road trips — our guides have you covered.</p>
            </div>
            <Button variant="primary" size="md" onClick={() => navigate('/learn')} className="flex-shrink-0">
              Explore Learn Hub <ArrowRight size={14} />
            </Button>
          </div>
        </section>

        {/* Footer Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Stations', value: '10+' },
            { label: 'Cities', value: '5' },
            { label: 'Active Chargers', value: '30+' },
            { label: 'Reviews', value: '385+' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface border border-border rounded-xl p-4 text-center"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <p className="text-2xl font-semibold text-accent">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </section>
      </PageContainer>
    </PageWrapper>
  )
}
