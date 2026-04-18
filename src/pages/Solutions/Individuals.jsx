import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'

const STATS = [
  { value: '80+', label: 'STATIONS ACROSS INDIA' },
  { value: '3', label: 'CHARGER TYPES SUPPORTED' },
  { value: '24/7', label: 'ALWAYS AVAILABLE' },
  { value: '₹8', label: 'STARTING PER KWH' },
]

const steps = [
  {
    step: '01',
    title: 'Find a station',
    description: 'Browse our interactive map to find charging stations near your home, office or along your route. Filter by charger type and real-time availability.',
    detail: [
      '80+ stations across India',
      'Real-time availability updates',
      'Filter by charger type',
      'Search by city or address'
    ]
  },
  {
    step: '02',
    title: 'Book your slot',
    description: 'Reserve a charging slot in advance. Choose your preferred time, duration and charger type. Get instant confirmation.',
    detail: [
      'Book up to 7 days in advance',
      'Choose CCS, Type2 or CHAdeMO',
      'Select duration 30min to 3hrs',
      'Instant booking confirmation'
    ]
  },
  {
    step: '03',
    title: 'Charge and go',
    description: 'Arrive at the station, plug in and charge. Track your session in real-time and get a digital receipt instantly.',
    detail: [
      'No waiting or queuing',
      'Real-time session tracking',
      'Digital receipt generated',
      'Carbon offset calculated'
    ]
  },
  {
    step: '04',
    title: 'Track history',
    description: 'View all your past charging sessions, total energy consumed, money spent and carbon offset in your personal dashboard.',
    detail: [
      'Full session history',
      'Energy consumption stats',
      'Monthly cost breakdown',
      'Carbon offset tracking'
    ]
  }
]
const comparisons = [
  {
    label: 'Finding a station',
    without: 'Google Maps, guesswork',
    with: 'Real-time map, instant search',
    stat: '80+ stations mapped live'
  },
  {
    label: 'Charger availability',
    without: 'Unknown until you arrive',
    with: 'Live status before you leave',
    stat: 'Updated every second'
  },
  {
    label: 'Waiting time',
    without: 'Up to 45 mins queue',
    with: 'Zero, slot pre-booked',
    stat: '100% slot guarantee'
  },
  {
    label: 'Payment',
    without: 'Cash or multiple apps',
    with: 'One tap, UPI or wallet',
    stat: 'UPI, cards, wallets accepted'
  },
  {
    label: 'Session history',
    without: 'No record kept',
    with: 'Full dashboard history',
    stat: 'Every session logged'
  },
  {
    label: 'Cost tracking',
    without: 'Manual receipts',
    with: 'Auto digital receipts',
    stat: 'GST compliant, instant'
  }
]


