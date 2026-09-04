const { SCALAR_KEYS } = require('../utils/guildConfig');

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Lucide SVG icons, 24x24, inline
const ICONS = {
  logOut: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  chevronLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  trash2: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
};

function icon(name) {
  return ICONS[name] || '';
}

// Discord's icon hashes come back with no extension. Animated icons use a
// hash starting with "a_" and need .gif, everything else gets .png. Feeding
// a hardcoded extension in regardless of which case this is would silently
// break animated server icons (".gif.png" is not a real file).
function guildIconUrl(guild) {
  if (!guild.icon) return null;
  const ext = guild.icon.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}`;
}

function layout({ title, body, flash }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} - Staff Bot Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,400;8..144,500;8..144,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/style.css">
</head>
<body>
${flash ? flashHtml(flash) : ''}
${body}
</body>
</html>`;
}

function flashHtml(flash) {
  const cls = flash.type === 'error' ? 'flash-error' : 'flash-success';
  return `<div class="page" style="padding-bottom:0"><div class="flash ${cls}">${escapeHtml(flash.message)}</div></div>`;
}

function loginPage() {
  const body = `
<div class="center-page">
  <div class="card stack" style="width:100%;max-width:400px;text-align:center;padding:var(--space-4)">
    <h1 class="headline-large">Staff Bot Dashboard</h1>
    <p class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">
      Sign in with Discord to manage settings for servers where you have Administrator access.
    </p>
    <a class="btn btn-filled btn-full-width" href="/auth/login" style="gap:8px">
      ${icon('check')}
      <span>Login with Discord</span>
    </a>
  </div>
</div>`;
  return layout({ title: 'Login', body });
}

function guildListPage({ guilds, username }) {
  const items = guilds.length
    ? guilds.map((g) => {
        const iconUrl = guildIconUrl(g);
        const icon = iconUrl
          ? `<img class="guild-icon" src="${escapeHtml(iconUrl)}" alt="">`
          : `<div class="guild-icon-placeholder">${escapeHtml(g.name.slice(0, 1).toUpperCase())}</div>`;
        return `<a class="guild-item" href="/dashboard/${g.id}">
          ${icon}
          <span class="title-medium" style="color:var(--md-sys-color-on-surface)">${escapeHtml(g.name)}</span>
        </a>`;
      }).join('\n')
    : `<p class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">
        No manageable servers found. You need Administrator permission in a server this bot is in.
      </p>`;

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Staff Bot Dashboard</h1>
  <div class="row">
    <span class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">${escapeHtml(username)}</span>
    <a class="btn btn-text" href="/auth/logout" style="gap:4px" title="Log out">
      ${icon('logOut')}
    </a>
  </div>
</header>
<div class="page stack">
  <h2 class="headline-medium">Your servers</h2>
  <div class="server-grid">
    ${items}
  </div>
</div>`;
  return layout({ title: 'Your servers', body });
}

function roleOption(role, selectedId) {
  const selected = role.id === selectedId ? ' selected' : '';
  return `<option value="${escapeHtml(role.id)}"${selected}>${escapeHtml(role.name)}</option>`;
}

function channelOption(channel, selectedId, prefix = '#') {
  const selected = channel.id === selectedId ? ' selected' : '';
  return `<option value="${escapeHtml(channel.id)}"${selected}>${prefix}${escapeHtml(channel.name)}</option>`;
}

// Ranks/config store raw role IDs, never Discord mention syntax (<@&id>).
// That syntax only renders specially inside a Discord client, a browser
// would show it as literal text or have the HTML parser choke on the
// leading "<". Resolve the actual role name here, with a graceful fallback
// if the role was since deleted from the server.
function resolveRoleName(roles, roleId) {
  if (!roleId) return null;
  const role = roles.find((r) => r.id === roleId);
  return role ? role.name : `deleted role (${roleId})`;
}

function ranksTable(ranks, roles, guildId) {
  if (!ranks.length) {
    return `<p class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">No ranks configured yet.</p>`;
  }
  const rows = ranks.map((r) => `
    <div class="list-row">
      <span class="body-medium">
        <strong>${escapeHtml(r.name)}</strong>
        <span class="chip" style="margin-left:8px">Level ${escapeHtml(r.level)}</span>
        <span class="body-small" style="margin-left:8px">${escapeHtml(resolveRoleName(roles, r.roleId))}</span>
      </span>
      <form method="POST" action="/dashboard/${escapeHtml(guildId)}/remove-rank" style="margin:0">
        <input type="hidden" name="name" value="${escapeHtml(r.name)}">
        <button class="btn btn-icon btn-danger" type="submit" title="Remove rank">
          ${icon('trash2')}
        </button>
      </form>
    </div>`).join('\n');
  return rows;
}

