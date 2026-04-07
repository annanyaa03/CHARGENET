import React, { useState } from 'react'
import { Plus, Search, Zap, Edit, Trash2, Power, Settings, Filter } from 'lucide-react'
import { PageWrapper, PageContainer } from '../../components/layout/PageWrapper'
import { Button } from '../../components/common/Button'
import { Badge, PlugBadge } from '../../components/common/Badge'
import { chargers } from '../../mock/chargers'
import { stations } from '../../mock/stations'
import toast from 'react-hot-toast'

export default function ManageChargers() {
  const [activeChargers, setActiveChargers] = useState(chargers.slice(0, 8)) // Mocking owned chargers
  const [selectedStation, setSelectedStation] = useState('all')

  const handleToggleStatus = (id) => {
    setActiveChargers(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'active' ? 'inactive' : 'active'
        toast.success(`Charger ${c.id} is now ${nextStatus}`)
        return { ...c, status: nextStatus }
      }
      return c
    }))
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this charger?')) {
      setActiveChargers(prev => prev.filter(c => c.id !== id))
      toast.success('Charger deleted successfully')
    }
  }

  return (
    <PageWrapper>
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Manage Chargers</h1>
            <p className="text-sm text-muted mt-1">Configure individual chargers and monitor status.</p>
          </div>
          <Button variant="primary" icon={Plus}>Add Charger</Button>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="text-xs text-muted font-medium mb-1.5 block">Filter by Station</label>
            <select
              className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 text-primary focus:outline-none focus:border-accent"
              value={selectedStation}
              onChange={e => setSelectedStation(e.target.value)}
            >
              <option value="all">All Stations</option>
              {stations.slice(0, 2).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted font-medium mb-1.5 block">Search by Serial or Type</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search chargers..."
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeChargers.map(charger => (
            <div key={charger.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col hover:border-accent transition-colors" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center text-accent">
                  <Zap size={20} />
                </div>
                <Badge variant={charger.status} label={charger.status.charAt(0).toUpperCase() + charger.status.slice(1)} />
              </div>
              <h3 className="text-sm font-semibold text-primary truncate mb-1">ID: {charger.id}</h3>
              <p className="text-[11px] text-muted mb-4 truncate italic">{stations.find(s => s.id === charger.stationId)?.name}</p>

              <div className="space-y-2 mb-6 flex-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Type</span>
                  <PlugBadge plugType={charger.plugType} />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Power</span>
                  <span className="font-medium text-primary">{charger.powerKw} kW</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Price</span>
                  <span className="font-medium text-primary">₹{charger.pricePerKwh}/unit</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <button className="flex-1 text-xs font-medium text-muted hover:text-primary transition-colors flex items-center justify-center gap-2" onClick={() => handleToggleStatus(charger.id)}>
                  <Power size={14} /> {charger.status === 'active' ? 'Off' : 'On'}
                </button>
                <div className="w-px h-4 bg-border"></div>
                <button className="flex-1 text-xs font-medium text-muted hover:text-primary transition-colors flex items-center justify-center gap-2">
                  <Settings size={14} /> Config
                </button>
                <div className="w-px h-4 bg-border"></div>
                <button className="flex-1 text-xs font-medium text-muted hover:text-danger transition-colors flex items-center justify-center gap-2" onClick={() => handleDelete(charger.id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
