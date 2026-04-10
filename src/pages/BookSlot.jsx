import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, MapPin, Star, Clock, Zap, BatteryCharging,
  ChevronDown, ArrowRight, Plug, Shield, Calendar,
  Sparkles, Check, ChevronRight, ArrowLeft
} from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { stations } from '../mock/stations'
import { chargers } from '../mock/chargers'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

/* ─── Status Config ────────────────────────────────────────── */
const STATUS_CFG = {
  active:   { label: 'Available', color: '#10B981', bg: '#D1FAE5', dot: '#34D399' },
  busy:     { label: 'Busy',      color: '#F59E0B', bg: '#FEF3C7', dot: '#FBBF24' },
  inactive: { label: 'Offline',   color: '#EF4444', bg: '#FEE2E2', dot: '#F87171' },
  faulty:   { label: 'Faulty',    color: '#6B7280', bg: '#F3F4F6', dot: '#9CA3AF' },
}

const CITIES = [...new Set(stations.map(s => s.city).sort())]

const getNext7Days = () => {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      date: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0,
    })
  }
  return days
}

const SLOTS = Array.from({ length: 24 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  const label = `${String(h).padStart(2, '0')}:${m}`
  const booked = [2, 3, 10, 11, 12, 20, 21, 22].includes(i)
  return { id: i, label, booked }
})

