# TransitOps — 12-Hour Hackathon Implementation Plan

> **Stack:** React + Vite (frontend) · Node.js + Express (backend) · PostgreSQL (DB) · JWT (auth)  
> **Team assumption:** 2–3 developers. Adjust phase ownership to fit your team size.

---

## Tech Stack Decision

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Fast setup, component reuse, Tailwind for rapid styling |
| Charts | Recharts | Zero-config, React-native, good enough for hackathon |
| Backend | Node.js + Express | Fastest REST API setup |
| Database | PostgreSQL + Prisma ORM | Relational constraints enforce business rules; Prisma migrations are quick |
| Auth | JWT + bcrypt | Stateless, easy RBAC middleware |
| Export | react-csv + jsPDF | CSV mandatory, PDF bonus |
| State | React Context + useReducer | No Redux overhead needed |

---

## Database Schema (Prisma)

```
User          { id, name, email, password, role }
Vehicle       { id, regNumber(unique), name, type, maxLoad, odometer, acquisitionCost, status, region }
Driver        { id, name, licenseNumber, licenseCategory, licenseExpiry, contact, safetyScore, status }
Trip          { id, source, destination, vehicleId, driverId, cargoWeight, plannedDistance, actualDistance, status, createdAt, completedAt }
MaintenanceLog{ id, vehicleId, type, description, cost, status(Active|Closed), startDate, endDate }
FuelLog       { id, vehicleId, tripId, liters, cost, date }
Expense       { id, vehicleId, tripId, type, amount, description, date }
```

**Status enums:**
- Vehicle: `AVAILABLE | ON_TRIP | IN_SHOP | RETIRED`
- Driver: `AVAILABLE | ON_TRIP | OFF_DUTY | SUSPENDED`
- Trip: `DRAFT | DISPATCHED | COMPLETED | CANCELLED`
- Maintenance: `ACTIVE | CLOSED`

---

## Phase Breakdown

### ⏱ Hours 0–1 | Project Setup & Scaffolding

**Goal:** Everyone can run the project locally. No feature work yet.

**Tasks:**
- [ ] Init Git repo, create `frontend/` and `backend/` folders
- [ ] `npm create vite@latest frontend -- --template react` + install Tailwind, Recharts, react-router-dom, axios
- [ ] `npm init` backend + install express, prisma, @prisma/client, bcrypt, jsonwebtoken, cors, dotenv
- [ ] Write `prisma/schema.prisma` with all 7 models and enums
- [ ] Run `prisma migrate dev --name init` — verify DB tables exist
- [ ] Seed script: 2 users per role (Fleet Manager, Driver, Safety Officer, Financial Analyst), 3 vehicles, 2 drivers
- [ ] Backend: `index.js` with CORS, JSON middleware, `/health` route
- [ ] Frontend: React Router setup — `/login`, `/dashboard`, `/vehicles`, `/drivers`, `/trips`, `/maintenance`, `/fuel`, `/reports`
- [ ] Auth middleware skeleton (`verifyToken`, `requireRole`)

**Deliverable:** `npm run dev` works on both sides, DB is live, routes exist (even if they return 404).

---

### ⏱ Hours 1–3 | Authentication + Dashboard

**Goal:** Login works, roles restrict pages, KPIs render with real data.

#### Backend
- [ ] `POST /api/auth/login` — verify email/password, return JWT with `{ id, name, role }`
- [ ] `GET /api/auth/me` — return current user from token
- [ ] `GET /api/dashboard/kpis` — query and return:
  - Active Vehicles (status = ON_TRIP)
  - Available Vehicles (status = AVAILABLE)
  - Vehicles In Maintenance (status = IN_SHOP)
  - Active Trips (status = DISPATCHED)
  - Pending Trips (status = DRAFT)
  - Drivers On Duty (status = ON_TRIP)
  - Fleet Utilization % = (ON_TRIP / total non-RETIRED) × 100

#### Frontend
- [ ] Login page: email + password form, store JWT in localStorage, redirect to dashboard
- [ ] `AuthContext`: stores user, provides `login()`, `logout()`, `hasRole()`
- [ ] Protected Route wrapper: redirects to `/login` if no token
- [ ] Dashboard page: 7 KPI cards + filter bar (vehicle type, status, region)
- [ ] Sidebar/nav with role-aware links

**Deliverable:** Login → Dashboard with live KPI numbers.

---

### ⏱ Hours 3–5 | Vehicle Registry + Driver Management

**Goal:** Full CRUD for vehicles and drivers, including all validation.

#### Backend — Vehicles (`/api/vehicles`)
- [ ] `GET /` — list all, support `?status=&type=&region=` query params
- [ ] `POST /` — create; enforce unique `regNumber`
- [ ] `PUT /:id` — update fields (not status directly from this endpoint)
- [ ] `DELETE /:id` — soft-delete or set RETIRED

#### Backend — Drivers (`/api/drivers`)
- [ ] `GET /` — list all, support `?status=` filter
- [ ] `POST /` — create driver
- [ ] `PUT /:id` — update profile, recalculate status if license expired
- [ ] License expiry check: add a cron/middleware that flags drivers whose `licenseExpiry < today` as needing attention (display warning; do NOT auto-suspend unless you have time)

