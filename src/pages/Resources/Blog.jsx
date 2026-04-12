import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
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

const tags = ['All', 'Industry', 'Policy', 'Technology', 'ChargeNet News', 'Sustainability'];

const posts = [
  {
    tag: 'Industry',
    date: 'April 8, 2026',
    readTime: '5 min read',
    title: 'India\'s EV Charging Infrastructure to Triple by 2028',
    excerpt: 'The Ministry of Heavy Industries has confirmed ₹3,500 crore in new FAME-III subsidies targeting dense urban and highway charging corridors across 14 states.',
    featured: true,
  },
  {
    tag: 'Technology',
    date: 'April 4, 2026',
    readTime: '4 min read',
    title: 'V2G Technology: Why Bidirectional Charging Changes Everything',
    excerpt: 'Vehicle-to-Grid (V2G) is moving from pilot to commercial deployment. We break down how your parked EV becomes a grid asset and what that means for your electricity bill.',
    featured: false,
  },
  {
    tag: 'ChargeNet News',
    date: 'March 28, 2026',
    readTime: '3 min read',
    title: 'ChargeNet Expands to 12 New Cities in Q1 2026',
    excerpt: 'We\'ve deployed 840 new charging points across Pune, Hyderabad, Ahmedabad, and nine more cities — bringing our live network to over 22,000 certified stations.',
    featured: false,
  },
  {
    tag: 'Policy',
    date: 'March 20, 2026',
    readTime: '6 min read',
    title: 'Understanding India\'s New EV Charging Infrastructure Standards',
    excerpt: 'BIS has released updated specifications for public charging equipment, mandating IP55 protection and Type 2/CCS2 connectors. Here\'s what operators need to know.',
    featured: false,
  },
  {
    tag: 'Sustainability',
    date: 'March 14, 2026',
    readTime: '4 min read',
    title: 'How the ChargeNet Fleet Programme Is Cutting Corporate Emissions',
    excerpt: 'In 2025, fleet operators using ChargeNet collectively avoided 68,000 tonnes of CO2 equivalent. We look at the data behind the numbers.',
    featured: false,
  },
  {
    tag: 'Technology',
    date: 'March 6, 2026',
    readTime: '5 min read',
    title: 'OCPP 2.0.1: The Protocol Update That Matters for EV Operators',
    excerpt: 'The Open Charge Point Protocol 2.0.1 brings improved security, smart charging profiles, and better diagnostics. Here\'s what changes for station operators this quarter.',
    featured: false,
  },
];

export default function Blog() {
  const [activeTag, setActiveTag] = useState('All');

  const featured = posts.find(p => p.featured);
  const filtered = posts.filter(p => !p.featured && (activeTag === 'All' || p.tag === activeTag));

  return (
    <PageWrapper>
      <div className="bg-white min-h-screen text-[#051428] selection:bg-[#1D9E75] selection:text-white">

        {/* Hero */}
        <section className="border-b border-gray-100 px-6 py-24 bg-[#FAFAF9]">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1D9E75] mb-4">Resources</p>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#051428] leading-[1.05] mb-4">
                Latest Blog.
              </h1>
              <p className="text-gray-500 text-lg max-w-xl">
                Industry news, policy updates, and technology insights from the ChargeNet team.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Featured Post */}
        {featured && (
          <section className="px-6 py-16 border-b border-gray-100">
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-8">Featured</p>
                <div className="group cursor-pointer">
                  <div className="flex flex-col md:flex-row md:items-start gap-8">
                    <div className="shrink-0">
                      <span className="inline-block px-3 py-1 bg-[#1D9E75]/10 text-[#1D9E75] text-[10px] font-bold uppercase tracking-widest mb-4">{featured.tag}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl md:text-4xl font-bold text-[#051428] leading-tight mb-4 group-hover:text-[#1D9E75] transition-colors tracking-tight">
                        {featured.title}
                      </h2>
                      <p className="text-gray-500 text-[15px] leading-relaxed mb-6 max-w-2xl">{featured.excerpt}</p>
                      <div className="flex items-center gap-6 text-[12px] text-gray-400">
                        <span>{featured.date}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {featured.readTime}</span>
                        <button className="flex items-center gap-1.5 text-[#051428] font-bold hover:text-[#1D9E75] transition-colors ml-auto">
                          Read Article <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* Tag Filter */}
        <section className="px-6 py-8 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`shrink-0 px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors border ${
                  activeTag === tag
                    ? 'bg-[#051428] text-white border-[#051428]'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-[#051428] hover:text-[#051428]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Post List */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto divide-y divide-gray-100 border-y border-gray-100">
            {filtered.map((post, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="py-10 group flex flex-col md:flex-row gap-6 md:gap-12 cursor-pointer hover:bg-[#FAFAF9] transition-colors px-4 -mx-4">
                  <div className="shrink-0 md:pt-1">
                    <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-widest group-hover:bg-[#1D9E75]/10 group-hover:text-[#1D9E75] transition-colors">
                      {post.tag}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#051428] mb-3 leading-tight group-hover:text-[#1D9E75] transition-colors tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-[14px] leading-relaxed mb-4 max-w-2xl">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400">
                      <span>{post.date}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
                    <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[#1D9E75]">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 px-6 bg-[#FAFAF9] border-t border-gray-100">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <h2 className="text-2xl font-bold text-[#051428] mb-3 tracking-tight">Stay current with EV infrastructure.</h2>
              <p className="text-gray-500 text-[15px] mb-8">New articles every week. No spam, unsubscribe anytime.</p>
              <div className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 h-12 px-4 bg-white border border-gray-200 border-r-0 text-[15px] text-[#051428] placeholder-gray-300 focus:outline-none focus:border-[#1D9E75] transition-colors"
                />
                <button className="h-12 px-6 bg-[#051428] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#1D9E75] transition-colors rounded-none whitespace-nowrap border border-[#051428]">
                  Subscribe
                </button>
              </div>
            </Reveal>
          </div>
        </section>

      </div>
    </PageWrapper>
  );
}
