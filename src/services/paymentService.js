import { supabase } from '../lib/supabase'

export const createPaymentOrder = async (bookingId, amount) => {
  // Mocking Razorpay order creation
  return { 
    success: true, 
    data: { 
      id: `order_${Math.random().toString(36).slice(2)}`,
      amount: amount * 100,
      currency: 'INR'
    } 
  }
}

export const verifyPayment = async (data) => {
  const { bookingId, razorpay_payment_id } = data
  
  // Directly update booking status in Supabase (Mocking verification)
  const { data: updated, error } = await supabase
    .from('bookings')
    .update({ 
      payment_status: 'paid',
      status: 'confirmed'
    })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) throw error

  // Create transaction record
  await supabase.from('transactions').insert([{
    booking_id: bookingId,
    amount: updated.total_amount,
    razorpay_payment_id,
    status: 'success'
  }])

  return { success: true, data: updated }
}

export const requestRefund = async (bookingId) => {
  const { error } = await supabase
    .from('bookings')
    .update({ payment_status: 'refunded', status: 'cancelled' })
    .eq('id', bookingId)

  if (error) throw error
  return { success: true }
}

export const getPaymentHistory = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('transactions')
    .select('*, bookings(stations(name))')
    .eq('user_id', user.id)

  if (error) throw error
  return { success: true, data }
}
