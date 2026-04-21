import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const { signUp } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }
  
  // ... passwordStrength ...

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.fullName || !form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await signUp(form.email, form.password, form.fullName)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 border border-gray-900 flex items-center justify-center mx-auto mb-8">
            <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="text-2xl font-normal text-gray-900 tracking-tight mb-3">
            Check your email
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-2">
            We sent a verification link to
          </p>
          <p className="text-sm text-gray-900 font-medium mb-8">
            {form.email}
          </p>
          <p className="text-xs text-gray-400 leading-relaxed mb-8">
            Click the link to activate your account. Check spam if you don't see it.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="w-full bg-gray-900 text-white py-3 text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors text-center">
              Go to sign in
            </Link>
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      
      {/* LEFT PANEL - Dark */}
      <div className="hidden lg:flex w-1/2 bg-gray-950 flex-col justify-between p-12">
        
        {/* Logo */}
        <Link to="/" className="text-white text-sm font-semibold tracking-widest uppercase">
          ChargeNet
        </Link>

        {/* Center */}
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-6">
            Get started free
          </p>
          <h2 className="text-4xl font-normal text-white leading-snug tracking-tight mb-6">
            Start charging
            <br />
            smarter
            <br />
            today.
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-10">
            Join thousands of EV drivers across India who book, track and manage their charging with ChargeNet.
          </p>
          <div className="space-y-3">
            {[
              'Free account, no credit card',
              'Access 80+ stations instantly',
              'Book slots in under a minute',
              'Track sessions and spending'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1 h-1 bg-gray-600 flex-shrink-0"></div>
                <span className="text-xs text-gray-500">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-xs text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12 overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link to="/" className="text-gray-900 text-sm font-semibold tracking-widest uppercase">
            ChargeNet
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 max-w-sm">
          <h1 className="text-2xl font-normal text-gray-900 tracking-tight mb-2">
            Create account
          </h1>
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-900 hover:underline underline-offset-2">
              Sign in
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

          {/* Full Name */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">
              Full name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => updateForm('fullName', e.target.value)}
              placeholder="Rahul Sharma"
              required
              autoFocus
              autoComplete="name"
              className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">
              Email address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => updateForm('password', e.target.value)}
                placeholder="Min. 8 characters"
                required
                autoComplete="new-password"
                className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>

            {/* Password strength bar */}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-0.5 flex-1 transition-all ${i <= strength.score ? strength.color : 'bg-gray-100'}`}></div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {strength.label} password
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => updateForm('confirmPassword', e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className={`w-full border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none transition-colors pr-12 ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-200 focus:border-red-300' : 'border-gray-200 focus:border-gray-900'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>

            {/* Match indicator */}
            {form.confirmPassword && form.password === form.confirmPassword && (
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                Passwords match
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Terms */}
        <p className="text-xs text-gray-300 max-w-sm mt-8 leading-relaxed">
          By creating an account you agree to our{' '}
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

export default Register
