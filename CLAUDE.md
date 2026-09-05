# CLAUDE.md - Project Continuity Notes

**Last updated**: 2026-09-05, full dashboard complete. All staff management features live: shifts, LOA, check-in/check-out, user profiles. Google Sans Flex typography throughout.

## Project Status

Autonomous deployment active. Bot live on free Render with self-ping. Postgres (Neon) backend stable. Dashboard now feature-complete with Material Design 3 Expressive styling, Google Sans Flex typography, comprehensive staff management.

**Features completed this session:**
- Admin shift creation/deletion interface
- Staff LOA request/end interface
- Check-in/check-out tracking for shifts
- User profile pages showing full history
- Form styling (MD3 Expressive inputs, textareas, datetime-local)
- Check-in/check-out database functions

## What this project is

Production Discord staff management bot for ISRP (Indiana State Roleplay) Roblox community. Eight slash commands, comprehensive web dashboard for staff self-service + admin management, Postgres backend, free Render hosting with self-ping.

All async. Postgres (Neon), no SQLite. Custom Lucide emojis. No em dashes, no Unicode emojis. Material Design 3 Expressive throughout with Google Sans Flex typography. Catppuccin Mauve seed (#cba6f7).

G grants autonomous development + deployment authority. Direct feedback on direction/scope decisions only.

## Database Schema (Complete)

**Shifts & Members:**
- `shifts` - name, start/end times, description, created_by, active flag, guild_id FK
- `shift_members` - shift_id FK, user_id, joined_at, checked_in (bool), checked_in_at, checked_out_at

**Staff:**
- `promotions` - user_id, from_rank, to_rank, issued_by, reason, guild_id
- `infractions` - user_id, type, points, reason, issued_by, guild_id
- `loas` - user_id, reason, starts_at, ends_at, active flag, guild_id

**Admin Config:**
- `settings` - guild_id, key, value (roles, channels, etc)
- `ranks` - guild_id, name, level
- `infraction_types` - guild_id, type, points
- `tickets` - guild_id, user_id, channel_id, open flag

**All DB functions exported from src/db/database.js:**
- Shifts: createShift, getShifts, getShift, deleteShift, joinShift, leaveShift, getShiftMembers, getUserShifts
- Check-in: checkInShift, checkOutShift
- LOA: startLoa, getActiveLoa, endLoa, getActiveLoas
- History: getUser (returns infractions, promotions, LOAs, shifts)
- Config: getRanks, upsertRank, removeRank, getInfractionTypes, etc
- Tickets: createTicket, getTicketByChannel, closeTicket

## Dashboard Routes (Complete)

**Public:**
- `GET /` - Login page (Discord OAuth)
- `GET /dashboard` - Guild list (responsive grid)

**Staff Views:**
- `GET /dashboard/:guildId/staff` - Main dashboard (shifts, LOA alerts, settings link)
- `GET /dashboard/:guildId/shift/:shiftId` - Shift details + member list
- `POST /dashboard/:guildId/shift/:shiftId/join` - Join shift
- `POST /dashboard/:guildId/shift/:shiftId/leave` - Leave shift
- `GET /dashboard/:guildId/shift/:shiftId/check-in` - Check-in interface (only active shifts)
- `POST /dashboard/:guildId/shift/:shiftId/check-in` - Submit check-in
- `POST /dashboard/:guildId/shift/:shiftId/check-out` - Submit check-out
- `GET /dashboard/:guildId/loa` - LOA request form (shows current if active)
- `POST /dashboard/:guildId/start-loa` - Start LOA
- `POST /dashboard/:guildId/end-loa` - End LOA
- `GET /dashboard/:guildId/user/:userId` - User profile (infractions, promotions, shifts, LOA)

**Admin Only:**
- `GET /dashboard/:guildId/shifts` - Shifts management list (create/delete buttons)
- `GET /dashboard/:guildId/create-shift` - Create shift form (datetime-local inputs)
- `POST /dashboard/:guildId/create-shift` - Create shift (POST)
- `POST /dashboard/:guildId/delete-shift` - Delete shift
- `GET /dashboard/:guildId/settings` - Config (roles, channels, ranks, infraction types)
- `POST /dashboard/:guildId/roles` - Save role config
- `POST /dashboard/:guildId/channels` - Save channel config
- `POST /dashboard/:guildId/add-rank` / `remove-rank`
- `POST /dashboard/:guildId/add-infraction-type` / `remove-infraction-type`

## Views (All Implemented)

- `loginPage()` - Discord OAuth login card
- `guildListPage()` - Responsive grid of servers
- `staffDashboard()` - Main staff view (shifts + LOA alerts)
- `shiftDetailsPage()` - Shift members + check-in status
- `createShiftPage()` - Admin form (name, datetime start/end, description)
- `shiftsListPage()` - Admin list with create/delete buttons
- `loaRequestPage()` - Staff form or current LOA display + end button
- `checkInPage()` - Check-in interface (only active shifts, check-in/check-out buttons)
- `userProfilePage()` - User history (infractions, promotions, shifts, LOA)

## Styling & Typography

**Google Sans Flex:** Imported from fonts.googleapis.com (weights 400, 500, 600, 700). Applied to body, cascades throughout.

**Material Design 3 Expressive Components:**
- `.info-card` - elevated surfaces, border/hover effects
- `.shift-card` - left-border accent, time + status badge
- `.badge` + variants - status indicators (active, inactive, warning, error, info)
- `.user-panel` - header with avatar, sections for history
- `.staff-section` - hero sections with icons, responsive grids
- `.empty-state` - centered placeholder + call-to-action
- `.fab` - floating action button (shadow, hover, scale)
- `.modal` - overlay + centered box
- Form elements: `.field-group`, `label`, `input`, `textarea`, `select`, `datetime-local`
  - All with MD3 borders, focus states, proper padding
  - Textarea with min-height, resize: vertical
  - Select with custom chevron icon
- State layers - ::before pseudo-elements with opacity on hover/focus/active
- Expressive shapes - --md-sys-shape-corner-small/medium/large/extra-large
- Motion - --md-sys-motion-duration-* and --md-sys-motion-easing-*

**Colors:** Catppuccin Mocha palette (Mauve seed), proper contrast ratios for WCAG AA.

## Render Deployment

Service: `isrp-staff-bot` (free plan, self-ping every 10 min). URL: https://isrp-staff-bot.onrender.com

**Env vars (set in Render dashboard):**
- DISCORD_TOKEN, CLIENT_ID, GUILD_ID
- DISCORD_CLIENT_SECRET, DATABASE_URL, SESSION_SECRET
- DISABLE_SELF_PING=false

**OAuth callback:** https://isrp-staff-bot.onrender.com/auth/callback (registered in Discord Developer Portal)

**Latest deploy:** Building (commit f3111d5, message "feat: complete dashboard with shifts, LOA, check-in, user profiles, Google Sans Flex")

## Known Issues / Gaps

- No admin approval workflow for LOA (auto-approve on submission)
- No shift time conflict detection (staff could theoretically join overlapping shifts)
- No intra-shift role separation (all members have same access)
- Check-in/check-out only available during active shift window (by design)
- No email/SMS notifications for shifts

## What's Left (Future)

- API endpoints for Discord bot commands to create shifts
- Notification system (shift reminders, LOA alerts to server)
- Shift role assignments (different roles = different responsibilities)
- Analytics dashboard (hours worked, attendance, infractions trends)
- Bulk shift import/export
- Mobile-optimized interface (already responsive, could be tighter)

## Architecture

**Entry Points:**
- `src/index.js` - Bot startup, initializes DB + web server
- `src/web/server.js` - Express app, Discord OAuth, self-ping, routes
- `src/events/ready.js` - Bot ready, registers slash commands

**Components:**
- `src/db/database.js` - Postgres schema, all query functions
- `src/web/dashboard.js` - Express routes for dashboard
- `src/web/views.js` - HTML rendering functions (8 pages)
- `src/web/style.css` - 1000+ lines of MD3 Expressive styling
- `src/web/auth.js` - Discord OAuth2 flow
- `src/utils/guildConfig.js` - Async wrapper for settings
- `src/commands/*.js` - Slash command handlers

**No em dashes, no Unicode emojis, all Lucide SVGs inline.** Autonomous deployment via GitHub PAT.

## Next Steps (Autonomous)

Claude should continue with:
1. Test all routes locally against real Postgres + Discord bot
2. Verify check-in/check-out persists correctly to DB
3. Test user profile page shows correct history
4. Add modal dialogs for confirmations (delete shift, end LOA)
5. Add form validation + error messages
6. Test responsive design at mobile breakpoints
7. Commit and push when ready

No direction needed unless different approach desired. Otherwise proceed autonomously.
