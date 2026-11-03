# FitTrack Pro — Full-Stack Fitness Performance Platform

FitTrack Pro is a full-stack, production-ready fitness tracking platform built with **React 19 + Vite**, **Node.js + Express**, and **MongoDB Atlas** (via Mongoose). Designed with the Athletic Performance Lab aesthetic (black, off-white, and red accents), the platform provides comprehensive workout logging, strength volume calculations, dynamic goal tracking, body measurements, and nutrition journals.

---

## 🏛 System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 19 + Vite + Tailwind)"]
        UI["Athletic Performance UI / AppShell"]
        Redux["Redux Toolkit (Auth & Profile State)"]
        APIClient["API Service (credentials: 'include')"]
        UI --> Redux
        Redux --> APIClient
    end

    subgraph Security ["Security & Transport Boundary"]
        CORS["Strict CORS Whitelist (CLIENT_URL)"]
        Helmet["Helmet HTTP Security Headers"]
        RateLimit["Express Rate Limiting (20 req/15 min)"]
        Cookies["httpOnly SameSite Cookies (No localStorage JWT)"]
    end

    subgraph Server ["Backend (Node.js + Express REST API)"]
        ZodVal["Zod Schema & ObjectId Validation"]
        AuthMid["JWT Authentication & Multi-Tenant Scope"]
        Routes["API Routes (/auth, /dashboard, /workouts, /goals, /progress)"]
    end

    subgraph Database ["Data Tier"]
        Atlas["MongoDB Atlas Cluster (portfolio-cluster / Fittrack)"]
    end

    APIClient -->|HTTPS + Cookie| CORS
    CORS --> Helmet
    Helmet --> RateLimit
    RateLimit --> ZodVal
    ZodVal --> AuthMid
    AuthMid --> Routes
    Routes -->|Mongoose Queries (Scoped by user ID)| Atlas
```

---

## 🔒 Security Architecture

1. **HttpOnly Cookie Session Management:**
   - Authentication tokens are issued as `httpOnly`, `secure` (in production), and `SameSite` cookies (`fittrack_token`).
   - Raw JWTs are **never stored in `localStorage`**, eliminating cross-site scripting (XSS) token exfiltration risks.
   - Frontend `fetch` requests leverage `credentials: 'include'`, allowing the browser to manage credentials transparently.

2. **Strict Production Secret Enforcement & Safe CORS:**
   - In production (`NODE_ENV=production`), server boot immediately halts if `JWT_SECRET` is missing or shorter than 32 characters.
   - Development mode provides an explicit fallback secret with console warnings for rapid onboarding.
   - When `credentials: true` is enabled, wildcard origins (`*`) are strictly rejected in production to comply with the Fetch standard and prevent credential leakage.

3. **CORS Origin Whitelisting & Cookie Configuration:**
   - Only browser origins explicitly declared in `CLIENT_URL` / `CLIENT_ORIGIN` are permitted.
   - Unauthorized browser origins receive an immediate `403 Forbidden` response.
   - Server-to-server health checks and tools without an `Origin` header (such as `curl` and uptime probes) remain functional.
   - **Local Development**: `CLIENT_URL=http://localhost:5173`, `COOKIE_SAME_SITE=lax`, cookies do not require HTTPS (`secure: false`).
   - **Cross-Domain Cloud Deployment** (e.g., frontend on `vercel.app`, backend on `onrender.com`): Set `CLIENT_URL=https://your-frontend.vercel.app`, `COOKIE_SAME_SITE=none`, and `NODE_ENV=production` (`secure: true`).
   - **Same-Domain Deployment** (e.g., custom domain or reverse proxy routing `/api`): Set `CLIENT_URL=https://app.yourdomain.com`, `COOKIE_SAME_SITE=lax`, `secure: true`.

4. **Authentication Rate Limiting:**
   - Public authentication routes (`/api/auth/login`, `/api/auth/register`, `/api/auth/demo`) are strictly rate-limited to **20 requests per 15 minutes** per IP address in production, mitigating brute-force and credential stuffing attacks.

5. **Multi-Tenant Data Isolation:**
   - Every resource retrieval, update, and deletion is scoped strictly by `{ _id: resourceId, user: req.user.id }`.
   - Access attempts to records owned by another user return an authentic `404 Not Found` rather than leaking existence.

