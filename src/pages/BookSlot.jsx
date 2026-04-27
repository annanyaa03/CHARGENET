import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { supabase } from '../lib/supabase'
import { bookingsAPI } from '../services/api'

const BookSlot = () => {
  const { stationId } = useParams()
  const navigate = useNavigate()

  const [station,         setStation]         = useState(null)
  const [chargers,        setChargers]        = useState([])
  const [selectedCharger, setSelectedCharger] = useState(null)
  const [selectedDate,    setSelectedDate]    = useState(new Date().toISOString().split('T')[0])
  const [selectedTime,    setSelectedTime]    = useState('09:00')
  const [duration,        setDuration]        = useState(60)
  const [loading,         setLoading]         = useState(true)
  const [booking,         setBooking]         = useState(false)
  const [error,           setError]           = useState('')

  useEffect(() => {
    if (!stationId) { navigate('/map'); return }
    fetchData()

    // Socket.io integration
    const socket = io('http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      console.log('Connected to socket')
      socket.emit('join-station', stationId)
    })

    socket.on('charger-status-changed', (data) => {
      // Update chargers if the changed charger is in our list
      setChargers(prev => prev.map(c => 
        c.id === data.charger.id ? { ...c, status: data.charger.status } : c
      ))
    })

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error, falling back to polling:', err)
    })

    // Polling fallback for charger status
    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => {
      socket.disconnect()
      clearInterval(interval)
    }
  }, [stationId])

  const fetchData = async () => {
    try {
      const { data: stationData } = await supabase
        .from('stations')
        .select('*')
        .eq('id', stationId)
        .single()

      const { data: chargerData } = await supabase
        .from('chargers')
        .select('*')
        .eq('station_id', stationId)

      setStation(stationData)
      setChargers(chargerData || [])
      if (chargerData?.length > 0) setSelectedCharger(chargerData[0])
    } catch (err) {
      setError('Failed to load station data')
    } finally {
      setLoading(false)
    }
  }

  const estimatedCost = selectedCharger
    ? (parseFloat(selectedCharger.price_per_kwh) * selectedCharger.power_kw * (duration / 60)).toFixed(2)
    : '0.00'

  const estimatedEnergy = selectedCharger
    ? (selectedCharger.power_kw * (duration / 60)).toFixed(1)
    : '0.0'

  const handleBooking = async () => {
    if (!selectedCharger) return
    
    // Final client-side validation
    const bookingDateTime = new Date(`${selectedDate}T${selectedTime}`)
    if (bookingDateTime <= new Date()) {
      setError('Booking time must be in the future.')
      return
    }

    setBooking(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        setError('You must be logged in to book a slot.')
        return
      }

      await bookingsAPI.create({
        station_id: stationId,
        charger_id: selectedCharger.id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        duration_minutes: duration
      }, token)

      navigate('/dashboard', { state: { bookingSuccess: true, stationName: station?.name } })
    } catch (err) {
      console.error('Booking error:', err)
      const msg = err.message || (typeof err === 'string' ? err : 'Booking failed. Please try again.')
      setError(msg)
      // Refresh chargers to get updated availability
      fetchData()
    } finally {
      setBooking(false)
    }
  }

  const TIMES = [
    '06:00','07:00','08:00','09:00','10:00','11:00',
    '12:00','13:00','14:00','15:00','16:00','17:00',
    '18:00','19:00','20:00','21:00','22:00',
  ]

  const DURATIONS = [30, 60, 90, 120, 180]

  const fmtDuration = (m) => {
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    const rem = m % 60
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`
  }

  const formatAddress = (station) => {
    if (!station) return ''
    
    const addr = station.address || ''
    const city = station.city || ''
    const state = station.state || ''
    
    const hasCity = addr.toLowerCase().includes(city.toLowerCase())
    const hasState = addr.toLowerCase().includes(state.toLowerCase())
    
    let result = addr
    if (!hasCity && city) result += ', ' + city
    if (!hasState && state) result += ', ' + state
    
    return result
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-5 h-5 border border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Top bar */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to station
          </button>
          <Link to="/" className="text-xs font-semibold text-gray-900 tracking-widest uppercase">
            ChargeNet
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-12">

          {/* ── LEFT — Form ── */}
          <div className="col-span-12 lg:col-span-7">

            {/* Station heading */}
            <div className="mb-10">
              <p className="text-xs text-gray-400 mb-3">Booking a slot at</p>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-1">
                {station?.name}
              </h1>
              <p className="text-sm text-gray-400">
                {formatAddress(station)}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 mb-8">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}

            {/* ── Step 1: Charger ── */}
            <div className="mb-10">
              <p className="text-xs text-gray-400 mb-4 flex items-center gap-2">
                <span className="text-gray-300">01</span>
                <span className="text-gray-200">·</span>
                Select charger
              </p>

              {chargers.length === 0 ? (
                <p className="text-sm text-gray-400">No chargers available at this station.</p>
              ) : (
                <div className="space-y-2">
                  {chargers.map(charger => {
                    const isSelected  = selectedCharger?.id === charger.id
                    const isAvailable = charger.status === 'available'
                    return (
                      <div
                        key={charger.id}
                        onClick={() => !booking && isAvailable && setSelectedCharger(charger)}
                        className={`p-4 border transition-all ${
                          !isAvailable
                            ? 'border-gray-100 opacity-40 cursor-not-allowed'
                            : booking
                            ? 'border-gray-100 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-gray-900 cursor-pointer'
                            : 'border-gray-100 hover:border-gray-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-900 mb-1">
                              {charger.type} Charger
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">{charger.power_kw} kW</span>
                              <span className="text-gray-200">·</span>
                              <span className={`text-xs ${isAvailable ? 'text-gray-500' : 'text-gray-300'}`}>
                                {isAvailable ? 'Available' : 'Occupied'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">
                              ₹{parseFloat(charger.price_per_kwh).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400">per kWh</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Step 2: Schedule ── */}
            <div className="mb-10">
              <p className="text-xs text-gray-400 mb-4 flex items-center gap-2">
                <span className="text-gray-300">02</span>
                <span className="text-gray-200">·</span>
                Schedule
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Date</label>
                  <input
                    type="date"
                    disabled={booking}
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Time</label>
                  <select
                    disabled={booking}
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    className="w-full border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    {TIMES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Step 3: Duration ── */}
            <div className="mb-10">
              <p className="text-xs text-gray-400 mb-4 flex items-center gap-2">
                <span className="text-gray-300">03</span>
                <span className="text-gray-200">·</span>
                Duration
              </p>
              <div className="flex gap-2 flex-wrap">
                {DURATIONS.map(m => (
                  <button
                    key={m}
                    disabled={booking}
                    onClick={() => setDuration(m)}
                    className={`px-4 py-2 text-xs transition-all ${
                      duration === m
                        ? 'bg-gray-900 text-white'
                        : 'border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {fmtDuration(m)}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT — Summary sidebar ── */}
          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-8">

              <div className="border border-gray-200">

                {/* Summary rows */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <p className="text-xs text-gray-400 mb-5">Booking summary</p>

                  <div className="space-y-3">
                    {[
                      { label: 'Station',    value: station?.name },
                      { label: 'Charger',    value: selectedCharger ? `${selectedCharger.type} Charger` : '—' },
                      { label: 'Power',      value: selectedCharger ? `${selectedCharger.power_kw} kW` : '—' },
                      { label: 'Rate',       value: selectedCharger ? `₹${parseFloat(selectedCharger.price_per_kwh).toFixed(2)}/kWh` : '—' },
                      { label: 'Date',       value: selectedDate },
                      { label: 'Time',       value: selectedTime },
                      { label: 'Duration',   value: fmtDuration(duration) },
                      { label: 'Est. energy',value: `${estimatedEnergy} kWh` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between">
                        <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
                        <span className="text-xs text-gray-700 text-right ml-4 max-w-[180px] leading-snug">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estimated total */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-end justify-between">
                    <p className="text-xs text-gray-400">Estimated total</p>
                    <p className="text-2xl font-normal text-gray-900 tracking-tight">₹{estimatedCost}</p>
                  </div>
                  <p className="text-xs text-gray-300 mt-2">Final cost depends on actual energy used</p>
                </div>

                {/* Confirm button */}
                <div className="px-6 py-5">
                  <button
                    onClick={handleBooking}
                    disabled={
                      !selectedCharger || 
                      selectedCharger?.status !== 'available' ||
                      !selectedDate || !selectedTime || !duration ||
                      booking
                    }
                    className="w-full bg-gray-900 text-white py-3 text-xs tracking-wide hover:bg-black transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {booking ? (
                      <>
                        <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                        Confirming…
                      </>
                    ) : 'Confirm booking'}
                  </button>
                  <p className="text-xs text-gray-300 text-center mt-3">
                    Free cancellation up to 30 mins before
                  </p>
                </div>
              </div>

              {/* View station link */}
              <button
                onClick={() => navigate(`/station/${stationId}`)}
                className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors text-center mt-4"
              >
                View station details
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default BookSlot
