# Steel Door Management System 🚪🛡️

A production-grade, frontend-only Server-Side Rendered (SSR) web application engineered for steel door manufacturing and fitting companies. Built with **Angular 21 (Standalone Components, Signals, New Control Flow `@if`/`@for`, TransferState)**, **Tailwind CSS**, and **Angular CDK**, powered by a high-performance Express SSR server with a single-file JSON data layer.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20+ or v24+
- **npm**: v10+

### 2. Installation
```bash
npm install
```

### 3. Development Server
Starts the Angular SSR development server:
```bash
npm run dev
# or: npm start
```
Open [http://localhost:4200](http://localhost:4200) in your browser.

### 4. Production Build & SSR Server
Builds the universal client & server bundles and runs the Express SSR server:
```bash
npm run build
npm run serve:ssr
```
Open [http://localhost:4000](http://localhost:4000) in your browser.

---

## 🔑 Demo Seed Credentials

The system comes pre-seeded with realistic test accounts across all roles. Quick-fill buttons are also available on the **[Login Page](/login)**.

| Role | Username | Password | Full Name & Context |
| :--- | :--- | :--- | :--- |
| **Coordinator (Super Admin)** | `coordinator` | `admin123` | Elena Vance (Super Admin Dashboard) |
| **Branch Head (Ernakulam)** | `branch_ekm` | `branch123` | Rajesh Menon (District: Ernakulam) |
| **Branch Head (Trivandrum)** | `branch_tvm` | `branch123` | Suresh Kumar (District: Trivandrum) |
| **Branch Head (Kozhikode)** | `branch_clt` | `branch123` | Anil Varma (District: Kozhikode) |
| **Branch Head (Thrissur)** | `branch_tsr` | `branch123` | Prakash Nair (District: Thrissur) |
| **Branch Head (Kannur)** | `branch_knr` | `branch123` | Deepak Pillai (District: Kannur) |
| **Client (Customer)** | `john_customer` | `cust123` | John Mathew (Individual Homeowner) |
| **Client (Dealer)** | `apex_dealer` | `dealer123` | Apex Hardware Supplies (B2B Dealer) |
| **Client (Company)** | `crest_infra` | `comp123` | Crestview Infrastructure Ltd (Corporate) |

---

## 🏛️ Project Architecture & Rules

### 1. Single Data File Rule (`/data/db.json`)
- **Single Source of Truth for Data**: All state (districts, branch heads, clients, bookings, audit logs, services, testimonials, and site content) lives in `/data/db.json`.
- **Server Data Layer (`/server/db.ts`)**: Pure TypeScript module that reads and writes `/data/db.json` via synchronous atomic filesystem operations.
- **REST Endpoints (`/server/api.ts`)**: Thin Express routes mounted at `/api/*` inside `src/server.ts`.
- **Client Data Service (`src/app/core/data.service.ts`)**: The **ONLY** service in the entire frontend that communicates with the API. No component imports JSON or calls `HttpClient` directly.
- **Server-Side Hydration**: During SSR, `DataService` uses the request origin dynamically, preloads data through route resolvers (`src/app/core/resolvers/data.resolvers.ts`), and serializes it via Angular `TransferState`. On client hydration, Angular retrieves the cached data without double-fetching.

### 2. Single Color Source Rule (`src/theme/colors.ts`)
- **Single Source of Truth for Design Tokens**: Every color token in the application is strictly defined in `src/theme/colors.ts`.
- **Zero Hardcoded Colors**: No hex codes (e.g., `#14532d`) or default Tailwind color names (e.g., `green-500`, `blue-600`) exist in any component templates, SCSS files, or inline styles.
- **Cascading Theme Propagation**:
  - `src/theme/colors.ts` feeds `tailwind.config.ts` (e.g., `bg-primary`, `text-muted`, `border-border`, `bg-status-pending/10`).
  - `src/theme/colors.ts` defines CSS variables in `src/styles.scss` (e.g., `--color-primary`, `--color-surface`).
  - **Changing any color in `src/theme/colors.ts` instantly updates the entire public site, admin dashboard, branch head mobile views, charts, chips, and modals.**

### 3. Business Rules Implemented
- **Strict 1:1 District to Branch Head Mapping**: A branch head is mapped to exactly one district; assigning a district with an existing active head is rejected.
- **Automatic Routing**: Submitting a booking instantly resolves the selected district and auto-assigns it to the district's branch head in `Pending` status.
- **Lifecycle Statuses**: `Pending` → `Accepted` → `Scheduled` (with date/time) → `Finished` (or `Rejected` with reason).
- **Computed Delay Flag**: Any booking in `Pending` status for > 24 hours (or unassigned) is flagged `isDelayed = true` with elapsed time indicators.
- **Full Audit Trail**: Every action (create, status transition, rejection, and reassignment) appends an immutable entry to the booking history.

---

## 🎨 How to Customize the Theme

Open [`src/theme/colors.ts`](file:///C:/ufs/steel%20door/src/theme/colors.ts):

```typescript
export const themeColors = {
  // Primary Forest Green Palette
  primary: '#14532d',         // Main brand color
  'primary-dark': '#0d381e',    // Deep headers / active states
  'primary-light': '#1b6e3b',   // Card accents / subtle borders
  'primary-hover': '#166534',   // Button hover states
  accent: '#10b981',            // Fresh emerald accents & highlights
  accent-dark: '#047857',
  accent-light: '#34d399',

  // Surfaces & Backgrounds
  background: '#f8faf7',        // Warm off-white
  surface: '#ffffff',           // Card surface
  'surface-hover': '#f1f5f0',
  'surface-muted': '#f0f4f1',

  // Semantic Feedback & Statuses
  'status-pending': '#d97706',
  'status-accepted': '#0284c7',
  'status-scheduled': '#7c3aed',
  'status-finished': '#16a34a',
  'status-rejected': '#dc2626',
  'status-delayed': '#ea580c',
} as const;
```

Modify any hex value and re-run `npm run build` — every button, status badge, chart, navigation bar, and input border in the application will reflect the change automatically.

---

## 🔌 Swapping the Data Layer for a Real API

The application has been architected specifically so that a real backend (NestJS, Django, Spring Boot, etc.) or external database can replace the file-based data layer **without altering a single Angular UI component**:

1. **Option A: Replace the Express Server Endpoints**
   - In `src/server.ts`, point `/api/*` proxy or replace `server/api.ts` with HTTP forwarding to your remote microservice.
2. **Option B: Update `src/app/core/data.service.ts`**
   - In `src/app/core/data.service.ts`, modify `baseUrl`:
   ```typescript
   private getBaseUrl(): string {
     return environment.apiUrl; // e.g. https://api.steeldoorsystem.com
   }
   ```
   All method signatures (`getBookings`, `createBooking`, `updateBookingStatus`, `reassignBooking`, `getDistricts`, etc.) and typed interfaces (`Booking`, `District`, `Client`) remain 100% identical.

---

## 📁 Directory Structure

```
├── /data
│   └── db.json                         # Single file database (districts, branch heads, clients, bookings, logs)
├── /server
│   ├── db.ts                           # Server data layer (file I/O, business rules, constraints)
│   └── api.ts                          # Express REST endpoints (/api/*)
├── /src
│   ├── index.html                      # HTML template with Google Fonts (Plus Jakarta Sans)
│   ├── main.ts                         # Client bootstrap with provideClientHydration(withEventReplay())
│   ├── main.server.ts                  # Angular SSR bootstrap
│   ├── server.ts                       # Express SSR server with /api routes mounted
│   ├── styles.scss                     # Tailwind directives + CSS variables mapped to colors.ts
│   ├── /theme
│   │   └── colors.ts                   # SINGLE SOURCE OF TRUTH for all color tokens
│   └── /app
│       ├── /core
│       │   ├── data.service.ts         # Single gateway service for all API calls
│       │   ├── auth.service.ts         # Cookie session auth with signals & role guards
│       │   ├── /guards                 # SSR-safe functional CanActivate guards (authGuard, roleGuard)
│       │   ├── /resolvers              # SSR route resolvers (districts, services, bookings)
│       │   └── /models                 # TypeScript data contracts & interfaces
│       ├── /shared
│       │   ├── /components             # Status chips, SSR-safe SVG charts, audit timeline, bottom sheets, modals
│       │   ├── /toast                  # Toast notification service & interactive UI
│       │   └── /validators             # Typed reactive form custom validators
│       ├── /layouts
│       │   ├── public-layout           # Sticky navbar, logo, CTA button, footer
│       │   ├── admin-layout            # Responsive sidebar + topbar for Coordinator
│       │   ├── branch-layout           # Mobile-first viewport (~390px) with bottom tab bar
│       │   └── client-layout           # Client portal layout with navigation
│       └── /features
│           ├── /public                 # Home, About, Services, Book Now (4-step wizard), Login, Register
│           ├── /admin                  # Dashboard, Bookings list, Booking detail + Reassign modal, Branch Heads, Clients, Areas, History
│           ├── /branch                 # Mobile dashboard, District booking list, 1-tap call/WhatsApp detail, bottom sheet status update
│           └── /client                 # Client dashboard, My bookings tracker, Profile
└── tailwind.config.ts                  # Tailwind configuration powered by src/theme/colors.ts
```

---

## 🧪 Verification & SSR Test Results

- **Server-Side Pre-Rendering**: Running `curl http://localhost:4000/` verifies that meta tags, titles, services, and testimonials are rendered as full HTML in the initial HTTP response with `<script id="ng-state">` data for zero double-fetching.
- **Zero Console / Hydration Errors**: Full client event replay enabled via `provideClientHydration(withEventReplay())`.
- **Browser-Only API Safety**: Guarded with `isPlatformBrowser` across overlays and cookie parsing.
- **Strict TypeScript**: TypeScript `strict: true` passes with zero compiler errors across both client and server codebases.
