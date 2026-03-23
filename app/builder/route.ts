import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  // Redirect to the main builder — simpler and more reliable than proxying
  redirect('https://costsignal.io/builder');

  // Fetch builder HTML from costsignal.io (10s timeout)
  let res: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    res = await fetch('https://costsignal.io/builder', {
      cache: 'no-store',
      headers: { 'User-Agent': 'CostSignal-Portal/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch {
    return new NextResponse(`<!DOCTYPE html><html><head><title>Builder loading…</title>
<meta http-equiv="refresh" content="5;url=/builder">
<style>body{background:#0a0a0a;color:#888;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:1rem;}
a{color:#4ade80;}</style></head><body>
<div style="font-size:1.2rem;color:#4ade80;">⏳</div>
<div>Builder is warming up…</div>
<div style="font-size:0.8rem;">Refreshing in 5 seconds — or <a href="/builder">click here</a></div>
</body></html>`, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  if (!res.ok) {
    return new NextResponse(`<!DOCTYPE html><html><head><title>Builder unavailable</title>
<meta http-equiv="refresh" content="10;url=/builder">
<style>body{background:#0a0a0a;color:#888;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:1rem;}
a{color:#4ade80;}</style></head><body>
<div style="font-size:1.2rem;">⚠️</div>
<div>Builder is temporarily unavailable (${res.status})</div>
<div style="font-size:0.8rem;"><a href="/builder">Retry</a> · or go to <a href="https://costsignal.io/builder" target="_blank">costsignal.io/builder</a> directly</div>
</body></html>`, { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  let html = await res.text();

  const avatarHtml = userImage
    ? `<img src="${userImage}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid #333;" />`
    : `<div style="width:28px;height:28px;border-radius:50%;background:#1a3a1a;border:1px solid #2a4a2a;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#4ade80;">${userName.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}</div>`;

  const portalScript = `
<script>
window.PORTAL_USER = ${JSON.stringify({ id: userId, name: userName, email: userEmail, imageUrl: userImage })};
window.PORTAL_PRESETS_URL = '/api/presets';
// Replace Sign in / Get started nav buttons with portal user menu
document.addEventListener('DOMContentLoaded', function() {
  // Hide sign-in / get-started buttons
  document.querySelectorAll('a.nav-home, a.nav-portal-cta').forEach(function(el) {
    if (el.textContent.trim().match(/sign.?in|get started/i)) el.style.display = 'none';
  });
  // Inject portal nav items after the nav links
  var nav = document.querySelector('nav') || document.querySelector('header');
  if (nav) {
    var menu = document.createElement('div');
    menu.id = 'portal-nav-user';
    menu.style.cssText = 'display:flex;align-items:center;gap:0.75rem;margin-left:auto;';
    menu.innerHTML = \`
      <a href="https://portal.costsignal.io/dashboard" style="font-size:0.78rem;color:#888;text-decoration:none;font-family:Inter,sans-serif;padding:0.35rem 0.7rem;border:1px solid #222;border-radius:6px;transition:color 0.15s;" onmouseover="this.style.color='#ccc'" onmouseout="this.style.color='#888'">Dashboard</a>
      <div style="position:relative;cursor:pointer;" id="portal-avatar-wrap">
        ${avatarHtml}
        <div id="portal-avatar-menu" style="display:none;position:absolute;right:0;top:36px;background:#111;border:1px solid #222;border-radius:8px;min-width:160px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.5);overflow:hidden;">
          <div style="padding:0.6rem 0.9rem;font-size:0.72rem;color:#666;border-bottom:1px solid #1a1a1a;">${userEmail}</div>
          <a href="https://portal.costsignal.io/dashboard/settings" style="display:block;padding:0.55rem 0.9rem;font-size:0.78rem;color:#aaa;text-decoration:none;font-family:Inter,sans-serif;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='transparent'">⚙ Settings</a>
          <a href="https://portal.costsignal.io/dashboard" style="display:block;padding:0.55rem 0.9rem;font-size:0.78rem;color:#aaa;text-decoration:none;font-family:Inter,sans-serif;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='transparent'">📊 Dashboard</a>
          <a href="#" onclick="fetch('/api/auth/signout',{method:'POST'}).then(function(){window.location.href='/sign-in'});return false;" style="display:block;padding:0.55rem 0.9rem;font-size:0.78rem;color:#e87070;text-decoration:none;font-family:Inter,sans-serif;border-top:1px solid #1a1a1a;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='transparent'">Sign out</a>
        </div>
      </div>\`;
    nav.appendChild(menu);
    document.getElementById('portal-avatar-wrap').addEventListener('click', function(e) {
      e.stopPropagation();
      var m = document.getElementById('portal-avatar-menu');
      m.style.display = m.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', function() {
      var m = document.getElementById('portal-avatar-menu');
      if (m) m.style.display = 'none';
    });
  }
});
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
