import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Navbar } from '../components/layout/Navbar'

const BookingLanding = () => {
  const [stations, setStations] = useState([])
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState([])
  const [selectedCity, setSelectedCity] = useState('All')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStations = async () => {
      const { data } = await supabase
        .from('stations')
        .select('*')
        .eq('status', 'active')
      setStations(data || [])
      setFiltered(data || [])
    }
    fetchStations()
  }, [])

  useEffect(() => {
    if (!search) {
      setFiltered(stations)
      return
    }
    const results = stations.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.state.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(results)
  }, [search, stations])

  return (
    <div className="min-h-screen bg-white font-sans pt-[72px] lg:pt-[80px]">
      <Navbar solid={true} />

      {/* HERO - Clean and Direct */}
      <div className="bg-black px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Book a Charging Slot
          </h1>
          <p className="text-gray-300 text-lg mb-10">
            Search from 80+ stations across India and reserve your slot instantly
          </p>

          {/* Search Bar - Main CTA */}
          <div className="flex gap-0 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search by station name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-5 py-4 text-gray-900 text-sm focus:outline-none border-0 bg-white rounded-none"
            />
            <button className="bg-white border-l border-gray-200 px-6 py-4 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-all whitespace-nowrap rounded-none">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 divide-x divide-gray-200">
            {[
              { value: '80+', label: 'Active Stations' },
              { value: '3', label: 'Charger Types' },
              { value: '24/7', label: 'Always Open' },
              { value: '₹8', label: 'Per kWh Onwards' }
            ].map((stat, i) => (
              <div key={i} className="py-6 px-8 text-center sm:text-left">
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>      {/* STATIONS GRID */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Header Row */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {search 
                ? `Results for "${search}"` 
                : 'Available Stations'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {filtered.length} stations across India
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/map"
              className="text-sm text-gray-500 hover:text-gray-900 transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              View on Map
            </Link>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {['All', ...new Set(stations.map(s => s.city))].slice(0, 10).map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`text-xs px-4 py-2 transition-all ${
                selectedCity === city
                  ? 'bg-gray-900 text-white'
                  : 'border border-transparent text-gray-700 hover:border-gray-200 hover:bg-white transition-all'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Station List - Clean Row Style */}
        <div className="divide-y divide-gray-100">
          {filtered
            .filter(s => selectedCity === 'All' || s.city === selectedCity)
            .map((station) => (
            <div
              key={station.id}
              className="group py-5 flex items-center justify-between hover:bg-gray-50 -mx-4 px-4 transition-all cursor-pointer"
              onClick={() => navigate(`/station/${station.slug}`)}
            >
              
              {/* Left - Station Info */}
              <div className="flex items-start gap-5">
                {/* Index Number */}
                <div className="w-8 flex-shrink-0 pt-0.5">
                  <span className="text-sm text-gray-300 font-medium group-hover:text-gray-400 transition-all">
                    {String(filtered.indexOf(station) + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Station Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-black transition-all">
                    {station.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {station.address}, {station.city}
                  </p>
                </div>
              </div>

              {/* Right - Meta + Button */}
              <div className="flex items-center gap-8">
                
                {/* City + State */}
                <div className="hidden md:block text-right">
                  <p className="text-xs font-medium text-gray-700">
                    {station.city}
                  </p>
                  <p className="text-xs text-gray-400">
                    {station.state}
                  </p>
                </div>

                {/* Status dot */}
                <div className="flex items-center gap-1.5 hidden md:flex">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  <span className="text-xs text-gray-400 capitalize">
                    {station.status}
                  </span>
                </div>

                {/* Book Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/station/${station.slug}`)
                  }}
                  className="text-xs font-medium text-gray-400 border border-gray-200 px-4 py-2 group-hover:border-gray-900 group-hover:text-gray-900 transition-all whitespace-nowrap"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More or View All */}
        {filtered.length > 0 && (
          <div className="text-center pt-12 border-t border-gray-100 mt-4">
            <Link
              to="/map"
              className="text-sm text-gray-400 hover:text-gray-900 transition-all"
            >
              View all {stations.length} stations on the map →
            </Link>
          </div>
        )}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-300 text-sm mb-2">
              No stations found
            </p>
            <button
              onClick={() => {
                setSearch('')
                setSelectedCity('All')
              }}
              className="text-sm text-gray-500 hover:text-gray-900 transition-all underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>


      {/* BOTTOM CTA */}
      <div className="bg-black py-16 text-center mt-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          Not sure which station to pick?
        </h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          Use our interactive map to find the nearest station to your location
        </p>
        <Link
          to="/map"
          className="bg-white text-black px-8 py-3 text-sm font-semibold hover:bg-gray-100 transition-all inline-block rounded-none text-center"
        >
          Open Map
        </Link>
      </div>
    </div>
  )
}

export default BookingLanding
