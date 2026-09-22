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
  book: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-5D 0"/></svg>',
  server: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8"/><rect x="2" y="14" width="20" height="8"/><line x1="6" y1="6" x2="6" y2="6.01"/><line x1="6" y1="18" x2="6" y2="18.01"/></svg>',
  shield: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6m-17.78 7.78l4.24-4.24m5.08-5.08l4.24-4.24"/></svg>',
};

function icon(name) {
  return ICONS[name] || '';
}

function formatDate(date) {
  if (!date) return 'N/A';
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function clearSearchInput(button) {
  const input = button.parentElement.querySelector('input');
  if (input) {
    input.value = '';
    input.focus();
  }
}

function layout({ title, body, showNav = true }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Axiom</title>
  <link rel="stylesheet" href="/style.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="/shapes.js"></script>
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
  <script>
    // Initialize shape morphing on dashboard
    window.addEventListener('DOMContentLoaded', function() {
      const shapeElement = document.getElementById('dashboard-shape');
      if (shapeElement && window.SHAPES && window.generateShapeSVG && typeof gsap !== 'undefined') {
        const morphPair = shapeElement.dataset.morph || 'circle,flower';
        const [fromShape, toShape] = morphPair.split(',').map(s => s.trim());
        
        const svgHtml = window.generateShapeSVG(fromShape, {
          size: 64,
          className: 'shape-morph'
        });
        shapeElement.innerHTML = svgHtml;
        
        const path = shapeElement.querySelector('path');
        if (path && window.SHAPES[toShape]) {
          gsap.to(path, {
            attr: { d: window.SHAPES[toShape].path },
            duration: 3,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
          });
        }
      }
    });
  </script>
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
  <div class="card card-filled stack shape-large" style="width:100%;max-width:420px;padding:var(--space-5)">
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

    <a class="btn btn-filled btn-full-width" href="/auth/login" style="gap:var(--space-2);margin-top:var(--space-2)">
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
  const backLink = guildId ? `<a href="/dashboard/${escapeHtml(guildId)}/staff" class="btn btn-text btn-standard" style="gap:var(--space-1)">${icon('chevronLeft')} Back</a>` : '';
  
  const body = `
<style>
.docs-hero {
  background: linear-gradient(135deg, var(--md-sys-color-primary-container), var(--md-sys-color-secondary-container));
  padding: var(--space-5);
  border-radius: var(--md-sys-shape-corner-medium);
  margin-bottom: var(--space-3);
  text-align: center;
}
.docs-hero h1 {
  margin: 0 0 8px 0;
  color: var(--md-sys-color-on-primary-container);
}
.docs-hero p {
  margin: 0;
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.9;
  max-width: 500px;
  margin: 0 auto;
}
.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.docs-card {
  padding: var(--space-3);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}
.docs-card:hover {
  border-color: var(--md-sys-color-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}
.docs-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--md-sys-color-primary), var(--md-sys-color-secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}
.docs-card:hover::before {
  transform: scaleX(1);
}
.docs-card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--md-sys-color-primary-container);
  border-radius: var(--md-sys-shape-corner-small);
  margin-bottom:var(--space-2);
  color: var(--md-sys-color-primary);
}
.docs-card-icon svg {
  width: 28px;
  height: 28px;
}
.docs-card-title {
  font-size:var(--md-typescale-headline-large-size);
  class="text-bold";
  margin-bottom:var(--space-1);
  color: var(--md-sys-color-on-surface);
}
.docs-card-desc {
  font-size:var(--md-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  line-height: 1.4;
}
.docs-content {
  display: none;
}
.docs-content.active {
  display: block;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.docs-nav {
  display: flex;
  gap: 8px;
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}
.docs-nav-btn {
  padding:var(--space-1) var(--space-3);
  border-radius: var(--md-sys-shape-corner-small);
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  border: none;
  cursor: pointer;
  font-size:var(--md-typescale-body-medium-size);
  transition: all 0.2s ease;
}
.docs-nav-btn:hover, .docs-nav-btn.active {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
</style>

<header class="topbar">
  <div>
    <h1 class="title-large" style="margin:0">Documentation</h1>
    <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin:var(--space-1) 0 0 0">Everything you need to know about Axiom</p>
  </div>
  ${backLink}
</header>

<div class="page stack">
  <!-- Hero Section -->
  <div class="docs-hero">
    <h1 style="font-size:var(--md-sys-typescale-display-large-size)">Welcome to Axiom</h1>
    <p>Your complete guide to staff management, shifts, and ERLC integration</p>
  </div>

  <!-- Section Cards -->
  <div class="docs-grid">
    <div class="card card-elevated docs-card" onclick="showSection('getting-started')">
      <div class="docs-card-icon">${icon('book')}</div>
      <div class="docs-card-title">Getting Started</div>
      <p class="docs-card-desc">Learn the basics and key features of Axiom</p>
    </div>

    <div class="card card-elevated docs-card" onclick="showSection('shifts')">
      <div class="docs-card-icon">${icon('clock')}</div>
      <div class="docs-card-title">Shift Management</div>
      <p class="docs-card-desc">Join, control, and track shift attendance</p>
    </div>

    <div class="card card-elevated docs-card" onclick="showSection('ssu')">
      <div class="docs-card-icon">${icon('server')}</div>
      <div class="docs-card-title">Server Requirements</div>
      <p class="docs-card-desc">Understanding SSU and player thresholds</p>
    </div>

    <div class="card card-elevated docs-card" onclick="showSection('verification')">
      <div class="docs-card-icon">${icon('checkCircle')}</div>
      <div class="docs-card-title">Account Verification</div>
      <p class="docs-card-desc">Link your Roblox account safely</p>
    </div>

    <div class="card card-elevated docs-card" onclick="showSection('moderation')">
      <div class="docs-card-icon">${icon('shield')}</div>
      <div class="docs-card-title">Moderation</div>
      <p class="docs-card-desc">In-game and Discord moderation commands</p>
    </div>

    <div class="card card-elevated docs-card" onclick="showSection('admin')">
      <div class="docs-card-icon">${icon('settings')}</div>
      <div class="docs-card-title">Admin Settings</div>
      <p class="docs-card-desc">Configure Axiom for your server</p>
    </div>
  </div>

  <!-- Quick Navigation -->
  <div class="docs-nav" id="docs-nav-buttons" style="display:none">
    <button class="docs-nav-btn active" onclick="showSection('getting-started')">Getting Started</button>
    <button class="docs-nav-btn" onclick="showSection('shifts')">Shifts</button>
    <button class="docs-nav-btn" onclick="showSection('ssu')">SSU</button>
    <button class="docs-nav-btn" onclick="showSection('verification')">Verification</button>
    <button class="docs-nav-btn" onclick="showSection('moderation')">Moderation</button>
    <button class="docs-nav-btn" onclick="showSection('admin')">Admin</button>
  </div>

  <!-- Content Area -->
  <div id="content" style="display:none"></div>
</div>

<script>
const sections = {
  'getting-started': \`
    <div class="card card-elevated" style="padding:var(--space-3)">
      <h2 class="headline-medium" style="margin-top:0">Getting Started</h2>
      <div class="body-medium" style="line-height:1.6;color:var(--md-sys-color-on-surface)">
        <h3 style="margin-top:var(--space-2);margin-bottom:var(--space-2);class="text-bold"">What is Axiom?</h3>
        <p>Axiom is a Discord bot designed to manage staff shifts and in-game moderation for ERLC (Emergency Response: Liberty County) roleplay communities. It provides tools for scheduling, tracking attendance, and moderating player behavior.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Key Features</h3>
        <ul style="margin:var(--space-1) 0;padding-left:var(--space-4)">
          <li>Shift management with SSU integration</li>
          <li>Roblox account verification</li>
          <li>In-game moderation logging</li>
          <li>Attendance tracking</li>
          <li>Staff audit logs</li>
          <li>Discord integration</li>
        </ul>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Quick Navigation</h3>
        <p><strong>Dashboard Home:</strong> Click your server name to access the staff dashboard</p>
        <p><strong>Shifts:</strong> View and manage shifts from the Shifts tab</p>
        <p><strong>Account Setup:</strong> Use /erlc-link command in Discord to verify your Roblox account</p>
      </div>
    </div>
  \`,

  'shifts': \`
    <div class="card card-elevated" style="padding:var(--space-3)">
      <h2 class="headline-medium" style="margin-top:0">Shift Management</h2>
      <div class="body-medium" style="line-height:1.6;color:var(--md-sys-color-on-surface)">
        <h3 style="margin-top:var(--space-2);margin-bottom:var(--space-2);class="text-bold"">Joining a Shift</h3>
        <p>1. Go to the Shifts page from your dashboard</p>
        <p>2. Find the shift you want to join</p>
        <p>3. Click <strong>Join Shift</strong> (button will be disabled if server doesn't have 25+ players)</p>
        <p>4. You'll see the shift details page with controls</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Controlling Your Shift</h3>
        <p>Once you've joined a shift, you'll see four control buttons:</p>
        <ul style="margin:var(--space-1) 0;padding-left:var(--space-4)">
          <li><strong>Start:</strong> Begin your shift (updates shift status to 'Started')</li>
          <li><strong>Pause:</strong> Temporarily pause your shift (status becomes 'Paused')</li>
          <li><strong>Resume:</strong> Resume from paused state (back to 'Started')</li>
          <li><strong>End:</strong> Complete your shift (status becomes 'Ended')</li>
        </ul>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Check-In / Check-Out</h3>
        <p>Click <strong>Check In / Out</strong> to toggle your attendance status during active shifts. This helps track who was actually present during each shift.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Viewing Shift Members</h3>
        <p>The Members section shows all staff who joined the shift and their check-in status. Check-in status can be either:</p>
        <ul style="margin:var(--space-1) 0;padding-left:var(--space-4)">
          <li><strong>Checked in:</strong> Present during the shift</li>
          <li><strong>Not checked in:</strong> Joined but didn't check in</li>
        </ul>
      </div>
    </div>
  \`,

  'ssu': \`
    <div class="card card-elevated" style="padding:var(--space-3)">
      <h2 class="headline-medium" style="margin-top:0">Server Requirements (SSU Integration)</h2>
      <div class="body-medium" style="line-height:1.6;color:var(--md-sys-color-on-surface)">
        <h3 style="margin-top:var(--space-2);margin-bottom:var(--space-2);class="text-bold"">What is SSU?</h3>
        <p>SSU (Server Startup Unit) is a requirement that ensures shifts can only be joined when the ERLC server has officially started and has at least 25 players in-game. This prevents ghost shifts and ensures proper staffing coordination.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Why 25 Players?</h3>
        <p>25 players is the minimum threshold to ensure the server is properly running with meaningful activity. This prevents premature shift joins when the server is still warming up.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Joining When SSU Isn't Ready</h3>
        <p>If you try to join a shift but see <strong>'Server Not Ready'</strong> message, it means:</p>
        <ul style="margin:var(--space-1) 0;padding-left:var(--space-4)">
          <li>The ERLC server hasn't started yet, OR</li>
          <li>There aren't enough players in-game (fewer than 25)</li>
        </ul>
        <p>Simply wait until the server reaches 25 players, then refresh the page to try again.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Server Status Display</h3>
        <p>Each shift detail page shows live server status including:</p>
        <ul style="margin:var(--space-1) 0;padding-left:var(--space-4)">
          <li>Current player count</li>
          <li>Server status (Started/Not Started)</li>
          <li>Reason why shifts can't be joined (if applicable)</li>
        </ul>
      </div>
    </div>
  \`,

  'verification': \`
    <div class="card card-elevated" style="padding:var(--space-3)">
      <h2 class="headline-medium" style="margin-top:0">Roblox Account Verification</h2>
      <div class="body-medium" style="line-height:1.6;color:var(--md-sys-color-on-surface)">
        <h3 style="margin-top:var(--space-2);margin-bottom:var(--space-2);class="text-bold"">Why Verify?</h3>
        <p>Verifying your Roblox account links your Discord identity with your in-game account. This enables in-game moderation logging and staff tracking.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Verification Steps</h3>
        <p><strong>Step 1:</strong> Run <code style="background:var(--md-sys-color-surface-dim);padding:var(--space-1) 6px;border-radius:var(--md-sys-shape-corner-extra-small)">/erlc-link</code> in Discord</p>
        <p><strong>Step 2:</strong> Bot sends you a 12-word verification phrase</p>
        <p><strong>Step 3:</strong> Add the phrase to your Roblox bio/description</p>
        <p><strong>Step 4:</strong> Click <strong>Verify My Account</strong> button</p>
        <p><strong>Step 5:</strong> Enter your Roblox username when prompted</p>
        <p><strong>Step 6:</strong> Bot verifies the phrase is in your bio and confirms verification</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Regenerate Phrase</h3>
        <p>If the phrase contains censored words or you want a new one, click <strong>Regenerate Words</strong> to get a different 12-word phrase.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">After Verification</h3>
        <p>Once verified, your account is linked permanently. You can now:</p>
        <ul style="margin:var(--space-1) 0;padding-left:var(--space-4)">
          <li>Use in-game moderation commands</li>
          <li>Be tracked in moderation logs</li>
          <li>Receive mod permissions if you have Discord staff role</li>
        </ul>
      </div>
    </div>
  \`,

  'moderation': \`
    <div class="card card-elevated" style="padding:var(--space-3)">
      <h2 class="headline-medium" style="margin-top:0">Moderation</h2>
      <div class="body-medium" style="line-height:1.6;color:var(--md-sys-color-on-surface)">
        <h3 style="margin-top:var(--space-2);margin-bottom:var(--space-2);class="text-bold"">In-Game Moderation</h3>
        <p>If you have verified your Roblox account and have Discord staff role, you can issue moderation commands in-game:</p>
        <p style="background:var(--md-sys-color-surface-dim);padding:var(--space-2);border-radius:var(--md-sys-shape-corner-small);font-family:monospace;margin:var(--space-1) 0">
          ?moderate PlayerName violation reason
        </p>
        <p><strong>Example:</strong> <code style="background:var(--md-sys-color-surface-dim);padding:var(--space-1) 6px;border-radius:var(--md-sys-shape-corner-extra-small)">command [args]</code></p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Discord Moderation</h3>
        <p>Alternatively, issue moderation commands directly in Discord using the same format:</p>
        <p style="background:var(--md-sys-color-surface-dim);padding:var(--space-2);border-radius:var(--md-sys-shape-corner-small);font-family:monospace;margin:var(--space-1) 0">
          ?moderate PlayerName violation reason
        </p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Violation Types</h3>
        <p>Common violations (case-insensitive, shorthand accepted):</p>
        <ul style="margin:var(--space-1) 0;padding-left:var(--space-4);columns:2">
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

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Moderation Logging</h3>
        <p>All moderation actions are logged to your server's moderation channel with:</p>
        <ul style="margin:var(--space-1) 0;padding-left:var(--space-4)">
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
    <div class="card card-elevated" style="padding:var(--space-3)">
      <h2 class="headline-medium" style="margin-top:0">Admin Settings</h2>
      <div class="body-medium" style="line-height:1.6;color:var(--md-sys-color-on-surface)">
        <h3 style="margin-top:var(--space-2);margin-bottom:var(--space-2);class="text-bold"">Accessing Settings</h3>
        <p>Only administrators can access the Settings page. Click the gear icon in the dashboard to configure Axiom.</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">ERLC Configuration</h3>
        <p>To enable Axiom features, you need to configure your ERLC Private Server API key:</p>
        <p><strong>1.</strong> Go to Settings</p>
        <p><strong>2.</strong> Find 'ERLC Server Configuration' section</p>
        <p><strong>3.</strong> Enter your ERLC API key</p>
        <p><strong>4.</strong> Click 'Save API Key' (bot validates connection)</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Shift Type Management</h3>
        <p>Create custom shift types with duration limits:</p>
        <p><strong>1.</strong> Go to Settings</p>
        <p><strong>2.</strong> Find 'Shift Types' section</p>
        <p><strong>3.</strong> Enter shift type name (e.g., 'Patrol')</p>
        <p><strong>4.</strong> Set minimum and maximum duration in minutes</p>
        <p><strong>5.</strong> Click 'Add Shift Type'</p>
        <p>Admins can delete shift types with the delete button (must keep at least one)</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Custom Violations</h3>
        <p>Add custom violation types beyond the default 10 presets:</p>
        <p><strong>1.</strong> Go to Settings</p>
        <p><strong>2.</strong> Find 'Custom Violations' section</p>
        <p><strong>3.</strong> Enter violation name</p>
        <p><strong>4.</strong> Click 'Add Violation'</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Creating Shifts</h3>
        <p>Click 'Create Shift' button to schedule new shifts:</p>
        <p><strong>1.</strong> Enter shift name (e.g., 'Morning Patrol')</p>
        <p><strong>2.</strong> Select shift type</p>
        <p><strong>3.</strong> Set start and end times</p>
        <p><strong>4.</strong> Add optional description</p>
        <p><strong>5.</strong> Click 'Create Shift'</p>

        <h3 style="margin-top:var(--space-3);margin-bottom:var(--space-2);class="text-bold"">Audit Log</h3>
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
        <div class="body-large" style="class="text-bold"">${escapeHtml(g.name)}</div>
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
    <a class="btn btn-text btn-standard" href="/auth/logout" style="gap:var(--space-1)" title="Log out">
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
function staffDashboard({ guild, user, shifts, activeLoa, moderationCount, weeklyHours, isAdmin, trueAdmin, viewingAsStaff, guildId }) {
  const now = new Date();
  const activeShifts = shifts.filter(s => new Date(s.starts_at) <= now && new Date(s.ends_at) > now);
  const upcomingShifts = shifts.filter(s => new Date(s.starts_at) > now);
  const completedShifts = shifts.filter(s => new Date(s.ends_at) < now);

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };

  // Quick stats - Catppuccin Mocha colors
  const statsHtml = `
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">${icon('checkCircle')}</div>
        <div class="stat-content">
          <div class="stat-label">Active</div>
          <div class="stat-number">${activeShifts.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-info">${icon('clock')}</div>
        <div class="stat-content">
          <div class="stat-label">Next</div>
          <div class="stat-number">${upcomingShifts.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">${icon('check')}</div>
        <div class="stat-content">
          <div class="stat-label">Done</div>
          <div class="stat-number">${completedShifts.length}</div>
        </div>
      </div>
    </div>
  `;

  // Shift cards organized by status
  const shiftCard = (s) => {
    const start = new Date(s.starts_at);
    const end = new Date(s.ends_at);
    const isActive = start <= now && end > now;
    
    const duration = end - start;
    const durationHours = Math.floor(duration / (1000 * 60 * 60));
    const durationMins = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    const startStr = start.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let status = 'Completed';
    let statusClass = 'badge-secondary';
    let statusShape = 'semicircle';
    if (isActive) {
      status = 'Active';
      statusClass = 'badge-success';
      statusShape = 'circle';
    } else if (start > now) {
      status = 'Upcoming';
      statusClass = 'badge-info';
      statusShape = 'pill';
    }

    return `
      <div class="card card-elevated" style="padding:var(--space-3);display:flex;justify-content:space-between;align-items:flex-start;position:relative;border-left:3px solid var(--md-sys-color-primary);overflow:hidden">
        <div style="position:absolute;right:-20px;top:-20px;opacity:0.08;width:80px;height:80px;pointer-events:none" class="shift-card-shape" data-shape="${statusShape}"></div>
        <div style="position:relative;z-index:1">
          <div class="body-large" style="font-weight:500">${escapeHtml(s.name)}</div>
          <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:var(--space-1)">
            ${startStr} to ${endStr}
          </div>
          <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:var(--space-quarter)">
            ${durationHours}h ${durationMins}m
          </div>
        </div>
        <div style="display:flex;gap:var(--space-2);align-items:center;position:relative;z-index:1">
          <span class="badge ${statusClass}">${status}</span>
          <a href="/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(s.id)}" class="btn btn-text btn-standard" style="gap:var(--space-1);padding:var(--space-1) var(--space-2)">
            ${icon('chevronRight')}
          </a>
        </div>
      </div>`;
  };

  const toggleButton = trueAdmin ? `
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/toggle-view-mode" style="display:inline">
      <button type="submit" class="btn btn-text btn-standard" title="Switch view mode" style="gap:var(--space-1)">
        ${viewingAsStaff ? icon('shield') : icon('users')}
      </button>
    </form>` : '';

  const loaSection = activeLoa ? (() => {
    const loaEnd = new Date(activeLoa.ends_at);
    const daysRemaining = Math.ceil((loaEnd - now) / (1000 * 60 * 60 * 24));
    return `
    <div class="info-card" style="border-left:4px solid var(--md-sys-color-error);background:var(--md-sys-color-error-container);opacity:0.95">
      <div style="display:flex;gap:var(--space-2);align-items:flex-start">
        ${icon('alertCircle')}
        <div style="flex:1">
          <div class="info-card-title">On Leave of Absence</div>
          <div class="body-medium" style="color:var(--md-sys-color-on-error-container);margin-top:var(--space-2);font-weight:600">
            ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining
          </div>
          <div class="body-small" style="color:var(--md-sys-color-on-error-container);margin-top:var(--space-1)">
            Returns: ${formatDate(activeLoa.ends_at)}
            <div style="margin-top:var(--space-2)"><a href="/dashboard/${escapeHtml(guildId)}/loa" class="btn btn-text" style="gap:var(--space-1)">Manage Leave</a></div>
          </div>
        </div>
      </div>
    </div>`;
  })() : '';

  const shiftsHtml = shifts.length === 0 ? `
    <div style="text-align:center;padding:var(--space-5);color:var(--md-sys-color-on-surface-variant)">
      <div style="width:80px;height:80px;margin:0 auto var(--space-3);opacity:0.25;display:flex;align-items:center;justify-content:center" id="empty-shifts-shape"></div>
      <div class="headline-small">No Shifts Assigned</div>
      <div class="body-small">Contact your administrator to get assigned to a shift.</div>
    </div>
    <script>
    (function() {
      if (window.generateShapeSVG && window.SHAPES) {
        const emptyShape = document.getElementById('empty-shifts-shape');
        if (emptyShape) {
          emptyShape.innerHTML = window.generateShapeSVG('wave', { size: 80 });
        }
      }
    })();
    </script>
  ` : `
    <div class="section">
      <div class="section-header">
        <h3 class="headline-small">Your Shifts</h3>
      </div>
      <div style="display:grid;gap:var(--space-2)">
        ${activeShifts.length > 0 ? `
          <div>
            <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);text-transform:uppercase;margin-bottom:var(--space-1);font-weight:500">Active</div>
            ${activeShifts.map(shiftCard).join('')}
          </div>
        ` : ''}
        ${upcomingShifts.length > 0 ? `
          <div>
            <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);text-transform:uppercase;margin-bottom:var(--space-1);font-weight:500">Upcoming</div>
            ${upcomingShifts.map(shiftCard).join('')}
          </div>
        ` : ''}
        ${completedShifts.length > 0 ? `
          <div>
            <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);text-transform:uppercase;margin-bottom:var(--space-1);font-weight:500">Past</div>
            ${completedShifts.slice(0, 3).map(shiftCard).join('')}
            ${completedShifts.length > 3 ? `<a href="/dashboard/${escapeHtml(guildId)}/shifts" class="btn btn-text btn-standard" style="gap:var(--space-1);font-size:var(--md-sys-typescale-body-small-size);justify-content:center;margin-top:var(--space-2)">View all ${completedShifts.length}</a>` : ''}
          </div>
        ` : ''}
      </div>
    </div>
    <script>
    (function() {
      if (!window.SHAPES || !window.generateShapeSVG) return;
      const shapeCards = document.querySelectorAll('.shift-card-shape');
      shapeCards.forEach(card => {
        const shapeKey = card.getAttribute('data-shape');
        if (window.SHAPES[shapeKey]) {
          card.innerHTML = window.generateShapeSVG(shapeKey, { size: 80, className: 'shape-card-bg' });
        }
      });
    })();
    </script>
  `;

  const body = `
<header class="topbar">
  <div>
    <h1 class="title-large" style="margin:0">${escapeHtml(guild.name)}</h1>
    <p class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin:var(--space-1) 0 0 0">Dashboard</p>
  </div>
  <div style="flex:1;display:flex;justify-content:center">
    <div id="dashboard-shape" class="shape-header-accent" data-morph="flower,boom"></div>
  </div>
  <div class="row">
    ${toggleButton}
    <a class="btn btn-text btn-standard" href="/dashboard" style="gap:var(--space-1)">
      ${icon('chevronLeft')}
      <span>Back</span>
    </a>
    <a class="btn btn-text btn-standard" href="/auth/logout" style="gap:var(--space-1)">
      ${icon('logOut')}
    </a>
  </div>
</header>

<div class="page stack">
  ${loaSection}

<div class="glass-grid">
    <div class="stat-glass-card" data-shape="circle">
      <div class="stat-glass-shape" id="shape-active"></div>
      <div class="stat-glass-label">Active</div>
      <div class="stat-glass-value">${activeShifts.length}</div>
      <div class="stat-glass-unit">shifts</div>
    </div>
    <div class="stat-glass-card" data-shape="flower">
      <div class="stat-glass-shape" id="shape-upcoming"></div>
      <div class="stat-glass-label">Upcoming</div>
      <div class="stat-glass-value">${upcomingShifts.length}</div>
      <div class="stat-glass-unit">shifts</div>
    </div>
    <div class="stat-glass-card" data-shape="boom">
      <div class="stat-glass-shape" id="shape-completed"></div>
      <div class="stat-glass-label">Completed</div>
      <div class="stat-glass-value">${completedShifts.length}</div>
      <div class="stat-glass-unit">shifts</div>
    </div>
    <div class="stat-glass-card" data-shape="heart">
      <div class="stat-glass-shape" id="shape-moderations"></div>
      <div class="stat-glass-label">Moderations</div>
      <div class="stat-glass-value">${moderationCount || 0}</div>
      <div class="stat-glass-unit">actions</div>
    </div>
    <div class="stat-glass-card" data-shape="starFive">
      <div class="stat-glass-shape" id="shape-hours"></div>
      <div class="stat-glass-label">This Week</div>
      <div class="stat-glass-value">${(weeklyHours || 0).toFixed(1)}</div>
      <div class="stat-glass-unit">hours</div>
    </div>
  </div>

<script>
(function() {
  if (!window.SHAPES || !window.generateShapeSVG) return;
  
  const cards = document.querySelectorAll('.stat-glass-card');
  cards.forEach(card => {
    const shapeKey = card.getAttribute('data-shape');
    const shapeDiv = card.querySelector('.stat-glass-shape');
    if (shapeDiv && window.SHAPES[shapeKey]) {
      shapeDiv.innerHTML = window.generateShapeSVG(shapeKey, {
        size: 80,
        className: 'shape-stat-icon'
      });
    }
  });
  
  // Add hover animation to stat cards
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      const shapeDiv = this.querySelector('.stat-glass-shape');
      if (shapeDiv && typeof gsap !== 'undefined') {
        gsap.to(shapeDiv, {
          duration: 0.4,
          scale: 1.15,
          rotation: 5,
          ease: 'elastic.out(1, 0.5)'
        });
      }
    });
    
    card.addEventListener('mouseleave', function() {
      const shapeDiv = this.querySelector('.stat-glass-shape');
      if (shapeDiv && typeof gsap !== 'undefined') {
        gsap.to(shapeDiv, {
          duration: 0.3,
          scale: 1,
          rotation: 0,
          ease: 'power2.out'
        });
      }
    });
  });
})();
</script>

  <div class="section-divider"></div>

  ${shiftsHtml}

  <div class="section-divider"></div>

  <div class="section">
    <div class="section-header" style="position:relative">
      <h3 class="headline-small">Quick Actions</h3>
      <div style="position:absolute;right:0;top:50%;transform:translateY(-50%);opacity:0.15;width:40px;height:40px;pointer-events:none" id="quick-actions-shape"></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:var(--space-2)">
      ${!activeLoa ? `<a href="/dashboard/${escapeHtml(guildId)}/loa" class="btn btn-tonal" style="position:relative;overflow:hidden"><span style="position:relative;z-index:1">Request Leave</span></a>` : ''}
      <a href="/dashboard/${escapeHtml(guildId)}/user/${escapeHtml(user.id)}" class="btn btn-tonal" style="position:relative;overflow:hidden"><span style="position:relative;z-index:1">My History</span></a>
      <a href="/dashboard/${escapeHtml(guildId)}/audit" class="btn btn-tonal" style="position:relative;overflow:hidden"><span style="position:relative;z-index:1">Activity</span></a>
      <a href="/dashboard/${escapeHtml(guildId)}/docs" class="btn btn-tonal" style="position:relative;overflow:hidden"><span style="position:relative;z-index:1">Docs</span></a>
      ${isAdmin ? `<a href="/dashboard/${escapeHtml(guildId)}" class="btn btn-tonal" style="position:relative;overflow:hidden"><span style="position:relative;z-index:1">Settings</span></a>` : ''}
      ${isAdmin ? `<a href="/dashboard/${escapeHtml(guildId)}/shifts" class="btn btn-tonal" style="position:relative;overflow:hidden"><span style="position:relative;z-index:1">Shift Manager</span></a>` : ''}
    </div>
  </div>

  ${isAdmin ? `
  <div class="section-divider"></div>
  <div class="section">
    <div class="section-header" style="position:relative">
      <h3 class="headline-small" style="color:var(--md-sys-color-on-primary-container)">Admin Tools</h3>
      <div style="position:absolute;right:0;top:50%;transform:translateY(-50%);opacity:0.2;width:40px;height:40px;pointer-events:none" id="admin-tools-shape"></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:var(--space-2)">
      <a href="/dashboard/${escapeHtml(guildId)}/shifts" class="btn btn-filled" style="position:relative;overflow:hidden"><span style="position:relative;z-index:1">Create Shift</span></a>
      <a href="/dashboard/${escapeHtml(guildId)}/deletion-requests" class="btn btn-filled" style="position:relative;overflow:hidden"><span style="position:relative;z-index:1">Deletion Queue</span></a>
    </div>
  </div>
  <script>
  (function() {
    if (!window.SHAPES || !window.generateShapeSVG) return;
    const quickActionsShape = document.getElementById('quick-actions-shape');
    const adminToolsShape = document.getElementById('admin-tools-shape');
    if (quickActionsShape && window.SHAPES['oval']) {
      quickActionsShape.innerHTML = window.generateShapeSVG('oval', { size: 40, className: 'shape-section-accent' });
    }
    if (adminToolsShape && window.SHAPES['teardrop']) {
      adminToolsShape.innerHTML = window.generateShapeSVG('teardrop', { size: 40, className: 'shape-section-accent' });
    }
  })();
  </script>` : ''}
