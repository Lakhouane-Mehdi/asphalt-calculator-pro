import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GDPR "Storage Limitation" cleanup.
 * Scheduled daily via vercel.json; Vercel signs cron requests with CRON_SECRET.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await sql`
            DELETE FROM user_country_stats
            WHERE timestamp < NOW() - INTERVAL '1 year'
        `;

        return NextResponse.json({ status: 'success', deleted: result.rowCount ?? 0 });
    } catch (error) {
        console.error('Retention Cleanup Error:', error);
        return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }
}
