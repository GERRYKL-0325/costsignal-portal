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

  // Inject portal context before </head>
  const portalScript = `
<script>
window.PORTAL_USER = ${JSON.stringify({ id: userId, name: userName, email: userEmail, imageUrl: userImage })};
window.PORTAL_PRESETS_URL = '/api/presets';
</script>
<style>
#portal-bar{position:fixed;top:0;left:0;right:0;height:36px;background:#0a0a0a;border-bottom:1px solid #1e1e1e;display:flex;align-items:center;justify-content:space-between;padding:0 1rem;z-index:99999;font-family:Inter,sans-serif;}
#portal-bar .pb-user{display:flex;align-items:center;gap:0.5rem;font-size:0.72rem;color:#888;}
#portal-bar .pb-user img{width:20px;height:20px;border-radius:50%;object-fit:cover;}
#portal-bar .pb-logo{font-size:0.72rem;font-weight:700;color:#4ade80;letter-spacing:0.05em;}
#portal-bar .pb-signout{font-size:0.68rem;color:#555;text-decoration:none;padding:0.2rem 0.5rem;border:1px solid #222;border-radius:4px;cursor:pointer;background:transparent;}
#portal-bar .pb-signout:hover{color:#888;border-color:#333;}
body{padding-top:36px!important;}
</style>`;

  // Inject portal bar HTML after <body>
  const portalBar = `
<div id="portal-bar">
  <span class="pb-logo">COSTSIGNAL</span>
  <div class="pb-user">
    ${userImage ? `<img src="${userImage}" alt="" />` : ''}
    <span>${userName}</span>
    <a href="/api/auth/signout" class="pb-signout" onclick="fetch('/api/auth/signout',{method:'POST'}).then(()=>window.location='/sign-in');return false;">Sign out</a>
  </div>
</div>`;

  html = html.replace('</head>', portalScript + '</head>');
  html = html.replace('<body>', '<body>' + portalBar);
  // If no <body> tag (rare), inject after <html>
  if (!html.includes('<body>')) {
    html = html.replace('<body ', '<body ');
  }

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'no-store',
    },
  });
}
