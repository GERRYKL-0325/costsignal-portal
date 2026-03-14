import { NextRequest, NextResponse } from 'next/server';

const COSTSIGNAL_API = 'https://costsignal.io';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join('/');
  const url = new URL(req.url);
  const search = url.search;

  try {
    const res = await fetch(`${COSTSIGNAL_API}/v1/${pathStr}${search}`, {
      headers: { 'User-Agent': 'CostSignal-Portal/1.0' },
      cache: 'no-store',
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'API unavailable' }, { status: 502 });
  }
}