</div>
`;

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
    `<div class="status-chip" style="background:var(--md-sys-color-on-background);color:var(--md-sys-color-background);font-size:var(--md-sys-typescale-body-small-size);padding:var(--space-1) var(--space-2);border-radius:var(--md-sys-shape-corner-small)">
      ${icon('checkCircle')} <strong>${ssuStatus.playerCount}</strong> players in-game
    </div>` :
    `<div class="status-chip" style="background:var(--md-sys-color-error);color:var(--md-sys-color-on-error);font-size:var(--md-sys-typescale-body-small-size);padding:var(--space-1) var(--space-2);border-radius:var(--md-sys-shape-corner-small)">
      ${icon('alertCircle')} ${escapeHtml(ssuStatus.reason || 'Server not ready')}
    </div>`) : '';

  // Join/Leave action
  const joinDisabled = ssuStatus && !ssuStatus.ready;
  const joinLeaveAction = isJoined ? `
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(shiftId)}/leave" style="margin:0">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <button class="btn btn-tonal" type="submit" style="gap:var(--space-2);background:var(--md-sys-color-error-container);color:var(--md-sys-color-on-error-container)">
        ${icon('logOut')}
        <span>Leave Shift</span>
      </button>
    </form>` : `
    <form method="POST" action="/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(shiftId)}/join" style="margin:0">
      <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
      <button class="btn btn-filled" type="submit" ${joinDisabled ? 'disabled' : ''} style="gap:var(--space-2)">
        ${icon('plus')}
        <span>${joinDisabled ? 'Server Not Ready' : 'Join Shift'}</span>
      </button>
    </form>`;

  // Shift state controls (start/pause/resume/end)
  const stateControls = isJoined ? `
    <div class="shift-controls-menu" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);padding:var(--space-2);background:var(--md-sys-color-surface-dim);border-radius:var(--md-sys-shape-corner-small)">
      <button class="btn btn-tonal" onclick="updateShiftState('start')" style="gap:var(--space-2)">
        ${icon('play')}
        <span>Start</span>
      </button>
      <button class="btn btn-tonal" onclick="updateShiftState('pause')" style="gap:var(--space-2)">
        ${icon('pause')}
        <span>Pause</span>
      </button>
      <button class="btn btn-tonal" onclick="updateShiftState('resume')" style="gap:var(--space-2)">
        ${icon('play')}
        <span>Resume</span>
      </button>
      <button class="btn btn-tonal" onclick="updateShiftState('end')" style="gap:var(--space-2)">
        ${icon('square')}
        <span>End</span>
      </button>
    </div>` : '';

  // Member list with better formatting
  const memberItems = members.map(m => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2);background:var(--md-sys-color-surface);border-radius:var(--md-sys-shape-corner-small);border:1px solid var(--md-sys-color-outline)">
      <div>
        <div class="body-medium" style="class="text-medium"">User ${escapeHtml(m.user_id)}</div>
        <div class="body-small" style="color:var(--md-sys-color-on-surface-variant)">Joined ${formatDate(m.joined_at)}</div>
      </div>
      <span class="badge ${m.checked_in ? 'badge-success' : 'badge-warning'}" style="white-space:nowrap">
        ${m.checked_in ? 'Checked in' : 'Not checked in'}
      </span>
    </div>`).join('');

  const checkInLink = (isJoined && isActive) ? `
    <a href="/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(shiftId)}/check-in" class="btn btn-tonal" style="gap:var(--space-2);width:100%">
      ${icon('clock')}
      <span>Check In / Out</span>
    </a>` : '';

  const body = `
<header class="topbar">
  <div style="flex:1">
    <h1 class="title-large" style="margin:0;margin-bottom:var(--space-1)">${escapeHtml(shift.name)}</h1>
    <div style="display:flex;gap:var(--space-2);align-items:center">
      <span class="badge ${statusBadgeClass}">${statusText}</span>
      ${isActive ? '<span class="badge badge-active">Active Now</span>' : ''}
    </div>
  </div>
  <a class="btn btn-text btn-standard" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:var(--space-1)">
    ${icon('chevronLeft')} Back
  </a>
</header>

<div class="page stack">
  <!-- Key Info Cards -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--space-2)">
    <div class="card card-elevated" style="padding:var(--space-2)">
      <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-bottom:var(--space-1)">Start Time</div>
      <div class="body-large" style="class="text-medium"">${formatDate(shift.starts_at)}</div>
    </div>
    <div class="card card-elevated" style="padding:var(--space-2)">
      <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-bottom:var(--space-1)">End Time</div>
      <div class="body-large" style="class="text-medium"">${formatDate(shift.ends_at)}</div>
    </div>
    <div class="card card-elevated" style="padding:var(--space-2)">
      <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-bottom:var(--space-1)">Duration</div>
      <div class="body-large" style="class="text-medium"">${durationHours}h ${durationMins}m</div>
    </div>
    <div class="card card-elevated" style="padding:var(--space-2)">
      <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-bottom:var(--space-1)">Members</div>
      <div class="body-large" style="class="text-medium"">${members.length}</div>
    </div>
  </div>

  <!-- Description -->
  ${shift.description ? `
  <div class="card card-elevated" style="padding:var(--space-3)">
    <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-bottom:var(--space-2);text-transform:uppercase;class="text-bold"">Notes</div>
    <p class="body-medium">${escapeHtml(shift.description)}</p>
  </div>` : ''}

  <!-- SSU Status -->
  ${ssuDisplay ? `
  <div class="card card-elevated" style="padding:var(--space-2)">
    <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-bottom:var(--space-2)">Server Status</div>
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
  <div class="card card-elevated" style="padding:var(--space-3)">
    <div class="body-medium" style="class="text-bold";margin-bottom:var(--space-2);display:flex;gap:var(--space-2);align-items:center">
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
  <a class="btn btn-text btn-standard" href="/dashboard/${escapeHtml(guildId)}/shifts" style="gap:var(--space-1)">
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
        <input type="text" id="shift-name" name="name" required placeholder="Enter shift name">
      </div>
      
      <div class="field-group">
        <label for="shift-desc">Description (optional)</label>
        <textarea id="shift-desc" name="description" placeholder="Enter shift details" style="min-height:80px;border:1px solid var(--md-sys-color-outline);border-radius:var(--md-sys-shape-corner-small);padding:var(--space-2);background:var(--md-sys-color-surface-container);color:var(--md-sys-color-on-surface);font-family:inherit;font-size:inherit"></textarea>
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

      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:var(--space-2)">
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
    let statusShape = 'pill';
    let statusColor = 'var(--md-sys-color-primary)';
    if (start <= now && end > now) {
      status = 'Active';
      statusShape = 'circle';
      statusColor = 'var(--md-sys-color-tertiary)';
    }
    if (end < now) {
      status = 'Completed';
      statusShape = 'semicircle';
      statusColor = 'var(--md-sys-color-on-surface-variant)';
    }

    return `
    <div class="shift-card" style="position:relative;border-left:4px solid ${statusColor};overflow:hidden">
      <div style="position:absolute;right:-24px;bottom:-24px;opacity:0.08;width:100px;height:100px;pointer-events:none" class="shift-list-shape" data-shape="${statusShape}"></div>
      <div class="shift-info" style="position:relative;z-index:1">
        <div class="shift-name">${escapeHtml(s.name)}</div>
        <div class="shift-time">${icon('clock')} ${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        ${s.description ? `<div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:var(--space-1)">${escapeHtml(s.description)}</div>` : ''}
        <div class="badge badge-info" style="margin-top:var(--space-2)">${status}</div>
      </div>
      <div class="shift-actions" style="position:relative;z-index:1">
        <a href="/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(s.id)}" class="btn btn-text btn-standard">Details</a>
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
    <a href="/dashboard/${escapeHtml(guildId)}/staff" class="btn btn-text btn-standard" style="gap:var(--space-1)">
      ${icon('chevronLeft')} Back
    </a>
  </div>
