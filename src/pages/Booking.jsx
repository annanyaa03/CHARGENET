import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Zap, Clock, Calendar, Car, 
  Info, ShieldCheck, ChevronRight, Check,
  AlertCircle, BatteryCharging, ArrowRight,
  Smartphone, CreditCard, Wallet, QrCode,
  CheckCircle
} from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { useAuthStore } from '../store/authStore'
import { stations } from '../mock/stations'
import { chargers } from '../mock/chargers'
import { formatINR } from '../utils/formatCurrency'
import toast from 'react-hot-toast'

/* ─── Helpers ─────────────────────────────────────────────────── */

/* ─── Peak hour logic (real time of day) ────────────────────────────── */
function getSlotHint(slotIndex) {
  // slotIndex: 0-23 (each = 30 min, so 0 = 00:00, 14 = 07:00, 17 = 08:30 ...)
  const hour = Math.floor(slotIndex / 2)
  // Peak hours: 7-9 AM and 5-8 PM (India national grid peak)
  if ((hour >= 7 && hour < 10) || (hour >= 17 && hour < 20)) return 'peak'
  // Off-peak: 11 PM - 5 AM (cheapest grid rate)
  if (hour >= 23 || hour < 5) return 'offpeak'
  return null
}

const currentHour = new Date().getHours()
const currentSlotIndex = currentHour * 2  // approximate current position in the grid

const SLOTS = Array.from({ length: 24 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  const label = `${String(h).padStart(2, '0')}:${m}`
  const booked = [2, 3, 10, 11, 12, 20, 21, 22].includes(i)
  const hint = getSlotHint(i)
  const isPast = i < currentSlotIndex
  return { id: i, label, booked, hint, isPast }
})

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
      fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })
  }
  return days
}

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / Google Pay', icon: Smartphone, desc: 'Secure & Instant' },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Master, Rupay' },
  { id: 'wallet', label: 'ChargeNet Wallet', icon: Wallet, desc: 'Prepaid Balance' },
]

/* ─── Components ──────────────────────────────────────────────── */

function DateItem({ date, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(date.date)}
      className={`group flex flex-col items-center flex-1 py-8 transition-all duration-500 relative border-b-2 sm:border-b-4 ${
        isSelected ? 'border-gray-900 bg-gray-50/50' : 'border-transparent text-gray-400 hover:text-gray-900'
      }`}
    >
      <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
        {date.dayName}
      </span>
      <span className={`text-4xl font-black mb-1 transition-all duration-500 leading-none tracking-tighter ${isSelected ? 'text-gray-900 scale-110' : 'text-gray-200 group-hover:text-gray-400'}`}>
        {date.dayNum}
      </span>
    </button>
  )
}

function SlotButton({ slot, isSelected, onClick }) {
  const hintColors = {
    peak:    { bg: 'bg-amber-50',   text: 'text-amber-600',   label: 'PEAK' },
    offpeak: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'CHEAP' },
  }
  const hint = hintColors[slot.hint]

  return (
    <button
      onClick={() => onClick(slot)}
      disabled={slot.booked}
      className={`relative h-16 text-sm font-black transition-all duration-300 flex flex-col items-center justify-center gap-0.5 border-none outline-none ${
        slot.booked
          ? 'bg-gray-50 shadow-inner text-gray-200 cursor-not-allowed opacity-40'
          : isSelected
          ? 'bg-gray-900 text-white z-20 scale-105 shadow-2xl'
          : hint
          ? `${hint.bg} text-gray-800 hover:bg-gray-100`
          : 'bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="tracking-tighter">{slot.label}</span>
      {!slot.booked && hint && !isSelected && (
        <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${hint.text}`}>
          {hint.label}
        </span>
      )}
      {/* Mini Selection Indicator */}
      {isSelected && <div className="absolute bottom-1 w-1 h-1 bg-white rounded-none" />}
    </button>
  )
}

/* ─── Main Page ───────────────────────────────────────────────── */

