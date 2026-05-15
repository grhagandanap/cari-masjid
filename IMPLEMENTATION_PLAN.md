# CariMasjid Implementation Plan

This document breaks down the Product Requirements Document (PRD) into small, explicit, and actionable tasks. These tasks are designed to be easily executed by an AI model or a junior developer one step at a time.

## Phase 1: Drizzle ORM Migration (Prerequisites)
*Note: The project currently uses Prisma, but the PRD specifies Drizzle ORM. We must migrate the database layer first.*

- [x] **1.1 Install Drizzle Dependencies:**
  - Run: `pnpm add drizzle-orm postgres js-cookie`
  - Run: `pnpm add -D drizzle-kit tsx @types/pg`
- [x] **1.2 Configure Drizzle:**
  - Create `drizzle.config.ts` at the root.
  - Set dialect to `postgresql`, point schema to `src/db/schema.ts`, and set dbCredentials to `process.env.DATABASE_URL`.
- [x] **1.3 Create Drizzle Schema (`src/db/schema.ts`):**
  - Translate the Better Auth Prisma models (User, Session, Account, Verification) into Drizzle PostgreSQL tables.
- [x] **1.4 Update Database Connection (`src/lib/db.ts`):**
  - Initialize the `postgres` client and `drizzle` ORM instance using the `DATABASE_URL`.
- [x] **1.5 Update Better Auth (`src/lib/auth.ts`):**
  - Change the Better Auth adapter from `prismaAdapter` to `drizzleAdapter(db, schema)`.
- [x] **1.6 Clean up Prisma:**
  - Remove `prisma/schema.prisma`, `prisma.config.ts`, `src/lib/prisma.ts`.
  - Uninstall prisma packages (`pnpm remove prisma @prisma/client @prisma/adapter-pg`).

## Phase 2: Authentication & User Management (Better Auth)
*Setting up user authentication, which is required for crowdsourcing features.*

- [x] **2.1 Configure Better Auth (`src/lib/auth.ts`):**
  - Set up `better-auth` instance using the Drizzle adapter (`drizzleAdapter(db, schema)`).
  - Enable the `emailAndPassword` plugin.
- [x] **2.2 Create Auth Client (`src/lib/auth-client.ts`):**
  - Create and export the `createAuthClient` instance for frontend usage.
- [x] **2.3 Auth API Route (`src/routes/api/auth/$.ts`):**
  - Mount the Better Auth handler to TanStack Start API routes (`auth.handler`).
- [x] **2.4 Authentication UI Pages:**
  - Create `src/routes/auth/login.tsx` with a login form (email, password) and redirect-back support.
  - Create `src/routes/auth/register.tsx` with a registration form (name, email, password).
- [x] **2.5 Route Guards / Hooks (`src/lib/route-guard.ts` & `src/hooks/use-auth.ts`):**
  - Create a `useAuth` hook exporting session state and a `signOut` method.
  - Create a `requireAuth` function for TanStack router `beforeLoad` to protect routes.

## Phase 3: Database Schema Design (Mosque Domain)
*Create schemas for the core domain in `src/db/schema.ts`.*

- [x] **3.1 Create `mosques` Table:**
  - Fields: `id` (uuid, pk), `name` (text), `latitude` (real), `longitude` (real), `address` (text), `website` (text), `contact` (text), `createdAt` (timestamp), `createdById` (text, fk to user).
- [x] **3.2 Create `facilities` Table (or JSONb field on mosques):**
  - Let's use boolean columns directly on the `mosques` table for simplicity: `hasWuduArea` (boolean), `hasSeparateMenWomen` (boolean), `hasParking` (boolean), `isWheelchairAccessible` (boolean), `hasRestrooms` (boolean).
- [x] **3.3 Create `mosque_photos` Table:**
  - Fields: `id` (uuid, pk), `mosqueId` (uuid, fk), `url` (text), `uploadedById` (text, fk).
- [x] **3.4 Generate & Push Migrations:**
  - Run `npx drizzle-kit generate` and `npx drizzle-kit push` to update the local database.

## Phase 4: Core Utility Functions
*Standalone helper functions for the frontend.*

- [x] **4.1 Haversine Distance Utility (`src/utils/distance.ts`):**
  - Export a function `calculateDistance(lat1, lon1, lat2, lon2)` that returns the distance in kilometers.
