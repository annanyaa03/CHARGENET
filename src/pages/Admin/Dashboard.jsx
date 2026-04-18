import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, MapPin, MessageSquare, AlertCircle, TrendingUp, Shield, Activity, ListChecks, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { PageWrapper, PageContainer } from '../../components/layout/PageWrapper'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { stations } from '../../mock/stations'
// import { reviews } from '../../mock/reviews'

const GROWTH_DATA = [
  { month: 'Jan', users: 1200, stations: 8 },
  { month: 'Feb', users: 1560, stations: 9 },
  { month: 'Mar', users: 2100, stations: 10 },
  { month: 'Apr', users: 2840, stations: 10 },
]

export default function AdminDashboard() {
  const pendingStations = stations.filter(s => s.status === 'inactive').length

  useEffect(() => {
    document.title = 'Admin Dashboard — ChargeNet'
  }, [])

  const stats = [
    { label: 'Total Users', value: '2,840', sub: '+12% this month', icon: Users, color: 'text-accent' },
    { label: 'Active Stations', value: '10', sub: '+1 pending approval', icon: MapPin, color: 'text-success' },
    { label: 'Flagged Reviews', value: '14', sub: 'Action required', icon: MessageSquare, color: 'text-danger' },
    { label: 'System Health', value: '99.9%', sub: 'All systems normal', icon: Activity, color: 'text-primary' },
  ]

  return (
    <PageWrapper>
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Admin Control Center</h1>
            <p className="text-sm text-muted mt-1">Global overview and management of the ChargeNet platform.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={Shield}>System Logs</Button>
            <Button variant="primary" size="sm" icon={LayoutDashboard}>Manage Roles</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-muted font-medium uppercase tracking-wider">{s.label}</p>
                <div className={`p-2 rounded-lg bg-background border border-border ${s.color}`}>
                  <s.icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-primary">{s.value}</p>
              <p className={`text-xs font-medium mt-1 ${s.label === 'Flagged Reviews' ? 'text-danger' : 'text-success'}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Platform Growth */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-primary">User & Station growth</h2>
              <TrendingUp size={18} className="text-muted" />
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={GROWTH_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716C' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716C' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E7E5E4' }}
                  />
                  <Line type="monotone" dataKey="users" stroke="#0F766E" strokeWidth={3} dot={{ r: 4, fill: '#0F766E' }} />
                  <Line type="monotone" dataKey="stations" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-surface border border-border rounded-xl p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold text-primary">Pending Approvals</h2>
                <Badge variant="warning" label={`${pendingStations} New`} />
            </div>
            <div className="space-y-4">
                {stations.filter(s => s.status === 'inactive').slice(0, 3).map(st => (
                    <div key={st.id} className="p-3 bg-background border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-primary truncate pr-2">{st.name}</p>
                            <span className="text-[10px] text-muted uppercase">STation</span>
                        </div>
                        <p className="text-[10px] text-muted mb-3 italic">{st.city}</p>
                        <div className="flex gap-2">
                            <Button variant="primary" size="sm" className="h-7 text-[10px] flex-1 px-0">Approve</Button>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] flex-1 px-0">Reject</Button>
                        </div>
                    </div>
                ))}
                <Link to="/admin/stations" className="text-xs text-accent font-medium mt-4 block text-center hover:underline">
                    View all approvals <ArrowRight size={12} className="inline ml-1" />
                </Link>
            </div>
          </div>
        </div>

        {/* Global Activity Feed */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-8" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-base font-semibold text-primary">Platform Activity</h2>
                <Button variant="ghost" size="sm" icon={ListChecks}>Mark all as read</Button>
            </div>
            <div className="p-6 space-y-6">
                {[
                    { at: '2m ago', icon: Users, text: 'New user registered', sub: 'Arjun S. (Driver)', color: 'text-accent' },
                    { at: '15m ago', icon: AlertCircle, text: 'Review reported for moderation', sub: 'Station: BKC EV Mumbai', color: 'text-danger' },
                    { at: '1h ago', icon: MapPin, text: 'New station listing submitted', sub: 'Owner: TP Power EZ', color: 'text-success' },
                    { at: '3h ago', icon: Shield, text: 'Admin security audit completed', sub: 'Platform Sec.', color: 'text-primary' },
                ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                        <div className={`w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center flex-shrink-0 ${item.color}`}>
                            <item.icon size={16} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                                <p className="text-sm font-medium text-primary">{item.text}</p>
                                <span className="text-[10px] text-muted tracking-tight">{item.at}</span>
                            </div>
                            <p className="text-xs text-muted leading-tight">{item.sub}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
