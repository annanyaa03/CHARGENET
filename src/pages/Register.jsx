import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Zap, User, Mail, Lock, Car, ChevronRight, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Navbar } from '../components/layout/Navbar'
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
    <>
      <Navbar solid />
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-4 py-12 pt-28 relative overflow-hidden">
        {/* Background Decorative Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/10"
            >
              <Zap size={24} color="white" strokeWidth={1.5} fill="white" />
            </motion.div>
            <h1 className="text-2xl font-serif font-bold text-primary tracking-[0.2em] uppercase">Create your account</h1>
            <p className="text-muted/60 mt-3 text-[11px] font-bold uppercase tracking-widest">Join India's most advanced EV charging network</p>
          </div>

          <div className="bg-white border border-border/40 rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] backdrop-blur-md bg-white/90">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <Input
                  label="FULL NAME"
                  type="text"
                  id="reg-name"
                  placeholder="ARJUN SHARMA"
                  icon={User}
                  className="uppercase tracking-widest text-[10px]"
                  error={errors.name?.message}
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
                />
                <Input
                  label="EMAIL ADDRESS"
                  type="email"
                  id="reg-email"
                  placeholder="YOU@EXAMPLE.COM"
                  icon={Mail}
                  className="uppercase tracking-widest text-[10px]"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
                  })}
                />
                
                <div className="grid grid-cols-1 gap-4">
                  <Select
                    label="ACCOUNT TYPE"
                    id="reg-role"
                    className="uppercase tracking-widest text-[10px]"
                    error={errors.role?.message}
                    {...register('role')}
                  >
                    <option value="driver">EV DRIVER</option>
                    <option value="owner">STATION OWNER</option>
                  </Select>
                </div>

                <AnimatePresence mode="wait">
                  {role === 'driver' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <Input
                        label="EV MODEL (OPTIONAL)"
                        type="text"
                        id="reg-evmodel"
                        placeholder="e.g. TATA NEXON EV"
                        icon={Car}
                        className="uppercase tracking-widest text-[10px]"
                        {...register('evModel')}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted/60 ml-0.5">Password</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-accent">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="reg-password"
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-10 py-3 bg-white border border-border/80 rounded-xl text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                      {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[11px] font-medium text-danger mt-1 ml-1">{errors.password.message}</p>}
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  loading={loading} 
                  id="register-submit-btn"
                  className="py-4 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-black/5 active:scale-[0.98] transition-all bg-black hover:bg-black/90"
                  iconRight={ChevronRight}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-[11px] text-muted/50 font-bold uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:text-accent/80 transition-colors">
                Sign in
              </Link>
            </p>
            
            <Link to="/" className="inline-flex items-center gap-2 text-[10px] text-muted/40 hover:text-accent mt-10 font-bold uppercase tracking-[0.2em] transition-colors group">
              <ArrowLeft size={10} className="transition-transform group-hover:-translate-x-1" />
              Back to home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
