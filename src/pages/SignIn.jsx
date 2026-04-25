import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    console.log('[SignIn] Submit clicked')
    console.log('[SignIn] Email:', email)
    console.log('[SignIn] Password length:', password.length)
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    setLoading(true)
    
    try {
      console.log('[SignIn] Attempting sign in...')
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })
      
      console.log('[SignIn] Auth data:', data)
      console.log('[SignIn] Auth error:', authError)
      
      if (authError) {
        console.error('[SignIn] Error:', authError.message)
        throw authError
      }
      
      if (data?.user) {
        console.log('[SignIn] Success! User:', data.user.email)
        
        const from = location.state?.from?.pathname || '/dashboard'
        
        console.log('[SignIn] Redirecting to:', from)
        navigate(from, { replace: true })
      }
    } catch (err) {
      console.error('[SignIn] Catch error:', err)
      setError(
        err.message === 'Invalid login credentials'
          ? 'Incorrect email or password'
          : err.message || 'Sign in failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      
      {/* LEFT PANEL - Dark */}
      <div className="hidden lg:flex w-1/2 bg-gray-950 flex-col justify-between p-12">
        
        {/* Logo */}
        <Link to="/" className="text-white text-sm font-semibold tracking-widest uppercase">
          ChargeNet
        </Link>

        {/* Center content */}
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-6">
            Welcome back
          </p>
          <h2 className="text-4xl font-normal text-white leading-snug tracking-tight mb-6">
            India's largest
            <br />
            EV charging
            <br />
            network.
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Access 80+ charging stations, 
            book slots and track your 
            sessions from one dashboard.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-3 border-t border-gray-800 pt-8">
          {[
            { value: '80+', label: 'Stations' },
            { value: '24/7', label: 'Available' },
            { value: '₹8', label: 'Per kWh' }
          ].map((stat, i) => (
            <div key={i} className={`${i !== 0 ? 'border-l border-gray-800 pl-6' : ''}`}>
              <p className="text-xl font-normal text-white mb-0.5">
                {stat.value}
              </p>
              <p className="text-xs text-gray-600">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12">
        
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link to="/" className="text-gray-900 text-sm font-semibold tracking-widest uppercase">
            ChargeNet
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 max-w-sm">
          <h1 className="text-2xl font-normal text-gray-900 tracking-tight mb-2">
            Sign in
          </h1>
          <p className="text-sm text-gray-400">
            No account?{' '}
            <Link to="/register" className="text-gray-900 hover:underline underline-offset-2">
              Create one free
            </Link>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 mb-6 max-w-sm">
            <p className="text-xs text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 max-w-sm w-full">
          
          {/* Email */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="you@example.com"
              required
              autoFocus
              autoComplete="email"
              className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400 uppercase tracking-widest">
                Password
              </label>
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8 max-w-sm">
          <div className="flex-1 h-px bg-gray-100"></div>
          <span className="text-xs text-gray-300">or</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        {/* Browse without account */}
        <Link to="/map" className="max-w-sm w-full border border-gray-200 text-gray-500 py-3.5 text-xs font-semibold uppercase tracking-widest hover:border-gray-400 hover:text-gray-700 transition-colors text-center block">
          Browse without account
        </Link>

        {/* Terms */}
        <p className="text-xs text-gray-300 max-w-sm mt-8 leading-relaxed">
          By continuing you agree to our{' '}
          <Link to="/terms" className="text-gray-400 hover:text-gray-600">
            Terms
          </Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-gray-400 hover:text-gray-600">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignIn
