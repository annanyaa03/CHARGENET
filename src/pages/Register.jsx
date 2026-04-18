import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Zap, User, Mail, Lock, Car, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Navbar } from '../components/layout/Navbar'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const registerUser = useAuthStore(s => s.register)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'driver' } })
  const role = watch('role')

  React.useEffect(() => { 
    document.title = 'Create Account — ChargeNet'
    window.scrollTo(0, 0)
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await registerUser(data)
      toast.success(`Welcome to ChargeNet, ${user.user_metadata?.full_name?.split(' ')[0] || 'User'}!`)
      if (user.role === 'owner') navigate('/owner/dashboard')
      else navigate('/')
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1, 
      transition: { staggerChildren: 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col font-sans selection:bg-accent/10">
      <Navbar solid />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-20 sm:pt-32 sm:pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-[400px]"
        >
          {/* Brand & Identity */}
          <motion.div variants={item} className="mb-6">
            <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-xl shadow-primary/10">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <h2 className="heading-premium text-2xl mb-0">ChargeNet</h2>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div variants={item} className="mb-8">
            <h1 className="heading-premium text-2xl mb-1">Join the Network</h1>
            <p className="label-premium !text-[9px] !text-muted/40 !tracking-[0.2em]">Create an account to start your smart charging journey</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <motion.div variants={item} className="space-y-6">
              
              {/* Full Name */}
              <div className="relative group">
                <label className={`absolute left-0 -top-6 label-premium !text-[9px] transition-all ${focusedField === 'name' ? '!text-accent' : '!text-muted/30'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className={`absolute left-0 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'name' ? 'text-accent' : 'text-muted/40'}`} />
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Arjun Sharma"
                    className="w-full bg-transparent border-b border-border/60 py-4 pl-8 text-sm outline-none transition-all placeholder:text-muted/20 focus:border-accent"
                  />
                  <motion.div 
                    initial={false}
                    animate={{ scaleX: focusedField === 'name' ? 1 : 0 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent origin-left"
                  />
                </div>
                {errors.name && <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-widest">{errors.name.message}</p>}
              </div>

              {/* Email */}
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

              {/* Account Type Toggle (Subtle) */}
              <div className="space-y-4">
                <label className="label-premium !text-[9px] !text-muted/30 block">Account Type</label>
                <div className="flex gap-4">
                  {['driver', 'owner'].map((t) => (
                    <label key={t} className="relative flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        value={t} 
                        {...register('role')} 
                        className="peer sr-only"
                      />
                      <div className="w-full py-3.5 px-4 border border-border/60 rounded-xl text-center label-premium !text-[9px] !text-muted/40 !tracking-widest peer-checked:border-accent peer-checked:bg-accent/5 peer-checked:text-accent transition-all hover:bg-surface">
                        {t === 'driver' ? 'EV Driver' : 'Station Owner'}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* EV Model (Conditional) */}
              <AnimatePresence mode="wait">
                {role === 'driver' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative pt-4"
                  >
                    <label className={`absolute left-0 -top-2 label-premium !text-[9px] transition-all ${focusedField === 'ev' ? '!text-accent' : '!text-muted/40'}`}>
                      Vehicle Model (Optional)
                    </label>
                    <div className="relative group mt-4">
                      <Car size={16} className={`absolute left-0 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'ev' ? 'text-accent' : 'text-muted/40'}`} />
                      <input
                        type="text"
                        {...register('evModel')}
                        onFocus={() => setFocusedField('ev')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g. Tata Nexon EV"
                        className="w-full bg-transparent border-b border-border py-3 pl-8 text-sm outline-none transition-all placeholder:text-muted/20 focus:border-accent"
                      />
                      <motion.div 
                        initial={false}
                        animate={{ scaleX: focusedField === 'ev' ? 1 : 0 }}
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent origin-left"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password */}
              <div className="relative group">
                <label className={`absolute left-0 -top-6 label-premium !text-[9px] transition-all ${focusedField === 'password' ? '!text-accent' : '!text-muted/30'}`}>
                  Choice of Password
                </label>
                <div className="relative">
                  <Lock size={16} className={`absolute left-0 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-accent' : 'text-muted/40'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
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
                  <motion.div 
                    initial={false}
                    animate={{ scaleX: focusedField === 'password' ? 1 : 0 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent origin-left"
                  />
                </div>
                {errors.password && <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-widest">{errors.password.message}</p>}
              </div>

            </motion.div>

            {/* CTA */}
            <motion.div variants={item} className="pt-6">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                className="w-full h-14 bg-primary text-white font-bold uppercase text-[11px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/10 hover:bg-black transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>
                    <span>Create My Account</span>
                    <ArrowRight size={18} className="opacity-50" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Footer Link */}
          <motion.div variants={item} className="mt-16 text-center">
            <p className="label-premium !text-[9px] !text-muted/40">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:text-accent transition-colors underline underline-offset-4 decoration-border/60 hover:decoration-accent/40">
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Background Decor (Subtle) */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>
    </div>
  )
}
