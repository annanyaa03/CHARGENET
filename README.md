# ChargeNet

**India's EV charging station discovery and booking platform.**

ChargeNet allows EV drivers to locate charging stations across India, check real-time charger availability, book time slots, view weather and AQI conditions, and read community reviews. The platform exposes public shareable URLs per station and uses AI-assisted tagging for discoverability.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Scripts](#development-scripts)

---

## Tech Stack

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
| React Hook Form | 7.x | Form management |
| Supabase JS | 2.39 | Auth and database client |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| Supabase (PostgreSQL) | Primary database and authentication |
| Nodemailer | Transactional email via SMTP |
| Razorpay | Payment processing |

### External APIs

| API | Purpose | Pricing |
|---|---|---|
| Open-Meteo | Weather and AQI data | Free |
| OpenStreetMap / Leaflet | Map tiles | Free |
| Nominatim | Geocoding | Free |
| Anthropic Claude | AI station tagging | Usage-based |
| Razorpay | Payment gateway | Transaction fee |

---

## Project Structure

```
chargenet/
├── backend/                  # Legacy backend (deprecated, kept for reference)
├── public/                   # Static assets
├── scripts/                  # Utility and seed scripts
├── server/                   # Active Express API server
│   ├── index.js              # All routes and middleware
│   └── package.json
├── src/                      # React frontend source
│   ├── components/           # Reusable UI components
│   ├── context/              # React context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Supabase client initialisation
│   ├── mock/                 # Static mock data for development
│   ├── pages/                # Route-level page components
│   │   └── solutions/        # Solution-specific pages
│   ├── routes/               # Route configuration
│   ├── services/             # API service layer (fetch wrappers)
│   ├── store/                # Zustand state stores
│   └── utils/                # Shared utility functions
├── .env.example              # Environment variable template
├── index.html                # HTML entry point
├── package.json              # Root dependencies and scripts
└── vite.config.js            # Vite configuration
```

---

## Database Schema

| Table | Description |
|---|---|
| `stations` | EV charging station records |
| `chargers` | Individual charger units per station |
| `bookings` | User slot reservations |
| `reviews` | Station ratings and text reviews |
| `tags` | Descriptive station tags |
| `station_tags` | Junction table: stations to tags (many-to-many) |
| `profiles` | Extended user profile data |

---

## API Reference

Base URL: `http://localhost:3001/api`

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server health check |

### Stations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stations` | List all stations |
| GET | `/stations/:id` | Retrieve a station by ID |
| GET | `/stations/slug/:slug` | Retrieve a station by public slug |
| POST | `/stations` | Create a new station |
| PUT | `/stations/:id` | Update a station |
| DELETE | `/stations/:id` | Delete a station |
| GET | `/stations/:id/chargers` | List chargers at a station |
| GET | `/stations/:id/reviews` | List reviews for a station |

### Chargers

| Method | Endpoint | Description |
|---|---|---|
| PATCH | `/chargers/:id/status` | Update charger availability status |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| GET | `/bookings` | List bookings for the authenticated user |
| POST | `/bookings` | Create a new booking |
| PATCH | `/bookings/:id/cancel` | Cancel an existing booking |

### Reviews

| Method | Endpoint | Description |
|---|---|---|
| POST | `/reviews` | Submit a station review |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Authenticate and receive a session |
| POST | `/auth/logout` | Invalidate the current session |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- A [Supabase](https://supabase.com) project with the schema applied

### Installation

```bash
# Clone the repository
git clone https://github.com/annanyaa03/CHARGENET.git
cd CHARGENET

# Install frontend dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Configure environment variables
cp .env.example .env
# Edit .env and populate all required values
```

### Running Locally

```bash
# Start frontend only (port 5173)
npm run dev

# Start backend only (port 3001)
npm run dev:server

# Start both concurrently
npm run dev:all
```

### Production Build

```bash
npm run build
```

---

## Environment Variables

Copy `.env.example` to `.env` before running the project.

### Frontend (Vite — compiled into client bundle, publicly visible)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (publishable) key |
| `VITE_API_URL` | Base URL of the Express API server |
| `VITE_RAZORPAY_KEY_ID` | Razorpay publishable key |

### Server (Node — server-side only, never expose to client)

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (default: 3001) |
| `NODE_ENV` | Runtime environment: `development` or `production` |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key |
| `SUPABASE_SECRET_KEY` | Supabase service role key — privileged, server only |
| `SUPABASE_JWT_SECRET` | JWT secret for token verification |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key — server only |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port (typically 587) |
| `SMTP_USER` | SMTP authentication username |
| `SMTP_PASS` | SMTP authentication password |
| `SMTP_FROM` | Sender address for outgoing mail |

> `VITE_` prefixed variables are compiled into the browser bundle and are publicly visible to all users. Never assign privileged secrets (`SUPABASE_SECRET_KEY`, `RAZORPAY_KEY_SECRET`, `SMTP_PASS`) to `VITE_` variables.

---

## Development Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite frontend dev server |
| `npm run dev:server` | Start Express API server via nodemon |
| `npm run dev:all` | Start frontend and backend concurrently |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all JS and JSX files |

---



---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes with descriptive messages.
4. Push to your fork and open a pull request against `main`.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
