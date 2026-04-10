import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, MapPin, Zap, MessageSquare, BarChart3, Plus, ArrowRight, TrendingUp, Users, DollarSign, Signal } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageWrapper, PageContainer } from '../../components/layout/PageWrapper'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { stations } from '../../mock/stations'
import { chargers } from '../../mock/chargers'
import { reviews } from '../../mock/reviews'
import { formatINR } from '../../utils/formatCurrency'

const REVENUE_DATA = [
  { day: 'Mon', revenue: 4200 },
  { day: 'Tue', revenue: 3800 },
  { day: 'Wed', revenue: 5100 },
  { day: 'Thu', revenue: 4900 },
  { day: 'Fri', revenue: 6200 },
  { day: 'Sat', revenue: 8400 },
  { day: 'Sun', revenue: 7900 },
]

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const myStations = stations.slice(0, 2) // Mock first 2 as owned
  const myChargers = chargers.filter(c => myStations.some(s => s.id === c.stationId))
  const myReviews = reviews.filter(r => myStations.some(s => s.id === r.stationId))

  useEffect(() => {
    document.title = 'Owner Dashboard — ChargeNet'
  }, [])

  const stats = [
    { label: 'Total Revenue', value: '₹40,500', sub: '+12% from last week', icon: DollarSign, color: 'text-success' },
    { label: 'Active Sessions', value: '8', sub: 'Across 2 stations', icon: Zap, color: 'text-accent' },
    { label: 'Avg. Rating', value: '4.8', sub: '32 new reviews', icon: TrendingUp, color: 'text-warning' },
    { label: 'Utilization', value: '74%', sub: '+5% Peak hours', icon: BarChart3, color: 'text-primary' },
  ]

  return (
    <PageWrapper>
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Owner Dashboard</h1>
            <p className="text-sm text-muted mt-1">Manage your charging network and track performance.</p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => navigate('/owner/stations')}>
            Add New Station
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted font-medium uppercase tracking-wider">{s.label}</p>
                <div className={`p-2 rounded-lg bg-background border border-border ${s.color}`}>
                  <s.icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-primary">{s.value}</p>
              <p className="text-xs text-success font-medium mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-primary">Revenue Overview</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="px-3 h-8 text-[11px]">7 Days</Button>
                <Button variant="ghost" size="sm" className="px-3 h-8 text-[11px]">30 Days</Button>
              </div>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F766E" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716C' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716C' }} tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E7E5E4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0F766E', fontSize: '13px', fontWeight: '500' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0F766E" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Status / Notifications */}
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-xl p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 className="text-sm font-semibold text-primary mb-4">Network Health</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Signal size={16} className="text-success" />
                    <span className="text-xs text-muted">Stations Online</span>
                  </div>
                  <span className="text-xs font-semibold text-primary">2/2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-accent" />
                    <span className="text-xs text-muted">Chargers Working</span>
                  </div>
                  <span className="text-xs font-semibold text-primary">5/6</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-warning" />
                    <span className="text-xs text-muted">Active Sessions</span>
                  </div>
                  <span className="text-xs font-semibold text-primary">8</span>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-primary">Recent Activity</h2>
                <Link to="/owner/reviews" className="text-[10px] text-accent hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {myReviews.slice(0, 3).map(r => (
                  <div key={r.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-semibold flex-shrink-0">
                      {r.reviewerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] text-primary leading-tight"><span className="font-semibold">{r.reviewerName}</span> left a {r.rating}<Star size={10} className="inline-block ml-0.5 fill-amber-400 text-amber-400 mb-0.5" /> review</p>
                      <p className="text-[10px] text-muted mt-0.5 mt-1 line-clamp-1 italic">"{r.text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stations Table / List */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-8" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-primary">Your Stations</h2>
            <Link to="/owner/stations" className="text-sm text-accent flex items-center gap-1 hover:underline">
              Manage All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-background/50 text-[11px] font-medium text-muted uppercase tracking-wider">
                  <th className="px-6 py-3">Station Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Chargers</th>
                  <th className="px-6 py-3">Today's Revenue</th>
                  <th className="px-6 py-3">Utilization</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myStations.map(st => (
                  <tr key={st.id} className="text-sm hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-primary">{st.name}</p>
                      <p className="text-xs text-muted flex items-center gap-1 mt-0.5 tracking-tight">
                        <MapPin size={10} /> {st.city}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={st.status} label={st.status.charAt(0).toUpperCase() + st.status.slice(1)} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-primary font-medium">{st.availableChargers}/{st.totalChargers}</p>
                      <p className="text-[10px] text-muted font-medium">Available</p>
                    </td>
                    <td className="px-6 py-4 text-primary font-medium">
                      {formatINR(st.id === 'st-001' ? 8200 : 6400)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 w-16 bg-background rounded-full overflow-hidden border border-border">
                          <div className={`h-full bg-accent`} style={{ width: st.id === 'st-001' ? '82%' : '65%' }} />
                        </div>
                        <span className="text-xs text-muted">{st.id === 'st-001' ? '82%' : '65%'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/owner/stations?id=${st.id}`)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
