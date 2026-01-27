import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Aggregate users by country
        // 100000% Private: Just counting country codes, no IPs.
        const result = await sql`
            SELECT country_code, COUNT(*) as count 
            FROM user_country_stats 
            GROUP BY country_code 
            ORDER BY count DESC
        `;

        return NextResponse.json({
            stats: result.rows
        });
    } catch (error) {
        console.error('Analytics Stats Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
