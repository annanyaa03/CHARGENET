import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Zap, Battery, Wifi, Clock, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
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

const chapters = [
  {
    icon: Zap,
    num: '01',
    title: 'Understanding Charging Levels',
    summary: 'Level 1, Level 2, and DC Fast Charging explained.',
    content: [
      { q: 'What is Level 1 Charging?', a: 'Level 1 uses a standard 120V household outlet. It delivers 3–5 miles of range per hour — ideal for overnight charging at home. No special equipment needed.' },
      { q: 'What is Level 2 Charging?', a: 'Level 2 uses a 240V circuit and a dedicated EVSE. It delivers 10–30 miles of range per hour. The standard for home and public charging.' },
      { q: 'What is DC Fast Charging?', a: 'DC Fast Charging (DCFC) bypasses the onboard charger and delivers power directly to the battery. Adds 100–200+ miles in 20–45 minutes. Used at highway corridors and commercial hubs.' },
    ]
  },
  {
    icon: Battery,
    num: '02',
    title: 'Battery Health & Longevity',
    summary: 'How to charge smartly to extend your battery life.',
    content: [
      { q: 'Should I charge to 100% every day?', a: 'For daily use, keeping your battery between 20–80% minimises degradation. Reserve 100% charges for long trips.' },
      { q: 'Does fast charging damage my battery?', a: 'Occasional fast charging is fine and designed for. Frequent, repeated DCFC sessions can slightly accelerate degradation over years, but modern BMS systems mitigate this.' },
      { q: 'What is battery preconditioning?', a: 'Preconditioning warms or cools the battery before charging, which allows faster charge speeds and less stress on cells. Most EVs do this automatically when navigation is set to a charging point.' },
    ]
  },
  {
    icon: Wifi,
    num: '03',
    title: 'Using the ChargeNet Network',
    summary: 'Finding, booking, and paying at ChargeNet stations.',
    content: [
      { q: 'How do I find a ChargeNet station?', a: 'Use the ChargeNet MapView to find stations in real-time. Filter by connector type, charging speed, and live availability. Compatible with Apple CarPlay and Android Auto.' },
      { q: 'How does payment work?', a: 'Sessions are billed per kWh or per minute depending on the station operator\'s pricing. You can pay via the app using UPI, card, or a pre-loaded wallet. Receipts are emailed automatically.' },
      { q: 'What if a charger is faulty?', a: 'Tap the "Report Issue" button in the app. Our logistics team is dispatched in under 12 minutes on average. You\'ll receive a refund for any interrupted sessions automatically.' },
    ]
  },
  {
    icon: Clock,
    num: '04',
    title: 'Charging Etiquette',
    summary: 'Best practices for sharing public infrastructure.',
    content: [
      { q: 'How long should I stay at a public charger?', a: 'Move your vehicle as soon as charging is complete or you\'ve reached your target %. Idle fees apply at most stations after a 10-minute grace period.' },
      { q: 'Can I unplug someone else\'s car?', a: 'No. It is illegal in many states and violates ChargeNet\'s terms of use. Use the app\'s "Notify Driver" feature to send a courteous alert.' },
      { q: 'What is charging queue etiquette?', a: 'If all stations are occupied, check the app for estimated finishing times and use the virtual queue feature to reserve the next available spot.' },
    ]
  },
];

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[15px] font-semibold text-[#051428] group-hover:text-[#1D9E75] transition-colors pr-8">{q}</span>
        <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180 text-[#1D9E75]' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <p className="text-gray-500 text-[14px] leading-relaxed pb-5 pr-8">{a}</p>
      </motion.div>
    </div>
  );
}

export default function ChargingGuide() {
  const [activeChapter, setActiveChapter] = useState(0);

  return (
    <PageWrapper>
      <div className="bg-white min-h-screen text-[#051428] selection:bg-[#1D9E75] selection:text-white">

        {/* Hero */}
        <section className="border-b border-gray-100 px-6 py-24 bg-[#FAFAF9]">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1D9E75] mb-4">Resources</p>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#051428] leading-[1.05] mb-6">
                Charging Guide.
              </h1>
              <p className="text-gray-500 text-lg max-w-xl leading-relaxed">
                Everything you need to know about EV charging — from connector types to battery longevity, explained clearly.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Chapters nav + content */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[280px_1fr] gap-16">

            {/* Sidebar Nav */}
            <div className="hidden lg:block">
              <Reveal>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-6">Chapters</p>
                <nav className="space-y-1">
                  {chapters.map((ch, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveChapter(i)}
                      className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all duration-200 group ${activeChapter === i ? 'bg-[#FAFAF9] border-l-2 border-[#1D9E75]' : 'hover:bg-gray-50 border-l-2 border-transparent'}`}
                    >
                      <span className={`text-[11px] font-bold tabular-nums ${activeChapter === i ? 'text-[#1D9E75]' : 'text-gray-300'}`}>{ch.num}</span>
                      <span className={`text-[13px] font-semibold ${activeChapter === i ? 'text-[#051428]' : 'text-gray-400 group-hover:text-[#051428]'} transition-colors`}>{ch.title}</span>
                    </button>
                  ))}
                </nav>
              </Reveal>
            </div>

            {/* Content Area */}
            <div>
              {chapters.map((ch, i) => (
                <div
                  key={i}
                  className={`mb-16 ${i !== activeChapter ? 'hidden lg:block' : ''}`}
                  id={`chapter-${i}`}
                >
                  <Reveal delay={i * 0.05}>
                    <div className="flex items-start gap-4 mb-8">
                      <div className="w-12 h-12 bg-[#FAFAF9] border border-gray-100 flex items-center justify-center shrink-0 text-[#051428] group-hover:bg-[#1D9E75] transition-colors">
                        <ch.icon size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-300 mb-1">{ch.num}</p>
                        <h2 className="text-2xl font-bold text-[#051428] tracking-tight">{ch.title}</h2>
                        <p className="text-gray-400 text-sm mt-1">{ch.summary}</p>
                      </div>
                    </div>

                    <div className="border border-gray-100 divide-y divide-gray-100">
                      {ch.content.map((item, j) => (
                        <div key={j} className="px-6">
                          <AccordionItem q={item.q} a={item.a} />
                        </div>
                      ))}
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 border-t border-gray-100 bg-[#FAFAF9]">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h2 className="text-2xl font-bold text-[#051428] mb-2">Still have questions?</h2>
              <p className="text-gray-500 text-[15px]">Our support team is available 24/7 to help you.</p>
            </div>
            <a href="/resources/help" className="inline-flex items-center gap-2 px-8 h-12 bg-[#051428] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#1D9E75] transition-colors rounded-none whitespace-nowrap">
              Visit Help Center <ArrowRight size={14} />
            </a>
          </div>
        </section>

      </div>
    </PageWrapper>
  );
}
