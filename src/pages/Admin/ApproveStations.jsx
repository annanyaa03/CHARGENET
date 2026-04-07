import React, { useState } from 'react'
import { CheckCircle2, XCircle, MapPin, Eye, Search, Filter, History, Info } from 'lucide-react'
import { PageWrapper, PageContainer } from '../../components/layout/PageWrapper'
import Button from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import { stations } from '../../mock/stations'
import toast from 'react-hot-toast'

export default function ApproveStations() {
  const [selectedStation, setSelectedStation] = useState(null)
  const [pendingOnly, setPendingOnly] = useState(true)
  const [activeStations, setActiveStations] = useState(stations)

  const filtered = pendingOnly 
    ? activeStations.filter(s => s.status === 'inactive')
    : activeStations

  const handleApprove = (id) => {
    setActiveStations(prev => prev.map(s => s.id === id ? { ...s, status: 'active' } : s))
    toast.success('Station approved and published!')
    setSelectedStation(null)
  }

  const handleReject = (id) => {
    setActiveStations(prev => prev.map(s => s.id === id ? { ...s, status: 'faulty' } : s))
    toast.error('Station submission rejected')
    setSelectedStation(null)
  }

  return (
    <PageWrapper noFooter>
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Station Approvals</h1>
            <p className="text-sm text-muted mt-1">Review new station submissions and verify details.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={pendingOnly ? 'primary' : 'ghost'} size="sm" onClick={() => setPendingOnly(true)}>Pending Only</Button>
            <Button variant={!pendingOnly ? 'primary' : 'ghost'} size="sm" onClick={() => setPendingOnly(false)}>All Submissions</Button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by station name, owner, or city..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <Button variant="outline" size="sm" icon={Filter} className="w-full sm:w-auto">Advanced Filter</Button>
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-8" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-background/50 text-[11px] font-medium text-muted uppercase tracking-wider">
                   <th className="px-6 py-3">Station Detail</th>
                   <th className="px-6 py-3">Owner Contact</th>
                   <th className="px-6 py-3">Submitted On</th>
                   <th className="px-6 py-3">Status</th>
                   <th className="px-6 py-3 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {filtered.map(st => (
                   <tr key={st.id} className="text-sm hover:bg-background/50 transition-colors">
                     <td className="px-6 py-4">
                       <p className="font-semibold text-primary">{st.name}</p>
                       <p className="text-xs text-muted flex items-center gap-1 mt-0.5 tracking-tight">
                         <MapPin size={10} /> {st.city}
                       </p>
                     </td>
                     <td className="px-6 py-4">
                       <p className="font-medium text-primary">TP Power EZ</p>
                       <p className="text-xs text-muted">admin@tp-power.in</p>
                     </td>
                     <td className="px-6 py-4 text-muted text-xs">
                       Apr 02, 2025
                     </td>
                     <td className="px-6 py-4">
                       <Badge variant={st.status} label={st.status.charAt(0).toUpperCase() + st.status.slice(1)} />
                     </td>
                     <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setSelectedStation(st)}>Review</Button>
                         {st.status === 'inactive' && (
                            <>
                                <button className="p-1.5 rounded-lg text-success hover:bg-success/5 transition-colors" onClick={() => handleApprove(st.id)}>
                                    <CheckCircle2 size={18} />
                                </button>
                                <button className="p-1.5 rounded-lg text-danger hover:bg-danger/5 transition-colors" onClick={() => handleReject(st.id)}>
                                    <XCircle size={18} />
                                </button>
                            </>
                         )}
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           {filtered.length === 0 && (
                <div className="text-center py-20">
                    <History size={40} className="text-border mx-auto mb-4" />
                    <p className="text-sm font-medium text-primary">No pending approvals</p>
                    <p className="text-xs text-muted mt-1">You're all caught up!</p>
                </div>
           )}
        </div>

        {/* Review Modal */}
        <Modal isOpen={!!selectedStation} onClose={() => setSelectedStation(null)} title="Station Verification" maxWidth="max-w-2xl">
            {selectedStation && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] text-muted font-bold uppercase mb-1 block">Station Name</label>
                            <p className="text-sm font-medium text-primary">{selectedStation.name}</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-muted font-bold uppercase mb-1 block">City / Area</label>
                            <p className="text-sm font-medium text-primary">{selectedStation.city}</p>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] text-muted font-bold uppercase mb-1 block">Full Address</label>
                            <p className="text-sm font-medium text-primary">{selectedStation.address}</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-muted font-bold uppercase mb-1 block">Operating Hours</label>
                            <p className="text-sm font-medium text-primary">{selectedStation.openHours}</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-muted font-bold uppercase mb-1 block">Total Chargers</label>
                            <p className="text-sm font-medium text-primary">{selectedStation.totalChargers} Units</p>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex gap-3">
                        <Info size={18} className="text-[#1D4ED8] flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-[#1D4ED8] mb-1">Verification Check</p>
                            <p className="text-[11px] text-[#1D4ED8]/80 leading-relaxed">Owner has provided electricity bill and property ownership certificates. GPS coordinates verified with photo evidence.</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="danger" fullWidth onClick={() => handleReject(selectedStation.id)}>Reject Submission</Button>
                        <Button variant="success" fullWidth onClick={() => handleApprove(selectedStation.id)}>Approve & Publish</Button>
                    </div>
                </div>
            )}
        </Modal>
      </PageContainer>
    </PageWrapper>
  )
}
