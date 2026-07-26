# Smart Field: Asphalt Calculator & Construction Assistant

**Built by Mehdi Lakhouane**

A next-generation PWA (Progressive Web App) designed for paving professionals, civil engineers, and site foremen. This tool combines standard asphalt calculations with advanced German technical standards (RStO), logistics planning, environmental impact tracking, and enterprise-grade reporting.

## 🚀 Key Features

### 1. Smart Asphalt Calculator
- **German Standards Integration (RStO 12 / ZTV Asphalt):**
  - Pre-defined material types (AC TD, AC B, SMA, MA) with specific densities.
  - **Auto-Validation:** Warns users if layer thickness violates technical norms (e.g., "⚠️ Norm: 3-5 cm" for Deckschicht).
  - **Frost Zones:** Zone I, II, and III adjustments.
- **Compaction Reality Check:**
  - Toggle between "Loose" (Screed) and "Compacted" (Finished) thickness.
  - "Est. Loose Laydown" hints to guide the screed operator.

### 2. Enterprise Features (Senior Upgrade)
- **Admin Dashboard:**
  - Real-time visualization of anonymous user country data.
  - Accessible at `/admin` (Secured via PIN).
- **Official Field Reports ("Einbauprotokoll"):**
  - Generates signed, professional PDF reports for the construction site manager.
  - Includes all project specs, calculated values, and signature lines.
- **Analytics API:**
  - Server-side PIN-protected API (`x-admin-pin`) excludes PII and ensures data privacy.

### 3. Jobsite Logistics & Environment
- **Truck Cycle Planner:** Calculates fleet requirements based on plant rate and cycle time.
- **Cooling Predictor (Einbaufenster):** Estimates compaction time window based on weather conditions (Mix/Air/Wind).
- **Sustainability:** Tracks CO2 footprint and RAP (Recycled Asphalt) savings.

### 4. Legal & Localization
- **Deep Localization:** 100% German/English toggle support (including AR/Vision tools).
- **TDDDG Compliance:** Advanced Cookie Banner with granular consent (Essential vs Analytics).
- **Legal Pages:** Fully compliant **Impressum** and **Datenschutzerklärung**.

## 🛠️ Security & Architecture

### Security Hardening ("Unhackable")
- **Server-Side Validation:** Admin API endpoints are protected by server-side PIN checks.
- **Vulnerability Patching:** All critical npm dependencies audited and patched.
- **Header Security:** Strict headers for PWA and API communication.

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand (persisted to localStorage)
- **Database:** Vercel Postgres (Anonymous Analytics)
- **Reporting:** jsPDF / AutoTable
- **Testing:** Vitest
- **Deployment:** Vercel

### Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── admin/                # PIN-protected analytics dashboard
│   ├── api/
│   │   ├── analytics/        # Consent-gated country logging + stats
│   │   ├── cron/cleanup/     # Daily GDPR retention job
│   │   └── setup-db/         # One-off schema bootstrap
│   └── legal/                # Impressum & Datenschutzerklärung
├── components/
│   ├── calculator/           # The 4-step quote wizard and its sections
│   ├── tools/                # Standalone tools (logistics, cooling, AR, vision)
│   └── ui/                   # Presentational primitives (Button, Card, Input…)
├── contexts/                 # React context providers (language)
├── hooks/                    # Reusable stateful logic
└── lib/
    ├── calc/                 # Pure math: tonnage, cooling, parsing, layer naming
    ├── db/                   # SQL schema
    ├── domain/               # German standards data (RStO 12, ZTV Asphalt)
    ├── i18n/                 # Translation tables and lookup
    ├── pdf/                  # Quote / invoice document generation
    ├── store.ts              # Zustand store — single source of truth
    └── utils.ts              # Shared helpers
```

Everything under `lib/calc` is pure and framework-free, so the math is unit-tested
directly without rendering any React.

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Open http://localhost:3000

# Run the test suite
npm test

# Production build
npm run build
```

### Environment Variables

| Variable | Purpose |
| --- | --- |
| `ADMIN_PIN` | Guards `/admin` and the analytics/setup APIs |
| `POSTGRES_URL` | Vercel Postgres connection (set automatically by the integration) |
| `CRON_SECRET` | Authorizes the daily retention cleanup cron |

## 📄 License
Property of Mehdi Lakhouane. All rights reserved.
