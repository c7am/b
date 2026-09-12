function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Lucide SVG icons, 20x20, inline
const ICONS = {
  logOut: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  chevronLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  chevronRight: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  trash2: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  clock: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  users: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  alertCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  checkCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
};

function icon(name) {
  return ICONS[name] || '';
}

function formatDate(date) {
  if (!date) return 'N/A';
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function layout({ title, body, showNav = true }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Axiom</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="page-wrapper">
    ${body}
    <footer class="site-footer">
      <div class="site-footer-links">
        <a href="/docs">Documentation</a>
        <span class="site-footer-dot">&middot;</span>
        <a href="/privacy">Privacy Policy</a>
        <span class="site-footer-dot">&middot;</span>
        <a href="/terms">Terms of Service</a>
      </div>
      <div class="site-footer-copy">Axiom</div>
    </footer>
  </div>
</body>
</html>`;
}

// ============= Login Page =============
function loginPage() {
  const features = [
    { icon: 'clock', text: 'Track shifts and check in or out' },
    { icon: 'alertCircle', text: 'Request and manage leave of absence' },
    { icon: 'users', text: 'View your staff record and history' },
  ];

  const featureRows = features.map(f => `
    <div class="login-feature">
      <span class="login-feature-icon">${icon(f.icon)}</span>
      <span>${escapeHtml(f.text)}</span>
    </div>`).join('\n');

  const body = `
<div class="center-page">
  <div class="card stack shape-large" style="width:100%;max-width:420px;padding:var(--space-5)">
    <div style="text-align:center">
      <h1 class="headline-large">Axiom</h1>
      <p class="body-medium" style="color:var(--md-sys-color-on-surface-variant);margin-top:var(--space-1)">Staff and ERLC management tool</p>
      <p class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">
        Sign in with Discord to get started.
      </p>
    </div>

    <div class="login-features">
      ${featureRows}
    </div>

    <a class="btn btn-filled btn-full-width" href="/auth/login" style="gap:8px;margin-top:var(--space-2)">
      ${icon('check')}
      <span>Login with Discord</span>
    </a>

    <p class="body-small" style="text-align:center;color:var(--md-sys-color-outline);margin-top:var(--space-2)">
      By continuing, you agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
    </p>
  </div>
</div>`;
  return layout({ title: 'Login', body });
}

// ============= Documentation Page =============
function docsPage({ guild = null, guildId = null } = {}) {
  const backLink = guildId ? `<a href="/dashboard/${escapeHtml(guildId)}/staff" class="btn btn-text" style="gap:4px">${icon('chevronLeft')} Back</a>` : '';
  
  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Documentation</h1>
  ${backLink}
</header>

<div class="page stack">
  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:var(--space-2)">
    <!-- Getting Started -->
    <div class="card-high" style="padding:var(--space-3);cursor:pointer" onclick="showSection('getting-started')">
      <div class="body-large" style="font-weight:600;margin-bottom:8px;display:flex;gap:8px;align-items:center">
        ${icon('book')}
        Getting Started
      </div>
      <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin:0">Learn the basics of Axiom</p>
    </div>

    <!-- Shifts Guide -->
    <div class="card-high" style="padding:var(--space-3);cursor:pointer" onclick="showSection('shifts')">
      <div class="body-large" style="font-weight:600;margin-bottom:8px;display:flex;gap:8px;align-items:center">
        ${icon('clock')}
        Shift Management
      </div>
      <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin:0">Join, start, and manage shifts</p>
    </div>

    <!-- SSU Integration -->
    <div class="card-high" style="padding:var(--space-3);cursor:pointer" onclick="showSection('ssu')">
      <div class="body-large" style="font-weight:600;margin-bottom:8px;display:flex;gap:8px;align-items:center">
        ${icon('server')}
        Server Requirements
      </div>
      <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin:0">SSU integration and player requirements</p>
    </div>

    <!-- Account Verification -->
    <div class="card-high" style="padding:var(--space-3);cursor:pointer" onclick="showSection('verification')">
      <div class="body-large" style="font-weight:600;margin-bottom:8px;display:flex;gap:8px;align-items:center">
        ${icon('checkCircle')}
        Account Verification
      </div>
      <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin:0">Link your Roblox account</p>
    </div>

    <!-- Moderation -->
    <div class="card-high" style="padding:var(--space-3);cursor:pointer" onclick="showSection('moderation')">
      <div class="body-large" style="font-weight:600;margin-bottom:8px;display:flex;gap:8px;align-items:center">
        ${icon('shield')}
        Moderation
      </div>
      <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin:0">In-game and Discord moderation</p>
    </div>

    <!-- Admin Settings -->
    <div class="card-high" style="padding:var(--space-3);cursor:pointer" onclick="showSection('admin')">
      <div class="body-large" style="font-weight:600;margin-bottom:8px;display:flex;gap:8px;align-items:center">
        ${icon('settings')}
        Admin Settings
      </div>
      <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin:0">Configure Axiom for your server</p>
    </div>
  </div>

  <!-- Content Sections -->
  <div id="content" style="margin-top:var(--space-3)"></div>
</div>

<script>
const sections = {
  'getting-started': \`
    <div class="card-high" style="padding:var(--space-3)">
      <h2 class="headline-medium" style="margin-top:0">Getting Started</h2>
      <div class="body-medium" style="line-height:1.6;color:var(--md-sys-color-on-surface)">
        <h3 style="margin-top:var(--space-2);margin-bottom:8px;font-weight:600">What is Axiom?</h3>
        <p>Axiom is a Discord bot designed to manage staff shifts and in-game moderation for ERLC (Emergency Response: Liberty County) roleplay communities. It provides tools for scheduling, tracking attendance, and moderating player behavior.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Key Features</h3>
        <ul style="margin:8px 0;padding-left:20px">
          <li>Shift management with SSU integration</li>
          <li>Roblox account verification</li>
          <li>In-game moderation logging</li>
          <li>Attendance tracking</li>
          <li>Staff audit logs</li>
          <li>Discord integration</li>
        </ul>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Quick Navigation</h3>
        <p><strong>Dashboard Home:</strong> Click your server name to access the staff dashboard</p>
        <p><strong>Shifts:</strong> View and manage shifts from the Shifts tab</p>
        <p><strong>Account Setup:</strong> Use /erlc-link command in Discord to verify your Roblox account</p>
      </div>
    </div>
  \`,

  'shifts': \`
    <div class="card-high" style="padding:var(--space-3)">
      <h2 class="headline-medium" style="margin-top:0">Shift Management</h2>
      <div class="body-medium" style="line-height:1.6;color:var(--md-sys-color-on-surface)">
        <h3 style="margin-top:var(--space-2);margin-bottom:8px;font-weight:600">Joining a Shift</h3>
        <p>1. Go to the Shifts page from your dashboard</p>
        <p>2. Find the shift you want to join</p>
        <p>3. Click <strong>Join Shift</strong> (button will be disabled if server doesn't have 25+ players)</p>
        <p>4. You'll see the shift details page with controls</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Controlling Your Shift</h3>
        <p>Once you've joined a shift, you'll see four control buttons:</p>
        <ul style="margin:8px 0;padding-left:20px">
          <li><strong>Start:</strong> Begin your shift (updates shift status to 'Started')</li>
          <li><strong>Pause:</strong> Temporarily pause your shift (status becomes 'Paused')</li>
          <li><strong>Resume:</strong> Resume from paused state (back to 'Started')</li>
          <li><strong>End:</strong> Complete your shift (status becomes 'Ended')</li>
        </ul>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Check-In / Check-Out</h3>
        <p>Click <strong>Check In / Out</strong> to toggle your attendance status during active shifts. This helps track who was actually present during each shift.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Viewing Shift Members</h3>
        <p>The Members section shows all staff who joined the shift and their check-in status. Check-in status can be either:</p>
        <ul style="margin:8px 0;padding-left:20px">
          <li><strong>Checked in:</strong> Present during the shift</li>
          <li><strong>Not checked in:</strong> Joined but didn't check in</li>
        </ul>
      </div>
    </div>
  \`,

  'ssu': \`
    <div class="card-high" style="padding:var(--space-3)">
      <h2 class="headline-medium" style="margin-top:0">Server Requirements (SSU Integration)</h2>
      <div class="body-medium" style="line-height:1.6;color:var(--md-sys-color-on-surface)">
        <h3 style="margin-top:var(--space-2);margin-bottom:8px;font-weight:600">What is SSU?</h3>
        <p>SSU (Server Startup Unit) is a requirement that ensures shifts can only be joined when the ERLC server has officially started and has at least 25 players in-game. This prevents ghost shifts and ensures proper staffing coordination.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Why 25 Players?</h3>
        <p>25 players is the minimum threshold to ensure the server is properly running with meaningful activity. This prevents premature shift joins when the server is still warming up.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Joining When SSU Isn't Ready</h3>
        <p>If you try to join a shift but see <strong>'Server Not Ready'</strong> message, it means:</p>
        <ul style="margin:8px 0;padding-left:20px">
          <li>The ERLC server hasn't started yet, OR</li>
          <li>There aren't enough players in-game (fewer than 25)</li>
        </ul>
        <p>Simply wait until the server reaches 25 players, then refresh the page to try again.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Server Status Display</h3>
        <p>Each shift detail page shows live server status including:</p>
        <ul style="margin:8px 0;padding-left:20px">
          <li>Current player count</li>
          <li>Server status (Started/Not Started)</li>
          <li>Reason why shifts can't be joined (if applicable)</li>
        </ul>
      </div>
    </div>
  \`,

  'verification': \`
    <div class="card-high" style="padding:var(--space-3)">
      <h2 class="headline-medium" style="margin-top:0">Roblox Account Verification</h2>
      <div class="body-medium" style="line-height:1.6;color:var(--md-sys-color-on-surface)">
        <h3 style="margin-top:var(--space-2);margin-bottom:8px;font-weight:600">Why Verify?</h3>
        <p>Verifying your Roblox account links your Discord identity with your in-game account. This enables in-game moderation logging and staff tracking.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Verification Steps</h3>
        <p><strong>Step 1:</strong> Run <code style="background:var(--md-sys-color-surface-dim);padding:2px 6px;border-radius:4px">/erlc-link</code> in Discord</p>
        <p><strong>Step 2:</strong> Bot sends you a 12-word verification phrase</p>
        <p><strong>Step 3:</strong> Add the phrase to your Roblox bio/description</p>
        <p><strong>Step 4:</strong> Click <strong>Verify My Account</strong> button</p>
        <p><strong>Step 5:</strong> Enter your Roblox username when prompted</p>
        <p><strong>Step 6:</strong> Bot verifies the phrase is in your bio and confirms verification</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Regenerate Phrase</h3>
        <p>If the phrase contains censored words or you want a new one, click <strong>Regenerate Words</strong> to get a different 12-word phrase.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">After Verification</h3>
        <p>Once verified, your account is linked permanently. You can now:</p>
        <ul style="margin:8px 0;padding-left:20px">
          <li>Use in-game moderation commands</li>
          <li>Be tracked in moderation logs</li>
          <li>Receive mod permissions if you have Discord staff role</li>
        </ul>
      </div>
    </div>
  \`,

  'moderation': \`
    <div class="card-high" style="padding:var(--space-3)">
      <h2 class="headline-medium" style="margin-top:0">Moderation</h2>
      <div class="body-medium" style="line-height:1.6;color:var(--md-sys-color-on-surface)">
        <h3 style="margin-top:var(--space-2);margin-bottom:8px;font-weight:600">In-Game Moderation</h3>
        <p>If you have verified your Roblox account and have Discord staff role, you can issue moderation commands in-game:</p>
        <p style="background:var(--md-sys-color-surface-dim);padding:12px;border-radius:6px;font-family:monospace;margin:8px 0">
          ?moderate PlayerName violation reason
        </p>
        <p><strong>Example:</strong> <code style="background:var(--md-sys-color-surface-dim);padding:2px 6px;border-radius:4px">?moderate JohnDoe VDM Rammed officer</code></p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Discord Moderation</h3>
        <p>Alternatively, issue moderation commands directly in Discord using the same format:</p>
        <p style="background:var(--md-sys-color-surface-dim);padding:12px;border-radius:6px;font-family:monospace;margin:8px 0">
          ?moderate PlayerName violation reason
        </p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Violation Types</h3>
        <p>Common violations (case-insensitive, shorthand accepted):</p>
        <ul style="margin:8px 0;padding-left:20px;columns:2">
          <li>RDM - Random Death Match</li>
          <li>VDM - Vehicle Death Match</li>
          <li>FRP - Fail Roleplay</li>
          <li>PG - Powergaming</li>
          <li>MG - Metagaming</li>
          <li>Spam - Spam</li>
          <li>Disrespect - Disrespectful behavior</li>
          <li>Exploit - Exploit usage</li>
          <li>Glitch Abuse - Glitch abuse</li>
          <li>NVL - No Value of Life</li>
        </ul>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Moderation Logging</h3>
        <p>All moderation actions are logged to your server's moderation channel with:</p>
        <ul style="margin:8px 0;padding-left:20px">
          <li>Player avatar</li>
          <li>Staff member who issued the action</li>
          <li>Violation type</li>
          <li>Reason given</li>
          <li>Timestamp</li>
        </ul>
      </div>
    </div>
  \`,

  'admin': \`
    <div class="card-high" style="padding:var(--space-3)">
      <h2 class="headline-medium" style="margin-top:0">Admin Settings</h2>
      <div class="body-medium" style="line-height:1.6;color:var(--md-sys-color-on-surface)">
        <h3 style="margin-top:var(--space-2);margin-bottom:8px;font-weight:600">Accessing Settings</h3>
        <p>Only administrators can access the Settings page. Click the gear icon in the dashboard to configure Axiom.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">ERLC Configuration</h3>
        <p>To enable Axiom features, you need to configure your ERLC Private Server API key:</p>
        <p><strong>1.</strong> Go to Settings</p>
        <p><strong>2.</strong> Find 'ERLC Server Configuration' section</p>
        <p><strong>3.</strong> Enter your ERLC API key</p>
        <p><strong>4.</strong> Click 'Save API Key' (bot validates connection)</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Shift Type Management</h3>
        <p>Create custom shift types with duration limits:</p>
        <p><strong>1.</strong> Go to Settings</p>
        <p><strong>2.</strong> Find 'Shift Types' section</p>
        <p><strong>3.</strong> Enter shift type name (e.g., 'Patrol')</p>
        <p><strong>4.</strong> Set minimum and maximum duration in minutes</p>
        <p><strong>5.</strong> Click 'Add Shift Type'</p>
        <p>Admins can delete shift types with the delete button (must keep at least one)</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Custom Violations</h3>
        <p>Add custom violation types beyond the default 10 presets:</p>
        <p><strong>1.</strong> Go to Settings</p>
        <p><strong>2.</strong> Find 'Custom Violations' section</p>
        <p><strong>3.</strong> Enter violation name</p>
        <p><strong>4.</strong> Click 'Add Violation'</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Creating Shifts</h3>
        <p>Click 'Create Shift' button to schedule new shifts:</p>
        <p><strong>1.</strong> Enter shift name (e.g., 'Morning Patrol')</p>
        <p><strong>2.</strong> Select shift type</p>
        <p><strong>3.</strong> Set start and end times</p>
        <p><strong>4.</strong> Add optional description</p>
        <p><strong>5.</strong> Click 'Create Shift'</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:8px;font-weight:600">Audit Log</h3>
        <p>View all staff actions including infractions, promotions, and shift joins. Filter by type, user, or date range. Export to CSV for reporting.</p>
      </div>
    </div>
  \`
};

function showSection(sectionId) {
  const content = document.getElementById('content');
  content.innerHTML = sections[sectionId] || '<p>Section not found</p>';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show getting started by default
showSection('getting-started');
</script>`;

  return layout({ title: 'Documentation', body });
}

// ============= Guild List Page =============
function guildListPage({ guilds, username }) {
  const guildItems = guilds.map(g => {
    const iconUrl = g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${g.icon.startsWith('a_') ? 'gif' : 'png'}` : null;
    const icon_elem = iconUrl
      ? `<img class="guild-icon" src="${escapeHtml(iconUrl)}" alt="">`
      : `<div class="guild-icon-placeholder">${escapeHtml(g.name.slice(0, 1).toUpperCase())}</div>`;
    return `
    <a href="/dashboard/${escapeHtml(g.id)}/staff" class="guild-item">
      ${icon_elem}
      <div style="flex:1">
        <div class="body-large" style="font-weight:600">${escapeHtml(g.name)}</div>
        <div class="body-small" style="color:var(--md-sys-color-on-surface-variant)">View dashboard</div>
      </div>
      ${icon('chevronRight')}
    </a>`;
  }).join('\n');

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Axiom</h1>
  <div class="row">
    <span class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">${escapeHtml(username)}</span>
    <a class="btn btn-text" href="/auth/logout" style="gap:4px" title="Log out">
      ${icon('logOut')}
    </a>
  </div>
</header>
<div class="page stack">
  <h2 class="headline-medium">Your Servers</h2>
  <div class="server-grid">
    ${guildItems}
  </div>
</div>`;
  return layout({ title: 'Servers', body });
}

// ============= Staff Dashboard (Main Page) =============
function staffDashboard({ guild, user, shifts, activeLoa, isAdmin }) {
  const shiftCards = shifts.map(s => {
    const start = new Date(s.starts_at);
    const end = new Date(s.ends_at);
    const now = new Date();
    const isActive = start <= now && end > now;
    
    let status = 'Upcoming';
    let statusClass = 'badge-info';
    if (isActive) {
      status = 'Active';
      statusClass = 'badge-active';
    } else if (end < now) {
      status = 'Completed';
      statusClass = 'badge-inactive';
    }

    return `
    <div class="shift-card">
      <div class="shift-info">
        <div class="shift-name">${escapeHtml(s.name)}</div>
        <div class="shift-time">${icon('clock')} ${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div class="badge ${statusClass}">${status}</div>
      </div>
      <div class="shift-actions">
        <a href="/dashboard/${escapeHtml(guild.id)}/shift/${escapeHtml(s.id)}" class="btn btn-text">View</a>
      </div>
    </div>`;
  }).join('\n');

  const loaAlert = activeLoa ? `
    <div class="info-card" style="border-left:4px solid var(--md-sys-color-error)">
      <div style="display:flex;gap:var(--space-2);align-items:flex-start">
        ${icon('alertCircle')}
        <div>
          <div class="info-card-title">On Leave of Absence</div>
          <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:4px">
            Ends: ${formatDate(activeLoa.ends_at)}
            <div style="margin-top:4px">${escapeHtml(activeLoa.reason)}</div>
          </div>
        </div>
      </div>
    </div>` : '';

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">${escapeHtml(guild.name)}</h1>
  <div class="row">
    <a class="btn btn-text" href="/dashboard" style="gap:4px">
      ${icon('chevronLeft')}
      <span>Back</span>
    </a>
    <a class="btn btn-text" href="/auth/logout" style="gap:4px">
      ${icon('logOut')}
    </a>
  </div>
</header>
<div class="page stack">
  ${loaAlert}

  <div class="staff-section">
    <div class="staff-section-header">
      ${icon('clock')}
      <h2 class="staff-section-title">Your Shifts</h2>
    </div>
    ${shifts.length > 0 ? `<div style="display:flex;flex-direction:column;gap:var(--space-2)">${shiftCards}</div>` : '<div class="empty-state"><div class="empty-state-text">No shifts assigned</div></div>'}
  </div>

  <div class="staff-section">
    <div class="staff-section-header">
      ${icon('alertCircle')}
      <h2 class="staff-section-title">Leave of Absence</h2>
    </div>
    <a href="/dashboard/${escapeHtml(guild.id)}/loa" class="btn btn-tonal" style="gap:8px;align-self:flex-start">
      ${icon('check')}
      <span>${activeLoa ? 'Manage Leave' : 'Request Leave'}</span>
    </a>
  </div>

  <div class="staff-section">
    <div class="staff-section-header">
      ${icon('users')}
      <h2 class="staff-section-title">Your Profile</h2>
    </div>
    <div class="row" style="gap:var(--space-2)">
      <a href="/dashboard/${escapeHtml(guild.id)}/user/${escapeHtml(user.id)}" class="btn btn-tonal" style="gap:8px">
        ${icon('users')}
        <span>View My History</span>
      </a>
      <a href="/dashboard/${escapeHtml(guild.id)}/data-deletion" class="btn btn-outlined" style="gap:8px">
        ${icon('trash2')}
        <span>Delete My Data</span>
      </a>
    </div>
  </div>

  ${isAdmin ? `
  <div class="staff-section">
    <div class="staff-section-header">
      ${icon('check')}
      <h2 class="staff-section-title">Admin</h2>
    </div>
    <div class="row" style="gap:var(--space-2)">
      <a href="/dashboard/${escapeHtml(guild.id)}/shifts" class="btn btn-tonal" style="gap:8px">
        ${icon('clock')}
        <span>Manage Shifts</span>
      </a>
      <a href="/dashboard/${escapeHtml(guild.id)}" class="btn btn-tonal" style="gap:8px">
        ${icon('check')}
        <span>Server Settings</span>
      </a>
      <a href="/dashboard/${escapeHtml(guild.id)}/deletion-requests" class="btn btn-tonal" style="gap:8px">
        ${icon('trash2')}
        <span>Deletion Requests</span>
      </a>
    </div>
  </div>` : ''}
</div>`;
  return layout({ title: 'Dashboard', body });
}

// ============= Shift Details Page =============
function shiftDetailsPage({ guild, shift, members, isJoined, csrfToken, guildId, shiftId, ssuStatus = null, shiftStatus = 'pending' }) {
  const start = new Date(shift.starts_at);
  const end = new Date(shift.ends_at);
  const now = new Date();
  const isActive = start <= now && end > now;
  const durationMs = end - start;
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  // Status badge styling
  const statusBadgeClass = shiftStatus === 'started' ? 'badge-success' : 
                           shiftStatus === 'paused' ? 'badge-warning' : 
                           shiftStatus === 'ended' ? 'badge-info' : 'badge-info';
  const statusText = shiftStatus === 'started' ? 'Started' :
                     shiftStatus === 'paused' ? 'Paused' :
                     shiftStatus === 'ended' ? 'Ended' : 'Pending';

  // SSU status display
  const ssuDisplay = ssuStatus ? (ssuStatus.ready ? 
    `<div class="status-chip" style="background:var(--md-sys-color-on-background);color:var(--md-sys-color-background);font-size:12px;padding:4px 8px;border-radius:6px">
      ${icon('checkCircle')} <strong>${ssuStatus.playerCount}</strong> players in-game
    </div>` :
    `<div class="status-chip" style="background:var(--md-sys-color-error);color:var(--md-sys-color-on-error);font-size:12px;padding:4px 8px;border-radius:6px">
      ${icon('alertCircle')} ${escapeHtml(ssuStatus.reason || 'Server not ready')}
    </div>`) : '';

  // Join/Leave action
  const joinDisabled = ssuStatus && !ssuStatus.ready;
  const joinLeaveAction = isJoined ? `
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(shiftId)}/leave" style="margin:0">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <button class="btn btn-tonal" type="submit" style="gap:8px;background:var(--md-sys-color-error-container);color:var(--md-sys-color-on-error-container)">
        ${icon('logOut')}
        <span>Leave Shift</span>
      </button>
    </form>` : `
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(shiftId)}/join" style="margin:0">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <button class="btn btn-filled" type="submit" ${joinDisabled ? 'disabled' : ''} style="gap:8px">
        ${icon('plus')}
        <span>${joinDisabled ? 'Server Not Ready' : 'Join Shift'}</span>
      </button>
    </form>`;

  // Shift state controls (start/pause/resume/end)
  const stateControls = isJoined ? `
    <div class="shift-controls-menu" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);padding:var(--space-2);background:var(--md-sys-color-surface-dim);border-radius:8px">
      <button class="btn btn-tonal" onclick="updateShiftState('start')" style="gap:8px">
        ${icon('play')}
        <span>Start</span>
      </button>
      <button class="btn btn-tonal" onclick="updateShiftState('pause')" style="gap:8px">
        ${icon('pause')}
        <span>Pause</span>
      </button>
      <button class="btn btn-tonal" onclick="updateShiftState('resume')" style="gap:8px">
        ${icon('play')}
        <span>Resume</span>
      </button>
      <button class="btn btn-tonal" onclick="updateShiftState('end')" style="gap:8px">
        ${icon('square')}
        <span>End</span>
      </button>
    </div>` : '';

  // Member list with better formatting
  const memberItems = members.map(m => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2);background:var(--md-sys-color-surface);border-radius:6px;border:1px solid var(--md-sys-color-outline)">
      <div>
        <div class="body-medium" style="font-weight:500">User ${escapeHtml(m.user_id)}</div>
        <div class="body-small" style="color:var(--md-sys-color-on-surface-variant)">Joined ${formatDate(m.joined_at)}</div>
      </div>
      <span class="badge ${m.checked_in ? 'badge-success' : 'badge-warning'}" style="white-space:nowrap">
        ${m.checked_in ? 'Checked in' : 'Not checked in'}
      </span>
    </div>`).join('');

  const checkInLink = (isJoined && isActive) ? `
    <a href="/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(shiftId)}/check-in" class="btn btn-tonal" style="gap:8px;width:100%">
      ${icon('clock')}
      <span>Check In / Out</span>
    </a>` : '';

  const body = `
<header class="topbar">
  <div style="flex:1">
    <h1 class="title-large" style="margin:0;margin-bottom:4px">${escapeHtml(shift.name)}</h1>
    <div style="display:flex;gap:var(--space-2);align-items:center">
      <span class="badge ${statusBadgeClass}">${statusText}</span>
      ${isActive ? '<span class="badge badge-active">Active Now</span>' : ''}
    </div>
  </div>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>

<div class="page stack">
  <!-- Key Info Cards -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--space-2)">
    <div class="card-high" style="padding:var(--space-2)">
      <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-bottom:4px">Start Time</div>
      <div class="body-large" style="font-weight:500">${formatDate(shift.starts_at)}</div>
    </div>
    <div class="card-high" style="padding:var(--space-2)">
      <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-bottom:4px">End Time</div>
      <div class="body-large" style="font-weight:500">${formatDate(shift.ends_at)}</div>
    </div>
    <div class="card-high" style="padding:var(--space-2)">
      <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-bottom:4px">Duration</div>
      <div class="body-large" style="font-weight:500">${durationHours}h ${durationMins}m</div>
    </div>
    <div class="card-high" style="padding:var(--space-2)">
      <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-bottom:4px">Members</div>
      <div class="body-large" style="font-weight:500">${members.length}</div>
    </div>
  </div>

  <!-- Description -->
  ${shift.description ? `
  <div class="card-high" style="padding:var(--space-3)">
    <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-bottom:8px;text-transform:uppercase;font-weight:600">Notes</div>
    <p class="body-medium">${escapeHtml(shift.description)}</p>
  </div>` : ''}

  <!-- SSU Status -->
  ${ssuDisplay ? `
  <div class="card-high" style="padding:var(--space-2)">
    <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-bottom:8px">Server Status</div>
    ${ssuDisplay}
  </div>` : ''}

  <!-- Actions -->
  <div style="display:grid;grid-template-columns:1fr;gap:var(--space-2)">
    ${joinLeaveAction}
    ${checkInLink}
  </div>

  <!-- Shift State Controls -->
  ${stateControls}

  <!-- Members List -->
  <div class="card-high" style="padding:var(--space-3)">
    <div class="body-medium" style="font-weight:600;margin-bottom:var(--space-2);display:flex;gap:8px;align-items:center">
      ${icon('users')}
      Shift Members (${members.length})
    </div>
    ${members.length > 0 ? `
      <div style="display:grid;gap:var(--space-1)">
        ${memberItems}
      </div>` : '<div style="padding:var(--space-2);text-align:center;color:var(--md-sys-color-on-surface-variant)">No members yet</div>'}
  </div>
</div>

<script>
async function updateShiftState(action) {
  const csrf = '${escapeHtml(csrfToken)}';
  try {
    const res = await fetch('/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(shiftId)}/' + action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify({})
    });
    if (res.ok) {
      location.reload();
    } else {
      alert('Failed to update shift state');
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
}
</script>`;

  return layout({ title: 'Shift Details', body });
}

