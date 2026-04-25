import multer from 'multer'
import path from 'path'

// File filter - only allow images
const imageFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ]
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Only JPEG, PNG and WebP images allowed'
      ),
      false
    )
  }
}

// Memory storage (upload to Supabase Storage)
const memoryStorage = multer.memoryStorage()

// Station image upload
export const uploadStationImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 3 // Max 3 images per station
  }
})

// Profile photo upload  
export const uploadProfilePhoto = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
    files: 1 // Single profile photo
  }
})

// Review photo upload
export const uploadReviewPhoto = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB max
    files: 2 // Max 2 photos per review
  }
})
