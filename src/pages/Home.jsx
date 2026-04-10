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

const TypingStation = () => {
  const [text, setText] = useState('');
  const fullText = 'station';
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting && text.length < fullText.length) {
        setText(fullText.slice(0, text.length + 1));
      } else if (isDeleting && text.length > 0) {
        setText(fullText.slice(0, text.length - 1));
      } else {
        setIsDeleting(!isDeleting);
      }
    }, isDeleting ? 100 : 200);
    
    return () => clearTimeout(timeout);
  }, [text, isDeleting]);
  
  return (
    <span className="text-[#5DCAA5] relative whitespace-nowrap">
      {text}
      <span className="inline-block w-[3px] h-[1em] bg-[#5DCAA5] ml-1 animate-pulse align-middle" />
    </span>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { value: 500, suffix: '+', label: 'Charging Stations' },
    { value: 5, suffix: '', label: 'Cities Covered' },
    { value: 10000, suffix: '+', label: 'Registered Users' },
    { value: 99.2, suffix: '%', label: 'Uptime Reliability' },
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

  const cities = ['Mumbai', 'Pune', 'Delhi', 'Bengaluru', 'Hyderabad'];

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
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.pexels.com/photos/2912309/pexels-photo-2912309.jpeg?auto=compress&cs=tinysrgb&w=3840" 
              alt="White vehicle on paved road"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#051428]/95 via-[#051428]/88 to-[#051428]/60" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                <span className="w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse" />
                Now live in 5 cities across India
              </div>
            </Reveal>

            <Reveal delay={0.2} y={30}>
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                Find your next <br />
                <TypingStation />
              </h1>
            </Reveal>

            <Reveal delay={0.4} y={20}>
              <p className="max-w-2xl mx-auto text-white/70 text-lg md:text-xl leading-relaxed">
                Discover nearby EV charging stations, check real-time availability, 
                book your slot, and charge with confidence.
              </p>
            </Reveal>

            {/* Search Bar */}
            <Reveal delay={0.6}>
              <div className="max-w-3xl mx-auto mt-10">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#1D9E75] to-[#5DCAA5] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                  <div className="relative flex items-center p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                    <div className="flex-1 flex items-center px-4">
                      <Search className="text-white/40 mr-3" size={20} />
                      <input 
                        type="text" 
                        placeholder="Search by city or area..."
                        className="w-full bg-transparent border-none text-white placeholder-white/40 focus:ring-0 text-lg py-4"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button className="bg-[#1D9E75] hover:bg-[#168561] text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg active:scale-95">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Secondary Buttons */}
            <Reveal delay={0.8}>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                <button className="px-8 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-all">
                  Explore Map
                </button>
                <button className="px-8 py-3 rounded-xl text-white/70 font-semibold hover:text-white transition-all flex items-center gap-2">
                  <Play size={18} fill="currentColor" />
                  Learn More
                </button>
              </div>
            </Reveal>

            {/* Review Stats */}
            <Reveal delay={1}>
              <div className="flex items-center justify-center gap-3 mt-12 pb-10">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#051428] bg-gray-300 flex items-center justify-center text-[10px] font-bold text-[#051428] overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                    </div>
                  ))}
                </div>
                <p className="text-white/60 text-sm">
                  <span className="text-white font-bold">385+ reviews</span> from EV drivers
                </p>
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
                  <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-[#1D9E75] flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-all duration-300">
                      <feature.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
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
                
                <div className="flex flex-wrap gap-3">
                  {cities.map((city, i) => (
                    <Reveal key={city} delay={i * 0.1}>
                      <div className="px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center gap-2 text-gray-700 font-medium hover:border-[#1D9E75] transition-all cursor-default">
                        <span className="w-2 h-2 bg-[#1D9E75] rounded-full" />
                        {city}
                      </div>
                    </Reveal>
                  ))}
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
                  <svg viewBox="0 0 100 100" className="w-full h-auto opacity-20 grayscale brightness-50">
                     <path d="M30 10 L40 5 L55 5 L65 10 L75 15 L80 25 L85 40 L85 55 L75 70 L65 85 L50 95 L35 85 L20 70 L10 50 L15 30 L25 20 Z" fill="#1D9E75" />
                  </svg>
                  {/* Glowing Pins */}
                  <div className="absolute top-[20%] left-[30%]"><div className="w-3 h-3 bg-[#1D9E75] rounded-full animate-ping" /></div>
                  <div className="absolute top-[40%] left-[50%]"><div className="w-3 h-3 bg-[#1D9E75] rounded-full animate-ping" /></div>
                  <div className="absolute top-[60%] left-[40%]"><div className="w-3 h-3 bg-[#1D9E75] rounded-full animate-ping" /></div>
                  <div className="absolute top-[50%] left-[70%]"><div className="w-3 h-3 bg-[#1D9E75] rounded-full animate-ping" /></div>
                  <div className="absolute top-[75%] left-[55%]"><div className="w-3 h-3 bg-[#1D9E75] rounded-full animate-ping" /></div>
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-bold text-sm tracking-widest opacity-40 select-none">
                    MAP OF INDIA
                  </div>
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
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
                    <div className="space-y-4">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#EAB308" className="text-[#EAB308]" />)}
                      </div>
                      <p className="text-gray-600 text-lg italic leading-relaxed">"{t.quote}"</p>
                    </div>
                    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-50">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1D9E75] to-[#5CAA5] flex items-center justify-center text-white font-bold">
                        {t.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#051428]">{t.name}</h4>
                        <p className="text-gray-400 text-sm font-medium">{t.city}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Section ─── */}
        <section className="py-24 bg-white px-4">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="bg-[#051428] rounded-[2rem] p-8 md:p-20 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#1D9E75]/20 blur-[100px] rounded-full pointer-events-none group-hover:scale-110 transition-all duration-700" />
                
                <div className="relative z-10 space-y-8">
                  <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">Ready to charge smarter?</h2>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button className="w-full sm:w-auto px-10 py-5 bg-[#1D9E75] hover:bg-[#168561] text-white font-bold rounded-2xl transition-all shadow-xl shadow-[#1D9E75]/20 hover:translate-y-[-2px] active:scale-95">
                      Get Started Free
                    </button>
                    <button className="text-white font-bold flex items-center gap-2 hover:gap-4 transition-all">
                      View charging map <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
