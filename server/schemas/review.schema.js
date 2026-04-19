import { z } from 'zod'

export const createReviewSchema = z.object({
  station_id: z.string()
    .uuid('Invalid station ID'),
  
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .or(
      z.string()
        .transform(v => parseInt(v))
        .pipe(
          z.number()
            .int()
            .min(1)
            .max(5)
        )
    ),
  
  comment: z.string()
    .min(5, 'Comment must be at least 5 characters')
    .max(500, 'Comment cannot exceed 500 characters')
    .trim()
    .optional(),
  
  user_name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name too long')
    .trim()
    .optional()
    .default('Anonymous')
})

export const reviewIdSchema = z.object({
  id: z.string()
    .uuid('Invalid review ID')
})