export default function Individuals() {
  const [activeStep, setActiveStep] = useState(0)
  const [activeRow, setActiveRow] = useState(null)

  useEffect(() => {
    document.title = 'For Individuals — ChargeNet'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      <Navbar solid />

      {/* ── HERO ── */}
      <section className="pt-32 pb-6 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-8">Solutions / Individuals</p>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
              CHARGE <br />
              YOUR WAY.
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-xl">
              Access India&apos;s most reliable EV network. Real-time availability, advance bookings, and seamless payments for the modern driver.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="h-14 px-10 bg-gray-900 text-white flex items-center justify-center font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                Get Started Free
              </Link>
              <Link to="/map" className="h-14 px-10 border border-gray-200 flex items-center justify-center font-bold uppercase text-[10px] tracking-widest hover:border-gray-900 transition-all">
                Explore The Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS (Minimalist Grid) ── */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {STATS.map((s, i) => (
              <div key={i} className="py-6 px-6 first:pl-0">
                <p className="text-4xl font-bold tracking-tighter mb-1">{s.value}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (Interactive) ── */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-8">
            
            {/* Left Label */}
            <div className="col-span-3">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest sticky top-24">
                How it works
              </p>
            </div>

            {/* Right Content */}
            <div className="col-span-9">
              
              {/* Step Navigation */}
              <div className="flex items-center gap-0 mb-6 border-b border-gray-100">
                {steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`px-6 py-2 text-xs transition-all border-b-2 -mb-px ${
                      activeStep === i
                        ? 'border-gray-900 text-gray-900 font-bold'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}>
                    {s.step}
                  </button>
                ))}
              </div>

              {/* Active Step Content */}
              <div className="grid grid-cols-2 gap-8">
                
                {/* Left - Title + Description */}
                <div>
                  <p className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-widest">
                    Step {steps[activeStep].step}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    {steps[activeStep].description}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                      disabled={activeStep === 0}
                      className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                      disabled={activeStep === steps.length - 1}
                      className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                    <span className="text-xs text-gray-400 font-bold ml-1">
                      {activeStep + 1} / {steps.length}
                    </span>
                  </div>
                </div>

                {/* Right - Detail Points */}
                <div className="border-l border-gray-100 pl-12">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">
                    What you get
                  </p>
                  <ul className="space-y-3">
                    {steps[activeStep].detail.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-px h-4 bg-gray-300 mt-1 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Progress Indicator */}
                  <div className="flex gap-1.5 mt-8">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveStep(i)}
                        className={`h-px transition-all ${
                          i === activeStep
                            ? 'w-8 bg-gray-900'
                            : 'w-4 bg-gray-200 hover:bg-gray-400'
                        }`}>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHARGENET (Interactive Comparison) ── */}
      <section className="py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-12">
            
            {/* Left Label */}
            <div className="col-span-3">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest sticky top-24">
                Why ChargeNet
              </p>
            </div>

            {/* Right Content */}
            <div className="col-span-9">

              {/* Title */}
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight leading-snug mb-4">
                  Built for the everyday
                  <br />
                  EV driver.
                </h2>
                <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                  From your first charge to your hundredth, ChargeNet makes every session seamless.
                </p>
              </div>

              {/* Interactive Comparison */}
              <div className="grid grid-cols-12 gap-0 mb-8">

                {/* Comparison Rows */}
                <div className="col-span-8">
                  
                  {/* Header */}
                  <div className="grid grid-cols-2 mb-4">
                    <p className="text-xs text-gray-400 uppercase tracking-widest pb-3 border-b border-gray-200">
                      Without ChargeNet
                    </p>
                    <p className="text-xs text-white uppercase tracking-widest pb-3 border-b border-gray-900 bg-gray-900 px-4 py-3 -mt-3">
                      With ChargeNet
                    </p>
                  </div>

                  {/* Rows */}
                  {comparisons.map((row, i) => (
                    <div
                      key={i}
                      onMouseEnter={() => setActiveRow(i)}
                      onMouseLeave={() => setActiveRow(null)}
                      className={`grid grid-cols-2 border-b border-gray-50 cursor-default transition-all duration-200 ${
                        activeRow === i ? 'bg-gray-50' : ''
                      }`}>
                      
                      {/* Without */}
                      <div className="py-4 pr-8">
                        <p className={`text-xs transition-all duration-200 ${
                          activeRow === i ? 'text-gray-400' : 'text-gray-300'
                        }`}>
                          {row.without}
                        </p>
                      </div>

                      {/* With ChargeNet */}
                      <div className={`py-4 px-4 transition-all duration-200 border-l ${
                        activeRow === i ? 'border-gray-200' : 'border-gray-50'
                      }`}>
                        <p className={`text-xs font-medium transition-all duration-200 ${
                          activeRow === i ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {row.with}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right - Active Row Detail */}
                <div className="col-span-4 pl-10 border-l border-gray-100">
                  <div className="sticky top-24">
                    {activeRow !== null ? (
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">
                          {comparisons[activeRow].label}
                        </p>
                        <p className="text-2xl font-normal text-gray-900 tracking-tight mb-6 leading-snug">
                          {comparisons[activeRow].with}
                        </p>
                        <div className="h-px bg-gray-100 mb-6"></div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {comparisons[activeRow].stat}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-300 font-bold uppercase tracking-widest mb-4">
                          Hover a row
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          See how ChargeNet improves each part of your charging experience.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline - Your first week */}
              <div>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-6">
                  Your first week with ChargeNet
                </p>

                <div className="grid grid-cols-4 gap-0 border border-gray-100">
                  {[
                    {
                      day: 'Day 1',
                      title: 'Sign up',
                      description: 'Create your free account and explore stations on the map.'
                    },
                    {
                      day: 'Day 2',
                      title: 'First booking',
                      description: 'Reserve a slot at your nearest station in under a minute.'
                    },
                    {
                      day: 'Day 3',
                      title: 'First charge',
                      description: 'Arrive, plug in and track your session live from the app.'
                    },
                    {
                      day: 'Day 7',
                      title: 'Your dashboard',
                      description: 'See your weekly summary, energy used and carbon offset.'
                    }
                  ].map((item, i, arr) => (
                    <div
                      key={i}
                      className={`p-6 transition-all duration-300 hover:bg-gray-50 cursor-default group ${i !== arr.length - 1 ? 'border-r border-gray-100' : ''}`}
                    >
                      <p className="text-xs text-gray-300 mb-4 font-mono font-bold transition-colors group-hover:text-gray-900">
                        {item.day}
                      </p>
                      <p className="text-base font-bold text-gray-900 mb-2">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-12 items-center">
            
            {/* Left */}
            <div className="col-span-7">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
                Ready to start charging?
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Join thousands of EV drivers already using ChargeNet across India.
              </p>
            </div>

            {/* Right - Buttons */}
            <div className="col-span-5 flex items-center justify-end gap-3">
              <Link to="/signup"
                className="bg-gray-900 text-white px-6 py-3 text-sm font-medium hover:bg-black transition-all">
                Create account
              </Link>
              <Link to="/map"
                className="border border-gray-200 text-gray-600 px-6 py-3 text-sm hover:border-gray-400 transition-all">
                Explore map
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
