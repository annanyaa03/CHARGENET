const { supabaseAdmin } = require('../config/supabase');

/**
 * @desc    Get user profile
 * @route   GET /api/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user is already populated by authMiddleware
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { 
      full_name, 
      phone, 
      vehicle_type, 
      vehicle_number, 
      avatar_url 
    } = req.body;

    const updates = {};
    if (full_name) updates.full_name = full_name;
    if (phone) updates.phone = phone;
    if (vehicle_type) updates.vehicle_type = vehicle_type;
    if (vehicle_number) updates.vehicle_number = vehicle_number;
    if (avatar_url) updates.avatar_url = avatar_url;
    updates.updated_at = new Date();

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

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
  getProfile,
  updateProfile
};
