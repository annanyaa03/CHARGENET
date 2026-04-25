import supabase from '../lib/supabase.js'
import logger from '../lib/logger.js'
import path from 'path'

export const storageService = {

  uploadStationImage: async (file, stationId) => {
    const fileName = `stations/${stationId}/${Date.now()}-${file.originalname.replace(/\s/g, '-')}`

    const { data, error } = await supabase
      .storage
      .from('station-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('station-images')
      .getPublicUrl(fileName)

    logger.info({
      stationId,
      fileName,
      size: file.size
    }, 'Station image uploaded')

    return publicUrl
  },

  uploadProfilePhoto: async (file, userId) => {
    const fileName = `profiles/${userId}/avatar-${Date.now()}${path.extname(file.originalname)}`

    const { data, error } = await supabase
      .storage
      .from('profile-photos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true  // Replace existing
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase
      .storage
      .from('profile-photos')
      .getPublicUrl(fileName)

    logger.info({
      userId,
      fileName,
      size: file.size
    }, 'Profile photo uploaded')

    return publicUrl
  },

  deleteImage: async (bucket, fileName) => {
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([fileName])

    if (error) throw error
    
    logger.info({ bucket, fileName }, 'Image deleted')
    
    return true
  },

  listStationImages: async (stationId) => {
    const { data, error } = await supabase
      .storage
      .from('station-images')
      .list(`stations/${stationId}`)

    if (error) throw error
    return data || []
  }
}
