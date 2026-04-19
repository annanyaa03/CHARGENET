<div align="center">

```
 ██████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ███████╗███╗   ██╗███████╗████████╗
██╔════╝██║  ██║██╔══██╗██╔══██╗██╔════╝ ██╔════╝████╗  ██║██╔════╝╚══██╔══╝
██║     ███████║███████║██████╔╝██║  ███╗█████╗  ██╔██╗ ██║█████╗     ██║   
██║     ██╔══██║██╔══██║██╔══██╗██║   ██║██╔══╝  ██║╚██╗██║██╔══╝     ██║   
╚██████╗██║  ██║██║  ██║██║  ██║╚██████╔╝███████╗██║ ╚████║███████╗   ██║   
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═══╝╚══════╝   ╚═╝   
```

**India's EV Charging Station Network**

*Find. Book. Charge.*

---

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

</div>

---

## Overview

ChargeNet is a full-stack web application that connects EV drivers with a network of **80+ charging stations** across India. The platform provides real-time charger availability, slot booking, weather and AQI data at each station, community reviews, and AI-powered station tagging — all accessible through a clean, map-first interface.

The backend is built with a production-grade Express.js architecture: modular MVC structure, Zod schema validation, Pino structured logging, per-route rate limiting, Helmet security headers, and Supabase JWT authentication.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Scripts](#development-scripts)
- [Security](#security)
- [Contributing](#contributing)

---

## Features

| Feature | Description |
|---|---|
| Station Discovery | Browse 80+ stations on an interactive Leaflet map |
| Real-time Availability | Live charger status per station |
| Slot Booking | Book and cancel EV charging sessions |
| Weather and AQI | On-site environmental data via Open-Meteo |
| Reviews and Ratings | Community-sourced station feedback |
| AI Tagging | Anthropic Claude-powered station tag generation |
| Shareable URLs | Public slug-based station pages |
| Payments | Razorpay integration |

---

## Architecture

```
                          CLIENT (React + Vite)
                                   |
                          HTTP / REST (JSON)
                                   |
            ┌──────────────────────▼──────────────────────┐
            │              EXPRESS API SERVER              │
            │                                             │
            │  requestLogger → helmet → cors → bodyParser │
            │          → rateLimit → requireAuth          │
            │                                             │
            │   /api/v1/stations   →  stationRoutes       │
            │   /api/v1/chargers   →  chargerRoutes       │
            │   /api/v1/bookings   →  bookingRoutes       │
            │   /api/v1/reviews    →  reviewRoutes        │
            │                                             │
            │        notFoundHandler → errorHandler       │
            └──────────────┬──────────────────────────────┘
                           |
              ┌────────────┴────────────┐
              |                         |
       ┌──────▼──────┐         ┌────────▼────────┐
       │  SUPABASE   │         │  EXTERNAL APIs  │
       │ PostgreSQL  │         │                 │
       │    + Auth   │         │  Open-Meteo     │
       │    + RLS    │         │  Anthropic AI   │
       └─────────────┘         │  Razorpay       │
                               └─────────────────┘
```

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | >= 18 | Runtime |
| Express.js | 4.x | HTTP framework |
| Supabase JS | 2.x | Database client and JWT verification |
| Zod | 3.x | Request schema validation |
| Pino | Latest | Structured JSON logging |
| Helmet | Latest | HTTP security headers |
| express-rate-limit | Latest | Per-route rate limiting |
| Vitest | Latest | Unit and integration testing |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework |
| Vite | 5.x | Build tool and dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| React Router | v6 | Client-side routing |
| Zustand | 4.4 | Global state management |
| TanStack Query | 5.x | Server state and caching |
| React Leaflet | 4.2 | Interactive maps |
| Framer Motion | 11.x | Animations |
| React Hook Form | 7.x | Form handling |

### External APIs

| API | Purpose | Cost |
|---|---|---|
| Open-Meteo | Weather and AQI data | Free |
| OpenStreetMap / Leaflet | Map tiles | Free |
| Nominatim | Geocoding | Free |
| Anthropic Claude | AI station tagging | Usage-based |
| Razorpay | Payment processing | Transaction fee |

---

## Project Structure

```
chargenet/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI pipeline
│
├── server/                         # Express API server
│   ├── controllers/
│   │   ├── bookingsController.js
│   │   ├── chargersController.js
│   │   ├── reviewsController.js
│   │   └── stationsController.js
│   ├── lib/
│   │   ├── logger.js               # Pino logger instance
│   │   ├── response.js             # Standardised response helpers
│   │   └── supabase.js             # Supabase client (service role)
│   ├── middleware/
│   │   ├── asyncHandler.js         # Async error wrapper
│   │   ├── auth.js                 # Supabase JWT verification
│   │   ├── errorHandler.js         # Global error and 404 handler
│   │   ├── logger.js               # pino-http request logger
│   │   ├── rateLimit.js            # Per-route rate limiters
│   │   ├── security.js             # Helmet and CORS configuration
│   │   └── validate.js             # Zod schema validator middleware
│   ├── routes/
│   │   ├── bookings.js
│   │   ├── chargers.js
│   │   ├── reviews.js
│   │   └── stations.js
│   ├── schemas/
│   │   ├── auth.schema.js
│   │   ├── booking.schema.js
│   │   ├── review.schema.js
│   │   └── station.schema.js
│   ├── services/
│   │   ├── ai.js                   # Anthropic Claude integration
│   │   ├── booking.service.js
│   │   ├── charger.service.js
│   │   ├── review.service.js
│   │   ├── station.service.js
│   │   └── supabase.js
│   ├── tests/                      # Vitest test suite
│   ├── index.js                    # Application entry point
│   ├── vitest.config.js
│   └── package.json
│
├── sql/
│   ├── schema.sql                  # Full database schema
│   ├── seed-stations.sql           # Station seed data
│   ├── database-design-fix.sql
│   └── public-rls-fix.sql          # Row Level Security policies
│
├── src/                            # React frontend
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/                        # Supabase client (anon key)
│   ├── mock/
│   ├── pages/
│   ├── routes/
│   ├── services/                   # Frontend API service layer
│   ├── store/                      # Zustand stores
│   └── utils/
│
├── .env.example
├── SECURITY.md
├── package.json
└── vite.config.js
```

---

## Database Schema

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│  stations   │──────<│   chargers   │       │   bookings   │
│─────────────│       │──────────────│       │──────────────│
│ id          │       │ id           │       │ id           │
│ name        │       │ station_id   │       │ user_id      │
│ slug        │       │ type         │       │ charger_id   │
│ location    │       │ power_kw     │       │ station_id   │
│ latitude    │       │ status       │       │ start_time   │
│ longitude   │       │ connector    │       │ end_time     │
│ address     │       └──────────────┘       │ status       │
│ amenities   │                              └──────────────┘
└──────┬──────┘
       │                ┌──────────────┐       ┌──────────────┐
       ├───────────────<│   reviews    │       │   profiles   │
       │                │──────────────│       │──────────────│
       │                │ id           │       │ id           │
       │                │ station_id   │       │ user_id      │
       │                │ user_id      │       │ full_name    │
       │                │ rating       │       │ vehicle_type │
       │                │ comment      │       └──────────────┘
       │                └──────────────┘
       │
       │         ┌──────────────┐     ┌──────────────┐
       └────────<│ station_tags │>────│     tags     │
                 └──────────────┘     └──────────────┘
```

---

## API Reference

**Base URL:** `http://localhost:3001/api/v1`

All write endpoints require an `Authorization: Bearer <token>` header.  
All responses follow the envelope: `{ success, data | error, timestamp }`.

---

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | Public | Server status, uptime, version |

---

### Stations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stations` | Public | List all stations |
| GET | `/stations/:id` | Public | Get station by ID |
| GET | `/stations/slug/:slug` | Public | Get station by public slug |
| POST | `/stations` | Required | Create a station |
| PUT | `/stations/:id` | Required | Update a station |
| DELETE | `/stations/:id` | Required | Delete a station |
| GET | `/stations/:id/chargers` | Public | List chargers at a station |
| GET | `/stations/:id/reviews` | Public | List reviews for a station |

---

### Chargers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PATCH | `/chargers/:id/status` | Required | Update charger availability |

---

### Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/bookings` | Required | List current user's bookings |
| POST | `/bookings` | Required | Create a booking |
| PATCH | `/bookings/:id/cancel` | Required | Cancel a booking |

---

### Reviews

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/reviews` | Required | Submit a station review |

---

### Response Format

```json
// Success
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "field": "rating", "message": "Expected number" }]
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Error Codes

| Code | HTTP Status | Cause |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Zod schema validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Authenticated but not permitted |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate resource (DB constraint) |
| `SERVER_ERROR` | 500 | Unhandled internal error |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- A [Supabase](https://supabase.com) project
- Razorpay test account (optional, for payment flows)

### 1. Clone and Install

```bash
git clone https://github.com/annanyaa03/CHARGENET.git
cd CHARGENET

# Frontend dependencies
npm install

# Server dependencies
cd server && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
cp server/.env.example server/.env
# Edit both files and populate all required values
```

### 3. Apply Database Schema

In your Supabase SQL editor, run the files in this order:

```
sql/schema.sql
sql/public-rls-fix.sql
sql/seed-stations.sql      # optional: seeds 80+ stations
```

### 4. Start Development Servers

```bash
# Frontend only   — http://localhost:5173
npm run dev

# Backend only    — http://localhost:3001
npm run dev:server

# Both together
npm run dev:all
```

---

## Environment Variables

### Frontend (`/.env`) — compiled into browser bundle, publicly visible

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (publishable) key |
| `VITE_API_URL` | Express API base URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay publishable key |

### Server (`/server/.env`) — server-side only, never exposed to client

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `3001`) |
| `NODE_ENV` | `development` or `production` |
| `FRONTEND_URL` | Allowed CORS origin in production |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key |
| `SUPABASE_SECRET_KEY` | Supabase service role key — privileged |
| `SUPABASE_JWT_SECRET` | JWT secret for token verification |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key — server only |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (typically `587`) |
| `SMTP_USER` | SMTP authentication username |
| `SMTP_PASS` | SMTP authentication password |
| `SMTP_FROM` | Sender address for transactional email |

> `VITE_` prefixed variables are bundled into the client and visible to all users.  
> Never assign privileged credentials — service role keys, payment secrets, SMTP passwords — to `VITE_` variables.

---

## Development Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite frontend dev server |
| `npm run dev:server` | Start Express API with nodemon |
| `npm run dev:all` | Start frontend and backend concurrently |
| `npm run build` | Production build of the frontend |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across all JS and JSX files |
| `cd server && npm test` | Run Vitest test suite |

---

## Security

The backend implements a layered security model across every request.

**HTTP Headers** — Helmet enforces Content Security Policy, HSTS with a one-year max-age and preload, X-Frame-Options deny, X-Content-Type-Options nosniff, and Referrer-Policy strict-origin-when-cross-origin.

**CORS** — Strict origin whitelist. Requests from unlisted origins are rejected at the middleware level. `Access-Control-Allow-Credentials` is enabled for authenticated flows.

**Authentication** — All non-GET routes require a valid Supabase JWT as `Authorization: Bearer <token>`. Tokens are verified server-side via the Supabase service role client and the authenticated user is attached to `req.user` for all downstream handlers.

**Rate Limiting** — Four independent limiters protect distinct surfaces:

| Limiter | Window | Limit |
|---|---|---|
| General API | 15 minutes | 100 requests |
| Authentication | 15 minutes | 10 requests |
| Bookings | 1 hour | 20 requests |
| Reviews | 1 hour | 5 requests |

**Validation** — All incoming request bodies are validated against Zod schemas before reaching controllers. Invalid payloads return structured 400 responses with per-field error details.

**Database** — Row Level Security policies are applied at the Supabase layer, ensuring users can only access their own data regardless of API-level checks.

To report a vulnerability, see [SECURITY.md](SECURITY.md).

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Write tests for any new behaviour.
4. Ensure all tests pass: `cd server && npm test`
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/).
6. Open a pull request against `main` with a clear description of changes.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
Built with React, Express, and Supabase.
</div>
