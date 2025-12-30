# Asphalt Calculator Pro (Asphalt Rechner)

A professional web-based tool designed for construction professionals and DIY enthusiasts to calculate asphalt tonnage, volume, and costs with precision. Includes RStO 12 frost protection layer calculations.

**Live Demo:** [https://asphalt-calculator-eight.vercel.app](https://asphalt-calculator-eight.vercel.app)

## 🚀 Features

### Core Calculation
- **Dual Shape Support**: Calculate for Rectagular (Length × Width) or Circular (Diameter) areas.
- **Accurate Tonnage**: Uses precise density formulas (default 2.4 t/m³) to estimate required asphalt weight.
- **Waste Factor (Verschnitt)**: Integrated safety margin input (e.g., +5%) to ensure you order enough material.
- **Cost Estimation**: Estimates total material cost based on custom or regional average prices (DE, AT, CH).

### Professional Tools
- **RStO 12 Integration**: Calculates required Frost Protection Layers (Frostschutzschicht) based on German Load Classes (Bk) and Frost Zones.
- **Logistics Estimator**: Auto-calculates the number of trucks needed (12t, 18t, 25t) for your project.
- **Bilingual Interface**: Fully localized for **English** and **German**.

### Productivity
- **Project History**: Automatically saves your recent calculations (Project Name, Date, Weight, Cost) locally.
- **PDF Export**: Generate professional PDF reports with project details.
- **Email & Print**: Send quotes via email or print a clean, ink-friendly summary.
- **Visual Cross-Section**: Dynamic visualization of the asphalt and frost layers.

## 🛠 Tech Stack

- **Frontend**: HTML5, Modern CSS3 (Variables, Animations), JavaScript (ES6+).
- **Backend**: Node.js, Express (for secure calculation logic and frost zone APIs).
- **Hosting**: Vercel (Serverless Functions).
- **Libraries**: `jspdf` & `jspdf-autotable` for PDF generation.

## 📦 Installation (Local)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amazigh24/asphalt-calculator-pro.git
   cd asphalt-calculator-pro
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   node server.js
   ```
   Open `http://localhost:3000` in your browser.

## 📝 Usage

1. Enter a **Project Name**.
2. Select your **Shape** (Rectangle or Circle) and enter dimensions.
3. Choose your **Asphalt Type** (Surface, Binder, Base) to auto-set density.
4. (Optional) Enable **Frost Protection** to calculate the sub-base.
5. Review the **Results**, **Logistics**, and **Cost**.
6. **Export PDF** or **Email** the results.

---

**Author**: Mehdi Lakhouane
**Version**: 2.0.0
