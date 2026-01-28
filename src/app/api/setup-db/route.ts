import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS user_country_stats (
                id SERIAL PRIMARY KEY,
                country_code VARCHAR(2) NOT NULL,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                is_hot_reload BOOLEAN DEFAULT FALSE,
                consent_version VARCHAR(10) DEFAULT '1.0'
            );
        `;

        // Check if column exists, if not add it (for existing tables)
        try {
            await sql`ALTER TABLE user_country_stats ADD COLUMN IF NOT EXISTS consent_version VARCHAR(10) DEFAULT '1.0';`;
        } catch (ignored) {
            // Error likely means column exists or table just created
        }

        await sql`CREATE INDEX IF NOT EXISTS idx_country_code ON user_country_stats(country_code);`;

        return NextResponse.json({ status: 'Database setup complete' });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