export default function Booking() {
  const { id, chargerId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const dates = useMemo(() => getNext7Days(), [])
  const [dateStr, setDateStr] = useState(dates[0].date)
  const [selectedSlots, setSelectedSlots] = useState([])
  const [vehicle, setVehicle] = useState(user?.evModel || 'Tata Nexon EV')
  const [method, setMethod] = useState('upi')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [confId] = useState('CN' + Math.random().toString(36).slice(2, 8).toUpperCase())

  const station = stations.find(s => s.id === id)
  const charger = chargers.find(c => c.id === chargerId)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Checkout — ChargeNet'
  }, [])

  if (!station || !charger) {
    return (
      <PageWrapper className="bg-white">
        <PageContainer>
          <div className="py-20 text-center">
            <AlertCircle size={48} className="text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Session expired or station not found.</p>
            <Button variant="outline" className="mt-8 rounded-none border-gray-900 text-gray-900 h-12 uppercase text-xs tracking-widest font-black" onClick={() => navigate('/map')}>
              Back to Fleet
            </Button>
          </div>
        </PageContainer>
      </PageWrapper>
    )
  }

  const toggleSlot = (slot) => {
    if (slot.booked) return
    setSelectedSlots(prev => {
      if (prev.includes(slot.id)) {
        return prev.filter(id => id !== slot.id)
      }
      return [...prev, slot.id].sort((a, b) => a - b)
    })
  }

  const hrs = selectedSlots.length * 0.5
  const kwh = hrs * (charger.powerKw || 50) * 0.85
  const cost = kwh * (charger.pricePerKwh || 0)
  
  const sorted = [...selectedSlots].sort((a, b) => a - b)
  const startLabel = sorted.length > 0 ? SLOTS.find(s => s.id === sorted[0])?.label : ''
  const endLabel = sorted.length > 0 
    ? SLOTS.find(s => s.id === sorted[sorted.length - 1] + 1)?.label || 'Next Day'
    : ''

  const handlePay = async () => {
    if (selectedSlots.length === 0) return toast.error('Pick your time slots')
    
    const contiguous = sorted.every((v, i, a) => i === 0 || v === a[i-1] + 1)
    if (!contiguous) return toast.error('Please pick continuous time slots')

    if (method === 'wallet' && (user?.walletBalance || 0) < cost) {
      return toast.error('Insufficient wallet balance')
    }

    setProcessing(true)
    await new Promise(r => setTimeout(r, 2000))
    setProcessing(false)
    setSuccess(true)
    toast.success('Confirmed')
  }

  if (success) {
    return (
      <PageWrapper className="bg-white">
        <PageContainer className="!max-w-4xl pt-20 pb-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-12 animate-in slide-in-from-bottom-4 duration-700">Reserved.</h1>
            <div className="space-y-12">
               <div className="flex flex-wrap gap-x-20 gap-y-10 py-12 border-y border-gray-100">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Order ID</label>
                    <span className="text-xl font-black text-gray-900">{confId}</span>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Station</label>
                    <span className="text-xl font-black text-gray-900">{station.name}</span>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Schedule</label>
                    <span className="text-xl font-black text-gray-900">{dates.find(d => d.date === dateStr)?.fullDate} · {startLabel}</span>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Paid</label>
                    <span className="text-xl font-black text-gray-900">{formatINR(cost)}</span>
                  </div>
               </div>

               <div className="flex gap-4">
                 <button onClick={() => navigate('/map')} className="h-14 px-10 border border-gray-900 text-gray-900 font-bold uppercase text-[9px] tracking-widest hover:bg-gray-50 transition-colors"> fleet </button>
                 <button onClick={() => navigate('/')} className="h-14 px-10 bg-gray-900 text-white font-bold uppercase text-[9px] tracking-widest hover:bg-black transition-colors"> home </button>
               </div>
            </div>
          </div>
        </PageContainer>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="bg-white">
      <PageContainer className="!max-w-7xl pb-20 pt-8 sm:pt-12">
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-4 text-gray-400 hover:text-gray-900 transition-all group">
            <div className="p-1.5 border border-gray-100 group-hover:border-gray-900 transition-all">
              <ArrowLeft size={14} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Cancel Booking</span>
          </button>
          <div className="hidden sm:flex items-center gap-6">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-200">
              Secure Reserve System v2.0
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Form */}
          <div className="lg:col-span-8">
            <header className="mb-12">
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter mb-4 leading-none cursor-default">Checkout.</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                {charger.company} <span className="mx-3 text-gray-100">|</span> {charger.plugType} <span className="mx-3 text-gray-100">|</span> {charger.powerKw}kW
              </p>
            </header>

            <div className="space-y-20">
              
              {/* 01. Configure */}
              <section>
                <div className="flex items-baseline gap-4 mb-10">
                  <span className="text-xl heading-premium">01.</span>
                  <h2 className="label-premium !text-gray-300">Specifications</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                  <div className="pb-4 border-b border-gray-100">
                    <label className="label-premium !text-gray-200 !text-[9px] block mb-4">Select Vehicle</label>
                    <div className="flex items-center group">
                      <select 
                        value={vehicle}
                        onChange={e => setVehicle(e.target.value)}
                        className="w-full bg-transparent text-lg value-premium appearance-none outline-none cursor-pointer"
                      >
                        <option>Tata Nexon EV Max</option>
                        <option>MG ZS EV Prestige</option>
                        <option>Hyundai Ioniq 5</option>
                        <option>Kia EV6 GT-Line</option>
                        <option>Mahindra XUV400</option>
                      </select>
                      <ChevronRight size={16} className="text-gray-200 group-hover:text-gray-900 transition-colors" />
                    </div>
                  </div>
                  <div className="pb-4 border-b border-gray-100">
                    <label className="label-premium !text-gray-200 !text-[9px] block mb-4">Location</label>
                    <span className="text-lg value-premium truncate block">{station.name}</span>
                  </div>
                </div>
              </section>

              {/* 02. Date */}
              <section>
                <div className="flex items-baseline gap-4 mb-10">
                  <span className="text-xl heading-premium">02.</span>
                  <h2 className="label-premium !text-gray-300">Select Date</h2>
                </div>
                <div className="flex border-b border-gray-100">
                  {dates.map(date => (
                    <DateItem 
                      key={date.date}
                      date={date}
                      isSelected={dateStr === date.date}
                      onClick={setDateStr}
                    />
                  ))}
                </div>
              </section>

              {/* 03. Time */}
              <section>
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-xl heading-premium">03.</span>
                  <h2 className="label-premium !text-gray-300">Choose Slots</h2>
                </div>

                {/* Live pricing hint */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-[9px] font-black uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <span className="w-3 h-3 bg-amber-50 border border-amber-200 inline-block" />
                    Peak · 7–10am, 5–8pm
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-3 h-3 bg-emerald-50 border border-emerald-200 inline-block" />
                    Off-Peak · 11pm–5am (cheapest)
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400 ml-auto">
                    🕐 Now: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-px bg-gray-100 border border-gray-100">
                  {SLOTS.map(slot => (
                    <SlotButton 
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedSlots.includes(slot.id)}
                      onClick={toggleSlot}
                    />
                  ))}
                </div>
              </section>

              {/* 04. Payment */}
              <section>
                <div className="flex items-baseline gap-4 mb-10">
                  <span className="text-xl heading-premium">04.</span>
                  <h2 className="label-premium !text-gray-300">Payment Gateway</h2>
                </div>
                <div className="space-y-4 max-w-2xl">
                  {PAYMENT_METHODS.filter(p => p.id !== 'wallet' || user).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setMethod(p.id)}
                      className={`w-full flex items-center justify-between py-10 border-b transition-all duration-500 relative group px-2 overflow-hidden ${
                        method === p.id ? 'bg-gray-50/50' : 'bg-transparent hover:bg-gray-50/20'
                      }`}
                    >
                      {/* Interaction Line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${
                        method === p.id ? 'bg-gray-900 h-full' : 'bg-transparent h-0 group-hover:h-full group-hover:bg-gray-200'
                      }`} />

                      <div className="flex items-center gap-8">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-none transition-all duration-500 ${method === p.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-300'}`}>
                          <p.icon size={24} />
                        </div>
                        <div className="text-left">
                          <p className="text-lg font-black uppercase tracking-tighter text-gray-900">{p.label}</p>
                          <p className="text-[10px] font-black text-gray-400 tracking-[0.2em]">{p.desc}</p>
                        </div>
                      </div>
                      
                      <div className={`transition-all duration-500 ${
                        method === p.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
                      }`}>
                         <div className={`w-10 h-10 border-2 rounded-none flex items-center justify-center ${method === p.id ? 'border-gray-900 bg-gray-900' : 'border-gray-200'}`}>
                           {method === p.id && <Check size={20} className="text-white" strokeWidth={3} />}
                         </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Sticky Summary */}
          <div className="lg:col-span-4">
             <div className="lg:sticky lg:top-32">
                 <div className="py-10 border-b-2 border-gray-900 mb-10">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-900 mb-12">Reservation Summary</h3>
                   
                   <div className="space-y-12">
                       <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 block mb-3">Schedule</span>
                        <p className="text-xl font-black text-gray-900 leading-tight tracking-tighter uppercase">
                          {dates.find(d => d.date === dateStr)?.fullDate}<br/>
                          <span className="text-gray-400">{startLabel ? `${startLabel} — ${endLabel}` : 'Not scheduled'}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-8 border-t border-gray-50 pt-10">
                         <div>
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 block mb-3">Energy</span>
                          <p className="text-xl font-black text-gray-900 tracking-tighter uppercase">{kwh > 0 ? `${kwh.toFixed(1)} kWh` : '--'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 block mb-3">Duration</span>
                          <p className="text-xl font-black text-gray-900 tracking-tighter uppercase">{hrs > 0 ? `${hrs * 60}m` : '--'}</p>
                        </div>
                      </div>

                       <div className="pt-12 border-t border-gray-100 flex items-baseline justify-between mb-12">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Total Price</span>
                        <span className="text-5xl font-black tracking-tighter text-gray-900">{formatINR(cost)}</span>
                      </div>

                      <Button
                        variant="primary"
                        fullWidth
                        loading={processing}
                        onClick={handlePay}
                        disabled={selectedSlots.length === 0}
                        className="!h-24 !rounded-none !bg-gray-900 hover:!bg-black text-white font-black uppercase text-sm tracking-[0.5em] shadow-2xl shadow-gray-900/40 flex items-center justify-center gap-4 transition-all hover:-translate-y-1"
                      >
                         {processing ? 'Processing' : 'Confirm Reserve'}
                         {!processing && <ArrowRight size={22} strokeWidth={3} />}
                      </Button>

                      <div className="flex items-center justify-center gap-3 text-gray-200">
                        <ShieldCheck size={16} />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em]">Encrypted Channel v2.4</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </PageContainer>
    </PageWrapper>
  )
}
