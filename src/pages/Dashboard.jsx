import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/layout/Navbar'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bookings')

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        const { data: bookingsData, error } = await supabase
            .from('bookings')
            .select(`
              id,
              status,
              booking_date,
              booking_time,
              duration_minutes,
              estimated_cost,
              created_at,
              stations ( name, city, address, slug ),
              slots ( connector_type, power_kw )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)
        
        if (error) {
          console.error('Dashboard bookings error:', error)
          const { data: simpleData } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
          setBookings(simpleData || [])
        } else {
          setBookings(bookingsData || [])
        }
      } catch (err) {
        console.error('Dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchBookings()
    } else {
      setLoading(false)
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const cancelBooking = async (bookingId) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
    
    if (!error) {
      setBookings(prev => prev.map(b =>
        b.id === bookingId 
          ? { ...b, status: 'cancelled' }
          : b
      ))
    }
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled')
  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + parseFloat(b.estimated_cost || 0), 0)

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-5 h-5 border border-gray-200 border-t-gray-900 rounded-full animate-spin">
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar solid={true} />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-10">

        {/* ── HEADER ── */}
        <div className="grid grid-cols-12 gap-8 pb-8 mb-8 border-b border-gray-100">
          
          {/* Left - User info */}
          <div className="col-span-8">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              Dashboard
            </p>
            <h1 className="text-3xl font-normal text-gray-900 tracking-tight mb-1">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </h1>
            <p className="text-sm text-gray-400">
              {user?.email}
            </p>
          </div>

          {/* Right - Actions */}
          <div className="col-span-4 flex items-start justify-end gap-3 pt-2">
            <Link to="/map"
              className="text-xs bg-gray-900 text-white px-5 py-2.5 hover:bg-black transition-colors">
              Find stations
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs border border-gray-200 text-gray-400 px-5 py-2.5 hover:border-gray-400 hover:text-gray-600 transition-colors">
              Sign out
            </button>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-4 gap-px bg-gray-100 mb-10">
          {[
            { 
              label: 'Total bookings',
              value: bookings.length,
              sub: 'all time'
            },
            { 
              label: 'Active bookings',
              value: confirmedBookings.length,
              sub: 'upcoming'
            },
            { 
              label: 'Total spent',
              value: `₹${totalSpent.toFixed(0)}`,
              sub: 'estimated'
            },
            { 
              label: 'Plan',
              value: 'Free',
              sub: (
                <Link to="/pricing"
                  className="text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2">
                  Upgrade
                </Link>
              )
            }
          ].map((stat, i) => (
            <div key={i} className="bg-white px-6 py-5">
              <p className="text-xs text-gray-400 mb-2">
                {stat.label}
              </p>
              <p className="text-2xl font-light text-gray-900 mb-0.5 tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-gray-300">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Left - Bookings */}
          <div className="col-span-8">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-6">
              {[
                { 
                  key: 'bookings', 
                  label: 'All bookings',
                  count: bookings.length
                },
                { 
                  key: 'active', 
                  label: 'Active',
                  count: confirmedBookings.length
                },
                { 
                  key: 'cancelled', 
                  label: 'Cancelled',
                  count: cancelledBookings.length
                }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-xs transition-all border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-gray-900 text-gray-900 font-medium'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}>
                  {tab.label}
                  <span className={`ml-1.5 text-xs ${
                    activeTab === tab.key ? 'text-gray-900' : 'text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Booking list */}
            {(() => {
              const filtered = 
                activeTab === 'active'
                  ? confirmedBookings
                  : activeTab === 'cancelled'
                  ? cancelledBookings
                  : bookings

              if (filtered.length === 0) return (
                <div className="py-16 text-center border border-gray-100">
                  <p className="text-sm text-gray-400 mb-2">
                    {activeTab === 'active'
                      ? 'No active bookings'
                      : activeTab === 'cancelled'
                      ? 'No cancelled bookings'
                      : 'No bookings yet'}
                  </p>
                  <p className="text-xs text-gray-300 mb-5">
                    {activeTab === 'bookings' && 'Find a station and book your first charging slot'}
                  </p>
                  {activeTab === 'bookings' && (
                    <Link to="/map"
                      className="text-xs bg-gray-900 text-white px-5 py-2.5 hover:bg-black transition-colors">
                      Find stations
                    </Link>
                  )}
                </div>
              )

              return (
                <div className="divide-y divide-gray-50">
                  {filtered.map((b, i) => (
                    <div key={b.id || i}
                      className="py-5 flex items-start justify-between group">
                      
                      {/* Left */}
                      <div className="flex items-start gap-4">
                        
                        {/* Status indicator */}
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                          b.status === 'confirmed' ? 'bg-gray-900' : 'bg-gray-300'
                        }`}></div>

                        <div>
                          <p className="text-sm font-normal text-gray-900 mb-1">
                            {b.stations?.name || 'Charging Station'}
                          </p>
                          <p className="text-xs text-gray-400 mb-0.5">
                            {b.stations?.city}
                            {b.booking_date && ` · ${new Date(b.booking_date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}`}
                            {b.booking_time && ` at ${b.booking_time}`}
                          </p>
                          <p className="text-xs text-gray-300">
                            {b.slots?.connector_type}
                            {b.slots?.power_kw && ` · ${b.slots.power_kw}kW`}
                            {b.duration_minutes && ` · ${b.duration_minutes} min`}
                          </p>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-700">
                            ₹{parseFloat(b.estimated_cost || 0).toFixed(2)}
                          </p>
                          <span className={`text-xs ${
                            b.status === 'confirmed' ? 'text-gray-500' : 'text-gray-300'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => cancelBooking(b.id)}
                            className="text-xs text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                            Cancel
                          </button>
                        )}
                        
                        {b.stations && (
                          <Link
                            to={`/station/${b.stations?.slug || b.station_id}`}
                            className="text-xs text-gray-300 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100">
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Right - Sidebar */}
          <div className="col-span-4 space-y-6">

            {/* Quick actions */}
            <div>
              <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest">
                Quick actions
              </p>
              <div className="space-y-2">
                {[
                  { 
                    label: 'Find a station',
                    desc: 'Browse 154+ stations',
                    href: '/map'
                  },
                  { 
                    label: 'Book a slot',
                    desc: 'Reserve charging time',
                    href: '/booking'
                  },
                  { 
                    label: 'Upgrade plan',
                    desc: 'Pro from ₹499/mo',
                    href: '/pricing'
                  }
                ].map((action, i) => (
                  <Link key={i} to={action.href}
                    className="flex items-center justify-between p-4 border border-gray-100 hover:border-gray-300 transition-colors group">
                    <div>
                      <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {action.desc}
                      </p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100">
            </div>

            {/* Account details */}
            <div>
              <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest">
                Account
              </p>
              <div className="space-y-3">
                {[
                  { 
                    label: 'Email',
                    value: user?.email
                  },
                  { 
                    label: 'Plan',
                    value: 'Free'
                  },
                  { 
                    label: 'Member since',
                    value: new Date(user?.created_at).toLocaleDateString('en-IN', {
                      month: 'long',
                      year: 'numeric'
                    })
                  },
                  {
                    label: 'Total bookings',
                    value: bookings.length
                  },
                  {
                    label: 'Total spent',
                    value: `₹${totalSpent.toFixed(2)}`
                  }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {item.label}
                    </span>
                    <span className="text-xs text-gray-700">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100">
            </div>

            {/* Danger zone */}
            <div>
              <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest">
                Session
              </p>
              <button
                onClick={handleSignOut}
                className="w-full text-left text-xs text-gray-400 border border-gray-100 px-4 py-3 hover:border-gray-300 hover:text-gray-600 transition-colors">
                Sign out of ChargeNet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
