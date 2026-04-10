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

const SLOTS = Array.from({ length: 24 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  const label = `${String(h).padStart(2, '0')}:${m}`
  const booked = [2, 3, 10, 11, 12, 20, 21, 22].includes(i)
  return { id: i, label, booked }
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
      className={`group flex items-center justify-between py-6 border-b transition-all ${
        isSelected ? 'border-gray-900' : 'border-gray-100 hover:border-gray-300'
      }`}
    >
      <div className="flex flex-col items-start px-2">
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
          {date.dayName}
        </span>
        <span className={`text-2xl font-black tracking-tighter ${isSelected ? 'text-gray-900' : 'text-gray-200'}`}>
          {date.dayNum}
        </span>
      </div>
      <div className={`w-8 h-8 rounded-none border flex items-center justify-center transition-all ${
        isSelected ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-100 text-transparent'
      }`}>
        <Check size={14} />
      </div>
    </button>
  )
}

function SlotButton({ slot, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(slot)}
      disabled={slot.booked}
      className={`relative h-14 text-sm font-bold transition-all border ${
        slot.booked
          ? 'bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed'
          : isSelected
          ? 'bg-gray-900 border-gray-900 text-white z-10'
          : 'bg-white border-gray-100 text-gray-600 hover:border-gray-900'
      }`}
    >
      {slot.label}
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
      <PageContainer className="!max-w-7xl pb-20 pt-10">
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-24 border-b border-gray-50 pb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-4 text-gray-300 hover:text-gray-900 transition-all group">
            <div className="p-2 border border-gray-100 group-hover:border-gray-900">
              <ArrowLeft size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cancel Booking</span>
          </button>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-200">
            Secure Reserve System v2.0
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Main Form */}
          <div className="lg:col-span-8">
            <header className="mb-16">
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4 leading-none">Checkout.</h1>
              <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em]">{charger.company} · {charger.plugType} · {charger.powerKw}kW</p>
            </header>

            <div className="space-y-32">
              
              {/* 01. Configure */}
              <section>
                <div className="flex items-baseline gap-4 mb-10">
                  <span className="text-xl font-black text-gray-900 tracking-tighter">01.</span>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-300">Specifications</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                  <div className="pb-4 border-b border-gray-100">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 block mb-4">Select Vehicle</label>
                    <div className="flex items-center group">
                      <select 
                        value={vehicle}
                        onChange={e => setVehicle(e.target.value)}
                        className="w-full bg-transparent text-lg font-black text-gray-900 appearance-none outline-none cursor-pointer"
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
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 block mb-4">Location</label>
                    <span className="text-lg font-black text-gray-900 truncate block">{station.name}</span>
                  </div>
                </div>
              </section>

              {/* 02. Date */}
              <section>
                <div className="flex items-baseline gap-4 mb-10">
                  <span className="text-xl font-black text-gray-900 tracking-tighter">02.</span>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-300">Select Date</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 border-t border-l border-gray-100">
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
                <div className="flex items-baseline gap-4 mb-10">
                  <span className="text-xl font-black text-gray-900 tracking-tighter">03.</span>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-300">Choose Slots</h2>
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
                  <span className="text-xl font-black text-gray-900 tracking-tighter">04.</span>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-300">Payment Gateway</h2>
                </div>
                <div className="space-y-4 max-w-2xl">
                  {PAYMENT_METHODS.filter(p => p.id !== 'wallet' || user).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setMethod(p.id)}
                      className={`w-full flex items-center justify-between p-8 border transition-all ${
                        method === p.id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-none border ${method === p.id ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-100 text-gray-300'}`}>
                          <p.icon size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black uppercase tracking-wider text-gray-900">{p.label}</p>
                          <p className="text-[10px] font-bold text-gray-400 tracking-wide">{p.desc}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-none border-2 flex items-center justify-center ${method === p.id ? 'border-gray-900' : 'border-gray-200'}`}>
                        {method === p.id && <div className="w-2.5 h-2.5 bg-gray-900 rounded-none" />}
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
                <div className="border border-gray-900 p-10">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-10">Reservation Summary</h3>
                   
                   <div className="space-y-10">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Schedule</span>
                        <p className="text-base font-black text-gray-900 leading-tight">
                          {dates.find(d => d.date === dateStr)?.fullDate}<br/>
                          {startLabel ? `${startLabel} — ${endLabel}` : 'Not scheduled'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Energy</span>
                          <p className="text-base font-black text-gray-900">{kwh > 0 ? `${kwh.toFixed(1)} kWh` : '--'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Duration</span>
                          <p className="text-base font-black text-gray-900">{hrs > 0 ? `${hrs * 60}m` : '--'}</p>
                        </div>
                      </div>

                      <div className="pt-10 border-t border-gray-100 flex items-baseline justify-between mb-10">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Estimated Total</span>
                        <span className="text-3xl font-black text-gray-900 tracking-tighter">{formatINR(cost)}</span>
                      </div>

                      <Button
                        variant="primary"
                        fullWidth
                        loading={processing}
                        onClick={handlePay}
                        disabled={selectedSlots.length === 0}
                        className="!h-20 !rounded-none !bg-gray-900 hover:!bg-black text-white font-black uppercase text-xs tracking-[0.2em] shadow-none flex items-center justify-center gap-3"
                      >
                         {processing ? 'Processing' : 'Confirm Reserve'}
                         {!processing && <ArrowRight size={18} />}
                      </Button>

                      <div className="flex items-center justify-center gap-2 text-gray-300">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">SSL Encrypted Channel</span>
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
