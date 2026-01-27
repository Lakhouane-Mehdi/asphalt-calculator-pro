import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { consent } = await request.json();

        // 100000% Legal Check: Only log if analytics consent is granted
        if (!consent || !consent.analytics) {
            return NextResponse.json({ message: 'Consent not granted' }, { status: 403 });
        }

        // Get country from Vercel headers (Anonymity: We never touch the IP)
        const country = request.headers.get('x-vercel-ip-country') || 'Unknown';

        // Log to SQL
        await sql`
            INSERT INTO user_country_stats (country_code)
            VALUES (${country})
        `;

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
