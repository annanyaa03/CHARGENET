const OCM_API_URL = 'https://api.openchargemap.io/v3/poi/';
const OSM_OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const NREL_API_URL = 'https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json';

const isPlaceholder = (val) => !val || val.startsWith('ADD_YOUR');

/**
 * fetch with a timeout so slow APIs don't hang the request
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Fetch stations from Open Charge Map (OCM)
 * Works with a real API key OR in limited anonymous mode (no key required for basic usage)
 */
async function fetchOCMStations(lat, lng, radiusKm = 20) {
  try {
    const apiKey = process.env.OPEN_CHARGE_MAP_API_KEY;
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lng,
      distance: Math.min(radiusKm, 50),
      distanceunit: 'KM',
      maxresults: 100,
      compact: true,
      verbose: false,
      output: 'json'
    });

    // Add API key only if it's a real one (OCM also works without key, rate-limited)
    if (!isPlaceholder(apiKey)) {
      params.set('key', apiKey);
    }

    const response = await fetchWithTimeout(`${OCM_API_URL}?${params.toString()}`, {}, 8000);
    if (!response.ok) throw new Error(`OCM API responded with ${response.status}`);

    const data = await response.json();
    const stations = (Array.isArray(data) ? data : []).map(normalizeOCMStation);
    console.log(`[OCM] Fetched ${stations.length} stations near (${lat}, ${lng})`);
    return stations;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('[OCM] Request timed out');
    } else {
      console.error('[OCM] Error fetching:', error.message);
    }
    return [];
  }
}

/**
 * Fetch stations from OpenStreetMap (OSM) via Overpass API
 * FREE — no API key required
 */
async function fetchOSMStations(lat, lng, radiusMetres = 20000) {
  try {
    const clampedRadius = Math.min(radiusMetres, 50000); // Max 50km radius for performance
    // Query for both nodes and ways (large stations occupy an area)
    const query = `[out:json][timeout:20];(node["amenity"="charging_station"](around:${clampedRadius},${lat},${lng});way["amenity"="charging_station"](around:${clampedRadius},${lat},${lng}););out center;`;

    const response = await fetchWithTimeout(
      `${OSM_OVERPASS_URL}?data=${encodeURIComponent(query)}`,
      {},
      15000 // Overpass can be slow, give it 15s
    );

    if (!response.ok) throw new Error(`OSM Overpass responded with ${response.status}`);

    const data = await response.json();
    const elements = data.elements || [];
    const stations = elements.map(normalizeOSMStation).filter(s => s.lat && s.lng);
    console.log(`[OSM] Fetched ${stations.length} stations near (${lat}, ${lng})`);
    return stations;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('[OSM] Overpass request timed out');
    } else {
      console.error('[OSM] Error fetching:', error.message);
    }
    return [];
  }
}

/**
 * Fetch stations from NREL (Alternative Fuels Data Center) — US only
 */
async function fetchNRELStations(lat, lng, radiusKm = 20) {
  const apiKey = process.env.NREL_API_KEY;
  if (isPlaceholder(apiKey)) {
    return []; // No key, skip silently
  }

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      latitude: lat,
      longitude: lng,
      radius: (radiusKm * 0.621371).toFixed(2), // NREL takes miles
      fuel_type: 'ELEC',
      limit: 50
    });

    const response = await fetchWithTimeout(`${NREL_API_URL}?${params.toString()}`, {}, 8000);
    if (!response.ok) throw new Error(`NREL API responded with ${response.status}`);

    const data = await response.json();
    const stations = (data.fuel_stations || []).map(normalizeNRELStation);
    console.log(`[NREL] Fetched ${stations.length} stations near (${lat}, ${lng})`);
    return stations;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('[NREL] Request timed out');
    } else {
      console.error('[NREL] Error fetching:', error.message);
    }
    return [];
  }
}

/**
 * Fetch from all external sources in parallel and merge
 */
