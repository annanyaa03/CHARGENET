import React, { useState } from 'react'
import { Plus, Search, Filter, Mail, User, Shield, Trash2, Edit, MoreVertical, Ban, CheckCircle } from 'lucide-react'
import { PageWrapper, PageContainer } from '../../components/layout/PageWrapper'
import Button from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import toast from 'react-hot-toast'

const MOCK_USERS = [
  { id: 'u-1', name: 'Arjun Sharma', email: 'arjun@example.com', role: 'driver', status: 'active', joined: '2025-01-12', evModel: 'Tata Nexon EV' },
  { id: 'u-2', name: 'Priya Patel', email: 'priya@chargenet.in', role: 'owner', status: 'active', joined: '2025-02-05', stations: 3 },
  { id: 'u-3', name: 'Vikram Singh', email: 'vikram@admin.in', role: 'admin', status: 'active', joined: '2024-11-20' },
  { id: 'u-4', name: 'Rohan Mehra', email: 'rohan@blocked.com', role: 'driver', status: 'inactive', joined: '2025-03-22', evModel: 'MG ZS EV' },
  { id: 'u-5', name: 'Ananya Rao', email: 'ananya@example.com', role: 'driver', status: 'active', joined: '2025-04-01', evModel: 'Hyundai Kona' },
]

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeUsers, setActiveUsers] = useState(MOCK_USERS)

  const handleToggleStatus = (id) => {
    setActiveUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'active' ? 'inactive' : 'active'
        toast.success(`User account is now ${nextStatus}`)
        return { ...u, status: nextStatus }
      }
      return u
    }))
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action is permanent.')) {
      setActiveUsers(prev => prev.filter(u => u.id !== id))
      toast.success('User account deleted permanently')
    }
  }

  const filtered = activeUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageWrapper noFooter>
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Manage Users</h1>
            <p className="text-sm text-muted mt-1">Control user roles, permissions, and account status platform-wide.</p>
          </div>
          <Button variant="primary" icon={Plus}>Add New User</Button>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-primary focus:outline-none focus:border-accent"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" icon={Filter} className="w-full sm:w-auto">Advanced Filter</Button>
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-8" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-background/50 text-[11px] font-medium text-muted uppercase tracking-wider">
                   <th className="px-6 py-3">User Detail</th>
                   <th className="px-6 py-3">Role</th>
                   <th className="px-6 py-3">Joined On</th>
                   <th className="px-6 py-3">Account Status</th>
                   <th className="px-6 py-3 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {filtered.map(u => (
                   <tr key={u.id} className="text-sm hover:bg-background/50 transition-colors">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-semibold flex-shrink-0">
                           {u.name.charAt(0)}
                         </div>
                         <div>
                           <p className="font-semibold text-primary mb-0.5">{u.name}</p>
                           <p className="text-xs text-muted flex items-center gap-1">
                             <Mail size={10} /> {u.email}
                           </p>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5 capitalize text-xs font-medium text-primary">
                         {u.role === 'admin' ? <Shield size={12} className="text-accent" /> : <User size={12} className="text-muted" />}
                         {u.role}
                       </div>
                     </td>
                     <td className="px-6 py-4 text-muted text-xs">
                       {u.joined}
                     </td>
                     <td className="px-6 py-4">
                       <Badge variant={u.status === 'active' ? 'active' : 'inactive'} label={u.status.charAt(0).toUpperCase() + u.status.slice(1)} />
                     </td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 rounded-lg text-muted hover:text-primary hover:bg-background transition-colors" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className={`p-2 rounded-lg transition-colors ${u.status === 'active' ? 'text-danger hover:bg-danger/5' : 'text-success hover:bg-success/5'}`} title={u.status === 'active' ? 'Deactivate' : 'Activate'} onClick={() => handleToggleStatus(u.id)}>
                            {u.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/5 transition-colors" title="Delete" onClick={() => handleDelete(u.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           {filtered.length === 0 && (
                <div className="text-center py-20">
                    <User size={40} className="text-border mx-auto mb-4" />
                    <p className="text-sm font-medium text-primary">No users found</p>
                    <p className="text-xs text-muted mt-1">Try another search term or filter.</p>
                </div>
           )}
        </div>

        {/* Roles Summary Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
                { label: 'Admin Users', val: 3, icon: Shield, color: 'text-accent' },
                { label: 'Station Owners', val: 42, icon: MapPin, color: 'text-success' },
                { label: 'EV Drivers', val: 2795, icon: User, color: 'text-primary' },
            ].map(s => (
                <div key={s.label} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <div className={`p-2 rounded-lg bg-background border border-border ${s.color}`}>
                        <s.icon size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-muted font-medium mb-0.5">{s.label}</p>
                        <p className="text-lg font-bold text-primary leading-tight">{s.val}</p>
                    </div>
                </div>
            ))}
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
