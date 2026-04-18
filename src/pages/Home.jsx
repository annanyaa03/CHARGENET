import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, MapPin, Search, Play, Star, 
  CalendarCheck, BatteryCharging, 
  Navigation, Clock, CreditCard, Headphones, ChevronRight
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';

/* --- Components --- */

const Reveal = ({ children, delay = 0, y = 20 }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const CountUp = ({ end, suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end]);
  
  return <>{count.toLocaleString()}{suffix}</>;
};


export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeStep, setActiveStep] = useState(null);


  const stats = [
    { value: 50000, suffix: '+', label: 'Charging Stations' },
    { value: 500, suffix: '+', label: 'Cities Covered' },
    { value: 5000000, suffix: '+', label: 'Registered Users' },
    { value: 99.99, suffix: '%', label: 'Uptime Reliability' },
  ];

  const steps = [
    { 
      number: '01', 
      title: 'Find', 
      icon: MapPin, 
      desc: 'Search by city or area to locate the nearest charger on our real-time map.' 
    },
    { 
      number: '02', 
      title: 'Book', 
      icon: CalendarCheck, 
      desc: 'Reserve your charging slot in advance to avoid waiting at the station.' 
    },
    { 
      number: '03', 
      title: 'Charge', 
      icon: BatteryCharging, 
      desc: 'Plug in and track your session details directly from the ChargeNet app.' 
    },
  ];

  const features = [
    { 
      title: 'Real-time Availability',
      tag: 'Live Data',
      icon: Clock, 
      desc: 'See which chargers are currently free or occupied before you arrive. Our live map refreshes every 30 seconds so you always have the most accurate station data.',
      stat: '30s', statLabel: 'Refresh rate',
      color: '#1D9E75',
    },
    { 
      title: 'Advance Slot Booking',
      tag: 'Smart Reserve',
      icon: CalendarCheck, 
      desc: 'Pre-book your charging time up to 7 days in advance and skip the queue entirely. Get SMS and in-app reminders before your session begins.',
      stat: '7 days', statLabel: 'Booking window',
      color: '#3B82F6',
    },
    { 
      title: 'Multi-vehicle Support',
      tag: 'Universal',
      icon: Zap, 
      desc: 'Full compatibility with all major EV models — Tata, Ola, Ather, BYD, Hyundai and more. Supports AC slow, DC fast, and CCS2 connector standards.',
      stat: '50+ models', statLabel: 'Supported',
      color: '#F59E0B',
    },
    { 
      title: 'Smart Trip Planner',
      tag: 'AI-Powered',
      icon: Navigation, 
      desc: 'Enter your destination and our AI auto-selects optimal charging stops along your route — accounting for your battery level, station speed, and travel time.',
      stat: 'AI', statLabel: 'Route planning',
      color: '#8B5CF6',
    },
    { 
      title: '24/7 Live Support',
      tag: 'Always On',
      icon: Headphones, 
      desc: 'Round-the-clock assistance via chat, phone, or in-app ticket. Our average first-response time is under 3 minutes — even at 3 AM.',
      stat: '<3 min', statLabel: 'Response time',
      color: '#EC4899',
    },
    { 
      title: 'Secure Payments',
      tag: 'PCI-DSS',
      icon: CreditCard, 
      desc: 'Pay seamlessly via UPI, credit/debit cards, or ChargeNet wallet. Every transaction is encrypted end-to-end with PCI-DSS Level 1 compliance.',
      stat: '256-bit', statLabel: 'Encryption',
      color: '#10B981',
    },
  ];


  const testimonials = [
    { 
      name: 'Aarav Sharma', 
      city: 'Mumbai', 
      quote: 'ChargeNet has completely changed how I plan my weekend trips. No more range anxiety!',
      rating: 5,
      initials: 'AS'
    },
    { 
      name: 'Priya Patel', 
      city: 'Bengaluru', 
      quote: "The slot booking feature is a life-saver in the city. I never have to wait anymore.",
      rating: 5,
      initials: 'PP'
    },
    { 
      name: 'Rahul Varma', 
      city: 'Delhi', 
      quote: 'Clean stations, fast chargers, and a very intuitive app. Highly recommended!',
      rating: 5,
      initials: 'RV'
    },
  ];

  return (
    <PageWrapper noPadding={true}>
      <div className="w-full overflow-hidden bg-white">
        {/* ─── Hero Section ─── */}
        <section className="relative min-h-screen flex items-center justify-start pt-20">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.pexels.com/photos/2912309/pexels-photo-2912309.jpeg?auto=compress&cs=tinysrgb&w=3840" 
              alt="White vehicle on paved road"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/80 to-[#0a0a0a]/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-10 text-left space-y-8">
            <Reveal delay={0.2} y={30}>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1]" style={{ fontFamily: 'Fraunces, serif' }}>
                Find your next <br />
                <span className="text-white">charge point</span>
              </h1>
            </Reveal>

            <Reveal delay={0.4} y={20}>
              <p className="max-w-2xl text-white text-lg md:text-xl leading-relaxed">
                Discover nearby EV charging stations, check real-time availability, 
                book your slot, and charge with confidence.
              </p>
            </Reveal>

            {/* Search Bar */}
            <Reveal delay={0.6}>
              <div className="max-w-md mt-10">
                <div className="relative group">
                  <div className="relative flex items-center p-1.5 bg-white/10 backdrop-blur-md rounded-none">
                    <div className="flex-1 flex items-center px-4 gap-3">
                      <Search className="text-white/50" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search by city or area..."
                        className="w-full bg-transparent border-none outline-none text-white placeholder-white/30 py-2.5 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') navigate(searchQuery ? `/map?q=${encodeURIComponent(searchQuery)}` : '/map') }}
                      />
                    </div>
                    <button 
                      onClick={() => navigate(searchQuery ? `/map?q=${encodeURIComponent(searchQuery)}` : '/map')}
                      className="bg-[#1D9E75] hover:bg-[#168561] text-white px-6 py-2.5 rounded-none font-bold transition-all active:scale-95 text-xs shadow-lg shadow-[#1D9E75]/20"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Secondary Buttons */}
            <Reveal delay={0.8}>
              <div className="flex flex-wrap items-center justify-start gap-6 mt-8">
                <button 
                  onClick={() => navigate('/map')}
                  className="px-8 py-3 rounded-none border border-white/30 text-white font-semibold hover:bg-white/10 transition-all"
                >
                  Explore Map
                </button>
                <button 
                  onClick={() => navigate('/learn')}
                  className="px-8 py-3 rounded-none text-white/70 font-semibold hover:text-white transition-all flex items-center gap-2"
                >
                  <Play size={18} fill="currentColor" />
                  Learn More
                </button>
              </div>
            </Reveal>

          </div>
        </section>

        {/* ─── Trust Stats Bar ─── */}
        <section className="bg-gray-50 py-12 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={stat.label} className="text-center relative">
                  {i > 0 && <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gray-200" />}
                  <div className="text-3xl md:text-4xl font-bold text-[#051428] mb-1">
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-gray-500 text-xs md:text-sm uppercase tracking-wider font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="py-24 bg-white relative overflow-hidden">
          {/* Subtle background grid */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(#051428 1px, transparent 1px), linear-gradient(90deg, #051428 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <Reveal>
              <div className="text-center mb-20 space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1D9E75]">How It Works</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#051428]">Experience effortless charging</h2>
                <p className="text-gray-500 max-w-xl mx-auto">Three simple steps to power up and get back on the road.</p>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
              {/* Connecting line (desktop) */}
              <div className="hidden md:block absolute top-[72px] left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] h-px bg-gray-200 z-0">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#1D9E75] to-[#1D9E75]/30 origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              {steps.map((step, i) => {
                const isHovered = activeStep === i
                const Icon = step.icon
                const stepLinks = [
                  { label: 'Find Stations', to: '/map' },
                  { label: 'Book a Slot', to: '/booking' },
                  { label: 'View Details', to: '/map' },
                ]
                return (
                  <Reveal key={step.title} delay={i * 0.15}>
                    <motion.div
                      className="relative text-center cursor-pointer select-none"
                      onHoverStart={() => setActiveStep(i)}
                      onHoverEnd={() => setActiveStep(null)}
                      onClick={() => setActiveStep(isHovered ? null : i)}
                    >
                      {/* Card */}
                      <motion.div
                        className="relative bg-white rounded-none border border-gray-100 p-8 pb-6 overflow-hidden"
                        animate={{
                          y: isHovered ? -6 : 0,
                          boxShadow: isHovered
                            ? '0 24px 60px rgba(29,158,117,0.12), 0 8px 24px rgba(0,0,0,0.06)'
                            : '0 1px 4px rgba(0,0,0,0.04)'
                        }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {/* Top color bar that fills on hover */}
                        <motion.div
                          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1D9E75] to-[#1D9E75]/40 origin-left"
                          animate={{ scaleX: isHovered ? 1 : 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        />

                        {/* Ghost step number */}
                        <div className="text-[96px] font-black leading-none absolute right-3 top-3 select-none pointer-events-none z-0 transition-all duration-500"
                          style={{ color: isHovered ? 'rgba(29,158,117,0.07)' : 'rgba(5,20,40,0.05)' }}
                        >
                          {step.number}
                        </div>

                        {/* Icon circle */}
                        <div className="mb-6 relative z-10">
                          <motion.div
                            className="w-[72px] h-[72px] rounded-none mx-auto flex items-center justify-center relative"
                            animate={{
                              background: isHovered ? 'rgba(29,158,117,0.12)' : 'rgba(29,158,117,0.07)',
                              scale: isHovered ? 1.08 : 1,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {/* Pulsing ring on hover */}
                            {isHovered && (
                              <motion.div
                                className="absolute inset-0 rounded-none"
                                style={{ border: '2px solid rgba(29,158,117,0.3)' }}
                                animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                              />
                            )}
                            <motion.div
                              animate={{ color: isHovered ? '#1D9E75' : '#1D9E75CC' }}
                            >
                              <Icon size={32} />
                            </motion.div>
                          </motion.div>
                        </div>

                        {/* Step number dot */}
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <motion.span
                            className="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none"
                            animate={{
                              background: isHovered ? 'rgba(29,158,117,0.1)' : 'transparent',
                              color: isHovered ? '#1D9E75' : '#9CA3AF',
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            Step {step.number}
                          </motion.span>
                        </div>

                        <h3 className="text-xl font-bold text-[#051428] mb-3 relative z-10">{step.title}</h3>

                        <p className="text-gray-500 leading-relaxed text-sm relative z-10">
                          {step.desc}
                        </p>

                        {/* CTA link — expands on hover */}
                        <motion.div
                          className="overflow-hidden"
                          animate={{ height: isHovered ? 'auto' : 0, opacity: isHovered ? 1 : 0, marginTop: isHovered ? 16 : 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); window.location.href = stepLinks[i].to }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D9E75] hover:gap-3 transition-all duration-200"
                          >
                            {stepLinks[i].label}
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </motion.div>
                      </motion.div>

                      {/* Bottom connector dot */}
                      <motion.div
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1D9E75] hidden md:block"
                        animate={{ scale: isHovered ? 2 : 1, opacity: isHovered ? 1 : 0.3 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  </Reveal>
                )
              })}
            </div>

            {/* Bottom nudge */}
            <Reveal delay={0.5}>
              <div className="text-center mt-16">
                <button
                  onClick={() => navigate('/map')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D9E75] border border-[#1D9E75]/30 px-6 py-3 rounded-none hover:bg-[#1D9E75]/5 transition-all duration-200 hover:border-[#1D9E75]/60"
                >
                  Start finding stations
                  <ChevronRight size={16} />
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── Features Section ─── */}
        <section className="bg-gray-50 py-28 relative overflow-hidden border-t border-gray-100">
          {/* Ambient glows */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.08]"
            style={{ background: `radial-gradient(circle, ${features[activeFeature].color}, transparent 70%)` }}
          />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1D9E75]/5 blur-[100px] rounded-full" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Header */}
            <Reveal>
              <div className="mb-20">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1D9E75] mb-4">Platform Capabilities</p>
                <h2 className="text-4xl md:text-5xl font-bold text-[#051428] leading-[1.1] tracking-tight">
                  Everything you need,<br />
                  <span style={{ color: features[activeFeature].color, transition: 'color 0.4s ease' }}>nothing you don&apos;t.</span>
                </h2>
              </div>
            </Reveal>

            {/* Split layout */}
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">

              {/* Left — Feature list */}
              <div className="space-y-1">
                {features.map((feature, i) => {
                  const isActive = activeFeature === i;
                  return (
                    <motion.button
                      key={feature.title}
                      onClick={() => setActiveFeature(i)}
                      className="w-full text-left group"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.07 }}
                    >
                      <div
                        className={`relative flex items-center gap-4 px-5 py-4 rounded-none transition-all duration-300 ${
                          isActive
                            ? 'bg-white shadow-sm border border-gray-100'
                            : 'hover:bg-gray-200/50 border border-transparent'
                        }`}
                      >
                        {/* Active left border */}
                        <div
                          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-all duration-300"
                          style={{ background: isActive ? feature.color : 'transparent' }}
                        />

                        {/* Icon */}
                        <div
                          className="w-10 h-10 rounded-none flex items-center justify-center flex-shrink-0 transition-all duration-300"
                          style={{
                            background: isActive ? `${feature.color}15` : 'rgba(0,0,0,0.04)',
                            color: isActive ? feature.color : '#9CA3AF',
                          }}
                        >
                          <feature.icon size={18} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-bold transition-colors duration-300"
                              style={{ color: isActive ? '#051428' : '#6B7280' }}
                            >
                              {feature.title}
                            </span>
                            {isActive && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wide"
                                style={{ background: `${feature.color}22`, color: feature.color }}
                              >
                                {feature.tag}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight
                          size={14}
                          className="flex-shrink-0 transition-all duration-300"
                          style={{ color: isActive ? feature.color : 'transparent', transform: isActive ? 'translateX(0)' : 'translateX(-4px)' }}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Right — Active feature detail */}
              <div className="lg:sticky lg:top-28">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-none border border-gray-200 p-8 relative overflow-hidden bg-white shadow-xl shadow-gray-200/50"
                  >
                    {/* Background glow inside card */}
                    <div
                      className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none"
                      style={{ background: features[activeFeature].color }}
                    />

                    {/* Tag */}
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-none uppercase tracking-widest mb-6"
                      style={{
                        background: `${features[activeFeature].color}18`,
                        color: features[activeFeature].color,
                        border: `1px solid ${features[activeFeature].color}30`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: features[activeFeature].color }}
                      />
                      {features[activeFeature].tag}
                    </span>

                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-none flex items-center justify-center mb-6"
                      style={{ background: `${features[activeFeature].color}18` }}
                    >
                      {React.createElement(features[activeFeature].icon, {
                        size: 32,
                        style: { color: features[activeFeature].color },
                      })}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-[#051428] mb-4 leading-tight">
                      {features[activeFeature].title}
                    </h3>

                    {/* Desc */}
                    <p className="text-gray-600 leading-relaxed text-[15px] mb-8">
                      {features[activeFeature].desc}
                    </p>



                    {/* Progress dots */}
                    <div className="flex items-center gap-2 mt-8">
                      {features.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveFeature(i)}
                          className="transition-all duration-300 rounded-none"
                          style={{
                            width: i === activeFeature ? 20 : 6,
                            height: 6,
                            background: i === activeFeature ? features[activeFeature].color : 'rgba(0,0,0,0.1)',
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>



        {/* ─── Testimonials Strip ─── */}
        <section className="py-24 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.1}>
                  <div className="flex flex-col justify-between h-full p-10 transition-all duration-300 border-l border-gray-100 first:border-0 hover:bg-white/50 group">
                    <div className="space-y-4">
                      <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="#EAB308" className="text-[#EAB308]" />)}
                      </div>
                      <p className="text-gray-600 text-lg font-medium leading-[1.6] group-hover:text-gray-900 transition-colors">&quot;{t.quote}&quot;</p>
                    </div>
                    <div className="flex items-center gap-4 mt-8">
                      <div className="w-11 h-11 rounded-none bg-gray-900 flex items-center justify-center text-xs text-white font-bold">
                        {t.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm tracking-tight">{t.name}</h4>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t.city}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

      </div>
    </PageWrapper>
  );
}
