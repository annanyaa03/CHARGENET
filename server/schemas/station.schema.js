import { z } from 'zod'

// Schema for creating a station
export const createStationSchema = z.object({
  name: z.string()
    .min(3, 'Station name must be at least 3 characters')
    .max(100, 'Station name too long')
    .trim(),
  
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address too long')
    .trim(),
  
  city: z.string()
    .min(2, 'City name too short')
    .max(50, 'City name too long')
    .trim(),
  
  state: z.string()
    .min(2, 'State name too short')
    .max(50, 'State name too long')
    .trim(),
  
  lat: z.number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .or(z.string().transform(val => 
      parseFloat(val)
    )),
  
  lng: z.number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .or(z.string().transform(val => 
      parseFloat(val)
    )),
  
  slug: z.string()
    .min(3, 'Slug too short')
    .max(100, 'Slug too long')
    .regex(
      /^[a-z0-9-]+$/, 
      'Slug must be lowercase letters, numbers and hyphens only'
    )
    .optional(),
  
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  
  total_slots: z.number()
    .int('Must be whole number')
    .min(1, 'Must have at least 1 slot')
    .max(50, 'Too many slots')
    .default(3),
  
  status: z.enum(
    ['active', 'inactive', 'maintenance'],
    { 
      errorMap: () => ({ 
        message: 'Status must be active, inactive or maintenance' 
      })
    }
  ).default('active')
})

// Schema for updating a station
export const updateStationSchema = 
  createStationSchema.partial()

// Schema for station ID param
export const stationIdSchema = z.object({
  id: z.string()
    .uuid('Invalid station ID format')
})

// Schema for station slug param  
export const stationSlugSchema = z.object({
  slug: z.string()
    .min(1, 'Slug is required')
})

// Schema for station query params
export const stationQuerySchema = z.object({
  city: z.string().optional(),
  status: z.enum([
    'active', 'inactive', 'maintenance'
  ]).optional(),
  limit: z.string()
    .transform(v => parseInt(v))
    .pipe(z.number().min(1).max(100))
    .optional()
    .default('50'),
  offset: z.string()
    .transform(v => parseInt(v))
    .pipe(z.number().min(0))
    .optional()
    .default('0'),
  search: z.string()
    .max(100)
    .optional()
})
