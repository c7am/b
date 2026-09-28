// Smoke test: route ownership (React shell vs legacy dashboard vs API), with and without a React build.
// Nothing here touches the real database: DATABASE_URL is overridden and the db, permissions and session store are stubbed.
// Run with: npm run smoke
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const B = ROOT + '/src';
process.env.DATABASE_URL = 'postgres://u:p@127.0.0.1:9/db'; // pool is created but never connected
const session = require(ROOT + '/node_modules/express-session');
const stub = (rel, exports) => { const p = require.resolve(path.join(B, rel)); require.cache[p] = { id: p, filename: p, loaded: true, exports }; };
stub('web/sessionStore.js', { buildSessionStore: () => new session.MemoryStore() });
const { buildApp } = require(path.join(B, 'web/server.js'));

const jsFile = fs.readdirSync(ROOT + '/public/react/assets').find((f) => f.endsWith('.js'));
const cfg = { clientId: '1', clientSecret: 's', baseUrl: 'http://localhost', sessionSecret: 'x' };
const shell = (r, ct, b) => r.status === 200 && ct.includes('text/html') && b.includes('<div id="root">');
let failed = 0;

async function suite(title, app, cases) {
  const srv = await new Promise((res) => { const s = app.listen(0, '127.0.0.1', () => res(s)); });
  const base = `http://127.0.0.1:${srv.address().port}`;
  console.log(`\n### ${title}`);
  for (const [name, method, p, test] of cases) {
    const r = await fetch(base + p, { method, redirect: 'manual', headers: { 'content-type': 'application/json' }, body: method === 'GET' ? undefined : '{}' });
    const ct = r.headers.get('content-type') || '';
    const b = await r.text();
    const ok = test(r, ct, b);
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(46)} ${r.status} ${ct.split(';')[0].padEnd(24)} ${r.headers.get('location') || ''}`);
  }
  srv.close();
}

(async () => {
  const client = { guilds: { cache: new Map() } };

  await suite('WITH React build (production layout)', buildApp(client, cfg), [
    ['GET / -> React shell',                        'GET', '/',                 (r, c, b) => shell(r, c, b)],
    ['GET /dashboard -> React shell',               'GET', '/dashboard',        (r, c, b) => shell(r, c, b)],
    ['GET /dashboard/ (trailing slash)',            'GET', '/dashboard/',       (r, c, b) => shell(r, c, b)],
    ['GET /appeals -> SPA fallback',                'GET', '/appeals',          (r, c, b) => shell(r, c, b)],
    ['GET /settings -> SPA fallback',               'GET', '/settings',         (r, c, b) => shell(r, c, b)],
    ['GET /moderation -> SPA fallback',             'GET', '/moderation',       (r, c, b) => shell(r, c, b)],
    ['JS asset served with a JS content type',      'GET', '/assets/' + jsFile, (r, c) => r.status === 200 && c.includes('javascript')],
    ['legacy /dashboard/:guildId stays legacy',     'GET', '/dashboard/123',    (r, c, b) => !b.includes('<div id="root">') && r.status !== 200],
    ['legacy picker mounted at /legacy',            'GET', '/legacy',           (r, c, b) => !b.includes('<div id="root">') && r.status !== 404],
    ['/api/auth/me unauthenticated -> 401 JSON',    'GET', '/api/auth/me',      (r, c) => r.status === 401 && c.includes('json')],
    ['unknown /api path -> 404 JSON, not the shell','GET', '/api/nope',         (r, c) => r.status === 404 && c.includes('json')],
    ['unknown /auth path -> 404, not the shell',    'GET', '/auth/nope',        (r, c, b) => r.status === 404 && !b.includes('<div id="root">')],
    ['POST /api/shifts/start unauthenticated',      'POST','/api/shifts/start', (r) => r.status === 401],
    ['PATCH /api/config/x unauthenticated',         'PATCH','/api/config/x',    (r) => r.status === 401],
    ['/auth/login redirects to Discord OAuth',      'GET', '/auth/login',       (r) => r.status === 302 && (r.headers.get('location') || '').includes('discord.com')],
    ['/privacy legacy page still works',            'GET', '/privacy',          (r, c, b) => r.status === 200 && !b.includes('<div id="root">')],
  ]);

  process.env.REACT_BUILD_PATH = '/nonexistent/react';
  await suite('WITHOUT React build (safety net if public/react goes missing)', buildApp(client, cfg), [
    ['GET / -> legacy login page',                  'GET', '/',          (r, c, b) => r.status === 200 && !b.includes('<div id="root">')],
    ['GET /dashboard -> legacy router (redirect)',  'GET', '/dashboard', (r, c, b) => r.status !== 200 && r.status !== 404 && !b.includes('<div id="root">')],
    ['GET /legacy not mounted -> 404',              'GET', '/legacy',    (r) => r.status === 404],
    ['GET /appeals -> plain 404, no crash',         'GET', '/appeals',   (r) => r.status === 404],
  ]);

  console.log(failed ? `\n${failed} FAILED` : '\nALL ROUTING CHECKS PASSED');
  process.exit(failed ? 1 : 0);
})();
