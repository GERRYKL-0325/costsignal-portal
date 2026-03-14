import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const presets = (user.privateMetadata?.presets as any[]) || [];
  return NextResponse.json({ presets });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const preset = await req.json();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const presets = (user.privateMetadata?.presets as any[]) || [];

  const newPreset = {
    ...preset,
    id: `p_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  presets.push(newPreset);

  await client.users.updateUserMetadata(userId, {
    privateMetadata: { presets },
  });

  return NextResponse.json({ ok: true, preset: newPreset });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const presets = ((user.privateMetadata?.presets as any[]) || []).filter((p: any) => p.id !== id);

  await client.users.updateUserMetadata(userId, {
    privateMetadata: { presets },
  });

  return NextResponse.json({ ok: true });
}