// ============= Create Shift Page (Admin) =============
function createShiftPage({ guild, csrfToken, guildId }) {
  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Create New Shift</h1>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guildId)}/shifts" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page stack">
  <div class="card-high stack" style="max-width:600px">
    <h2 class="headline-medium">Shift Details</h2>
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/create-shift" class="stack">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      
      <div class="field-group">
        <label for="shift-name">Shift Name</label>
        <input type="text" id="shift-name" name="name" required placeholder="e.g. Morning Patrol">
      </div>
      
      <div class="field-group">
        <label for="shift-desc">Description (optional)</label>
        <textarea id="shift-desc" name="description" placeholder="e.g. Focus on downtown area" style="min-height:80px;border:1px solid var(--md-sys-color-outline);border-radius:var(--md-sys-shape-corner-small);padding:var(--space-2);background:var(--md-sys-color-surface-container);color:var(--md-sys-color-on-surface);font-family:inherit;font-size:inherit"></textarea>
      </div>

      <div class="row" style="gap:var(--space-3)">
        <div class="field-group" style="flex:1">
          <label for="shift-start">Start Date/Time</label>
          <input type="datetime-local" id="shift-start" name="startsAt" required>
        </div>
        <div class="field-group" style="flex:1">
          <label for="shift-end">End Date/Time</label>
          <input type="datetime-local" id="shift-end" name="endsAt" required>
        </div>
      </div>

      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:8px">
        ${icon('plus')}
        <span>Create Shift</span>
      </button>
    </form>
  </div>