5. **Request Validation & Defensive Typing:**
   - All inbound payloads for registration, login, workout creation/updates, goals, nutrition logs, and progress journals are strictly validated using **Zod schemas**.
   - URL route parameters are validated as 24-character hexadecimal MongoDB ObjectIds before queries execute, preventing Mongoose `CastError` unhandled exceptions.

6. **Database Disconnection Handling:**
   - `/api/health` continuously reports live database status (`connected` vs `disconnected`) with the Mongoose `readyState`.
   - When the database is unreachable, protected endpoints return a clean `503 Service Unavailable` rather than fabricating mock data.
   - Live Demo overview mode is only served when explicitly enabled via `DEMO_MODE=true`.

---

## 📁 Repository Structure

```text
Fit-track_app/
├── frontend/                  # React 19 + Vite client application
│   ├── src/
│   │   ├── components/        # AppShell, StatCard, PasswordInput, NoticeModal
│   │   ├── features/          # Redux Toolkit slices (auth, user)
│   │   ├── pages/             # Landing, Dashboard, Workouts, Goals, Progress, Auth
│   │   ├── services/          # HTTP API client and feature services
│   │   └── utils/             # Formatters, classNames, theme management
│   ├── .env.example           # Frontend environment variable template
│   └── package.json           # Frontend scripts and dependencies
│
├── backend/                   # Node.js + Express REST API
│   ├── src/
│   │   ├── config/            # Database connection & seed data
│   │   ├── middleware/        # Authentication, Zod validation, error handling
│   │   ├── models/            # User, Workout, Goal, ProgressEntry, NutritionLog
│   │   ├── routes/            # Auth, Dashboard, Workouts, Goals, Nutrition, Progress
│   │   ├── validation/        # Zod input validation schemas
│   │   ├── app.js             # Express application definition
│   │   └── server.js          # HTTP listener and process lifecycle
│   ├── test/                  # Automated Vitest + Supertest test suites
│   ├── .env.example           # Backend environment variable template
│   └── package.json           # Backend scripts and dependencies
│
├── scripts/
│   └── dev.js                 # Zero-dependency concurrent development runner
├── package.json               # Root monorepo orchestration
└── README.md                  # Project documentation and deployment guide
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Local server port | `5000` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB Atlas SRV connection string | `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/Fittrack?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for signing JWTs (must be >= 32 characters in production) | `your_at_least_32_characters_long_secret_here` |
| `JWT_EXPIRES_IN` | JWT token lifetime | `7d` |
| `CLIENT_URL` | Approved frontend origin for CORS | `http://localhost:5173` |
| `COOKIE_SAME_SITE` | SameSite cookie policy (`lax`, `none`, or `strict`) | `lax` |
| `DEMO_MODE` | Enable guest live demo overview fallback mode | `true` |

### Frontend (`frontend/.env`)

| Variable | Description | Example / Default |
|---|---|---|
| `VITE_API_URL` | Base URL pointing to backend API | `http://localhost:5000/api` |

---

## 🍃 MongoDB Atlas Setup

FitTrack Pro connects to MongoDB Atlas using the official Node.js Mongoose driver:

