const express = require('express');
const session = require('express-session');
const path = require('path');
const { buildSessionStore } = require('./sessionStore');
const { buildAuthRouter } = require('./auth');
const { buildDashboardRouter } = require('./dashboard');
const { loginPage, privacyPolicyPage, termsOfServicePage, docsPage } = require('./views');

function buildApp(client, config) {
  const app = express();

  // Behind a reverse proxy (nginx, Cloudflare Tunnel) in any real deploy,
  // needed so express-session sees the connection as secure over the
  // original https, not the plain http hop from the proxy.
  app.set('trust proxy', 1);

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Serve React build as static files
  // On Render: React build is copied to public/react during deployment
  // Locally: set REACT_BUILD_PATH env var
  const reactBuildPath = process.env.REACT_BUILD_PATH || 
    path.join(__dirname, '../../public/react');
  
  if (require('fs').existsSync(reactBuildPath)) {
    app.use(express.static(reactBuildPath));
    console.log('[web] serving React build from', reactBuildPath);
  } else {
    console.warn('[web] React build not found at', reactBuildPath);
  }

  // Legacy CSS (kept for compatibility)
  app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
  });

  app.get('/m3-shapes-morphing.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'm3-shapes-morphing.js'));
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

  // Middleware to inject auth data as JSON
  app.use((req, res, next) => {
    if (req.session.user) {
      res.locals.user = req.session.user;
      res.locals.token = req.session.accessToken;
    }
    next();
  });

  app.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.send(loginPage());
  });

  // Public pages
  app.get('/privacy', (req, res) => res.send(privacyPolicyPage()));
  app.get('/terms', (req, res) => res.send(termsOfServicePage()));
  app.get('/docs', (req, res) => res.send(docsPage()));

  app.use('/auth', buildAuthRouter(config));
  app.use('/dashboard', buildDashboardRouter(client));

  // API routes for React SPA (new)
  const apiRouter = require('./api')(client, config);
  app.use('/api', apiRouter);

  // SPA fallback: serve React index.html for any unmatched route
  // (except /api and /auth which already have handlers)
  app.get('*', (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
  });

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
    console.error('[web] DASHBOARD STARTUP BLOCKED:');
    if (!baseUrl) console.error('  - WEB_BASE_URL or RENDER_EXTERNAL_URL not set');
    if (!DISCORD_CLIENT_SECRET) console.error('  - DISCORD_CLIENT_SECRET not set');
    if (!SESSION_SECRET) console.error('  - SESSION_SECRET not set');
    console.log('[web] Dashboard disabled, bot continues without it.');
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
