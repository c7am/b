const DISCORD_API = 'https://discord.com/api/v10';
const ADMINISTRATOR_BIT = 0x8n;

function getAuthorizeUrl({ clientId, redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify guilds',
    state,
    prompt: 'none',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

async function exchangeCodeForToken({ clientId, clientSecret, redirectUri, code }) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Discord token exchange failed (${res.status}): ${text}`);
  }
  return res.json(); // { access_token, token_type, expires_in, refresh_token, scope }
}

async function fetchCurrentUser(accessToken) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch current user (${res.status})`);
  return res.json(); // { id, username, avatar, ... }
}

// Returns partial guild objects, each with id, name, icon, owner (boolean),
// and permissions (string-encoded bitfield). Confirmed against the current
// Discord API docs (APIGuild: permissions is only present on this
// endpoint's response). No extra per-guild API call is needed to know
// whether a user can administer a given guild.
async function fetchUserGuilds(accessToken) {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch user guilds (${res.status})`);
  return res.json();
}

// Raw BigInt bitwise check against the partial guild object's permissions
// string, rather than discord.js's PermissionsBitField, to avoid any
// uncertainty about how that class parses a string-encoded bitfield coming
// from a plain REST response instead of a live gateway guild.
function hasAdministrator(partialGuild) {
  if (partialGuild.owner === true) return true;
  if (!partialGuild.permissions) return false;
  try {
    return (BigInt(partialGuild.permissions) & ADMINISTRATOR_BIT) === ADMINISTRATOR_BIT;
  } catch {
    return false;
  }
}

module.exports = {
  getAuthorizeUrl,
  exchangeCodeForToken,
  fetchCurrentUser,
  fetchUserGuilds,
  hasAdministrator,
};
