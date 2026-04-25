import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/layout/Navbar'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, signOut, refreshUser } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url)
    }
  }, [user])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id, status, booking_date,
            booking_time, duration_minutes,
            estimated_cost, created_at,
            station_id,
            stations ( name, city, slug ),
            slots ( connector_type, power_kw )
          `)
          .eq('user_id', user.id)
          .order('created_at', { 
            ascending: false 
          })
          .limit(20)
        
        if (error) {
          console.error('Dashboard bookings error:', error)
        } else {
          setBookings(data || [])
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      // 1. Upload to Supabase Storage (Assumes 'avatars' bucket exists)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
        
      console.log('[Dashboard] New avatar public URL:', publicUrl)

      // 3. Update User Metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) throw updateError
      
      // Update local state for immediate feedback
      setAvatarUrl(publicUrl)
      
      // Force refresh the global user state
      await refreshUser()
      
      // Note: useAuth will pick up the changes via onAuthStateChange listener
    } catch (err) {
      console.error('Error uploading avatar:', err)
      alert(`Upload failed: ${err.message || 'Unknown error'}. Check if you have Storage RLS policies set for the "avatars" bucket.`)
    } finally {
      setUploading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const cancelBooking = async (id) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
    if (!error) {
      setBookings(prev => prev.map(b =>
        b.id === id 
          ? { ...b, status: 'cancelled' }
          : b
      ))
    }
  }

  const confirmed = bookings.filter(
    b => b.status === 'confirmed'
  )
  const cancelled = bookings.filter(
    b => b.status === 'cancelled'
  )
  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => 
      sum + parseFloat(b.estimated_cost || 0)
    , 0)

  const filtered = 
    activeTab === 'active' ? confirmed
    : activeTab === 'cancelled' ? cancelled
    : bookings

  const firstName = (
    user?.user_metadata?.full_name 
    || user?.email?.split('@')[0] 
    || 'User'
  ).split(' ')[0]

  const initials = (
    user?.user_metadata?.full_name 
    || user?.email || 'U'
  ).charAt(0).toUpperCase()

  const memberSince = user?.created_at
    ? new Date(user.created_at)
        .toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric'
        })
    : ''

  if (loading) return (
    <div className="min-h-screen bg-white 
      flex items-center justify-center">
      <div className="w-4 h-4 border 
        border-gray-200 border-t-gray-900 
        rounded-full animate-spin">
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar solid={true} />

      {/* ── HERO HEADER ── */}
      <div className="bg-white border-b border-gray-100 mt-[72px] lg:mt-[80px]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            
            {/* User info */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div 
                onClick={handleAvatarClick}
                className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center text-lg font-light flex-shrink-0 cursor-pointer overflow-hidden relative group rounded-full">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                
                {uploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div>
                <h1 className="text-xl font-normal text-gray-900 tracking-tight">
                  {user?.user_metadata?.full_name || firstName}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs border border-gray-200 text-gray-500 px-2 py-0.5">
                    Free plan
                  </span>
                  <span className="text-xs text-gray-400">
                    Member since {memberSince}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link to="/map"
                className="text-xs border border-gray-200 text-gray-600 px-4 py-2 hover:border-gray-400 transition-colors">
                Find stations
              </Link>
              <Link to="/booking"
                className="text-xs bg-gray-900 text-white px-4 py-2 hover:bg-black transition-colors">
                Book a slot
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">

          {/* ── LEFT MAIN ── */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-200">
              {[
                { 
                  label: 'Total bookings',
                  value: bookings.length,
                  sub: 'all time'
                },
                { 
                  label: 'Active slots',
                  value: confirmed.length,
                  sub: 'upcoming'
                },
                { 
                  label: 'Total spent',
                  value: `₹${totalSpent.toFixed(0)}`,
                  sub: 'estimated'
                }
              ].map((stat, i) => (
                <div key={i} className="bg-white px-6 py-5">
                  <p className="text-xs text-gray-400 mb-3">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-light text-gray-900 tracking-tight mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-300">
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* Bookings card */}
            <div className="bg-white border border-gray-100">
              
              {/* Card header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-normal text-gray-900">
                  Bookings
                </h2>
                <Link to="/booking"
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  + New booking
                </Link>
              </div>

              {/* Tabs */}
              <div className="px-6 flex border-b border-gray-100">
                {[
                  { key: 'all', label: 'All', count: bookings.length },
                  { key: 'active', label: 'Active', count: confirmed.length },
                  { key: 'cancelled', label: 'Cancelled', count: cancelled.length }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-0 mr-6 py-3 text-xs transition-all border-b-2 -mb-px ${
                    activeTab === tab.key
                      ? 'border-gray-900 text-gray-900 font-medium'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}>
                    {tab.label}
                    {' '}
                    <span className={`${
                      activeTab === tab.key ? 'text-gray-900' : 'text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Booking list */}
              {filtered.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="w-10 h-10 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    {activeTab === 'active' ? 'No active bookings' : activeTab === 'cancelled' ? 'No cancelled bookings' : 'No bookings yet'}
                  </p>
                  {activeTab === 'all' && (
                    <>
                      <p className="text-xs text-gray-300 mb-5">
                        Find a station and book your first charging slot
                      </p>
                      <Link to="/map"
                        className="text-xs border border-gray-200 text-gray-600 px-5 py-2 hover:border-gray-400 transition-colors">
                        Browse stations
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filtered.map((b, i) => (
                    <div key={b.id || i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${b.status === 'confirmed' ? 'bg-gray-900' : 'bg-gray-300'}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <p className="text-sm text-gray-900 truncate">{b.stations?.name || 'Station'}</p>
                            <span className={`text-xs flex-shrink-0 ${b.status === 'confirmed' ? 'text-gray-400' : 'text-gray-300'}`}>{b.status}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-400">{b.stations?.city}</p>
                            {b.booking_date && (
                              <>
                                <span className="text-gray-200 text-xs">·</span>
                                <p className="text-xs text-gray-400">
                                  {new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  {b.booking_time && ` at ${b.booking_time}`}
                                </p>
                              </>
                            )}
                            {b.slots?.connector_type && (
                              <>
                                <span className="text-gray-200 text-xs">·</span>
                                <p className="text-xs text-gray-300">{b.slots.connector_type}{b.slots.power_kw && ` ${b.slots.power_kw}kW`}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                        <p className="text-sm text-gray-700">₹{parseFloat(b.estimated_cost || 0).toFixed(0)}</p>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {b.status === 'confirmed' && (
                            <button onClick={() => cancelBooking(b.id)} className="text-xs text-gray-300 hover:text-red-400 transition-colors">Cancel</button>
                          )}
                          <Link to={`/station/${b.stations?.slug || b.station_id}`} className="text-xs text-gray-300 hover:text-gray-700 transition-colors">View</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Your plan</p>
                <span className="text-xs border border-gray-200 text-gray-500 px-2 py-0.5">Free</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">Upgrade to Pro for priority booking, 10% off all sessions and premium support.</p>
              <Link to="/pricing" className="block w-full text-center text-xs bg-gray-900 text-white py-2.5 hover:bg-black transition-colors">Upgrade to Pro · ₹499/mo</Link>
            </div>

            <div className="bg-white border border-gray-100">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Quick actions</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { label: 'Find a station', desc: '154+ stations', href: '/map', icon: <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
                  { label: 'Book a slot', desc: 'Reserve your time', href: '/booking', icon: <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
                  { label: 'Charging guide', desc: 'Tips and tutorials', href: '/resources/charging-guide', icon: <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg> }
                ].map((item, i) => (
                  <Link key={i} to={item.href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                    <div className="flex-shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7"/></svg>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-100">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Account</p>
              </div>
              <div className="px-5 py-4 space-y-3">
                {[
                  { label: 'Email', value: user?.email },
                  { label: 'Plan', value: 'Free' },
                  { label: 'Member since', value: memberSince },
                  { label: 'Total bookings', value: bookings.length },
                  { label: 'Total spent', value: `₹${totalSpent.toFixed(2)}` }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{item.label}</span>
                    <span className="text-xs text-gray-700 text-right max-w-32 truncate">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-gray-100">
                <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Sign out of ChargeNet</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