1. **Sign in to Atlas:** Go to [MongoDB Atlas](https://cloud.mongodb.com/).
2. **Create Database User:**
   - Under **Security** > **Database Access**, create a user (e.g., `fittrack_app_user`).
   - Grant the role `Read and write to any database`.
   - Store the password securely.
3. **Configure IP Access:**
   - Under **Security** > **Network Access**, add an IP entry.
   - For local development, add your current public IP address or use `0.0.0.0/0` (allow from anywhere) for containerized cloud deployment.
4. **Copy Connection String:**
   - In **Databases** > **Cluster**, click **Connect** > **Drivers** (Node.js).
   - Paste the URI into `backend/.env` under `MONGODB_URI`, replacing `<username>`, `<password>`, and the database name (e.g., `Fittrack`).

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 2. Installation
Clone the repository and install all dependencies:
```bash
# Clone the repository
git clone https://github.com/<your-username>/Fit-track_app.git
cd Fit-track_app

# Install dependencies in both backend and frontend
npm run install:all
```

### 3. Configure Environment Files
Copy the `.env.example` templates in both folders:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Edit `backend/.env` to include your MongoDB Atlas URI and a secure `JWT_SECRET`.

### 4. Run Development Servers
Start both backend (port 5000) and frontend (port 5173) concurrently:
```bash
npm run dev
```

You can also run them independently in separate terminal windows:
```bash
# Backend only (runs on http://localhost:5000)
npm run dev:backend

# Frontend only (runs on http://localhost:5173)
npm run dev:frontend
```

---

## 🧪 Testing and Quality Assurance

FitTrack Pro includes comprehensive automated test suites powered by **Vitest** and **Supertest** covering both backend API boundaries and frontend client logic:

### Backend Test Suites (`backend/test/`):
| Test Suite | Coverage |
|---|---|
| `health.test.js` | Database connectivity reporting (`connected`/`disconnected`), uptime, CORS origin validation |
| `auth.test.js` | User registration, login verification, duplicate email 409, logout cookie clearance, unauthenticated 401 rejections, database disconnected 503 handling |
| `validation.test.js` | Zod schema validation (short name, password complexity, invalid email), workout/goal fields, 24-character hexadecimal ObjectId parameter validation |
| `tenant-isolation.test.js` | Multi-tenant security (user B cannot view, edit, or delete user A's workouts or goals; returns 404) |

### Frontend Test Suites (`frontend/test/`):
| Test Suite | Coverage |
|---|---|
| `auth-and-routes.test.js` | Redux auth state transitions (login, logout, demo toggle), API error status parsing (HTTP 503 database-offline, 401 unauthorized, 400 validation), protected route redirection guards |
| `universal-nav-modals.test.js` | Universal search filtering across pages, workouts, exercises, search clearing, and modal workout logging events |

### Run Tests
```bash
# Run both backend and frontend test suites
npm test

# Run backend tests only
npm --prefix backend run test

# Run frontend tests only
npm --prefix frontend run test
```

### Linting & Production Build
```bash
# Lint backend syntax and frontend React/JS
npm run lint

# Build frontend production bundle
npm run build
```

---

## 📡 REST API Specification

All endpoints are hosted under `/api`. Protected routes require a valid session cookie or an `Authorization: Bearer <token>` header.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Live database status, service uptime, and demo mode indicator |
| `POST` | `/api/auth/register` | Public | Register new athlete account with password complexity validation |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue httpOnly cookie session |
| `POST` | `/api/auth/demo` | Public | Launch read-only guest overview session (when `DEMO_MODE=true`) |
| `GET` | `/api/auth/me` | Protected | Retrieve authenticated user profile |
| `POST` | `/api/auth/logout` | Public | Invalidate and clear session cookie |
| `GET` | `/api/dashboard` | Protected | Aggregated training stats, weekly activity matrix, and active goals |
| `GET` | `/api/workouts` | Protected | Paginated workout session history with category and date filters |
| `POST` | `/api/workouts` | Protected | Log a workout session (validated with Zod) |
| `GET` | `/api/workouts/:id` | Protected | Retrieve owned workout (validated ObjectId) |
| `PATCH` | `/api/workouts/:id` | Protected | Update owned workout (validated ObjectId & body) |
| `DELETE` | `/api/workouts/:id` | Protected | Delete owned workout |
| `GET` | `/api/goals` | Protected | List user goals filtered by status |
| `POST` | `/api/goals` | Protected | Create new fitness goal (validated targetValue > 0) |
| `PATCH` | `/api/goals/:id` | Protected | Update goal progress or status |
| `DELETE` | `/api/goals/:id` | Protected | Delete owned goal |
| `GET` | `/api/progress` | Protected | Retrieve body weight and measurement history |
| `POST` | `/api/progress` | Protected | Record body weight, body fat %, or tape measurements |
| `DELETE` | `/api/progress/:id` | Protected | Delete progress journal entry |
| `GET` | `/api/nutrition` | Protected | Fetch nutrition logs by date range |
| `PUT` | `/api/nutrition/:dateKey` | Protected | Upsert daily macro and water targets (`YYYY-MM-DD`) |

---

## 🚀 Manual Deployment Steps

### Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
1. Link your GitHub repository to **Vercel** or **Netlify**.
2. Set **Root Directory** to `frontend`.
3. Set **Build Command** to `npm run build`.
4. Set **Output Directory** to `dist`.
5. Set Environment Variable:
   - `VITE_API_URL=https://your-backend-api-url.onrender.com/api`

### Backend Deployment (Render / Railway / Fly.io)
1. Create a **Web Service** on **Render** or **Railway**.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm run start`.
5. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/Fittrack?retryWrites=true&w=majority`
   - `JWT_SECRET=<generate_a_random_string_at_least_32_characters>`
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - `COOKIE_SAME_SITE=none` (if frontend and backend are on separate top-level domains)
   - `DEMO_MODE=true`
