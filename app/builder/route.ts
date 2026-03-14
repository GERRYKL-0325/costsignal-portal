import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.emailAddresses[0]?.emailAddress || 'User';
  const userEmail = user?.emailAddresses[0]?.emailAddress || '';
  const userImage = user?.imageUrl || '';

  // Fetch builder HTML from costsignal.io
  const res = await fetch('https://costsignal.io/builder', {
    cache: 'no-store',
    headers: { 'User-Agent': 'CostSignal-Portal/1.0' },
  });

  if (!res.ok) {
    return new NextResponse('Builder unavailable', { status: 502 });
  }

  let html = await res.text();

  // Inject portal context — no visible bar, builder's own nav handles UI
  // PORTAL_USER lets the save button skip the auth wall
  // PORTAL_PRESETS_URL wires save/load to the portal API
  const portalScript = `
<script>
window.PORTAL_USER = ${JSON.stringify({ id: userId, name: userName, email: userEmail, imageUrl: userImage })};
window.PORTAL_PRESETS_URL = '/api/presets';
// Override sign-out in builder nav to use portal sign-out
window.__PORTAL_SIGNOUT__ = function() {
  fetch('/api/auth/signout', { method: 'POST' }).then(() => { window.location.href = '/sign-in'; });
};
</script>`;

  html = html.replace('</head>', portalScript + '</head>');

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'no-store',
    },
  });
}
