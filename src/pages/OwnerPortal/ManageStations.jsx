import React, { useState } from 'react'
import { Plus, Search, MapPin, Edit, Trash2, Eye, ExternalLink, Filter } from 'lucide-react'
import { PageWrapper, PageContainer } from '../../components/layout/PageWrapper'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Badge } from '../../components/common/Badge'
import { stations } from '../../mock/stations'
import toast from 'react-hot-toast'

export default function ManageStations() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeStations, setActiveStations] = useState(stations.slice(0, 5)) // Mocking owned stations

  const handleToggleStatus = (id) => {
    setActiveStations(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'active' ? 'inactive' : 'active'
        toast.success(`Station ${s.name} is now ${nextStatus}`)
        return { ...s, status: nextStatus }
      }
      return s
    }))
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this station? This will also remove all its chargers.')) {
      setActiveStations(prev => prev.filter(s => s.id !== id))
      toast.success('Station deleted successfully')
    }
  }

  return (
    <PageWrapper>
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Manage Stations</h1>
            <p className="text-sm text-muted mt-1">Add, edit, and track your charging station locations.</p>
          </div>
          <Button variant="primary" icon={Plus}>Add Station</Button>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by name or location..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-primary focus:outline-none focus:border-accent"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" icon={Filter} className="w-full sm:w-auto">Filter</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeStations.map(station => (
            <div key={station.id} className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div className="h-32 bg-[#E7F0EE] flex items-center justify-center relative">
                <MapPin size={32} className="text-accent/40" />
                <div className="absolute top-3 right-3">
                  <Badge variant={station.status} label={station.status.charAt(0).toUpperCase() + station.status.slice(1)} />
                </div>
              </div>
              <div className="p-5 flex-1">
                <h3 className="text-base font-semibold text-primary mb-1 line-clamp-1">{station.name}</h3>
                <p className="text-xs text-muted flex items-center gap-1 mb-4">
                  <MapPin size={12} /> {station.city}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-background rounded-lg p-2 text-center border border-border">
                    <p className="text-[10px] text-muted uppercase font-medium">Chargers</p>
                    <p className="text-sm font-semibold text-primary">{station.totalChargers}</p>
                  </div>
                  <div className="bg-background rounded-lg p-2 text-center border border-border">
                    <p className="text-[10px] text-muted uppercase font-medium">Daily Avg</p>
                    <p className="text-sm font-semibold text-primary">₹5.2k</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="p-2 h-9 w-9"><Edit size={14} /></Button>
                        <Button variant="outline" size="sm" className="p-2 h-9 w-9 text-danger hover:bg-danger/5" onClick={() => handleDelete(station.id)}><Trash2 size={14} /></Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-accent" onClick={() => handleToggleStatus(station.id)}>
                      {station.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                </div>
              </div>
            </div>
          ))}
          
          <button className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-accent/40 hover:bg-accent/5 transition-all group">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center group-hover:border-accent/40 group-hover:bg-white transition-all">
                <Plus size={24} className="text-muted group-hover:text-accent" />
            </div>
            <p className="text-sm font-medium text-muted group-hover:text-primary">Add another station</p>
          </button>
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
