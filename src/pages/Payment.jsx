import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Calendar, QrCode, Wallet, CreditCard, Smartphone, ArrowLeft } from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { useAuthStore } from '../store/authStore'
import { formatINR } from '../utils/formatCurrency'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Pay via any UPI app' },
  { id: 'card', label: 'Card', icon: CreditCard, desc: 'Credit or Debit card' },
  { id: 'wallet', label: 'ChargeNet Wallet', icon: Wallet, desc: '' },
]

export default function Payment() {
  const { bookingId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [method, setMethod] = useState('upi')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [confirmId] = useState('CN-' + Math.random().toString(36).slice(2, 9).toUpperCase())

  useEffect(() => { document.title = 'Payment — ChargeNet' }, [])

  const booking = state || {
    station: { name: 'ChargeNet Station' },
    charger: { company: 'Tata Power EZ Charge', plugType: 'CCS2', powerKw: 50, pricePerKwh: 18 },
    estimatedCost: 250,
    duration: 60,
    date: new Date().toISOString().split('T')[0],
    firstSlot: '10:00',
    lastSlotEnd: '11:00',
  }

  const handlePay = async () => {
    if (method === 'wallet' && (user?.walletBalance || 0) < booking.estimatedCost) {
      toast.error('Insufficient wallet balance')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSuccess(true)
    toast.success('Payment successful!')
  }

  if (success) {
    return (
      <PageWrapper>
        <PageContainer>
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h1 className="text-xl font-semibold text-primary mb-2">Booking Confirmed!</h1>
            <p className="text-sm text-muted mb-6">Your charging slot has been reserved successfully.</p>

            <div className="bg-surface border border-border rounded-xl p-5 text-left mb-6" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Confirmation ID</span>
                  <span className="font-mono font-semibold text-accent">{confirmId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Station</span>
                  <span className="text-primary font-medium">{booking.station?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Date</span>
                  <span className="text-primary font-medium">{booking.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Time</span>
                  <span className="text-primary font-medium">{booking.firstSlot} – {booking.lastSlotEnd}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="text-muted">Amount Paid</span>
                  <span className="font-semibold text-primary">{formatINR(booking.estimatedCost)}</span>
                </div>
              </div>
            </div>

            {/* QR Placeholder */}
            <div className="qr-placeholder mb-6">
              <div className="text-center">
                <QrCode size={48} className="text-border mx-auto mb-2" />
                <p className="text-xs text-muted">Show this at station</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth icon={Calendar} onClick={() => navigate('/profile')}>
                My Bookings
              </Button>
              <Button variant="primary" fullWidth onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </PageContainer>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <PageContainer>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-5 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-xl font-semibold text-primary mb-6">Complete Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-4xl">
          <div className="lg:col-span-2 space-y-5">
            {/* Booking Summary */}
            <div className="bg-surface border border-border rounded-xl p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 className="text-sm font-semibold text-primary mb-3">Booking Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">Station</span><span className="text-primary">{booking.station?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted">Charger</span><span className="text-primary">{booking.charger?.company}</span></div>
                <div className="flex justify-between"><span className="text-muted">Date</span><span className="text-primary">{booking.date}</span></div>
                <div className="flex justify-between"><span className="text-muted">Time</span><span className="text-primary">{booking.firstSlot} – {booking.lastSlotEnd}</span></div>
                <div className="flex justify-between"><span className="text-muted">Duration</span><span className="text-primary">{booking.duration} min</span></div>
                <div className="flex justify-between border-t border-border pt-2 mt-1">
                  <span className="font-medium text-primary">Total</span>
                  <span className="font-semibold text-accent text-base">{formatINR(booking.estimatedCost)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-surface border border-border rounded-xl p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 className="text-sm font-semibold text-primary mb-3">Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(pm => (
                  <label key={pm.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${method === pm.id ? 'border-accent bg-[#F0FDFA]' : 'border-border bg-background hover:border-muted'}`}>
                    <input type="radio" name="payment" value={pm.id} checked={method === pm.id} onChange={() => setMethod(pm.id)} className="accent-accent" />
                    <pm.icon size={18} className={method === pm.id ? 'text-accent' : 'text-muted'} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">{pm.label}</p>
                      <p className="text-xs text-muted">
                        {pm.id === 'wallet' ? `Balance: ${formatINR(user?.walletBalance || 0)}` : pm.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Pay Button */}
          <div>
            <div className="bg-surface border border-border rounded-xl p-4 sticky top-20" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted">Amount Due</span>
                <span className="text-lg font-semibold text-primary">{formatINR(booking.estimatedCost)}</span>
              </div>
              <Button variant="primary" fullWidth loading={loading} onClick={handlePay} id="pay-now-btn">
                Pay {formatINR(booking.estimatedCost)}
              </Button>
              <p className="text-xs text-muted text-center mt-2">Secured payment · No hidden charges</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