/* ─── Main Page ────────────────────────────────────────────── */
export default function BookSlot() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const dates = useMemo(() => getNext7Days(), [])

  // Steps
  const [step, setStep] = useState(1)

  // Step 1: City + Station
  const [selectedCity, setSelectedCity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStation, setSelectedStation] = useState(null)

  // Step 2: Charger
  const [selectedCharger, setSelectedCharger] = useState(null)

  // Step 3: Date + Time
  const [selectedDate, setSelectedDate] = useState(dates[0].date)
  const [selectedSlots, setSelectedSlots] = useState([])

  useEffect(() => {
    document.title = 'Book a Slot — ChargeNet'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  // Filtered stations
  const filteredStations = useMemo(() => {
    let result = stations.filter(s => s.status === 'active' || s.status === 'busy')
    if (selectedCity) result = result.filter(s => s.city === selectedCity)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => a.distance - b.distance)
  }, [selectedCity, searchQuery])

  // Chargers for selected station
  const stationChargers = useMemo(() => {
    if (!selectedStation) return []
    return chargers.filter(c => c.stationId === selectedStation.id && (c.status === 'active' || c.status === 'busy'))
  }, [selectedStation])

  const toggleSlot = (slot) => {
    if (slot.booked) return
    setSelectedSlots(prev => {
      if (prev.includes(slot.id)) return prev.filter(id => id !== slot.id)
      return [...prev, slot.id].sort((a, b) => a - b)
    })
  }

  const handleConfirm = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (selectedCharger && selectedStation) {
      navigate(`/station/${selectedStation.id}/book/${selectedCharger.id}`)
    }
  }

  const stepComplete = (s) => {
    if (s === 1) return !!selectedStation
    if (s === 2) return !!selectedCharger
    if (s === 3) return selectedSlots.length > 0
    return false
  }

  return (
    <PageWrapper>
      <PageContainer className="!max-w-5xl !py-0">

        {/* ── Hero ── */}
        <div className="pt-12 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Smart Booking</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-3">
            Book a Slot
          </h1>
          <p className="text-gray-500 text-base max-w-xl font-medium">
            Reserve your EV charging slot in 3 simple steps.
          </p>
        </div>

        {/* ── Progress Steps ── */}
        <div className="flex items-center gap-0 mb-10 border-b border-gray-100 pb-6">
          {[
            { num: 1, label: 'Select Station' },
            { num: 2, label: 'Choose Charger' },
            { num: 3, label: 'Pick Time & Confirm' },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => { if (s.num < step || stepComplete(s.num - 1)) setStep(s.num) }}
                className={`flex items-center gap-3 py-2 px-1 transition-all ${
                  step === s.num ? 'opacity-100' : step > s.num ? 'opacity-60 hover:opacity-80' : 'opacity-30'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s.num
                    ? 'bg-emerald-500 text-white'
                    : step === s.num
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <span className={`text-sm font-bold hidden sm:block ${
                  step === s.num ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {s.label}
                </span>
              </button>
              {i < 2 && (
                <div className={`flex-1 h-px mx-4 transition-colors ${
                  step > s.num ? 'bg-emerald-300' : 'bg-gray-100'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Step 1: Select Station ── */}
        {step === 1 && (
          <div className="pb-16 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-6">
              <h2 className="text-xl font-black text-gray-900 mb-1">Where do you want to charge?</h2>
              <p className="text-sm text-gray-400">Select a city and pick your preferred station.</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="Search station by name or address..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
              />
            </div>

            {/* Station list */}
            <div className="space-y-2">
              {filteredStations.length === 0 ? (
                <div className="text-center py-16">
                  <MapPin size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No stations found</p>
                </div>
              ) : (
                filteredStations.map(station => {
                  const cfg = STATUS_CFG[station.status]
                  const isSelected = selectedStation?.id === station.id
                  return (
                    <button
                      key={station.id}
                      onClick={() => setSelectedStation(station)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${
                        isSelected
                          ? 'border-gray-900 bg-gray-50 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                          }`}>
                            <Zap size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-bold text-gray-900 truncate">{station.name}</p>
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0"
                                style={{ background: cfg.bg, color: cfg.color }}
                              >
                                <span className="w-1 h-1 rounded-full" style={{ background: cfg.dot }} />
                                {cfg.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <MapPin size={10} /> {station.city}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star size={10} className="text-amber-400 fill-amber-400" /> {station.rating}
                              </span>
                              <span>{station.availableChargers}/{station.totalChargers} free</span>
                              <span>{(station.distance / 1000).toFixed(1)} km</span>
                            </div>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-200'
                        }`}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Next button */}
            {selectedStation && (
              <div className="sticky bottom-6 mt-8 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 shadow-xl shadow-gray-900/20 hover:-translate-y-0.5 transition-all"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Choose Charger ── */}
        {step === 2 && (
          <div className="pb-16 animate-in fade-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 font-medium mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Change station
            </button>

            <div className="mb-8">
              <h2 className="text-xl font-black text-gray-900 mb-1">Choose your charger</h2>
              <p className="text-sm text-gray-400">
                at <span className="text-gray-600 font-semibold">{selectedStation?.name}</span>
              </p>
            </div>

            <div className="space-y-3">
              {stationChargers.length === 0 ? (
                <div className="text-center py-16">
                  <BatteryCharging size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No chargers available at this station</p>
                </div>
              ) : (
                stationChargers.map(charger => {
                  const isSelected = selectedCharger?.id === charger.id
                  const cfg = STATUS_CFG[charger.status]
                  return (
                    <button
                      key={charger.id}
                      onClick={() => setSelectedCharger(charger)}
                      className={`w-full text-left p-5 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? 'border-gray-900 bg-gray-50 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-bold text-gray-900">{charger.company}</p>
                            <span
                              className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase"
                              style={{ background: cfg.bg, color: cfg.color }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600">
                              <Plug size={11} /> {charger.plugType}
                            </span>
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700">
                              <Zap size={11} /> {charger.powerKw} kW
                            </span>
                            <span className="px-2.5 py-1 bg-emerald-50 rounded-lg text-xs font-semibold text-emerald-700">
                              ₹{charger.pricePerKwh}/kWh
                            </span>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 transition-all ${
                          isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-200'
                        }`}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {selectedCharger && (
              <div className="sticky bottom-6 mt-8 flex justify-end">
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 shadow-xl shadow-gray-900/20 hover:-translate-y-0.5 transition-all"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Pick Time & Confirm ── */}
        {step === 3 && (
          <div className="pb-16 animate-in fade-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 font-medium mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Change charger
            </button>

            <div className="mb-8">
              <h2 className="text-xl font-black text-gray-900 mb-1">Pick your time</h2>
              <p className="text-sm text-gray-400">
                {selectedCharger?.company} · {selectedCharger?.plugType} · {selectedCharger?.powerKw}kW
                at {selectedStation?.name}
              </p>
            </div>

            {/* Date picker */}
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Select Date</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dates.map(d => (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`flex flex-col items-center min-w-[72px] py-3 px-4 rounded-xl border transition-all ${
                      selectedDate === d.date
                        ? 'border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      selectedDate === d.date ? 'text-gray-400' : 'text-gray-400'
                    }`}>
                      {d.isToday ? 'Today' : d.dayName}
                    </span>
                    <span className="text-xl font-black">{d.dayNum}</span>
                    <span className={`text-[10px] font-semibold ${
                      selectedDate === d.date ? 'text-gray-400' : 'text-gray-400'
                    }`}>
                      {d.monthShort}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Time Slots</p>
                {selectedSlots.length > 0 && (
                  <span className="text-xs font-bold text-gray-600">
                    {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} · {selectedSlots.length * 30}min
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {SLOTS.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => toggleSlot(slot)}
                    disabled={slot.booked}
                    className={`h-11 rounded-lg text-xs font-bold transition-all ${
                      slot.booked
                        ? 'bg-gray-50 text-gray-200 cursor-not-allowed line-through'
                        : selectedSlots.includes(slot.id)
                        ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20'
                        : 'bg-white border border-gray-100 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-gray-100" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-900" /> Selected</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-50" /> Booked</span>
              </div>
            </div>

            {/* Summary + Confirm */}
            {selectedSlots.length > 0 && (
              <div className="border border-gray-900 rounded-2xl p-6 mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-5">Booking Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Station</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{selectedStation?.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Charger</p>
                    <p className="text-sm font-bold text-gray-900">{selectedCharger?.company}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {dates.find(d => d.date === selectedDate)?.monthShort} {dates.find(d => d.date === selectedDate)?.dayNum}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Duration</p>
                    <p className="text-sm font-bold text-gray-900">{selectedSlots.length * 30} minutes</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Estimated Cost</p>
                    <p className="text-2xl font-black text-gray-900">
                      ₹{Math.round(selectedSlots.length * 0.5 * (selectedCharger?.powerKw || 50) * 0.85 * (selectedCharger?.pricePerKwh || 15))}
                    </p>
                  </div>
                  <button
                    onClick={handleConfirm}
                    className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 shadow-xl shadow-gray-900/20 hover:-translate-y-0.5 transition-all"
                  >
                    Proceed to Checkout
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-gray-300">
              <Shield size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Free cancellation · Instant confirmation</span>
            </div>
          </div>
        )}

      </PageContainer>
    </PageWrapper>
  )
}
