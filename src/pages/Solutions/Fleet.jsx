import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, BarChart3, Globe, Zap, ArrowRight, ArrowDown, ActivitySquare } from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';

const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export default function Fleet() {
  const features = [
    {
      icon: ActivitySquare,
      title: "Real-time Telemetry API",
      desc: "Track every vehicle's state-of-charge, hardware health, and precise GPS location in real-time on a unified dashboard."
    },
    {
      icon: ShieldAlert,
      title: "Predictive AI Maintenance",
      desc: "Receive automated alerts for charger anomalies and subtle vehicle battery degradation before critical failures occur."
    },
    {
      icon: Globe,
      title: "Nationwide Roaming",
      desc: "One central corporate account. Access thousands of certified, high-speed chargers across state highway corridors."
    },
    {
      icon: BarChart3,
      title: "Compliance Reporting",
      desc: "Generate automated weekly reports on kWh consumption, exact CO2 savings, and granular fleet efficiency analytics."
    }
  ];

  return (
    <PageWrapper>
      <div className="bg-white min-h-screen text-[#051428] selection:bg-[#1D9E75] selection:text-white">
        
        {/* Enterprise Hero - Brutal Minimal */}
        <section className="relative min-h-[85vh] flex items-center px-6 bg-[#FAFAF9] overflow-hidden border-b border-gray-100">
          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 lg:gap-24 relative z-10 py-20">
            <div className="flex flex-col justify-center">
              <Reveal>
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1D9E75]">Logistics & Fleet Sector</p>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1] mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
                  Scale Without Friction.
                </h1>
                
                <p className="max-w-md text-gray-500 text-[15px] mb-10 font-normal leading-relaxed">
                  The most robust EV charging management platform engineered specifically for modern logistics and enterprise transport fleets.
                </p>
                
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#051428] hover:text-[#1D9E75] transition-colors border-b-2 border-[#051428] hover:border-[#1D9E75] pb-1">
                     Contact Enterprise <ArrowRight size={14} />
                  </button>
                </div>
              </Reveal>
            </div>
            
            <div className="flex flex-col justify-center relative">
               <Reveal delay={0.2}>
                 {/* Floating Control Panel - Stark */}
                 <div className="relative bg-white p-10 lg:p-12 border border-gray-100 shadow-sm">
                    <div className="space-y-2 mb-8">
                       <div className="flex justify-between items-center text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400">
                          <span>Active Fleet Units</span>
                          <span className="text-[#1D9E75]">Syncing</span>
                       </div>
                       <div className="text-5xl font-bold tracking-tight font-serif text-[#051428]">1,248</div>
                    </div>
                    
                    <div className="h-px bg-gray-100 w-full mb-8" />
                    
                    <div className="space-y-2 mb-8">
                       <div className="uppercase text-[9px] font-bold tracking-[0.2em] text-gray-400">Total Grid Load</div>
                       <div className="text-3xl font-bold tracking-tight text-[#051428]">4.2 <span className="text-xl text-gray-300">MW</span></div>
                    </div>
                    
                    <div className="h-px bg-gray-100 w-full mb-8" />
                    
                    <div className="flex justify-between items-end">
                       <div className="space-y-2">
                          <div className="uppercase text-[9px] font-bold tracking-[0.2em] text-gray-400">CO2 Mitigated</div>
                          <div className="text-xl font-bold text-[#1D9E75]">42,500 Tons</div>
                       </div>
                    </div>
                 </div>
               </Reveal>
            </div>
          </div>
        </section>

        {/* Feature List - Cardless Horizontal Setup */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
             <Reveal>
               <div className="mb-16 border-l-2 border-[#1D9E75] pl-6">
                 <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-2">Core Infrastructure</p>
                 <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#051428] leading-tight">Engineered for control.</h2>
               </div>
             </Reveal>
             
             <div className="divide-y divide-gray-100 border-y border-gray-100">
               {features.map((feature, i) => (
                 <Reveal key={feature.title} delay={i * 0.1}>
                    <div className="py-8 group flex flex-col md:flex-row gap-6 md:gap-8 hover:bg-[#FAFAF9]/50 transition-colors">
                      <div className="w-10 h-10 flex items-center justify-center shrink-0 text-[#051428] group-hover:text-[#1D9E75] transition-colors">
                        <feature.icon size={20} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 text-[#051428] group-hover:text-[#1D9E75] transition-colors">{feature.title}</h3>
                        <p className="text-gray-500 text-[14px] leading-relaxed max-w-xl">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                 </Reveal>
               ))}
             </div>
          </div>
        </section>

        {/* Integration Section - Minimal Typography */}
        <section className="py-24 px-6 bg-[#FAFAF9] border-t border-gray-100">
           <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                 <h2 className="text-2xl md:text-3xl font-bold mb-12 text-[#051428] max-w-2xl mx-auto tracking-tight">
                    Deploy native integrations with your existing ERP.
                 </h2>
                 
                 <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-8">
                    {['SAP', 'Oracle', 'AWS', 'Microsoft Azure', 'Geotab', 'Samsara'].map((tech) => (
                      <span 
                        key={tech} 
                        className="text-xs font-bold tracking-widest text-gray-400 uppercase hover:text-[#051428] transition-colors cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                 </div>
              </Reveal>
           </div>
        </section>

        {/* Footer CTA - Stark B&W with Accent */}
        <section className="py-24 px-6 bg-white border-t border-gray-100">
           <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                 <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#051428] tracking-tight">Start your zero-emission transition today.</h2>
                 <p className="text-gray-500 text-[15px] font-normal leading-relaxed mb-10 max-w-xl mx-auto">Speak directly with our enterprise engineers to design a custom charging infrastructure protocol for your logistics operation.</p>
                 
                 <button className="px-10 h-14 bg-[#051428] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#1D9E75] transition-colors rounded-none">
                    Schedule Consultation
                 </button>
              </Reveal>
           </div>
        </section>
      </div>
    </PageWrapper>
  );
}
