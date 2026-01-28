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
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Vercel Postgres (Anonymous Analytics)
- **Reporting:** jsPDF / AutoTable
- **Deployment:** Vercel

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Open http://localhost:3000
```

## 📄 License
Property of Mehdi Lakhouane. All rights reserved.
