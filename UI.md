# TransitOps UI Spec (Prompt for Stitch)

Build the complete frontend UI for **TransitOps** using **React + Vite + Tailwind CSS** and **react-router-dom**. Focus on UI/UX, page structure, components, routing, and state handling. Backend integration can be stubbed with an `api/` layer (axios) but the main output is the UI.

## Pages to Create (8)

Routes that must exist:

1. `/login` — Login
2. `/dashboard` — Dashboard (KPIs)
3. `/vehicles` — Vehicle Registry
4. `/drivers` — Driver Management
5. `/trips` — Trip Management
6. `/maintenance` — Maintenance Logs
7. `/fuel` — Fuel & Expenses (two tabs)
8. `/reports` — Reports & Analytics

## Global UI Requirements

### Layout

- Use a shared authenticated layout for all routes except `/login`.
- Layout includes:
  - Left sidebar navigation with app name/logo, role-aware links, and active link highlighting
  - Top bar with page title, quick filters where applicable, and user menu (name + role + logout)
  - Main content area with responsive padding and max width
- Mobile responsiveness:
  - Sidebar collapses into a hamburger drawer on small screens
  - Tables become horizontally scrollable; key info remains visible

### Roles & Navigation Rules

Roles:
- Fleet Manager
- Driver
- Safety Officer
- Financial Analyst

Role-aware navigation:
- Fleet Manager: sees all pages
- Driver: sees Dashboard, Trips (read-only), Vehicles (read-only), Maintenance (read-only)
- Safety Officer: sees Dashboard, Drivers (with compliance emphasis), Trips (read-only), Reports (read-only)
- Financial Analyst: sees Dashboard, Fuel & Expenses, Reports, Vehicles (read-only), Trips (read-only); must not see dispatch/complete/cancel controls

### Auth & Route Protection

- Store JWT in `localStorage`.
- Provide `AuthContext` with:
  - `user` (id, name, role)
  - `login(email, password)` and `logout()`
  - `hasRole(roles: string[])`
- ProtectedRoute behavior:
  - If no token, redirect to `/login`
  - If role lacks access to a page, render an “Access denied” state with a link back to `/dashboard`

### Design System (Tailwind)

- Clean “operations dashboard” aesthetic.
- Reusable components:
  - `Button` (primary/secondary/danger/ghost)
  - `Input`, `Select`, `Textarea`, `DatePicker` (native date input acceptable)
  - `Modal` (focus trap optional, but must close on overlay click + Esc)
  - `Badge` for statuses with consistent colors
  - `Table` with sortable headers (optional) and sticky header (nice-to-have)
  - `Tabs` for Fuel & Expenses page
  - `Toast` notifications for success/error
  - `Spinner` and skeleton rows for loading
  - `EmptyState` component for empty lists

Status badge colors:
- Vehicle: AVAILABLE (green), ON_TRIP (blue), IN_SHOP (amber), RETIRED (gray)
- Driver: AVAILABLE (green), ON_TRIP (blue), OFF_DUTY (gray), SUSPENDED (red), EXPIRED_LICENSE (red)
- Trip: DRAFT (gray), DISPATCHED (blue), COMPLETED (green), CANCELLED (red)
- Maintenance: ACTIVE (amber), CLOSED (green)

### Validation & UX Rules

- All forms show inline validation messages and disable submit while invalid.
- Numeric fields enforce ranges (e.g., cost >= 0, liters > 0, cargoWeight > 0).
- Dates use a date picker; driver license expiry should be clearly shown.
- Highlight expired driver licenses in red (row background + badge).
- All async actions show loading state and toast on completion/failure.

## Shared Data Shapes (UI-side)

Use these shapes for UI state and mock API typing.

- User: `{ id, name, email, role }`
- Vehicle: `{ id, regNumber, name, type, maxLoad, odometer, acquisitionCost, status, region }`
- Driver: `{ id, name, licenseNumber, licenseCategory, licenseExpiry, contact, safetyScore, status }`
- Trip: `{ id, source, destination, vehicleId, driverId, cargoWeight, plannedDistance, actualDistance?, status, createdAt, completedAt?, vehicleName?, driverName? }`
- MaintenanceLog: `{ id, vehicleId, type, description, cost, status, startDate, endDate?, vehicleName? }`
- FuelLog: `{ id, vehicleId, tripId?, liters, cost, date }`
- Expense: `{ id, vehicleId, tripId?, type, amount, description, date }`

