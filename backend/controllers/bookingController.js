const { supabase, supabaseAdmin } = require('../config/supabase');
const { calculateBookingAmount } = require('../utils/helpers');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res, next) => {
  try {
    const { 
        station_id, 
        slot_id, 
        scheduled_date, 
        start_time, 
        end_time,
        duration_hours,
        estimated_units
    } = req.body;

    // 1. Fetch station details for price
    const { data: station, error: stationError } = await supabase
        .from('stations')
        .select('*')
        .eq('id', station_id)
        .single();

    if (stationError || !station) {
        return res.status(404).json({ success: false, message: 'Station not found' });
    }

    // 2. Check for conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('bookings')
      .select('id')
      .eq('slot_id', slot_id)
      .eq('scheduled_date', scheduled_date)
      .eq('status', 'confirmed')
      .filter('start_time', 'lt', end_time)
      .filter('end_time', 'gt', start_time);

    if (conflictError) throw conflictError;

    if (conflicts.length > 0) {
      return res.status(400).json({ success: false, message: 'Slot is already booked for this time window' });
    }

    // 3. Calculate total amount
    const total_amount = calculateBookingAmount(duration_hours, station.price_per_kwh, estimated_units);

    // 4. Create booking (Pending status)
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert([{
        user_id: req.user.id,
        station_id,
        slot_id,
        scheduled_date,
        start_time,
        end_time,
        duration_hours,
        estimated_units,
        total_amount,
        status: 'pending',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (bookingError) throw bookingError;

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's bookings
 * @route   GET /api/bookings/my
 * @access  Private
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, stations(name, address), slots(slot_number)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking details
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('bookings')
      .select('*, stations(*), slots(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Authorization check
    if (data.user_id !== req.user.id && req.user.role !== 'admin') {
        // Also allow the station owner to see this
        const { data: station } = await supabase
            .from('stations')
            .select('owner_id')
            .eq('id', data.station_id)
            .single();
        
        if (!station || station.owner_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
        }
    }

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel booking
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
        return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });
    }

    // Logic: If already paid, the refund should be handled in paymentController
    // Here we just mark as cancelled
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings for a station
 * @route   GET /api/bookings/station/:stationId
 * @access  Private (Owner/Admin)
 */
const getStationBookings = async (req, res, next) => {
  try {
    const { stationId } = req.params;

    // Authorization check
    const { data: station } = await supabase
        .from('stations')
        .select('owner_id')
        .eq('id', stationId)
        .single();

    if (!station || station.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view bookings for this station' });
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles(full_name, phone)')
      .eq('station_id', stationId)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getStationBookings
};
