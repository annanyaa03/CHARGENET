import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { 
  ArrowLeft, Zap, Clock, Calendar, ShieldCheck, 
  ChevronRight, BatteryCharging, AlertCircle,
  CheckCircle2, Info
} from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function BookSlot() {
  const { stationId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  
  // Try URL params first, then location state
  const id = stationId || location.state?.stationId

  const [station, setStation] = useState(null)
  const [chargers, setChargers] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [selectedCharger, setSelectedCharger] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [duration, setDuration] = useState(60)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!id) {
      toast.error('Station ID is required for booking')
      navigate('/map')
      return
    }
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch station
      const { data: stationData, error: stationError } = await supabase
        .from('stations')
        .select('*')
        .eq('id', id)
        .single()
      
      if (stationError) throw stationError
      setStation(stationData)

      // Fetch available chargers
      const { data: chargersData, error: chargersError } = await supabase
        .from('chargers')
        .select('*')
        .eq('station_id', id)
        .eq('status', 'available')
      
      if (chargersError) throw chargersError
      setChargers(chargersData || [])
      
      // Auto-select first charger if available
      if (chargersData?.length > 0) {
        setSelectedCharger(chargersData[0])
      }
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error('Failed to load station or chargers')
    } finally {
      setLoading(false)
    }
  }

  const estimatedCost = (
    (selectedCharger?.price_per_kwh || 0) * 
    (selectedCharger?.power_kw || 0) * 
    (duration/60)
  ).toFixed(2)

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue')
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    
    if (!selectedCharger || !selectedDate || !selectedTime) {
      toast.error('Please fill all booking details')
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          station_id: id,
          charger_id: selectedCharger.id,
          user_id: user?.id || null,
          booking_date: selectedDate,
          booking_time: selectedTime,
          duration_minutes: duration,
          status: 'confirmed',
          estimated_cost: estimatedCost
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Reservation Confirmed!')
      navigate('/booking-success', { 
        state: { 
          booking: data,
          station: station,
          charger: selectedCharger
        }
      })
    } catch (err) {
      console.error('Booking error:', err)
      toast.error('Booking failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper className="bg-white">
        <PageContainer className="py-20 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent animate-spin rounded-none" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Initializing Reservation…</p>
          </div>
        </PageContainer>
      </PageWrapper>
    )
  }

  if (!station) {
    return (
      <PageWrapper className="bg-white">
        <PageContainer className="py-20 text-center">
          <AlertCircle size={48} className="text-gray-100 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Station Not Found</h2>
          <p className="text-gray-400 font-medium">Session expired or invalid station reference.</p>
          <button onClick={() => navigate('/map')} className="mt-8 px-8 py-3 bg-gray-900 text-white font-black uppercase text-[10px] tracking-widest transition-all hover:bg-black">
            Back to Map
          </button>
        </PageContainer>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="bg-white">
      <PageContainer className="!max-w-5xl pb-20 pt-10">
        
        {/* Back navigation */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-all mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Station</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          
          {/* ── LEFT: Main Content (2/3 width) ── */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Page Title Row */}
            <div className="border-b border-gray-100 pb-8">
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-5 uppercase">Reserve.</h1>
              <h2 className="text-base font-black text-gray-900 tracking-tight uppercase mb-1">{station.name}</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-4">
                {station.address}, {station.city}
              </p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                  <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
                  {station.status}
                </span>
                <span className="text-gray-200 text-xs">|</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  {chargers.length} Charger{chargers.length !== 1 ? 's' : ''} Available
                </span>
              </div>
            </div>

            {/* 01. Charger Selection */}
            <section>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 mb-5">01. Select Charger</p>
              <div className="space-y-2">
                {chargers.length === 0 ? (
                  <div className="p-8 border border-gray-100 text-center text-gray-300 italic text-sm">
                    No active chargers found online.
                  </div>
                ) : (
                  chargers.map(charger => (
                    <button 
                      key={charger.id}
                      onClick={() => setSelectedCharger(charger)}
                      className={`w-full px-5 py-4 border transition-all text-left relative overflow-hidden group ${
                        selectedCharger?.id === charger.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-100 bg-transparent hover:border-gray-300 hover:bg-gray-50/30'
                      }`}
                    >
                      {/* Left Interaction Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] transition-transform duration-500 ${
                        selectedCharger?.id === charger.id ? 'translate-x-0 bg-gray-900' : '-translate-x-full bg-gray-300'
                      }`} />

                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`text-sm font-black uppercase tracking-tight ${selectedCharger?.id === charger.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`}>
                            {charger.type} Charger
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-blue-500">
                              <Zap size={9} /> {charger.power_kw} kW
                            </span>
                            <span className="text-gray-200 text-[9px]">|</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                              ID: {charger.id?.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-gray-900 tracking-tighter">₹{charger.price_per_kwh}</p>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Per kWh</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* 02. Date and Time */}
            <section>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 mb-5">02. Schedule</p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Date</label>
                  <input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-gray-100 py-2.5 text-base font-black tracking-tight text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-gray-100 py-2.5 text-base font-black tracking-tight text-gray-900 focus:outline-none focus:border-gray-900 transition-colors cursor-pointer appearance-none"
                  >
                    {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 03. Duration */}
            <section>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 mb-5">03. Duration</p>
              <div className="flex gap-2 flex-wrap">
                {[30, 60, 90, 120, 180].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`px-5 py-2 border transition-all text-[9px] font-black uppercase tracking-widest ${
                      duration === mins
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-transparent text-gray-400 border-gray-100 hover:border-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {mins >= 60 ? `${mins/60}hr${mins > 60 ? 's' : ''}` : `${mins}min`}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT: Sticky Sidebar (1/3 width) ── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28 space-y-6">
              
              {/* Summary Card — top aligns with "Reserve." heading */}
              <div className="p-6 bg-gray-50 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-[0.07]">
                  <Zap size={72} className="text-gray-900" />
                </div>
                
                <h3 className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-900 mb-6 pb-4 border-b border-gray-200">Reservation Info</h3>
                
                <div className="space-y-5 relative z-10">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Rate</span>
                    <span className="text-sm font-black text-gray-900">₹{selectedCharger?.price_per_kwh}/kWh</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Power</span>
                    <span className="text-sm font-black text-gray-900">{selectedCharger?.power_kw} kW</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Time</span>
                    <span className="text-sm font-black text-gray-900">{duration} min</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Energy (Est.)</span>
                    <span className="text-sm font-black text-gray-900">
                      {((selectedCharger?.power_kw || 0) * (duration/60)).toFixed(1)} kWh
                    </span>
                  </div>
                  
                  <div className="pt-5 mt-2 border-t border-gray-200">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Total Estimate</p>
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">₹{estimatedCost}</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleBooking}
                disabled={isSubmitting || !selectedCharger}
                className="w-full h-14 bg-gray-900 text-white font-black uppercase text-[9px] tracking-[0.5em] transition-all hover:bg-black disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Reserve'}
                {!isSubmitting && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />}
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-300">
                <ShieldCheck size={12} />
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Encrypted Reservation Protocol v2.4</span>
              </div>
            </div>
          </div>

        </div>
      </PageContainer>
    </PageWrapper>
  )
}
