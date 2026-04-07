export const PLUG_TYPES = {
  CCS2: {
    label: 'CCS2',
    color: '#0F766E',
    bgColor: '#F0FDFA',
    textColor: '#0F766E',
    description: 'Combined Charging System 2 — DC Fast Charging',
  },
  Type2: {
    label: 'Type 2',
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
    textColor: '#1D4ED8',
    description: 'Mennekes Type 2 — AC Charging',
  },
  CHAdeMO: {
    label: 'CHAdeMO',
    color: '#B45309',
    bgColor: '#FFFBEB',
    textColor: '#B45309',
    description: 'CHAdeMO — DC Fast Charging (Japanese standard)',
  },
  NACS: {
    label: 'NACS',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    textColor: '#7C3AED',
    description: 'North American Charging Standard (Tesla)',
  },
}

export const formatDistance = (meters) => {
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export const NETWORK_NAMES = [
  'Tata Power EZ Charge',
  'Statiq',
  'ChargeZone',
  'Ather Grid',
  'BPCL Pulse',
]

export const POWER_SPEEDS = [
  { label: 'Slow (≤7 kW)', value: 'slow', max: 7 },
  { label: 'Fast (22 kW)', value: 'fast', min: 8, max: 22 },
  { label: 'DC Fast (50 kW)', value: 'dc_fast', min: 23, max: 100 },
  { label: 'Ultra Fast (150 kW+)', value: 'ultra_fast', min: 101 },
]
