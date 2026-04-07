import React, { useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Download, Calendar, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { PageWrapper, PageContainer } from '../../components/layout/PageWrapper'
import { Button } from '../../components/common/Button'

const REVENUE_DATA = [
  { month: 'Jan', current: 45000, lastYear: 38000 },
  { month: 'Feb', current: 52000, lastYear: 41000 },
  { month: 'Mar', current: 48000, lastYear: 42000 },
  { month: 'Apr', current: 61000, lastYear: 45000 },
]

const UTIL_DATA = [
  { time: '00:00', value: 12 },
  { time: '04:00', value: 8 },
  { time: '08:00', value: 45 },
  { time: '12:00', value: 82 },
  { time: '16:00', value: 94 },
  { time: '20:00', value: 68 },
]

const PLUG_DATA = [
  { name: 'CCS2', value: 65 },
  { name: 'Type 2', value: 25 },
  { name: 'CHAdeMO', value: 10 },
]

const COLORS = ['#0F766E', '#0D9488', '#5EEAD4']

export default function Analytics() {
  useEffect(() => {
    document.title = 'Analytics — ChargeNet'
  }, [])

  return (
    <PageWrapper>
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Network Analytics</h1>
            <p className="text-sm text-muted mt-1">Deep dive into your station performance and user trends.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={Calendar}>Apr 2025</Button>
            <Button variant="primary" size="sm" icon={Download}>Export PDF</Button>
          </div>
        </div>

        {/* Growth Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {[
                { label: 'Total Revenue', value: '₹2,45,800', change: '+18.2%', up: true },
                { label: 'Total Sessions', value: '1,248', change: '+5.4%', up: true },
                { label: 'Energy Delivered', value: '14.2 MWh', change: '-2.1%', up: false },
            ].map(s => (
                <div key={s.label} className="bg-surface border border-border rounded-xl p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">{s.label}</p>
                    <div className="flex items-end gap-3 mt-2">
                        <p className="text-2xl font-semibold text-primary">{s.value}</p>
                        <div className={`flex items-center gap-0.5 text-xs font-semibold pb-1 ${s.up ? 'text-success' : 'text-danger'}`}>
                            {s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {s.change}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Trend */}
            <div className="bg-surface border border-border rounded-xl p-6" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-primary">Revenue vs Last Year</h2>
                    <TrendingUp size={18} className="text-muted" />
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={REVENUE_DATA}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716C' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716C' }} tickFormatter={v => `₹${v/1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E7E5E4' }}
                                cursor={{ fill: '#F5F5F4' }}
                            />
                            <Bar dataKey="current" fill="#0F766E" radius={[4, 4, 0, 0]} barSize={32} />
                            <Bar dataKey="lastYear" fill="#E7E5E4" radius={[4, 4, 0, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Utilization By Time */}
            <div className="bg-surface border border-border rounded-xl p-6" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <h2 className="text-base font-semibold text-primary mb-6">Average Utilization By Time</h2>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={UTIL_DATA}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716C' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716C' }} tickFormatter={v => `${v}%`} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E7E5E4' }} />
                            <Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={3} dot={{ r: 4, fill: '#0F766E' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Plug Type Distribution */}
            <div className="bg-surface border border-border rounded-xl p-6" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <h2 className="text-base font-semibold text-primary mb-6">Plug Usage</h2>
                <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={PLUG_DATA}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {PLUG_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <p className="text-2xl font-bold text-primary">65%</p>
                        <p className="text-[10px] text-muted uppercase">CCS2 Heavy</p>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    {PLUG_DATA.map((d, i) => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                                <span className="text-muted">{d.name}</span>
                            </div>
                            <span className="font-semibold text-primary">{d.value}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Performing Stations */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <h2 className="text-base font-semibold text-primary mb-6">Top Stations by Revenue</h2>
                <div className="space-y-6">
                    {[
                        { name: 'Bengaluru Koramangala', val: 82400, pct: 92 },
                        { name: 'Pune Hinjewadi', val: 64200, pct: 81 },
                        { name: 'Mumbai BKC', val: 58900, pct: 76 },
                    ].map(s => (
                        <div key={s.name}>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-medium text-primary">{s.name}</span>
                                <span className="text-accent font-semibold">₹{s.val.toLocaleString()}</span>
                            </div>
                            <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border">
                                <div className="h-full bg-accent" style={{ width: `${s.pct}%` }} />
                            </div>
                            <p className="text-[10px] text-muted mt-1.5">{s.pct}% utilization during peak</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
