import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight, Shield, ChevronRight, BatteryCharging, MapPin, Users } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const DEMO_ACCOUNTS = [
  { label: 'Driver', email: 'driver@chargenet.in', desc: 'Book slots & manage trips' },
  { label: 'Owner', email: 'owner@chargenet.in', desc: 'Manage your stations' },
  { label: 'Admin', email: 'admin@chargenet.in', desc: 'Full platform access' },
]

const STATS = [
  { icon: BatteryCharging, value: '10,000+', label: 'Charging Sessions' },
  { icon: MapPin, value: '500+', label: 'Stations Across India' },
  { icon: Users, value: '50,000+', label: 'Active Users' },
]

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeDemo, setActiveDemo] = useState(null)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  React.useEffect(() => { document.title = 'Sign In — ChargeNet' }, [])

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

  return (
    <div className="min-h-screen flex">

      {/* ─── Left Panel — Brand & Visual ─── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gray-950">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Logo */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 hover:no-underline group">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/10 group-hover:shadow-white/20 transition-shadow">
                <Zap size={22} className="text-gray-900" fill="currentColor" strokeWidth={1} />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">ChargeNet</span>
            </Link>
          </div>

          {/* Main content */}
          <div className="max-w-lg">
            <h2 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.1] mb-5">
              India's smartest
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                EV charging
              </span>
              <br />
              network.
            </h2>
            <p className="text-gray-400 text-base leading-relaxed max-w-md">
              Join thousands of EV owners who trust ChargeNet for reliable, 
              fast, and affordable charging across India.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-10">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} className="text-emerald-400" />
                    <span className="text-2xl font-black text-white tracking-tight">{value}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom testimonial */}
          <div className="max-w-lg">
            <div className="border-t border-white/5 pt-8">
              <p className="text-gray-400 text-sm leading-relaxed italic mb-4">
                "ChargeNet made EV ownership hassle-free. I can find a charger anywhere in the city 
                and the booking process is seamless."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Ananya R.</p>
                  <p className="text-xs text-gray-500">Tata Nexon EV Owner, Pune</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Login Form ─── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full" />
        
        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2.5 hover:no-underline">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                <Zap size={20} color="white" fill="white" strokeWidth={1} />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">ChargeNet</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1.5">Welcome back</h1>
            <p className="text-sm text-gray-500 font-medium">
              Sign in to your account to continue
            </p>
          </div>

          {/* Demo quick-fill buttons */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className={`relative p-3 rounded-xl border text-center transition-all duration-200 group ${
                    activeDemo === acc.label
                      ? 'border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <p className="text-xs font-bold">{acc.label}</p>
                  <p className={`text-[10px] mt-0.5 ${activeDemo === acc.label ? 'text-gray-400' : 'text-gray-400'}`}>
                    {acc.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">or enter credentials</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="text-xs font-bold text-gray-700 block mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  id="login-email"
                  placeholder="you@example.com"
                  className={`w-full h-12 pl-10 pr-4 bg-gray-50 border rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 outline-none transition-all duration-200 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-100 focus:border-gray-300 focus:ring-2 focus:ring-gray-100 focus:bg-white'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
                  })}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 font-medium mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="text-xs font-bold text-gray-700">
                  Password
                </label>
                <button type="button" className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  placeholder="Enter your password"
                  className={`w-full h-12 pl-10 pr-12 bg-gray-50 border rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 outline-none transition-all duration-200 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-100 focus:border-gray-300 focus:ring-2 focus:ring-gray-100 focus:bg-white'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 font-medium mt-1.5">{errors.password.message}</p>}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5 py-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-200 text-gray-900 focus:ring-gray-300 cursor-pointer"
                defaultChecked
              />
              <label htmlFor="remember" className="text-xs text-gray-500 font-medium cursor-pointer select-none">
                Keep me signed in for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-gray-900/10 hover:shadow-xl hover:shadow-gray-900/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-5 text-gray-300">
            <Shield size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">256-bit SSL encrypted</span>
          </div>

          {/* Sign up link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-gray-900 font-bold hover:underline">
                Create one
                <ChevronRight size={13} className="inline ml-0.5 -mt-px" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
