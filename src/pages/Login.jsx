import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Zap, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap size={20} color="white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-semibold text-primary">Welcome back</h1>
          <p className="text-sm text-muted mt-1">Sign in to your ChargeNet account</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-6" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              id="login-email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
              })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-primary">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-surface border border-border rounded-lg text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>
            <Button type="submit" variant="primary" fullWidth loading={loading} id="login-submit-btn">
              Sign In
            </Button>
          </form>

          {/* Demo creds */}
          <div className="mt-4 p-3 bg-background rounded-lg border border-border">
            <p className="text-xs text-muted font-medium mb-2">Demo credentials:</p>
            {[
              { label: 'Driver', email: 'driver@chargenet.in' },
              { label: 'Owner', email: 'owner@chargenet.in' },
              { label: 'Admin', email: 'admin@chargenet.in' },
            ].map(d => (
              <p key={d.label} className="text-xs text-muted">
                <span className="font-medium text-primary">{d.label}:</span> {d.email} / password123
              </p>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-medium hover:no-underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
