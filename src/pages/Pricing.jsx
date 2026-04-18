import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'

export default function Pricing() {
  const navigate = useNavigate()
  const [billing, setBilling] = useState('monthly')
  const [openFaq, setOpenFaq] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)

  useEffect(() => {
    document.title = 'Pricing — ChargeNet'
    window.scrollTo(0, 0)
  }, [])

  const handleSelectPlan = (plan) => {
    if (plan.monthlyPrice === 0) {
      navigate('/signup')
      return
    }
    // Show payment modal or navigate to checkout
    setSelectedPlan(plan)
    // For now navigate to signup with plan info
    navigate('/signup', { 
      state: { 
        plan: plan.name,
        price: billing === 'monthly' 
          ? plan.monthlyPrice 
          : plan.annualPrice,
        billing: billing
      }
    })
  }

  const plans = [
    {
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Perfect for occasional chargers',
      highlight: false,
      features: [
        { text: 'Access to 80+ stations', included: true },
        { text: 'Real-time availability', included: true },
        { text: 'Standard charging speeds', included: true },
        { text: 'Community support', included: true },
        { text: 'Priority booking', included: false },
        { text: 'Discounted kWh rates', included: false },
        { text: 'Exclusive high-speed chargers', included: false },
        { text: 'Fleet management', included: false }
      ],
      cta: 'Get Started Free',
      ctaStyle: 'border border-gray-900 text-gray-900 hover:bg-gray-50'
    },
    {
      name: 'Pro',
      monthlyPrice: 499,
      annualPrice: 399,
      description: 'For daily EV commuters',
      highlight: true,
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Priority slot booking', included: true },
        { text: '10% discount on all sessions', included: true },
        { text: 'Access to 150kW+ chargers', included: true },
        { text: 'Premium 24/7 support', included: true },
        { text: 'Carbon tracking dashboard', included: true },
        { text: 'Digital tax receipts', included: true },
        { text: 'Fleet management', included: false }
      ],
      cta: 'Start Pro Plan',
      ctaStyle: 'bg-black text-white hover:bg-gray-800'
    },
    {
      name: 'Elite',
      monthlyPrice: 1299,
      annualPrice: 1039,
      description: 'The ultimate charging experience',
      highlight: false,
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Zero idle fees for 15 mins', included: true },
        { text: 'Free valet charging (select cities)', included: true },
        { text: 'Quarterly battery health check', included: true },
        { text: 'Fleet management (up to 3 cars)', included: true },
        { text: 'Early access to new stations', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Custom invoicing', included: true }
      ],
      cta: 'Start Elite Plan',
      ctaStyle: 'border border-gray-900 text-gray-900 hover:bg-gray-50'
    }
  ]

  return (
    <PageWrapper noPadding={true}>
      <div className="bg-white min-h-screen pt-[72px] lg:pt-[80px]">
        {/* SECTION 1 - Hero */}
        <section className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-6 py-24 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Pricing Plans
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
              Simple, transparent
              <br />
              pricing.
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-12 font-medium">
              Choose the plan that fits your lifestyle. 
              No hidden fees, no surprises.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex border border-gray-700 rounded-none overflow-hidden">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-8 py-3.5 text-sm font-bold transition-all ${
                  billing === 'monthly'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}>
                Monthly
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={`px-8 py-3.5 text-sm font-bold transition-all flex items-center gap-3 ${
                  billing === 'annual'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}>
                Annual
                <span className={`text-[10px] px-2 py-0.5 font-black uppercase tracking-widest ${
                  billing === 'annual' ? 'bg-black text-white' : 'bg-white text-black'
                }`}>
                  -20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2 - Pricing Cards */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
              {plans.map((plan, i) => (
                <div key={i}
                  className={`p-10 relative flex flex-col h-full transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-black text-white z-10 shadow-2xl'
                    : 'bg-white'
                }`}>
                  
                  {/* Most Popular Badge */}
                  {plan.highlight && (
                    <div className="absolute -top-px left-0 right-0 flex justify-center">
                      <span className="bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    {/* Plan Name */}
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-6 text-gray-400">
                      {plan.name}
                    </p>

                    {/* Price */}
                    <div className="mb-2 flex items-baseline">
                      <span className={`text-6xl font-bold tracking-tighter ${
                        plan.highlight ? 'text-white' : 'text-gray-900'
                      }`}>
                        ₹{billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                      </span>
                      <span className="text-sm ml-2 font-bold text-gray-400 uppercase tracking-widest">
                        /mo
                      </span>
                    </div>
                    
                    {/* Annual Savings */}
                    {billing === 'annual' && plan.monthlyPrice > 0 ? (
                      <p className="text-[10px] mb-6 font-black uppercase tracking-widest text-[#10B981]">
                        Save ₹{(plan.monthlyPrice - plan.annualPrice) * 12}/year
                      </p>
                    ) : (
                      <div className="h-[22px] mb-6"></div>
                    )}

                    {/* Description */}
                    <p className={`text-sm mb-10 leading-relaxed font-medium ${
                      plan.highlight ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {plan.description}
                    </p>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-4 text-[11px] font-black uppercase tracking-[3px] transition-all mb-10 rounded-none ${
                        plan.highlight
                          ? 'bg-white text-black hover:bg-gray-100'
                          : plan.ctaStyle
                      }`}>
                      {plan.cta}
                    </button>

                    {/* Divider */}
                    <div className={`border-t mb-10 ${
                      plan.highlight ? 'border-gray-800' : 'border-gray-100'
                    }`}></div>

                    {/* Features */}
                    <ul className="space-y-4">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-4">
                          {feature.included ? (
                            <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              plan.highlight ? 'text-white' : 'text-gray-900'
                            }`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                            </svg>
                          ) : (
                            <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              plan.highlight ? 'text-gray-800' : 'text-gray-200'
                            }`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          )}
                          <span className={`text-xs font-bold uppercase tracking-wide ${
                            feature.included
                              ? plan.highlight ? 'text-gray-200' : 'text-gray-700'
                              : plan.highlight ? 'text-gray-700' : 'text-gray-300'
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3 - Per kWh Rates Table */}
        <section className="py-24 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4">
                Usage Economics
              </p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                Pay only for what you use
              </h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-none overflow-hidden shadow-sm">
              {/* Header */}
              <div className="grid grid-cols-2 md:grid-cols-5 px-8 py-5 bg-gray-50 border-b border-gray-200">
                <p className="md:col-span-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Charger Type
                </p>
                <p className="hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Free Plan
                </p>
                <p className="hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">
                  Pro Plan
                </p>
                <p className="hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">
                  Elite Plan
                </p>
              </div>

              {/* Rows */}
              {[
                {
                  type: 'Type 2 AC',
                  power: 'Up to 22 kW',
                  free: '₹8.50',
                  pro: '₹7.65',
                  elite: '₹7.65'
                },
                {
                  type: 'CCS DC Fast',
                  power: 'Up to 150 kW',
                  free: '₹15.00',
                  pro: '₹13.50',
                  elite: '₹13.50'
                },
                {
                  type: 'CHAdeMO',
                  power: 'Up to 100 kW',
                  free: '₹12.00',
                  pro: '₹10.80',
                  elite: '₹10.80'
                }
              ].map((row, i, arr) => (
                <div key={i}
                  className={`grid grid-cols-2 md:grid-cols-5 px-8 py-6 items-center hover:bg-gray-50 transition-colors ${
                  i !== arr.length - 1 ? 'border-b border-gray-100' : ''
                }`}>
                  <div className="md:col-span-2">
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                      {row.type}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      {row.power}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-gray-600">{row.free}<span className="text-[10px] ml-1 uppercase">/kWh</span></p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-gray-900">{row.pro}<span className="text-[10px] ml-1 uppercase">/kWh</span></p>
                    <p className="text-[9px] font-black text-[#10B981] uppercase tracking-widest">10% OFF</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">{row.elite}<span className="text-[10px] ml-1 uppercase">/kWh</span></p>
                    <p className="text-[9px] font-black text-[#10B981] uppercase tracking-widest">10% OFF</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 - FAQ */}
        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <div className="mb-16 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4">
                Support Hub
              </p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                Common questions
              </h2>
            </div>

            {/* Accordion */}
            <div className="border-t border-gray-200">
              {[
                {
                  q: 'Can I cancel my plan anytime?',
                  a: 'Yes. You can cancel your Pro or Elite plan at any time. Your plan remains active until the end of the billing period with no additional charges.'
                },
                {
                  q: 'How does the 10% discount work?',
                  a: 'Pro and Elite members automatically receive 10% off the per kWh rate at all ChargeNet stations. The discount is applied at checkout when booking.'
                },
                {
                  q: 'What payment methods are accepted?',
                  a: 'We accept all major credit/debit cards, UPI, net banking and wallets including Paytm, PhonePe and Google Pay.'
                },
                {
                  q: 'Is there a free trial for Pro?',
                  a: 'Yes. New users get a 7-day free trial of the Pro plan with no credit card required. Simply sign up and activate your trial from the dashboard.'
                },
                {
                  q: 'What is valet charging in Elite?',
                  a: 'Elite members in select cities can have a ChargeNet partner pick up their vehicle, charge it, and return it. Available in Mumbai, Delhi, Bangalore and Pune.'
                }
              ].map((faq, i) => (
                <div key={i} className="border-b border-gray-200">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-6 text-left group">
                    <span className="font-bold text-gray-900 text-sm uppercase tracking-tight group-hover:text-black transition-colors">
                      {faq.q}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                        openFaq === i ? 'rotate-180 text-black' : ''
                      }`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? 'max-h-48 pb-6' : 'max-h-0'
                  }`}>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 - Bottom CTA */}
        <section className="bg-black py-24 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              Start charging smarter today.
            </h2>
            <p className="text-gray-400 text-lg mb-12 font-medium max-w-2xl mx-auto">
              Join thousands of EV drivers on the ChargeNet network and experience seamless terminal allocation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/signup"
                className="w-full sm:w-auto bg-white text-black px-12 py-4 text-[11px] font-black uppercase tracking-[3px] hover:bg-gray-100 transition-all text-center">
                Get Started Free
              </Link>
              <Link
                to="/map"
                className="w-full sm:w-auto border border-gray-700 text-white px-12 py-4 text-[11px] font-black uppercase tracking-[3px] hover:border-white transition-all text-center">
                Find Stations
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}
