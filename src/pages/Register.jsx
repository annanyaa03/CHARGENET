import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Zap, User, Mail, Lock, Car } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/common/Button'
import { Input, Select } from '../components/common/Input'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const registerUser = useAuthStore(s => s.register)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'driver' } })
  const role = watch('role')

  React.useEffect(() => { document.title = 'Create Account — ChargeNet' }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = registerUser(data)
      toast.success(`Welcome to ChargeNet, ${user.name.split(' ')[0]}!`)
      if (user.role === 'owner') navigate('/owner/dashboard')
      else navigate('/')
    } catch (err) {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap size={20} color="white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-semibold text-primary">Create your account</h1>
          <p className="text-sm text-muted mt-1">Join India's EV charging community</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              id="reg-name"
              placeholder="Arjun Sharma"
              icon={User}
              error={errors.name?.message}
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
            />
            <Input
              label="Email"
              type="email"
              id="reg-email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
              })}
            />
            <Select
              label="I am a"
              id="reg-role"
              error={errors.role?.message}
              {...register('role')}
            >
              <option value="driver">EV Driver</option>
              <option value="owner">Charging Station Owner</option>
            </Select>
            {role === 'driver' && (
              <Input
                label="EV Model (optional)"
                type="text"
                id="reg-evmodel"
                placeholder="e.g. Tata Nexon EV"
                icon={Car}
                {...register('evModel')}
              />
            )}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-primary">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password"
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-10 py-2 bg-surface border border-border rounded-lg text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>
            <Button type="submit" variant="primary" fullWidth loading={loading} id="register-submit-btn">
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-medium hover:no-underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
