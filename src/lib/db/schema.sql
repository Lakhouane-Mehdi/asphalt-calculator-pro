-- PII-Free Analytics Schema
-- Stores only generalized location data and binary consent status.

CREATE TABLE IF NOT EXISTS user_country_stats (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(2) NOT NULL, -- e.g., 'DE', 'FR'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_hot_reload BOOLEAN DEFAULT FALSE
);

-- Index for performance on country reports
CREATE INDEX IF NOT EXISTS idx_country_code ON user_country_stats(country_code);
