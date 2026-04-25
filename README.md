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

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-ISC-yellow?style=flat-square)](https://opensource.org/licenses/ISC)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Observability and Logging](#observability-and-logging)
- [Security](#security)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

---

## Overview

ChargeNet addresses the fragmented state of EV charging infrastructure in India by providing a single, unified platform for EV owners to discover stations, check real-time charger availability, book slots, and share feedback.

The application is architected as a monorepo containing a React + Vite single-page application on the frontend and a Node.js / Express.js REST API server on the backend. Supabase acts as both the relational database (PostgreSQL) and the authentication provider, eliminating the need for a separate auth service. External enrichment data — weather, AQI, and geocoding — is sourced exclusively from free, open APIs. Station tagging is automated via the Anthropic Claude API.

ChargeNet is production-ready in structure, with structured logging (Pino), rate limiting, CORS hardening, and a CI/CD pipeline configured via GitHub Actions.

---

## Features

### Station Discovery
- Interactive map powered by Leaflet and OpenStreetMap displaying 80+ charging stations across India
- Click-to-zoom and click-to-select station behaviour on the map
- Station search and filtering by location, connector type, and availability
- Public shareable URLs per station (SEO-friendly slugs)

### Real-Time Availability
- Live charger status per station (available / occupied / offline)
- Per-charger status updates via dedicated API endpoints
- Station-level availability summary on the map and in list views

### Booking System
- Authenticated slot booking with start/end time selection
- Booking management dashboard for users
- One-click cancellation of upcoming bookings
- Booking history with full status tracking

### Environmental Data
- Live weather conditions at the station's geographic coordinates via Open-Meteo
- Air Quality Index (AQI) data displayed per station
- Data refreshed on station page load with no additional API cost

### Reviews and Ratings
- Star rating and freeform text reviews per station
- Review listing ordered by most recent
- Aggregate rating displayed on station cards and map markers

### AI-Powered Tagging
- Automatic categorisation of stations using Anthropic Claude
- Tags include connector type inferences, amenity classifications, and location context
- Tag data stored in a normalised junction table for efficient querying

### Authentication
- Email and password sign-up and login via Supabase Auth
- Session management handled server-side with JWT verification
- Protected routes enforced on both frontend and API layers

---

## Architecture

```
                    ┌─────────────────────────────────┐
                    │         React SPA (Vite)         │
                    │  React Router · Zustand · Query  │
                    └────────────────┬────────────────┘
                                     │ HTTP / REST
                    ┌────────────────▼────────────────┐
                    │       Express.js API Server      │
                    │   Rate Limiting · CORS · Pino    │
                    └──────┬──────────────┬───────────┘
                           │              │
             ┌─────────────▼──┐    ┌──────▼──────────────┐
             │   Supabase      │    │  External APIs       │
             │   PostgreSQL    │    │  Open-Meteo          │
             │   Auth (JWT)    │    │  Nominatim           │
             └─────────────────┘    │  Anthropic Claude    │
                                    └──────────────────────┘
```

**Data flow:**
1. The React SPA communicates with the Express server for all application data.
2. The Express server queries Supabase using the service role key, keeping privileged credentials strictly server-side.
3. The Supabase JS client on the frontend is used exclusively for authentication session management.
4. External API calls — weather, geocoding, and AI tagging — are proxied through the server to protect API keys from client-side exposure.

---

## Tech Stack

### Frontend

| Library | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI component framework |
| Vite | 5.0.8 | Build tool and development server |
| React Router DOM | 6.21.0 | Client-side routing |
| Tailwind CSS | 3.4.x | Utility-first CSS framework |
| Framer Motion | 11.0.x | Animations and page transitions |
| React Leaflet / Leaflet | 4.2.1 / 1.9.4 | Interactive map rendering |
| Zustand | 4.4.7 | Lightweight global state management |
| TanStack React Query | 5.28.4 | Server state, caching, and async data fetching |
| React Hook Form | 7.51.2 | Form state management and validation |
| Recharts | 2.12.3 | Data visualisation charts |
| Supabase JS | 2.39.0 | Auth session management on the client |
| React Hot Toast | 2.4.1 | In-app toast notifications |
| Lucide React | 0.363.0 | SVG icon set |
| Day.js | 1.11.10 | Date parsing, formatting, and manipulation |

### Backend

| Library | Version | Purpose |
|---|---|---|
| Express.js | Latest | HTTP server, routing, and middleware |
| @supabase/supabase-js | 2.39.0 | Database queries using the service role key |
| Pino | Latest | Structured JSON logging |
| Concurrently | 8.2.2 | Run frontend and backend processes in parallel |
| Nodemon | 3.1.0 | Automatic server restart on file changes |

### Infrastructure and External Services

| Service | Purpose | Tier |
|---|---|---|
| Supabase | PostgreSQL database and authentication | Free / Pro |
| Open-Meteo | Weather and AQI data | Free, no API key required |
| OpenStreetMap / Leaflet | Tile-based interactive maps | Free, no API key required |
| Nominatim | Forward and reverse geocoding | Free, no API key required |
| Anthropic Claude | AI-powered station tagging | Paid |
| GitHub Actions | CI/CD pipeline | Free tier |

---

## Project Structure

```
CHARGENET/
│
├── .github/
│   └── workflows/                  # GitHub Actions CI/CD pipeline definitions
│
├── backend/                        # Legacy backend (retained for reference)
│
├── public/                         # Static assets served directly by Vite
│
├── scripts/                        # Utility scripts for data seeding and migration
│
├── server/                         # Express.js REST API server
│   ├── index.js                    # All route definitions, middleware, and controllers
│   └── package.json                # Server-specific dependencies
│
├── sql/                            # PostgreSQL schema migrations and seed files
│
├── src/                            # React application source code
│   ├── components/                 # Shared, reusable UI components
│   │   └── MapView/                # Leaflet map with zoom and station selection handlers
│   ├── context/                    # React Context providers
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Supabase client initialisation
│   ├── mock/                       # Mock data for offline/development use
│   ├── pages/                      # Page-level route components
│   │   └── solutions/              # Solution-focused informational pages
│   ├── routes/                     # Centralised route configuration
│   ├── services/                   # API service layer (fetch wrappers per resource)
│   ├── store/                      # Zustand store definitions and actions
│   └── utils/                      # Shared utility and helper functions
│
├── .env                            # Local environment variables (not committed)
├── .env.example                    # Environment variable template for onboarding
├── .gitignore
├── eslint.config.js                # ESLint flat config
├── index.html                      # Vite HTML entry point
├── package.json                    # Root dependencies and npm scripts
├── postcss.config.js
├── SECURITY.md                     # Security policy and responsible disclosure process
├── tailwind.config.js
├── vite.config.js                  # Vite build and dev server configuration
└── vitest.config.js                # Vitest unit test configuration
```

---

## Prerequisites

Ensure the following are installed on your development machine before proceeding:

| Requirement | Minimum Version | Notes |
|---|---|---|
| Node.js | 18.x | LTS release recommended |
| npm | 9.x | Bundled with Node.js 18+ |
| Git | Any recent version | Required for cloning |

You will also need active accounts and credentials for the following services:

- **Supabase** — Create a free project at [supabase.com](https://supabase.com). You will need the project URL, the anon (public) key, and the service role key.
- **Anthropic** — Obtain an API key from [console.anthropic.com](https://console.anthropic.com) for the AI station tagging feature.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/annanyaa03/CHARGENET.git
cd CHARGENET
```

### 2. Install all dependencies

```bash
# Install root (frontend) dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in all required values. Refer to the [Environment Variables](#environment-variables) section for a full description of each key.

### 4. Apply the database schema

Run the SQL files in the `sql/` directory against your Supabase project. You can do this via:

- **Supabase Dashboard** — Navigate to the SQL Editor and execute each migration file in order.
- **Supabase CLI** — Run `supabase db push` if the CLI is configured for your project.

Apply files in the order they are numbered to satisfy foreign key constraints.

### 5. Start the development environment

```bash
# Start both frontend and backend concurrently (recommended)
npm run dev:all
```

| Service | Local URL |
|---|---|
| React frontend | http://localhost:5173 |
| Express API server | http://localhost:3001 |
| API health check | http://localhost:3001/api/health |

---

## Environment Variables

Copy `.env.example` to `.env` and populate all values before starting the application. Variables prefixed with `VITE_` are embedded into the browser bundle at build time. All other variables are server-only and never sent to the client.

```env
# ─────────────────────────────────────────────────────────────
# Frontend — exposed to the browser via Vite (VITE_ prefix required)
# ─────────────────────────────────────────────────────────────

# Your Supabase project URL (found in Project Settings > API)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase anonymous (public) key — safe to expose to the browser
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Anthropic API key — used server-side for AI tagging; avoid exposing in client code
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key

# Base URL of the Express API server, used by the frontend service layer
VITE_API_URL=http://localhost:3001


# ─────────────────────────────────────────────────────────────
# Server — never exposed to the browser
# ─────────────────────────────────────────────────────────────

# Same Supabase project URL, used by the server to initialise the client
SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase service role key — has full database access; must remain server-side only
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Port the Express API server will listen on
PORT=3001
```

> **Security notice:** The `.env` file is listed in `.gitignore` and must never be committed to version control. Rotate your `SUPABASE_SERVICE_KEY` immediately if it is ever exposed in a public commit.

---

## Available Scripts

All scripts are executed from the project root unless otherwise specified.

| Script | Command | Description |
|---|---|---|
| Start frontend | `npm run dev` | Launches the Vite development server on port 5173 with Hot Module Replacement |
| Start backend | `npm run dev:server` | Launches the Express API server via Nodemon with automatic restart on file changes |
| Start both | `npm run dev:all` | Runs frontend and backend concurrently using Concurrently (recommended for development) |
| Production build | `npm run build` | Compiles, bundles, and optimises the React app into the `dist/` directory |
| Preview build | `npm run preview` | Serves the production build locally for pre-deployment verification |
| Lint | `npm run lint` | Runs ESLint across all `.js` and `.jsx` source files |

---

## API Reference

**Base URL:** `http://localhost:3001` (development)

All endpoints return JSON. Endpoints marked as requiring authentication expect a valid Supabase session JWT passed as a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <supabase-access-token>
```

---

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | None | Returns server status and process uptime. Suitable for liveness probes. |

**Sample response:**
```json
{
  "status": "ok",
  "uptime": 12345.67
}
```

---

### Stations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/stations` | None | Returns a list of all stations with summary data, charger counts, and average ratings |
| `GET` | `/api/stations/:id` | None | Returns full station detail including chargers, tags, weather, AQI, and reviews summary |
| `GET` | `/api/stations/slug/:slug` | None | Returns station detail by URL-friendly slug, used for public sharing links |
| `POST` | `/api/stations` | Required | Creates a new station record |
| `PUT` | `/api/stations/:id` | Required | Replaces all updatable fields on an existing station |
| `DELETE` | `/api/stations/:id` | Required | Removes a station record |

**Sample — GET `/api/stations/:id` response:**
```json
{
  "id": "a1b2c3d4-...",
  "name": "Hinjewadi EV Hub",
  "slug": "hinjewadi-ev-hub",
  "address": "Phase 1, Hinjewadi, Pune, Maharashtra",
  "latitude": 18.5913,
  "longitude": 73.7389,
  "chargers": [
    { "id": "...", "connector_type": "CCS2", "power_kw": 50, "status": "available" }
  ],
  "tags": ["Fast Charging", "Covered Parking", "24/7 Access"],
  "weather": { "temperature_c": 32, "aqi": 65, "condition": "Sunny" },
  "average_rating": 4.3,
  "total_reviews": 18
}
```

---

### Chargers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/stations/:id/chargers` | None | Lists all charger units at a given station with connector type, power output, and current status |
| `PATCH` | `/api/chargers/:id/status` | Required | Updates the availability status of a single charger |

**PATCH `/api/chargers/:id/status` — request body:**
```json
{
  "status": "available"
}
```

Accepted values for `status`: `available`, `occupied`, `offline`.

---

### Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/bookings` | Required | Returns all bookings for the authenticated user, ordered by start time |
| `POST` | `/api/bookings` | Required | Creates a new slot booking for a specific charger |
| `PATCH` | `/api/bookings/:id/cancel` | Required | Cancels an upcoming booking; rejected if the booking has already started |

**POST `/api/bookings` — request body:**
```json
{
  "charger_id": "uuid",
  "station_id": "uuid",
  "start_time": "2026-04-26T10:00:00Z",
  "end_time": "2026-04-26T11:00:00Z"
}
```

---

### Reviews

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/stations/:id/reviews` | None | Returns all reviews for a station, ordered by most recent |
| `POST` | `/api/reviews` | Required | Submits a new review with a numeric star rating (1–5) and optional comment text |

**POST `/api/reviews` — request body:**
```json
{
  "station_id": "uuid",
  "rating": 5,
  "comment": "Excellent charging speed and clean facilities."
}
```

---

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | None | Registers a new user with email and password; creates a corresponding profile record |
| `POST` | `/api/auth/login` | None | Authenticates an existing user and returns a Supabase session with access and refresh tokens |
| `POST` | `/api/auth/logout` | Required | Invalidates the current session and revokes the refresh token |

---

## Database Schema

All tables are managed in Supabase (PostgreSQL). Row Level Security (RLS) should be enabled in production deployments to enforce per-user data access at the database layer. Migration files are located in `sql/`.

### Tables

| Table | Primary Key | Description |
|---|---|---|
| `profiles` | `id` UUID (FK → `auth.users`) | Extended user profile data linked to the Supabase Auth user record |
| `stations` | `id` UUID | Core EV charging station records — name, address, coordinates, slug, and metadata |
| `chargers` | `id` UUID (FK → `stations`) | Individual charger units per station — connector type, power output (kW), and current status |
| `bookings` | `id` UUID | Slot reservations linking a user profile, a charger, and a time window |
| `reviews` | `id` UUID | User-submitted station reviews — star rating (1–5) and optional comment text |
| `tags` | `id` UUID | Tag definitions used for station categorisation (e.g., "Fast Charging", "24/7 Access") |
| `station_tags` | Composite (`station_id`, `tag_id`) | Junction table normalising the many-to-many relationship between stations and tags |

### Entity Relationships

```
auth.users
    └── profiles            (1 : 1)

stations
    ├── chargers            (1 : many)
    │     └── bookings      (1 : many)
    ├── reviews             (1 : many)
    └── station_tags        (1 : many)
            └── tags        (many : 1)
```

---

## Observability and Logging

ChargeNet uses **Pino** for structured JSON logging on the Express server. Log output is written to both stdout and the `logs/` directory.

Each log entry includes the following fields:

| Field | Description |
|---|---|
| `timestamp` | ISO 8601 timestamp of the event |
| `level` | Log level: `info`, `warn`, or `error` |
| `method` | HTTP method of the incoming request |
| `url` | Request path |
| `statusCode` | HTTP response status code |
| `responseTime` | Time in milliseconds to process the request |
| `message` | Human-readable description of the event |

In a production environment, it is recommended to pipe stdout to a log aggregation service such as Logtail, Datadog, or AWS CloudWatch for centralised monitoring and alerting.

---

## Security

A full security policy and responsible disclosure process are documented in [`SECURITY.md`](./SECURITY.md). Key security measures currently implemented:

| Measure | Details |
|---|---|
| API rate limiting | Per-IP request throttling on all API routes to mitigate brute-force and abuse |
| CORS hardening | Express CORS middleware restricts allowed origins to the configured frontend URL |
| Credential separation | Supabase service role key is strictly server-side; only the anon key is exposed to the browser |
| Input validation | All POST and PATCH request bodies are validated before reaching the database layer |
| Supabase RLS | Row Level Security policies are recommended for production to enforce per-user data access |
| `.env` protection | The `.env` file is listed in `.gitignore`; a `.env.example` template is provided for onboarding |

To report a security vulnerability, please follow the responsible disclosure process described in `SECURITY.md` rather than opening a public issue.

---

## Contributing

Contributions are welcome. Please follow the process below to ensure a smooth and consistent review.

### Workflow

1. Fork the repository and create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, ensuring the following before committing:
   - `npm run lint` passes with no errors or warnings
   - New API routes are documented in [API Reference](#api-reference)
   - Any database schema changes include a corresponding SQL migration file in `sql/`

3. Write commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification:
   ```
   feat: add station filtering by connector type
   fix: resolve CORS error on /api/stations/:id
   chore: update Supabase JS client to 2.40.0
   refactor: consolidate auth middleware into shared util
   docs: update API reference for bookings endpoint
   ```

4. Push to your fork and open a pull request against `main`. Include a clear description of the change, its motivation, and any relevant screenshots for UI changes.

### Code Style Guidelines

- All components must be functional components using React hooks
- Global/shared state: use **Zustand**
- Server/async state: use **TanStack React Query**
- Component-scoped state: use local `useState`
- API calls should go through the `src/services/` layer, not directly in components or hooks

---

## Author

**Annanya Ukey**
GitHub: [@annanyaa03](https://github.com/annanyaa03)

---

## License

This project is not released under an open-source license. All rights are reserved by the author. Unauthorised copying, distribution, or modification of this codebase is prohibited without explicit written permission from the author.




---

<div align="center">
Built with React, Express, and Supabase.
</div>
