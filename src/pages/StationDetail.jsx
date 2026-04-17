import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin, Star, Clock, Zap, Wifi, Droplets, ParkingSquare, Shield,
  Moon, Accessibility, Check, X as XIcon, Bookmark, BookmarkCheck,
  ArrowLeft, MessageSquare, BatteryCharging, Plug, Smartphone,
  Navigation2, Play, ChevronDown, ChevronRight,
  Share2, Phone, AlertTriangle, Activity, TrendingUp, Bolt, Wind, Thermometer,
  Cloud, Coffee, Utensils, TreePine, Building2, Store, ShoppingBag
} from 'lucide-react'
import { PageWrapper, PageContainer } from '../components/layout/PageWrapper'
import { Button } from '../components/common/Button'
import { Badge, PlugBadge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { getStationById } from '../services/stationService'
import { getSlotsByStation } from '../services/slotService'
import { useAuthStore } from '../store/authStore'
import { formatRelativeTime, formatDate } from '../utils/formatTime'
import { formatINR } from '../utils/formatCurrency'
import { useWeather } from '../hooks/useWeather'
import { submitReview } from '../services/reviewService'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

/* ─── Config ─────────────────────────────────────────────────── */

const STATUS_CFG = {
  available: {
    label: 'Available',
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  occupied: {
    label: 'Occupied', 
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200'
  },
  maintenance: {
    label: 'Maintenance',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200'
  },
  inactive: {
    label: 'Inactive',
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200'
  },
  faulty: {
    label: 'Faulty',
    color: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-300'
  }
}

/* ─── Helpers ─────────────────────────────────────────────────── */

const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'available': return 'text-green-500 bg-green-50'
    case 'occupied': return 'text-red-500 bg-red-50'
    case 'maintenance': return 'text-yellow-500 bg-yellow-50'
    default: return 'text-gray-500 bg-gray-50'
  }
}

// Map tailwind color classes to hex for inline styles (e.g. progress bars)
const getStatusHex = (status) => {
  switch(status?.toLowerCase()) {
    case 'available': return '#10B981'
    case 'occupied': return '#EF4444'
    case 'maintenance': return '#F59E0B'
    default: return '#6B7280'
  }
}

