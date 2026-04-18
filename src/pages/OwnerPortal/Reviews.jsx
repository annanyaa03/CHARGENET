import React, { useState } from 'react'
import { Star, MessageSquare, Reply, ChevronDown, Filter, Search, CheckCircle, Clock } from 'lucide-react'
import { PageWrapper, PageContainer } from '../../components/layout/PageWrapper'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { reviews } from '../../mock/reviews'
import { stations } from '../../mock/stations'
import { formatDate } from '../../utils/formatTime'
import toast from 'react-hot-toast'

export default function OwnerReviews() {
  const [replyId, setReplyId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [filterRating, setFilterRating] = useState('all')

  const myStations = stations.slice(0, 2)
  const myReviews = reviews.filter(r => myStations.some(s => s.id === r.stationId))
  
  const filteredReviews = filterRating === 'all' 
    ? myReviews 
    : myReviews.filter(r => r.rating === parseInt(filterRating))

  const handleReply = () => {
    if (!replyText.trim()) return
    toast.success('Reply posted successfully')
    setReplyId(null)
    setReplyText('')
  }

  return (
    <PageWrapper>
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Manage Reviews</h1>
            <p className="text-sm text-muted mt-1">Engage with your customers and monitor feedback.</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search in reviews..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
                className="bg-background border border-border rounded-lg text-sm px-3 py-2 text-primary focus:outline-none focus:border-accent"
                value={filterRating}
                onChange={e => setFilterRating(e.target.value)}
            >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
            </select>
            <Button variant="outline" size="sm" icon={Filter}>More Filters</Button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredReviews.length > 0 ? (
            filteredReviews.map(review => (
              <div key={review.id} className="bg-surface border border-border rounded-xl p-6" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-semibold">
                      {review.reviewerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-primary">{review.reviewerName}</h3>
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
                
                <p className="text-sm text-primary leading-relaxed mb-4">
                  {review.text}
                </p>

                {review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 bg-background border border-border rounded-full text-muted">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <button className="text-xs font-medium text-muted hover:text-accent flex items-center gap-1.5 transition-colors" onClick={() => setReplyId(review.id === replyId ? null : review.id)}>
                    <Reply size={14} /> Reply
                  </button>
                  <button className="text-xs font-medium text-muted hover:text-primary flex items-center gap-1.5 transition-colors">
                    <CheckCircle size={14} /> Mark as Helpful
                  </button>
                  <button className="text-xs font-medium text-muted hover:text-danger flex items-center gap-1.5 transition-colors">
                    <Clock size={14} /> Report
                  </button>
                </div>

                {replyId === review.id && (
                  <div className="mt-4 pt-4 border-t border-border border-dashed">
                    <textarea
                      placeholder="Write your response..."
                      className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 text-primary focus:outline-none focus:border-accent resize-none mb-3"
                      rows={3}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="sm" onClick={() => setReplyId(null)}>Cancel</Button>
                       <Button variant="primary" size="sm" onClick={() => handleReply()}>Post Response</Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
               <MessageSquare size={40} className="text-border mx-auto mb-4" />
               <p className="text-sm font-medium text-primary">No reviews found</p>
               <p className="text-xs text-muted mt-1">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
