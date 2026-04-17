import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, MapPin, Zap, Calendar, ArrowRight, Home } from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'

export default function BookingSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const { booking, station, charger } = location.state || {}

  if (!booking) {
    return (
      <PageWrapper className="bg-white">
        <PageContainer className="py-20 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase">Order Not Found</h2>
          <button onClick={() => navigate('/map')} className="mt-8 px-8 py-3 bg-gray-900 text-white font-black uppercase text-[10px] tracking-widest hover:bg-black">
            Back to Map
          </button>
        </PageContainer>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="bg-white">
      <PageContainer className="!max-w-4xl py-20">
        <div className="flex flex-col items-center justify-center text-center">
          
          <div className="w-20 h-20 bg-emerald-50 flex items-center justify-center mb-8 border border-emerald-100">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4 uppercase leading-none">Confirmed.</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-16">Reservation Protocol Complete</p>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100 border border-gray-100 mb-16">
            <div className="bg-white p-10 text-left">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 block mb-3">Charging Station</label>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-2">{station?.name}</h3>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1.5">
                <MapPin size={10} /> {station?.address}, {station?.city}
              </p>
            </div>
            
            <div className="bg-white p-10 text-left">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 block mb-3">Schedule</label>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-2">{booking?.booking_date}</h3>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1.5">
                <Calendar size={10} /> {booking?.booking_time} · {booking?.duration_minutes} Minutes
              </p>
            </div>

            <div className="bg-white p-10 text-left">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 block mb-3">Charger Unit</label>
              <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-1">{charger?.type} Charger</h3>
              <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                <Zap size={10} /> {charger?.power_kw} kW Unit
              </p>
            </div>

            <div className="bg-white p-10 text-left">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 block mb-3">Financials</label>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-1">₹{booking?.estimated_cost}</h3>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Payment Confirmed</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/map')} 
              className="h-14 px-10 bg-gray-900 text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-black transition-all"
            >
              Return to Fleet <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="h-14 px-10 border border-gray-900 text-gray-900 font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-gray-50 transition-all"
            >
              Home <Home size={14} />
            </button>
          </div>
          
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