## Page-by-Page UI

### 1) Login (`/login`)

**Goal:** authenticate and redirect to dashboard.

- Centered card layout with app title + tagline.
- Form fields:
  - Email
  - Password
- CTA:
  - “Sign in” button
- Behavior:
  - On success: store token, load `/api/auth/me`, redirect to `/dashboard`
  - On error: show toast “Invalid credentials”

### 2) Dashboard (`/dashboard`)

**Goal:** show high-level KPIs with filtering.

- Header: “Dashboard”
- Filter bar:
  - Vehicle Type (select)
  - Status (select)
  - Region (select)
- KPI cards (7):
  - Active Vehicles (ON_TRIP)
  - Available Vehicles (AVAILABLE)
  - Vehicles In Maintenance (IN_SHOP)
  - Active Trips (DISPATCHED)
  - Pending Trips (DRAFT)
  - Drivers On Duty (ON_TRIP)
  - Fleet Utilization % (computed)
- Each KPI card:
  - Value, label, small helper text
  - Loading skeleton while fetching

### 3) Vehicle Registry (`/vehicles`)

**Goal:** manage vehicles; full CRUD for Fleet Manager, read-only for others.

- Header: “Vehicles”
- Toolbar:
  - Filter bar: Status, Type, Region
  - Primary button: “Add Vehicle” (Fleet Manager only)
- Table columns:
  - Reg#
  - Name
  - Type
  - Max Load
  - Odometer
  - Status (badge)
  - Actions (Fleet Manager only)
- Row actions (Fleet Manager):
  - Edit
  - Retire (soft delete) / Delete
- Add/Edit modal:
  - Reg Number (required, unique)
  - Name (required)
  - Type (required)
  - Max Load (required, numeric)
  - Odometer (required, numeric)
  - Acquisition Cost (numeric)
  - Region (select/text)
  - Status should be view-only or set only during creation if needed; avoid direct status edits in edit flow

### 4) Driver Management (`/drivers`)

**Goal:** manage drivers; full CRUD for Fleet Manager and Safety Officer; read-only for others.

- Header: “Drivers”
- Toolbar:
  - Filter: Status
  - Primary button: “Add Driver” (Fleet Manager + Safety Officer)
- Table columns:
  - Name
  - License#
  - Category
  - Expiry (show formatted date + days remaining)
  - Contact
  - Safety Score
  - Status (badge)
  - Actions (Fleet Manager + Safety Officer)
- Expired license highlighting:
  - If `licenseExpiry < today`, render badge “Expired” and highlight row
- Add/Edit modal:
  - Name (required)
  - License Number (required)
  - License Category (required)
  - License Expiry (required date)
  - Contact (phone/email text)
  - Safety Score (0–100)
  - Status (select; but do not allow setting SUSPENDED casually unless needed)

### 5) Trip Management (`/trips`)

**Goal:** manage trip lifecycle (draft → dispatched → completed/cancelled) with rule-friendly UI.

- Header: “Trips”
- Toolbar:
  - Primary button: “Create Trip” (Fleet Manager only)
- Trips table columns:
  - Trip ID (short id)
  - Source
  - Destination
  - Vehicle
  - Driver
  - Cargo Weight
  - Planned Distance
  - Status (badge)
  - Actions (Fleet Manager only)
- Create Trip modal (Fleet Manager only):
  - Vehicle dropdown: show only AVAILABLE vehicles
  - Driver dropdown: show only AVAILABLE drivers; visually mark invalid drivers (expired license / suspended) and exclude them
  - Cargo Weight input with live validation:
    - show selected vehicle max load and error if `cargoWeight > maxLoad`
  - Source, Destination, Planned Distance
- Row action buttons (Fleet Manager only, conditional by status):
  - If DRAFT: Dispatch
  - If DISPATCHED: Complete, Cancel
  - If DRAFT: Cancel (optional)
