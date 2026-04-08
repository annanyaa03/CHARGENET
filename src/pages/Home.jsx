import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  MapPin, Zap, Star, ChevronRight, ArrowRight, Search,
  Battery, Clock, Shield, Smartphone, Navigation, Users,
  CheckCircle, Play, ChevronDown, Sparkles, Globe, BatteryCharging,
  Route, CalendarCheck, Eye
} from 'lucide-react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { stations } from '../mock/stations'
import { formatDistance } from '../utils/plugTypes'

/* ─── Animated Counter ─── */
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const counted = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const startTime = performance.now()
          const numEnd = parseInt(end)
          const animate = (now) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * numEnd))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

/* ─── Scroll Reveal ─── */
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Floating Particles Canvas ─── */
function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame
    let particles = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const w = () => canvas.offsetWidth
    const h = () => canvas.offsetHeight

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w(),
        y: Math.random() * h(),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, w(), h())
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w()
        if (p.x > w()) p.x = 0
        if (p.y < 0) p.y = h()
        if (p.y > h()) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity})`
        ctx.fill()
      })

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.08 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      frame = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}

/* ─── Typing Animation ─── */
function TypingText({ words, className = '' }) {
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[wordIndex]
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIndex < word.length) {
          setCharIndex(c => c + 1)
        } else {
          setTimeout(() => setDeleting(true), 1800)
        }
      } else {
        if (charIndex > 0) {
          setCharIndex(c => c - 1)
        } else {
          setDeleting(false)
          setWordIndex(i => (i + 1) % words.length)
        }
      }
    }, deleting ? 40 : 80)
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, wordIndex, words])

  return (
    <span className={className}>
      {words[wordIndex].substring(0, charIndex)}
      <span style={{ animation: 'blink 1s step-end infinite', borderRight: '2px solid #10B981' }}>&nbsp;</span>
    </span>
  )
}

/* ─── Star Rating ─── */
function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={13} className={s <= Math.round(rating) ? 'star-filled fill-current' : 'star-empty fill-current'} />
      ))}
    </div>
  )
}

/* ─── Station Card (Enhanced) ─── */
function StationCard({ station, index }) {
  const navigate = useNavigate()
  return (
    <Reveal delay={index * 100}>
      <div
        className="home-station-card group"
        onClick={() => navigate(`/station/${station.id}`)}
        role="button"
        tabIndex={0}
      >
        {/* Top gradient bar */}
        <div className="home-station-card-bar" />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-primary truncate group-hover:text-accent transition-colors">
                {station.name}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={11} className="text-muted flex-shrink-0" />
                <p className="text-xs text-muted truncate">{station.address.split(',').slice(-2).join(',').trim()}</p>
              </div>
            </div>
            <span className={`home-status-badge home-status-${station.status}`}>
              {station.status.charAt(0).toUpperCase() + station.status.slice(1)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted mb-4">
            <div className="flex items-center gap-1">
              <StarRating rating={station.rating} />
              <span className="font-semibold text-primary">{station.rating}</span>
            </div>
            <span className="text-border">·</span>
            <span>{formatDistance(station.distance)}</span>
            <span className="text-border">·</span>
            <span className="text-emerald-600 font-medium">{station.availableChargers}/{station.totalChargers} free</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View Details <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </Reveal>
  )
}

/* ─── Main Home Page ─── */
export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  useEffect(() => { document.title = 'ChargeNet — India\'s Smart EV Charging Companion' }, [])

  const featured = stations.filter(s => s.status === 'active').slice(0, 6)

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/map?q=${search}`)
  }

  const howItWorks = [
    { icon: Search, title: 'Search', desc: 'Find charging stations near you or along your route', color: '#10B981' },
    { icon: CalendarCheck, title: 'Book', desc: 'Reserve a slot in advance and skip the wait', color: '#3B82F6' },
    { icon: BatteryCharging, title: 'Charge', desc: 'Plug in and charge with real-time monitoring', color: '#8B5CF6' },
    { icon: Route, title: 'Go', desc: 'Hit the road with confidence, every trip', color: '#F59E0B' },
  ]

  const features = [
    { icon: MapPin, title: 'Live Station Map', desc: 'Interactive map with real-time availability, color-coded pins, and instant navigation to the nearest charger.', gradient: 'linear-gradient(135deg, #059669, #10B981)' },
    { icon: Clock, title: 'Smart Slot Booking', desc: 'Book charging slots up to 7 days ahead. Get reminders, manage bookings, and never wait in line again.', gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)' },
    { icon: Shield, title: 'Verified Reviews', desc: 'Read and write honest reviews. Our moderation ensures quality feedback to help you pick the best stations.', gradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' },
    { icon: Smartphone, title: 'Owner Portal', desc: 'Station owners can manage listings, track analytics, monitor charger health, and grow their network.', gradient: 'linear-gradient(135deg, #D97706, #F59E0B)' },
    { icon: Navigation, title: 'Trip Planner', desc: 'Plan long-distance trips with charging stops mapped out. Estimate charge needed and time per stop.', gradient: 'linear-gradient(135deg, #DC2626, #EF4444)' },
    { icon: Globe, title: 'Learn Hub', desc: 'From your first EV purchase to road-trip planning — curated guides, tips, and industry news.', gradient: 'linear-gradient(135deg, #0891B2, #06B6D4)' },
  ]

  const testimonials = [
    { name: 'Aarav Sharma', role: 'Tata Nexon EV Owner', city: 'Pune', text: 'ChargeNet made my first long drive stress-free. I booked slots in advance and every station was exactly as described!', rating: 5 },
    { name: 'Priya Patel', role: 'MG ZS EV Owner', city: 'Mumbai', text: "The live map is a game-changer. I can see available chargers in real-time and navigate there instantly. Love the reviews too!", rating: 5 },
    { name: 'Karthik Reddy', role: 'Station Owner', city: 'Bengaluru', text: 'The owner portal gives me real insights into my station performance. Bookings went up 40% since I listed on ChargeNet.', rating: 4 },
  ]

  return (
    <PageWrapper>
      {/* ═══════════ HERO ═══════════ */}
      <section className="home-hero">
        <ParticleField />

        {/* Gradient orbs */}
        <div className="home-hero-orb home-hero-orb-1" />
        <div className="home-hero-orb home-hero-orb-2" />
        <div className="home-hero-orb home-hero-orb-3" />

        <div className="home-hero-content">
          <Reveal>
            <div className="home-hero-badge">
              <Sparkles size={14} />
              <span>Now live in 5 cities across India</span>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <h1 className="home-hero-title">
              Find your next
              <br />
              <TypingText
                words={['charge', 'station', 'adventure', 'route']}
                className="home-hero-accent"
              />
            </h1>
          </Reveal>

          <Reveal delay={300}>
            <p className="home-hero-subtitle">
              Discover nearby EV charging stations, check real-time availability,
              book your slot, and charge with confidence.
            </p>
          </Reveal>

          <Reveal delay={450}>
            <form onSubmit={handleSearch} className="home-hero-search">
              <div className="home-hero-search-inner">
                <Search size={18} className="home-hero-search-icon" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by city or area…"
                  className="home-hero-search-input"
                  id="hero-search"
                />
                <button type="submit" className="home-hero-search-btn">
                  <Search size={16} />
                  Search
                </button>
              </div>
            </form>
          </Reveal>

          <Reveal delay={600}>
            <div className="home-hero-cta-row">
              <Button variant="primary" size="lg" onClick={() => navigate('/map')} className="home-hero-btn-primary">
                <MapPin size={16} /> Explore Map
              </Button>
              <button onClick={() => navigate('/learn')} className="home-hero-btn-ghost">
                <Play size={14} /> Learn More
              </button>
            </div>
          </Reveal>

          <Reveal delay={750}>
            <div className="home-hero-trust">
              <div className="home-hero-trust-avatars">
                {['A', 'R', 'P', 'K'].map((l, i) => (
                  <div key={i} className="home-hero-trust-avatar" style={{ zIndex: 4 - i, marginLeft: i > 0 ? '-8px' : 0 }}>
                    {l}
                  </div>
                ))}
              </div>
              <p className="home-hero-trust-text">
                <span className="font-semibold text-white">385+</span> reviews from EV drivers
              </p>
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div className="home-hero-scroll">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section className="home-stats-bar">
        <div className="home-stats-grid">
          {[
            { value: '10', suffix: '+', label: 'Charging Stations' },
            { value: '5', suffix: '', label: 'Cities Covered' },
            { value: '30', suffix: '+', label: 'Active Chargers' },
            { value: '385', suffix: '+', label: 'User Reviews' },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100}>
              <div className="home-stat-item">
                <p className="home-stat-value">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </p>
                <p className="home-stat-label">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="home-section home-section-light">
        <div className="home-container">
          <Reveal>
            <div className="home-section-header">
              <span className="home-section-badge">Simple Process</span>
              <h2 className="home-section-title">How ChargeNet Works</h2>
              <p className="home-section-subtitle">Four simple steps to a charged EV, every single time.</p>
            </div>
          </Reveal>

          <div className="home-steps-grid">
            {howItWorks.map((step, i) => (
              <Reveal key={step.title} delay={i * 120}>
                <div className="home-step-card">
                  <div className="home-step-number">{i + 1}</div>
                  <div className="home-step-icon" style={{ background: step.color + '18', color: step.color }}>
                    <step.icon size={24} />
                  </div>
                  <h3 className="home-step-title">{step.title}</h3>
                  <p className="home-step-desc">{step.desc}</p>
                  {i < howItWorks.length - 1 && <div className="home-step-connector" />}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="home-section home-section-dark">
        <div className="home-container">
          <Reveal>
            <div className="home-section-header">
              <span className="home-section-badge home-section-badge-dark">Platform Features</span>
              <h2 className="home-section-title text-white">Everything you need to<br /><span className="home-gradient-text">charge with confidence</span></h2>
              <p className="home-section-subtitle" style={{ color: 'rgba(255,255,255,0.6)' }}>
                A complete ecosystem for EV drivers and station owners.
              </p>
            </div>
          </Reveal>

          <div className="home-features-grid">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="home-feature-card group">
                  <div className="home-feature-icon" style={{ background: f.gradient }}>
                    <f.icon size={22} color="white" />
                  </div>
                  <h3 className="home-feature-title">{f.title}</h3>
                  <p className="home-feature-desc">{f.desc}</p>
                  <div className="home-feature-link">
                    Learn more <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED STATIONS ═══════════ */}
      <section className="home-section home-section-light">
        <div className="home-container">
          <Reveal>
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="home-section-badge">Nearby</span>
                <h2 className="home-section-title" style={{ marginBottom: 0 }}>Featured Stations</h2>
              </div>
              <Link to="/map" className="home-view-all-link">
                View all <ChevronRight size={16} />
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((station, i) => (
              <StationCard key={station.id} station={station} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="home-section home-section-accent">
        <div className="home-container">
          <Reveal>
            <div className="home-section-header">
              <span className="home-section-badge home-section-badge-accent">What Drivers Say</span>
              <h2 className="home-section-title">Trusted by India's EV Community</h2>
              <p className="home-section-subtitle">Real experiences from real EV drivers and station owners.</p>
            </div>
          </Reveal>

          <div className="home-testimonials-grid">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 150}>
                <div className="home-testimonial-card">
                  <div className="home-testimonial-stars">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} className={s <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                  <p className="home-testimonial-text">"{t.text}"</p>
                  <div className="home-testimonial-author">
                    <div className="home-testimonial-avatar">{t.name[0]}</div>
                    <div>
                      <p className="home-testimonial-name">{t.name}</p>
                      <p className="home-testimonial-role">{t.role} · {t.city}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA BANNER ═══════════ */}
      <section className="home-cta-section">
        <div className="home-cta-bg" />
        <div className="home-container" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div className="home-cta-content">
              <Zap size={40} className="text-emerald-400 mb-4" />
              <h2 className="home-cta-title">Ready to charge smarter?</h2>
              <p className="home-cta-subtitle">
                Join India's fastest-growing EV charging network. Whether you drive or own a station — we've got you covered.
              </p>
              <div className="home-cta-buttons">
                <Button variant="primary" size="lg" onClick={() => navigate('/register')} className="home-cta-btn-primary">
                  Get Started Free <ArrowRight size={16} />
                </Button>
                <button onClick={() => navigate('/learn')} className="home-cta-btn-outline">
                  Explore Learn Hub <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageWrapper>
  )
}