</header>
<div class="page stack">
  <div style="display:flex;gap:var(--space-2);align-items:center">
    <h2 class="headline-medium" style="margin:0;flex:1">Shifts</h2>
    <a href="/dashboard/${escapeHtml(guildId)}/create-shift" class="btn btn-filled" style="gap:var(--space-2)">
      ${icon('plus')}
      <span>New Shift</span>
    </a>
  </div>

  ${shifts.length > 0 ? `<div style="display:flex;flex-direction:column;gap:var(--space-2)">${shiftItems}</div>` : `<div class="empty-state"><div style="width:100px;height:100px;margin:0 auto var(--space-3);opacity:0.2;display:flex;align-items:center;justify-content:center" id="empty-shifts-list-shape"></div><div class="empty-state-text">No shifts yet. Create one to get started.</div></div>`}

  <script>
  (function() {
    if (!window.SHAPES || !window.generateShapeSVG) return;
    
    // Shift list card shapes
    const shapeCards = document.querySelectorAll('.shift-list-shape');
    shapeCards.forEach(card => {
      const shapeKey = card.getAttribute('data-shape');
      if (window.SHAPES[shapeKey]) {
        card.innerHTML = window.generateShapeSVG(shapeKey, { size: 100, className: 'shape-shift-list-bg' });
      }
    });
    
    // Empty state shape
    const emptyShape = document.getElementById('empty-shifts-list-shape');
    if (emptyShape && window.SHAPES['teardrop']) {
      emptyShape.innerHTML = window.generateShapeSVG('teardrop', { size: 100, className: 'shape-empty-state' });
    }
  })();
  </script>
