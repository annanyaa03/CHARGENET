import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Star, Clock, Zap, Wifi, Droplets, Car, Shield, Moon, Accessibility, Check, X as XIcon, Bookmark, BookmarkCheck, ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { Badge, PlugBadge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { stations } from '../mock/stations'
import { chargers } from '../mock/chargers'
import { reviews } from '../mock/reviews'
import { amenities } from '../mock/amenities'
import { useAuthStore } from '../store/authStore'
import { formatRelativeTime, formatDate } from '../utils/formatTime'
import { formatINR } from '../utils/formatCurrency'
import toast from 'react-hot-toast'

function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={size} className={s <= Math.round(rating) ? 'star-filled fill-current' : 'star-empty fill-current'} />)}
    </div>
  )
}

function ChargerCard({ charger, stationId }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const handleBook = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    navigate(`/station/${stationId}/book/${charger.id}`)
  }
  return (
    <div className="bg-surface border border-border rounded-xl p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-primary">{charger.company}</p>
          <p className="text-xs text-muted">{charger.appName} App</p>
        </div>
        <Badge variant={charger.status} label={charger.status.charAt(0).toUpperCase() + charger.status.slice(1)} />
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <PlugBadge plugType={charger.plugType} />
        <span className="text-xs font-medium bg-background border border-border px-2 py-0.5 rounded-md text-primary">{charger.powerKw} kW</span>
        <span className="text-xs font-medium text-muted">{formatINR(charger.pricePerKwh)}/kWh</span>
      </div>
      <p className="text-xs text-muted mb-3">Last active: {formatRelativeTime(charger.lastActiveAt)}</p>
      <div className="flex items-center gap-2 mb-3">
        <a href={charger.playStoreUrl} target="_blank" rel="noreferrer"
          className="text-xs bg-[#1C1917] text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:no-underline hover:opacity-90 transition-opacity">
          <span>▶</span> Play Store
        </a>
        <a href={charger.appStoreUrl} target="_blank" rel="noreferrer"
          className="text-xs bg-[#1C1917] text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:no-underline hover:opacity-90 transition-opacity">
          <span> </span> App Store
        </a>
      </div>
      <Button variant="primary" size="sm" fullWidth onClick={handleBook}
        disabled={charger.status === 'inactive' || charger.status === 'faulty'}>
        {charger.status === 'active' ? 'Book Slot' : charger.status === 'busy' ? 'Join Queue' : 'Unavailable'}
      </Button>
    </div>
  )
}