function infractionTypesTable(types, guildId) {
  if (!types.length) {
    return `<p class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">No infraction types configured yet.</p>`;
  }
  return types.map((t) => `
    <div class="list-row">
      <span class="body-medium"><strong>${escapeHtml(t.name)}</strong> <span class="chip" style="margin-left:8px">${escapeHtml(t.points)} pts</span></span>
      <form method="POST" action="/dashboard/${escapeHtml(guildId)}/remove-infraction-type" style="margin:0">
        <input type="hidden" name="name" value="${escapeHtml(t.name)}">
        <button class="btn btn-icon btn-danger" type="submit" title="Remove type">
          ${icon('trash2')}
        </button>
      </form>
    </div>`).join('\n');
}

function settingsPage({ guild, roles, textChannels, categoryChannels, scalars, ranks, infractionTypes, csrfToken, flash }) {
  const scalarRoleFields = ['staffManageRoleId', 'ticketStaffRoleId', 'sessionPingRoleId']
    .map((key) => `
      <div class="field-group">
        <label for="${key}">${escapeHtml(SCALAR_KEYS[key])}</label>
        <select name="${key}" id="${key}">
          <option value="">None</option>
          ${roles.map((r) => roleOption(r, scalars[key])).join('\n')}
        </select>
      </div>`).join('\n');

  // logChannelId needs a text channel, ticketCategoryId needs a category.
  // Feeding both from the same list would let a text channel get saved as
  // the ticket category, which breaks ticket creation the next time it runs.
  const channelListFor = {
    logChannelId: { list: textChannels, prefix: '#' },
    ticketCategoryId: { list: categoryChannels, prefix: '' },
  };
  const scalarChannelFields = ['logChannelId', 'ticketCategoryId']
    .map((key) => `
      <div class="field-group">
        <label for="${key}">${escapeHtml(SCALAR_KEYS[key])}</label>
        <select name="${key}" id="${key}">
          <option value="">None</option>
          ${channelListFor[key].list.map((c) => channelOption(c, scalars[key], channelListFor[key].prefix)).join('\n')}
        </select>
      </div>`).join('\n');

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">${escapeHtml(guild.name)}</h1>
  <a class="btn btn-text" href="/dashboard" style="gap:4px">
    ${icon('chevronLeft')}
    <span>Back</span>
  </a>
</header>
<div class="page stack">
  <div class="card-high stack">
    <h2 class="headline-medium">Roles</h2>
    <form method="POST" action="/dashboard/${escapeHtml(guild.id)}/roles" class="stack">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      ${scalarRoleFields}
      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:8px">
        ${icon('check')}
        <span>Save roles</span>
      </button>
    </form>
  </div>

  <div class="card-high stack">
    <h2 class="headline-medium">Channels</h2>
    <form method="POST" action="/dashboard/${escapeHtml(guild.id)}/channels" class="stack">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      ${scalarChannelFields}
      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:8px">
        ${icon('check')}
        <span>Save channels</span>
      </button>
    </form>
  </div>

  <div class="card-high stack">
    <h2 class="headline-medium">Ranks</h2>
    ${ranksTable(ranks, roles, guild.id)}
    <hr class="divider" style="margin:12px 0">
    <form method="POST" action="/dashboard/${escapeHtml(guild.id)}/add-rank" class="add-form">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <div class="field-group">
        <label for="rank-name">Name</label>
        <input type="text" id="rank-name" name="name" required>
      </div>
      <div class="field-group">
        <label for="rank-role">Role</label>
        <select id="rank-role" name="roleId" required>
          ${roles.map((r) => roleOption(r, null)).join('\n')}
        </select>
      </div>
      <div class="field-group">
        <label for="rank-level">Level</label>
        <input type="text" id="rank-level" name="level" required inputmode="numeric" pattern="[0-9]+">
      </div>
      <button class="btn btn-tonal" type="submit" style="gap:8px">
        ${icon('plus')}
        <span>Add rank</span>
      </button>
    </form>
  </div>

  <div class="card-high stack">
    <h2 class="headline-medium">Infraction types</h2>
    ${infractionTypesTable(infractionTypes, guild.id)}
    <hr class="divider" style="margin:12px 0">
    <form method="POST" action="/dashboard/${escapeHtml(guild.id)}/add-infraction-type" class="add-form">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <div class="field-group">
        <label for="itype-name">Name</label>
        <input type="text" id="itype-name" name="name" required>
      </div>
      <div class="field-group">
        <label for="itype-points">Points</label>
        <input type="text" id="itype-points" name="points" required inputmode="numeric" pattern="[0-9]+">
      </div>
      <button class="btn btn-tonal" type="submit" style="gap:8px">
        ${icon('plus')}
        <span>Add type</span>
      </button>
    </form>
  </div>
</div>`;
  return layout({ title: guild.name, body, flash });
}

module.exports = {
  escapeHtml,
  guildIconUrl,
  layout,
  loginPage,
  guildListPage,
  settingsPage,
};