- [x] **4.2 Geolocation Hook (`src/hooks/use-geolocation.ts`):**
  - Export a React hook `useGeolocation()` that calls `navigator.geolocation.getCurrentPosition`.
  - Return `{ location: { lat, lng }, error, isLoading }`.

## Phase 5: Backend API Functions (TanStack Start Server)
*These functions fetch data securely from the server.*

- [x] **5.1 Create `getNearbyMosques` server function (`src/lib/server/mosques.ts`):**
  - Use `createServerFn({ method: 'GET' })`.
  - Accept arguments `lat`, `lng`, `radius` (optional).
  - Query the `mosques` table and return the list.
- [x] **5.2 Create `getMosqueDetails` server function (`src/lib/server/mosques.ts`):**
  - Use `createServerFn({ method: 'GET' })`.
  - Accept argument `mosqueId`.
  - Query `mosques` left-joined with `mosque_photos`. Return the single mosque object.
- [x] **5.3 Create `createMosque` server function (`src/lib/server/mosques.ts`):**
  - Use `createServerFn({ method: 'POST' })`.
  - Use `getServerSession()` to ensure the user is logged in.
  - Insert new mosque data into the `mosques` table.

## Phase 6: UI - Discovery & Home Page
*Building the main user experience.*

- [x] **6.1 Build Landing Page Hero (`src/routes/index.tsx`):**
  - Create a welcoming hero section explaining the app's value proposition ("Find nearby mosques easily").
  - Conditionally render "Login" and "Register" CTA buttons (linking to `/auth/login` and `/auth/register`) for unauthenticated users.
- [x] **6.2 Create `MosqueCard` Component (`src/components/MosqueCard.tsx`):**
  - Use shadcn `Card`.
  - Props: `name`, `distance`, `facilities` (boolean map), `thumbnailUrl`.
  - Render icons (e.g., Lucide React) for available facilities.
- [x] **6.3 Implement Discovery Section (`src/routes/index.tsx`):**
  - Below the hero, call the `useGeolocation` hook.
  - If location is missing, show a button "Allow Location Access to Find Mosques".
  - If location exists, call the `getNearbyMosques` server function (via TanStack router loader or useQuery).
  - Sort the returned mosques by distance (using `calculateDistance` if not done in SQL).
  - Render a grid/list of `MosqueCard`s.

## Phase 7: UI - Mosque Details Page
*Detailed view for a specific mosque.*

- [ ] **7.1 Create Dynamic Route (`src/routes/mosque/$mosqueId.tsx`):**
  - Define `loader` to fetch `getMosqueDetails({ mosqueId })`.
- [ ] **7.2 Build Details UI (`src/routes/mosque/$mosqueId.tsx`):**
  - Display Mosque Name and Address prominently.
  - Show a list of facilities with checkmarks/crosses.
  - Display the photo gallery.
- [ ] **7.3 Add Navigation Action:**
  - Add a highly visible Button: "Get Directions".
  - The `href` should be `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`.

## Phase 8: UI - Crowdsourcing (Add Mosque)
*Allowing users to contribute data.*

- [ ] **8.1 Create Add Route (`src/routes/mosque/add.tsx`):**
  - Apply `beforeLoad` route guard using `requireAuth()` so only logged-in users can add mosques.
- [ ] **8.2 Build the Form:**
  - Create inputs for Name, Address, Website, Contact.
  - Create shadcn Checkboxes for the facilities (Wudu, Men/Women separated, etc.).
- [ ] **8.3 Map Pin Dropper:**
  - Install a basic map library (e.g., `react-leaflet` or `pigeon-maps`).
  - Render a map that updates a `lat`/`lng` state when the user clicks/drags the pin.
- [ ] **8.4 Handle Form Submission:**
  - Submit the data to the `createMosque` server function.
  - On success, show a `toast.success` and redirect to the home page or the newly created mosque's page.

## Phase 9: Nice to Have (Donations)
- [ ] **9.1 Add Donation Fields to Schema:**
  - Add `donationInfo` (text) or `bankAccountDetails` (text) to the `mosques` table.
- [ ] **9.2 Display Donation Info:**
  - In `src/routes/mosque/$mosqueId.tsx`, conditionally render a "Support this Mosque" card if donation info exists.
