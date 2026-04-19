import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password too long')
    .regex(
      /[A-Z]/,
      'Password must contain at least one uppercase letter'
    )
    .regex(
      /[0-9]/,
      'Password must contain at least one number'
    ),
  
  full_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .trim()
    .optional()
})

export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(1, 'Password is required')
    .max(72, 'Password too long')
})

export const resetPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
})

export const updatePasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must have uppercase letter')
    .regex(/[0-9]/, 'Must have a number'),
  
  confirm_password: z.string()
    .min(1, 'Please confirm password')
}).refine(
  data => data.password === data.confirm_password,
  {
    message: 'Passwords do not match',
    path: ['confirm_password']
  }
)