</div>`;
  return layout({ title: 'Manage Shifts', body });
}

// ============= LOA Request Page (Staff) =============
function loaRequestPage({ guild, currentLoa, csrfToken, guildId, userId }) {
  if (currentLoa) {
    const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Leave of Absence</h1>
  <a class="btn btn-text btn-standard" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:var(--space-1)">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page stack">
  <div class="info-card" style="border-left:4px solid var(--md-sys-color-error);position:relative;overflow:hidden">
    <div style="position:absolute;right:-32px;bottom:-32px;opacity:0.1;width:120px;height:120px;pointer-events:none" id="loa-active-shape"></div>
    <div class="info-card-header" style="position:relative;z-index:1">
      <div class="info-card-title">Currently on Leave</div>
    </div>
    <div class="info-card-body" style="position:relative;z-index:1">
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
    <button class="btn btn-filled" type="submit" style="gap:var(--space-2)">
      ${icon('checkCircle')}
      <span>End Leave of Absence</span>
    </button>
  </form>

  <script>
  (function() {
    if (!window.SHAPES || !window.generateShapeSVG) return;
    const loaShape = document.getElementById('loa-active-shape');
    if (loaShape && window.SHAPES['wave']) {
      loaShape.innerHTML = window.generateShapeSVG('wave', { size: 120, className: 'shape-loa-badge' });
    }
  })();
  </script>
</div>`;
    return layout({ title: 'Leave', body });
  }

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Request Leave of Absence</h1>
  <a class="btn btn-text btn-standard" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:var(--space-1)">
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
        <input type="text" id="loa-reason" name="reason" required placeholder="Enter reason">
      </div>

      <div class="field-group">
        <label for="loa-end">Return Date</label>
        <input type="date" id="loa-end" name="endsAt" required>
      </div>

      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:var(--space-2)">
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
  <a class="btn btn-text btn-standard" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:var(--space-1)">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page stack">
  <div class="info-card" style="border-left:4px solid var(--md-sys-color-error)">
    <div class="info-card-title">This shift is not active</div>
    <div class="body-small" style="color:var(--md-sys-color-on-surface-variant);margin-top:var(--space-2)">
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
  <a class="btn btn-text btn-standard" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:var(--space-1)">
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
          <button class="btn btn-filled btn-danger" type="submit" style="gap:var(--space-2)">
            ${icon('check')}
            <span>Check Out</span>
          </button>
        </form>` : '<div class="body-small" style="color:var(--md-sys-color-on-surface-variant)">Shift checkout already recorded.</div>'}
    ` : `
      <form method="POST" action="/dashboard/${escapeHtml(guildId)}/shift/${escapeHtml(shiftId)}/check-in" style="margin:0">
        <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
        <button class="btn btn-filled" type="submit" style="gap:var(--space-2);width:100%">
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
  <a class="btn btn-text btn-standard" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:var(--space-1)">
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
        <div class="user-section-title" style="color:var(--md-sys-color-error);position:relative;padding-right:40px">
          On Leave of Absence
          <div style="position:absolute;right:0;top:50%;transform:translateY(-50%);opacity:0.25;width:32px;height:32px;pointer-events:none" class="user-section-shape-loa"></div>
        </div>
        <div class="user-item">
          <div class="user-item-main">
            <div class="user-item-label">Ends: ${formatDate(activeLoa.ends_at)}</div>
            <div class="user-item-meta">${escapeHtml(activeLoa.reason)}</div>
          </div>
        </div>
      </div>` : ''}

    ${promotions.length > 0 ? `
      <div class="user-section">
        <div class="user-section-title" style="position:relative;padding-right:40px">
          Promotions (${promotions.length})
          <div style="position:absolute;right:0;top:50%;transform:translateY(-50%);opacity:0.2;width:32px;height:32px;pointer-events:none" class="user-section-shape-promo"></div>
        </div>
        <div class="user-section-list">
          ${promotionItems}
        </div>
      </div>` : ''}

    ${infractions.length > 0 ? `
      <div class="user-section">
        <div class="user-section-title" style="position:relative;padding-right:40px">
          Infractions (${infractions.length})
          <div style="position:absolute;right:0;top:50%;transform:translateY(-50%);opacity:0.2;width:32px;height:32px;pointer-events:none" class="user-section-shape-infract"></div>
        </div>
        <div class="user-section-list">
          ${infractionItems}
        </div>
      </div>` : ''}

    ${currentShifts.length > 0 ? `
      <div class="user-section">
        <div class="user-section-title" style="position:relative;padding-right:40px">
          Assigned Shifts (${currentShifts.length})
          <div style="position:absolute;right:0;top:50%;transform:translateY(-50%);opacity:0.2;width:32px;height:32px;pointer-events:none" class="user-section-shape-shift"></div>
        </div>
        <div class="user-section-list">
          ${shiftItems}
        </div>
      </div>` : ''}

  <script>
  (function() {
    if (!window.SHAPES || !window.generateShapeSVG) return;
    const shapes = {
      'user-section-shape-loa': 'wave',
      'user-section-shape-promo': 'starFive',
      'user-section-shape-infract': 'boom',
      'user-section-shape-shift': 'circle'
    };
    Object.entries(shapes).forEach(([className, shapeKey]) => {
      const els = document.querySelectorAll('.' + className);
      if (window.SHAPES[shapeKey]) {
        els.forEach(el => {
          el.innerHTML = window.generateShapeSVG(shapeKey, { size: 32, className: 'shape-user-section' });
        });
      }
    });
  })();
  </script>
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
        <span class="chip" style="margin-left:var(--space-2)">Level ${escapeHtml(r.level)}</span>
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
        <span class="chip" style="margin-left:var(--space-2)">${escapeHtml(t.points)} pts</span>
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
  <a class="btn btn-text btn-standard" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:var(--space-1)">
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
      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:var(--space-2)">
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
      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:var(--space-2)">
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
          <input type="text" id="rank-name" name="name" required placeholder="Enter rank name">
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
        <button class="btn btn-filled" type="submit" style="gap:var(--space-2);height:48px">
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
          <input type="text" id="infraction-name" name="name" required placeholder="Enter violation type">
        </div>
        <div class="field-group" style="width:100px;margin-bottom:0">
          <label for="infraction-points">Points</label>
          <input type="text" id="infraction-points" name="points" required placeholder="1" inputmode="numeric" pattern="[0-9]+">
        </div>
        <button class="btn btn-filled" type="submit" style="gap:var(--space-2);height:48px">
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
      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:var(--space-2)">
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
        <div style="display:grid;grid-template-columns:1fr 80px 80px auto;gap:var(--space-2);align-items:flex-end;padding:var(--space-2);background:var(--md-sys-color-surface-dim);border-radius:var(--md-sys-shape-corner-small)">
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
          <input id="new-shift-name" type="text" name="label" placeholder="Enter shift type" required>
        </div>
        <div class="field-group" style="min-width:100px">
          <label for="new-shift-min">Min (minutes)</label>
          <input id="new-shift-min" type="number" name="minDuration" placeholder="15" min="1" required>
        </div>
        <div class="field-group" style="min-width:100px">
          <label for="new-shift-max">Max (minutes)</label>
          <input id="new-shift-max" type="number" name="maxDuration" placeholder="120" min="1" required>
        </div>
        <button class="btn btn-filled" type="submit" style="gap:var(--space-2);align-self:flex-start">
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
        <button class="btn btn-filled" type="submit" style="gap:var(--space-2);align-self:flex-start">
          ${icon('check')}
          <span>Save API Key</span>
        </button>
      </div>
    </form>

    <div style="margin-top:var(--space-3);padding:var(--space-2);background:var(--md-sys-color-surface-dim);border-radius:var(--md-sys-shape-corner-small);border-left:4px solid var(--md-sys-color-outline)">
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
        <div style="padding:var(--space-2);background:var(--md-sys-color-surface-dim);border-radius:var(--md-sys-shape-corner-small)">
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
        <div style="padding:var(--space-2);background:var(--md-sys-color-secondary-container);border-radius:var(--md-sys-shape-corner-small)">
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
        <input id="violation-label" type="text" name="label" placeholder="Enter violation name" required>
      </div>
      <div class="field-group">
        <label for="violation-codes">Short Codes (comma-separated)</label>
        <input id="violation-codes" type="text" name="codes" placeholder="Enter keywords" required>
      </div>
      <div class="field-group">
        <label for="violation-desc">Description</label>
        <input id="violation-desc" type="text" name="description" placeholder="What this violation is for" required>
      </div>
      <button class="btn btn-filled" type="submit" style="align-self:flex-start;gap:var(--space-2)">
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
  <a class="btn btn-text btn-standard" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:var(--space-1)">
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
  <a class="btn btn-text btn-standard" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:var(--space-1)">
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
    <a href="/dashboard/${escapeHtml(guildId)}/data-deletion?new=1" class="btn btn-text btn-standard" style="margin-top:var(--space-3)">Submit another request</a>
  </div>
