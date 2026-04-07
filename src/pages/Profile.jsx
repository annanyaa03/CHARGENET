import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Star, Bookmark, BarChart3, Edit3, Download, Car, Mail } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { useAuthStore } from '../store/authStore'
import { stations } from '../mock/stations'
import { reviews } from '../mock/reviews'
import { formatINR } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatTime'

const TABS = ['My Bookings', 'My Reviews', 'Saved Stations', 'Spending']

const MOCK_BOOKINGS = [
  { id: 'bk-001', station: 'Bengaluru Koramangala Charge Point', charger: 'ChargeZone CCS2 150kW', date: '2025-04-05', time: '10:00 – 11:00', cost: 345, status: 'upcoming' },
  { id: 'bk-002', station: 'Nagpur Central Charging Hub', charger: 'Tata Power EZ Charge CCS2', date: '2025-03-28', time: '14:00 – 15:30', cost: 486, status: 'completed' },
  { id: 'bk-003', station: 'Pune Hinjewadi Tech Park Charger', charger: 'Statiq CCS2 50kW', date: '2025-03-15', time: '09:00 – 09:30', cost: 144, status: 'completed' },
  { id: 'bk-004', station: 'Mumbai BKC EV Station', charger: 'Tata Power 150kW', date: '2025-03-01', time: '18:30 – 19:00', cost: 198, status: 'cancelled' },
]

const SPENDING_DATA = [
  { month: 'Nov', amount: 680 },
  { month: 'Dec', amount: 920 },
  { month: 'Jan', amount: 1140 },
  { month: 'Feb', amount: 860 },
  { month: 'Mar', amount: 1280 },
  { month: 'Apr', amount: 345 },
]

export default function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    document.title = 'My Profile — ChargeNet'
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated])

  const savedStations = stations.filter(s => user?.savedStations?.includes(s.id))
  const myReviews = reviews.filter(r => r.reviewerName === user?.name)

  const totalSpend = SPENDING_DATA.reduce((a, b) => a + b.amount, 0)
  const totalKwh = (totalSpend / 18).toFixed(0)

  if (!user) return null

  return (
    <PageWrapper>
      <PageContainer>
        <h1 className="text-xl font-semibold text-primary mb-6">My Profile</h1>

        {/* User Card */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
             style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-semibold flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-primary">{user.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted">
              <span className="flex items-center gap-1"><Mail size={13} />{user.email}</span>
              {user.evModel && <span className="flex items-center gap-1"><Car size={13} />{user.evModel}</span>}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 bg-[#F0FDFA] text-accent border border-[#99F6E4] rounded-full font-medium capitalize">{user.role}</span>
              <span className="text-xs text-muted">Wallet: <span className="text-primary font-medium">{formatINR(user.walletBalance)}</span></span>
            </div>
          </div>
          <Button variant="outline" size="sm" icon={Edit3} onClick={() => {}}>Edit Profile</Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${i === activeTab ? 'tab-active' : 'tab-inactive'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 0 && (
          <div className="space-y-3">
            {MOCK_BOOKINGS.map(b => (
              <div key={b.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                   style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <div>
                  <p className="text-sm font-semibold text-primary">{b.station}</p>
                  <p className="text-xs text-muted mt-0.5">{b.charger}</p>
                  <p className="text-xs text-muted mt-1">{b.date} · {b.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-primary">{formatINR(b.cost)}</span>
                  <Badge variant={b.status === 'upcoming' ? 'active' : b.status === 'completed' ? 'neutral' : 'danger'}
                         label={b.status.charAt(0).toUpperCase() + b.status.slice(1)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 1 && (
          <div>
            {myReviews.length === 0 ? (
              <div className="text-center py-16">
                <Star size={32} className="text-border mx-auto mb-3" />
                <p className="text-sm text-muted">You haven't written any reviews yet.</p>
                <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate('/map')}>Find a Station</Button>
              </div>
            ) : (
              myReviews.map(r => (
                <div key={r.id} className="py-4 border-b border-border">
                  <p className="text-sm font-medium text-primary">{stations.find(s => s.id === r.stationId)?.name}</p>
                  <p className="text-xs text-muted">{formatDate(r.date)}</p>
                  <p className="text-sm text-muted mt-1">{r.text}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 2 && (
          <div>
            {savedStations.length === 0 ? (
              <div className="text-center py-16">
                <Bookmark size={32} className="text-border mx-auto mb-3" />
                <p className="text-sm text-muted">No saved stations yet.</p>
                <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate('/map')}>Explore Map</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedStations.map(st => (
                  <div key={st.id} className="bg-surface border border-border rounded-xl p-4 cursor-pointer hover:border-accent transition-colors"
                       onClick={() => navigate(`/station/${st.id}`)}
                       style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <p className="text-sm font-semibold text-primary">{st.name}</p>
                    <p className="text-xs text-muted mt-0.5">{st.city}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
                      <Star size={11} className="star-filled fill-current" />
                      <span>{st.rating} · {st.availableChargers}/{st.totalChargers} available</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Spent', value: formatINR(totalSpend), icon: BarChart3 },
                { label: 'Total kWh', value: `${totalKwh} kWh`, icon: User },
                { label: 'Sessions', value: '12', icon: Star },
              ].map(s => (
                <div key={s.label} className="bg-surface border border-border rounded-xl p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                  <p className="text-xs text-muted">{s.label}</p>
                  <p className="text-xl font-semibold text-primary mt-1">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface border border-border rounded-xl p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-primary">Monthly Spending</h3>
                <Button variant="ghost" size="sm" icon={Download} onClick={() => toast?.success?.('Invoice downloaded')}>
                  Invoice
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={SPENDING_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={v => [formatINR(v), 'Spent']} />
                  <Line type="monotone" dataKey="amount" stroke="#0F766E" strokeWidth={2} dot={{ fill: '#0F766E', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </PageContainer>
    </PageWrapper>
  )
}
