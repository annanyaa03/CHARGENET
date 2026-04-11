import React from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Users, Zap, ArrowRight, BarChart3, CheckCircle2 } from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';

const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export default function Business() {
  const features = [
    {
      icon: TrendingUp,
      title: "Revenue Generation",
      desc: "Turn your parking lot into a high-margin profit center with dynamic pricing and integrated ad-revenue platforms."
    },
    {
      icon: Users,
      title: "Premium Footfall",
      desc: "EV owners are high-value demographic targets who spend 40% more time and capital at retail locations."
    },
    {
      icon: Building2,
      title: "Corporate ESG",
      desc: "Accelerate your path to Net Zero. Boost employee satisfaction while hitting mandated corporate sustainability goals."
    },
    {
      icon: BarChart3,
      title: "Command Center",
      desc: "Architected for scale. Manage 10 or 10,000 chargers from an intuitive, centralized telemetry dashboard."
    }
  ];

  return (
    <PageWrapper>
      <div className="bg-white min-h-screen text-[#051428] selection:bg-[#1D9E75] selection:text-white">
        
        {/* Header Section - Minimal Premium */}
        <section className="pt-32 pb-24 px-6 relative overflow-hidden bg-[#FAFAF9] border-b border-gray-100">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.3]" />
          
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-full">
                 <span className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full animate-pulse" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#051428] pt-px">Enterprise Infrastructure</p>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.95] mb-8" style={{ fontFamily: 'Fraunces, serif' }}>
                Monetize your <br />
                <span className="text-[#1D9E75]">real estate.</span>
              </h1>
              
              <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-12 font-light">
                Deploy world-class EV charging at your retail, workplace, or residential complex. Join the network trusted by India's leading commercial developers.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <button className="group relative px-10 py-5 bg-[#051428] text-white font-bold uppercase tracking-widest text-[11px] overflow-hidden rounded-none shadow-[0_8px_30px_rgb(5,20,40,0.2)] hover:shadow-[0_8px_30px_rgb(29,158,117,0.4)] transition-all duration-500">
                    <div className="absolute inset-0 bg-[#1D9E75] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                    <span className="relative flex items-center gap-2">
                       Become a Partner <ArrowRight size={16} />
                    </span>
                 </button>
                 <div className="text-left flex items-center gap-4 border-l-2 border-[#1D9E75] pl-4">
                    <div className="text-3xl font-bold font-serif leading-none">99.9%</div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">SLA Guaranteed<br/>Uptime</div>
                 </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Use Cases - Ultra Minimal Dividers */}
        <section className="py-32 px-6 bg-white shrink-0">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="text-center mb-20">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#051428]">Engineered for every commercial sector.</h2>
              </div>
            </Reveal>
            
            <div className="grid lg:grid-cols-3 gap-0 border-t border-b border-gray-100">
              {[
                { title: "Retail & Transit", items: ["Attract luxury EV demographics", "Integrated POS loyalty rewards", "Custom ad-revenue on LCDs"] },
                { title: "Commercial IT Parks", items: ["Individual employee billing API", "24/7 technical surveillance", "Modular power scalability"] },
                { title: "Public Infrastructure", items: ["MoP guideline compliant", "Open-standard grid balancing", "Smart city data sharing"] }
              ].map((box, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className={`p-10 lg:p-14 h-full bg-white hover:bg-[#FAFAF9]/50 transition-colors duration-500 ${i !== 2 ? 'lg:border-r border-b lg:border-b-0 border-gray-100' : ''}`}>
                    <h4 className="text-xl font-bold mb-8 text-[#051428]">
                      {box.title}
                    </h4>
                    <ul className="space-y-4">
                      {box.items.map((li, j) => (
                        <li key={j} className="text-gray-500 flex items-start gap-3 text-[15px]">
                          <CheckCircle2 size={18} className="text-[#1D9E75] mt-0.5 shrink-0 opacity-80" />
                          {li}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid - Interactive Floating Cards */}
        <section className="py-32 px-6 bg-[#FAFAF9] border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <Reveal>
               <div className="mb-16">
                 <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-4">Value Proposition</p>
                 <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#051428]">More than just a charger.</h2>
               </div>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {features.map((feature, i) => (
                <Reveal key={feature.title} delay={i * 0.1}>
                  <motion.div 
                    whileHover={{ y: -8 }}
                    className="p-10 lg:p-12 bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(29,158,117,0.08)] hover:border-[#1D9E75]/30 transition-all duration-500 rounded-none h-full flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-14 h-14 bg-[#FAFAF9] border border-gray-100 flex items-center justify-center mb-8 text-[#051428] group-hover:bg-[#1D9E75] group-hover:text-white group-hover:border-[#1D9E75] transition-all duration-500">
                        <feature.icon size={22} className="transform group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-[#051428] tracking-tight">{feature.title}</h3>
                      <p className="text-gray-500 text-[15px] leading-relaxed mb-10">
                        {feature.desc}
                      </p>
                    </div>
                    <div>
                       <div className="h-px w-12 bg-gray-200 mb-6 group-hover:w-full group-hover:bg-[#1D9E75]/20 transition-all duration-700" />
                       <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 group-hover:text-[#1D9E75] transition-colors">
                         Explore Technicals <ArrowRight size={14} className="transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500" />
                       </button>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section - Typographic Focus */}
        <section className="py-20 px-6 bg-white border-t border-gray-100">
           <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <Reveal delay={0.1}>
                 <div className="pt-6 md:pt-0 hover:scale-105 transition-transform duration-500">
                    <div className="text-4xl lg:text-5xl font-bold font-serif mb-3 text-[#051428]">99<span className="text-[#1D9E75]">.8%</span></div>
                    <div className="text-gray-400 uppercase tracking-[0.25em] font-bold text-[10px]">Verified Station Uptime</div>
                 </div>
              </Reveal>
              <Reveal delay={0.2}>
                 <div className="pt-6 md:pt-0 hover:scale-105 transition-transform duration-500">
                    <div className="text-4xl lg:text-5xl font-bold font-serif mb-3 text-[#051428]">12<span className="text-2xl text-gray-300">min</span></div>
                    <div className="text-gray-400 uppercase tracking-[0.25em] font-bold text-[10px]">Avg Technician Response</div>
                 </div>
              </Reveal>
              <Reveal delay={0.3}>
                 <div className="pt-6 md:pt-0 hover:scale-105 transition-transform duration-500">
                    <div className="text-4xl lg:text-5xl font-bold font-serif mb-3 text-[#051428]">+35<span className="text-[#1D9E75]">%</span></div>
                    <div className="text-gray-400 uppercase tracking-[0.25em] font-bold text-[10px]">Retail Footfall Increase</div>
                 </div>
              </Reveal>
           </div>
        </section>
      </div>
    </PageWrapper>
  );
}

