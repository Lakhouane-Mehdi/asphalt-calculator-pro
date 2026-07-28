# Asphalt Calculator

A PWA for paving crews. Works out material quantities against German RStO 12 /
ZTV Asphalt standards, plans truck cycles, and generates the Einbauprotokoll the
site manager needs at the end of the day.

I worked as a Straßenbauer and did these calculations on paper, so I built the
thing I wanted on site.

## Calculations

Material types — AC TD, AC B, SMA, MA — each carry their own density. Enter a
layer thickness outside the norm for that type and it warns you: 3–5 cm for a
Deckschicht, and so on. Frost zones I through III adjust the base.

Thickness toggles between loose and compacted, with an estimated laydown figure
for the screed operator, since that's the number he actually sets.

## On site

**Truck cycles** — fleet size from plant output rate and round-trip time.

**Cooling window** — how long you have to compact, given mix temperature, air
temperature, and wind.

**Reports** — PDF Einbauprotokoll with project specs, calculated values, and
signature lines.

**Sustainability** — CO2 footprint and RAP savings.

## Admin

There's a `/admin` view behind a PIN showing anonymous country-level usage. The
API checks the PIN server-side via an `x-admin-pin` header and returns no
personally identifying data.

## Setup

```bash
npm install
npm run dev
```

Installs as a PWA, works offline once loaded.
