import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../../components/layout/Navbar'

const HelpCenter = () => {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = [
    'All',
    'Account',
    'Bookings',
    'Payments',
    'Charging',
    'Technical'
  ]

  const articles = [
    {
      category: 'Account',
      title: 'How to create an account',
      description: 'Step by step guide to signing up and setting up your ChargeNet profile.',
      time: '2 min read',
      url: 'https://support.google.com/accounts/answer/27441'
    },
    {
      category: 'Account',
      title: 'Reset your password',
      description: 'Instructions for resetting your password if you have been locked out.',
      time: '1 min read',
      url: 'https://support.google.com/accounts/answer/41078'
    },
    {
      category: 'Bookings',
      title: 'How to book a charging slot',
      description: 'Find a station, select a charger and confirm your booking in under a minute.',
      time: '2 min read',
      url: 'https://www.plugshare.com/learn'
    },
    {
      category: 'Bookings',
      title: 'Cancelling or modifying a booking',
      description: 'Learn how to cancel or reschedule your booking before your session starts.',
      time: '2 min read',
      url: 'https://www.plugshare.com/learn'
    },
    {
      category: 'Payments',
      title: 'Accepted payment methods',
      description: 'UPI, cards, wallets and more. Everything you can use to pay on ChargeNet.',
      time: '1 min read',
      url: 'https://razorpay.com/payment-gateway/upi-payment-gateway/'
    },
    {
      category: 'Payments',
      title: 'Getting a GST receipt',
      description: 'How to download your GST-compliant receipt for any charging session.',
      time: '1 min read',
      url: 'https://cleartax.in/s/gst-invoice'
    },
    {
      category: 'Charging',
      title: 'Understanding charger types',
      description: 'CCS, CHAdeMO and Type 2 explained. Find out which one your car needs.',
      time: '3 min read',
      url: 'https://www.virta.global/blog/ev-charging-basics-ccs-chademo-type-2'
    },
    {
      category: 'Charging',
      title: 'What to do if a charger is faulty',
      description: 'Steps to take if you arrive and the charger is not working properly.',
      time: '2 min read',
      url: 'https://www.plugshare.com/learn'
    },
    {
      category: 'Technical',
      title: 'App not loading stations',
      description: 'Troubleshooting steps if the map or station list is not loading.',
      time: '2 min read',
      url: 'https://support.google.com/chrome/answer/2898890'
    },
    {
      category: 'Technical',
      title: 'Location permission issues',
      description: 'How to enable location access so ChargeNet can find stations near you.',
      time: '1 min read',
      url: 'https://support.google.com/chrome/answer/142065'
    }
  ]

  const filtered = articles.filter(a => {
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory
    const matchesSearch = 
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white">
      <Navbar solid={true} />

      {/* HERO - Search centered */}
      <section className="border-b border-gray-100 bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-6">
            Resources / Help Center
          </p>
          
          <h1 className="text-4xl font-normal text-gray-900 tracking-tight mb-8">
            How can we help?
          </h1>

          {/* Search */}
          <div className="max-w-xl mx-auto flex gap-0">
            <input
              type="text"
              placeholder="Search for help..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearch('')
              }}
              className="flex-1 border border-gray-200 px-5 py-3.5 text-sm focus:outline-none focus:border-gray-400 bg-white"
            />
            <button className="bg-gray-900 text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-black transition-all">
              Search
            </button>
          </div>

          {/* Quick links */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <span className="text-xs text-gray-400">Popular:</span>
            {['Book a slot', 'Payment methods', 'Charger types', 'Cancel booking'].map((link, i) => (
              <button
                key={i}
                onClick={() => {
                  setSearch(link)
                  setActiveCategory('All')
                }}
                className="text-xs text-gray-500 hover:text-gray-900 transition-all underline underline-offset-2">
                {link}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-10 border-b border-gray-100 pb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs transition-all ${
                  activeCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 text-gray-500 hover:border-gray-400'
                }`}>
                {cat}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">
              {filtered.length} articles
            </span>
          </div>

          {/* Article Grid */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400 mb-2">
                No articles found for "{search}"
              </p>
              <p className="text-xs text-gray-300 mb-4">
                Try a different search term or browse by category above.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSearch('')
                    setActiveCategory('All')
                  }}
                  className="text-xs border border-gray-200 px-4 py-2 text-gray-500 hover:border-gray-400 transition-all">
                  Clear search
                </button>
                <a
                  href="mailto:support@chargenet.in"
                  className="text-xs border border-gray-200 px-4 py-2 text-gray-500 hover:border-gray-400 transition-all">
                  Email support
                </a>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-5 flex items-start justify-between group cursor-pointer hover:bg-gray-50 -mx-4 px-4 transition-all block">
                  <div className="flex items-start gap-8">
                    <span className="text-xs text-gray-300 w-20 flex-shrink-0 mt-0.5 uppercase tracking-wider">
                      {article.category}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1 group-hover:underline underline-offset-2 leading-snug">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-lg">
                        {article.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-8">
                    <span className="text-xs text-gray-300">{article.time}</span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-all flex-shrink-0 ml-8 mt-1"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTACT SUPPORT */}
      <section className="py-14 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-px bg-gray-100">
            {[
              {
                title: 'Email support',
                description: 'Get a response within 4 hours on weekdays.',
                action: 'support@chargenet.in',
                link: 'mailto:support@chargenet.in'
              },
              {
                title: 'Live chat',
                description: 'Chat with our team instantly during business hours.',
                action: 'Start chat on WhatsApp',
                link: 'https://wa.me/919999999999'
              },
              {
                title: 'Community forum',
                description: 'Ask questions and get answers from other ChargeNet users.',
                action: 'Visit EV community',
                link: 'https://www.team-bhp.com/forum/electric-vehicles/'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {item.title}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  {item.description}
                </p>
                <a 
                  href={item.link}
                  target={item.link.startsWith('mailto') ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  className="text-xs text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-all flex items-center gap-1.5">
                  {item.action}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HelpCenter
