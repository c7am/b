# CLAUDE.md - Axiom Shift System Update

**Last Updated:** September 12, 2026 | **Deploy:** dep-daihc2oae00c73eh99h0 | **Status:** ✓ LIVE

---

## Project Summary

**Axiom** is a proprietary Discord staff and ERLC management tool for ERLC (Emergency Response: Liberty County) Roblox roleplay communities. Full-stack production system with Discord bot, web dashboard, real-time ERLC integration, and comprehensive shift management.

**Stack:** Node.js 18+, Discord.js v14, PostgreSQL (Neon), Render hosting, Express dashboard, Material Design 3 (Catppuccin Mocha)

---

## Major Update: SSU-Gated Shift System + Complete UI Redesign

### New Shift System Features

**1. SSU Integration (Server Must Have 25+ Players)**
- New `checkSsuStatus()` function fetches ERLC server status and player count
- Shifts only joinable when server is started AND has 25+ players in-game
- Shows live player count and helpful error messages if not ready
- Join button automatically disabled with reason if SSU conditions not met
- Graceful fallback if ERLC API unreachable (shows "cannot check status" message)

**2. Shift State Management**
- Shifts now have states: `pending`, `started`, `paused`, `ended`
- Only users joined to shift can control state
- Four state control buttons: Start / Pause / Resume / End
- Async state changes via Fetch API with automatic page reload
- State persisted to database

**3. Complete UI Redesign**

**Before:** Old cramped info-card layout
**After:** Modern grid-based card system with:
- **Header:** Shift name + status badges (Started/Paused/Ended/Pending)
- **Key Info Grid:** 4 card layout showing Start, End, Duration, Member Count
- **SSU Status Card:** Live player count or error reason
- **Join/Leave Actions:** Prominent buttons with disabled state if SSU not ready
- **Shift Controls Menu:** 2x2 grid with Start/Pause/Resume/End buttons
- **Member List:** Redesigned with better spacing, check-in status per member
- **Notes Section:** Dedicated card for shift description
- **Better Typography:** Using M3 body-small, body-medium, body-large tokens
- **Color Coding:** Status badges with semantic colors (success/warning/info)

**4. Enhanced Information Display**
- Shift duration calculated and displayed (e.g., "4h 30m")
- Member count updated in real-time
- Check-in status per member (Checked in / Not checked in)
- Joined time for each member
- Status indicator dots with animations

---

## Database Changes

**New Functions (src/db/database.js)**
```javascript
updateShiftStatus(shiftId, status)    // Set shift to pending/started/paused/ended
getShiftStatus(shiftId)                // Get current shift state
startShift(shiftId)                    // Set to started
pauseShift(shiftId)                    // Set to paused
resumeShift(shiftId)                   // Set to started (from paused)
endShift(shiftId)                      // Set to ended
```

**Shifts Table Now Includes:**
- `status` column (defaults to 'pending')
- `updated_at` column (tracking last state change)

---

## Dashboard Routes

**New Shift State Routes:**
- `POST /:guildId/shift/:shiftId/start` - Start shift
- `POST /:guildId/shift/:shiftId/pause` - Pause shift
- `POST /:guildId/shift/:shiftId/resume` - Resume shift
- `POST /:guildId/shift/:shiftId/end` - End shift

**Updated Routes:**
- `GET /:guildId/shift/:shiftId` - Now shows SSU status + shift status
- `POST /:guildId/shift/:shiftId/join` - Checks SSU status before allowing join

---

## ERLC Integration Updates

**New Function (src/handlers/erlcHandler.js)**
```javascript
async function checkSsuStatus(guildId, minPlayers = 25) {
  // Returns: { ready: boolean, playerCount?: number, reason?: string, minPlayers?: number }
  // ready=true: Server started and 25+ players
  // ready=false: Server not started OR too few players
}
```

**Response Examples:**
```javascript
// Success
{ ready: true, playerCount: 42 }

// Failures
{ ready: false, reason: 'Server not started' }
{ ready: false, reason: 'Only 18/25 players in-game', playerCount: 18, minPlayers: 25 }
{ ready: false, reason: 'No ERLC API configured' }
{ ready: false, reason: 'Failed to check server status' }
```

---

## Removed Features

**ERLC Auto-Sync on Shift Join:** Shifts no longer auto-assign staff to ERLC teams. This was causing workflow conflicts. Manual team assignment via separate admin workflow now.

---

## Current Live State

**Deploy:** `dep-daihc2oae00c73eh99h0`
**Status:** ✓ LIVE (verified boot)
**URL:** https://isrp-staff-bot.onrender.com
**Commands:** 9 total

**Boot Sequence (Verified):**
```
[db] schema ready
[bot] hi#9174 is online
[sync] 9 slash commands registered
[erlc-listen] Started listening for guild 1540038714934300732
[web] dashboard listening on port 10000
Service is live
```

