const { supabase, supabaseAdmin } = require('../config/supabase');
const { haversineDistance } = require('../utils/helpers');

/**
 * @desc    Get all active stations with optional filters
 * @route   GET /api/stations
 * @access  Public
 */
const getStations = async (req, res, next) => {
  try {
    const { city, connector_type, lat, lng, radius = 10 } = req.query;

    let query = supabase
      .from('stations')
      .select('*')
      .eq('status', 'active');

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (connector_type) {
      query = query.contains('connector_types', [connector_type]);
    }

    const { data: stations, error } = await query;

    if (error) throw error;

    // Geo search filter (if lat, lng provided)
    let filteredStations = stations;
    if (lat && lng) {
      filteredStations = stations.filter(station => {
        const distance = haversineDistance(
          parseFloat(lat),
          parseFloat(lng),
          station.lat,
          station.lng
        );
        return distance <= parseFloat(radius);
      });
    }

    res.status(200).json({
      success: true,
      count: filteredStations.length,
      data: filteredStations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single station with slots and reviews
 * @route   GET /api/stations/:id
 * @access  Public
 */
const getStation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: station, error } = await supabase
      .from('stations')
      .select('*, slots(*), reviews(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    res.status(200).json({
      success: true,
      data: station
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new station
 * @route   POST /api/stations
 * @access  Private (Owner/Admin)
 */
const createStation = async (req, res, next) => {
  try {
    const { 
      name, description, address, city, state, lat, lng, 
      total_slots, price_per_kwh, connector_types, amenities 
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('stations')
      .insert([{
        owner_id: req.user.id,
        name, description, address, city, state, lat, lng,
        total_slots, price_per_kwh, connector_types, amenities
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update station
 * @route   PUT /api/stations/:id
 * @access  Private (Owner/Admin)
 */
const updateStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Authorization check
    const { data: station } = await supabase
      .from('stations')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!station || station.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this station' });
    }

    const { data: updatedStation, error } = await supabaseAdmin
      .from('stations')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: updatedStation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete station
 * @route   DELETE /api/stations/:id
 * @access  Private (Owner/Admin)
 */
const deleteStation = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Authorization check
    const { data: station } = await supabase
      .from('stations')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!station || station.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this station' });
    }

    const { error } = await supabaseAdmin
      .from('stations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Station deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in owner's stations
 * @route   GET /api/stations/owner/my
 * @access  Private (Owner)
 */
const getMyStations = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .eq('owner_id', req.user.id);

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
  getStations,
  getStation,
  createStation,
  updateStation,
  deleteStation,
  getMyStations
};
