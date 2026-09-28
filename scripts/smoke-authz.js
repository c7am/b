// Smoke test: authorization on /api using fake guilds and members and a recording DB stub.
// Nothing here touches the real database: DATABASE_URL is overridden and the db, permissions and session store are stubbed.
// Run with: npm run smoke
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const B = ROOT + '/src';
process.env.DATABASE_URL = 'postgres://u:p@127.0.0.1:9/db';
const express = require(ROOT + '/node_modules/express');
const stub = (rel, exports) => { const p = require.resolve(path.join(B, rel)); require.cache[p] = { id: p, filename: p, loaded: true, exports }; };

const dbCalls = [];
stub('db/database.js', { query: async (sql, params) => { dbCalls.push({ sql, params }); return { rows: [{ ok: true }], rowCount: 1 }; } });
stub('utils/permissions.js', { canManageStaff: async (m) => !!m && m.isStaff === true, isTicketStaff: async () => false });
const buildApi = require(path.join(B, 'web/api.js'));

const guild = (members) => ({ members: { fetch: async (id) => { if (!(id in members)) throw new Error('Unknown Member'); return members[id]; } } });
const client = { guilds: { cache: new Map([
  ['g1', guild({ staff1: { isStaff: true }, plain1: { isStaff: false } })],
  ['g2', guild({ staff2: { isStaff: true }, plain1: { isStaff: false } })],
]) } };

const app = express();
app.use(express.json());
app.use((req, res, next) => {  // fake session, driven by test headers
  const u = req.headers['x-user'];
  req.session = u ? { user: { id: u, username: u }, memberGuildIds: JSON.parse(req.headers['x-guilds'] || '[]') } : {};
  next();
});
app.use('/api', buildApi(client, {}));

let failed = 0;
(async () => {
  const srv = await new Promise((res) => { const s = app.listen(0, '127.0.0.1', () => res(s)); });
  const base = `http://127.0.0.1:${srv.address().port}`;
  const call = async (user, guilds, method, p, body) => {
    dbCalls.length = 0;
    const r = await fetch(base + p, { method, headers: { 'content-type': 'application/json', ...(user ? { 'x-user': user, 'x-guilds': JSON.stringify(guilds) } : {}) }, body: body && JSON.stringify(body) });
    return { status: r.status, calls: [...dbCalls] };
  };
  const t = (name, ok, extra = '') => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };
  const cfgBody = { modRole: 'r1', staffRole: 'r2', logsChannel: 'c1', appeals: true, autoMod: false, dmNotifications: true };
  let r;

  console.log('### guild config (needs staff in THAT guild, checked live)');
  r = await call(null, [], 'GET', '/api/config/g1');                                          t('no session -> 401', r.status === 401, `(${r.status})`);
  r = await call('staff1', ['g1'], 'GET', '/api/config/g1');                                  t('staff of g1 reads g1 -> 200', r.status === 200, `(${r.status})`);
  r = await call('plain1', ['g1'], 'GET', '/api/config/g1');                                  t('plain member of g1 reads g1 -> 403', r.status === 403, `(${r.status})`);
  r = await call('staff1', ['g1', 'g2'], 'PATCH', '/api/config/g2', cfgBody);                 t('staff of g1 PATCHes g2 (not a member) -> 403', r.status === 403 && r.calls.length === 0, `(${r.status}, db calls: ${r.calls.length})`);
  r = await call('staff1', ['g1'], 'PATCH', '/api/config/nope', cfgBody);                     t('PATCH guild the bot is not in -> 404', r.status === 404 && r.calls.length === 0, `(${r.status})`);
  r = await call('plain1', ['g1'], 'PATCH', '/api/config/g1', cfgBody);                       t('plain member PATCHes g1 -> 403, DB untouched', r.status === 403 && r.calls.length === 0, `(${r.status}, db calls: ${r.calls.length})`);
  r = await call('staff1', ['g1'], 'PATCH', '/api/config/g1', cfgBody);                       t('staff of g1 PATCHes g1 -> 200, writes g1 only', r.status === 200 && r.calls.length === 1 && r.calls[0].params[0] === 'g1', `(${r.status}, guild param: ${r.calls[0] && r.calls[0].params[0]})`);

  console.log('\n### moderations (needs staff in at least one bot guild, own records only)');
  r = await call('plain1', ['g1', 'g2'], 'GET', '/api/moderations');                          t('plain member (2 guilds) GET -> 403', r.status === 403, `(${r.status})`);
  r = await call('plain1', ['g1', 'g2'], 'POST', '/api/moderations', { target: 'x', type: 'warn', reason: 'y' }); t('plain member POST -> 403, DB untouched', r.status === 403 && r.calls.length === 0, `(${r.status}, db calls: ${r.calls.length})`);
  r = await call('staff2', ['g1', 'g2'], 'GET', '/api/moderations');                          t('staff of g2 GET -> 200, scoped to own records', r.status === 200 && r.calls[0].sql.includes('moderator_id = $1') && r.calls[0].params[0] === 'staff2', `(${r.status}, params: ${JSON.stringify(r.calls[0] && r.calls[0].params)})`);
  r = await call('staff2', ['g1', 'g2'], 'POST', '/api/moderations', { target: 'x', type: 'warn', reason: 'y' }); t('staff of g2 POST -> 200, moderator_id = caller', r.status === 200 && r.calls[0].params[3] === 'staff2', `(${r.status}, moderator_id: ${r.calls[0] && r.calls[0].params[3]})`);
  r = await call('staff1', [], 'GET', '/api/moderations');                                    t('staff but no guild in session -> 403 (fails closed)', r.status === 403, `(${r.status})`);

  console.log('\n### untouched endpoints still work');
  r = await call('u1', [], 'GET', '/api/auth/me');                                            t('/api/auth/me -> 200', r.status === 200);
  r = await call('u1', [], 'GET', '/api/shifts');                                             t('GET /api/shifts scoped to caller', r.status === 200 && r.calls[0].params[0] === 'u1', `(params: ${JSON.stringify(r.calls[0] && r.calls[0].params)})`);
  r = await call('u1', [], 'GET', '/api/appeals');                                            t('GET /api/appeals scoped to caller', r.status === 200 && r.calls[0].params[0] === 'u1');

  srv.close();
  console.log(failed ? `\n${failed} FAILED` : '\nALL AUTHZ CHECKS PASSED');
  process.exit(failed ? 1 : 0);
})();
