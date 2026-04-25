import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { 
  Zap, 
  Target, 
  ShieldCheck, 
  Users, 
  Globe, 
  Cpu, 
  ArrowRight,
  Leaf
} from 'lucide-react';

const Reveal = ({ children, delay = 0 }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both" style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

export default function About() {
  const stats = [
    { label: 'Stations Live', value: '500+', icon: Zap },
    { label: 'Cities Covered', value: '25+', icon: Globe },
    { label: 'Active Users', value: '50k+', icon: Users },
    { label: 'Uptime', value: '99.9%', icon: ShieldCheck },
  ];

  const values = [
    {
      title: 'Reliability First',
      desc: 'We understand that your journey depends on us. Our stations are monitored 24/7 to ensure maximum uptime and consistent charging speeds.',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Innovation Driven',
      desc: 'From smart load balancing to AI-powered trip planning, we leverage cutting-edge technology to make EV charging seamless and efficient.',
      icon: Cpu,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Sustainability at Core',
      desc: 'Every charge on our network contributes to a greener planet. We are committed to accelerating Indias transition to sustainable mobility.',
      icon: Leaf,
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ];

  return (
    <PageWrapper noPadding={true}>
      <div className="bg-white overflow-hidden">
        
        {/* --- Hero Section --- */}
        <section className="relative min-h-[70vh] flex items-center justify-center pt-20">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=2000" 
              alt="EV Charging Station"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#051428]/85 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#051428]/40 to-white" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Our Story
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
                Powering the <br />
                <span className="text-emerald-400">Future of Mobility</span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                We're on a mission to build India's most reliable, intelligent, and accessible EV charging infrastructure.
              </p>
            </Reveal>
          </div>
        </section>

        {/* --- Vision Section --- */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <Reveal delay={200}>
                <div className="space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-600">Our Vision</h2>
                  <h3 className="text-3xl md:text-4xl font-bold text-[#051428] leading-tight">
                    Making electric vehicle charging as common as a coffee shop.
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Founded in 2023, ChargeNet emerged from a simple observation: the transition to electric vehicles was being held back by a lack of dependable charging infrastructure.
                  </p>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    We're not just installing hardware; we're building a digital ecosystem that connects drivers with energy, removes range anxiety, and empowers station owners to participate in the green revolution.
                  </p>
                  <div className="pt-4">
                    <div className="flex items-center gap-4 p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
                        <Target size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#051428]">The Goal</h4>
                        <p className="text-sm text-gray-500">10,000+ stations across India by 2026.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-emerald-500/10 rounded-[2rem] blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
                  <img 
                    src="https://images.unsplash.com/photo-1620330190520-2d8804c01d94?auto=format&fit=crop&q=80&w=1000" 
                    alt="EV Technology"
                    className="relative rounded-[1.5rem] shadow-2xl border border-white/20"
                  />
                  <div className="absolute -bottom-8 -left-8 p-8 bg-white shadow-xl rounded-2xl border border-gray-100 hidden md:block">
                    <div className="text-4xl font-bold text-[#051428] mb-1">2023</div>
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Year Founded</div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* --- Stats Strip --- */}
        <section className="bg-[#051428] py-20 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {stats.map((stat, i) => (
                <div key={i} className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-2">
                    <stat.icon size={24} />
                  </div>
                  <div className="text-4xl font-bold text-white tracking-tight">{stat.value}</div>
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Values Grid --- */}
        <section className="py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-600 mb-4">Core Principles</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-[#051428]">What drives us forward</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((v, i) => (
                <div key={i} className="p-10 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-14 h-14 ${v.bg} ${v.color} rounded-2xl flex items-center justify-center mb-8`}>
                    <v.icon size={28} />
                  </div>
                  <h4 className="text-xl font-bold text-[#051428] mb-4">{v.title}</h4>
                  <p className="text-gray-500 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Final CTA --- */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-600 z-0" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>
              Ready to join the <br /> green revolution?
            </h2>
            <p className="text-emerald-100 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Start your EV journey with ChargeNet today. Find stations, book slots, and charge effortlessly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button 
                onClick={() => window.location.href = '/signup'}
                className="px-10 py-4 bg-white text-emerald-600 font-bold rounded-full hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/20"
              >
                Get Started Now
              </button>
              <button 
                onClick={() => window.location.href = '/map'}
                className="px-10 py-4 bg-emerald-700 text-white font-bold rounded-full border border-white/20 hover:bg-emerald-800 transition-all flex items-center gap-2"
              >
                Explore Stations
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

      </div>
    </PageWrapper>
  );
}