#### Frontend
- [ ] **Vehicle Registry page:** table with columns (Reg#, Name, Type, Load, Odometer, Status, Actions). Add/Edit modal form. Status badge with color coding. Filter bar.
- [ ] **Driver Management page:** table with columns (Name, License#, Category, Expiry, Contact, Safety Score, Status). Add/Edit modal. Highlight expired licenses in red.
- [ ] Form validation: required fields, numeric ranges, date pickers
- [ ] Toast notifications for success/error

**Deliverable:** Add, edit, list vehicles and drivers. Filters work.

---

### ⏱ Hours 5–7 | Trip Management + Business Rule Engine

**Goal:** The core of the platform — trip lifecycle with all 9 mandatory business rules enforced.

#### Backend — Trips (`/api/trips`)
- [ ] `GET /` — list trips with joined vehicle + driver names
- [ ] `POST /` — create trip (status = DRAFT); validations:
  - Vehicle must be AVAILABLE
  - Driver must be AVAILABLE
  - Driver license must not be expired
  - Driver status must not be SUSPENDED
  - `cargoWeight ≤ vehicle.maxLoad`
- [ ] `PUT /:id/dispatch` — DRAFT → DISPATCHED; set Vehicle + Driver → ON_TRIP
- [ ] `PUT /:id/complete` — DISPATCHED → COMPLETED; accepts `{ finalOdometer, fuelConsumed }` body; updates vehicle odometer; creates FuelLog record; set Vehicle + Driver → AVAILABLE
- [ ] `PUT /:id/cancel` — DISPATCHED or DRAFT → CANCELLED; set Vehicle + Driver → AVAILABLE (if they were ON_TRIP for this trip)

#### Frontend
- [ ] **Trip Management page:** table with trip list, status badges, action buttons per row
- [ ] **Create Trip modal:** dropdowns for vehicle (only AVAILABLE) and driver (only AVAILABLE + valid license + not SUSPENDED); cargo weight input with live validation against selected vehicle's max load; source/destination/planned distance fields
- [ ] **Complete Trip modal:** final odometer + fuel consumed inputs
- [ ] Status action buttons: Dispatch / Complete / Cancel — conditionally shown by trip status
- [ ] Validation error messages inline

**Deliverable:** Full trip lifecycle working. All 9 business rules enforced.

---

### ⏱ Hours 7–8.5 | Maintenance + Fuel & Expense Logging

**Goal:** Maintenance workflow and expense tracking complete.

#### Backend — Maintenance (`/api/maintenance`)
- [ ] `POST /` — create record; set vehicle status → IN_SHOP
- [ ] `GET /` — list all logs with vehicle name
- [ ] `PUT /:id/close` — set record status → CLOSED; set vehicle status → AVAILABLE (unless RETIRED)

#### Backend — Fuel & Expenses (`/api/fuel`, `/api/expenses`)
- [ ] `POST /api/fuel` — create fuel log `{ vehicleId, tripId?, liters, cost, date }`
- [ ] `POST /api/expenses` — create expense `{ vehicleId, tripId?, type, amount, description, date }`
- [ ] `GET /api/vehicles/:id/costs` — return total fuel cost + total maintenance cost + total expense cost for a vehicle

#### Frontend
- [ ] **Maintenance page:** list of maintenance logs with status. "Add Maintenance" modal (vehicle selector — excludes RETIRED; type, description, cost). "Close" button per active record.
- [ ] **Fuel & Expenses page:** two tabs — Fuel Logs and Other Expenses. Add form for each. Vehicle and trip selectors.

**Deliverable:** Maintenance status transitions work. Fuel/expense records save correctly.

---

### ⏱ Hours 8.5–10 | Reports & Analytics

**Goal:** All four analytics metrics rendered as charts. CSV export works.

#### Backend — Reports (`/api/reports`)
- [ ] `GET /reports/fuel-efficiency` — per vehicle: `sum(plannedDistance) / sum(fuelLog.liters)` (or use actualDistance if available)
- [ ] `GET /reports/fleet-utilization` — trips per vehicle over time (or % of time ON_TRIP)
- [ ] `GET /reports/operational-cost` — per vehicle: `sum(fuelLog.cost) + sum(maintenance.cost) + sum(expense.amount)`
- [ ] `GET /reports/vehicle-roi` — per vehicle: `(sum(trip revenue if tracked) - (maintenance + fuel)) / acquisitionCost`. Since revenue isn't in schema, expose as `(0 - costs) / acquisitionCost` and let UI note "revenue not tracked".

> **Note:** If revenue tracking is out of scope, skip ROI or show cost-only version. Don't lose time on it.

#### Frontend
- [ ] **Reports page:** 4 sections, each with a Recharts bar or line chart
  - Fuel Efficiency: bar chart — vehicle vs km/L
  - Fleet Utilization: pie or bar chart — status breakdown
  - Operational Cost: stacked bar — fuel vs maintenance vs other
  - Vehicle ROI: bar chart (or table if time is short)
- [ ] **CSV Export:** `react-csv` button on each table — Vehicles, Drivers, Trips, Expenses

**Deliverable:** Charts render with real data. CSV export downloads correctly.

---

### ⏱ Hours 10–11 | Polish, Bug Fixes & Bonus Features

**Goal:** Everything works end-to-end. Pick 1–2 bonus features if time allows.

**Polish checklist:**
- [ ] Consistent loading spinners on all async operations
- [ ] Empty state messages on all tables
- [ ] Responsive layout (mobile sidebar collapses)
- [ ] Role-based sidebar: Financial Analyst doesn't see Dispatch; Safety Officer sees driver compliance view
- [ ] Error boundary for crashed components

**Bonus features (pick by time remaining):**

| Feature | Effort | Impact |
|---|---|---|
| Dark mode | 30 min | Medium |
| PDF export (jsPDF) | 45 min | High (mandatory-level requirement) |
| License expiry email reminder (nodemailer) | 60 min | High |
| Search + sort on all tables | 30 min | Medium |

---

### ⏱ Hours 11–12 | Testing & Demo Prep

**Goal:** Walk through the example workflow without errors. Record/prepare demo.

**End-to-end checklist (mirrors the spec's Example Workflow):**
- [ ] Register Van-05, max 500 kg, status = Available
- [ ] Register driver Alex with valid license
- [ ] Create trip, cargo = 450 kg → validates ≤ 500 kg, allows dispatch
- [ ] Dispatch → both become On Trip
- [ ] Complete trip with odometer + fuel → both become Available; fuel log created
- [ ] Create Oil Change maintenance record → Van-05 becomes In Shop; not visible in dispatch dropdown
- [ ] Check Reports: operational cost and fuel efficiency updated

**Demo script:** 5-minute walkthrough per role — show login, show their relevant pages, trigger one key business rule.

---

## File Structure

```
transitops/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.js          # verifyToken, requireRole
│   │   │   └── validate.js      # express-validator wrappers
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── dashboard.js
│   │   │   ├── vehicles.js
│   │   │   ├── drivers.js
│   │   │   ├── trips.js
│   │   │   ├── maintenance.js
│   │   │   ├── fuel.js
│   │   │   ├── expenses.js
│   │   │   └── reports.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # axios instances per resource
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── components/
    │   │   ├── Layout/      # Sidebar, Topbar, ProtectedRoute
    │   │   ├── ui/          # Modal, Badge, Table, Button, Toast
    │   │   └── charts/      # Wrappers around Recharts
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Vehicles.jsx
    │   │   ├── Drivers.jsx
    │   │   ├── Trips.jsx
    │   │   ├── Maintenance.jsx
    │   │   ├── FuelExpenses.jsx
    │   │   └── Reports.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## Business Rules Quick-Reference (Enforce at API layer, not just UI)

| Rule | Where enforced |
|---|---|
| Unique registration number | Prisma unique constraint + 409 response |
| RETIRED / IN_SHOP vehicles not in dispatch | Filter in `GET /vehicles?status=AVAILABLE` |
| Expired / SUSPENDED drivers not assignable | Check in `POST /trips` before insert |
| Vehicle/Driver already ON_TRIP | Check status in `POST /trips` |
| Cargo ≤ max load | Check in `POST /trips` |
| Dispatch → both ON_TRIP | Transaction in `PUT /trips/:id/dispatch` |
| Complete → both AVAILABLE | Transaction in `PUT /trips/:id/complete` |
| Cancel → restore AVAILABLE | Check if currently ON_TRIP before restoring |
| Maintenance → IN_SHOP | Transaction in `POST /maintenance` |
| Close maintenance → AVAILABLE | Check not RETIRED in `PUT /maintenance/:id/close` |

> Use **Prisma transactions** (`prisma.$transaction([...])`) for any operation that updates multiple tables at once.

---

## Risk & Mitigation

| Risk | Mitigation |
|---|---|
| DB schema changes mid-way | Finalize schema in Hour 0–1; resist changes after Hour 3 |
| Auth takes too long | Use a pre-built JWT boilerplate; hardcode roles if needed |
| Reports queries are slow | Add `@index` to `vehicleId` and `tripId` in Prisma schema early |
| Running out of time | Cut ROI chart, vehicle document management, email reminders — core flow > bonus |
| Merge conflicts | Divide ownership: one dev = backend routes, one dev = frontend pages, one dev = DB + auth |

---

## Hour-by-Hour Summary

| Time | Focus |
|---|---|
| 0–1h | Setup, schema, seed, routing skeleton |
| 1–3h | Auth + Dashboard KPIs |
| 3–5h | Vehicle + Driver CRUD |
| 5–7h | Trip lifecycle + all business rules |
| 7–8.5h | Maintenance + Fuel/Expense |
| 8.5–10h | Reports + charts + CSV export |
| 10–11h | Polish + 1–2 bonus features |
| 11–12h | E2E testing + demo prep |
