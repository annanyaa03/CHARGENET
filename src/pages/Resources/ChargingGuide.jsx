import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'


const ChargingGuide = () => {
  const [activeSection, setActiveSection] = useState(0)
  const [openItem, setOpenItem] = useState(null)

  const sections = [
    { id: 0, label: 'Basics' },
    { id: 1, label: 'Charger types' },
    { id: 2, label: 'Costs' },
    { id: 3, label: 'Tips' }
  ]

  const content = {
    0: [
      {
        q: 'What is an EV charging station?',
        a: 'An EV charging station supplies electric energy to charge plug-in electric vehicles. ChargeNet stations are available 24/7 across 20+ cities in India.'
      },
      {
        q: 'How long does charging take?',
        a: 'Charging time depends on your battery size and charger type. A DC fast charger (CCS/CHAdeMO) can charge 80% in 30-45 minutes. AC Type 2 chargers take 2-4 hours for a full charge.'
      },
      {
        q: 'Do I need to book in advance?',
        a: 'Booking in advance is recommended to guarantee your slot. Walk-ins are accepted when slots are available but peak hours can get busy.'
      },
      {
        q: 'What happens if I arrive late?',
        a: 'Your slot is held for 15 minutes after your booking time. After that it may be released to walk-in users. You can modify your booking up to 30 minutes before the slot.'
      }
    ],
    1: [
      {
        q: 'What is a CCS charger?',
        a: 'Combined Charging System (CCS) is a DC fast charging standard. It can deliver up to 150kW and is compatible with most modern EVs including Tata Nexon EV, MG ZS EV and Hyundai Kona.'
      },
      {
        q: 'What is CHAdeMO?',
        a: 'CHAdeMO is a DC fast charging standard developed in Japan. It delivers up to 100kW and is used by Nissan Leaf and Mitsubishi Outlander PHEV.'
      },
      {
        q: 'What is a Type 2 charger?',
        a: 'Type 2 is an AC charging standard that delivers up to 22kW. It is the most universal connector and works with almost all EVs. Slower than DC but gentler on the battery.'
      },
      {
        q: 'Which charger is right for my car?',
        a: 'Check your vehicle manual for supported connector types. Most modern Indian EVs support CCS. Older models may use CHAdeMO. All EVs support Type 2 AC charging.'
      }
    ],
    2: [
      {
        q: 'How much does charging cost?',
        a: 'Charging costs start from ₹8.50 per kWh for Type 2 AC charging. CCS DC fast charging starts at ₹15 per kWh. CHAdeMO starts at ₹12 per kWh.'
      },
      {
        q: 'How is the cost calculated?',
        a: 'Cost is calculated based on energy consumed (kWh) multiplied by the per kWh rate at the station. You can see the estimated cost before confirming your booking.'
      },
      {
        q: 'Are there any hidden fees?',
        a: 'No hidden fees. You pay for the energy you consume. Pro and Elite plan members get 10% off all session rates automatically.'
      },
      {
        q: 'What payment methods are accepted?',
        a: 'UPI, credit/debit cards, net banking and all major wallets including Paytm, PhonePe and Google Pay. GST receipts are auto-generated.'
      }
    ],
    3: [
      {
        q: 'When is the best time to charge?',
        a: 'Off-peak hours (10pm to 6am) typically have lower demand and more available slots. Pro and Elite members get priority access during peak hours.'
      },
      {
        q: 'How to maximize battery health?',
        a: 'Avoid charging to 100% regularly. Keep battery between 20-80% for daily use. Use DC fast charging only when needed. Regular AC charging is better for battery longevity.'
      },
      {
        q: 'What to do while waiting?',
        a: 'Each ChargeNet station detail page shows nearby restaurants, cafes and parks within 1km. Check the Nearby tab on any station page for real-time suggestions.'
      },
      {
        q: 'How to track my charging session?',
        a: 'Once your session starts you can track it live from your dashboard. You will receive a notification when charging is complete and when your slot time is ending.'
      }
    ]
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar solid={true} />
      <div className="flex-1">


      {/* HERO */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-0">
          
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-8">
            Resources / Charging Guide
          </p>

          <div className="grid grid-cols-2 gap-0 border-t border-gray-100">
            <div className="py-12 pr-16 border-r border-gray-100">
              <h1 className="text-7xl font-black text-gray-900 leading-none tracking-tight uppercase mb-0">
                Everything
                <br />
                you need
                <br />
                to know.
              </h1>
            </div>
            <div className="py-12 pl-16 flex flex-col justify-between">
              <p className="text-base text-gray-500 leading-relaxed max-w-sm">
                A complete guide to EV charging in India. From picking the right charger to maximizing battery life.
              </p>
              <div className="flex gap-3 mt-8">
                <Link to="/map"
                  className="bg-gray-900 text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-black transition-all">
                  Find a station
                </Link>
                <Link to="/resources/help"
                  className="border border-gray-300 text-gray-600 px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:border-gray-900 transition-all">
                  Help center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GUIDE CONTENT */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-12">
            
            {/* Left - Section Nav */}
            <div className="col-span-3">
              <div className="sticky top-24 space-y-1">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSection(s.id)
                      setOpenItem(null)
                    }}
                    className={`w-full text-left px-0 py-2.5 text-sm transition-all border-b border-transparent ${
                      activeSection === s.id
                        ? 'text-gray-900 font-medium border-gray-900'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right - Content */}
            <div className="col-span-9">
              <div className="divide-y divide-gray-100">
                {content[activeSection].map((item, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenItem(openItem === i ? null : i)}
                      className="w-full flex items-center justify-between py-5 text-left group">
                      <span className={`text-sm transition-all ${
                        openItem === i
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {item.q}
                      </span>
                      <svg className={`w-4 h-4 text-gray-300 flex-shrink-0 ml-8 transition-all ${
                        openItem === i
                          ? 'rotate-180 text-gray-900'
                          : 'group-hover:text-gray-500'
                      }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    {openItem === i && (
                      <p className="text-sm text-gray-400 leading-relaxed pb-5 max-w-xl">
                        {item.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-14 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-12 items-center">
            <div className="col-span-7">
              <h2 className="text-3xl font-normal text-gray-900 tracking-tight mb-2">
                Still have questions?
              </h2>
              <p className="text-sm text-gray-400">
                Our support team is available 24/7 to help.
              </p>
            </div>
            <div className="col-span-5 flex justify-end gap-3">
              <Link to="/resources/help"
                className="bg-gray-900 text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-black transition-all">
                Visit help center
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  )
}

export default ChargingGuide
