import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const PopularStations = () => {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const { data, error } = await supabase
          .from('stations')
          .select('*')
          .eq('status', 'active')
          .limit(6)
        
        if (error) throw error
        setStations(data || [])
      } catch (err) {
        console.error('Error fetching popular stations:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPopular()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-48 animate-pulse shadow-sm" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stations.map(station => (
        <div key={station.id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 group"
        >
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-black transition-colors">
            {station.name}
          </h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {station.address}, {station.city}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[10px] text-green-600 font-black uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
              {station.status}
            </span>
            <Link
              to={`/station/${station.id}`}
              className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all"
            >
              Book Now
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

const BookingLanding = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-[72px] lg:pt-[80px]">
      {/* Header */}
      <div className="bg-black text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-black mb-6 tracking-tighter uppercase">
          Book a Charging Slot
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
          Find a station near you and book your charging slot in seconds. 
          Real-time availability, instant confirmation.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100 hover:border-gray-200 transition-all">
            <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-xl shadow-black/10">
              1
            </div>
            <h3 className="font-black text-xl mb-3 uppercase tracking-tight">
              Find a Station
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Browse our network of 80+ charging stations across India using our interactive map.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100 hover:border-gray-200 transition-all">
            <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-xl shadow-black/10">
              2
            </div>
            <h3 className="font-black text-xl mb-3 uppercase tracking-tight">
              Select a Charger
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Choose from CCS, Type2 or CHAdeMO chargers based on your vehicle's compatibility.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100 hover:border-gray-200 transition-all">
            <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-xl shadow-black/10">
              3
            </div>
            <h3 className="font-black text-xl mb-3 uppercase tracking-tight">
              Confirm Booking
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Pick your preferred date, time and duration and confirm your slot instantly.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-24">
          <Link 
            to="/map"
            className="bg-black text-white px-10 py-5 rounded-2xl text-lg font-black uppercase tracking-widest hover:bg-gray-800 transition-all inline-block shadow-2xl shadow-black/20 hover:-translate-y-1"
          >
            Find Stations Near Me
          </Link>
        </div>

        {/* Popular Stations */}
        <div className="mb-12">
          <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">Available Now</p>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Popular Stations</h2>
            </div>
            <Link to="/map" className="text-sm font-black uppercase tracking-widest text-[#4A9EFF] hover:underline">
              View All
            </Link>
          </div>
          <PopularStations />
        </div>
      </div>
    </div>
  )
}

export default BookingLanding