</div>`;
  return layout({ title: 'Create Shift', body });
}

// ============= Shifts List Page (Admin) =============
function shiftsListPage({ guild, shifts, csrfToken, guildId }) {
  const shiftItems = shifts.map(s => {
    const start = new Date(s.starts_at);
    const end = new Date(s.ends_at);
    const now = new Date();
    let status = 'Upcoming';
    if (start <= now && end > now) status = 'Active';
    if (end < now) status = 'Completed';

    return `
    <div class="shift-card">
      <div class="shift-info">
        <div class="shift-name">${escapeHtml(s.name)}</div>
        <div class="shift-time">${icon('clock')} ${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        ${s.description ? `<div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:4px">${escapeHtml(s.description)}</div>` : ''}
        <div class="badge badge-info" style="margin-top:8px">${status}</div>
      </div>
      <div class="shift-actions">
        <a href="/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(s.id)}" class="btn btn-text">Details</a>
        <form method="POST" action="/dashboard/${escapeHtml(guildId)}/delete-shift" style="margin:0">
          <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
          <input type="hidden" name="shiftId" value="${escapeHtml(s.id)}">
          <button class="btn btn-icon btn-danger" type="submit" title="Delete shift">
            ${icon('trash2')}
          </button>
        </form>
      </div>
    </div>`;
  }).join('\n');

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Manage Shifts</h1>
  <div class="row">
    <a href="/dashboard/${escapeHtml(guildId)}/staff" class="btn btn-text" style="gap:4px">
      ${icon('chevronLeft')} Back
    </a>
  </div>
</header>
<div class="page stack">
  <div style="display:flex;gap:var(--space-2);align-items:center">
    <h2 class="headline-medium" style="margin:0;flex:1">Shifts</h2>
    <a href="/dashboard/${escapeHtml(guildId)}/create-shift" class="btn btn-filled" style="gap:8px">
      ${icon('plus')}
      <span>New Shift</span>
    </a>
  </div>

  ${shifts.length > 0 ? `<div style="display:flex;flex-direction:column;gap:var(--space-2)">${shiftItems}</div>` : '<div class="empty-state"><div class="empty-state-text">No shifts yet. Create one to get started.</div></div>'}
</div>`;
  return layout({ title: 'Manage Shifts', body });
}

