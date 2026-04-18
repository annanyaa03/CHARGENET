import React, { useState } from 'react'
import { Star, MessageSquare, Trash2, ShieldCheck, Search, Filter, AlertCircle, Eye, Info } from 'lucide-react'
import { PageWrapper, PageContainer } from '../../components/layout/PageWrapper'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { reviews } from '../../mock/reviews'
import { stations } from '../../mock/stations'
import { formatDate } from '../../utils/formatTime'
import toast from 'react-hot-toast'

export default function ModerateReviews() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterReported, setFilterReported] = useState(true)
  const [activeReviews, setActiveReviews] = useState(reviews.slice(0, 10)) // Mocking review list

  const handleIgnore = (id) => {
    setActiveReviews(prev => prev.filter(r => r.id !== id))
    toast.success('Report dismissed. Review remains published.')
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this review? This action cannot be undone.')) {
      setActiveReviews(prev => prev.filter(r => r.id !== id))
      toast.success('Review deleted from platform.')
    }
  }

  const filtered = activeReviews.filter(r => 
    r.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.text.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageWrapper noFooter>
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Content Moderation</h1>
            <p className="text-sm text-muted mt-1">Review flagged content and maintain community standards.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={filterReported ? 'primary' : 'ghost'} size="sm" onClick={() => setFilterReported(true)}>Flagged Only</Button>
            <Button variant={!filterReported ? 'primary' : 'ghost'} size="sm" onClick={() => setFilterReported(false)}>All Reviews</Button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by reviewer, content, or station..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-primary focus:outline-none focus:border-accent"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" icon={Filter} className="w-full sm:w-auto">Filter</Button>
        </div>

        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((review, i) => (
              <div key={review.id} className="bg-surface border border-border rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <div className="p-5">
                   <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-3">
                         <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-semibold flex-shrink-0">
                           {review.reviewerName.charAt(0)}
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-primary">{review.reviewerName}</h3>
                                {i < 3 && <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#FEF2F2] text-danger border border-[#FECACA] text-[10px] font-bold"><AlertCircle size={10} /> Reported</div>}
                            </div>
                            <p className="text-xs text-muted font-medium">{stations.find(s => s.id === review.stationId)?.name}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="flex items-center gap-1 mb-1 justify-end">
                           {[1,2,3,4,5].map(s => (
                             <Star key={s} size={12} className={s <= review.rating ? 'star-filled fill-current' : 'star-empty fill-current'} />
                           ))}
                         </div>
                         <p className="text-[11px] text-muted">{formatDate(review.date)}</p>
                      </div>
                   </div>
                   <p className="text-sm text-primary leading-relaxed bg-background/50 p-3 rounded-lg border border-border italic mb-4">
                      &quot;{review.text}&quot;
                   </p>
                   <div className="flex flex-wrap gap-2 mb-4">
                      {review.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-background border border-border rounded-full text-muted">{tag}</span>
                      ))}
                   </div>
                </div>
                <div className="bg-background/20 px-5 py-3 border-t border-border flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <button className="text-xs font-semibold text-muted hover:text-success flex items-center gap-1.5 transition-colors" onClick={() => handleIgnore(review.id)}>
                        <ShieldCheck size={14} /> Dismiss Report
                      </button>
                      <button className="text-xs font-semibold text-muted hover:text-danger flex items-center gap-1.5 transition-colors" onClick={() => handleDelete(review.id)}>
                        <Trash2 size={14} /> Delete Review
                      </button>
                   </div>
                   <button className="text-xs font-semibold text-accent hover:underline flex items-center gap-1.5 transition-colors">
                     <Eye size={14} /> View Context
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
               <ShieldCheck size={40} className="text-border mx-auto mb-4" />
               <p className="text-sm font-medium text-primary">No reviews flagged for moderation</p>
               <p className="text-xs text-muted mt-1">Excellent job! Community standards are being met.</p>
            </div>
          )}
        </div>

        {/* Moderation Summary Footer */}
        <div className="mt-8 p-4 bg-[#F0FDFA] border border-[#99F6E4] rounded-xl flex items-center gap-4">
            <div className="p-2 rounded-lg bg-white border border-[#99F6E4] text-accent">
                <Info size={18} />
            </div>
            <div>
                <p className="text-[11px] font-bold text-accent uppercase tracking-tight">Pro-tip</p>
                <p className="text-xs text-accent leading-tight">Reviews with more than 3 reports are automatically hidden until moderated. Check the &quot;Automated Logs&quot; for details.</p>
            </div>
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