</div>`;
    return layout({ title: 'Data Deletion', body });
  }

  const deniedNotice = status === 'denied' ? `
    <div class="info-card" style="border-left:4px solid var(--md-sys-color-error);margin-bottom:var(--space-3)">
      <div class="info-card-title">Previous Request Denied</div>
      <p class="body-medium" style="color:var(--md-sys-color-on-surface-variant);margin-top:var(--space-1)">
        Your last request, submitted ${formatDate(latestRequest.requested_at)}, was reviewed and denied. You can submit a new one below.
      </p>
    </div>` : '';

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">Data Deletion Request</h1>
  <a class="btn btn-text btn-standard" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:var(--space-1)">
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
          <input type="text" id="deletion-reason" name="reason" placeholder="Enter reason">
        </div>
        <button class="btn btn-filled btn-danger" type="submit" style="align-self:flex-start;gap:var(--space-2)">
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
    
    <div class="card card-elevated">
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
        <div style="padding:var(--space-3);background:var(--md-sys-color-surface-dim);border-radius:var(--md-sys-shape-corner-small);border-left:4px solid ${
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
    : filtered.map((e, idx) => {
      const staffLine = e.staff ? '<p class="body-small" style="color:var(--md-sys-color-on-surface-variant)">By: ' + escapeHtml(e.staff) + '</p>' : '';
      let shapeKey = 'circle';
      if (e.type === 'infraction') shapeKey = 'boom';
      if (e.type === 'promotion') shapeKey = 'starFive';
      if (e.type === 'demotion') shapeKey = 'wave';
      if (e.type === 'shift_join') shapeKey = 'flower';
      return '<div style="padding:var(--space-2);background:var(--md-sys-color-surface-dim);border-radius:var(--md-sys-shape-corner-small);border-left:4px solid var(--md-sys-color-primary);position:relative;overflow:hidden">' +
        '<div style="position:absolute;right:-20px;bottom:-20px;opacity:0.08;width:80px;height:80px;pointer-events:none" class="audit-event-shape" data-shape="' + shapeKey + '"></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-1);position:relative;z-index:1">' +
          '<div>' +
            '<span class="badge badge-info">' + escapeHtml(formatType(e.type)) + '</span>' +
            '<span style="margin-left:var(--space-1);color:var(--md-sys-color-on-surface-variant);font-size:var(--md-sys-typescale-body-small-size)">' + formatDate(e.timestamp) + '</span>' +
          '</div>' +
          '<span class="body-small" style="color:var(--md-sys-color-on-surface-variant)">User: ' + escapeHtml(e.user) + '</span>' +
        '</div>' +
        '<p class="body-medium" style="margin:var(--space-1) 0;position:relative;z-index:1">' +
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
      '<button class="btn btn-filled" type="submit" style="gap:var(--space-2);align-self:flex-start">' +
        icon('search') + '<span>Filter</span>' +
      '</button>' +
      '<button class="btn btn-outlined" type="button" onclick="downloadCSV()" style="gap:var(--space-2);align-self:flex-start">' +
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
      'window.addEventListener("DOMContentLoaded", function() {' +
        'if (!window.SHAPES || !window.generateShapeSVG) return;' +
        'const shapeCards = document.querySelectorAll(".audit-event-shape");' +
        'shapeCards.forEach(card => {' +
          'const shapeKey = card.getAttribute("data-shape");' +
          'if (window.SHAPES[shapeKey]) {' +
            'card.innerHTML = window.generateShapeSVG(shapeKey, { size: 80, className: "shape-audit-bg" });' +
          '}' +
        '});' +
      '});' +
    '</script>';

  return content + '<div style="text-align:center;margin-top:var(--space-4)"><a href="/dashboard/' + escapeHtml(guildId) + '/staff" class="btn btn-text btn-standard">Back to Dashboard</a></div>';
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
          <button class="btn btn-filled" type="submit" style="gap:var(--space-2)">
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
  <a class="btn btn-text btn-standard" href="/dashboard/${escapeHtml(guildId)}/staff" style="gap:var(--space-1)">
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
  <a class="btn btn-text btn-standard" href="/" style="gap:var(--space-1)">
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
  <a class="btn btn-text btn-standard" href="/" style="gap:var(--space-1)">
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

/* ============================================================================
   FORM COMPONENT TEMPLATES - PHASE 1
   ============================================================================ */

// Text Field Component
function renderTextField(options = {}) {
  const {
    id = 'text-field-' + Math.random().toString(36).substr(2, 9),
    label = 'Input',
    placeholder = '',
    value = '',
    type = 'text',
    variant = 'outlined', // 'outlined' or 'filled'
    error = false,
    errorMessage = '',
    helperText = '',
    disabled = false,
    required = false,
    icon = null,
    iconPosition = 'left'
  } = options;

  let inputClass = `text-field ${variant}`;
  if (error) inputClass += ' error';

  let iconHTML = '';
  if (icon) {
    iconHTML = `<span class="input-icon">${icon}</span>`;
  }

  const requiredHTML = required ? '<span class="required">*</span>' : '';
  const helperHTML = helperText ? `<div class="helper-text">${helperText}</div>` : '';
  const errorHTML = error && errorMessage ? `<div class="error-message">${errorMessage}</div>` : '';

  const containerClass = icon ? `input-with-icon icon-${iconPosition}` : '';

  return `
    <div class="form-field ${error ? 'error' : ''}">
      <label for="${id}">${label}${requiredHTML}</label>
      <div class="${containerClass}">
        <input
          id="${id}"
          type="${type}"
          class="${inputClass}"
          placeholder="${placeholder}"
          value="${value}"
          ${disabled ? 'disabled' : ''}
          ${required ? 'required' : ''}
        />
        ${iconHTML}
      </div>
      ${helperHTML}
      ${errorHTML}
    </div>
  `;
}

// Checkbox Component
function renderCheckbox(options = {}) {
  const {
    id = 'checkbox-' + Math.random().toString(36).substr(2, 9),
    label = 'Checkbox',
    checked = false,
    disabled = false,
    name = ''
  } = options;

  return `
    <div class="checkbox">
      <input
        id="${id}"
        type="checkbox"
        name="${name || id}"
        ${checked ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
      />
      <label for="${id}">${label}</label>
    </div>
  `;
}

// Radio Button Component
function renderRadio(options = {}) {
  const {
    id = 'radio-' + Math.random().toString(36).substr(2, 9),
    label = 'Option',
    name = 'radio-group',
    value = '',
    checked = false,
    disabled = false
  } = options;

  return `
    <div class="radio">
      <input
        id="${id}"
        type="radio"
        name="${name}"
        value="${value}"
        ${checked ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
      />
      <label for="${id}">${label}</label>
    </div>
  `;
}

// Radio Group Component
function renderRadioGroup(options = {}) {
  const {
    name = 'radio-group',
    label = 'Select one',
    options: items = [],
    selected = '',
    disabled = false
  } = options;

  const itemsHTML = items.map((item, idx) =>
    renderRadio({
      id: `${name}-${idx}`,
      name,
      label: item.label,
      value: item.value,
      checked: selected === item.value,
      disabled: disabled || item.disabled
    })
  ).join('');

  return `
    <fieldset class="radio-group">
      <legend>${label}</legend>
      ${itemsHTML}
    </fieldset>
  `;
}

// Switch Component
function renderSwitch(options = {}) {
  const {
    id = 'switch-' + Math.random().toString(36).substr(2, 9),
    label = 'Toggle',
    checked = false,
    disabled = false,
    name = ''
  } = options;

  return `
    <div class="switch">
      <input
        id="${id}"
        type="checkbox"
        name="${name || id}"
        ${checked ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
      />
      <label for="${id}">${label}</label>
    </div>
  `;
}

// Slider Component
function renderSlider(options = {}) {
  const {
    id = 'slider-' + Math.random().toString(36).substr(2, 9),
    label = 'Adjust',
    min = 0,
    max = 100,
    value = 50,
    step = 1,
    disabled = false,
    showValue = true
  } = options;

  const valueHTML = showValue ? `<div class="slider-value"><span id="${id}-value">${value}</span></div>` : '';

  return `
    <div class="slider-group">
      <label for="${id}">${label}</label>
      <input
        id="${id}"
        type="range"
        class="slider"
        min="${min}"
        max="${max}"
        value="${value}"
        step="${step}"
        ${disabled ? 'disabled' : ''}
      />
      ${valueHTML}
    </div>
  `;
}

// Checkbox Group Component
function renderCheckboxGroup(options = {}) {
  const {
    label = 'Select options',
    options: items = [],
    selected = [],
    disabled = false
  } = options;

  const itemsHTML = items.map((item, idx) =>
    renderCheckbox({
      id: `checkbox-${idx}`,
      label: item.label,
      checked: selected.includes(item.value),
      disabled: disabled || item.disabled,
      name: item.name || `checkbox-${idx}`
    })
  ).join('');

  return `
    <fieldset class="checkbox-group">
      <legend>${label}</legend>
      ${itemsHTML}
    </fieldset>
  `;
}

// Complete Form Example
function renderExampleForm() {
  return `
    <form class="form">
      <h2>Staff Registration Form</h2>
      
      <div class="form-row">
        ${renderTextField({
          label: 'Full Name',
          placeholder: 'John Doe',
          required: true,
          helperText: 'Enter your full legal name'
        })}
        ${renderTextField({
          label: 'Email Address',
          type: 'email',
          placeholder: 'john@example.com',
          required: true,
          helperText: 'We\'ll use this for notifications'
        })}
      </div>

      <div class="form-row">
        ${renderTextField({
          label: 'Discord Handle',
          placeholder: '@username',
          required: true,
          icon: '#'
        })}
        ${renderTextField({
          label: 'Department',
          placeholder: 'e.g. Moderation',
          variant: 'filled'
        })}
      </div>

      ${renderRadioGroup({
        name: 'role',
        label: 'Select Role',
        options: [
          { label: 'Moderator', value: 'mod' },
          { label: 'Administrator', value: 'admin' },
          { label: 'Staff', value: 'staff' }
        ],
        selected: 'mod'
      })}

      ${renderCheckboxGroup({
        label: 'Permissions',
        options: [
          { label: 'Can kick members', value: 'kick' },
          { label: 'Can ban members', value: 'ban' },
          { label: 'Can manage roles', value: 'roles' },
          { label: 'Can access logs', value: 'logs' }
        ],
        selected: ['kick', 'ban']
      })}

      ${renderSwitch({
        label: 'Email notifications enabled',
        checked: true
      })}

      ${renderSlider({
        label: 'Max warnings before kick',
        min: 1,
        max: 10,
        value: 3,
        showValue: true
      })}

      <div class="form-actions">
        <button class="btn-outlined">Cancel</button>
        <button class="btn-filled">Save Changes</button>
      </div>
    </form>
  `;
}


// ADVANCED FORM UTILITIES

// Validation Rules
const ValidationRules = {
  required: (value) => {
    if (!value || value.trim() === '') return 'This field is required';
    return null;
  },
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) return 'Please enter a valid email';
    return null;
  },
  
  minLength: (min) => (value) => {
    if (value && value.length < min) return `Minimum ${min} characters required`;
    return null;
  },
  
  maxLength: (max) => (value) => {
    if (value && value.length > max) return `Maximum ${max} characters allowed`;
    return null;
  },
  
  minValue: (min) => (value) => {
    if (value && Number(value) < min) return `Minimum value is ${min}`;
    return null;
  },
  
  maxValue: (max) => (value) => {
    if (value && Number(value) > max) return `Maximum value is ${max}`;
    return null;
  },
  
  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) return message || 'Invalid format';
    return null;
  },
  
  match: (otherFieldId, fieldName) => (value) => {
    const other = document.getElementById(otherFieldId);
    if (value !== other?.value) return `${fieldName} must match`;
    return null;
  }
};

// Form Builder Class
class FormBuilder {
  constructor(options = {}) {
    this.options = options;
    this.fields = [];
    this.sections = [];
    this.validators = {};
  }

  addSection(title, description = '') {
    this.sections.push({ title, description, fieldIndices: [] });
    return this;
  }

  addField(fieldOptions) {
    const index = this.fields.length;
    this.fields.push(fieldOptions);
    if (this.sections.length > 0) {
      this.sections[this.sections.length - 1].fieldIndices.push(index);
    }
    return this;
  }

  addValidator(fieldId, validationRules) {
    this.validators[fieldId] = validationRules;
    return this;
  }

  render() {
    if (this.sections.length === 0) {
      // Single section render
      return this.renderFields(this.fields);
    }

    let html = '<form class="form">';
    this.sections.forEach((section, idx) => {
      html += `<div class="form-section">`;
      if (section.title) {
        html += `<h3 class="form-section-title">${section.title}</h3>`;
      }
      if (section.description) {
        html += `<p class="form-section-description">${section.description}</p>`;
      }

      section.fieldIndices.forEach(fieldIdx => {
        html += this.renderField(this.fields[fieldIdx]);
      });

      html += `</div>`;
    });
    html += '</form>';
    return html;
  }

  renderFields(fields) {
    let html = '<form class="form">';
    fields.forEach(field => {
      html += this.renderField(field);
    });
    html += '</form>';
    return html;
  }

  renderField(fieldOptions) {
    const type = fieldOptions.type || 'text';
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
        return renderTextField(fieldOptions);
      case 'checkbox':
        return renderCheckbox(fieldOptions);
      case 'radio':
        return renderRadio(fieldOptions);
      case 'radio-group':
        return renderRadioGroup(fieldOptions);
      case 'switch':
        return renderSwitch(fieldOptions);
      case 'slider':
        return renderSlider(fieldOptions);
      case 'checkbox-group':
        return renderCheckboxGroup(fieldOptions);
      default:
        return renderTextField(fieldOptions);
    }
  }
}

// Form Validation Function
function validateForm(formElement) {
  const errors = {};
  const formData = new FormData(formElement);

  for (let [name, value] of formData) {
    const input = formElement.querySelector(`[name="${name}"]`);
    if (!input) continue;

    const validators = input.dataset.validators?.split(',') || [];
    const rules = [];

    validators.forEach(validatorName => {
      const ruleStr = input.dataset[`validate${validatorName.charAt(0).toUpperCase()}${validatorName.slice(1)}`];
      if (ruleStr && ValidationRules[validatorName]) {
        rules.push(ValidationRules[validatorName](ruleStr));
      }
    });

    if (input.required) rules.push(ValidationRules.required);

    let fieldError = null;
    for (let rule of rules) {
      fieldError = rule(value);
      if (fieldError) break;
    }

    if (fieldError) {
      errors[name] = fieldError;
      input.classList.add('error');
      input.classList.remove('valid');
    } else {
      input.classList.remove('error');
      input.classList.add('valid');
    }
  }

  return Object.keys(errors).length === 0 ? null : errors;
}

// Real-time Validation Setup
function setupRealtimeValidation(formElement) {
  const inputs = formElement.querySelectorAll('input, textarea, select');

  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateField(input);
    });

    if (input.dataset.debounce) {
      let debounceTimer;
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          validateField(input);
        }, 500);
      });
    }
  });
}

// Validate Single Field
function validateField(input) {
  const value = input.value;
  const validators = input.dataset.validators?.split(',') || [];
  
  let error = null;

  if (input.required && !value.trim()) {
    error = 'This field is required';
  }

  if (!error && input.type === 'email' && value) {
    error = ValidationRules.email(value);
  }

  if (!error && input.minLength && value) {
    error = ValidationRules.minLength(input.minLength)(value);
  }

  const errorElement = input.closest('.form-field')?.querySelector('.error-message');
  if (errorElement) {
    if (error) {
      errorElement.textContent = error;
      errorElement.style.display = 'block';
      input.classList.add('error');
      input.classList.remove('valid');
    } else {
      errorElement.style.display = 'none';
      input.classList.remove('error');
      input.classList.add('valid');
    }
  }

  return !error;
}

// Form Data Extractor
function getFormData(formElement) {
  const data = {};
  const formData = new FormData(formElement);

  for (let [name, value] of formData) {
    if (data[name] === undefined) {
      data[name] = value;
    } else if (Array.isArray(data[name])) {
      data[name].push(value);
    } else {
      data[name] = [data[name], value];
    }
  }

  return data;
}

// Reset Form with Options
function resetForm(formElement, options = {}) {
  formElement.reset();

  if (options.clearErrors !== false) {
    formElement.querySelectorAll('input, textarea').forEach(input => {
      input.classList.remove('error', 'valid');
    });
  }

  if (options.clearMessages !== false) {
    formElement.querySelectorAll('.error-message').forEach(msg => {
      msg.textContent = '';
      msg.style.display = 'none';
    });
  }
}


/* ============================================================================
   NAVIGATION COMPONENT TEMPLATES - PHASE 2
   ============================================================================ */

// Top App Bar Component
function renderTopAppBar(options = {}) {
  const {
    title = 'Dashboard',
    variant = 'standard', // 'standard' or 'compact' or 'centered'
    leadingIcon = null,
    leadingAction = null,
    actions = [], // Array of { icon, label, action }
    showSearch = false
  } = options;

  let leadingHTML = '';
  if (leadingIcon) {
    leadingHTML = `
      <button class="icon-button" onclick="${leadingAction || ''}" aria-label="Back">
        ${leadingIcon}
      </button>
    `;
  }

  let actionsHTML = '';
  if (showSearch) {
    actionsHTML += `
      <input 
        type="search" 
        placeholder="Search..." 
        class="text-field outlined search-input"
        style="width: 200px; height: 40px;"
      />
    `;
  }

  actions.forEach(action => {
    actionsHTML += `
      <button class="icon-button" onclick="${action.action || ''}" aria-label="${action.label}">
        ${action.icon}
      </button>
    `;
  });

  return `
    <header class="top-app-bar ${variant}">
      <div class="top-app-bar-section">
        ${leadingHTML}
        <h1 class="top-app-bar-title">${title}</h1>
      </div>
      <div class="top-app-bar-section top-app-bar-actions">
        ${actionsHTML}
      </div>
    </header>
  `;
}

// Bottom Navigation Component
function renderBottomNavigation(options = {}) {
  const {
    items = [],
    activeIndex = 0,
    onSelect = null
  } = options;

  let itemsHTML = '';
  items.forEach((item, idx) => {
    const activeClass = idx === activeIndex ? 'active' : '';
    const onclick = onSelect ? `onclick="${onSelect}(${idx})"` : '';
    itemsHTML += `
      <a href="${item.href || '#'}" class="bottom-nav-item ${activeClass}" ${onclick}>
        <span class="bottom-nav-icon">${item.icon}</span>
        <span class="bottom-nav-label">${item.label}</span>
      </a>
    `;
  });

  return `
    <nav class="bottom-navigation" role="navigation">
      ${itemsHTML}
    </nav>
  `;
}

// Navigation Rail Component
function renderNavigationRail(options = {}) {
  const {
    items = [],
    activeIndex = 0,
    onSelect = null,
    floatingActionButton = null
  } = options;

  let itemsHTML = '';
  items.forEach((item, idx) => {
    const activeClass = idx === activeIndex ? 'active' : '';
    const onclick = onSelect ? `onclick="${onSelect}(${idx})"` : '';
    itemsHTML += `
      <a href="${item.href || '#'}" class="nav-rail-item ${activeClass}" ${onclick} title="${item.label}">
        <span class="nav-rail-icon">${item.icon}</span>
        <span class="nav-rail-label">${item.label}</span>
      </a>
    `;
  });

  return `
    <nav class="navigation-rail" role="navigation">
      ${itemsHTML}
      ${floatingActionButton ? `<div style="flex: 1;"></div>${floatingActionButton}` : ''}
    </nav>
  `;
}

// Menu Component
function renderMenu(options = {}) {
  const {
    id = 'menu-' + Math.random().toString(36).substr(2, 9),
    trigger = '⋮',
    items = [],
    onSelect = null
  } = options;

  let itemsHTML = '';
  items.forEach((item, idx) => {
    if (item.divider) {
      itemsHTML += '<div class="menu-divider"></div>';
    } else {
      const onclick = onSelect ? `onclick="${onSelect}(${idx})"` : '';
      const disabledClass = item.disabled ? 'disabled' : '';
      itemsHTML += `
        <button class="menu-item ${disabledClass}" ${onclick} ${item.disabled ? 'disabled' : ''}>
          ${item.icon ? `<span>${item.icon}</span>` : ''}
          <span>${item.label}</span>
        </button>
      `;
    }
  });

  return `
    <div class="menu-container">
      <button class="menu-trigger" onclick="document.getElementById('${id}').classList.toggle('open')">
        ${trigger}
      </button>
      <div class="menu" id="${id}">
        ${itemsHTML}
      </div>
    </div>
  `;
}

// Tabs Component
function renderTabs(options = {}) {
  const {
    tabs = [],
    activeIndex = 0,
    onSelect = null
  } = options;

  let tabsHTML = '';
  tabs.forEach((tab, idx) => {
    const activeClass = idx === activeIndex ? 'active' : '';
    const onclick = onSelect ? `onclick="${onSelect}(${idx})"` : '';
    tabsHTML += `
      <button class="tab ${activeClass}" ${onclick} role="tab">
        ${tab.icon ? `<span>${tab.icon}</span>` : ''}
        ${tab.label}
      </button>
    `;
  });

  return `<div class="tabs" role="tablist">${tabsHTML}</div>`;
}

// Breadcrumbs Component
function renderBreadcrumbs(options = {}) {
  const {
    items = [],
    separator = '/'
  } = options;

  let html = '<nav class="breadcrumbs" aria-label="Breadcrumb">';
  
  items.forEach((item, idx) => {
    if (idx > 0) {
      html += `<span class="breadcrumb-separator">${separator}</span>`;
    }

    if (idx === items.length - 1) {
      // Current page
      html += `
        <div class="breadcrumb-item">
          <span class="breadcrumb-current">${item.label}</span>
        </div>
      `;
    } else {
      // Link
      html += `
        <div class="breadcrumb-item">
          <a href="${item.href || '#'}" class="breadcrumb-link">${item.label}</a>
        </div>
      `;
    }
  });

  html += '</nav>';
  return html;
}

// Navigation Builder Class
class NavigationBuilder {
  constructor() {
    this.topBar = null;
    this.bottomNav = null;
    this.navRail = null;
    this.breadcrumbs = null;
  }

  setTopBar(options) {
    this.topBar = renderTopAppBar(options);
    return this;
  }

  setBottomNav(options) {
    this.bottomNav = renderBottomNavigation(options);
    return this;
  }

  setNavRail(options) {
    this.navRail = renderNavigationRail(options);
    return this;
  }

  setBreadcrumbs(options) {
    this.breadcrumbs = renderBreadcrumbs(options);
    return this;
  }

  render() {
    let html = '';
    if (this.topBar) html += this.topBar;
    if (this.navRail) html += this.navRail;
    if (this.breadcrumbs) html += this.breadcrumbs;
    if (this.bottomNav) html += this.bottomNav;
    return html;
  }
}

// Example Navigation Setup for Staff Dashboard
function createStaffDashboardNav() {
  return new NavigationBuilder()
    .setTopBar({
      title: 'ISRP Staff Dashboard',
      variant: 'standard',
      leadingIcon: '☰',
      actions: [
        { icon: '🔔', label: 'Notifications', action: 'showNotifications()' },
        { icon: '👤', label: 'Profile', action: 'showProfile()' }
      ],
      showSearch: true
    })
    .setBottomNav({
      items: [
        { icon: '📊', label: 'Dashboard', href: '/dashboard' },
        { icon: '👥', label: 'Members', href: '/members' },
        { icon: '⚠️', label: 'Reports', href: '/reports' },
        { icon: '⚙️', label: 'Settings', href: '/settings' }
      ],
      activeIndex: 0
    })
    .setNavRail({
      items: [
        { icon: '📊', label: 'Dashboard', href: '/dashboard' },
        { icon: '👥', label: 'Members', href: '/members' },
        { icon: '⚠️', label: 'Warnings', href: '/warnings' },
        { icon: '🔒', label: 'Permissions', href: '/permissions' },
        { icon: '📝', label: 'Logs', href: '/logs' },
        { icon: '⚙️', label: 'Settings', href: '/settings' }
      ],
      activeIndex: 0
    })
    .render();
}


/* ============================================================================
   DATA DISPLAY COMPONENT TEMPLATES - PHASE 3
   ============================================================================ */

// List Item Component
function renderListItem(options = {}) {
  const {
    headline = 'Item title',
    supporting = 'Supporting text',
    avatar = null,
    trailing = null,
    onClick = null,
    selected = false,
    threeLineMode = false
  } = options;

  const selectedClass = selected ? 'selected' : '';
  const threeLineClass = threeLineMode ? 'three-line' : '';
  const onclick = onClick ? `onclick="${onClick}"` : '';

  let avatarHTML = '';
  if (avatar) {
    avatarHTML = `<img src="${avatar}" alt="" class="list-item-avatar" />`;
  }

  let trailingHTML = '';
  if (trailing) {
    trailingHTML = `
      <div class="list-item-trailing">
        ${typeof trailing === 'string' ? trailing : JSON.stringify(trailing)}
      </div>
    `;
  }

  return `
    <div class="list-item ${selectedClass} ${threeLineClass}" ${onclick}>
      ${avatarHTML}
      <div class="list-item-content">
        <div class="list-item-headline">${headline}</div>
        <div class="list-item-supporting">${supporting}</div>
      </div>
      ${trailingHTML}
    </div>
  `;
}

// List Component
function renderList(options = {}) {
  const {
    items = [],
    compact = false,
    onItemClick = null
  } = options;

  const compactClass = compact ? 'compact' : '';
  let itemsHTML = items.map((item, idx) =>
    renderListItem({
      ...item,
      onClick: onItemClick ? `${onItemClick}(${idx})` : null
    })
  ).join('');

  return `<div class="list ${compactClass}">${itemsHTML}</div>`;
}

// Table Component
function renderTable(options = {}) {
  const {
    headers = [],
    rows = [],
    dense = false,
    stickyHeader = false,
    onRowClick = null,
    hasCheckboxes = false,
    hasActions = false
  } = options;

  const denseClass = dense ? 'dense' : '';
  const stickyClass = stickyHeader ? 'sticky-header' : '';

  // Build header
  let headerHTML = '<tr>';
  if (hasCheckboxes) {
    headerHTML += '<th class="table-checkbox"><input type="checkbox" /></th>';
  }
  headers.forEach(header => {
    headerHTML += `<th>${header}</th>`;
  });
  if (hasActions) {
    headerHTML += '<th class="table-actions">Actions</th>';
  }
  headerHTML += '</tr>';

  // Build rows
  let rowsHTML = '';
  rows.forEach((row, idx) => {
    rowsHTML += '<tr>';
    if (hasCheckboxes) {
      rowsHTML += '<td class="table-checkbox"><input type="checkbox" /></td>';
    }
    Object.values(row).forEach(cell => {
      rowsHTML += `<td>${cell}</td>`;
    });
    if (hasActions) {
      rowsHTML += `
        <td class="table-actions">
          <button class="table-action-btn" onclick="editRow(${idx})">Edit</button>
          <button class="table-action-btn" onclick="deleteRow(${idx})">Delete</button>
        </td>
      `;
    }
    rowsHTML += '</tr>';
  });

  return `
    <div class="table-container ${stickyClass}">
      <table class="${denseClass}">
        <thead>${headerHTML}</thead>
        <tbody>${rowsHTML}</tbody>
      </table>
    </div>
  `;
}

// Pagination Component
function renderPagination(options = {}) {
  const {
    totalPages = 10,
    currentPage = 1,
    onPageChange = null,
    maxVisiblePages = 5
  } = options;

  let itemsHTML = '';

  // Previous button
  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  const prevOnClick = onPageChange && currentPage > 1 ? `onclick="${onPageChange}(${currentPage - 1})"` : '';
  itemsHTML += `<button class="pagination-item ${prevDisabled}" ${prevOnClick}>←</button>`;

  // Page numbers
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (startPage > 1) {
    itemsHTML += `<button class="pagination-item" onclick="${onPageChange}(1)">1</button>`;
    if (startPage > 2) {
      itemsHTML += '<span class="pagination-ellipsis">...</span>';
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === currentPage ? 'active' : '';
    const onClick = onPageChange ? `onclick="${onPageChange}(${i})"` : '';
    itemsHTML += `<button class="pagination-item ${activeClass}" ${onClick}>${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      itemsHTML += '<span class="pagination-ellipsis">...</span>';
    }
    const onClick = onPageChange ? `onclick="${onPageChange}(${totalPages})"` : '';
    itemsHTML += `<button class="pagination-item" ${onClick}>${totalPages}</button>`;
  }

  // Next button
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';
  const nextOnClick = onPageChange && currentPage < totalPages ? `onclick="${onPageChange}(${currentPage + 1})"` : '';
  itemsHTML += `<button class="pagination-item ${nextDisabled}" ${nextOnClick}>→</button>`;

  const label = `Page ${currentPage} of ${totalPages}`;

  return `
    <div class="pagination">
      ${itemsHTML}
      <span class="pagination-label">${label}</span>
    </div>
  `;
}

// Data Grid Component
function renderDataGrid(options = {}) {
  const {
    items = [],
    onItemClick = null
  } = options;

  let itemsHTML = items.map((item, idx) => `
    <div class="data-grid-item" onclick="${onItemClick ? onItemClick + '(' + idx + ')' : ''}">
      <div class="data-grid-item-header">
        <h3 class="data-grid-item-title">${item.title}</h3>
        ${item.badge ? `<span class="list-item-trailing-badge">${item.badge}</span>` : ''}
      </div>
      ${item.subtitle ? `<div class="data-grid-item-subtitle">${item.subtitle}</div>` : ''}
      ${item.content ? `<div class="data-grid-item-content">${item.content}</div>` : ''}
      ${item.footer ? `
        <div class="data-grid-item-footer">
          <span class="data-grid-item-meta">${item.footer}</span>
        </div>
      ` : ''}
    </div>
  `).join('');

  return `<div class="data-grid">${itemsHTML}</div>`;
}

// Empty State Component
function renderEmptyState(options = {}) {
  const {
    icon = '📭',
    title = 'No data',
    description = 'There\'s nothing to display here',
    actionLabel = 'Create',
    onAction = null
  } = options;

  const actionButton = onAction ? `
    <div class="empty-state-action">
      <button class="btn-filled" onclick="${onAction}">${actionLabel}</button>
    </div>
  ` : '';

  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-description">${description}</p>
      ${actionButton}
    </div>
  `;
}

// Example: Staff List
function renderStaffList() {
  return renderList({
    items: [
      {
        avatar: 'https://via.placeholder.com/40',
        headline: 'John Moderator',
        supporting: 'Moderator • Online',
        trailing: '<span class="list-item-trailing-badge">MOD</span>',
        onClick: 'selectStaff'
      },
      {
        avatar: 'https://via.placeholder.com/40',
        headline: 'Jane Administrator',
        supporting: 'Administrator • Away',
        trailing: '<span class="list-item-trailing-badge">ADMIN</span>',
        onClick: 'selectStaff'
      },
      {
        avatar: 'https://via.placeholder.com/40',
        headline: 'Bob Helper',
        supporting: 'Helper • Offline',
        trailing: '<span class="list-item-trailing-badge">HELPER</span>',
        onClick: 'selectStaff'
      }
    ]
  });
}

// Example: Staff Table
function renderStaffTable() {
  return renderTable({
    headers: ['Name', 'Role', 'Status', 'Warnings'],
    rows: [
      { Name: 'John Moderator', Role: 'Moderator', Status: 'Online', Warnings: '2' },
      { Name: 'Jane Administrator', Role: 'Admin', Status: 'Away', Warnings: '0' },
      { Name: 'Bob Helper', Role: 'Helper', Status: 'Offline', Warnings: '1' }
    ],
    hasCheckboxes: true,
    hasActions: true,
    dense: false,
    stickyHeader: true
  });
}


/* ============================================================================
   SEARCH & FILTER COMPONENT TEMPLATES - PHASE 4
   ============================================================================ */

// Search Bar Component
function renderSearchBar(options = {}) {
  const {
    placeholder = 'Search...',
    value = '',
    onSearch = null,
    onClear = null,
    variant = 'filled', // 'filled' or 'outlined'
    compact = false,
    showIcon = true
  } = options;

  const variantClass = variant === 'outlined' ? 'outlined' : '';
  const compactClass = compact ? 'compact' : '';

  const clearHandler = onClear || 'clearSearchInput(this)';
  
  return `
    <div class="search-bar ${variantClass} ${compactClass}">
      ${showIcon ? '<span class="search-icon">🔍</span>' : ''}
      <input
        type="text"
        class="search-input"
        placeholder="${placeholder}"
        value="${value}"
        ${onSearch ? `onkeyup="${onSearch}(this.value)"` : ''}
      />
      ${value ? `<button class="search-clear" onclick="${clearHandler}">✕</button>` : ''}
    </div>
  `;
}

// Filter Chip Component
function renderFilterChip(options = {}) {
  const {
    label = 'Filter',
    active = false,
    removable = false,
    onClick = null,
    onRemove = null,
    icon = null
  } = options;

  const activeClass = active ? 'active' : '';
  const removableClass = removable ? 'removable' : '';

  let removeButton = '';
  if (removable) {
    removeButton = `
      <button class="filter-chip-remove" onclick="${onRemove || ''}" aria-label="Remove filter">
        ✕
      </button>
    `;
  }

  return `
    <button class="filter-chip ${activeClass} ${removableClass}" onclick="${onClick || ''}">
      ${icon ? `<span>${icon}</span>` : ''}
      <span>${label}</span>
      ${removeButton}
    </button>
  `;
}

// Filter Chips Group
function renderFilterChips(options = {}) {
  const {
    chips = [],
    onChipClick = null,
    onChipRemove = null
  } = options;

  let chipsHTML = chips.map((chip, idx) =>
    renderFilterChip({
      ...chip,
      onClick: onChipClick ? `${onChipClick}(${idx})` : null,
      onRemove: onChipRemove ? `${onChipRemove}(${idx})` : null
    })
  ).join('');

  return `<div class="filter-chips">${chipsHTML}</div>`;
}

// Advanced Filter Panel
function renderFilterPanel(options = {}) {
  const {
    sections = [], // Array of { title, filters: [{ type, label, options, selected }] }
    onApply = null,
    onReset = null
  } = options;

  let sectionsHTML = '';
  sections.forEach((section, sIdx) => {
    sectionsHTML += `
      <div class="filter-panel-section">
        <div class="filter-panel-title">${section.title}</div>
        <div class="filter-group">
    `;

    section.filters.forEach((filter, fIdx) => {
      if (filter.type === 'checkbox') {
        sectionsHTML += `
          <label class="filter-option">
            <input type="checkbox" ${filter.selected ? 'checked' : ''} />
            <span>${filter.label}</span>
            ${filter.count ? `<span class="filter-option-count">${filter.count}</span>` : ''}
          </label>
        `;
      } else if (filter.type === 'radio') {
        sectionsHTML += `
          <label class="filter-option">
            <input type="radio" name="filter-${sIdx}" ${filter.selected ? 'checked' : ''} />
            <span>${filter.label}</span>
            ${filter.count ? `<span class="filter-option-count">${filter.count}</span>` : ''}
          </label>
        `;
      }
    });

    sectionsHTML += `</div></div>`;
    if (sIdx < sections.length - 1) {
      sectionsHTML += '<div class="filter-panel-divider"></div>';
    }
  });

  return `
    <div class="filter-panel">
      ${sectionsHTML}
      <div class="filter-panel-actions">
        <button class="btn-outlined" onclick="${onReset || ''}">Reset</button>
        <button class="btn-filled" onclick="${onApply || ''}">Apply Filters</button>
      </div>
    </div>
  `;
}

function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span class="autocomplete-result-bold">$1</span>');
}

// Autocomplete Component
function renderAutocomplete(options = {}) {
  const {
    id = 'autocomplete-' + Math.random().toString(36).substr(2, 9),
    placeholder = 'Search...',
    suggestions = [],
    onSelect = null,
    minChars = 2
  } = options;

  let suggestionsHTML = suggestions.map((item, idx) => {
    const highlightedText = item.highlight ? highlightText(item.text, item.highlight) : item.text;
    return `
    <div class="autocomplete-result" onclick="${onSelect ? onSelect + '(' + idx + ')' : ''}">
      ${item.icon ? `<span>${item.icon}</span>` : ''}
      <span>${highlightedText}</span>
    </div>
  `;
  }).join('');

  return `
    <div class="autocomplete-container">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          id="${id}"
          type="text"
          class="search-input"
          placeholder="${placeholder}"
          data-min-chars="${minChars}"
          onkeyup="handleAutocomplete(this)"
        />
      </div>
      <div class="autocomplete-results" id="${id}-results">
        ${suggestionsHTML}
      </div>
    </div>
  `;
}

// Search Results Display
function renderSearchResults(options = {}) {
  const {
    results = {}, // { category: [items] }
    loading = false,
    noResults = false
  } = options;

  if (loading) {
    return `
      <div class="search-loading">
        <div class="search-loading-spinner"></div>
        <span>Searching...</span>
      </div>
    `;
  }

  if (noResults) {
    return renderEmptyState({
      icon: '🔍',
      title: 'No results found',
      description: 'Try a different search term'
    });
  }

  let html = '<div class="search-results-container">';
  Object.entries(results).forEach(([category, items]) => {
    html += `<div class="search-result-group">`;
    html += `<div class="search-result-group-title">${category}</div>`;
    items.forEach(item => {
      html += renderListItem({
        headline: item.title,
        supporting: item.subtitle,
        trailing: item.trailing
      });
    });
    html += `</div>`;
  });
  html += '</div>';
  return html;
}

// Example: Advanced Filter for Staff Dashboard
function renderStaffFilters() {
  return renderFilterPanel({
    sections: [
      {
        title: 'Role',
        filters: [
          { type: 'radio', label: 'All Roles', count: 15 },
          { type: 'radio', label: 'Moderator', count: 8, selected: true },
          { type: 'radio', label: 'Administrator', count: 3 },
          { type: 'radio', label: 'Helper', count: 4 }
        ]
      },
      {
        title: 'Status',
        filters: [
          { type: 'checkbox', label: 'Online', count: 6 },
          { type: 'checkbox', label: 'Away', count: 4, selected: true },
          { type: 'checkbox', label: 'Offline', count: 5 }
        ]
      },
      {
        title: 'Warnings',
        filters: [
          { type: 'radio', label: 'No warnings', count: 10 },
          { type: 'radio', label: '1-2 warnings', count: 3 },
          { type: 'radio', label: '3+ warnings', count: 2 }
        ]
      }
    ],
    onApply: 'applyStaffFilters()',
    onReset: 'resetStaffFilters()'
  });
}


/* ============================================================================
   MOTION UTILITIES - PHASE 5
   ============================================================================ */

// Spring Animation Controller
class SpringAnimation {
  static applyMotion(element, type = 'spatial', preset = 'expressive') {
    const className = `animate-${type}-${preset}`;
    element.classList.add(className);
  }

  static scaleIn(element, preset = 'expressive') {
    const className = `scale-in-${preset}`;
    element.classList.add(className);
  }

  static fadeIn(element, preset = 'expressive') {
    const className = `fade-in-${preset}`;
    element.classList.add(className);
  }

  static slideUp(element, preset = 'expressive') {
    element.classList.add(`slide-up-${preset}`);
  }

  static slideDown(element, preset = 'expressive') {
    element.classList.add(`slide-down-${preset}`);
  }

  static stagger(container, delay = 30) {
    const items = container.querySelectorAll('.stagger-item');
    items.forEach((item, idx) => {
      item.style.setProperty('--stagger-delay', `${idx * delay}ms`);
    });
  }
}

// Motion Preset Combos
const MotionPresets = {
  BUTTON_PRESS: {
    spatial: 'expressive',
    effect: 'standard',
    duration: 'spring-short'
  },
  MODAL_OPEN: {
    spatial: 'expressive',
    effect: 'expressive',
    duration: 'spring-medium'
  },
  LIST_ITEM_APPEAR: {
    spatial: 'standard',
    effect: 'standard',
    duration: 'spring-medium'
  },
  HOVER_LIFT: {
    spatial: 'expressive',
    effect: 'expressive',
    duration: 'spring-short'
  },
  DISMISS: {
    spatial: 'standard',
    effect: 'standard',
    duration: 'spring-short'
  }
};

// Apply preset to element
function applyMotionPreset(element, presetName) {
  const preset = MotionPresets[presetName];
  if (!preset) return;

  element.classList.add(
    `animate-${preset.spatial}-${preset.effect}`,
    `duration-${preset.duration}`
  );
}

// Stagger animation helper
function staggerAnimateChildren(containerSelector, animationType = 'fade-in') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const children = container.querySelectorAll('[data-stagger]');
  children.forEach((child, idx) => {
    setTimeout(() => {
      child.classList.add(`${animationType}-expressive`);
    }, idx * 30);
  });
}

// Motion preferences detector
const motionPrefs = {
  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  getEasing: (type = 'spatial', preset = 'expressive') => {
    if (motionPrefs.prefersReducedMotion()) return 'ease';
    const token = `--md-sys-motion-easing-${type}-${preset}`;
    return getComputedStyle(document.documentElement).getPropertyValue(token);
  }
};


/* ============================================================================
   RESPONSIVE UTILITIES - PHASE 6
   ============================================================================ */

// Breakpoint detector
const breakpoints = {
  COMPACT: 'compact',
  MEDIUM: 'medium',
  EXPANDED: 'expanded'
};

class ResponsiveManager {
  static getCurrentBreakpoint() {
    const width = window.innerWidth;
    if (width < 600) return breakpoints.COMPACT;
    if (width < 840) return breakpoints.MEDIUM;
    return breakpoints.EXPANDED;
  }

  static isCompact() {
    return this.getCurrentBreakpoint() === breakpoints.COMPACT;
  }

  static isMedium() {
    return this.getCurrentBreakpoint() === breakpoints.MEDIUM;
  }

  static isExpanded() {
    return this.getCurrentBreakpoint() === breakpoints.EXPANDED;
  }

  static getColumns() {
    const bp = this.getCurrentBreakpoint();
    if (bp === breakpoints.COMPACT) return 1;
    if (bp === breakpoints.MEDIUM) return 2;
    return 3;
  }

  static getContainerPadding() {
    const bp = this.getCurrentBreakpoint();
    if (bp === breakpoints.COMPACT) return 16; // var(--space-4)
    if (bp === breakpoints.MEDIUM) return 24;  // var(--space-6)
    return 32;  // var(--space-8)
  }

  static onBreakpointChange(callback) {
    let currentBp = this.getCurrentBreakpoint();
    
    const handleResize = () => {
      const newBp = this.getCurrentBreakpoint();
      if (newBp !== currentBp) {
        currentBp = newBp;
        callback(currentBp);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }

  static isTouchDevice() {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
  }
}

// Adaptive navigation setup
class AdaptiveNavigation {
  static setup() {
    const manager = ResponsiveManager;
    
    // Update navigation based on breakpoint
    manager.onBreakpointChange((bp) => {
      const navRail = document.querySelector('.navigation-rail');
      const bottomNav = document.querySelector('.bottom-navigation');

      if (bp === breakpoints.COMPACT) {
        if (navRail) navRail.style.display = 'none';
        if (bottomNav) bottomNav.style.display = 'flex';
      } else if (bp === breakpoints.MEDIUM) {
        if (navRail) navRail.style.display = 'none';
        if (bottomNav) bottomNav.style.display = 'none';
      } else {
        if (navRail) navRail.style.display = 'flex';
        if (bottomNav) bottomNav.style.display = 'none';
      }
    });
  }
}

// Responsive grid helper
class ResponsiveGrid {
  static renderGrid(items, options = {}) {
    const {
      containerId = 'grid',
      itemsPerRow = { compact: 1, medium: 2, expanded: 3 },
      template = (item) => `<div>${item}</div>`
    } = options;

    const container = document.getElementById(containerId);
    if (!container) return;

    const bp = ResponsiveManager.getCurrentBreakpoint();
    const itemWidth = 100 / itemsPerRow[bp];

    let html = '';
    items.forEach((item, idx) => {
      html += template(item);
    });

    container.innerHTML = html;
  }
}

// Responsive modal positioning
class ResponsiveModal {
  static centerModal(modalElement) {
    const bp = ResponsiveManager.getCurrentBreakpoint();

    if (bp === breakpoints.COMPACT) {
      // Full height modal
      modalElement.style.width = '100%';
      modalElement.style.height = '100%';
      modalElement.style.maxHeight = '100%';
      modalElement.style.borderRadius = '0';
    } else if (bp === breakpoints.MEDIUM) {
      // 90% width, max 512px
      modalElement.style.width = '90%';
      modalElement.style.maxWidth = '512px';
      modalElement.style.height = 'auto';
      modalElement.style.maxHeight = '90vh';
      modalElement.style.borderRadius = 'var(--md-sys-shape-corner-medium)';
    } else {
      // 80% width, max 560px
      modalElement.style.width = '80%';
      modalElement.style.maxWidth = '560px';
      modalElement.style.height = 'auto';
      modalElement.style.maxHeight = '90vh';
      modalElement.style.borderRadius = 'var(--md-sys-shape-corner-medium)';
    }
  }
}

// Responsive sidebar detector
class SidebarLayout {
  static shouldShowSidebar() {
    return ResponsiveManager.getCurrentBreakpoint() !== breakpoints.COMPACT;
  }

  static toggleSidebar(sidebarId) {
    const sidebar = document.getElementById(sidebarId);
    if (!sidebar) return;

    if (ResponsiveManager.isCompact()) {
      sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
    }
  }
}

// Initialize all responsive behaviors
function initializeResponsive() {
  AdaptiveNavigation.setup();
  
  // Update on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Reflow expensive calculations
    }, 250);
  });
}

// Safe area helper
function getSafeAreaInsets() {
  const computedStyle = getComputedStyle(document.documentElement);
  return {
    top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
    right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0,
    bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
    left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0
  };
}


/* ============================================================================
   RESPONSIVE LAYOUT TEMPLATES - PHASE 6
   ============================================================================ */

// Adaptive Layout Builder
class AdaptiveLayoutBuilder {
  constructor() {
    this.elements = [];
  }

  addGridItem(content, span = 1) {
    this.elements.push({
      type: 'grid-item',
      content,
      span
    });
    return this;
  }

  addFullWidth(content) {
    this.elements.push({
      type: 'full-width',
      content
    });
    return this;
  }

  addSidebar(main, aside) {
    this.elements.push({
      type: 'sidebar',
      main,
      aside
    });
    return this;
  }

  renderGrid() {
    let html = '<div class="grid-container gap-responsive">';
    this.elements.forEach(el => {
      if (el.type === 'full-width') {
        html += `<div class="full-width">${el.content}</div>`;
      } else if (el.type === 'grid-item') {
        const spanClass = el.span > 1 ? `span-${el.span}` : '';
        html += `<div class="${spanClass}">${el.content}</div>`;
      }
    });
    html += '</div>';
    return html;
  }

  renderSidebar() {
    const main = this.elements.find(e => e.type === 'sidebar')?.main || '';
    const aside = this.elements.find(e => e.type === 'sidebar')?.aside || '';
    
    return `
      <div class="sidebar-layout">
        <div class="sidebar-layout-main">${main}</div>
        <aside class="sidebar-layout-aside hide-compact">${aside}</aside>
      </div>
    `;
  }

  render() {
    if (this.elements.some(e => e.type === 'sidebar')) {
      return this.renderSidebar();
    }
    return this.renderGrid();
  }
}

// Responsive dashboard template
function renderResponsiveDashboard(options = {}) {
  const {
    title = 'Dashboard',
    cards = [],
    sidebar = null,
    fullWidthTop = null
  } = options;

  let html = `
    <div class="app-container">
      ${renderTopAppBar({ title, variant: 'standard' })}
      
      <div class="app-content">
        <div class="page-container">
  `;

  if (fullWidthTop) {
    html += fullWidthTop;
  }

  if (sidebar) {
    html += `
      <div class="sidebar-layout">
        <div class="sidebar-layout-main">
          <div class="grid-container gap-responsive">
    `;
    cards.forEach((card, idx) => {
      html += `<div class="card">${card}</div>`;
    });
    html += `
          </div>
        </div>
        <aside class="sidebar-layout-aside hide-compact">
          ${sidebar}
        </aside>
      </div>
    `;
  } else {
    html += `
      <div class="grid-container gap-responsive">
    `;
    cards.forEach(card => {
      html += `<div class="card">${card}</div>`;
    });
    html += `
      </div>
    `;
  }

  html += `
        </div>
      </div>
    `;

  html += renderBottomNavigation({
    items: [
      { icon: '📊', label: 'Dashboard' },
      { icon: '👥', label: 'Members' },
      { icon: '⚠️', label: 'Reports' },
      { icon: '⚙️', label: 'Settings' }
    ]
  });

  html += `
    </div>
  `;

  return html;
}

// Responsive two-column layout
function renderTwoColumnLayout(options = {}) {
  const {
    mainContent = '',
    asideContent = '',
    mainFirst = true
  } = options;

  return `
    <div class="sidebar-layout">
      <div class="sidebar-layout-main">${mainContent}</div>
      <aside class="sidebar-layout-aside hide-compact">${asideContent}</aside>
    </div>
  `;
}

// Responsive card grid
function renderResponsiveCardGrid(options = {}) {
  const {
    cards = [],
    gap = 'gap-responsive',
    className = 'grid-container'
  } = options;

  let html = `<div class="${className} ${gap}">`;
  
  cards.forEach((card, idx) => {
    const spanClass = card.span ? `span-${card.span}` : '';
    const fullWidthClass = card.fullWidth ? 'full-width' : '';
    
    html += `
      <div class="${spanClass} ${fullWidthClass}">
        <div class="card-high padding-responsive">
          ${card.content}
        </div>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

// Example: Staff Management Dashboard
function renderStaffDashboardLayout() {
  return renderResponsiveDashboard({
    title: 'Staff Dashboard',
    cards: [
      renderStaffList(),
      renderStaffTable(),
      renderStaffFilters()
    ],
    sidebar: `
      <div class="card-high padding-responsive">
        <h3>Quick Stats</h3>
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          <div><strong>Total Staff:</strong> 15</div>
          <div><strong>Online:</strong> 6</div>
          <div><strong>Warnings Today:</strong> 3</div>
        </div>
      </div>
    `,
    fullWidthTop: renderSearchBar({
      placeholder: 'Search staff...',
      variant: 'filled'
    })
  });
}


/* ============================================================================
   STATES & FEEDBACK UTILITIES - PHASE 7
   ============================================================================ */

// Skeleton loader templates
class SkeletonLoader {
  static renderCardSkeleton() {
    return `
      <div class="skeleton-card">
        <div class="skeleton-card-header">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-card-title"></div>
        </div>
        <div class="skeleton-card-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    `;
  }

  static renderListItemSkeleton() {
    return `
      <div class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-list-item-content">
          <div class="skeleton-line large"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    `;
  }

  static renderTableSkeleton(rows = 5) {
    let html = '';
    for (let i = 0; i < rows; i++) {
      html += `
        <div class="skeleton-table-row">
          <div class="skeleton-table-cell"></div>
          <div class="skeleton-table-cell"></div>
          <div class="skeleton-table-cell"></div>
          <div class="skeleton-table-cell"></div>
        </div>
      `;
    }
    return html;
  }

  static showSkeletonInElement(elementId, type = 'card') {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.innerHTML = this.renderCardSkeleton();
  }
}

// State notification containers
class StateNotification {
  static error(title, message, actionText = null) {
    return `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <div class="error-title">${title}</div>
          <div class="error-message">${message}</div>
          ${actionText ? `<div class="error-action"><button class="btn-outlined">${actionText}</button></div>` : ''}
        </div>
      </div>
    `;
  }

  static success(title, message) {
    return `
      <div class="success-container">
        <div class="success-icon">✓</div>
        <div class="success-content">
          <div class="success-title">${title}</div>
          <div class="success-message">${message}</div>
        </div>
      </div>
    `;
  }

  static warning(title, message) {
    return `
      <div class="warning-container">
        <div class="warning-icon">⚡</div>
        <div class="warning-content">
          <div class="warning-title">${title}</div>
          <div class="warning-message">${message}</div>
        </div>
      </div>
    `;
  }

  static info(title, message) {
    return `
      <div class="info-container">
        <div class="info-icon">ℹ️</div>
        <div class="info-content">
          <div class="info-title">${title}</div>
          <div class="info-message">${message}</div>
        </div>
      </div>
    `;
  }
}

// Progress indicators
class Progress {
  static renderCircular(percent = 50) {
    return `<div class="progress-circular" style="--progress: ${percent * 3.6}deg">${percent}%</div>`;
  }

  static renderLinear(percent = 50, indeterminate = false) {
    const indeterminateClass = indeterminate ? 'indeterminate' : '';
    return `
      <div class="progress-linear">
        <div class="progress-linear-bar ${indeterminateClass}" style="--progress: ${percent}%"></div>
      </div>
    `;
  }

  static updateLinear(elementId, percent) {
    const element = document.querySelector(`#${elementId} .progress-linear-bar`);
    if (element) {
      element.style.setProperty('--progress', `${percent}%`);
    }
  }
}

// Inline validation
function renderInlineValidation(options = {}) {
  const {
    message = '',
    state = 'valid', // 'valid', 'invalid', 'pending'
    icon = '✓'
  } = options;

  const iconMap = {
    valid: '✓',
    invalid: '✕',
    pending: '⏳'
  };

  return `
    <div class="inline-validation ${state}">
      <span class="inline-validation-icon">${iconMap[state] || icon}</span>
      <span>${message}</span>
    </div>
  `;
}

// Badge renderer
function renderBadge(options = {}) {
  const {
    text = 'Badge',
    variant = 'primary' // 'primary', 'secondary', 'tertiary', 'error', 'success'
  } = options;

  return `<span class="badge ${variant}">${text}</span>`;
}

// Toast notification system
class Toast {
  static show(options = {}) {
    const {
      message = 'Notification',
      type = 'info', // 'success', 'error', 'warning', 'info'
      duration = 5000,
      action = null
    } = options;

    const container = document.querySelector('.toast-container') || this.createContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconMap = {
      success: '✓',
      error: '⚠️',
      warning: '⚡',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type]}</div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      ${action ? `<button class="toast-action">${action.label}</button>` : ''}
    `;

    container.appendChild(toast);

    if (action && action.onClick) {
      toast.querySelector('.toast-action').onclick = action.onClick;
    }

    if (duration > 0) {
      setTimeout(() => {
        toast.classList.add('fade-exit');
        setTimeout(() => toast.remove(), 200);
      }, duration);
    }

    return toast;
  }

  static createContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  static success(message, action = null) {
    return this.show({ message, type: 'success', action });
  }

  static error(message, action = null) {
    return this.show({ message, type: 'error', action });
  }

  static warning(message, action = null) {
    return this.show({ message, type: 'warning', action });
  }

  static info(message, action = null) {
    return this.show({ message, type: 'info', action });
  }
}


/* ============================================================================
   ADVANCED EMPTY STATES - PHASE 7 EXTENSION
   ============================================================================ */

// Advanced empty state renderer
function renderAdvancedEmptyState(options = {}) {
  const {
    type = 'no-data', // 'no-data', 'no-results', 'error-state', 'success-state'
    icon = '📭',
    title = 'No data',
    description = 'Nothing to display here.',
    primaryAction = null,
    secondaryAction = null,
    size = 'normal' // 'normal', 'large', 'compact'
  } = options;

  const sizeClass = size === 'large' ? 'empty-state-large' : size === 'compact' ? 'empty-state-compact' : '';
  
  let actions = '';
  if (primaryAction || secondaryAction) {
    actions = `
      <div class="empty-state-actions">
        ${primaryAction ? `<button class="btn-filled" onclick="${primaryAction.onClick || ''}">${primaryAction.label}</button>` : ''}
        ${secondaryAction ? `<button class="btn-outlined" onclick="${secondaryAction.onClick || ''}">${secondaryAction.label}</button>` : ''}
      </div>
    `;
  }

  return `
    <div class="empty-state ${type} ${sizeClass}">
      <div class="empty-state-icon">${icon}</div>
      <div class="empty-state-title">${title}</div>
      <div class="empty-state-description">${description}</div>
      ${actions}
    </div>
  `;
}

// Pre-built empty state templates
const EmptyStates = {
  noData: () => renderAdvancedEmptyState({
    type: 'no-data',
    icon: '📭',
    title: 'No data available',
    description: 'There\'s nothing here yet. Start by adding an item.',
    primaryAction: { label: 'Add Item', onClick: 'addItem()' }
  }),

  noResults: (query = 'search term') => renderAdvancedEmptyState({
    type: 'no-results',
    icon: '🔍',
    title: 'No results found',
    description: `We couldn't find anything matching "${query}". Try a different search.`,
    secondaryAction: { label: 'Clear Search', onClick: 'clearSearch()' }
  }),

  error: (errorCode = '500', message = 'Something went wrong') => renderAdvancedEmptyState({
    type: 'error-state',
    icon: '⚠️',
    title: `Error ${errorCode}`,
    description: message,
    primaryAction: { label: 'Try Again', onClick: 'retry()' },
    secondaryAction: { label: 'Contact Support', onClick: 'contactSupport()' }
  }),

  notFound: () => renderAdvancedEmptyState({
    type: 'error-state',
    icon: '🚫',
    title: '404 - Page not found',
    description: 'This page doesn\'t exist or has been moved.',
    primaryAction: { label: 'Go Back', onClick: 'history.back()' }
  }),

  success: (message = 'All done!') => renderAdvancedEmptyState({
    type: 'success-state',
    icon: '✓',
    title: 'Success',
    description: message,
    primaryAction: { label: 'Continue', onClick: 'continue()' }
  }),

  unauthorized: () => renderAdvancedEmptyState({
    type: 'error-state',
    icon: '🔒',
    title: 'Access Denied',
    description: 'You don\'t have permission to view this.',
    primaryAction: { label: 'Log In', onClick: 'login()' }
  }),

  loading: () => renderAdvancedEmptyState({
    type: 'loading-state',
    icon: '⏳',
    title: 'Loading...',
    description: 'Please wait while we fetch your data.',
    size: 'compact'
  })
};

// Empty state with illustration (placeholder)
function renderEmptyStateWithIllustration(options = {}) {
  const {
    illustration = null, // SVG or image URL
    ...rest
  } = options;

  let html = '';
  if (illustration) {
    html += `<div class="empty-state-illustration">${illustration}</div>`;
  }

  html += renderAdvancedEmptyState(rest);
  return html;
}