// ============= LOA Request Page (Staff) =============
function loaRequestPage({ guild, currentLoa, csrfToken, guildId, userId }) {
  if (currentLoa) {
    const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Leave of Absence</h1>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page stack">
  <div class="info-card" style="border-left:4px solid var(--md-sys-color-error)">
    <div class="info-card-header">
      <div class="info-card-title">Currently on Leave</div>
    </div>
    <div class="info-card-body">
      <div class="info-card-row">
        <span class="info-card-label">Reason</span>
        <span class="info-card-value">${escapeHtml(currentLoa.reason)}</span>
      </div>
      <div class="info-card-row">
        <span class="info-card-label">Ends</span>
        <span class="info-card-value">${formatDate(currentLoa.ends_at)}</span>
      </div>
    </div>
  </div>

  <form method="POST" action="/dashboard/${escapeHtml(guildId)}/end-loa" style="margin-top:var(--space-4)">
    <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
    <button class="btn btn-filled" type="submit" style="gap:8px">
      ${icon('checkCircle')}
      <span>End Leave of Absence</span>
    </button>
  </form>
</div>`;
    return layout({ title: 'Leave', body });
  }

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Request Leave of Absence</h1>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page stack">
  <div class="card-high stack" style="max-width:600px">
    <h2 class="headline-medium">Leave Details</h2>
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/start-loa" class="stack">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      
      <div class="field-group">
        <label for="loa-reason">Reason</label>
        <input type="text" id="loa-reason" name="reason" required placeholder="e.g. Personal leave, vacation, illness">
      </div>

      <div class="field-group">
        <label for="loa-end">Return Date</label>
        <input type="date" id="loa-end" name="endsAt" required>
      </div>

      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:8px">
        ${icon('check')}
        <span>Request Leave</span>
      </button>
    </form>
  </div>
</div>`;
  return layout({ title: 'Leave', body });
}

// ============= Check-in/Check-out Page (Staff) =============
function checkInPage({ guild, shift, userMember, csrfToken, guildId, shiftId }) {
  const start = new Date(shift.starts_at);
  const end = new Date(shift.ends_at);
  const now = new Date();
  const isActive = start <= now && end > now;

  if (!isActive) {
    const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">${escapeHtml(shift.name)}</h1>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page stack">
  <div class="info-card" style="border-left:4px solid var(--md-sys-color-error)">
    <div class="info-card-title">This shift is not active</div>
    <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:8px">
      Shifts can only have check-in active during the shift time window.
    </div>
  </div>
</div>`;
    return layout({ title: 'Check-in', body });
  }

  const checkedIn = userMember?.checked_in || false;
  const checkedInTime = userMember?.checked_in_at ? formatDate(userMember.checked_in_at) : null;
  const checkedOutTime = userMember?.checked_out_at ? formatDate(userMember.checked_out_at) : null;

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">${escapeHtml(shift.name)}</h1>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page stack">
  <div class="info-card">
    <div class="info-card-header">
      <div class="info-card-title">Shift Time</div>
      <span class="badge badge-active">Active Now</span>
    </div>
    <div class="info-card-body">
      <div class="info-card-row">
        <span class="info-card-label">Start</span>
        <span class="info-card-value">${formatDate(shift.starts_at)}</span>
      </div>
      <div class="info-card-row">
        <span class="info-card-label">End</span>
        <span class="info-card-value">${formatDate(shift.ends_at)}</span>
      </div>
    </div>
  </div>

  <div class="card-high stack">
    <h2 class="headline-medium">Check-in Status</h2>
    ${checkedIn ? `
      <div class="info-card" style="border-left:4px solid var(--md-sys-color-primary)">
        <div class="info-card-header">
          <div class="info-card-title">You are checked in</div>
          ${icon('checkCircle')}
        </div>
        <div class="info-card-body">
          <div class="info-card-row">
            <span class="info-card-label">Checked in at</span>
            <span class="info-card-value">${checkedInTime}</span>
          </div>
          ${checkedOutTime ? `
            <div class="info-card-row">
              <span class="info-card-label">Checked out at</span>
              <span class="info-card-value">${checkedOutTime}</span>
            </div>` : ''}
        </div>
      </div>
      ${!checkedOutTime ? `
        <form method="POST" action="/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(shiftId)}/check-out" style="margin-top:var(--space-3)">
          <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
          <button class="btn btn-filled btn-danger" type="submit" style="gap:8px">
            ${icon('check')}
            <span>Check Out</span>
          </button>
        </form>` : '<div class="body-small" style="color:var(--md-sys-color-on-surface-variant)">Shift checkout already recorded.</div>'}
    ` : `
      <form method="POST" action="/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(shiftId)}/check-in" style="margin:0">
        <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
        <button class="btn btn-filled" type="submit" style="gap:8px;width:100%">
          ${icon('checkCircle')}
          <span>Check In Now</span>
        </button>
      </form>
    `}
  </div>
</div>`;
  return layout({ title: 'Check-in', body });
}

// ============= User Profile Page =============
function userProfilePage({ guild, userInfo, username, csrfToken, guildId, isAdmin }) {
  const { userId, infractions, activeLoa, promotions, currentShifts } = userInfo;
  
  const firstLetter = username[0].toUpperCase();
  
  const infractionItems = infractions.slice(0, 10).map(inf => `
    <div class="user-item">
      <div class="user-item-main">
        <div class="user-item-label">${escapeHtml(inf.type)} (${escapeHtml(inf.points)} pts)</div>
        <div class="user-item-meta">By ${escapeHtml(inf.issued_by)} - ${formatDate(inf.created_at)}</div>
        <div class="user-item-meta">${escapeHtml(inf.reason)}</div>
      </div>
    </div>`).join('\n');

  const promotionItems = promotions.slice(0, 5).map(p => `
    <div class="user-item">
      <div class="user-item-main">
        <div class="user-item-label">${escapeHtml(p.from_rank || 'Unranked')} ${icon('chevronRight')} ${escapeHtml(p.to_rank)}</div>
        <div class="user-item-meta">By ${escapeHtml(p.issued_by)} - ${formatDate(p.created_at)}</div>
      </div>
    </div>`).join('\n');

  const shiftItems = currentShifts.slice(0, 5).map(s => `
    <div class="user-item">
      <div class="user-item-main">
        <div class="user-item-label">${escapeHtml(s.name)}</div>
        <div class="user-item-meta">${formatDate(s.starts_at)} - ${formatDate(s.ends_at)}</div>
      </div>
    </div>`).join('\n');

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">${escapeHtml(guild.name)}</h1>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page stack">
  <div class="user-panel">
    <div class="user-header">
      <div class="user-avatar">${firstLetter}</div>
      <div class="user-details">
        <div class="user-name">${escapeHtml(username)}</div>
        <div class="user-id">ID: ${escapeHtml(userId)}</div>
      </div>
    </div>

    ${activeLoa ? `
      <div class="user-section">
        <div class="user-section-title" style="color:var(--md-sys-color-error)">On Leave of Absence</div>
        <div class="user-item">
          <div class="user-item-main">
            <div class="user-item-label">Ends: ${formatDate(activeLoa.ends_at)}</div>
            <div class="user-item-meta">${escapeHtml(activeLoa.reason)}</div>
          </div>
        </div>
      </div>` : ''}

    ${promotions.length > 0 ? `
      <div class="user-section">
        <div class="user-section-title">Promotions (${promotions.length})</div>
        <div class="user-section-list">
          ${promotionItems}
        </div>
      </div>` : ''}

    ${infractions.length > 0 ? `
      <div class="user-section">
        <div class="user-section-title">Infractions (${infractions.length})</div>
        <div class="user-section-list">
          ${infractionItems}
        </div>
      </div>` : ''}

    ${currentShifts.length > 0 ? `
      <div class="user-section">
        <div class="user-section-title">Assigned Shifts (${currentShifts.length})</div>
        <div class="user-section-list">
          ${shiftItems}
        </div>
      </div>` : ''}
  </div>
</div>`;
  return layout({ title: 'User Profile', body });
}

// ============= Settings Page (Admin) =============
function settingsPage({ guild, roles, textChannels, categoryChannels, scalars, ranks, infractionTypes, ticketCategories, shiftTypes, moderationPresets, customViolations, csrfToken, guildId, flash }) {
  const roleOptionsFor = (selectedId) => roles
    .map(r => `<option value="${escapeHtml(r.id)}" ${selectedId === r.id ? 'selected' : ''}>${escapeHtml(r.name)}</option>`)
    .join('\n');

  // Three real scalar roles (matches SCALAR_KEYS in utils/guildConfig.js
  // and the field names the POST /roles handler actually reads).
  const scalarRoleFields = [
    { key: 'staffManageRoleId', label: 'Staff Manage Role' },
    { key: 'ticketStaffRoleId', label: 'Ticket Staff Role' },
    { key: 'sessionPingRoleId', label: 'Session Ping Role' },
  ].map(f => `
    <div class="field-group">
      <label for="${f.key}">${f.label}</label>
      <select id="${f.key}" name="${f.key}">
        <option value="">None</option>
        ${roleOptionsFor(scalars[f.key])}
      </select>
    </div>`).join('\n');

  const logChannelOptions = textChannels
    .map(c => `<option value="${escapeHtml(c.id)}" ${scalars.logChannelId === c.id ? 'selected' : ''}>#${escapeHtml(c.name)}</option>`)
    .join('\n');
  const ticketCategoryOptions = categoryChannels
    .map(c => `<option value="${escapeHtml(c.id)}" ${scalars.ticketCategoryId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`)
    .join('\n');

  const rankRows = ranks.map(r => `
    <div class="list-row">
      <span class="body-medium">
        <strong>${escapeHtml(r.name)}</strong>
        <span class="chip" style="margin-left:8px">Level ${escapeHtml(r.level)}</span>
      </span>
      <form method="POST" action="/dashboard/${escapeHtml(guildId)}/remove-rank" style="margin:0">
        <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
        <input type="hidden" name="name" value="${escapeHtml(r.name)}">
        <button class="btn btn-icon btn-danger" type="submit" title="Remove rank">
          ${icon('trash2')}
        </button>
      </form>
    </div>`).join('\n');

  const infractionTypeRows = infractionTypes.map(t => `
    <div class="list-row">
      <span class="body-medium">
        <strong>${escapeHtml(t.name)}</strong>
        <span class="chip" style="margin-left:8px">${escapeHtml(t.points)} pts</span>
      </span>
      <form method="POST" action="/dashboard/${escapeHtml(guildId)}/remove-infraction-type" style="margin:0">
        <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
        <input type="hidden" name="name" value="${escapeHtml(t.name)}">
        <button class="btn btn-icon btn-danger" type="submit" title="Remove infraction type">
          ${icon('trash2')}
        </button>
      </form>
    </div>`).join('\n');

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">${escapeHtml(guild.name)} Settings</h1>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page stack">
  ${flash ? `<div class="flash flash-${escapeHtml(flash.type)}">${escapeHtml(flash.message)}</div>` : ''}

  <div class="card-high stack">
    <h2 class="headline-medium">Roles</h2>
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/roles" class="stack">
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
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/channels" class="stack">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <div class="field-group">
        <label for="logChannelId">Log Channel</label>
        <select id="logChannelId" name="logChannelId">
          <option value="">None</option>
          ${logChannelOptions}
        </select>
      </div>
      <div class="field-group">
        <label for="ticketCategoryId">Ticket Category</label>
        <select id="ticketCategoryId" name="ticketCategoryId">
          <option value="">None</option>
          ${ticketCategoryOptions}
        </select>
      </div>
      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:8px">
        ${icon('check')}
        <span>Save channels</span>
      </button>
    </form>
  </div>

  <div class="card-high stack">
    <h2 class="headline-medium">Ranks</h2>
    ${rankRows ? `<div>${rankRows}</div>` : '<p class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">No ranks configured yet.</p>'}
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/add-rank" class="stack" style="margin-top:var(--space-3)">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <div class="row" style="gap:var(--space-2);align-items:flex-end">
        <div class="field-group" style="flex:1;margin-bottom:0">
          <label for="rank-name">Name</label>
          <input type="text" id="rank-name" name="name" required placeholder="e.g. Sergeant">
        </div>
        <div class="field-group" style="flex:1;margin-bottom:0">
          <label for="rank-role">Role</label>
          <select id="rank-role" name="roleId" required>
            ${roleOptionsFor(null)}
          </select>
        </div>
        <div class="field-group" style="width:100px;margin-bottom:0">
          <label for="rank-level">Level</label>
          <input type="text" id="rank-level" name="level" required placeholder="1" inputmode="numeric" pattern="[0-9]+">
        </div>
        <button class="btn btn-filled" type="submit" style="gap:8px;height:48px">
          ${icon('plus')}
          <span>Add</span>
        </button>
      </div>
    </form>
  </div>

  <div class="card-high stack">
    <h2 class="headline-medium">Infraction Types</h2>
    ${infractionTypeRows ? `<div>${infractionTypeRows}</div>` : '<p class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">No infraction types configured yet.</p>'}
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/add-infraction-type" class="stack" style="margin-top:var(--space-3)">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <div class="row" style="gap:var(--space-2);align-items:flex-end">
        <div class="field-group" style="flex:1;margin-bottom:0">
          <label for="infraction-name">Name</label>
          <input type="text" id="infraction-name" name="name" required placeholder="e.g. Minor RDM">
        </div>
        <div class="field-group" style="width:100px;margin-bottom:0">
          <label for="infraction-points">Points</label>
          <input type="text" id="infraction-points" name="points" required placeholder="1" inputmode="numeric" pattern="[0-9]+">
        </div>
        <button class="btn btn-filled" type="submit" style="gap:8px;height:48px">
          ${icon('plus')}
          <span>Add</span>
        </button>
      </div>
    </form>
  </div>

  <div class="card-high stack">
    <h2 class="headline-medium">Ticket Categories</h2>
    <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:-var(--space-1)">These categories appear in the ticket creation dropdown when members open a support ticket.</p>
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/post-ticket-panel" class="stack" style="margin-top:var(--space-2)">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <div class="field-group">
        <label for="ticket-channel">Post Panel To</label>
        <select id="ticket-channel" name="channelId" required>
          <option value="">Select a channel...</option>
          ${textChannels.map(c => `<option value="${escapeHtml(c.id)}">#${escapeHtml(c.name)}</option>`).join('\n')}
        </select>
      </div>
      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:8px">
        ${icon('check')}
        <span>Post Ticket Panel</span>
      </button>
    </form>
  </div>

  <div class="card-high stack">
    <h2 class="headline-medium">Shift Types</h2>
    <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:-var(--space-1)">Configure shift types and their duration limits (in minutes).</p>
    
    <div style="display:grid;gap:var(--space-2);margin-top:var(--space-2)">
      ${shiftTypes.map((type, idx) => `
        <div style="display:grid;grid-template-columns:1fr 80px 80px auto;gap:var(--space-2);align-items:flex-end;padding:var(--space-2);background:var(--md-sys-color-surface-dim);border-radius:8px">
          <div class="field-group" style="margin-bottom:0">
            <label>Type</label>
            <input type="text" value="${escapeHtml(type.label)}" disabled style="opacity:0.7">
          </div>
          <div class="field-group" style="margin-bottom:0">
            <label>Min (min)</label>
            <input type="text" value="${Math.round(type.minDuration / 60)}" disabled style="opacity:0.7">
          </div>
          <div class="field-group" style="margin-bottom:0">
            <label>Max (min)</label>
            <input type="text" value="${Math.round(type.maxDuration / 60)}" disabled style="opacity:0.7">
          </div>
          <form method="POST" action="/dashboard/${escapeHtml(guildId)}/remove-shift-type" style="margin:0">
            <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
            <input type="hidden" name="shiftTypeId" value="${escapeHtml(type.id)}">
            <button class="btn btn-icon btn-danger" type="submit" title="Delete shift type">
              ${icon('trash2')}
            </button>
          </form>
        </div>
      `).join('')}
    </div>

    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/add-shift-type" class="stack" style="margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--md-sys-color-outline)">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <h3 class="title-small">Add New Shift Type</h3>
      <div class="row" style="gap:var(--space-2);align-items:flex-end">
        <div class="field-group" style="flex:1;min-width:150px">
          <label for="new-shift-name">Name</label>
          <input id="new-shift-name" type="text" name="label" placeholder="e.g. Support" required>
        </div>
        <div class="field-group" style="min-width:100px">
          <label for="new-shift-min">Min (minutes)</label>
          <input id="new-shift-min" type="number" name="minDuration" placeholder="15" min="1" required>
        </div>
        <div class="field-group" style="min-width:100px">
          <label for="new-shift-max">Max (minutes)</label>
          <input id="new-shift-max" type="number" name="maxDuration" placeholder="120" min="1" required>
        </div>
        <button class="btn btn-filled" type="submit" style="gap:8px;align-self:flex-start">
          ${icon('plus')}
          <span>Add Type</span>
        </button>
      </div>
    </form>
  </div>

  <div class="card-high stack">
    <h2 class="headline-medium">${icon('zap')} ERLC Server Configuration</h2>
    <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:-var(--space-1)">Configure your ERLC Private Server API key for shift syncing and player data.</p>
    
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/set-erlc-api-key" class="stack" style="margin-top:var(--space-2)">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <div class="field-group">
        <label for="erlc-api-key">API Key</label>
        <input id="erlc-api-key" type="password" name="apiKey" placeholder="Paste your ERLC API key here" required>
        <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:var(--space-1)">Get your API key from the ERLC dashboard. Keep it secret.</p>
      </div>
      <div class="row" style="gap:var(--space-2);align-items:center">
        <button class="btn btn-filled" type="submit" style="gap:8px;align-self:flex-start">
          ${icon('check')}
          <span>Save API Key</span>
        </button>
      </div>
    </form>

    <div style="margin-top:var(--space-3);padding:var(--space-2);background:var(--md-sys-color-surface-dim);border-radius:8px;border-left:4px solid var(--md-sys-color-outline)">
      <p class="body-small"><strong>What this enables:</strong></p>
      <ul style="margin:var(--space-1) 0;padding-left:var(--space-3);list-style:disc;color:var(--md-sys-color-on-surface-variant)">
        <li class="body-small">Live player list with /erlc-players command</li>
        <li class="body-small">Shift syncing to in-game teams</li>
        <li class="body-small">Real-time moderation monitoring</li>
        <li class="body-small">Server status and team management</li>
      </ul>
    </div>
  </div>

  <div class="card-high stack">
    <h2 class="headline-medium">${icon('shield')} Moderation Violations</h2>
    <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:-var(--space-1)">Preset violations staff can use in-game. Add custom types for your server.</p>
    
    <div style="margin-top:var(--space-2)">
      <h3 class="title-small">Default Presets</h3>
      <div style="display:grid;gap:var(--space-1);margin-top:var(--space-2)">
        ${moderationPresets.map(preset => `
        <div style="padding:var(--space-2);background:var(--md-sys-color-surface-dim);border-radius:8px">
          <p class="label-large"><strong>${escapeHtml(preset.label)}</strong></p>
          <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:var(--space-1)">Codes: ${escapeHtml(preset.shortCodes.join(', '))}</p>
          <p class="body-small" style="color:var(--md-sys-color-on-surface-variant)">${escapeHtml(preset.description)}</p>
        </div>
        `).join('')}
      </div>
    </div>

    ${customViolations.length > 0 ? `
    <div style="margin-top:var(--space-3)">
      <h3 class="title-small">Custom Violations</h3>
      <div style="display:grid;gap:var(--space-1);margin-top:var(--space-2)">
        ${customViolations.map(custom => `
        <div style="padding:var(--space-2);background:var(--md-sys-color-secondary-container);border-radius:8px">
          <p class="label-large"><strong>${escapeHtml(custom.label)}</strong></p>
          <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:var(--space-1)">Codes: ${escapeHtml((custom.shortCodes || []).join(', '))}</p>
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/add-custom-violation" class="stack" style="margin-top:var(--space-3)">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <h3 class="title-small">Add Custom Violation</h3>
      <div class="field-group">
        <label for="violation-label">Label</label>
        <input id="violation-label" type="text" name="label" placeholder="e.g., Excessive Honking" required>
      </div>
      <div class="field-group">
        <label for="violation-codes">Short Codes (comma-separated)</label>
        <input id="violation-codes" type="text" name="codes" placeholder="e.g., honk, honking, excessive-honk" required>
      </div>
      <div class="field-group">
        <label for="violation-desc">Description</label>
        <input id="violation-desc" type="text" name="description" placeholder="What this violation is for" required>
      </div>
      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:8px">
        ${icon('plus')}
        <span>Add Violation Type</span>
      </button>
    </form>
  </div>
</div>`;
  return layout({ title: 'Settings', body });
}

// ============= Data Deletion Request (Staff) =============
function dataDeletionPage({ guild, guildId, latestRequest, csrfToken }) {
  const status = latestRequest?.status;

  if (status === 'pending') {
    const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Data Deletion Request</h1>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page">
  <div class="legal-doc">
    <div class="info-card">
      <div class="info-card-header">
        <div class="info-card-title">Request Pending</div>
        ${icon('clock')}
      </div>
      <div class="info-card-body">
        <p class="body-medium" style="color:var(--md-sys-color-on-surface-variant);margin:0">
          Your data deletion request was submitted on ${formatDate(latestRequest.requested_at)} and is waiting for a staff member with the Staff Manage role to process it. You will see an update here once it has been handled.
        </p>
      </div>
    </div>
  </div>
</div>`;
    return layout({ title: 'Data Deletion', body });
  }

  if (status === 'completed') {
    const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Data Deletion Request</h1>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page">
  <div class="legal-doc">
    <div class="info-card">
      <div class="info-card-header">
        <div class="info-card-title">Completed</div>
        ${icon('checkCircle')}
      </div>
      <div class="info-card-body">
        <p class="body-medium" style="color:var(--md-sys-color-on-surface-variant);margin:0">
          Your shift history and leave of absence records were deleted on ${formatDate(latestRequest.handled_at)}. Infractions and promotions are kept as part of the server's staff record and are not affected by this.
        </p>
      </div>
    </div>
    <a href="/dashboard/${escapeHtml(guildId)}/data-deletion?new=1" class="btn btn-text" style="margin-top:var(--space-3)">Submit another request</a>
  </div>
</div>`;
    return layout({ title: 'Data Deletion', body });
  }

  const deniedNotice = status === 'denied' ? `
    <div class="info-card" style="border-left:4px solid var(--md-sys-color-error);margin-bottom:var(--space-3)">
      <div class="info-card-title">Previous Request Denied</div>
      <p class="body-medium" style="color:var(--md-sys-color-on-surface-variant);margin-top:4px">
        Your last request, submitted ${formatDate(latestRequest.requested_at)}, was reviewed and denied. You can submit a new one below.
      </p>
    </div>` : '';

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Data Deletion Request</h1>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page">
  <div class="legal-doc">
    ${deniedNotice}
    <p class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">
      This will delete your shift assignment history, check-in and check-out records, and leave of absence history from this server. It will not delete infractions or promotions, which are kept as the server's staff accountability record. See the <a href="/privacy">Privacy Policy</a> for details.
    </p>

    <div class="card-high stack" style="margin-top:var(--space-3)">
      <form method="POST" action="/dashboard/${escapeHtml(guildId)}/request-deletion" class="stack">
        <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
        <div class="field-group">
          <label for="deletion-reason">Reason (optional)</label>
          <input type="text" id="deletion-reason" name="reason" placeholder="e.g. Leaving the server">
        </div>
        <button class="btn btn-danger" type="submit" style="align-self:flex-start;gap:8px">
          ${icon('trash2')}
          <span>Request Deletion</span>
        </button>
      </form>
    </div>
  </div>
</div>`;
  return layout({ title: 'Data Deletion', body });
}

// ============= Data Deletion Requests Queue (Admin) =============
function inGameModerationPage({ guild, guildId, moderations, presets, searchPlayerId = null }) {
  const filtered = searchPlayerId 
    ? moderations.filter(m => m.player_id === searchPlayerId || m.player_name.toLowerCase().includes(searchPlayerId.toLowerCase()))
    : moderations;

  const body = `
<div class="staff-content">
  <div class="stack" style="gap:var(--space-4)">
    <h1 class="title-large">${icon('shield')} In-Game Moderations</h1>
    
    <div class="card-high">
      <div class="field-group">
        <label>Search Player</label>
        <input type="text" placeholder="Player ID or name..." onkeyup="location.href = '/dashboard/${escapeHtml(guildId)}/moderations?search=' + this.value" style="width:100%">
      </div>
    </div>

    ${filtered.length === 0 
      ? '<p class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">No moderation records found.</p>'
      : `<div class="stack" style="gap:var(--space-2)">
        ${filtered.slice(0, 50).map(mod => {
          const preset = presets.find(p => p.id === mod.preset_id);
          return `
        <div style="padding:var(--space-3);background:var(--md-sys-color-surface-dim);border-radius:8px;border-left:4px solid ${
          mod.severity === 'severe' ? 'var(--md-sys-color-error)' :
          mod.severity === 'medium' ? 'var(--md-sys-color-tertiary)' :
          'var(--md-sys-color-outline)'
        }">
          <div class="row" style="gap:var(--space-2);align-items:flex-start;justify-content:space-between">
            <div style="flex:1">
              <p class="label-large"><strong>${escapeHtml(mod.player_name)}</strong> (${escapeHtml(mod.player_id)})</p>
              <p class="body-medium" style="margin-top:var(--space-1)"><strong>${preset?.label || mod.preset_id}</strong> • ${mod.severity}</p>
              ${mod.notes ? `<p class="body-small" style="margin-top:var(--space-1);color:var(--md-sys-color-on-surface-variant)">${escapeHtml(mod.notes)}</p>` : ''}
              <p class="body-small" style="margin-top:var(--space-1);color:var(--md-sys-color-on-surface-variant)">${new Date(mod.logged_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
          `;
        }).join('')}
      </div>`
    }
  </div>
</div>`;
  return layout({ title: 'In-Game Moderations', body });
}

// ============= Audit Log Dashboard (Staff) =============
function auditLogPage({ guild, guildId, infractions, promotions, shifts, csrfToken, filter = {} }) {
  const filterUser = filter.userId || '';
  const filterType = filter.type || 'all';
  const filterDateFrom = filter.dateFrom || '';
  const filterDateTo = filter.dateTo || '';

  const formatDate = (date) => new Date(date).toLocaleString();
  const formatType = (action) => {
    const types = {
      infraction: 'Infraction',
      promotion: 'Promotion',
      demotion: 'Demotion',
      shift_join: 'Shift Join',
      shift_leave: 'Shift Leave',
    };
    return types[action] || action;
  };

  // Combine all events
  const events = [];
  
  infractions.forEach(inf => {
    events.push({
      type: 'infraction',
      timestamp: new Date(inf.created_at),
      user: inf.user_id,
      staff: inf.issued_by,
      details: `${inf.violation} - ${inf.reason || 'No reason'}`,
      action: inf.violation,
    });
  });

  promotions.forEach(promo => {
    events.push({
      type: promo.demoted_at ? 'demotion' : 'promotion',
      timestamp: new Date(promo.demoted_at || promo.promoted_at),
      user: promo.user_id,
      staff: promo.promoted_by,
      details: `${promo.rank_name || 'Unknown rank'}`,
      action: promo.demoted_at ? 'Demotion' : 'Promotion',
    });
  });

  shifts.forEach(shift => {
    shift.members?.forEach(member => {
      events.push({
        type: 'shift_join',
        timestamp: new Date(member.joined_at),
        user: member.user_id,
        staff: null,
        details: `${shift.name || 'Unknown shift'}`,
        action: 'Shift Join',
      });
    });
  });

  // Sort by date descending
  events.sort((a, b) => b.timestamp - a.timestamp);

  // Filter events
  let filtered = events;
  if (filterType !== 'all') {
    filtered = filtered.filter(e => e.type === filterType);
  }
  if (filterUser) {
    filtered = filtered.filter(e => e.user === filterUser);
  }
  if (filterDateFrom) {
    const from = new Date(filterDateFrom);
    filtered = filtered.filter(e => e.timestamp >= from);
  }
  if (filterDateTo) {
    const to = new Date(filterDateTo);
    to.setHours(23, 59, 59, 999);
    filtered = filtered.filter(e => e.timestamp <= to);
  }

  const csvData = filtered.map(e => {
    const parts = [
      formatDate(e.timestamp),
      e.type,
      e.user,
      e.staff || 'N/A',
      e.action
    ];
    return '"' + parts.join('","') + '"';
  }).join('\n');

  const eventRows = filtered.length === 0 
    ? '<p class="body-medium">No events found.</p>'
    : filtered.map(e => {
      const staffLine = e.staff ? '<p class="body-small" style="color:var(--md-sys-color-on-surface-variant)">By: ' + escapeHtml(e.staff) + '</p>' : '';
      return '<div style="padding:var(--space-2);background:var(--md-sys-color-surface-dim);border-radius:8px;border-left:4px solid var(--md-sys-color-primary)">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-1)">' +
          '<div>' +
            '<span class="badge badge-info">' + escapeHtml(formatType(e.type)) + '</span>' +
            '<span style="margin-left:var(--space-1);color:var(--md-sys-color-on-surface-variant);font-size:12px">' + formatDate(e.timestamp) + '</span>' +
          '</div>' +
          '<span class="body-small" style="color:var(--md-sys-color-on-surface-variant)">User: ' + escapeHtml(e.user) + '</span>' +
        '</div>' +
        '<p class="body-medium" style="margin:var(--space-1) 0">' +
          '<strong>' + escapeHtml(e.action) + '</strong>: ' + escapeHtml(e.details) +
        '</p>' +
        staffLine +
        '</div>';
    }).join('');

  const content = '<div style="display:flex;gap:var(--space-3);align-items:flex-start;margin-bottom:var(--space-3)">' +
    '<h1 class="display-small">Audit Log</h1>' +
    '<div style="flex:1"></div>' +
    '<form method="GET" style="display:flex;gap:var(--space-1);align-items:flex-end">' +
      '<div class="field-group" style="margin-bottom:0;min-width:120px">' +
        '<label for="filter-type">Type</label>' +
        '<select id="filter-type" name="type" onchange="this.form.submit()">' +
          '<option value="all"' + (filterType === 'all' ? ' selected' : '') + '>All</option>' +
          '<option value="infraction"' + (filterType === 'infraction' ? ' selected' : '') + '>Infractions</option>' +
          '<option value="promotion"' + (filterType === 'promotion' ? ' selected' : '') + '>Promotions</option>' +
          '<option value="demotion"' + (filterType === 'demotion' ? ' selected' : '') + '>Demotions</option>' +
          '<option value="shift_join"' + (filterType === 'shift_join' ? ' selected' : '') + '>Shifts</option>' +
        '</select>' +
      '</div>' +
      '<div class="field-group" style="margin-bottom:0;min-width:100px">' +
        '<label for="filter-user">User ID</label>' +
        '<input id="filter-user" type="text" name="userId" value="' + escapeHtml(filterUser) + '" placeholder="User ID">' +
      '</div>' +
      '<button class="btn btn-filled" type="submit" style="gap:8px;align-self:flex-start">' +
        icon('search') + '<span>Filter</span>' +
      '</button>' +
      '<button class="btn btn-outlined" type="button" onclick="downloadCSV()" style="gap:8px;align-self:flex-start">' +
        icon('download') + '<span>Export</span>' +
      '</button>' +
    '</form>' +
    '</div>' +
    '<div class="card-high stack">' +
      '<p class="body-small" style="color:var(--md-sys-color-on-surface-variant)">' +
        'Showing ' + filtered.length + ' of ' + events.length + ' events' +
      '</p>' +
      '<div style="display:grid;gap:var(--space-1);margin-top:var(--space-2)">' +
        eventRows +
      '</div>' +
    '</div>' +
    '<textarea id="csv-data" style="display:none">' + escapeHtml(csvData) + '</textarea>' +
    '<script>' +
      'function downloadCSV() {' +
        'const data = document.getElementById("csv-data").value;' +
        'const blob = new Blob([data], { type: "text/csv" });' +
        'const url = URL.createObjectURL(blob);' +
        'const link = document.createElement("a");' +
        'link.href = url;' +
        'link.download = "audit-log-" + new Date().toISOString().split("T")[0] + ".csv";' +
        'link.click();' +
        'URL.revokeObjectURL(url);' +
      '}' +
    '</script>';

  return page(guild, {
    title: 'Audit Log',
    activeSection: 'audit',
    content: content,
  });
}

// ============= Data Deletion Requests Queue (Admin) =============
function deletionRequestsListPage({ guild, guildId, requests, csrfToken }) {
  const rows = requests.map(r => `
    <div class="info-card">
      <div class="info-card-header">
        <div class="info-card-title">User ${escapeHtml(r.user_id)}</div>
        <span class="badge badge-warning">Pending</span>
      </div>
      <div class="info-card-body">
        <div class="info-card-row">
          <span class="info-card-label">Requested</span>
          <span class="info-card-value">${formatDate(r.requested_at)}</span>
        </div>
        ${r.reason ? `
        <div class="info-card-row" style="flex-direction:column;align-items:flex-start">
          <span class="info-card-label">Reason</span>
          <span class="info-card-value">${escapeHtml(r.reason)}</span>
        </div>` : ''}
      </div>
      <div class="row" style="gap:var(--space-2);margin-top:var(--space-2)">
        <form method="POST" action="/dashboard/${escapeHtml(guildId)}/deletion-requests/${escapeHtml(r.id)}/complete" style="margin:0">
          <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
          <button class="btn btn-filled" type="submit" style="gap:8px">
            ${icon('trash2')}
            <span>Delete Data</span>
          </button>
        </form>
        <form method="POST" action="/dashboard/${escapeHtml(guildId)}/deletion-requests/${escapeHtml(r.id)}/deny" style="margin:0">
          <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
          <button class="btn btn-outlined" type="submit">Deny</button>
        </form>
      </div>
    </div>`).join('\n');

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Data Deletion Requests</h1>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page stack">
  <p class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">
    Completing a request permanently deletes that user's shift history and leave of absence records. Infractions and promotions are never affected.
  </p>
  ${requests.length > 0 ? rows : '<div class="empty-state"><div class="empty-state-text">No pending requests</div></div>'}
</div>`;
  return layout({ title: 'Data Deletion Requests', body });
}

module.exports = {
  loginPage,
  docsPage,
  guildListPage,
  staffDashboard,
  shiftDetailsPage,
  createShiftPage,
  shiftsListPage,
  loaRequestPage,
  checkInPage,
  userProfilePage,
  settingsPage,
  auditLogPage,
  privacyPolicyPage,
  termsOfServicePage,
  dataDeletionPage,
  deletionRequestsListPage,
  inGameModerationPage,
};

// ============= Privacy Policy =============
function privacyPolicyPage() {
  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Privacy Policy</h1>
  <a class="btn btn-text" href="/" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page">
  <div class="legal-doc">
    <div class="legal-updated">Last updated: September 2026</div>

    <h2>What This Covers</h2>
    <p>Axiom is a staff and ERLC management tool for Discord roleplay communities. It helps server staff manage promotions, demotions, infractions, leave of absence tracking, support tickets, session votes, and shift scheduling.</p>

    <h2>Information We Collect</h2>
    <p>When you log in with Discord, we receive your Discord user ID, username, and the list of servers you belong to, only to determine which server dashboards you can access. We do not store your Discord username or server list permanently. Your access token is used once to fetch this information at login and is discarded immediately afterward. It is never saved to a database.</p>
    <p>As part of using the dashboard or the bot's commands, the following is stored against your Discord user ID for as long as it remains relevant to server staff records:</p>
    <ul>
      <li>Shift assignments you join or leave, and check-in and check-out timestamps</li>
      <li>Leave of absence requests, including the reason you provide and the dates involved</li>
      <li>Infractions and promotions recorded against you by server staff, including the reason given and who issued them</li>
      <li>Support tickets you open, including the channel they were created in</li>
    </ul>
    <p>None of this is shared outside the server it was created in. It exists to give server staff a working record of their own team, similar to a shift log or an HR file, not to track you for any other purpose.</p>

    <h2>Session Data</h2>
    <p>When you log in, we create a session stored in our database and set a browser cookie that only contains a session identifier, never your Discord token or password. The cookie is marked <strong>httpOnly</strong> and <strong>secure</strong>, meaning JavaScript cannot read it and it is only ever sent over an encrypted connection. Sessions expire automatically after 24 hours.</p>

    <h2>Infrastructure Providers</h2>
    <p>Logging in is handled entirely through Discord's own OAuth2 system. We never see or store your Discord password.</p>
    <p>This dashboard and bot run on <strong>Render</strong>, and the database that stores staff records runs on <strong>Neon</strong>, part of Databricks since 2025. Both providers process data on our behalf as infrastructure, the same way any web application depends on the servers it runs on, and both have their own privacy practices governing that layer:</p>
    <ul>
      <li>Render: <a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer">render.com/privacy</a></li>
      <li>Neon / Databricks: <a href="https://www.databricks.com/legal/privacynotice" target="_blank" rel="noopener noreferrer">databricks.com/legal/privacynotice</a></li>
    </ul>
    <p>This site also loads the Google Sans Flex font from Google Fonts' content delivery network, which means Google receives your IP address when a page loads, the same as any site using a font CDN. No analytics, advertising, or tracking scripts of any kind run on this site.</p>

    <h2>Data Retention</h2>
    <p>Infractions and promotions are kept for as long as the server's staff team finds them useful for accountability and continuity, the same way a paper shift log or HR file would be kept. Shift history and leave of absence records are kept the same way, but unlike infractions and promotions, you can request they be deleted, see below. Session data is deleted automatically once a session expires.</p>

    <h2>Who Can Access Your Data</h2>
    <p>Your own shift history, LOA status, and personal record are visible to you and to staff members holding the server's configured Staff Manage role or the Manage Roles permission. Regular members without that role cannot view another member's infraction or promotion history through this dashboard.</p>

    <h2>Requesting Data Deletion</h2>
    <p>You can request deletion of your shift assignment history, check-in and check-out records, and leave of absence history directly from the dashboard, under <strong>Your Profile &gt; Delete My Data</strong> once logged in. A staff member with the Staff Manage role reviews and completes the request, at which point that data is permanently deleted.</p>
    <p>Infractions and promotions are not deleted through this process. They are the server's accountability record rather than personal data you generated for your own convenience, the same way an employee cannot unilaterally erase entries from a completed HR file. If you believe an infraction or promotion record is inaccurate, that is a matter to raise with the server's staff team directly rather than a deletion request.</p>

    <h2>Changes to This Policy</h2>
    <p>If this policy changes in a way that matters, we will update the date at the top of this page. Continuing to use the dashboard after a change means you accept the updated version.</p>
  </div>
</div>`;
  return layout({ title: 'Privacy Policy', body });
}

// ============= Terms of Service =============
function termsOfServicePage() {
  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Terms of Service</h1>
  <a class="btn btn-text" href="/" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page">
  <div class="legal-doc">
    <div class="legal-updated">Last updated: September 2026</div>

    <h2>Acceptance</h2>
    <p>By logging into this dashboard with Discord, you agree to these terms. This is an internal staff tool for the ISRP Discord community, not a public product, so these terms are scoped to that use.</p>

    <h2>What This Bot Does</h2>
    <p>Axiom is a staff management dashboard for Discord roleplay communities. It helps server staff manage promotions, demotions, infractions, leave of absence tracking, support tickets, session votes, and shift scheduling.</p>

    <h2>Acceptable Use</h2>
    <p>You agree to use this dashboard only for legitimate staff purposes connected to the ISRP server. You will not attempt to access another user's account, bypass the permission checks that gate admin features, submit false information in shift, LOA, infraction, or promotion records, or use the dashboard to harass or retaliate against another member.</p>

    <h2>Staff Records Are Real Records</h2>
    <p>Infractions, promotions, and leave of absence entries created through this dashboard or the bot's commands are treated as the server's actual staff record, the same as if a moderator wrote them down by hand. Submitting an entry means you are asserting it is accurate and made in good faith.</p>

    <h2>Underlying Infrastructure</h2>
    <p>This dashboard runs on hosting and database infrastructure operated by Render and Neon respectively. Their own terms of service govern that underlying infrastructure independently of these terms:</p>
    <ul>
      <li>Render: <a href="https://render.com/terms" target="_blank" rel="noopener noreferrer">render.com/terms</a></li>
      <li>Neon / Databricks: <a href="https://www.databricks.com/legal/terms-of-use" target="_blank" rel="noopener noreferrer">databricks.com/legal/terms-of-use</a></li>
    </ul>

    <h2>No Warranty</h2>
    <p>This dashboard is provided as is, built and maintained on a volunteer basis for the ISRP community. We do not guarantee it will be available at all times, free of bugs, or fit for any purpose beyond its intended staff management use. Features may change, break, or be removed as the bot continues to be developed.</p>

    <h2>Limitation of Liability</h2>
    <p>To the extent permitted by law, the bot's developers and the ISRP server ownership are not liable for any loss or damage arising from your use of this dashboard, including lost data, missed shifts, or disputes arising from infraction or promotion records.</p>

    <h2>Changes to the Service</h2>
    <p>Features, permissions, and the underlying rules enforced by this dashboard may change over time as the ISRP server's needs change. Material changes to these terms will be reflected by updating the date at the top of this page.</p>

    <h2>Termination of Access</h2>
    <p>Access to this dashboard is tied to your standing in the ISRP Discord server. If you leave the server, are removed from it, or lose the staff role required for a given page, your access to that page ends accordingly.</p>

    <h2>Governing Community Rules</h2>
    <p>Use of this dashboard is also subject to the ISRP server's own rules and staff policies, which take precedence over these terms in the event of a conflict specific to server conduct.</p>

    <h2>Contact</h2>
    <p>Questions about these terms should go to the ISRP server's staff team directly, the same as any other server policy question.</p>
  </div>
</div>`;
  return layout({ title: 'Terms of Service', body });
}
