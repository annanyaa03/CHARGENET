import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Activity, ShieldAlert, BarChart3, Globe, Zap, ArrowDown, ActivitySquare } from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';

const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -15 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export default function Fleet() {
  const features = [
    {
      icon: ActivitySquare,
      title: "Real-time Telemetry API",
      desc: "Track every vehicle's state-of-charge, hardware health, and exact location in real-time on a unified dashboard."
    },
    {
      icon: ShieldAlert,
      title: "Predictive AI Maintenance",
      desc: "Automated alerts for charger anomalies and vehicle battery degradation before critical failures occur."
    },
    {
      icon: Globe,
      title: "Nationwide Roaming",
      desc: "One central corporate account. Thousands of certified chargers across state highway corridors and urban hubs."
    },
    {
      icon: BarChart3,
      title: "Compliance Reporting",
      desc: "Generate automated weekly reports on kWh consumption, exact CO2 savings, and fleet efficiency analytics."
    }
  ];

  return (
    <PageWrapper>
      <div className="bg-white min-h-screen text-[#051428] selection:bg-[#1D9E75] selection:text-white">
        {/* Enterprise Hero - Light Theme */}
        <section className="relative min-h-[90vh] flex items-center px-6 border-b border-gray-200 bg-[#FAFAF9]">
          
          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 lg:gap-24 relative z-10 py-24">
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-3 mb-8">
                <span className="h-px w-8 bg-[#1D9E75]"></span>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#051428]">Logistics & Fleet Solutions</p>
              </div>
              <h1 className="text-5xl md:text-[80px] font-bold tracking-tighter leading-[0.95] mb-8 uppercase text-[#051428]">
                Scale <br />
                <span className="text-[#1D9E75]">Without</span> <br />
                Friction.
              </h1>
              <p className="max-w-md text-gray-500 text-lg mb-12 font-medium">
                The most robust EV charging management platform engineered specifically for modern logistics and enterprise transport fleets.
              </p>
              <div className="flex gap-4">
                 <button className="h-14 px-8 md:px-10 bg-[#051428] text-white font-bold uppercase tracking-[0.15em] text-[11px] hover:bg-[#1D9E75] hover:text-white transition-colors rounded-none">
                    Contact Enterprise
                 </button>
                 <button className="h-14 w-14 border border-gray-300 flex items-center justify-center hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors rounded-none group bg-white">
                    <ArrowDown size={20} className="group-hover:translate-y-1 transition-transform" />
                 </button>
              </div>
            </div>
            
            <div className="flex flex-col justify-center relative">
               {/* Minimalist Data Control Panel - Light Theme */}
               <div className="relative bg-white border border-gray-200 p-10 lg:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
                  {/* Decorative hardware accents */}
                  <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-gray-200" />

                  <div className="space-y-4 mb-10">
                     <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
                        <span>Active Fleet Units</span>
                        <span className="text-[#1D9E75] flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full animate-pulse"></span> Syncing</span>
                     </div>
                     <div className="text-5xl lg:text-7xl font-bold tracking-tight font-serif text-[#051428]">1,248</div>
                  </div>
                  
                  <div className="h-px bg-gray-100 w-full mb-10" />
                  
                  <div className="space-y-4 mb-10">
                     <div className="uppercase text-[10px] font-bold tracking-[0.2em] text-gray-400">Total Grid Load</div>
                     <div className="text-4xl lg:text-5xl font-bold tracking-tight text-[#051428]">4.2 <span className="text-2xl text-gray-400">MW</span></div>
                  </div>
                  
                  <div className="h-px bg-gray-100 w-full mb-10" />
                  
                  <div className="flex justify-between items-end">
                     <div className="space-y-3">
                        <div className="uppercase text-[10px] font-bold tracking-[0.2em] text-gray-400">CO2 Mitigated</div>
                        <div className="text-2xl lg:text-3xl font-bold text-[#1D9E75]">42,500 Tons</div>
                     </div>
                     <div className="flex items-end gap-1.5 h-10 opacity-70">
                        {[0.3, 0.5, 0.4, 0.7, 0.9, 0.8, 1].map((h, i) => (
                           <div key={i} className="w-2.5 bg-[#1D9E75]" style={{ height: `${h * 100}%` }} />
                        ))}
                     </div>
                  </div>
               </div>
               
               {/* Background structural accent */}
               <div className="absolute -z-10 top-8 -right-8 w-full h-full border border-gray-100 bg-[#FAFAF9]" />
            </div>
          </div>
        </section>

        {/* Feature List - Linear & Sharp */}
        <section className="py-32 px-6 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
             <div className="border-l-[3px] border-[#1D9E75] pl-8 mb-24 max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Core Infrastructure</p>
                <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#051428] leading-[1.1]">Engineered for complete operational control.</h2>
             </div>
             
             <div className="grid lg:grid-cols-2 gap-x-24 gap-y-20">
                {features.map((feature, i) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <div className="flex md:flex-row flex-col gap-6 md:gap-8 group">
                       <div className="w-16 h-16 border border-gray-200 bg-[#FAFAF9] flex items-center justify-center flex-shrink-0 group-hover:border-[#1D9E75] group-hover:bg-[#1D9E75] transition-colors duration-300">
                          <feature.icon size={24} className="text-[#051428] group-hover:text-white transition-colors duration-300" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-bold mb-3 text-[#051428]">{feature.title}</h3>
                          <p className="text-gray-500 leading-relaxed text-[15px] font-medium">
                             {feature.desc}
                          </p>
                       </div>
                    </div>
                  </Reveal>
                ))}
             </div>
          </div>
        </section>

        {/* Integration Section - Light Theme */}
        <section className="py-32 px-6 bg-[#FAFAF9] border-b border-gray-200">
           <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
              <Zap size={32} className="text-[#1D9E75] mb-8" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12 leading-[1.2] text-[#051428]">
                 Deploy custom API integrations with your existing ERP and logistics platforms.
              </h2>
              
              <div className="w-full flex flex-wrap justify-center gap-6 mt-8">
                 {/* Badges for integrations */}
                 {['SAP', 'ORACLE', 'AWS', 'MICROSOFT AZURE', 'GEOTAB', 'SAMSARA'].map((tech) => (
                   <div key={tech} className="px-6 py-4 border border-gray-200 bg-white shadow-sm text-sm font-black tracking-widest text-[#051428] uppercase hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors cursor-default">
                     {tech}
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Footer CTA */}
        <section className="py-32 px-6 bg-white">
           <div className="max-w-7xl mx-auto bg-[#FAFAF9] border border-gray-200 p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left shadow-sm">
              <div className="max-w-xl">
                 <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#051428]">Start your zero-emission transition today.</h2>
                 <p className="text-gray-500 text-lg font-medium">Speak directly with our enterprise engineers to design a custom charging infrastructure for your operation.</p>
              </div>
              <div className="w-full lg:w-auto shrink-0">
                 <button className="w-full lg:w-auto px-12 py-6 bg-[#051428] text-white font-bold uppercase tracking-[0.15em] text-[11px] hover:bg-[#1D9E75] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-none">
                    Schedule a Consultation
                 </button>
              </div>
           </div>
        </section>
      </div>
    </PageWrapper>
  );
}
