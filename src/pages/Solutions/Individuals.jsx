import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Route, Zap, Home, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';

const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.div>
);

export default function Individuals() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const benefits = [
    {
      icon: Home,
      title: "Home Installation",
      desc: "Get a high-performance smart charger installed in your parking spot in under 48 hours."
    },
    {
      icon: Smartphone,
      title: "Smart App Control",
      desc: "Monitor charging sessions, schedule off-peak charging, and track energy usage in real-time."
    },
    {
      icon: Zap,
      title: "Speed & Safety",
      desc: "Our chargers are certified for all Indian weather conditions and feature 7-layer surge protection."
    },
    {
      icon: ShieldCheck,
      title: "Standard Warranty",
      desc: "Enjoy a comprehensive 3-year warranty and 24/7 on-site support for total peace of mind."
    }
  ];

  return (
    <PageWrapper>
      <div className="bg-white min-h-screen text-[#051428]">
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-6 border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1D9E75] mb-6">Home Charging</p>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-8" style={{ fontFamily: 'Fraunces, serif' }}>
                Your personal <br />
                <span className="text-[#1D9E75]">fuel station.</span>
              </h1>
              <p className="max-w-xl text-lg text-gray-500 leading-relaxed mb-10">
                Wake up to a full battery every single morning. We handle everything from site survey to installation and maintenance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-[#051428] text-white font-bold hover:bg-black transition-all flex items-center justify-center gap-2 rounded-none">
                  Request Survey <ArrowRight size={18} />
                </button>
                <button className="px-8 py-4 border border-gray-200 font-bold hover:border-[#051428] transition-all rounded-none">
                  View Chargers
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Benefits Grid - Sharp Edges */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 border-t border-l border-gray-200">
              {benefits.map((benefit, i) => (
                <div key={benefit.title} className="p-10 border-r border-b border-gray-200 bg-white group hover:bg-[#051428] transition-colors duration-500">
                  <div className="w-12 h-12 bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-[#1D9E75]/20 group-hover:text-[#1D9E75] transition-colors">
                    <benefit.icon size={24} className="text-[#051428] transition-colors group-hover:text-[#1D9E75]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">{benefit.title}</h3>
                  <p className="text-gray-500 group-hover:text-gray-400 transition-colors leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24 px-6 border-t border-gray-100">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <Reveal>
              <h2 className="text-4xl font-bold mb-8 leading-tight">Why choose ChargeNet for your home?</h2>
              <div className="space-y-8">
                {[
                  { t: "Seamless Integration", d: "Plugs into your existing electrical box with minimal modification required." },
                  { t: "AI Energy Manager", d: "Automatically charges when grid demand is lowest to save on your electricity bill." },
                  { t: "Universal Plug", d: "Compatible with all EV models sold in India, including Tata, MG, and BYD." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-8 h-8 rounded-none border border-[#1D9E75] flex items-center justify-center flex-shrink-0 text-[#1D9E75] font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.t}</h4>
                      <p className="text-gray-500">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="relative group overflow-hidden border border-gray-100">
                {/* Image Container with Sharp Edges */}
                <div className="aspect-[3/2] bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://images.pexels.com/photos/34800677/pexels-photo-34800677.jpeg" 
                    alt="Electric car charging in modern indoor facility" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Glass Accent Overlay */}
                  <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none" />
                </div>
                
                {/* Technical Caption Accent */}
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <div className="w-8 h-px bg-white/50" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white drop-shadow-md">
                    Live Session Environment
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Final CTA - Interactive Enhancement */}
        <section 
          className="py-32 px-6 bg-[#FAFAF9] text-[#051428] overflow-hidden relative border-t border-gray-200"
          onMouseMove={handleMouseMove}
        >
          {/* Technical Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.05]" 
            style={{ 
              backgroundImage: `linear-gradient(#051428 1px, transparent 1px), linear-gradient(90deg, #051428 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} 
          />
          
          {/* Premium Mouse-following Glow */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{ 
              background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(29, 158, 117, 0.1) 0%, transparent 60%)` 
            }}
          />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#1D9E75] mb-6">Take the first step</p>
              <h2 className="text-4xl md:text-6xl font-bold mb-10 tracking-tight leading-none" style={{ fontFamily: 'Fraunces, serif' }}>
                Ready to power up <br />
                <span className="text-[#051428]">your driveway?</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button className="group relative px-12 py-5 bg-[#1D9E75] text-white font-bold transition-all hover:scale-105 rounded-none overflow-hidden hover:shadow-[0_8px_30px_rgb(29,158,117,0.3)]">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center gap-2">
                    Get an Estimate Now <ArrowRight size={20} />
                  </span>
                </button>
                <button className="px-10 py-5 border-2 border-gray-200 hover:border-[#1D9E75] hover:text-[#1D9E75] bg-white transition-all font-bold rounded-none">
                  Talk to an Expert
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
