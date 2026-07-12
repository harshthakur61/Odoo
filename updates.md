# Updates To Implement

## 1) Driver Documents: Upload + Fleet Manager Verification

### Goals
- Driver can upload required documents from Driver Profile.
- Fleet Manager can review/verify/reject each document (License, Insurance, and any future types).
- Trips should not be assignable to drivers missing required verified documents (configurable enforcement).

### Data Model Changes (Prisma)
- Add `DriverDocument` model
  - Fields: `id`, `driverId`, `type`, `fileUrl`, `status`, `uploadedAt`, `verifiedAt`, `verifiedByUserId`, `rejectionReason`, `expiresAt?`
  - Enums:
    - `DriverDocumentType`: `LICENSE | INSURANCE | OTHER`
    - `DriverDocumentStatus`: `PENDING | VERIFIED | REJECTED | EXPIRED`
- (Optional) Add `requiredDocumentTypes` config in code, not DB, for quick iteration.

### Backend Changes
- File upload support
  - Store files in a safe location (local disk for dev) and persist `fileUrl` to DB.
  - Validate file types and size limits.
- New/updated endpoints:
  - Driver:
    - `GET /api/drivers/me/documents`
    - `POST /api/drivers/me/documents` (multipart upload + metadata)
    - `DELETE /api/drivers/me/documents/:id` (optional)
  - Fleet Manager:
    - `GET /api/drivers/:id/documents`
    - `PUT /api/documents/:id/verify` (status → VERIFIED)
    - `PUT /api/documents/:id/reject` (status → REJECTED + reason)
- Authorization rules:
  - Driver can only manage their own documents.
  - Fleet Manager can verify/reject any driver documents.

### Frontend Changes
- Driver Profile page
  - Add “Documents” section with upload UI per required doc type.
  - Show status badges (Pending/Verified/Rejected/Expired) + rejection reason if present.
- Fleet Manager
  - Driver Management page: add a “Compliance” / “Documents” action to open a review modal.
  - Verification UI: preview/download doc + Verify/Reject.

### Business Rules
- On trip assignment:
  - Block assignment if required docs are not VERIFIED (if enforcement enabled).
- Expiry:
  - If `expiresAt < now`, mark document EXPIRED and treat as not verified.

---

## 2) Email Notifications: Gmail (Google) NodeMailer on Trip Assignment

### Goals
- When a trip is assigned/dispatched to a driver, send an email notification to the driver.
- Email should include trip details (source, destination, date/time, vehicle, and a link to the app if available).

### Backend Changes
- Add Nodemailer setup using Gmail (Google) credentials
  - Prefer App Passwords (recommended) or OAuth2 if needed later.
  - Store secrets in environment variables only (no secrets committed).
- When to send email:
  - `POST /api/trips` (if driver is assigned at creation), and/or
  - `PUT /api/trips/:id/dispatch` (recommended as the canonical “assignment” moment)
- Email content:
  - Subject: `New Trip Assigned: {source} → {destination}`
  - Body: includes `tripId`, source/destination, assigned vehicle, planned distance, dispatch time, and status.
- Reliability:
  - Log send failures server-side and return success for the main API action (do not fail dispatch purely due to email).
  - (Optional) Persist an `EmailNotificationLog` table for audit and retries.

### Frontend Changes
- No required UI change, but optionally show a toast “Email notification sent” when backend confirms.

---

## 3) Date & Time: Auditability Across Trips and Driver Updates

### Goals
- Every important state change should be recorded with date + time.
- UI should display timestamps consistently in local timezone.

### Data Model Changes (Prisma)
- Ensure key models have timestamps:
  - `Trip`: `createdAt`, `updatedAt`, `dispatchedAt`, `completedAt`, `cancelledAt`
  - `FuelLog`: `createdAt` (keep `date` if needed, but normalize to `createdAt`)
  - `MaintenanceLog`: `createdAt`, `updatedAt`, `closedAt`
  - `DriverDocument`: `uploadedAt`, `verifiedAt`
- Add `TripEvent` (recommended for full audit trail)
  - Fields: `id`, `tripId`, `type`, `message`, `createdAt`, `createdByUserId`
  - Types: `CREATED | DISPATCHED | DRIVER_UPDATE | COMPLETED | CANCELLED | NOTE`

### Backend Changes
- Set timestamps server-side (do not trust client clocks).
- Add event logging on:
  - Trip creation
  - Dispatch
  - Completion
  - Cancellation
  - Driver “update” actions (status updates, location notes, delays, etc.)
- Add endpoints:
  - `GET /api/trips/:id/events`
  - `POST /api/trips/:id/events` (driver update / note; role-based)

### Frontend Changes
- Trips list/details:
  - Show Created/Dispatched/Completed timestamps.
  - Add “Timeline” section for trip events.
- Driver updates:
  - Add a simple form to post updates (note + optional status).
- Formatting:
  - Display using a consistent format (e.g., `DD MMM YYYY, HH:mm`).

---

## Suggested Implementation Order
1. Add timestamps + `TripEvent` first (unblocks audit trail for everything else).
2. Implement driver document upload + verification (DB + API + UI).
3. Add Nodemailer integration on dispatch/assignment.

