import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const pin = request.headers.get('x-admin-pin');
        if (!process.env.ADMIN_PIN || pin !== process.env.ADMIN_PIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await sql`
            CREATE TABLE IF NOT EXISTS user_country_stats (
                id SERIAL PRIMARY KEY,
                country_code VARCHAR(2) NOT NULL,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                is_hot_reload BOOLEAN DEFAULT FALSE,
                consent_version VARCHAR(10) DEFAULT '1.0'
            );
        `;

        try {
            await sql`ALTER TABLE user_country_stats ADD COLUMN IF NOT EXISTS consent_version VARCHAR(10) DEFAULT '1.0';`;
        } catch {
            // Column already exists
        }

        await sql`CREATE INDEX IF NOT EXISTS idx_country_code ON user_country_stats(country_code);`;

        return NextResponse.json({ status: 'Database setup complete' });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