---

## Complete Feature Set (All Live)

### 1. Roblox Account Verification (Production-Grade)
- `/erlc-link` command
- Generates 12-word censorship-safe phrase
- Bot verifies phrase in Roblox bio (API-fetched)
- Auto-grant in-game mod perms if Discord staff role exists

### 2. In-Game Moderation System
- `?moderate PlayerName violation reason` support
- Smart violation matching (13 presets + custom)
- Fetches player avatars for embeds
- Auto-revokes perms if staff loses role

### 3. ERLC Event Listener (30s Polling)
- Detects `?moderate` commands from logs
- Auto-processes and logs to Discord
- Finds moderator by Roblox username link

### 4. Real-Time Discord Moderation
- Staff issue `?moderate` commands via Discord messages
- Auto-validation and logging

### 5. SSU-Gated Shift System (NEW)
- Shifts joinable only when server started + 25+ players
- Start/Pause/Resume/End controls per shift
- Live status indicators

### 6. Admin Shift Type Editor
- Add/remove/configure shift types with duration limits
- Settings page management

### 7. Shift Sync to ERLC Teams (Manual)
- Available for admin workflow

### 8. Admin ERLC Configuration
- Settings page with API key validation

### 9. Audit Log Dashboard
- Full activity history with filters
- CSV export

### 10. Minimal M3 Polish
- Card hover states, status badges, animations

---

## UI Components & Styling

**Shift Detail Page Elements:**
- `topbar` - Header with title and back button
- `card-high` - Main content cards with padding
- `badge` with variants: `badge-success`, `badge-warning`, `badge-info`
- `shift-controls-menu` - 2x2 grid layout for state buttons
- Status chips with icons
- Member list with individual cards per member

**New CSS Classes** (already in style.css):
- `.shift-controls-menu` - Grid layout for state controls
- `.status-chip` - Inline status indicator with background color

---

## Admin Workflow (Recommended)

1. **Setup:** Ensure ERLC API key is configured in Settings
2. **Server Start:** Wait for server to show 25+ players in-game
3. **Join Shift:** Click Join when SSU ready button becomes active
4. **Control Shift:** Use Start/Pause/Resume/End buttons in shift submenu
5. **Team Assign:** Manual team assignment via separate ERLC admin tool (if needed)

---

## Staff Workflow

1. Go to Shifts page
2. See shift availability (grayed out if SSU not ready)
3. Click Join when button is active (server has 25+ players)
4. Click Check In / Out to manage attendance
5. See Start/Pause/Resume/End controls (only visible when joined)

---

## Known Behavior

- **SSU Check:** Runs every time shift detail page loads, no caching
- **Button State:** Disabled with reason text if SSU not ready
- **Shift Controls:** Only visible to members who joined
- **State Changes:** Async updates with automatic page reload
- **Member List:** Shows check-in status per member

---

## Code Quality

✓ All files pass `node -c` syntax check
✓ No em dashes anywhere
✓ M3 CSS compliant
✓ No undefined references
✓ Clean boot sequence
✓ Zero errors on deployment

---

## Files Modified (This Session)

- `src/handlers/erlcHandler.js` - Added checkSsuStatus()
- `src/db/database.js` - Added shift state functions
- `src/web/dashboard.js` - SSU check on join, updated shift detail route
- `src/web/views.js` - Completely redesigned shiftDetailsPage

---

## Next Session Starter

```bash
git log --oneline -5
Render:get_deploy <latest-dep-id>
```

Check shift detail page visually, test:
1. Join shift when SSU not ready (should see error)
2. Join shift when SSU ready (should work)
3. Click state buttons (Start/Pause/Resume/End)
4. Verify page reloads with new state

---

**Shift system completely rearchitected with SSU integration and modern UI.**

---

## Documentation Site (NEW)

**Routes:**
- `GET /docs` - Public documentation (no auth required)
- `GET /:guildId/docs` - Guild-specific documentation (members only)

**Sections:**
1. **Getting Started** - Overview, features, quick navigation
2. **Shift Management** - Joining, state controls, check-in/out
3. **Server Requirements (SSU)** - 25+ player integration, status display
4. **Account Verification** - Roblox linking, bio verification, regenerate phrase
5. **Moderation** - In-game and Discord moderation commands, violation types, logging
6. **Admin Settings** - ERLC config, shift types, custom violations, audit logs

**Features:**
- Interactive section navigation with smooth scrolling
- Code examples and step-by-step instructions
- Grid-based card layout with icons
- Accessible from footer link on every page
- Material Design 3 styling
- Works for both authenticated and public access

**Implementation:**
- `docsPage()` function in views.js - 6 sections with full content
- Inline JavaScript for section switching
- Proper styling with card-high, body-medium, and M3 tokens
- Responsive grid layout for section cards