async function fetchAllExternalStations(lat, lng, radiusKm = 20) {
  const radiusMetres = radiusKm * 1000;

  const [ocmStations, osmStations, nrelStations] = await Promise.allSettled([
    fetchOCMStations(lat, lng, radiusKm),
    fetchOSMStations(lat, lng, radiusMetres),
    fetchNRELStations(lat, lng, radiusKm)
  ]);

  const allExternal = [
    ...(ocmStations.status === 'fulfilled' ? ocmStations.value : []),
    ...(osmStations.status === 'fulfilled' ? osmStations.value : []),
    ...(nrelStations.status === 'fulfilled' ? nrelStations.value : [])
  ];

  console.log(`[External] Total combined: ${allExternal.length} stations`);
  return allExternal;
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeOCMStation(ocm) {
  const addressInfo = ocm.AddressInfo || {};
  return {
    id: `ocm-${ocm.ID}`,
    name: addressInfo.Title || 'Charging Station',
    address: [addressInfo.AddressLine1, addressInfo.AddressLine2].filter(Boolean).join(', '),
    city: addressInfo.Town || '',
    state: addressInfo.StateOrProvince || '',
    lat: addressInfo.Latitude,
    lng: addressInfo.Longitude,
    total_slots: ocm.NumberOfPoints || 2,
    available_slots: ocm.NumberOfPoints || 2,
    price_per_kwh: null,
    connector_types: (ocm.Connections || [])
      .map(c => c.ConnectionType?.Title)
      .filter(Boolean),
    amenities: [],
    status: ocm.StatusType?.IsOperational === false ? 'inactive' : 'active',
    rating: null,
    total_reviews: 0,
    open_hours: '24/7',
    is_external: true,
    source: 'Open Charge Map',
    external_id: String(ocm.ID)
  };
}

function normalizeOSMStation(osm) {
  const tags = osm.tags || {};
  const lat = osm.lat ?? osm.center?.lat;
  const lng = osm.lon ?? osm.center?.lon;

  const capacity = parseInt(tags.capacity) || parseInt(tags['charging_station:output']) || 2;

  // Determine status
  let status = 'active';
  if (tags['opening_hours'] === 'closed' || tags['disused'] === 'yes') status = 'inactive';

  // Connector types
  const connectors = [];
  if (tags['socket:type2'] || tags['socket:type2:count']) connectors.push('Type 2');
  if (tags['socket:ccs'] || tags['socket:type2_combo']) connectors.push('CCS2');
  if (tags['socket:chademo']) connectors.push('CHAdeMO');
  if (tags['socket:type1'] || tags['socket:j1772']) connectors.push('J1772');
  if (tags['socket:tesla_supercharger']) connectors.push('Tesla');
  if (connectors.length === 0) connectors.push('Universal');

  return {
    id: `osm-${osm.id}`,
    name: tags.name || tags.operator || tags.brand || 'EV Charging Station',
    address: [
      tags['addr:housenumber'],
      tags['addr:street']
    ].filter(Boolean).join(' ') || tags['addr:full'] || '',
    city: tags['addr:city'] || tags['addr:town'] || '',
    state: tags['addr:state'] || tags['addr:province'] || '',
    lat,
    lng,
    total_slots: capacity,
    available_slots: capacity,
    price_per_kwh: tags.fee === 'no' ? 0 : null,
    connector_types: connectors,
    amenities: [],
    status,
    rating: null,
    total_reviews: 0,
    open_hours: tags['opening_hours'] || '24/7',
    is_external: true,
    source: 'OpenStreetMap',
    external_id: String(osm.id)
  };
}

function normalizeNRELStation(nrel) {
  return {
    id: `nrel-${nrel.id}`,
    name: nrel.station_name || 'NREL Station',
    address: nrel.street_address || '',
    city: nrel.city || '',
    state: nrel.state || '',
    lat: nrel.latitude,
    lng: nrel.longitude,
    total_slots: (nrel.ev_level2_evse_num || 0) + (nrel.ev_dc_fast_num || 0) || 2,
    available_slots: (nrel.ev_level2_evse_num || 0) + (nrel.ev_dc_fast_num || 0) || 2,
    price_per_kwh: null,
    connector_types: nrel.ev_connector_types || ['Universal'],
    amenities: [],
    status: nrel.status_code === 'E' ? 'active' : 'inactive',
    rating: null,
    total_reviews: 0,
    open_hours: '24/7',
    is_external: true,
    source: 'AFDC/NREL',
    external_id: String(nrel.id)
  };
}

module.exports = {
  fetchOCMStations,
  fetchOSMStations,
  fetchNRELStations,
  fetchAllExternalStations
};
