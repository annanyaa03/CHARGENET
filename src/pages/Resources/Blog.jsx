import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'

const Blog = () => {
  const [activeTag, setActiveTag] = useState('All')
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubscribe = () => {
    if (!email) return
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 3000)
  }

  const tags = [
    'All',
    'Industry',
    'Tips',
    'Product',
    'Policy'
  ]

  const posts = [
    {
      tag: 'Industry',
      title: 'India\'s EV market is growing faster than anyone predicted',
      description: 'EV sales in India crossed 1.5 million units in 2024. Here is what is driving the surge and what it means for charging infrastructure.',
      date: 'Dec 2024',
      readTime: '5 min read',
      featured: true,
      url: 'https://economictimes.indiatimes.com/industry/renewables/electric-vehicles/ev-sales-india'
    },
    {
      tag: 'Tips',
      title: 'How to extend your EV battery life by 40%',
      description: 'Simple charging habits that most EV owners overlook. Based on data from 10,000+ ChargeNet sessions.',
      date: 'Nov 2024',
      readTime: '4 min read',
      featured: false,
      url: 'https://www.moneycontrol.com/news/technology/how-to-extend-ev-battery-life'
    },
    {
      tag: 'Product',
      title: 'Introducing real-time charger availability on ChargeNet',
      description: 'We rebuilt our availability system from scratch. Every charger now updates in under one second.',
      date: 'Nov 2024',
      readTime: '3 min read',
      featured: false,
      url: 'https://inc42.com/buzz/ev-charging-real-time-availability'
    },
    {
      tag: 'Policy',
      title: 'FAME III subsidies and what they mean for EV buyers',
      description: 'A breakdown of the government\'s latest EV incentive scheme and how to take advantage of it before March 2025.',
      date: 'Oct 2024',
      readTime: '6 min read',
      featured: false,
      url: 'https://economictimes.indiatimes.com/industry/renewables/electric-vehicles/fame-iii-ev-subsidies-india'
    },
    {
      tag: 'Tips',
      title: 'The best time to charge your EV in Indian cities',
      description: 'We analyzed millions of charging sessions to find out when stations are least busy and rates are lowest.',
      date: 'Oct 2024',
      readTime: '3 min read',
      featured: false,
      url: 'https://www.livemint.com/auto-news/ev-charging-best-time-india'
    },
    {
      tag: 'Industry',
      title: 'Highway charging corridors: Where India stands in 2025',
      description: 'A look at the progress of EV charging corridors on national highways and what gaps remain.',
      date: 'Sep 2024',
      readTime: '7 min read',
      featured: false,
      url: 'https://www.thehindu.com/sci-tech/energy-and-environment/ev-highway-charging-corridors-india'
    }
  ]

  const filtered = activeTag === 'All'
    ? posts
    : posts.filter(p => p.tag === activeTag)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar solid={true} />
      <div className="flex-1">

      {/* HERO */}
      <section className="border-b border-gray-100 pt-32 pb-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-8">
                Resources / Blog
              </p>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] uppercase text-gray-900">
                INDUSTRY NEWS
                <br />
                AND UPDATES.
              </h1>
            </div>
            <p className="text-lg text-gray-500 max-w-xs md:text-right leading-relaxed mb-2">
              Insights on EV charging, battery technology and India's electric future.
            </p>
          </div>
        </div>
      </section>



      {/* ALL POSTS */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Tag Filter */}
          <div className="flex items-center gap-2 mb-10">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 text-xs transition-all ${
                activeTag === tag
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-200 text-gray-500 hover:border-gray-400'
              }`}>
                {tag}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="divide-y divide-gray-100">
            {filtered.map((post, i) => (
              <a
                key={i}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-5 flex items-start justify-between group cursor-pointer hover:bg-gray-50 -mx-4 px-4 transition-all block">
                
                <div className="flex items-start gap-8">
                  {/* Date */}
                  <div className="w-20 flex-shrink-0">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {post.date}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wider">
                        {post.tag}
                      </span>
                      <span className="text-gray-200 text-xs">·</span>
                      <span className="text-xs text-gray-400">{post.readTime}</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1.5 group-hover:underline underline-offset-2 leading-snug max-w-xl">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-lg">
                      {post.description}
                    </p>
                  </div>
                </div>

                <svg className="w-4 h-4 text-gray-300 flex-shrink-0 ml-8 mt-1 group-hover:text-gray-600 transition-all"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-14 border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-12 items-center">
            <div className="col-span-5">
              <h2 className="text-2xl font-normal text-gray-900 tracking-tight mb-2">
                Stay in the loop.
              </h2>
              <p className="text-sm text-gray-400">
                Get the latest EV news and ChargeNet updates in your inbox.
              </p>
            </div>
            <div className="col-span-7">
              <div className="flex gap-0">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 border border-gray-200 px-5 py-3 text-sm focus:outline-none focus:border-gray-400 bg-white"
                />
                <button 
                  onClick={handleSubscribe}
                  className="bg-gray-900 text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-black transition-all min-w-32">
                  {subscribed ? 'Subscribed!' : 'Subscribe'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  )
}

export default Blog
