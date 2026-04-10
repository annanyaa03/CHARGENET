import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Zap, MapPin, Search, ArrowRight, Play, Star, 
  CalendarCheck, BatteryCharging, 
  Navigation, Clock, CreditCard, Headphones
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
  const [activeCity, setActiveCity] = useState(null);
  const [ctaMousePos, setCtaMousePos] = useState({ x: 50, y: 50 });

  const handleCtaMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCtaMousePos({ x, y });
  };

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
      title: 'Real-time availability', 
      icon: Clock, 
      desc: 'See which chargers are currently free or occupied before you arrive.' 
    },
    { 
      title: 'Slot booking', 
      icon: CalendarCheck, 
      desc: 'Pre-book your charging time to ensure a seamless experience on the go.' 
    },
    { 
      title: 'Multi-vehicle support', 
      icon: Zap, 
      desc: 'Compatibility with all major EV models and connector types in India.' 
    },
    { 
      title: 'Trip planner', 
      icon: Navigation, 
      desc: 'Automate your route planning with optimal charging stops along the way.' 
    },
    { 
      title: '24/7 support', 
      icon: Headphones, 
      desc: 'Our dedicated team is always ready to assist you with any charging issues.' 
    },
    { 
      title: 'Secure payments', 
      icon: CreditCard, 
      desc: 'Hassle-free digital payments with multiple wallet and card options.' 
    },
  ];

  const cities = ['Mumbai', 'Pune', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore'];

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
                  <div className="relative flex items-center p-1.5 bg-white/10 backdrop-blur-md rounded-2xl">
                    <div className="flex-1 flex items-center px-4 gap-3">
                      <Search className="text-white/50" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search by city or area..."
                        className="w-full bg-transparent border-none outline-none text-white placeholder-white/30 py-2.5 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button className="bg-[#1D9E75] hover:bg-[#168561] text-white px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-xs shadow-lg shadow-[#1D9E75]/20">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Secondary Buttons */}
            <Reveal delay={0.8}>
              <div className="flex flex-wrap items-center justify-start gap-6 mt-8">
                <button className="px-8 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-all">
                  Explore Map
                </button>
                <button className="px-8 py-3 rounded-xl text-white/70 font-semibold hover:text-white transition-all flex items-center gap-2">
                  <Play size={18} fill="currentColor" />
                  Learn More
                </button>
              </div>
            </Reveal>

          </div>
        </section>

        {/* ─── Trust Stats Bar ─── */}
        <section className="bg-[#071428] py-12 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={stat.label} className="text-center relative">
                  {i > 0 && <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-white/10" />}
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-white/40 text-xs md:text-sm uppercase tracking-wider font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-[#051428]">Experience effortless charging</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Three simple steps to power up and get back on the road.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {steps.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.2}>
                  <div className="group relative text-center">
                    <div className="mb-6 relative">
                      <div className="text-[120px] font-black text-gray-50 absolute left-1/2 -translate-x-1/2 -top-10 z-0 select-none">
                        {step.number}
                      </div>
                      <div className="w-20 h-20 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] mx-auto relative z-10 transition-transform group-hover:scale-110 duration-300 shadow-xl shadow-[#1D9E75]/5">
                        <step.icon size={36} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#051428] mb-3">{step.title}</h3>
                    <p className="text-gray-500 leading-relaxed px-4">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features Section ─── */}
        <section className="bg-[#060f1e] py-24 relative overflow-hidden">
          {/* Glow Effects */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1D9E75]/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#5CAA5]/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-20 space-y-4">
              <Reveal>
                <h2 className="text-3xl md:text-5xl font-bold text-white">Smart features for <br /><span className="text-[#5DCAA5]">smarter charging</span></h2>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <Reveal key={feature.title} delay={i * 0.1}>
                  <div className="p-8 group hover:bg-white/[0.02] transition-all rounded-3xl">
                    <div className="w-12 h-12 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] mb-6 group-hover:scale-110 transition-all duration-300">
                      <feature.icon size={26} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-[15px]">{feature.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── City Coverage Section ─── */}
        <section className="py-24 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <Reveal>
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#051428]">Now live across India.</h2>
                    <p className="text-gray-600 text-lg">We are rapidly expanding our network to make EV travel seamless nationwide. Expanding to 20 cities by 2026.</p>
                  </div>
                </Reveal>
                
                <div className="h-20 flex items-center">
                  <AnimatePresence mode="wait">
                    {activeCity ? (
                      <motion.div 
                        key={activeCity}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-4"
                      >
                        <div className="w-12 h-12 bg-[#1D9E75]/10 rounded-full flex items-center justify-center text-[#1D9E75]">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#051428]">{activeCity}</div>
                          <div className="text-sm font-medium text-[#1D9E75]">Live charging network active</div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-gray-400 font-medium italic flex items-center gap-2"
                      >
                        <Navigation size={18} />
                        Hover over a map pin to explore live cities
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-6">
                  <button className="flex items-center gap-3 text-[#1D9E75] font-bold hover:gap-5 transition-all outline-none">
                    Check status in your city <ArrowRight size={20} />
                  </button>
                </div>
              </div>

              <Reveal delay={0.3}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-transparent to-gray-50 z-10 pointer-events-none" />
                  <svg viewBox="0 0 100 100" className="w-[120%] h-auto -ml-[10%] opacity-10 drop-shadow-2xl">
                     <path d="M 38 15 L 35 12 L 40 5 L 45 2 L 50 6 L 55 12 L 58 18 L 62 16 L 65 14 L 68 15 L 70 12 L 75 14 L 85 18 L 92 25 L 88 32 L 80 32 L 72 38 L 75 42 L 72 45 L 65 52 L 58 68 L 52 82 L 48 95 L 45 80 L 40 65 L 35 55 L 28 50 L 15 48 L 8 40 L 15 35 L 20 38 L 28 32 L 28 25 L 32 18 Z" fill="#1D9E75" />
                  </svg>
                  {/* Glowing Pins */}
                  {[
                    {top: 25, left: 42, name: 'Chandigarh'},
                    {top: 55, left: 32, name: 'Mumbai'},
                    {top: 60, left: 35, name: 'Pune'},
                    {top: 75, left: 45, name: 'Bengaluru'},
                    {top: 65, left: 45, name: 'Hyderabad'},
                    {top: 80, left: 48, name: 'Chennai'},
                    {top: 45, left: 70, name: 'Kolkata'},
                    {top: 45, left: 28, name: 'Ahmedabad'},
                    {top: 35, left: 40, name: 'Jaipur'},
                    {top: 35, left: 52, name: 'Lucknow'},
                    {top: 28, left: 45, name: 'Delhi NCR'},
                    {top: 50, left: 42, name: 'Indore'},
                  ].map((pos, i) => (
                    <div 
                      key={i} 
                      className="absolute group cursor-pointer" 
                      style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                      onMouseEnter={() => setActiveCity(pos.name)}
                      onMouseLeave={() => setActiveCity(null)}
                    >
                      <div className="relative">
                        <div className={`w-3 h-3 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 ${activeCity === pos.name ? 'bg-[#1D9E75] scale-[1.5]' : 'bg-[#1D9E75]'}`} />
                        <div className={`w-6 h-6 opacity-40 rounded-full animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${activeCity === pos.name ? 'bg-[#1D9E75]' : 'bg-[#1D9E75]'}`} />
                        <div className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-[#051428] shadow-xl rounded-lg text-xs font-bold text-white transition-all duration-300 pointer-events-none z-20 ${activeCity === pos.name ? 'opacity-100 -top-10' : 'opacity-0 -top-4'}`}>
                           {pos.name}
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              </Reveal>
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
                      <p className="text-gray-600 text-lg font-medium leading-[1.6] group-hover:text-gray-900 transition-colors">"{t.quote}"</p>
                    </div>
                    <div className="flex items-center gap-4 mt-8">
                      <div className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center text-xs text-white font-bold">
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

        {/* ─── CTA Section ─── */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-5">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1D9E75] mb-1">Get started</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#051428] tracking-tight leading-snug">
                Ready to charge smarter?
              </h2>
              <p className="text-gray-500 text-sm md:text-base mt-2 max-w-md mx-auto">
                Join India's largest EV charging network. No subscription required.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-3">
                <button className="px-7 py-3 bg-[#1D9E75] hover:bg-[#168561] text-white font-semibold rounded-full transition-all hover:-translate-y-0.5 active:scale-95 text-sm shadow-lg shadow-[#1D9E75]/15">
                  Download the App
                </button>
                <button className="px-7 py-3 text-[#051428] font-semibold rounded-full transition-all flex items-center gap-2 group/btn border border-gray-200 hover:border-[#1D9E75] text-sm hover:-translate-y-0.5">
                  Explore Network <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform text-[#1D9E75]" />
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
