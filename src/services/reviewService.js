import { supabase } from '../lib/supabase'

export const getReviewsByStation = async (stationId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('station_id', stationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return { success: false, data: [] }
  }

  // Map to frontend expectation
  const mapped = (data || []).map(r => ({
    id: r.id,
    reviewerName: r.profiles?.full_name || 'Anonymous',
    avatarUrl: r.profiles?.avatar_url,
    rating: r.rating,
    text: r.comment,
    date: r.created_at,
    tags: [] // If we add tags later
  }))

  return { success: true, data: mapped }
}

export const submitReview = async (stationId, reviewData) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be logged in to review')

  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      station_id: stationId,
      user_id: user.id,
      rating: reviewData.rating,
      comment: reviewData.comment
    }])
    .select()
    .single()

  if (error) throw error
  return { success: true, data }
}