- Complete Trip modal:
  - Final Odometer (required numeric)
  - Fuel Consumed (required numeric; liters)
- Read-only roles:
  - Must not see Create/Dispatch/Complete/Cancel controls

### 6) Maintenance (`/maintenance`)

**Goal:** create and close maintenance logs; maintain vehicle availability states.

- Header: “Maintenance”
- Toolbar:
  - Primary button: “Add Maintenance” (Fleet Manager only)
- Table columns:
  - Vehicle
  - Type
  - Description (truncated)
  - Cost
  - Status (badge)
  - Start Date
  - End Date
  - Actions (Fleet Manager only)
- Add Maintenance modal (Fleet Manager only):
  - Vehicle selector (exclude RETIRED)
  - Type (select)
  - Description (textarea)
  - Cost (numeric)
  - Start Date (default today)
- Row action (Fleet Manager only):
  - Close (only when status ACTIVE)

### 7) Fuel & Expenses (`/fuel`)

**Goal:** add fuel logs and other expenses; provide quick entry UI.

- Header: “Fuel & Expenses”
- Two tabs:
  - Fuel Logs
  - Other Expenses

Fuel Logs tab:
- Toolbar: “Add Fuel Log”
- Table columns:
  - Date
  - Vehicle
  - Trip (optional)
  - Liters
  - Cost
- Add Fuel Log modal:
  - Vehicle (required)
  - Trip (optional select; filter by vehicle when possible)
  - Date
  - Liters
  - Cost

Other Expenses tab:
- Toolbar: “Add Expense”
- Table columns:
  - Date
  - Vehicle
  - Trip (optional)
  - Type
  - Amount
  - Description
- Add Expense modal:
  - Vehicle (required)
  - Trip (optional)
  - Type (select + allow custom)
  - Amount
  - Description
  - Date

Access:
- Financial Analyst has full access.
- Fleet Manager has full access.
- Other roles read-only.

### 8) Reports (`/reports`)

**Goal:** visualize analytics using charts; enable CSV exports.

- Header: “Reports”
- 4 report sections (cards or stacked panels):
  1. Fuel Efficiency (bar chart): vehicle vs km/L
  2. Fleet Utilization (pie or bar): status distribution
  3. Operational Cost (stacked bar): fuel vs maintenance vs other expenses per vehicle
  4. Vehicle ROI (bar chart or table): show disclaimer “revenue not tracked”
- Each section includes:
  - Title + short description
  - Chart container with loading/empty states
  - Optional filter: date range (nice-to-have)

CSV export buttons:
- Provide CSV export buttons for: Vehicles, Drivers, Trips, Expenses.
- Place exports near relevant pages too (optional), but must exist somewhere accessible.

## Suggested Frontend File Structure

Match this structure:

```
frontend/src/
  api/
  components/
    Layout/
    ui/
    charts/
  context/
  pages/
  App.jsx
  main.jsx
```

## API Calls (for wiring later; can be mocked)

- Auth:
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Dashboard:
  - `GET /api/dashboard/kpis`
- Vehicles:
  - `GET /api/vehicles?status=&type=&region=`
  - `POST /api/vehicles`
  - `PUT /api/vehicles/:id`
  - `DELETE /api/vehicles/:id`
- Drivers:
  - `GET /api/drivers?status=`
  - `POST /api/drivers`
  - `PUT /api/drivers/:id`
- Trips:
  - `GET /api/trips`
  - `POST /api/trips`
  - `PUT /api/trips/:id/dispatch`
  - `PUT /api/trips/:id/complete`
  - `PUT /api/trips/:id/cancel`
- Maintenance:
  - `GET /api/maintenance`
  - `POST /api/maintenance`
  - `PUT /api/maintenance/:id/close`
- Fuel & Expenses:
  - `POST /api/fuel`
  - `POST /api/expenses`
  - `GET /api/vehicles/:id/costs`
- Reports:
  - `GET /api/reports/fuel-efficiency`
  - `GET /api/reports/fleet-utilization`
  - `GET /api/reports/operational-cost`
  - `GET /api/reports/vehicle-roi`