function FacilityItem({ label, available, Icon }) {
  return (
    <div className="flex items-center gap-2">
      {available
        ? <Check size={14} className="text-success flex-shrink-0" />
        : <XIcon size={14} className="text-danger flex-shrink-0" />}
      <div className="flex items-center gap-1.5">
        <Icon size={13} className="text-muted" />
        <span className="text-sm text-primary">{label}</span>
      </div>
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="py-4 border-b border-border last:border-0">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-semibold flex-shrink-0">
          {review.reviewerName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary">{review.reviewerName}</p>
            <p className="text-xs text-muted">{formatDate(review.date)}</p>
          </div>
          <StarRating rating={review.rating} size={12} />
        </div>
      </div>
      <p className="text-sm text-muted leading-relaxed mb-2">{review.text}</p>
      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {review.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-background border border-border rounded-full text-muted">{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}

const REVIEW_TAGS = ['Fast Charging', 'Clean', 'Safe', 'Good Location', 'Reliable', 'Easy Payment', 'Covered Parking', 'Accessible', 'Crowded', 'Needs Maintenance', 'Friendly Staff', 'Reasonable Price']

export default function StationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, toggleSavedStation } = useAuthStore()
  const [reviewModal, setReviewModal] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [userRating, setUserRating] = useState(0)
  const [reviewText, setReviewText] = useState('')

  const station = stations.find(s => s.id === id)
  const stationChargers = chargers.filter(c => c.stationId === id)
  const stationReviews = reviews.filter(r => r.stationId === id)
  const stationAmenities = amenities[id]
  const isSaved = user?.savedStations?.includes(id)

  useEffect(() => {
    if (station) document.title = `${station.name} — ChargeNet`
  }, [station])

  if (!station) return (
    <PageWrapper><PageContainer><div className="text-center py-20 text-muted">Station not found.</div></PageContainer></PageWrapper>
  )

  const avgRating = stationReviews.reduce((acc, r) => acc + r.rating, 0) / (stationReviews.length || 1)
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: stationReviews.filter(r => r.rating === star).length,
    pct: (stationReviews.filter(r => r.rating === star).length / (stationReviews.length || 1)) * 100,
  }))

  const handleToggleSave = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    toggleSavedStation(id)
    toast.success(isSaved ? 'Removed from saved' : 'Station saved!')
  }

  const handleSubmitReview = () => {
    if (userRating === 0) { toast.error('Please select a star rating'); return }
    toast.success('Review submitted! Thank you.')
    setReviewModal(false)
    setUserRating(0); setReviewText(''); setSelectedTags([])
  }

  const facilities = [
    { key: 'restrooms', label: 'Restrooms', Icon: Wifi },
    { key: 'drinkingWater', label: 'Drinking Water', Icon: Droplets },
    { key: 'coveredParking', label: 'Covered Parking', Icon: Car },
    { key: 'cctv', label: 'CCTV', Icon: Shield },
    { key: 'nightLighting', label: 'Night Lighting', Icon: Moon },
    { key: 'wheelchairAccess', label: 'Wheelchair Access', Icon: Accessibility },
  ]

  return (
    <PageWrapper>
      <PageContainer>
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-4 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold text-primary">{station.name}</h1>
              <Badge variant={station.status} label={station.status.charAt(0).toUpperCase() + station.status.slice(1)} />
            </div>
            <div className="flex items-center gap-1 text-muted text-sm">
              <MapPin size={14} /> {station.address}
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <div className="flex items-center gap-1.5">
                <StarRating rating={avgRating} size={14} />
                <span className="font-medium text-primary">{avgRating.toFixed(1)}</span>
                <span className="text-muted">({stationReviews.length} reviews)</span>
              </div>
              <span className="text-muted">·</span>
              <div className="flex items-center gap-1 text-muted">
                <Clock size={13} /> {station.openHours}
              </div>
            </div>
          </div>
          <button onClick={handleToggleSave}
            className="self-start flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-sm font-medium text-primary hover:bg-background transition-colors">
            {isSaved ? <BookmarkCheck size={16} className="text-accent" /> : <Bookmark size={16} />}
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Chargers */}
            <section>
              <h2 className="text-base font-semibold text-primary mb-4">
                Chargers <span className="text-muted font-normal text-sm">({stationChargers.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stationChargers.map(c => <ChargerCard key={c.id} charger={c} stationId={id} />)}
              </div>
            </section>

            {/* Amenities */}
            {stationAmenities && (
              <section>
                <h2 className="text-base font-semibold text-primary mb-4">Nearby Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {stationAmenities.restaurants.map(r => (
                    <div key={r.id} className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between"
                      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                      <div>
                        <p className="text-sm font-medium text-primary">{r.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted">
                          <div className="flex items-center gap-0.5">
                            <Star size={10} className="star-filled fill-current" />
                            <span>{r.rating}</span>
                          </div>
                          <span>·</span>
                          <span>{r.distance}m away</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${r.isOpen ? 'bg-[#F0FDF4] text-success border-[#BBF7D0]' : 'bg-[#FEF2F2] text-danger border-[#FECACA]'}`}>
                        {r.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
                {stationAmenities.parks.map(p => (
                  <div key={p.id} className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3 mb-4"
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <div className="w-8 h-8 bg-[#F0FDF4] rounded-lg flex items-center justify-center text-success">🌳</div>
                    <div>
                      <p className="text-sm font-medium text-primary">{p.name}</p>
                      <p className="text-xs text-muted">{p.distance}m away</p>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-primary">Reviews</h2>
                <Button variant="outline" size="sm" icon={MessageSquare} onClick={() => {
                  if (!isAuthenticated) { navigate('/login'); return }
                  setReviewModal(true)
                }}>
                  Write a Review
                </Button>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4 mb-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-semibold text-primary">{avgRating.toFixed(1)}</p>
                    <StarRating rating={avgRating} size={16} />
                    <p className="text-xs text-muted mt-1">{stationReviews.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {ratingBreakdown.map(({ star, count, pct }) => (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="text-muted w-4 text-right">{star}</span>
                        <Star size={10} className="star-filled fill-current flex-shrink-0" />
                        <div className="rating-bar-track flex-1">
                          <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-muted w-4">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                {stationReviews.map(r => <ReviewCard key={r.id} review={r} />)}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-xl p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h3 className="text-sm font-semibold text-primary mb-3">Facilities</h3>
              <div className="space-y-2">
                {facilities.map(f => <FacilityItem key={f.key} label={f.label} available={station.facilities[f.key]} Icon={f.Icon} />)}
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h3 className="text-sm font-semibold text-primary mb-2">Quick Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">Total Chargers</span><span className="text-primary font-medium">{station.totalChargers}</span></div>
                <div className="flex justify-between"><span className="text-muted">Available Now</span><span className="text-success font-medium">{station.availableChargers}</span></div>
                <div className="flex justify-between"><span className="text-muted">Open Hours</span><span className="text-primary font-medium">{station.openHours}</span></div>
                <div className="flex justify-between"><span className="text-muted">City</span><span className="text-primary font-medium">{station.city}</span></div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Write a Review">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-primary block mb-2">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setUserRating(s)}>
                  <Star size={28} className={s <= userRating ? 'star-filled fill-current' : 'star-empty fill-current'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-primary block mb-2">Your Review</label>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              rows={4}
              placeholder="Share your experience…"
              className="w-full bg-surface border border-border rounded-lg text-sm px-3 py-2 text-primary placeholder:text-muted focus:outline-none focus:border-accent resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-primary block mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map(tag => (
                <button key={tag} onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${selectedTags.includes(tag) ? 'bg-accent text-white border-accent' : 'bg-surface border-border text-muted hover:border-accent'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" fullWidth onClick={() => setReviewModal(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleSubmitReview}>Submit Review</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  )
}
