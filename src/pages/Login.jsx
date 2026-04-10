import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import {
  Eye, EyeOff, Zap, Mail, Lock,
  ArrowRight, Shield, ChevronRight,
  CheckCircle2, Zap as Flash, Users, MapPin, BatteryCharging,
  Fingerprint, Sparkles
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Navbar } from '../components/layout/Navbar'
import toast from 'react-hot-toast'

/* ─── Data ─────────────────────────────────────────────────────── */

const DEMO_ACCOUNTS = [
  { label: 'Driver',  email: 'driver@chargenet.in',  desc: 'Reserve slots & manage trips',   role: '01' },
  { label: 'Owner',   email: 'owner@chargenet.in',   desc: 'Manage station inventory',        role: '02' },
  { label: 'Admin',   email: 'admin@chargenet.in',   desc: 'Enterprise management access',   role: '03' },
]

const STATS = [
  { value: '10K+', label: 'Sessions Today' },
  { value: '500+', label: 'Stations' },
  { value: '50K+', label: 'Users' },
]

const FEATURES = [
  'Real-time charger availability',
  'Instant slot reservations',
  'Seamless payment gateway',
]

/* ─── Password Strength ─────────────────────────────────────────── */

function getStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let s = 0
  if (pwd.length >= 8) s++
  if (/[A-Z]/.test(pwd)) s++
  if (/[0-9]/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  const map = [
    { score: 0, label: '',        color: 'bg-gray-100' },
    { score: 1, label: 'Weak',    color: 'bg-red-400' },
    { score: 2, label: 'Fair',    color: 'bg-amber-400' },
    { score: 3, label: 'Good',    color: 'bg-emerald-400' },
    { score: 4, label: 'Strong',  color: 'bg-emerald-600' },
  ]
  return map[s]
}

/* ─── Animated Background Grid ─────────────────────────────────── */

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.6) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Corner accents */}
      <div className="absolute top-16 left-16 w-24 h-24 border-l-2 border-t-2 border-emerald-500/20" />
      <div className="absolute bottom-16 right-16 w-24 h-24 border-r-2 border-b-2 border-emerald-500/20" />
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-400/5 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-400/5 blur-[60px]" />
    </div>
  )
}

/* ─── Floating Stat Chip ─────────────────────────────────────────── */

function StatChip({ value, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col"
    >
      <span className="text-2xl font-black text-gray-900 tracking-tighter">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">{label}</span>
    </motion.div>
  )
}

