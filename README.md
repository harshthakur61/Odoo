# TransitOps 🚚

A fleet operations platform for managing vehicles, drivers, trips, maintenance, and fuel/expense tracking from one place instead of spreadsheets. Built in an 8-hour hackathon.

## Tech Stack

**Frontend:** React 19 · Vite · Tailwind CSS · React Router v7 · Recharts · Axios
**Backend:** Node.js · Express · Prisma ORM · SQLite
**Auth:** JWT · bcrypt

## What's Implemented

- **Authentication** — Express backend issues JWTs on login (`bcrypt`-hashed passwords, `/api/auth/login`, `/api/auth/me`), verified on protected routes via middleware. The frontend also ships one-click demo logins (5 seeded roles) that work without the backend running, for fast demoing.
- **Live KPI dashboard** — `GET /api/dashboard/kpis` runs real Prisma aggregate queries for 7 metrics: active/available/in-maintenance vehicles, active/pending trips, drivers on duty, and fleet utilization %.
- **Role-aware navigation** — sidebar links are filtered client-side by role (Fleet Manager, Dispatcher, Driver, Safety Officer, Financial Analyst), with a separate portal view for Drivers.
- **Relational data model** — 7 Prisma models (`User`, `Vehicle`, `Driver`, `Trip`, `MaintenanceLog`, `FuelLog`, `Expense`) with proper foreign-key relations, designed around a full fleet-operations lifecycle (registration → dispatch → maintenance → reporting).
- **Full page set** — Vehicle Registry, Driver Management, Trip Management, Maintenance Logs, Fuel & Expenses, and Reports & Analytics are all built out in the UI (tables, filters, modals, status badges) and run on local component state; wiring them to persistent backend endpoints is the next step.

## Project Structure

```
backend/
├── prisma/schema.prisma      # data models
└── src/
    ├── index.js               # Express entry point
    ├── middleware/auth.js      # JWT verification, role guards
    └── routes/                 # auth, dashboard
frontend/
└── src/
    ├── App.jsx                 # routes
    ├── context/AuthContext.jsx
    ├── components/Layout/
    └── pages/                  # Login, Dashboard, Vehicles, Drivers, Trips,
                                 # Maintenance, Fuel, Reports, Driver Portal
stitch_transitops_operations_dashboard/   # UI design mockups (HTML/CSS per screen)
```

## Running Locally

```bash
# Backend
cd backend
npm install
npx prisma db push
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

Requires a `.env` in `backend/` with `DATABASE_URL="file:./dev.db"` and `JWT_SECRET`.
