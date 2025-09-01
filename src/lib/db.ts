import { sql } from '@vercel/postgres';

export async function ensureSchema() {
  // Create tables if they do not exist
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      image TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tracking_events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      source TEXT,
      accuracy DOUBLE PRECISION
    );
  `;
}

export async function upsertUser(params: { email: string; name?: string | null; image?: string | null }) {
  const { email, name, image } = params;
  if (!email) throw new Error('Email is required');
  await ensureSchema();
  await sql`
    INSERT INTO users (email, name, image)
    VALUES (${email}, ${name ?? null}, ${image ?? null})
    ON CONFLICT (email)
    DO UPDATE SET
      name = COALESCE(EXCLUDED.name, users.name),
      image = COALESCE(EXCLUDED.image, users.image);
  `;
}

export async function getUserIdByEmail(email: string): Promise<number | null> {
  const { rows } = await sql<{ id: number }>`SELECT id FROM users WHERE email = ${email} LIMIT 1;`;
  return rows[0]?.id ?? null;
}

export async function insertTrackingEvent(params: {
  email: string;
  lat: number;
  lng: number;
  source?: string | null;
  accuracy?: number | null;
}) {
  const { email, lat, lng, source = null, accuracy = null } = params;
  await ensureSchema();
  // Ensure user exists
  await upsertUser({ email });
  const userId = await getUserIdByEmail(email);
  if (!userId) throw new Error('User not found after upsert');
  await sql`
    INSERT INTO tracking_events (user_id, lat, lng, source, accuracy)
    VALUES (${userId}, ${lat}, ${lng}, ${source}, ${accuracy});
  `;
}

