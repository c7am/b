const express = require('express');
const session = require('express-session');
const path = require('path');
const { buildSessionStore } = require('./sessionStore');
const { buildAuthRouter } = require('./auth');
const { buildDashboardRouter } = require('./dashboard');
const { loginPage } = require('./views');

function buildApp(client, config) {
  const app = express();

  // Behind a reverse proxy (nginx, Cloudflare Tunnel) in any real deploy,
  // needed so express-session sees the connection as secure over the
  // original https, not the plain http hop from the proxy.
  app.set('trust proxy', 1);

  app.use(express.urlencoded({ extended: false }));
  // Every page's <link> tag requests /style.css directly (see views.js
  // layout()). This used to be mounted at /static/style.css instead, a
  // path nothing on any page ever actually requested, so every single
  // page on the site has been loading with zero CSS applied: no Material
  // Design 3 styling, no fonts, no colors, no layout, just raw unstyled
  // browser HTML. That is almost certainly the real explanation behind
  // the whole site looking "empty."
  app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
  });

  app.use(session({
    store: buildSessionStore(),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: config.baseUrl.startsWith('https://'),
      httpOnly: true,
      sameSite: 'lax',
    },
  }));

  app.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.send(loginPage());
  });

  app.use('/auth', buildAuthRouter(config));
  app.use('/dashboard', buildDashboardRouter(client));

  return app;
}

// Render's free plan spins the whole service down after 15 minutes with no
// inbound HTTP traffic, and since the Discord gateway connection lives in
// this same process, that takes the bot itself offline too, not just the
// dashboard. Pinging the service's own public URL periodically counts as
// ordinary inbound traffic and resets that idle timer before it ever fires.
// This does NOT fix free tier's other limitation, an ephemeral filesystem
// wiped on every redeploy, that's why the database moved to Postgres
// instead of staying a local file. A paid instance type needs neither of
// these workarounds. Runs only on Render (RENDER=true is set automatically
// on every Render service) since self-pinging a local dev server or a
// always-on host elsewhere in the world would just be pointless traffic.
function startSelfPing(baseUrl) {
  if (process.env.DISABLE_SELF_PING === 'true') return;
  const INTERVAL_MS = 10 * 60 * 1000; // under the 15-minute idle threshold
  const timer = setInterval(() => {
    fetch(baseUrl).catch((err) => {
      console.error('[web] self-ping failed:', err.message);
    });
  }, INTERVAL_MS);
  timer.unref?.();
  console.log(`[web] self-ping enabled, pinging ${baseUrl} every ${INTERVAL_MS / 60000} minutes to prevent free-tier spin-down`);
}

function startWebServer(client) {
  const { WEB_PORT, PORT, WEB_BASE_URL, RENDER_EXTERNAL_URL, CLIENT_ID, DISCORD_CLIENT_SECRET, SESSION_SECRET } = process.env;

  // Render injects RENDER_EXTERNAL_URL automatically for every web service,
  // no manual config needed there. WEB_BASE_URL is still the override for
  // any other host (a VPS, ngrok for local OAuth testing, etc).
  const baseUrl = WEB_BASE_URL || RENDER_EXTERNAL_URL;

  if (!baseUrl || !DISCORD_CLIENT_SECRET || !SESSION_SECRET) {
    console.log('[web] WEB_BASE_URL (or RENDER_EXTERNAL_URL), DISCORD_CLIENT_SECRET, or SESSION_SECRET not set, dashboard disabled.');
    return null;
  }

  // PORT is Render's convention (and Heroku's, and most PaaS providers')
  // for a web service; Render specifically fails the deploy if nothing
  // binds to it. WEB_PORT stays as a manual override for other hosts.
  const port = parseInt(PORT, 10) || parseInt(WEB_PORT, 10) || 3000;
  const app = buildApp(client, {
    clientId: CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    baseUrl: baseUrl.replace(/\/$/, ''),
    sessionSecret: SESSION_SECRET,
  });

  // Every Render web service must bind 0.0.0.0, not localhost/127.0.0.1,
  // or Render's routing layer cannot reach it even though the port is open.
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[web] dashboard listening on port ${port} (${baseUrl})`);
    if (process.env.RENDER === 'true') startSelfPing(baseUrl.replace(/\/$/, ''));
  });
  return server;
}

module.exports = { buildApp, startWebServer };
