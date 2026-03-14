import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Get the internal user id from clerk_user_id, auto-provisioning if needed
async function getOrCreateDbUser(userId: string): Promise<string | null> {
  let { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!dbUser) {
    const { data: newUser } = await supabaseAdmin
      .from('users')
      .insert({ clerk_user_id: userId, plan: 'free' })
      .select('id')
      .single();
    dbUser = newUser;
  }

  return dbUser?.id ?? null;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUserId = await getOrCreateDbUser(userId);
  if (!dbUserId) return NextResponse.json({ presets: [] });

  const { data } = await supabaseAdmin
    .from('saved_configs')
    .select('id, name, description, series_slugs, from_year, to_year, format, created_at')
    .eq('user_id', dbUserId)
    .order('created_at', { ascending: false });

  // Return in format the builder expects
  const presets = (data ?? []).map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    slugs: r.series_slugs?.join(',') ?? '',
    from: r.from_year ? `${r.from_year}-1` : undefined,
    to: r.to_year ? `${r.to_year}-12` : undefined,
    format: r.format,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ presets });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUserId = await getOrCreateDbUser(userId);
  if (!dbUserId) return NextResponse.json({ error: 'Account error' }, { status: 500 });

  const body = await req.json();
  const { name, description, slugs, from, to, format } = body;

  if (!name || !slugs) return NextResponse.json({ error: 'name and slugs required' }, { status: 400 });

  const seriesSlugs = slugs.split(',').map((s: string) => s.trim()).filter(Boolean);
  const fromYear = from ? parseInt(from.split('-')[0]) : null;
  const toYear = to ? parseInt(to.split('-')[0]) : null;

  const { data, error } = await supabaseAdmin
    .from('saved_configs')
    .insert({
      user_id: dbUserId,
      name,
      description: description || null,
      series_slugs: seriesSlugs,
      from_year: fromYear,
      to_year: toYear,
      format: format || 'wide',
    })
    .select('id, name, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, preset: data });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUserId = await getOrCreateDbUser(userId);
  if (!dbUserId) return NextResponse.json({ error: 'Account error' }, { status: 500 });

  const { id } = await req.json();

  await supabaseAdmin
    .from('saved_configs')
    .delete()
    .eq('id', id)
    .eq('user_id', dbUserId); // safety: can only delete own presets

  return NextResponse.json({ ok: true });
}
