import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { insertTrackingEvent } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
  }

  try {
    const body = await req.json();
    const lat = Number(body?.lat);
    const lng = Number(body?.lng);
    const accuracy = body?.accuracy != null ? Number(body.accuracy) : null;
    const source = typeof body?.source === 'string' ? body.source : null;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    await insertTrackingEvent({
      email: session.user.email.toLowerCase(),
      lat,
      lng,
      source,
      accuracy,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Failed to insert tracking event', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

