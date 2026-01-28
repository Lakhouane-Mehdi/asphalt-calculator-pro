# Privacy Compliance Documentation (GDPR & BDSG)

## Overview
This document outlines the technical implementation of data protection measures for the Asphalt Calculator analytics system, ensuring compliance with the General Data Protection Regulation (EU GDPR) and Bundesdatenschutzgesetz (BDSG).

## 1. Data Minimization (Art. 5(1)(c) GDPR)
The system is designed to process the absolute minimum data required for geographic analytics:
- **No IP Storage**: IP addresses are processed transiently to derive a country code (e.g., 'DE') and are **never logged** to the database.
- **Aggregation**: Data is stored at the country level. No individual user identifiers (cookies IDs, browser fingerprints, etc.) are linked to the location data.

## 2. Storage Limitation (Art. 5(1)(e) GDPR)
**Policy**: Data is retained for no longer than 12 months.
**Implementation**:
- The API endpoint (`/api/analytics`) implements a lazy cleanup strategy.
- With every write request, there is a probability (1%) of triggering a purge query.
- Purge Query: `DELETE FROM user_country_stats WHERE timestamp < NOW() - INTERVAL '1 year'`.
- This ensures that old data is regularly deleted without manual intervention.

## 3. Lawfulness & Consent (Art. 6(1)(a) GDPR)
Processing is based purely on **consent**.
- A granular cookie banner requests explicit opt-in for "Analytics".
- No data is sent to the backend unless the user actively accepts.
- **Version Control**: The system logs the `consent_version` (e.g., "1.0") to prove which policy content the user agreed to (Accountability Principle).

## 4. German BDSG Specifics
- **§ 25 TTDSG**: We respect the requirement for informed consent before storing non-essential information (cookies/local storage) on the user's terminal equipment.
- **Server Location**: Data is stored in Vercel Postgres (AWS execution region is configurable, default supports EU-compliant processing).

## 5. User Rights (Art. 15-21 GDPR)
Since no personal data (PII) allows the identification of a natural person, Art. 11(2) GDPR applies:
> "If the purposes for which a controller processes personal data do not or do no longer require the identification of a data subject... the controller shall not be obliged to maintain... additional information in order to identify the data subject..."

Therefore, "Right to Access" or "Right to be Forgotten" requests for specific individuals cannot be technically fulfilled because we do not know who the users are. This is a privacy procedure by design.
