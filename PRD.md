# Product Requirements Document (PRD)

## 1. Product Overview
**Product Name:** CariMasjid  
**Description:** A lightweight, crowdsourced web application designed to help users easily find nearby mosques as a focused alternative to Google Maps. The app provides essential details about each mosque, including distance from the user, available facilities, photos, websites, and contact information.
**Core Value Proposition:** A fast, community-driven platform dedicated purely to finding and supporting mosques, without the clutter of general-purpose mapping applications.

## 2. Target Audience
*   **Travelers & Commuters:** Muslims who are on the go and need to find the nearest mosque quickly for daily prayers (Salah) or Friday prayers (Jumu'ah).
*   **Local Community:** Users who want to contribute by adding unmapped local mosques or updating existing facilities.
*   **Donors/Philanthropists:** Individuals looking to financially support mosque development or maintenance.

## 3. Core Features (MVP)

### 3.1. Location & Discovery
*   **Geolocation:** Automatically detects the user's current location (with permission) or allows manual location input.
*   **Nearby Search:** Displays a list or lightweight map of nearby mosques sorted by distance from the user.
*   **Distance Calculation:** Accurately calculates and displays the distance (in km/meters) between the user's current location and the mosque.

### 3.2. Mosque Details
*   **Information Display:** Name, address, and operating hours.
*   **Facilities:** Indicators for essential amenities (e.g., Wudhu area, separated prayer areas for men/women, parking availability, wheelchair accessibility, restrooms).
*   **Media:** Photo gallery of the mosque (exterior and interior).
*   **Links:** Official website or social media links.

### 3.3. Crowdsourcing (Community Contribution)
*   **Add a Mosque:** Users can fill out a form to submit a new mosque that isn't on the platform yet. Requires pinpointing the location on a map and uploading basic details.
*   **Update Information:** Users can suggest edits or update missing facilities and photos for existing mosques.
*   *(Optional)* **Moderation System:** A lightweight approval system or community voting to prevent spam and ensure data accuracy.

## 4. Nice-to-Have Features (Future Enhancements)
*   **Direct Donations (Sadaqah/Infaq):** Integration with payment gateways (e.g., Midtrans, Stripe) or direct bank transfer details to allow users to donate directly to the mosque's verified accounts.
*   **Prayer Times Integration:** Display current local prayer times and Iqamah schedules for specific mosques.
*   **Reviews & Ratings:** Allow users to leave tips or reviews about the mosque's condition (e.g., "Very clean wudhu area", "Crowded on Fridays").

## 5. User Flows

### Flow 1: Finding a Mosque
1. User opens the web app.
2. App requests location permission -> User grants it.
3. App displays a list of the closest mosques along with the distance.
4. User clicks on a specific mosque.
5. User views details (photos, facilities) and can click a button to get routing directions (links out to Google Maps/Apple Maps for navigation).

### Flow 2: Adding a Mosque (Crowdsourcing)
1. User clicks the "Add Mosque" button.
2. User drops a pin on the map for the exact location.
3. User fills out details: Name, Photos, Facilities checklist.
4. User submits the form.
5. Mosque becomes visible to other users (either immediately or post-moderation).

## 6. Technical Stack
*   **Framework:** TanStack Start (Fullstack React framework for SSR/API routes)
*   **Database:** PostgreSQL
*   **ORM:** Drizzle ORM *(Note: Current iteration has Prisma set up, plan migration if Drizzle is strictly preferred)*
*   **UI/Styling:** Tailwind CSS + shadcn/ui
*   **Authentication:** Better Auth (for managing users who add/edit mosque data)
*   **Deployment:** Cloudflare / Vercel (Edge/Serverless compatible)

## 7. Success Metrics
*   **User Engagement:** Number of daily active users finding mosques.
*   **Data Growth:** Number of user-submitted mosques and updates per month.
*   **Performance:** Fast initial load time (LCP < 2.5s) to ensure it works well on mobile data for travelers.
