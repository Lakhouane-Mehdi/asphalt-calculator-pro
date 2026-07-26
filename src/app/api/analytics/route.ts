import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { consent, consentVersion } = await request.json();

        // 100000% Legal Check: Only log if analytics consent is granted
        if (!consent || !consent.analytics) {
            return NextResponse.json({ message: 'Consent not granted' }, { status: 403 });
        }

        // Get country from Vercel headers (Anonymity: We never touch the IP)
        const country = request.headers.get('x-vercel-ip-country') || 'Unknown';

        // Retention cleanup runs on a daily cron (see /api/cron/cleanup), keeping
        // the user-facing request path free of maintenance DELETEs.

        // Log to SQL with Version Tracking
        await sql`
            INSERT INTO user_country_stats (country_code, consent_version)
            VALUES (${country}, ${consentVersion || '1.0'})
        `;

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
