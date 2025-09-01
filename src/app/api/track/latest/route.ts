import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const email = session.user.email.toLowerCase();
    const { rows } = await sql<{
      id: number;
      created_at: string;
      lat: number;
      lng: number;
      source: string | null;
      accuracy: number | null;
    }>`
      SELECT te.id, te.created_at, te.lat, te.lng, te.source, te.accuracy
      FROM tracking_events te
      JOIN users u ON u.id = te.user_id
      WHERE u.email = ${email}
      ORDER BY te.created_at DESC
      LIMIT 20;
    `;

    return NextResponse.json({ items: rows });
  } catch (e) {
    console.error('Failed to fetch latest tracking', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

