const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * @desc    Get all slots for a station with availability
 * @route   GET /api/slots/:stationId
 * @access  Public
 */
const getSlots = async (req, res, next) => {
  try {
    const { stationId } = req.params;

    const { data: slots, error } = await supabase
      .from('slots')
      .select('*')
      .eq('station_id', stationId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check available slots for a time window
 * @route   GET /api/slots/:stationId/available?date=&start_time=&end_time=
 * @access  Public
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { date, start_time, end_time } = req.query;

    if (!date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Please provide date, start_time, and end_time' });
    }

    // 1. Get all slots for the station
    const { data: slots, error: slotError } = await supabase
      .from('slots')
      .select('*')
      .eq('station_id', stationId);

    if (slotError) throw slotError;

    // 2. Get overlapping bookings for this station and timeframe
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('slot_id')
      .eq('station_id', stationId)
      .eq('scheduled_date', date)
      .eq('status', 'confirmed') // Only check confirmed bookings
      .filter('start_time', 'lt', end_time)
      .filter('end_time', 'gt', start_time);

    if (bookingError) throw bookingError;

    const bookedSlotIds = bookings.map(b => b.slot_id);

    // 3. Filter slots that are not booked and are available (status)
    const availableSlots = slots.filter(slot => 
      slot.status === 'available' && !bookedSlotIds.includes(slot.id)
    );

    res.status(200).json({
      success: true,
      count: availableSlots.length,
      data: availableSlots
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update slot status
 * @route   PATCH /api/slots/:id/status
 * @access  Private (Owner/Admin)
 */
const updateSlotStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: updatedSlot, error } = await supabaseAdmin
      .from('slots')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: updatedSlot
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSlots,
  getAvailableSlots,
  updateSlotStatus
};
