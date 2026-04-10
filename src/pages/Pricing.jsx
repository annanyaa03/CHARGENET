import React from 'react'
import { Check, Zap, Shield, Star, Crown, ZapOff, Sparkles, ArrowRight } from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'

const PLANS = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for occasional chargers',
    features: [
      'Access to 500+ stations',
      'Real-time availability',
      'Standard charging speeds',
      'Community support',
    ],
    notIncluded: [
      'Priority booking',
      'Discounted kwh rates',
      'Exclusive high-speed chargers',
      'Carbon footprint tracking',
    ],
    buttonText: 'Get Started',
    premium: false,
  },
  {
    name: 'Pro',
    price: '499',
    description: 'For daily EV commuters',
    features: [
      'Priority slot booking',
      '10% discount on all sessions',
      'Access to 150kW+ chargers',
      'Premium 24/7 support',
      'Carbon tracking dashboard',
      'Digital tax receipts',
    ],
    notIncluded: [
      'Fleet management tools',
      'Zero idle fees',
    ],
    buttonText: 'Go Pro',
    premium: true,
    highlight: 'Most Popular',
  },
  {
    name: 'Elite',
    price: '1299',
    description: 'The ultimate charging experience',
    features: [
      'Everything in Pro',
      'Zero idle fees for 15 mins',
      'Free valet charging (select cities)',
      'Quarterly battery health check',
      'Fleet management (up to 3 cars)',
      'Early access to new stations',
    ],
    notIncluded: [],
    buttonText: 'Join Elite',
    premium: true,
  },
]

export default function Pricing() {
  React.useEffect(() => {
    document.title = 'Pricing — ChargeNet'
    window.scrollTo(0, 0)
  }, [])

  return (
    <PageWrapper>
      <PageContainer className="!max-w-7xl">
        {/* Header */}
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
            <Sparkles size={14} className="text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Flexible Plans</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-none mb-6">
            Simple, transparent <br />
            <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">pricing for everyone.</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Choose the plan that fits your lifestyle. Whether you're a city commuter or a long-distance traveler, we've got you covered.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${
                plan.highlight
                  ? 'border-emerald-500 bg-white shadow-2xl shadow-emerald-500/10 scale-105 z-10'
                  : 'border-gray-100 bg-white hover:border-gray-200 shadow-xl shadow-gray-100/50'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  {plan.highlight}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-400 font-bold">/month</span>
                </div>
                <p className="text-sm text-gray-400 mt-4 font-medium">{plan.description}</p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-emerald-600" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 opacity-40">
                    <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <ZapOff size={10} className="text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                  plan.premium
                    ? 'bg-gray-900 text-white hover:bg-black shadow-xl shadow-gray-900/20'
                    : 'bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Business Call to Action */}
        <div className="bg-gray-50 rounded-[40px] p-12 border border-gray-100 text-center mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Need a custom plan for your business?</h2>
          <p className="text-gray-500 font-medium mb-8 text-lg">
            We provide tailored charging solutions for fleets, commercial properties, and residential complexes. Join the green revolution today.
          </p>
          <Button variant="primary" className="!h-14 !px-8 !rounded-2xl inline-flex items-center justify-center gap-2">
            Contact Sales <ArrowRight size={16} />
          </Button>
        </div>

      </PageContainer>
    </PageWrapper>
  )
}
