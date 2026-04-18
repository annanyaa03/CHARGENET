import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'

const Fleet = () => {
  const [activeFleet, setActiveFleet] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)
  const [activeFeature, setActiveFeature] = useState(null)

  useEffect(() => {
    document.title = 'For Fleets — ChargeNet'
    window.scrollTo(0, 0)
  }, [])

  const fleetTypes = [
    {
      title: 'Last-mile delivery',
      description: 'Manage charging schedules for delivery vans and two-wheelers. Optimize routes based on charge levels and nearby station availability.',
      stats: [
        { value: '60%', label: 'Cost vs petrol' },
        { value: 'Auto', label: 'Route planning' },
        { value: '24/7', label: 'Monitoring' }
      ]
    },
    {
      title: 'Corporate cab fleets',
      description: 'Keep your cab fleet charged and on the road. Automated scheduling ensures no vehicle is ever out of charge during peak hours.',
      stats: [
        { value: '98%', label: 'Fleet uptime' },
        { value: '0', label: 'Manual scheduling' },
        { value: 'Live', label: 'Driver tracking' }
      ]
    },
    {
      title: 'Government & municipal',
      description: 'Manage charging for buses, garbage trucks and government vehicles. Full audit trail and compliance reporting included.',
      stats: [
        { value: '100%', label: 'Audit trail' },
        { value: 'GST', label: 'Compliant' },
        { value: 'Full', label: 'Compliance' }
      ]
    },
    {
      title: 'Logistics & transport',
      description: 'Long-haul EV trucks and logistics vehicles. Plan charging stops across routes with our corridor charging network.',
      stats: [
        { value: '80+', label: 'Stations' },
        { value: 'Smart', label: 'Routing' },
        { value: '30%', label: 'Cost saving' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      <Navbar solid />

      {/* HERO - Full Width Editorial */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-0">
          
          {/* Breadcrumb */}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-8">
            Solutions / Fleet
          </p>

          {/* Full Width Heading */}
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-gray-900 leading-[0.9] uppercase mb-0">
            Scale your
            <br />
            fleet.
          </h1>

          {/* Description + CTA row */}
          <div className="grid grid-cols-12 gap-12 border-t border-gray-100 mt-10 py-10">
            <div className="col-span-5">
              <p className="text-lg text-gray-500 leading-relaxed">
                End-to-end charging infrastructure for your entire EV fleet. Monitor, manage and optimize every vehicle from one platform.
              </p>
            </div>
            <div className="col-span-4 col-start-7 flex items-center gap-3">
              <Link to="/contact" className="h-14 px-10 bg-gray-900 text-white flex items-center justify-center font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                Request demo
              </Link>
              <Link to="/pricing" className="h-14 px-10 border border-gray-200 text-gray-900 flex items-center justify-center font-bold uppercase text-[10px] tracking-widest hover:border-gray-900 transition-all">
                View pricing
              </Link>
            </div>
          </div>

          {/* Stats - Full Width Row */}
          <div className="grid grid-cols-4 divide-x divide-gray-100 border-t border-gray-100">
            {[
              { value: '200+', label: 'Fleets managed' },
              { value: '5,000+', label: 'Vehicles on network' },
              { value: '98%', label: 'Fleet uptime' },
              { value: '30%', label: 'Average cost saving' }
            ].map((stat, i) => (
              <div key={i} className="py-6 px-8 first:pl-0">
                <p className="text-4xl font-bold tracking-tighter mb-1 text-gray-900">
                  {stat.value}
                </p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLEET TYPES - Number List Style */}
      <section className="py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-12">
            
            <div className="col-span-3">
              <p className="text-xs text-gray-400 uppercase tracking-widest sticky top-24">
                Fleet types
              </p>
            </div>

            <div className="col-span-9">
              
              {/* Fleet Type Number List */}
              <div className="divide-y divide-gray-100">
                {fleetTypes.map((ft, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveFleet(activeFleet === i ? null : i)}
                    className="py-6 cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-8">
                        <span className={`text-xs font-mono mt-1 w-6 flex-shrink-0 ${activeFleet === i ? 'text-gray-900 font-bold' : 'text-gray-300 font-medium'}`}>
                          0{i + 1}
                        </span>
                        <div>
                          <p className={`text-lg transition-all ${
                            activeFleet === i ? 'text-gray-900 font-bold' : 'text-gray-700 font-medium group-hover:text-gray-900'
                          }`}>
                            {ft.title}
                          </p>
                          {activeFleet === i && (
                            <div className="mt-4 grid grid-cols-2 gap-8">
                              <p className="text-sm text-gray-500 leading-relaxed">
                                {ft.description}
                              </p>
                              <div className="flex gap-8">
                                {ft.stats.map((stat, j) => (
                                  <div key={j}>
                                    <p className="text-2xl font-bold text-gray-900 mb-0.5 tracking-tight">
                                      {stat.value}
                                    </p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                      {stat.label}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <svg className={`w-4 h-4 text-gray-300 flex-shrink-0 mt-1 transition-transform ${
                        activeFleet === i ? 'rotate-90 text-gray-900' : ''
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES - Two col hover */}
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
                Built for fleet
                <br />
                operators.
              </h2>

              <div className="grid grid-cols-2 gap-px bg-gray-100">
                {[
                  {
                    title: 'Fleet dashboard',
                    description: 'Live view of every vehicle charge level, location and charging status across your entire fleet.'
                  },
                  {
                    title: 'Smart scheduling',
                    description: 'AI-powered charging schedules based on route plans, shift timings and energy tariffs.'
                  },
                  {
                    title: 'Driver app',
                    description: 'Drivers get navigation to nearest available charger compatible with their vehicle.'
                  },
                  {
                    title: 'Cost allocation',
                    description: 'Automatically allocate charging costs to departments or cost centers.'
                  },
                  {
                    title: 'Maintenance alerts',
                    description: 'Get notified when a charger needs maintenance before it causes fleet downtime.'
                  },
                  {
                    title: 'Energy optimization',
                    description: 'Charge during off-peak hours to reduce costs. Integrate with solar and renewable sources.'
                  }
                ].map((f, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveFeature(activeFeature === i ? null : i)}
                    className={`bg-white p-6 cursor-pointer transition-all ${
                      activeFeature === i ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm ${activeFeature === i ? 'font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
                        {f.title}
                      </p>
                      <svg className={`w-3.5 h-3.5 transition-all text-gray-300 ${
                        activeFeature === i ? 'rotate-45 text-gray-900' : ''
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4"/>
                      </svg>
                    </div>
                    {activeFeature === i && (
                      <p className="text-xs text-gray-400 leading-relaxed mt-1">
                        {f.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-12">
            
            <div className="col-span-3">
              <p className="text-xs text-gray-400 uppercase tracking-widest sticky top-24">
                Comparison
              </p>
            </div>

            <div className="col-span-9">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
                EV fleet vs
                <br />
                traditional fuel.
              </h2>
              <p className="text-sm text-gray-400 mb-10">
                The real numbers behind switching to electric.
              </p>

              <div className="border border-gray-200">
                <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50">
                  <div className="px-5 py-3"></div>
                  <div className="px-5 py-3 border-l border-gray-200">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Traditional fuel
                    </p>
                  </div>
                  <div className="px-5 py-3 border-l border-gray-200 bg-gray-900">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                      ChargeNet EV
                    </p>
                  </div>
                </div>
                {[
                  { label: 'Cost per km', fuel: '₹4-6/km', ev: '₹0.8-1.2/km' },
                  { label: 'Maintenance', fuel: 'High', ev: '60% lower' },
                  { label: 'Emissions', fuel: '120g CO2/km', ev: 'Zero direct' },
                  { label: 'Scheduling', fuel: 'Pump queues', ev: 'Pre-scheduled' },
                  { label: 'Cost tracking', fuel: 'Manual', ev: 'Automatic' },
                  { label: 'Subsidy', fuel: 'None', ev: 'FAME II eligible' }
                ].map((row, i, arr) => (
                  <div key={i} className={`grid grid-cols-3 hover:bg-gray-50 transition-all ${
                    i !== arr.length - 1 ? 'border-b border-gray-100' : ''
                  }`}>
                    <div className="px-5 py-4">
                      <p className="text-xs font-medium text-gray-500">
                        {row.label}
                      </p>
                    </div>
                    <div className="px-5 py-4 border-l border-gray-100">
                      <p className="text-xs font-bold text-gray-400">
                        {row.fuel}
                      </p>
                    </div>
                    <div className="px-5 py-4 border-l border-gray-100 bg-gray-50">
                      <p className="text-xs font-bold text-gray-900">
                        {row.ev}
                      </p>
                    </div>
                  </div>
                ))}
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
                {[
                  {
                    q: 'How many vehicles can I manage?',
                    a: 'There is no limit. Our platform scales from 5 vehicles to 5000+. Enterprise plans include dedicated infrastructure support.'
                  },
                  {
                    q: 'Can drivers find chargers on their own?',
                    a: 'Yes. Each driver gets the ChargeNet driver app with real-time charger availability and navigation built in.'
                  },
                  {
                    q: 'How does billing work for fleets?',
                    a: 'Each session is logged against the vehicle and driver. Monthly consolidated invoices are generated automatically with full GST compliance.'
                  },
                  {
                    q: 'What vehicles are supported?',
                    a: 'All EVs with CCS, CHAdeMO or Type 2 connectors. This includes most commercial EVs from Tata, Mahindra, BYD, Ashok Leyland and others.'
                  }
                ].map((faq, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between py-5 text-left">
                      <span className={`text-sm font-medium ${openFaq === i ? 'text-gray-900' : 'text-gray-700'}`}>
                        {faq.q}
                      </span>
                      <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-4 transition-transform ${
                        openFaq === i ? 'rotate-180' : ''
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                Ready to electrify
                <br />
                your fleet?
              </h2>
              <p className="text-sm text-gray-400">
                Our fleet team will design a custom charging solution for your needs.
              </p>
            </div>
            <div className="col-span-5 flex justify-end gap-3">
              <Link to="/contact" className="h-14 px-10 bg-gray-900 text-white flex items-center justify-center font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                Request demo
              </Link>
              <Link to="/map" className="h-14 px-10 border border-gray-200 text-gray-900 flex items-center justify-center font-bold uppercase text-[10px] tracking-widest hover:border-gray-900 transition-all">
                View network
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Fleet
