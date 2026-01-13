# Smart Field: Asphalt Calculator & Construction Assistant

**Built by Mehdi Lakhouane**

A next-generation PWA (Progressive Web App) designed for paving professionals, civil engineers, and site foremen. This tool combines standard asphalt calculations with advanced German technical standards (RStO), logistics planning, and environmental impact tracking.

## 🚀 Key Features

### 1. Smart Asphalt Calculator
- **German Standards Integration (RStO 12 / ZTV Asphalt):**
  - Pre-defined material types (AC TD, AC B, SMA, MA) with specific densities.
  - **Auto-Validation:** Warns users if layer thickness violates technical norms (e.g., "⚠️ Norm: 3-5 cm" for Deckschicht).
  - **Frost Zones:** Zone I, II, and III adjustments.
- **Compaction Reality Check:**
  - Toggle between "Loose" (Screed) and "Compacted" (Finished) thickness.
  - "Est. Loose Laydown" hints to guide the screed operator.
- **Voice Input:** Hands-free data entry for field usage.

### 2. Jobsite Logistics
- **Truck Cycle Planner:** Calculates the number of trucks required to maintain continuous paver operation based on plant rate, cycle time, and truck capacity.
- **Cooling Predictor (Einbaufenster):** Estimates the time available for compaction based on mix temperature, air temperature, and wind speed. Includes visual warnings for rapid cooling conditions.

### 3. Sustainability & Compliance
- **Green Asphalt Tools:** Tracks CO2 footprint and potential binder savings from RAP (Recycled Asphalt Pavement) usage.
- **Professional Quotes:** Generates and exports branded PDF quotes/estimates directly from the mobile device.

### 4. Field-Ready Tech
- **PWA Support:** Installable on iOS/Android (offline capable).
- **Vision Measurement:** (Beta) AR and camera-based tools for estimation.
- **Multi-Language:** Fully localized for English (International) and German (DACH region).

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** Lucide React
- **PDF Generation:** jsPDF / AutoTable
- **Deployment:** Vercel (Edge Network)

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
