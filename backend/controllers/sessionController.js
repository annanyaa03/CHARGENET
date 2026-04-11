const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * @desc    Start charging session
 * @route   POST /api/sessions/start
 * @access  Private
 */
const startSession = async (req, res, next) => {
  try {
    const { booking_id } = req.body;

    // 1. Check if booking is confirmed and paid
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
        return res.status(400).json({ success: false, message: 'Booking must be confirmed to start session' });
    }

    // 2. Create session record
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .insert([{
        booking_id,
        station_id: booking.station_id,
        slot_id: booking.slot_id,
        user_id: req.user.id,
        start_time: new Date(),
        status: 'active'
      }])
      .select()
      .single();

    if (sessionError) throw sessionError;

    // 3. Update slot status to 'charging'
    await supabaseAdmin
        .from('slots')
        .update({ status: 'charging' })
        .eq('id', booking.slot_id);

    res.status(201).json({
      success: true,
      message: 'Charging session started',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Stop charging session
 * @route   POST /api/sessions/stop
 * @access  Private
 */
const stopSession = async (req, res, next) => {
  try {
    const { session_id } = req.body;

    const { data: session, error: fetchError } = await supabase
      .from('sessions')
      .select('*, bookings(total_amount)')
      .eq('id', session_id)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status === 'completed') {
        return res.status(400).json({ success: false, message: 'Session already completed' });
    }

    // Simple simulation logic: Energy consumed is roughly what was estimated
    const energy_consumed = 50.5; // In reality, this comes from the charger API
    const total_cost = session.bookings.total_amount;

    // 1. Update session to completed
    const { data: updatedSession, error: updateError } = await supabaseAdmin
      .from('sessions')
      .update({
        end_time: new Date(),
        energy_consumed_kwh: energy_consumed,
        total_cost: total_cost,
        status: 'completed'
      })
      .eq('id', session_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. Update slot status back to 'available'
    await supabaseAdmin
        .from('slots')
        .update({ status: 'available' })
        .eq('id', session.slot_id);

    // 3. Update booking status to 'completed'
    await supabaseAdmin
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', session.booking_id);

    res.status(200).json({
      success: true,
      message: 'Charging session stopped',
      data: updatedSession
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's session history
 * @route   GET /api/sessions/my
 * @access  Private
 */
const getMySessions = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, stations(name, address)')
      .eq('user_id', req.user.id)
      .order('start_time', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startSession,
  stopSession,
  getMySessions
};
