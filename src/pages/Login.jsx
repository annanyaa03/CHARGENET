import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight, Shield, Fingerprint, Sparkles, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Navbar } from '../components/layout/Navbar'
import toast from 'react-hot-toast'

/* ─── Demo Data ────────────────────────────────────────────────── */

const DEMO_ACCOUNTS = [
  { label: 'Driver', email: 'driver@chargenet.in' },
  { label: 'Owner', email: 'owner@chargenet.in' },
  { label: 'Admin', email: 'admin@chargenet.in' },
]

/* ─── Main Component ────────────────────────────────────────────── */

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

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

  const fillDemo = (email) => {
    setValue('email', email)
    setValue('password', 'password123')
    toast.success('Demo credentials filled')
  }

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col font-sans selection:bg-accent/10">
      <Navbar solid />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20 sm:pt-40">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-[400px]"
        >
          {/* Brand & Identity */}
          <motion.div variants={item} className="flex flex-col items-center mb-8">
            <Link to="/" className="group flex flex-col items-center gap-4">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.05 }}
                className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/10 transition-colors group-hover:bg-primary/90"
              >
                <Zap size={24} className="text-white fill-white" />
              </motion.div>
              <div className="text-center">
                <h2 className="heading-premium text-3xl mb-1">ChargeNet</h2>
                <p className="label-premium !text-muted/40 !tracking-[0.4em]">Intelligent EV Network</p>
              </div>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div variants={item} className="mb-8 text-center">
            <h1 className="heading-premium text-2xl text-primary">Welcome Back</h1>
            <p className="label-premium !text-[9px] !text-muted/30 mt-2">Sign in to manage your charging experience</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <motion.div variants={item} className="space-y-6">
              
              {/* Email Field */}
              <div className="relative group">
                <label className={`absolute left-0 -top-6 label-premium !text-[9px] transition-all ${focusedField === 'email' ? '!text-accent' : '!text-muted/30'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className={`absolute left-0 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-accent' : 'text-muted/40'}`} />
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="name@example.com"
                    className="w-full bg-transparent border-b border-border/60 py-4 pl-8 text-sm outline-none transition-all placeholder:text-muted/20 focus:border-accent"
                  />
                  <motion.div 
                    initial={false}
                    animate={{ scaleX: focusedField === 'email' ? 1 : 0 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent origin-left"
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-widest">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="relative group">
                <label className={`absolute left-0 -top-6 label-premium !text-[9px] transition-all ${focusedField === 'password' ? '!text-accent' : '!text-muted/30'}`}>
                  Access Password
                </label>
                <div className="flex justify-between items-center mb-1">
                  <button type="button" className="absolute right-0 -top-6 label-premium !text-[9px] !text-muted/40 hover:!text-primary transition-all">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className={`absolute left-0 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-accent' : 'text-muted/40'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-b border-border/60 py-4 pl-8 pr-10 text-sm outline-none transition-all placeholder:text-muted/20 focus:border-accent"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted/40 hover:text-muted transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {/* Animated line under input */}
                  <motion.div 
                    initial={false}
                    animate={{ scaleX: focusedField === 'password' ? 1 : 0 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent origin-left"
                  />
                </div>
                {errors.password && <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-widest">{errors.password.message}</p>}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div variants={item} className="pt-4 flex flex-col gap-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                className="w-full h-14 bg-primary text-white font-bold uppercase text-[11px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-primary/10 hover:bg-black transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : (
                  <>
                    <Fingerprint size={18} />
                    Sign In
                    <ArrowRight size={18} className="opacity-50" />
                  </>
                )}
              </motion.button>
              
              <div className="text-center">
                <p className="text-[10px] font-bold text-muted/50 uppercase tracking-widest">
                  Secure Access • 256-bit Encryption
                </p>
              </div>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={item} className="my-12 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-border/40" />
            <span className="text-[9px] font-bold text-muted/30 uppercase tracking-[0.3em]">Demographics</span>
            <div className="flex-1 h-[1px] bg-border/40" />
          </motion.div>

          {/* Demo Access Links */}
          <motion.div variants={item} className="grid grid-cols-3 gap-3">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.label}
                onClick={() => fillDemo(acc.email)}
                className="px-5 py-2.5 rounded-full border border-border/60 label-premium !text-[9px] !text-muted/60 hover:bg-surface hover:border-accent/40 hover:text-accent transition-all"
              >
                {acc.label}
              </button>
            ))}
          </motion.div>

          {/* Footer Link */}
          <motion.div variants={item} className="mt-16 text-center">
            <p className="text-xs text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:text-accent transition-colors underline underline-offset-4 decoration-border/60 hover:decoration-accent/40">
                Join the Network
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Background Decor (Subtle) */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />
      </div>
    </div>
  )
}
