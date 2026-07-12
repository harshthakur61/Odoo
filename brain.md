# TransitOps - Step-by-Step Execution Plan (brain.md)

This document outlines the step-by-step execution plan for the TransitOps hackathon project, taking into account the defined tech stack (React + Vite, Node.js + Express, PostgreSQL) and the intention to deploy the database on **Neon**.

## Tech Stack Overview
- **Frontend:** React + Vite, Tailwind CSS (Styling), Recharts (Charts), React Router (Navigation).
- **Backend:** Node.js + Express.
- **Database:** PostgreSQL hosted on **Neon** (Serverless Postgres), managed via Prisma ORM.
- **Auth:** JWT + bcrypt.
- **Deployment Strategy:** Vercel (Frontend & Backend) + Neon (Database).

---

## Step-by-Step Execution Plan

### Step 1: Project Scaffolding & Local Database Setup (Hours 0-1) - (Completed)
**Goal:** Initialize the monorepo structure, set up a local SQLite database, and ensure both frontend and backend run locally.
1. **Repository Setup:** Create a new folder `TransitOps` and initialize git.
2. **Backend Init:**
   - Create `backend/` directory, run `npm init -y`.
   - Install dependencies: `express prisma @prisma/client bcrypt jsonwebtoken cors dotenv`.
   - Initialize Prisma for local development: set provider to `sqlite` in `schema.prisma`.
   - Create `.env` and add: `DATABASE_URL="file:./dev.db"`
   - Create `prisma/schema.prisma` and define the 7 core models (User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense).
   - Run `npx prisma db push` to generate the local SQLite database.
   - Create a seed script (`seed.js`) to insert test data.
   - Create `index.js` with basic CORS and a `/health` route.
4. **Frontend Init:**
   - Create `frontend/` directory using `npm create vite@latest frontend -- --template react`.
   - Install dependencies: `tailwindcss react-router-dom axios recharts lucide-react` (for icons).
   - Initialize Tailwind (`npx tailwindcss init -p`).
   - Setup basic React Router skeleton for all 8 main pages.

### Step 2: Authentication & Context (Hours 1-2.5) - (Completed)
**Goal:** Secure the application and implement role-based access control (RBAC).
1. **Backend Auth:** 
   - Implement `POST /api/auth/login` (verify credentials, return JWT).
   - Implement `GET /api/auth/me`.
   - Create auth middleware (`verifyToken`, `requireRole`).
2. **Frontend Auth:**
   - Build `Login.jsx` UI (Tailwind).
   - Create `AuthContext.jsx` to store JWT in `localStorage` and manage user state.
   - Build a `ProtectedRoute` component to wrap authenticated routes in `App.jsx`.

### Step 3: Application Shell & Dashboard UI (Hours 2.5-4) - (Completed)
**Goal:** Build the global layout (Sidebar, Header) and connect the Dashboard.
1. **Layout Components:**
   - Build a responsive Sidebar with role-based link visibility.
   - Build a Topbar with the user's name and a logout button.
2. **Dashboard Backend:**
   - Create `GET /api/dashboard/kpis` to aggregate counts (Active Vehicles, Pending Trips, etc.) from Neon using Prisma.
3. **Dashboard Frontend:**
   - Build 7 KPI cards using Tailwind grid.
   - Fetch data via Axios and render loading skeletons.

### Step 4: Core Registry (Vehicles & Drivers) (Hours 4-6)
**Goal:** Full CRUD operations for Fleet Managers and Safety Officers.
1. **Vehicles Backend & Frontend:**
   - API: `GET`, `POST`, `PUT`, `DELETE` for `/api/vehicles`.
   - UI: Table with columns, status badges (AVAILABLE, IN_SHOP, etc.), and an Add/Edit Modal form.
2. **Drivers Backend & Frontend:**
   - API: `GET`, `POST`, `PUT` for `/api/drivers`.
   - UI: Driver table. Include logic to highlight rows if `licenseExpiry < today`.

### Step 5: Trip Engine & Business Rules (Hours 6-8.5)
**Goal:** The core operational loop of the platform.
1. **Trips API (Backend):**
   - `POST /api/trips`: Enforce rules (Driver/Vehicle must be AVAILABLE, Cargo <= maxLoad).
   - `PUT /api/trips/:id/dispatch`: Use Prisma transactions to update Trip to DISPATCHED, and Vehicle/Driver to ON_TRIP.
   - `PUT /api/trips/:id/complete`: Update statuses back to AVAILABLE, record final odometer, and log fuel.
2. **Trips UI (Frontend):**
   - Table to list trips.
   - Modal for "Create Trip" with conditional dropdowns (only fetching AVAILABLE vehicles/drivers).
   - Action buttons (Dispatch, Complete, Cancel) based on row status.

### Step 6: Maintenance & Expenses (Hours 8.5-10)
**Goal:** Track fleet health and financial metrics.
1. **Maintenance API & UI:**
   - API to create maintenance logs (sets vehicle to IN_SHOP) and close them (sets to AVAILABLE).
   - UI to manage active/closed tickets.
2. **Fuel & Expenses API & UI:**
   - Simple POST routes to log fuel and other expenses.
   - UI with two Tabs (Fuel Logs, Other Expenses) for quick data entry.

### Step 7: Reports, Charts & CSV Export (Hours 10-11)
**Goal:** Data visualization.
1. **Reports Backend:**
   - Queries to group operational costs and calculate fuel efficiency.
2. **Reports Frontend:**
   - Use `Recharts` to draw Bar and Pie charts (Fuel Efficiency, Utilization).
   - Add a "Download CSV" button using `react-csv` or native Blob creation for tables.

### Step 8: Deployment, Neon Migration, & Final Testing (Hours 11-12)
**Goal:** Launch the app live and switch the database to Neon.
1. **Neon Database Migration:**
   - Go to the Neon console and create a new PostgreSQL project.
   - Copy the connection string.
   - Change `schema.prisma` provider to `postgresql`.
   - Update `.env`: `DATABASE_URL="<your_neon_connection_string>?pgbouncer=true"`.
   - Run `npx prisma db push` to sync the schema to the live Neon database.
2. **Backend Deployment:** Deploy Express to Vercel (using `vercel.json`) or Render. Set environment variables.
3. **Frontend Deployment:** Deploy Vite app to Vercel. Connect API endpoints to the live backend URL.
4. **End-to-End Test:** Run through the "Golden Path" (create vehicle -> add driver -> create trip -> dispatch -> complete -> add maintenance).

---
## Roles Recap for Implementation
- **Fleet Manager:** Has full access to everything.
- **Driver:** Read-only access to Trips and Vehicles.
- **Safety Officer:** Manages Drivers (focus on compliance/expiry).
- **Financial Analyst:** Manages Fuel, Expenses, and views Reports.