function StarRating({ rating, size = 14, interactive = false, onRate }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          onClick={() => interactive && onRate?.(s)}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`transition-colors ${interactive ? 'cursor-pointer' : ''} ${
            s <= (hover || Math.round(rating))
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

// ✅ Step 5: Haversine distance calculation
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return '0.0'
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * 
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

// ✅ Helper to estimate walking time based on distance string (e.g. "0.5 km")
const addWalkingTime = (distance) => {
  const km = parseFloat(distance)
  if (isNaN(km)) return 'N/A'
  const minutes = Math.round((km / 5) * 60)
  return minutes <= 1 ? '1 min walk' : `${minutes} min walk`
}

// ✅ Fixed: Nearby places approach using static data based on city
// ✅ Fixed: Nearby places approach using static data based on city
const getNearbyPlaces = (stationCity, stationName) => {
  const placesByCity = {
    'Mumbai': [
      { name: 'Cafe Coffee Day', type: 'cafe', icon: '☕', distance: '0.2 km' },
      { name: 'McDonald\'s', type: 'restaurant', icon: '🍔', distance: '0.3 km' },
      { name: 'Jio Garden', type: 'park', icon: '🌳', distance: '0.5 km' },
      { name: 'HDFC Bank ATM', type: 'atm', icon: '🏧', distance: '0.1 km' },
      { name: 'Reliance Fresh', type: 'store', icon: '🏪', distance: '0.4 km' },
      { name: 'Subway', type: 'restaurant', icon: '🥪', distance: '0.6 km' }
    ],
    'Pune': [
      { name: 'Cafe Goodluck', type: 'cafe', icon: '☕', distance: '0.3 km' },
      { name: 'Vaishali Restaurant', type: 'restaurant', icon: '🍽️', distance: '0.4 km' },
      { name: 'Aga Khan Palace Garden', type: 'park', icon: '🌳', distance: '0.8 km' },
      { name: 'D-Mart', type: 'store', icon: '🏪', distance: '0.5 km' },
      { name: 'KFC', type: 'restaurant', icon: '🍗', distance: '0.2 km' },
      { name: 'ICICI ATM', type: 'atm', icon: '🏧', distance: '0.1 km' }
    ],
    'Delhi': [
      { name: 'Starbucks', type: 'cafe', icon: '☕', distance: '0.2 km' },
      { name: 'Haldirams', type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
      { name: 'Central Park', type: 'park', icon: '🌳', distance: '0.6 km' },
      { name: 'Big Bazaar', type: 'store', icon: '🏪', distance: '0.4 km' },
      { name: 'Dominos', type: 'restaurant', icon: '🍕', distance: '0.5 km' },
      { name: 'SBI ATM', type: 'atm', icon: '🏧', distance: '0.1 km' }
    ],
    'Bangalore': [
      { name: 'Third Wave Coffee', type: 'cafe', icon: '☕', distance: '0.2 km' },
      { name: 'MTR Restaurant', type: 'restaurant', icon: '🍽️', distance: '0.4 km' },
      { name: 'Cubbon Park', type: 'park', icon: '🌳', distance: '0.7 km' },
      { name: 'More Supermarket', type: 'store', icon: '🏪', distance: '0.3 km' },
      { name: 'Pizza Hut', type: 'restaurant', icon: '🍕', distance: '0.5 km' },
      { name: 'Axis Bank ATM', type: 'atm', icon: '🏧', distance: '0.2 km' }
    ],
    'Chennai': [
      { name: 'Murugan Idli Shop', type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
      { name: 'Cafe Coffee Day', type: 'cafe', icon: '☕', distance: '0.4 km' },
      { name: 'Semmozhi Poonga', type: 'park', icon: '🌳', distance: '0.6 km' },
      { name: 'Spencer Plaza', type: 'store', icon: '🏪', distance: '0.5 km' },
      { name: 'KFC', type: 'restaurant', icon: '🍗', distance: '0.2 km' },
      { name: 'Indian Bank ATM', type: 'atm', icon: '🏧', distance: '0.1 km' }
    ],
    'Hyderabad': [
      { name: 'Cafe Bahar', type: 'cafe', icon: '☕', distance: '0.3 km' },
      { name: 'Paradise Biryani', type: 'restaurant', icon: '🍽️', distance: '0.4 km' },
      { name: 'KBR National Park', type: 'park', icon: '🌳', distance: '0.8 km' },
      { name: 'Big Bazaar', type: 'store', icon: '🏪', distance: '0.5 km' },
      { name: 'McDonalds', type: 'restaurant', icon: '🍔', distance: '0.3 km' },
      { name: 'HDFC ATM', type: 'atm', icon: '🏧', distance: '0.2 km' }
    ],
    'Kolkata': [
      { name: 'Flurys Tea Room', type: 'cafe', icon: '☕', distance: '0.2 km' },
      { name: 'Peter Cat Restaurant', type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
      { name: 'Victoria Memorial Garden', type: 'park', icon: '🌳', distance: '0.7 km' },
      { name: 'Pantaloons', type: 'store', icon: '🏪', distance: '0.4 km' },
      { name: 'KFC', type: 'restaurant', icon: '🍗', distance: '0.5 km' },
      { name: 'SBI ATM', type: 'atm', icon: '🏧', distance: '0.1 km' }
    ],
    'Ahmedabad': [
      { name: 'Manek Chowk', type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
      { name: 'Cafe Nirvana', type: 'cafe', icon: '☕', distance: '0.4 km' },
      { name: 'Law Garden', type: 'park', icon: '🌳', distance: '0.6 km' },
      { name: 'Alpha One Mall', type: 'store', icon: '🏪', distance: '0.8 km' },
      { name: 'Dominos', type: 'restaurant', icon: '🍕', distance: '0.5 km' },
      { name: 'ICICI ATM', type: 'atm', icon: '🏧', distance: '0.2 km' }
    ],
    'Jaipur': [
      { name: 'LMB Restaurant', type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
      { name: 'Cafe Palladio', type: 'cafe', icon: '☕', distance: '0.5 km' },
      { name: 'Central Park Jaipur', type: 'park', icon: '🌳', distance: '0.7 km' },
      { name: 'Bapu Bazaar', type: 'store', icon: '🏪', distance: '0.4 km' },
      { name: 'Pizza Hut', type: 'restaurant', icon: '🍕', distance: '0.6 km' },
      { name: 'Bank of Baroda ATM', type: 'atm', icon: '🏧', distance: '0.2 km' }
    ],
    'Indore': [
      { name: 'Sarafa Bazaar', type: 'restaurant', icon: '🍽️', distance: '0.4 km' },
      { name: 'Cafe 56 Dukan', type: 'cafe', icon: '☕', distance: '0.3 km' },
      { name: 'Rajwada Garden', type: 'park', icon: '🌳', distance: '0.6 km' },
      { name: 'Treasure Island Mall', type: 'store', icon: '🏪', distance: '0.7 km' },
      { name: 'McDonald\'s', type: 'restaurant', icon: '🍔', distance: '0.5 km' },
      { name: 'HDFC ATM', type: 'atm', icon: '🏧', distance: '0.2 km' }
    ],
    'Surat': [
      { name: 'Locho House', type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
      { name: 'Cafe Coffee Day', type: 'cafe', icon: '☕', distance: '0.4 km' },
      { name: 'Dumas Beach Park', type: 'park', icon: '🌳', distance: '0.8 km' },
      { name: 'Rahul Raj Mall', type: 'store', icon: '🏪', distance: '0.6 km' },
      { name: 'Dominos', type: 'restaurant', icon: '🍕', distance: '0.5 km' },
      { name: 'SBI ATM', type: 'atm', icon: '🏧', distance: '0.1 km' }
    ],
    'Nagpur': [
      { name: 'Haldirams Nagpur', type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
      { name: 'Cafe Coffee Day', type: 'cafe', icon: '☕', distance: '0.4 km' },
      { name: 'Ambazari Garden', type: 'park', icon: '🌳', distance: '0.7 km' },
      { name: 'Empress Mall', type: 'store', icon: '🏪', distance: '0.5 km' },
      { name: 'KFC', type: 'restaurant', icon: '🍗', distance: '0.4 km' },
      { name: 'Bank of Maharashtra ATM', type: 'atm', icon: '🏧', distance: '0.2 km' }
    ],
    'Bhopal': [
      { name: 'Under the Mango Tree', type: 'cafe', icon: '☕', distance: '0.3 km' },
      { name: 'Bapu Ki Kutia', type: 'restaurant', icon: '🍽️', distance: '0.4 km' },
      { name: 'Van Vihar National Park', type: 'park', icon: '🌳', distance: '0.9 km' },
      { name: 'DB City Mall', type: 'store', icon: '🏪', distance: '0.6 km' },
      { name: 'Pizza Hut', type: 'restaurant', icon: '🍕', distance: '0.5 km' },
      { name: 'ICICI ATM', type: 'atm', icon: '🏧', distance: '0.2 km' }
    ],
    'Lucknow': [
      { name: 'Tunday Kababi', type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
      { name: 'Cafe Coffee Day', type: 'cafe', icon: '☕', distance: '0.4 km' },
      { name: 'Hazratganj Park', type: 'park', icon: '🌳', distance: '0.5 km' },
      { name: 'Fun Republic Mall', type: 'store', icon: '🏪', distance: '0.7 km' },
      { name: 'McDonalds', type: 'restaurant', icon: '🍔', distance: '0.4 km' },
      { name: 'Axis ATM', type: 'atm', icon: '🏧', distance: '0.2 km' }
    ],
    'Chandigarh': [
      { name: 'Hot Millions', type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
      { name: 'Barista', type: 'cafe', icon: '☕', distance: '0.4 km' },
      { name: 'Rose Garden', type: 'park', icon: '🌳', distance: '0.6 km' },
      { name: 'Elante Mall', type: 'store', icon: '🏪', distance: '0.8 km' },
      { name: 'Dominos', type: 'restaurant', icon: '🍕', distance: '0.5 km' },
      { name: 'PNB ATM', type: 'atm', icon: '🏧', distance: '0.1 km' }
    ],
    'Kochi': [
      { name: 'Pai Dosa', type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
      { name: 'Coffee Beanz', type: 'cafe', icon: '☕', distance: '0.4 km' },
      { name: 'Lulu Mall Park', type: 'park', icon: '🌳', distance: '0.6 km' },
      { name: 'Lulu Mall', type: 'store', icon: '🏪', distance: '0.5 km' },
      { name: 'KFC', type: 'restaurant', icon: '🍗', distance: '0.4 km' },
      { name: 'Federal Bank ATM', type: 'atm', icon: '🏧', distance: '0.2 km' }
    ],
    'Coimbatore': [
      { name: 'Annapoorna Restaurant', type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
      { name: 'Cafe Coffee Day', type: 'cafe', icon: '☕', distance: '0.4 km' },
      { name: 'VOC Park', type: 'park', icon: '🌳', distance: '0.6 km' },
      { name: 'Brookefields Mall', type: 'store', icon: '🏪', distance: '0.7 km' },
      { name: 'Pizza Hut', type: 'restaurant', icon: '🍕', distance: '0.5 km' },
      { name: 'Indian Bank ATM', type: 'atm', icon: '🏧', distance: '0.2 km' }
    ],
    'Visakhapatnam': [
      { name: 'Bamboo Garden Restaurant', type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
      { name: 'Cafe Coffee Day', type: 'cafe', icon: '☕', distance: '0.4 km' },
      { name: 'Kailasagiri Park', type: 'park', icon: '🌳', distance: '0.8 km' },
      { name: 'CMR Central Mall', type: 'store', icon: '🏪', distance: '0.6 km' },
      { name: 'Dominos', type: 'restaurant', icon: '🍕', distance: '0.5 km' },
      { name: 'Andhra Bank ATM', type: 'atm', icon: '🏧', distance: '0.2 km' }
    ]
  }

  // Case insensitive + partial match
  const cityKey = Object.keys(placesByCity).find(
    key => key.toLowerCase() === stationCity?.toLowerCase().trim()
  )

  // If city found return its places
  if (cityKey) {
    return placesByCity[cityKey]
  }

  // If city NOT found generate generic but city-specific named places
  return [
    { name: `${stationCity} Restaurant`, type: 'restaurant', icon: '🍽️', distance: '0.3 km' },
    { name: `${stationCity} Cafe`, type: 'cafe', icon: '☕', distance: '0.4 km' },
    { name: `${stationCity} City Park`, type: 'park', icon: '🌳', distance: '0.6 km' },
    { name: `${stationCity} Supermarket`, type: 'store', icon: '🏪', distance: '0.5 km' },
    { name: `${stationCity} Fast Food`, type: 'restaurant', icon: '🍔', distance: '0.4 km' },
    { name: `${stationCity} ATM`, type: 'atm', icon: '🏧', distance: '0.2 km' }
  ]
}

/* ─── Charger Card ─────────────────────────────────────────────── */
function ChargerCard({ charger, stationId }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const utilizationPct = Math.min(100, (charger.sessionsToday / 20) * 100)

  const handleBook = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    navigate(`/station/${stationId}/book/${charger.id}`)
  }

  return (
    <div className="p-6 border border-transparent bg-transparent hover:border-gray-200 hover:bg-white transition-all group cursor-default relative overflow-hidden">
      <div className="pr-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-black text-gray-900 text-base tracking-tight group-hover:text-black transition-colors">
              {charger.type} Charger
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
              ChargeNet Network
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-[0.1em] border ${getStatusColor(charger.status)} opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0`}
          >
            {charger.status}
          </span>
        </div>

        {/* Plug + Power Pills (Sharp) */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-none text-[10px] font-black text-gray-700 uppercase tracking-tight group-hover:bg-gray-100 transition-colors">
            <Plug size={12} className="text-gray-400" />
            {charger.plugType || charger.type}
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-none text-[10px] font-black text-blue-700 uppercase tracking-tight group-hover:bg-blue-100 transition-colors">
            <Zap size={12} />
            {charger.powerKw || charger.power_kw} kW
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-none text-[10px] font-black text-emerald-700 uppercase tracking-tight group-hover:bg-emerald-100 transition-colors">
            ₹{(parseFloat(charger.price_per_kwh) || 0).toFixed(2)}/kWh
          </span>
        </div>

        {/* Usage Bar (Sharp) */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Today's Usage</span>
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">{charger.sessionsToday} sessions</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-none overflow-hidden">
            <div
              className="h-full rounded-none transition-all duration-1000 ease-out"
              style={{ width: `${utilizationPct}%`, background: getStatusHex(charger.status) }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
            Last active: {formatRelativeTime(charger.lastActiveAt)}
          </p>
          
          <div className="h-px flex-1 bg-gray-50 mx-4 opacity-0 group-hover:opacity-100 transition-opacity" />

          {charger.status === 'available' 
            ? <button 
                onClick={handleBook}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-black/10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                Book This Charger
              </button>
            : <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100">
                {charger.status === 'occupied' ? 'Currently Occupied' : 'Reserved'}
              </div>
          }
        </div>
      </div>

      {/* Decorative Hover Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900 
        transform -translate-x-full group-hover:translate-x-0 transition-transform" />
    </div>
  )
}



/* ─── Config ─────────────────────────────────────────────────── */

const facilityConfig = {
  'Parking': {
    icon: (
      <svg className="w-5 h-5" fill="none" 
        stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" 
          strokeLinejoin="round" strokeWidth={2}
          d="M9 17a2 2 0 11-4 0 2 2 0 014 
          0zM19 17a2 2 0 11-4 0 2 2 0 014 
          0z M13 17H9m4 0h2m-2 
          0V9m0 0H7m6 0h2a2 2 0 012 
          2v6M7 9V7a2 2 0 012-2h2" />
      </svg>
    ),
    description: 'Free parking available',
    color: 'bg-blue-50 text-blue-600 border-blue-100'
  },
  'WiFi': {
    icon: (
      <svg className="w-5 h-5" fill="none" 
        stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" 
          strokeLinejoin="round" strokeWidth={2}
          d="M8.111 16.404a5.5 5.5 0 017.778 
          0M12 20h.01m-7.08-7.071c3.904-3.905 
          10.236-3.905 14.141 0M1.394 
          9.393c5.857-5.857 15.355-5.857 
          21.213 0" />
      </svg>
    ),
    description: 'High speed WiFi',
    color: 'bg-purple-50 text-purple-600 border-purple-100'
  },
  'Restroom': {
    icon: (
      <svg className="w-5 h-5" fill="none" 
        stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" 
          strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 
          0zM12 14a7 7 0 00-7 7h14a7 7 
          0 00-7-7z" />
      </svg>
    ),
    description: 'Clean restrooms',
    color: 'bg-green-50 text-green-600 border-green-100'
  },
  'CCTV': {
    icon: (
      <svg className="w-5 h-5" fill="none" 
        stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" 
          strokeLinejoin="round" strokeWidth={2}
          d="M15 10l4.553-2.069A1 1 0 0121 
          8.82v6.36a1 1 0 01-1.447.894L15 
          14M3 8a2 2 0 00-2 2v4a2 2 0 002 
          2h9a2 2 0 002-2v-4a2 2 0 00-2-2H3z" />
      </svg>
    ),
    description: '24/7 surveillance',
    color: 'bg-red-50 text-red-600 border-red-100'
  },
  'Waiting Area': {
    icon: (
      <svg className="w-5 h-5" fill="none" 
        stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" 
          strokeLinejoin="round" strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 
          0 00-2 2v16m14 0h2m-2 0h-5m-9 
          0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 
          4h1m-5 10v-5a1 1 0 011-1h2a1 1 
          0 011 1v5m-4 0h4" />
      </svg>
    ),
    description: 'Comfortable seating',
    color: 'bg-amber-50 text-amber-600 border-amber-100'
  },
  'Food Court': {
    icon: (
      <svg className="w-5 h-5" fill="none" 
        stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" 
          strokeLinejoin="round" strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 
          13L5.4 5M7 13l-2.293 2.293c-.63.63
          -.184 1.707.707 1.707H17m0 0a2 2 
          0 100 4 2 2 0 000-4zm-8 2a2 2 0 
          11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    description: 'Food and beverages',
    color: 'bg-orange-50 text-orange-600 border-orange-100'
  },
  'EV Shop': {
    icon: (
      <svg className="w-5 h-5" fill="none" 
        stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" 
          strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    description: 'EV accessories shop',
    color: 'bg-yellow-50 text-yellow-600 border-yellow-100'
  },
  'First Aid': {
    icon: (
      <svg className="w-5 h-5" fill="none" 
        stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" 
          strokeLinejoin="round" strokeWidth={2}
          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 
          0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: 'Medical assistance',
    color: 'bg-rose-50 text-rose-600 border-rose-100'
  }
}

/* ─── Review Card ──────────────────────────────────────────────── */
function ReviewCard({ review }) {
  return (
    <div className="p-3.5 border border-transparent bg-transparent hover:border-gray-200 hover:bg-white transition-all group cursor-default relative overflow-hidden">
      <div className="flex items-start gap-3 mb-2.5">
        {/* User Avatar (Sharp, Compact) */}
        <div className="w-8 h-8 rounded-none bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 transition-transform group-hover:scale-105">
          {(review.user_name || review.reviewerName || 'A').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-gray-900 tracking-tight group-hover:text-black transition-colors">
              {review.user_name || review.reviewerName || 'Anonymous'}
            </p>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
              {formatDate(review.created_at || review.date)}
            </p>
          </div>
          <StarRating rating={review.rating} size={10} />
        </div>
      </div>
      <p className="text-[12px] text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
        {review.comment || review.text}
      </p>
      {review.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {review.tags.map(tag => (
            <span key={tag} className="text-[9px] px-2 py-1 bg-gray-100 text-gray-500 rounded-none font-black uppercase tracking-widest group-hover:bg-gray-200 transition-colors">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Decorative Hover Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900 
        transform -translate-x-full group-hover:translate-x-0 transition-transform" />
    </div>
  )
}

/* ─── Amenity Card ─────────────────────────────────────────────── */
/* ─── Amenity Card ─────────────────────────────────────────────── */
function AmenityCard({ item }) {
  const getIconConfig = (type) => {
    switch(type?.toLowerCase()) {
      case 'cafe':        return { icon: Coffee,      bg: 'bg-amber-50',    text: 'text-amber-600',  badge: 'bg-amber-100 text-amber-600' }
      case 'restaurant':  return { icon: Utensils,    bg: 'bg-orange-50',   text: 'text-orange-600', badge: 'bg-orange-100 text-orange-600' }
      case 'park':        return { icon: TreePine,    bg: 'bg-green-50',    text: 'text-green-600',  badge: 'bg-green-100 text-green-600' }
      case 'atm':         return { icon: Building2,   bg: 'bg-purple-50',   text: 'text-purple-600', badge: 'bg-purple-100 text-purple-600' }
      case 'store':       return { icon: ShoppingBag, bg: 'bg-blue-50',     text: 'text-blue-600',   badge: 'bg-blue-100 text-blue-600' }
      case 'convenience': return { icon: Store,       bg: 'bg-indigo-50',   text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-600' }
      default:            return { icon: MapPin,      bg: 'bg-gray-50',     text: 'text-gray-600',   badge: 'bg-gray-100 text-gray-600' }
    }
  }

  const { icon: Icon, bg, text, badge } = getIconConfig(item.type)

  return (
    <div className="flex items-center justify-between p-3.5 border border-transparent bg-transparent hover:border-gray-200 hover:bg-white transition-all group cursor-default relative overflow-hidden">
      {/* Left Side - Icon + Info */}
      <div className="flex items-center gap-4">
        {/* Icon Container (Sharp) */}
        <div className={`w-10 h-10 rounded-none flex items-center justify-center border ${bg} ${text} opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105`}>
          <Icon size={18} />
        </div>
        
        {/* Name + Type */}
        <div className="min-w-0">
          <p className="font-black text-gray-900 text-sm tracking-tight group-hover:text-black transition-colors">{item.name}</p>
          <div className="flex items-center gap-2 mt-0.5 opacity-60 group-hover:opacity-100 transition-all">
            <span className={`text-[9px] px-2 py-0.5 rounded-none font-black uppercase tracking-widest ${badge}`}>
              {item.type}
            </span>
            <span className="text-gray-300 opacity-30">•</span>
            {/* Professional Open Status Badge (Sharp) */}
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-none bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Open Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Distance + Arrow (Revealed on Hover) */}
      <div className="flex items-center gap-4">
        <div className="text-right transition-transform group-hover:-translate-x-2">
          <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest">{item.distance}</p>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{addWalkingTime(item.distance)}</p>
        </div>
        {/* Arrow Icon (Sharp reveal) */}
        <div className="w-8 h-8 rounded-none bg-gray-900 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 shadow-lg shadow-gray-200">
          <ChevronRight size={14} />
        </div>
      </div>

      {/* Decorative Hover Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900 
        transform -translate-x-full group-hover:translate-x-0 transition-transform" />
    </div>
  )
}

/* ─── Main Component ───────────────────────────────────────────── */
const REVIEW_TAGS = [
  'Fast Charging', 'Clean', 'Safe', 'Good Location', 'Reliable',
  'Easy Payment', 'Covered Parking', 'Accessible', 'Crowded',
  'Needs Maintenance', 'Friendly Staff', 'Reasonable Price'
]

const TABS = ['Chargers', 'Reviews', 'Facilities', 'Nearby Places']

export default function StationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, toggleSavedStation } = useAuthStore()
  
  // ✅ State Variables (Restored & Fixed)
  const [activeTab, setActiveTab] = useState('Chargers')
  const [reviewModal, setReviewModal] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [station, setStation] = useState(null)
  const [stationChargers, setStationChargers] = useState([])
  const [stationReviews, setStationReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [loadingPlaces, setLoadingPlaces] = useState(false)
  const [distance, setDistance] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  // ── Live APIs ──
  const { weather, aqi, loading: weatherLoading } = useWeather(station?.lat, station?.lng)

  const isSaved = user?.savedStations?.includes(id)

  // ✅ Fix 6: More precise distance calculation using user geolocation
  useEffect(() => {
    if (station && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const R = 6371;
          const dLat = (station.lat - pos.coords.latitude) * Math.PI / 180;
          const dLng = (station.lng - pos.coords.longitude) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(pos.coords.latitude * Math.PI/180) * 
            Math.cos(station.lat * Math.PI/180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          setDistance((R * c).toFixed(1))
        },
        (err) => console.error('Location error:', err)
      )
    }
  }, [station])

  // ✅ Step 2 & 4: Fetch Chargers & Reviews
  const fetchChargers = async () => {
    const { data, error } = await supabase
      .from('chargers')
      .select('*')
      .eq('station_id', id)
    
    if (error) {
      console.error('Chargers error:', error)
      return
    }
    setStationChargers(data || [])
  }

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('station_id', id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Reviews error:', error)
      return
    }
    setStationReviews(data || [])
  }

  const fetchNearbyPlaces = async (city) => {
    setLoadingPlaces(true)
    console.log('Station city for nearby places:', city)
    try {
      // ✅ Removed overpass-api calls
      const places = getNearbyPlaces(city, station?.name)
      setNearbyPlaces(places)
    } catch (error) {
      console.error('Nearby places error:', error)
      setNearbyPlaces([])
    } finally {
      setLoadingPlaces(false)
    }
  }


  const loadData = async () => {
    try {
      const res = await getStationById(id)
      if (res.success) {
        setStation(res.data)
        document.title = `${res.data.name} — ChargeNet`
        fetchChargers()
        fetchReviews()
        fetchNearbyPlaces(res.data.city)
      }
    } catch (err) {
      console.error('Failed to load station:', err)
      toast.error('Failed to load station details')
    } finally {
      setLoading(false)
    }
  }

  const filteredPlaces = selectedCategory === 'All'
    ? nearbyPlaces
    : nearbyPlaces.filter(place => {
        switch(selectedCategory) {
          case 'Restaurants': return place.type === 'restaurant'
          case 'Cafes':       return place.type === 'cafe'
          case 'Parks':       return place.type === 'park'
          case 'Stores':      return place.type === 'store'
          case 'ATMs':        return place.type === 'atm'
          default:            return true
        }
      })

  useEffect(() => {
    loadData()
  }, [id])

  // ✅ Fixed: Real-time Charger Availability with try-catch and stationId check
  useEffect(() => {
    if (!id) return
    
    try {
      const channel = supabase
        .channel(`station-chargers-${id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chargers',
          filter: `station_id=eq.${id}`
        }, (payload) => {
          console.log('[Realtime] Charger change detected:', payload)
          loadData() // Refresh everything on change
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    } catch (err) {
      console.error('Realtime error:', err)
    }
  }, [id])

  const cfg = station ? (STATUS_CFG[station.status] || STATUS_CFG.faulty) : null

  if (loading) return (
    <PageWrapper>
      <PageContainer>
        <div className="text-center py-20 text-gray-400 font-medium">Loading station details…</div>
      </PageContainer>
    </PageWrapper>
  )

  if (!station) return (
    <PageWrapper>
      <PageContainer>
        <div className="text-center py-20">
          <AlertTriangle size={48} className="text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Station Not Found</h2>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </PageContainer>
    </PageWrapper>
  )

  const avgRating = stationReviews.length
    ? stationReviews.reduce((a, r) => a + r.rating, 0) / stationReviews.length
    : 0
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: stationReviews.filter(r => r.rating === star).length,
    pct: (stationReviews.filter(r => r.rating === star).length / (stationReviews.length || 1)) * 100,
  }))

  const handleToggleSave = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    toggleSavedStation(id)
    toast.success(isSaved ? 'Removed from saved' : 'Station saved!')
  }

  const handleSubmitReview = async () => {
    if (userRating === 0) { toast.error('Please select a star rating'); return }
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          station_id: id,
          user_name: user?.email || 'Anonymous',
          rating: userRating,
          comment: reviewText
        })
      
      if (error) throw error
      
      toast.success('Review submitted! Thank you.')
      setReviewModal(false)
      setUserRating(0); setReviewText(''); setSelectedTags([])
      fetchReviews()
    } catch (err) {
      console.error('Failed to submit review:', err)
      toast.error('Failed to submit review')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: station.name, text: station.address, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  const availPct = station.totalChargers > 0
    ? Math.round((station.availableChargers / station.totalChargers) * 100)
    : 0

  return (
    <PageWrapper>
      <PageContainer className="!max-w-7xl !py-6">

        {/* ─── Back ─── */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={16} /> Back to map
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* ─── LEFT COLUMN ─── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Hero Header ── */}
            <div className="pb-8 border-b border-gray-100">
              <div className="pt-0">
                {/* Title row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(station.status)}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full inline-block bg-current" />
                        {station.status}
                      </span>
                      {station.isExternal && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide badge-external" style={{ background: '#EEF2FF', color: '#4F46E5', border: '1px solid #E0E7FF' }}>
                          Source: {station.source}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 leading-tight">{station.name}</h1>
                    <div className="flex items-start gap-1.5 text-sm text-gray-500 mt-1.5">
                      <MapPin size={15} className="flex-shrink-0 mt-0.5" />
                      <span>{station.address}</span>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleShare}
                      className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={handleToggleSave}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        isSaved
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Rating + hours */}
                <div className="flex flex-wrap items-center gap-5 mb-5 text-sm">
                  <div className="flex items-center gap-2">
                    <StarRating rating={avgRating} size={15} />
                    <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-400">({stationReviews.length} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={14} />
                    <span>{station.openHours}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Navigation2 size={14} />
                    <span>
                      {distance 
                        ? `${distance} km away`
                        : `${(station.distance / 1000).toFixed(1)} km`}
                    </span>
                  </div>
                </div>

                {/* Quick summary pills (Sharp, Compact, Reveal-on-Hover aesthetic) */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-100 rounded-none text-[9px] font-black uppercase tracking-tight text-gray-700 hover:bg-gray-100 hover:border-gray-200 transition-all cursor-default">
                    <BatteryCharging size={11} className={station.availableChargers > 0 ? 'text-emerald-500' : 'text-red-400'} />
                    {station.availableChargers}/{station.totalChargers} chargers free
                  </span>
                  {stationReviews.length > 0 && (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-100 rounded-none text-[9px] font-black uppercase tracking-tight text-amber-700 hover:bg-amber-100 hover:border-amber-200 transition-all cursor-default">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      {avgRating.toFixed(1)} · {stationReviews.length} reviews
                    </span>
                  )}
                  {stationChargers.length > 0 && (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-100 rounded-none text-[9px] font-black uppercase tracking-tight text-blue-700 hover:bg-blue-100 hover:border-blue-200 transition-all cursor-default">
                      <Zap size={11} />
                      From ₹{(Math.min(...stationChargers.map(c => parseFloat(c.price_per_kwh) || 0))).toFixed(2)}/kWh
                    </span>
                  )}
                  {/* Live weather chip */}
                  {weatherLoading && (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-sky-50 border border-sky-100 rounded-none text-[9px] font-black uppercase tracking-tight text-sky-400 animate-pulse">
                      <Thermometer size={12} /> Loading weather…
                    </span>
                  )}
                  {weather && !weatherLoading && (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-sky-50 border border-sky-100 rounded-none text-[9px] font-black uppercase tracking-tight text-sky-700 hover:bg-sky-100 hover:border-sky-200 transition-all cursor-default">
                      <Thermometer size={12} /> {weather.temp}°C · {weather.weatherLabel}
                    </span>
                  )}
                  {aqi && !weatherLoading && (
                    <span
                      className="flex items-center gap-1.5 px-2 py-1 rounded-none text-[9px] font-black uppercase tracking-tight border hover:shadow-sm transition-all cursor-default"
                      style={{ background: aqi.aqiColor + '12', color: aqi.aqiColor, borderColor: aqi.aqiColor + '30' }}
                    >
                      <Wind size={12} className="mr-0.5" /> AQI {aqi.aqiLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Content Tabs ── */}
            <div className="pt-2">
              <div className="flex border-b border-gray-100 px-4 pt-2">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                      activeTab === tab
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                    {tab === 'Chargers' && (
                      <span className="ml-1.5 text-[9px] bg-gray-100 text-gray-500 rounded-none px-1.5 py-0.5">
                        {stationChargers.length}
                      </span>
                    )}
                    {tab === 'Reviews' && (
                      <span className="ml-1.5 text-[9px] bg-gray-100 text-gray-500 rounded-none px-1.5 py-0.5">
                        {stationReviews.length}
                      </span>
                    )}
                    {tab === 'Nearby Places' && (
                      <span className="ml-1.5 text-[9px] bg-gray-100 text-gray-500 rounded-none px-1.5 py-0.5">
                        {nearbyPlaces.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* ── Chargers Tab ── */}
                {activeTab === 'Chargers' && (
                  <div>
                    {stationChargers.length === 0 ? (
                      <div className="text-center py-12">
                        <BatteryCharging size={40} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No chargers listed for this station</p>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {stationChargers.map(c => (
                          <ChargerCard key={c.id} charger={c} stationId={id} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Reviews Tab ── */}
                {activeTab === 'Reviews' && (
                  <div>
                    {/* Rating Summary */}
                    <div className="flex items-start gap-8 py-6 mb-5 border-b border-gray-100">
                      <div className="text-center flex-shrink-0">
                        <p className="text-5xl font-black text-gray-900 leading-none">{avgRating.toFixed(1)}</p>
                        <StarRating rating={avgRating} size={16} />
                        <p className="text-xs text-gray-400 mt-1">{stationReviews.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {ratingBreakdown.map(({ star, count, pct }) => (
                          <div key={star} className="flex items-center gap-3 text-[10px]">
                            <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                            <span className="font-bold text-gray-500 w-2">{star}</span>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-none overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-none transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-gray-400 w-4 text-right font-black">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-8">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                        {stationReviews.length} Verified Reviews
                      </p>
                      <button
                        onClick={() => { if (!isAuthenticated) { navigate('/login'); return } setReviewModal(true) }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-black/10"
                      >
                        <MessageSquare size={13} /> Write a Review
                      </button>
                    </div>

                    {stationReviews.length === 0 ? (
                      <div className="text-center py-10">
                        <MessageSquare size={36} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No reviews yet. Be the first!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stationReviews.map(r => <ReviewCard key={r.id} review={r} />)}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Facilities Tab ── */}
                {activeTab === 'Facilities' && (() => {
                  const facilities = Array.isArray(station.facilities) 
                    ? station.facilities 
                    : (station.facilities ? Object.keys(station.facilities).filter(k => station.facilities[k]) : []);
                  
                  return (
                    <div>
                      {/* Header Section */}
                      <div className="mb-5">
                        <h3 className="text-base font-black text-gray-900 tracking-tight uppercase">
                          Available Facilities
                        </h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mt-1">
                          Amenities available at this charging station
                        </p>
                      </div>

                      {/* Facilities List (Reveal-on-Hover, Sharp Edges) */}
                      <div className="space-y-0 divide-y divide-gray-50">
                        {facilities.map((facility, index) => {
                          const config = facilityConfig[facility] || {
                            icon: (
                              <svg className="w-5 h-5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round"
                                  strokeLinejoin="round" strokeWidth={2}
                                  d="M5 13l4 4L19 7" />
                              </svg>
                            ),
                            description: 'Available at this station',
                            color: 'bg-gray-50 text-gray-600 border-gray-100'
                          }
                          
                          return (
                            <div key={index}
                              className="flex items-center justify-between p-3.5 
                              rounded-none border border-transparent bg-transparent 
                              hover:border-gray-200 hover:bg-white transition-all 
                              group cursor-default relative overflow-hidden">
                              
                              <div className="flex items-center gap-4">
                                {/* Icon Box (Sharp) */}
                                <div className={`w-10 h-10 rounded-none 
                                  flex items-center justify-center 
                                  border flex-shrink-0 ${config.color} 
                                  opacity-60 group-hover:opacity-100 transition-all duration-300`}>
                                  {config.icon}
                                </div>
                                
                                {/* Text */}
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-900 
                                    text-sm tracking-tight group-hover:text-black transition-colors">
                                    {facility}
                                  </p>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    {config.description}
                                  </p>
                                </div>
                              </div>

                              {/* Available Badge (Revealed on Hover) */}
                              <div className="flex items-center gap-2 
                                bg-emerald-50 px-3 py-1.5 rounded-none border border-emerald-100 
                                opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                <div className="w-1.5 h-1.5 rounded-none 
                                  bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] text-emerald-600 
                                  font-black uppercase tracking-[0.2em]">
                                  Available
                                </span>
                              </div>

                              {/* Decorative Hover Bar */}
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900 
                                transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                            </div>
                          )
                        })}
                      </div>

                      {/* Empty State (Sharp Edges) */}
                      {facilities.length === 0 && (
                        <div className="text-center py-16 bg-gray-50 rounded-none border border-dashed border-gray-200">
                          <div className="w-12 h-12 bg-white border border-gray-200 rounded-none flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-gray-900 font-black uppercase text-xs tracking-widest">
                            No facilities listed
                          </p>
                          <p className="text-gray-400 text-[11px] mt-1 font-bold uppercase tracking-tight">
                            Facility information not available
                          </p>
                        </div>
                      )}

                    </div>
                  );
                })()}

                {/* ── Nearby Places Tab ── */}
                {activeTab === 'Nearby Places' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-black text-gray-900 tracking-tight uppercase">Places Nearby</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Within 1km of this station</p>
                      </div>
                      <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-none border border-gray-100 uppercase tracking-widest">
                        {filteredPlaces.length} results
                      </span>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                      {['All', 'Restaurants', 'Cafes', 'Parks', 'Stores', 'ATMs'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest transition-all border ${
                            selectedCategory === cat
                              ? 'bg-gray-900 text-white border-gray-900 shadow-md shadow-gray-200'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {loadingPlaces ? (
                      <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-gray-100 border-t-gray-900 rounded-full mx-auto mb-4" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scanning local area…</p>
                      </div>
                    ) : filteredPlaces.length === 0 ? (
                      <div className="text-center py-24 bg-gray-50 rounded-none border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-none border border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-6 text-gray-400">
                          <Navigation2 size={24} />
                        </div>
                        <p className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">No {selectedCategory} Found</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tight">Try selecting a different category</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredPlaces.map(place => (
                          <AmenityCard key={place.id} item={place} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Problem 2 - Nearby Places Section REMOVED (Moved to Tab) */}
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="lg:sticky lg:top-[90px] self-start space-y-6">

              {/* Live Conditions (Atmospheric Layout) */}
              {weather && (
                <div className="py-6 border-b border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-500 mb-6">Live Conditions</p>
                  
                  <div className="flex items-center justify-between mb-8 group cursor-default">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{weather.temp}°</span>
                        <span className="text-sm text-gray-400 font-black">C</span>
                      </div>
                      <p className="text-sm font-bold text-gray-500 mt-2 uppercase tracking-wide">{weather.weatherLabel}</p>
                    </div>
                    <div className="text-sky-500 drop-shadow-sm group-hover:scale-110 transition-transform duration-500 ease-out">
                      <Cloud size={48} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Feels Like</p>
                      <p className="text-sm font-black text-gray-800 tracking-tight">{weather.feelsLike}°C</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Wind</p>
                      <p className="text-sm font-black text-gray-800 tracking-tight">{weather.windKmh} <span className="text-[9px] text-gray-400 font-bold ml-1">km/h</span></p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Humidity</p>
                      <p className="text-sm font-black text-gray-800 tracking-tight">{weather.humidity}%</p>
                    </div>
                    {aqi && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: aqi.aqiColor }}>Air Quality</p>
                        <p className="text-sm font-black tracking-tight" style={{ color: aqi.aqiColor }}>{aqi.aqiLabel}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-6">
                    <div className="h-px flex-1 bg-gray-50" />
                    <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest">Open-Meteo · Live</p>
                  </div>
                </div>
              )}

              {weatherLoading && (
                <div className="py-8 border-b border-gray-100 animate-pulse">
                  <div className="h-2.5 bg-gray-50 rounded-full w-24 mb-6" />
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-12 bg-gray-100 rounded-none w-24" />
                    <div className="w-16 h-16 rounded-full bg-gray-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-gray-50 rounded-none" />
                    <div className="h-8 bg-gray-50 rounded-none" />
                  </div>
                </div>
              )}
              <div className="pb-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Availability</p>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest ${getStatusColor(station.status)}`}
                  >
                    {station.status}
                  </span>
                </div>
                {/* Progress circle-like bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">{station.availableChargers} free</span>
                    <span className="text-gray-400">{station.totalChargers} total</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-none overflow-hidden">
                    <div
                      className="h-full rounded-none transition-all duration-700"
                      style={{ width: `${availPct}%`, background: getStatusHex(station.status) }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1.5 text-right font-black uppercase tracking-tight">{availPct}% available</p>
                </div>
              </div>
              <div className="py-6">
                <button
                  onClick={() => {
                    if (station.isExternal) {
                      toast.error('Booking is only available for ChargeNet network stations')
                      return
                    }
                    if (!isAuthenticated) { navigate('/login'); return }
                    navigate(`/book/${id}`)
                  }}
                  className={`w-full py-2.5 font-black rounded-none text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    station.isExternal 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                      : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
                  }`}
                  disabled={station.isExternal}
                >
                  <BatteryCharging size={14} /> 
                  {station.isExternal ? 'Unavailable' : 'Book a Slot'}
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-2">
                  {station.isExternal 
                    ? 'This is a public station not managed by ChargeNet' 
                    : 'Instant confirmation · Free cancellation'}
                </p>
              </div>

            <div className="py-8">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Station Info</p>
                <div className="h-px flex-1 bg-gray-50 ml-4" />
              </div>
              <div className="space-y-4 text-sm px-1">
                {[
                  { label: 'City', value: station.city },
                  { label: 'Open Hours', value: station.openHours },
                  { label: 'Total Chargers', value: station.totalChargers },
                  { label: 'Available Now', value: station.availableChargers, highlight: station.availableChargers > 0 },
                  { 
                    label: 'Distance', 
                    value: distance ? `${distance} km` : 'Calculating...' 
                  },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between group">
                    <span className="text-gray-400 font-bold text-[11px] uppercase tracking-wide group-hover:text-gray-600 transition-colors">{row.label}</span>
                    <span className={`font-black tracking-tight ${row.highlight ? 'text-emerald-500' : 'text-gray-900'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {station.status !== 'active' && (
              <div className="py-8">
                <div className="p-4 bg-amber-50 border-l-2 border-amber-400">
                  <div className="flex gap-3">
                    <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-black text-amber-900 uppercase tracking-wide">Station Notice</p>
                      <p className="text-xs text-amber-700 mt-1 font-medium leading-relaxed">
                        This station is currently <span className="font-bold underline">{station.status}</span>. We recommend verifying availability before arrival.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      {/* ─── Review Modal ─── */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Write a Review">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Your Rating</label>
            <StarRating rating={userRating} size={32} interactive onRate={setUserRating} />
            {userRating > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][userRating]}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Your Experience</label>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              rows={4}
              placeholder="How was the charging experience? Was the station clean and accessible?"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setReviewModal(false)}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              Submit Review
            </button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  )
}
