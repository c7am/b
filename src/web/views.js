const { SCALAR_KEYS } = require('../utils/guildConfig');

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
  <title>${escapeHtml(title)} - Staff Bot Dashboard</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="page-wrapper">
    ${body}
  </div>
</body>
</html>`;
}

// ============= Login Page =============
function loginPage() {
  const body = `
<div class="center-page">
  <div class="card stack shape-large" style="width:100%;max-width:400px;text-align:center;padding:var(--space-4)">
    <h1 class="headline-large">Staff Bot Dashboard</h1>
    <p class="body-medium" style="color:var(--md-sys-color-on-surface-variant)">
      Sign in with Discord to manage settings, view shifts, and check your availability.
    </p>
    <a class="btn btn-filled btn-full-width" href="/auth/login" style="gap:8px;margin-top:var(--space-3)">
      ${icon('check')}
      <span>Login with Discord</span>
    </a>
  </div>
</div>`;
  return layout({ title: 'Login', body });
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
  <h1 class="title-large" style="margin:0">Staff Bot Dashboard</h1>
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
function staffDashboard({ guild, user, shifts, activeLoa, recentInfractions }) {
  const shiftCards = shifts.map(s => {
    const start = new Date(s.starts_at);
    const end = new Date(s.ends_at);
    const now = new Date();
    const isUpcoming = start > now;
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
      ${icon('users')}
      <h2 class="staff-section-title">Settings & Admin</h2>
    </div>
    <a href="/dashboard/${escapeHtml(guild.id)}/settings" class="btn btn-tonal" style="gap:8px;align-self:flex-start">
      ${icon('check')}
      <span>Manage Server Settings</span>
    </a>
  </div>
</div>`;
  return layout({ title: 'Dashboard', body });
}

// ============= Shift Details Page =============
function shiftDetailsPage({ guild, shift, members }) {
  const memberItems = members.map(m => `
    <div class="user-item">
      <div class="user-item-main">
        <div class="user-item-label">User ${escapeHtml(m.user_id)}</div>
        <div class="user-item-meta">Joined: ${formatDate(m.joined_at)}</div>
      </div>
      <span class="badge ${m.checked_in ? 'badge-active' : 'badge-inactive'}">
        ${m.checked_in ? 'Checked in' : 'Not checked in'}
      </span>
    </div>`).join('\n');

  const body = `
<header class="topbar">
  <h1 class="title-large" style="margin:0">${escapeHtml(shift.name)}</h1>
  <a class="btn btn-text" href="/dashboard/${escapeHtml(guild.id)}/staff" style="gap:4px">
    ${icon('chevronLeft')} Back
  </a>
</header>
<div class="page stack">
  <div class="info-card">
    <div class="info-card-header">
      <div class="info-card-title">Shift Details</div>
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
      <div class="info-card-row">
        <span class="info-card-label">Members</span>
        <span class="info-card-value">${members.length}</span>
      </div>
      ${shift.description ? `
        <div class="info-card-row" style="flex-direction:column;align-items:flex-start">
          <span class="info-card-label">Description</span>
          <span class="info-card-value">${escapeHtml(shift.description)}</span>
        </div>` : ''}
    </div>
  </div>

  <div class="staff-section">
    <div class="staff-section-header">
      ${icon('users')}
      <h2 class="staff-section-title">Members (${members.length})</h2>
    </div>
    ${members.length > 0 ? `<div class="user-section-list">${memberItems}</div>` : '<div class="empty-state"><div class="empty-state-text">No members yet</div></div>'}
  </div>
</div>`;
  return layout({ title: 'Shift Details', body });
}

module.exports = {
  loginPage,
  guildListPage,
  staffDashboard,
  shiftDetailsPage,
};

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
        <label for="loa-end">End Date/Time</label>
        <input type="datetime-local" id="loa-end" name="endsAt" required>
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

module.exports = {
  loginPage,
  guildListPage,
  staffDashboard,
  shiftDetailsPage,
  createShiftPage,
  shiftsListPage,
  loaRequestPage,
  checkInPage,
  userProfilePage,
};
