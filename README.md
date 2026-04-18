# ChargeNet - EV Charging Network

## Overview
ChargeNet is India's premier EV charging station network app built with React, Supabase and Express.

## Features
- Find 80+ EV charging stations across India
- Real-time charger availability
- Book charging slots instantly
- Weather and AQI data at each station
- Reviews and ratings
- AI-powered station tagging
- Public shareable station URLs

## Tech Stack
### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Leaflet Maps
- Supabase JS Client
- Zustand (state management)
- React Hot Toast

### Backend
- Express.js
- Supabase (PostgreSQL)
- Node.js

### APIs Used
- Open-Meteo (Weather - Free)
- OpenStreetMap/Leaflet (Maps - Free)
- Nominatim (Geocoding - Free)
- Anthropic Claude (AI Tagging)

## Project Structure
```
chargenet/
├── backend/        # Legacy backend (kept)
├── logs/           # Log files
├── public/         # Static assets
├── scripts/        # Utility scripts
├── server/         # Express API server
│   ├── index.js    # All API routes
│   └── package.json
├── src/            # React frontend
│   ├── components/ # Reusable components
│   ├── context/    # React context
│   ├── hooks/      # Custom hooks
│   ├── lib/        # Supabase client
│   ├── mock/       # Mock data
│   ├── pages/      # Page components
│   │   └── solutions/ # Solution pages
│   ├── routes/     # Route config
│   ├── services/   # API service layer
│   ├── store/      # State management
│   └── utils/      # Utilities
├── .env            # Environment variables
├── .env.example    # Environment template
├── .gitignore      # Git ignore rules
├── index.html      # Entry HTML
├── package.json    # Dependencies
├── README.md       # Documentation
└── vite.config.js  # Vite config
```

## Environment Variables
Ensure `.env.example` at root level has all required variables:

# Frontend (Vite)
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ANTHROPIC_API_KEY=your-anthropic-key-here
VITE_API_URL=http://localhost:3001

# Server
SUPABASE_URL=your-supabase-url-here
SUPABASE_SERVICE_KEY=your-service-key-here
PORT=3001

## Getting Started

### Install dependencies
```bash
npm install
cd server && npm install
```

### Run development
```bash
# Frontend only
npm run dev

# Backend only  
npm run dev:server

# Both together
npm run dev:all
```

### Build for production
```bash
npm run build
```

## Database Schema
- stations - EV charging stations
- chargers - Individual chargers at stations
- bookings - User slot bookings
- reviews - Station reviews and ratings
- tags - Station tags
- station_tags - Junction table
- profiles - User profiles

## API Routes
```
GET    /api/health
GET    /api/stations
GET    /api/stations/:id
GET    /api/stations/slug/:slug
POST   /api/stations
PUT    /api/stations/:id
DELETE /api/stations/:id
GET    /api/stations/:id/chargers
PATCH  /api/chargers/:id/status
GET    /api/bookings
POST   /api/bookings
PATCH  /api/bookings/:id/cancel
GET    /api/stations/:id/reviews
POST   /api/reviews
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
```
