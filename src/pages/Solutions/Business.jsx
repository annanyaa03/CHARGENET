import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'

const Business = () => {
  const [activeUseCase, setActiveUseCase] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)
  const [hoveredRow, setHoveredRow] = useState(null)

  useEffect(() => {
    document.title = 'For Business — ChargeNet'
    window.scrollTo(0, 0)
  }, [])

  const useCases = [
    {
      title: 'Office & workplace',
      description: 'Install chargers at your office campus. Employees charge during work hours. Manage billing and usage from one admin portal.',
      stats: [
        { value: '40%', label: 'Retention boost' },
        { value: '1 day', label: 'To go live' },
        { value: '₹0', label: 'Setup cost' }
      ]
    },
    {
      title: 'Retail & hospitality',
      description: 'Attract EV driving customers by offering charging at your store, mall or hotel. Turn charging time into dwell time.',
      stats: [
        { value: '2.5x', label: 'Customer dwell' },
        { value: '35%', label: 'Repeat visits' },
        { value: '24/7', label: 'Uptime' }
      ]
    },
    {
      title: 'Residential complexes',
      description: 'Provide charging for residents in apartments and gated communities. Individual billing per unit. Zero disputes.',
      stats: [
        { value: '100%', label: 'Individual billing' },
        { value: '0', label: 'Admin overhead' },
        { value: 'Auto', label: 'Invoices' }
      ]
    },
    {
      title: 'Co-working spaces',
      description: 'Add EV charging as a premium amenity. Members get access as part of membership or pay per use.',
      stats: [
        { value: '₹499', label: 'Member add-on' },
        { value: '5 min', label: 'Onboarding' },
        { value: 'All', label: 'EVs supported' }
      ]
    }
  ]

  const faqs = [
    {
      q: 'How long does setup take?',
      a: 'Most businesses are live within 24 hours. Our team handles the technical setup. You just approve the configuration.'
    },
    {
      q: 'Can employees pay for their own charging?',
      a: 'Yes. You can set up split billing where the company pays a subsidy and employees cover the rest via UPI or wallet.'
    },
    {
      q: 'Is there a minimum contract period?',
      a: 'No. All business plans are month to month. Cancel anytime with 30 days notice. No lock-in.'
    },
    {
      q: 'What if a charger goes offline?',
      a: 'Our monitoring system detects issues in real-time. We notify you and dispatch a technician within 4 hours.'
    }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      <Navbar solid />

      {/* HERO - Left/Right Split */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-0">
          
          {/* Breadcrumb */}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-8">
            Solutions / Business
          </p>

          {/* Two Column Hero */}
          <div className="grid grid-cols-2 gap-0 border-t border-gray-100">
            
            {/* Left - Heading */}
            <div className="py-12 pr-16 border-r border-gray-100">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-gray-900 leading-[0.9] uppercase mb-8">
                Power
                <br />
                your work
                <br />
                place.
              </h1>
              <div className="flex items-center gap-3">
                <Link to="/contact" className="h-14 px-10 bg-gray-900 text-white flex items-center justify-center font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                  Talk to sales
                </Link>
                <Link to="/pricing" className="h-14 px-10 border border-gray-200 flex items-center justify-center font-bold uppercase text-[10px] tracking-widest hover:border-gray-900 transition-all text-gray-900">
                  View pricing
                </Link>
              </div>
            </div>

            {/* Right - Description + Stats */}
            <div className="py-12 pl-16">
              <p className="text-lg text-gray-500 leading-relaxed mb-12 max-w-sm">
                Offer EV charging as a workplace benefit. Attract top talent, reduce carbon footprint and manage everything from one dashboard.
              </p>
              
              {/* Stats - 2x2 grid */}
              <div className="grid grid-cols-2 gap-px bg-gray-100">
                {[
                  { value: '500+', label: 'Businesses enrolled' },
                  { value: '10k+', label: 'Sessions per month' },
                  { value: '99.9%', label: 'Uptime guaranteed' },
                  { value: '24/7', label: 'Business support' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6">
                    <p className="text-4xl font-bold text-gray-900 tracking-tighter mb-1">
                      {stat.value}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES - Tab style */}
      <section className="py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-12">
            
            <div className="col-span-3">
              <p className="text-xs text-gray-400 uppercase tracking-widest sticky top-24">
                Use cases
              </p>
            </div>

            <div className="col-span-9">
              
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-100 mb-10">
                {useCases.map((uc, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveUseCase(i)}
                    className={`px-5 py-3 text-xs transition-all border-b-2 -mb-px ${
                      activeUseCase === i
                        ? 'border-gray-900 text-gray-900 font-medium'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}>
                    {uc.title}
                  </button>
                ))}
              </div>

              {/* Active Use Case Content */}
              <div className="grid grid-cols-2 gap-16">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">
                    {useCases[activeUseCase].title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {useCases[activeUseCase].description}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-0 border-l border-gray-100 pl-16 content-start">
                  {useCases[activeUseCase].stats.map((stat, i) => (
                    <div key={i} className={`${i !== 0 ? 'border-l border-gray-100 pl-4' : ''}`}>
                      <p className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM - Hover rows */}
      <section className="py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-12">
            
            <div className="col-span-3">
              <p className="text-xs text-gray-400 uppercase tracking-widest sticky top-24">
                Platform
              </p>
            </div>

            <div className="col-span-9">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-10">
                One platform,
                <br />
                everything included.
              </h2>

              {/* Hover Rows */}
              <div className="divide-y divide-gray-50">
                {[
                  {
                    title: 'Business dashboard',
                    description: 'Monitor all chargers, sessions and revenue from a single admin dashboard.'
                  },
                  {
                    title: 'Employee management',
                    description: 'Add employees, set charging limits and manage access permissions in seconds.'
                  },
                  {
                    title: 'Automated billing',
                    description: 'Automatic invoicing for each session. GST-compliant receipts generated instantly.'
                  },
                  {
                    title: 'Usage analytics',
                    description: 'Detailed reports on energy consumption, peak hours and cost per employee.'
                  },
                  {
                    title: 'API access',
                    description: 'Integrate ChargeNet with your existing HR or facility management systems.'
                  },
                  {
                    title: 'Carbon reporting',
                    description: 'Track and report your carbon offset for ESG compliance.'
                  }
                ].map((item, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`py-5 flex items-center justify-between transition-all cursor-default ${
                      hoveredRow === i || hoveredRow === null ? 'opacity-100' : 'opacity-50'
                    }`}>
                    <p className={`text-sm transition-all ${
                      hoveredRow === i ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'
                    }`}>
                      {item.title}
                    </p>
                    <p className={`text-xs text-gray-400 max-w-xs text-right transition-all leading-relaxed ${
                      hoveredRow === i ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-12">
            
            <div className="col-span-3">
              <p className="text-xs text-gray-400 uppercase tracking-widest sticky top-24">
                Pricing
              </p>
            </div>

            <div className="col-span-9">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                Simple business pricing
              </h2>
              <p className="text-sm text-gray-400 mb-10">
                Volume discounts for 10+ chargers.
              </p>

              <div className="border border-gray-200">
                <div className="grid grid-cols-4 border-b border-gray-200 bg-gray-50">
                  <div className="px-5 py-3"></div>
                  {['Starter', 'Growth', 'Enterprise'].map((h, i) => (
                    <div key={i} className={`px-5 py-3 border-l border-gray-200 ${i === 2 ? 'bg-gray-900' : ''}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${i === 2 ? 'text-white' : 'text-gray-500'}`}>
                        {h}
                      </p>
                    </div>
                  ))}
                </div>
                {[
                  { label: 'Monthly fee', values: ['₹4,999', '₹12,999', 'Custom'] },
                  { label: 'Chargers', values: ['Up to 5', 'Up to 20', 'Unlimited'] },
                  { label: 'Employees', values: ['25', '100', 'Unlimited'] },
                  { label: 'Analytics', values: ['Basic', 'Advanced', 'Custom'] },
                  { label: 'Support', values: ['Email', 'Priority', 'Dedicated'] },
                  { label: 'API access', values: ['—', 'Included', 'Included'] }
                ].map((row, i, arr) => (
                  <div key={i} className={`grid grid-cols-4 hover:bg-gray-50 transition-all ${
                    i !== arr.length - 1 ? 'border-b border-gray-100' : ''
                  }`}>
                    <div className="px-5 py-4">
                      <p className="text-xs font-medium text-gray-500">
                        {row.label}
                      </p>
                    </div>
                    {row.values.map((v, j) => (
                      <div key={j} className={`px-5 py-4 border-l border-gray-100 ${j === 2 ? 'bg-gray-50' : ''}`}>
                        <p className={`text-xs font-bold ${j === 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                          {v}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Link to="/contact" className="h-14 px-10 bg-gray-900 text-white flex items-center justify-center font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                  Talk to sales
                </Link>
                <Link to="/pricing" className="h-14 px-10 border border-gray-200 text-gray-900 flex items-center justify-center font-bold uppercase text-[10px] tracking-widest hover:border-gray-900 transition-all">
                  Full pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-12">
            
            <div className="col-span-3">
              <p className="text-xs text-gray-400 uppercase tracking-widest sticky top-24">
                FAQ
              </p>
            </div>

            <div className="col-span-9">
              <div className="divide-y divide-gray-100">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between py-5 text-left">
                      <span className={`text-sm font-medium ${openFaq === i ? 'text-gray-900' : 'text-gray-700'}`}>
                        {faq.q}
                      </span>
                      <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    {openFaq === i && (
                      <p className="text-sm text-gray-400 leading-relaxed pb-5 max-w-lg">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-12 items-center">
            <div className="col-span-7">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 leading-[0.9] uppercase mb-4">
                Ready to power
                <br />
                your workplace?
              </h2>
              <p className="text-sm text-gray-400">
                Our business team will get you set up in days, not months.
              </p>
            </div>
            <div className="col-span-5 flex justify-end gap-3">
              <Link to="/contact" className="h-14 px-10 bg-gray-900 text-white flex items-center justify-center font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                Talk to sales
              </Link>
              <Link to="/pricing" className="h-14 px-10 border border-gray-200 text-gray-900 flex items-center justify-center font-bold uppercase text-[10px] tracking-widest hover:border-gray-900 transition-all">
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Business
