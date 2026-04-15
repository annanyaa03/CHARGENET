const { supabase, supabaseAdmin } = require('../config/supabase');
const { haversineDistance } = require('../utils/helpers');
const { fetchAllExternalStations } = require('../services/externalStationService');

/**
 * @desc    Get all stations — internal DB + external APIs merged
 * @route   GET /api/stations
 * @access  Public
 */
    const {
      city,
      connector_type,
      lat,
      lng,
      radius = 25,
      include_external = 'true'
    } = req.query;

    const latNum = lat ? parseFloat(lat) : null;
    const lngNum = lng ? parseFloat(lng) : null;
    const radiusNum = parseFloat(radius);

    // ── 1. Internal Stations from Supabase ──────────────────────────────────
    let allStations = [];
    if (supabase) {
      try {
        let query = supabase.from('stations').select('*');
        if (city) query = query.ilike('city', `%${city}%`);
        if (connector_type) query = query.contains('connector_types', [connector_type]);

        const { data: internalStations, error } = await query;
        if (error) {
          console.warn('[Stations] Internal DB query failed:', error.message);
        } else {
          allStations = (internalStations || []).map(s => ({ ...s, is_external: false, source: 'ChargeNet' }));
          console.log(`[Stations] Internal: ${allStations.length} stations`);
        }
      } catch (dbErr) {
        console.warn('[Stations] Supabase runtime error:', dbErr.message);
      }
    } else {
      console.warn('[Stations] Supabase client not initialized (check keys in .env)');
    }

    // ── 2. External Stations (OCM + OSM + NREL) ─────────────────────────────
    if (include_external !== 'false' && latNum !== null && lngNum !== null) {
      const externalStations = await fetchAllExternalStations(latNum, lngNum, radiusNum);

      // De-duplicate: skip external if an internal station is within 100m
      const filtered = externalStations.filter(ext => {
        if (!ext.lat || !ext.lng) return false;
        const isDuplicate = allStations.some(int => {
          if (!int.lat || !int.lng) return false;
          return haversineDistance(ext.lat, ext.lng, int.lat, int.lng) < 0.1; // 100m
        });
        return !isDuplicate;
      });

      allStations = [...allStations, ...filtered];
    }

    // ── 3. Geo-radius filter ─────────────────────────────────────────────────
    if (latNum !== null && lngNum !== null) {
      allStations = allStations.filter(station => {
        if (!station.lat || !station.lng) return false;
        const distance = haversineDistance(latNum, lngNum, station.lat, station.lng);
        return distance <= radiusNum;
      });
    }

    console.log(`[Stations] Total returned: ${allStations.length}`);

    res.status(200).json({
      success: true,
      count: allStations.length,
      data: allStations
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

    // Handle external station IDs (osm-*, ocm-*, nrel-*)
    if (id.startsWith('osm-') || id.startsWith('ocm-') || id.startsWith('nrel-')) {
      return res.status(200).json({
        success: true,
        data: {
          id,
          name: 'External Station',
          is_external: true,
          slots: [],
          reviews: []
        }
      });
    }

    const { data: station, error } = await supabase
      .from('stations')
      .select('*, slots(*), reviews(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    res.status(200).json({ success: true, data: station });
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
    const { name, description, address, city, state, lat, lng, total_slots, price_per_kwh, connector_types, amenities } = req.body;

    const { data, error } = await supabaseAdmin
      .from('stations')
      .insert([{ owner_id: req.user.id, name, description, address, city, state, lat, lng, total_slots, price_per_kwh, connector_types, amenities }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
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
    const { data: station } = await supabase.from('stations').select('owner_id').eq('id', id).single();

    if (!station || (station.owner_id !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this station' });
    }

    const { data: updatedStation, error } = await supabaseAdmin
      .from('stations')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data: updatedStation });
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
    const { data: station } = await supabase.from('stations').select('owner_id').eq('id', id).single();

    if (!station || (station.owner_id !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this station' });
    }

    const { error } = await supabaseAdmin.from('stations').delete().eq('id', id);
    if (error) throw error;

    res.status(200).json({ success: true, message: 'Station deleted successfully' });
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
    const { data, error } = await supabase.from('stations').select('*').eq('owner_id', req.user.id);
    if (error) throw error;
    res.status(200).json({ success: true, count: data.length, data });
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