/* ─── Main Component ────────────────────────────────────────────── */

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeDemo, setActiveDemo] = useState(null)
  const [passwordValue, setPasswordValue] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm()

  const pwdWatch = watch('password', '')

  React.useEffect(() => {
    document.title = 'Sign In — ChargeNet'
    window.scrollTo(0, 0)
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = login(data.email, data.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      if (user.role === 'owner') navigate('/owner/dashboard')
      else if (user.role === 'admin') navigate('/admin/dashboard')
      else navigate('/')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (account) => {
    setActiveDemo(account.label)
    setValue('email', account.email)
    setValue('password', 'password123')
  }

  const strength = getStrength(pwdWatch)

  /* container stagger */
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  }
  const item = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
      <Navbar solid />

      <div className="flex flex-1 pt-[72px] lg:pt-[80px]">

        {/* ══════════════════════════════════════════════
            LEFT PANEL — Light-themed editorial panel
        ══════════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-col justify-between w-[44%] xl:w-[42%] bg-white border-r border-gray-100 relative px-14 xl:px-20 py-16 xl:py-20">
          <GridBackground />

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center group-hover:bg-black transition-colors">
                <Zap size={20} className="text-white" fill="currentColor" strokeWidth={1} />
              </div>
              <span className="text-lg font-black text-gray-900 tracking-tighter">ChargeNet</span>
            </Link>
          </motion.div>

          {/* Hero copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-sm"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="w-6 h-px bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">India's EV Network</span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-gray-900 tracking-tighter leading-[1.05] mb-6">
              The smarter<br />
              way to charge<br />
              <span className="text-emerald-600">your EV.</span>
            </h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10">
              Thousands of EV owners rely on ChargeNet for fast,
              affordable, and reliable charging across India's
              fastest-growing network.
            </p>

            {/* Feature list */}
            <div className="space-y-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-1 h-1 bg-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{f}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="border-t border-gray-100 pt-10"
          >
            <div className="flex items-end gap-10 mb-10">
              {STATS.map((s, i) => <StatChip key={s.label} {...s} delay={0.55 + i * 0.1} />)}
            </div>
            {/* Testimonial */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                A
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed italic mb-2">
                  "ChargeNet transformed how I plan my road trips.
                  Booking a slot takes literally 20 seconds."
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Ananya R. — Tata Nexon EV, Pune
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════
            RIGHT PANEL — Login form
        ══════════════════════════════════════════════ */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
          {/* Subtle background */}
          <div className="absolute inset-0 bg-gray-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-emerald-400/5 blur-[100px] pointer-events-none" />

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full max-w-[380px] relative z-10"
          >
            {/* Mobile brand */}
            <motion.div variants={item} className="lg:hidden text-center mb-10">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
                  <Zap size={18} className="text-white" fill="currentColor" strokeWidth={1} />
                </div>
                <span className="text-lg font-black text-gray-900 tracking-tighter">ChargeNet</span>
              </Link>
            </motion.div>

            {/* Heading */}
            <motion.div variants={item} className="mb-10">
              <h1 className="text-[2.4rem] font-black text-gray-900 tracking-tighter leading-none mb-3">
                Sign in.
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                Access your ChargeNet dashboard
              </p>
            </motion.div>

            {/* ── Quick Demo ─── */}
            <motion.div variants={item} className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">Demo Access</span>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={10} className="text-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">One-tap login</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc, i) => (
                  <motion.button
                    key={acc.label}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex flex-col items-start px-3 py-3 rounded-xl border transition-all duration-200 overflow-hidden group ${
                      activeDemo === acc.label
                        ? 'border-gray-900 bg-gray-950'
                        : 'border-gray-100 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Active shimmer */}
                    {activeDemo === acc.label && (
                      <motion.div
                        layoutId="demo-active"
                        className="absolute inset-0 bg-gray-900"
                        style={{ zIndex: 0 }}
                      />
                    )}
                    <span className={`text-[9px] font-black uppercase tracking-widest mb-0.5 relative z-10 ${activeDemo === acc.label ? 'text-gray-400' : 'text-gray-300'}`}>
                      {acc.role}
                    </span>
                    <span className={`text-xs font-black uppercase tracking-wider relative z-10 ${activeDemo === acc.label ? 'text-white' : 'text-gray-700'}`}>
                      {acc.label}
                    </span>
                    {activeDemo === acc.label && (
                      <CheckCircle2 size={10} className="absolute top-2 right-2 text-emerald-400 z-10" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div variants={item} className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-200">credentials</span>
              <div className="flex-1 h-px bg-gray-100" />
            </motion.div>

            {/* ── Form ─── */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5">

                {/* Email */}
                <motion.div variants={item}>
                  <label htmlFor="login-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
                        focusedField === 'email' ? 'text-gray-700' : 'text-gray-300'
                      }`}
                    />
                    <input
                      type="email"
                      id="login-email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full h-12 pl-11 pr-4 border rounded-none text-sm text-gray-900 font-bold placeholder-gray-300 outline-none transition-all duration-200 ${
                        errors.email
                          ? 'bg-red-50 border-red-200 focus:border-red-500'
                          : focusedField === 'email'
                            ? 'bg-white border-gray-900'
                            : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                      {...register('email', {
                        required: 'Email required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid format' }
                      })}
                    />
                    {/* Focus bar */}
                    <AnimatePresence>
                      {focusedField === 'email' && (
                        <motion.div
                          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 origin-left"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="text-[10px] text-red-500 font-bold mt-1.5 uppercase tracking-widest"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password */}
                <motion.div variants={item}>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      Password
                    </label>
                    <button type="button" className="text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-gray-900 transition-colors">
                      Forgot →
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      size={15}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
                        focusedField === 'password' ? 'text-gray-700' : 'text-gray-300'
                      }`}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full h-12 pl-11 pr-12 border rounded-none text-sm text-gray-900 font-bold placeholder-gray-300 outline-none transition-all duration-200 ${
                        errors.password
                          ? 'bg-red-50 border-red-200 focus:border-red-500'
                          : focusedField === 'password'
                            ? 'bg-white border-gray-900'
                            : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                      {...register('password', {
                        required: 'Password required',
                        minLength: { value: 6, message: 'Min 6 characters' }
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-700 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    {/* Focus bar */}
                    <AnimatePresence>
                      {focusedField === 'password' && (
                        <motion.div
                          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 origin-left"
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password strength meter */}
                  <AnimatePresence>
                    {pwdWatch && pwdWatch.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2"
                      >
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map(i => (
                            <motion.div
                              key={i}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className={`h-0.5 flex-1 origin-left rounded-none transition-all duration-400 ${
                                i <= strength.score ? strength.color : 'bg-gray-100'
                              }`}
                            />
                          ))}
                        </div>
                        {strength.label && (
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Strength: <span className="text-gray-700">{strength.label}</span>
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="text-[10px] text-red-500 font-bold mt-1.5 uppercase tracking-widest"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Remember */}
                <motion.div variants={item} className="flex items-center gap-3 py-1">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded-none border-gray-200 text-gray-900 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-gray-900"
                    defaultChecked
                  />
                  <label htmlFor="remember" className="text-[10px] text-gray-400 font-bold uppercase tracking-widest cursor-pointer select-none">
                    Stay signed in for 30 days
                  </label>
                </motion.div>

                {/* CTA */}
                <motion.div variants={item}>
                  <motion.button
                    type="submit"
                    id="login-submit-btn"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black uppercase text-[11px] tracking-[0.25em] rounded-none transition-colors flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {/* Shimmer sweep on hover */}
                    <div className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Authenticating…</span>
                      </div>
                    ) : (
                      <>
                        <Fingerprint size={16} className="opacity-70" />
                        <span>Secure Sign In</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>
            </form>

            {/* Sign up */}
            <motion.div variants={item} className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                No account?{' '}
                <Link to="/register" className="text-gray-900 underline underline-offset-4 hover:text-emerald-600 transition-colors decoration-gray-200 hover:decoration-emerald-400">
                  Join the Network
                </Link>
              </p>
              <div className="flex items-center gap-1.5 text-gray-300">
                <Shield size={11} />
                <span className="text-[9px] font-black uppercase tracking-widest">256-bit SSL</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
