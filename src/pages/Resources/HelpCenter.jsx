import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, MessageCircle, FileText, CreditCard, MapPin, User, Shield, ArrowRight } from 'lucide-react';
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

const categories = [
  {
    icon: MapPin,
    title: 'Finding Stations',
    count: 12,
    articles: ['How to find a nearby station', 'Filter by connector type', 'Reading real-time availability', 'Station ratings and reviews'],
  },
  {
    icon: CreditCard,
    title: 'Payments & Billing',
    count: 9,
    articles: ['Supported payment methods', 'Understanding your invoice', 'Requesting a refund', 'Idle fee policy'],
  },
  {
    icon: FileText,
    title: 'Bookings',
    count: 7,
    articles: ['How to book a slot', 'Modifying a booking', 'Cancellation policy', 'Virtual queue system'],
  },
  {
    icon: User,
    title: 'Account & Profile',
    count: 8,
    articles: ['Creating an account', 'Updating your vehicle info', 'Notification preferences', 'Deleting your account'],
  },
  {
    icon: Shield,
    title: 'Safety & Reliability',
    count: 6,
    articles: ['What to do if a charger fails', 'Reporting a hazard', 'Charger certification standards', 'Emergency contact'],
  },
  {
    icon: MessageCircle,
    title: 'Contact Support',
    count: 4,
    articles: ['Chat with an agent', 'Email support hours', 'Phone support', 'Escalation process'],
  },
];

const faqs = [
  { q: 'How do I get a refund for a failed charging session?', a: 'Refunds are processed automatically for failed sessions within 24 hours. If yours hasn\'t been credited, go to Billing > Sessions and tap "Request Refund" on the relevant entry.' },
  { q: 'Can I use ChargeNet without creating an account?', a: 'Yes. Guest sessions are supported at most stations using the QR code on the charger. Tap "Guest Checkout" in the app. Note: session history won\'t be saved.' },
  { q: 'Why is my car not charging even though it\'s plugged in?', a: 'Check that the connector is fully seated. If the station shows a fault code, use "Report Issue" in the app. Try a neighbouring charger if available.' },
  { q: 'How do I add a second vehicle to my account?', a: 'Go to Profile > My Vehicles > Add Vehicle. You can switch between vehicles when booking to ensure the correct connector type is shown.' },
];

export default function HelpCenter() {
  const [query, setQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const filtered = categories.filter(c =>
    query === '' || c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.articles.some(a => a.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <PageWrapper>
      <div className="bg-white min-h-screen text-[#051428] selection:bg-[#1D9E75] selection:text-white">

        {/* Hero + Search */}
        <section className="border-b border-gray-100 px-6 py-24 bg-[#FAFAF9]">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1D9E75] mb-4">Resources</p>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#051428] leading-[1.05] mb-4">
                Help Center.
              </h1>
              <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
                Find answers, documentation, and support for the ChargeNet platform.
              </p>
              <div className="relative max-w-lg mx-auto">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search articles…"
                  className="w-full h-14 pl-11 pr-4 bg-white border border-gray-200 text-[#051428] text-[15px] placeholder-gray-300 focus:outline-none focus:border-[#1D9E75] transition-colors"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-12">Browse by Topic</p>
            </Reveal>

            <div className="divide-y divide-gray-100 border-y border-gray-100">
              {filtered.map((cat, i) => (
                <Reveal key={cat.title} delay={i * 0.05}>
                  <div className="py-8 group">
                    <div className="flex items-center gap-6 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center text-[#051428] group-hover:text-[#1D9E75] transition-colors shrink-0">
                        <cat.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-[#051428] group-hover:text-[#1D9E75] transition-colors">{cat.title}</h2>
                        <p className="text-gray-400 text-[12px]">{cat.count} articles</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1D9E75] group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="pl-16 flex flex-wrap gap-x-6 gap-y-2">
                      {cat.articles.map((art, j) => (
                        <button key={j} className="text-gray-500 text-[13px] hover:text-[#1D9E75] hover:underline underline-offset-2 transition-colors text-left">
                          {art}
                        </button>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
              {filtered.length === 0 && (
                <div className="py-16 text-center text-gray-400 text-[15px]">
                  No articles matching &quot;<span className="text-[#051428] font-semibold">{query}</span>&quot;. Try a different term.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 bg-[#FAFAF9] border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-4">Common Questions</p>
              <h2 className="text-3xl font-bold text-[#051428] tracking-tight mb-12">Frequently asked.</h2>
            </Reveal>

            <div className="border-y border-gray-100 divide-y divide-gray-100">
              {faqs.map((faq, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div>
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between py-5 text-left group"
                    >
                      <span className="text-[15px] font-semibold text-[#051428] group-hover:text-[#1D9E75] transition-colors pr-8">{faq.q}</span>
                      <ChevronRight size={16} className={`shrink-0 text-gray-400 transition-transform duration-300 ${expandedFaq === i ? 'rotate-90 text-[#1D9E75]' : ''}`} />
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: expandedFaq === i ? 'auto' : 0, opacity: expandedFaq === i ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <p className="text-gray-500 text-[14px] leading-relaxed pb-5 pr-8">{faq.a}</p>
                    </motion.div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Contact strip */}
        <section className="py-16 px-6 bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h2 className="text-xl font-bold text-[#051428] mb-1">Can&apos;t find what you&apos;re looking for?</h2>
              <p className="text-gray-500 text-[14px]">Our support team typically responds within 2 hours.</p>
            </div>
            <button className="inline-flex items-center gap-2 px-8 h-12 bg-[#051428] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#1D9E75] transition-colors rounded-none whitespace-nowrap">
              Contact Support <ArrowRight size={14} />
            </button>
          </div>
        </section>

      </div>
    </PageWrapper>
  );
}
