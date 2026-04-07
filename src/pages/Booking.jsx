import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, Clock } from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { PlugBadge } from '../components/common/Badge'
import { stations } from '../mock/stations'
import { chargers } from '../mock/chargers'
import { formatINR } from '../utils/formatCurrency'

const SLOTS = Array.from({ length: 24 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  const label = `${String(h).padStart(2,'0')}:${m}`
  const booked = [2, 3, 8, 9, 14, 20].includes(i)
  return { id: i, label, booked }
})

export default function Booking() {
  const { id, chargerId } = useParams()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSlots, setSelectedSlots] = useState([])

  const station = stations.find(s => s.id === id)
  const charger = chargers.find(c => c.id === chargerId)

  useEffect(() => { document.title = 'Book Slot — ChargeNet' }, [])

  if (!station || !charger) return (
    <PageWrapper><PageContainer><p className="text-muted">Not found.</p></PageContainer></PageWrapper>
  )

  const toggleSlot = (slot) => {
    if (slot.booked) return
    setSelectedSlots(prev =>
      prev.includes(slot.id) ? prev.filter(s => s !== slot.id) : [...prev, slot.id]
    )
  }

  const estimatedKwh = selectedSlots.length * 0.5 * (charger.powerKw / 60)
  const estimatedCost = estimatedKwh * charger.pricePerKwh
  const duration = selectedSlots.length * 30

  const slotLabel = (id) => SLOTS[id]?.label
  const firstSlot = selectedSlots.length > 0 ? slotLabel(Math.min(...selectedSlots)) : null
  const lastSlotId = selectedSlots.length > 0 ? Math.max(...selectedSlots) : null
  const lastSlotEnd = lastSlotId !== null ? slotLabel((lastSlotId + 1) % 48) : null

  const handleConfirm = () => {
    if (selectedSlots.length === 0) return
    const bookingId = 'bk-' + Date.now()
    navigate(`/payment/${bookingId}`, {
      state: { station, charger, slots: selectedSlots, date: selectedDate, estimatedCost, duration, firstSlot, lastSlotEnd }
    })
  }

  return (
    <PageWrapper>
      <PageContainer>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-5 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-xl font-semibold text-primary mb-6">Book a Slot</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Charger Summary */}
            <div className="bg-surface border border-border rounded-xl p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary">{charger.company}</p>
                  <p className="text-xs text-muted">{station.name}</p>
                </div>
                <PlugBadge plugType={charger.plugType} />
              </div>
              <div className="flex items-center gap-3 mt-3 text-sm">
                <span className="flex items-center gap-1.5 text-muted"><Zap size={14} className="text-accent" />{charger.powerKw} kW</span>
                <span className="text-border">·</span>
                <span className="text-muted">{formatINR(charger.pricePerKwh)}/kWh</span>
              </div>
            </div>

            {/* Date Picker */}
            <div className="bg-surface border border-border rounded-xl p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 className="text-sm font-semibold text-primary mb-3">Select Date</h2>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => { setSelectedDate(e.target.value); setSelectedSlots([]) }}
                className="bg-background border border-border rounded-lg text-sm px-3 py-2 text-primary focus:outline-none focus:border-accent"
              />
            </div>

            {/* Time Slots */}
            <div className="bg-surface border border-border rounded-xl p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 className="text-sm font-semibold text-primary mb-1">Select Time Slots</h2>
              <p className="text-xs text-muted mb-4">Each slot is 30 minutes. Select multiple for longer sessions.</p>
              <div className="flex flex-wrap gap-1.5">
                {SLOTS.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => toggleSlot(slot)}
                    className={
                      slot.booked ? 'slot-booked' :
                      selectedSlots.includes(slot.id) ? 'slot-selected' :
                      'slot-available'
                    }
                    style={{ minWidth: '64px' }}
                    disabled={slot.booked}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-surface border border-border inline-block" />Available</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent inline-block" />Selected</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#FEF2F2] border border-[#FECACA] inline-block" />Booked</span>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-xl p-4 sticky top-20" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 className="text-sm font-semibold text-primary mb-4">Booking Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Date</span>
                  <span className="text-primary font-medium">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Time</span>
                  <span className="text-primary font-medium">
                    {firstSlot ? `${firstSlot} – ${lastSlotEnd}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Duration</span>
                  <span className="text-primary font-medium">
                    {duration > 0 ? `${duration} min` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Est. kWh</span>
                  <span className="text-primary font-medium">
                    {duration > 0 ? `~${estimatedKwh.toFixed(1)} kWh` : '—'}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-muted font-medium">Est. Cost</span>
                  <span className="text-accent font-semibold">
                    {duration > 0 ? formatINR(estimatedCost) : '—'}
                  </span>
                </div>
              </div>
              <Button
                variant="primary" fullWidth className="mt-4"
                disabled={selectedSlots.length === 0}
                onClick={handleConfirm}
                id="confirm-booking-btn"
              >
                Confirm Booking
              </Button>
              <p className="text-xs text-muted text-center mt-2">Final cost may vary based on actual kWh consumed</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
