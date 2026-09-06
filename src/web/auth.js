const express = require('express');
const crypto = require('crypto');
const { getAuthorizeUrl, exchangeCodeForToken, fetchCurrentUser, fetchUserGuilds, hasAdministrator } = require('./discordApi');

function buildAuthRouter({ clientId, clientSecret, baseUrl }) {
  const router = express.Router();
  const redirectUri = `${baseUrl}/auth/callback`;

  router.get('/login', (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state;
    res.redirect(getAuthorizeUrl({ clientId, redirectUri, state }));
  });

  router.get('/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
      return res.status(400).send(`Discord login was cancelled or denied (${error}).`);
    }
    if (!code || !state || state !== req.session.oauthState) {
      return res.status(400).send('Invalid or expired login attempt. Please try logging in again.');
    }
    delete req.session.oauthState;

    try {
      const tokenData = await exchangeCodeForToken({ clientId, clientSecret, redirectUri, code });
      const user = await fetchCurrentUser(tokenData.access_token);
      const guilds = await fetchUserGuilds(tokenData.access_token);
      const adminGuildIds = guilds.filter(hasAdministrator).map((g) => g.id);

      req.session.user = { id: user.id, username: user.username };
      req.session.adminGuildIds = adminGuildIds;
      // Every guild Discord says this user belongs to, admin or not. Used
      // only to decide which guilds to list on the picker page; actual
      // per-request access is re-checked live against the bot's own guild
      // cache (see requireMember/requireAdmin in dashboard.js) rather than
      // trusted from this snapshot, since a user can leave a guild or lose
      // a role after this list was captured but before the session expires.
      req.session.memberGuildIds = guilds.map((g) => g.id);
      // Regenerate the CSRF token on every fresh login.
      req.session.csrfToken = crypto.randomBytes(16).toString('hex');

      res.redirect('/dashboard');
    } catch (err) {
      console.error('[web/auth] OAuth callback failed:', err);
      res.status(500).send('Login failed while talking to Discord. Please try again.');
    }
  });

  router.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });

  return router;
}

module.exports = { buildAuthRouter };
