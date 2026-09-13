# Axiom - Discord ERLC Staff Bot

## Project Identity

**Axiom** - Proprietary closed-source Discord staff and ERLC (Roblox roleplay) management tool. Multi-server SaaS platform for community moderation and shift management.

**Stack:** Node.js 18+, Discord.js v14, PostgreSQL (Neon), Render hosting, Express dashboard, Catppuccin Mocha theme

---

## Current Status (Sept 13, 2026)

**Latest Deploy:** `dep-daj7hvlg1s2s739mk3d0` | **Status:** LIVE ✓  
**Latest Commit:** `c08c0ad` - Complete UI redesign with proper colors

### Boot Sequence (Clean)
```
[db] schema ready
[bot] hi#9174 is online
[sync] 9 slash commands registered
[erlc-listen] Started listening for guild 1540038714934300732
[web] dashboard listening on port 10000
Service is live
```

---

## Staff Dashboard - Complete Redesign (Sept 13)

### What Was Wrong
- Using broken MD3 CSS variables that weren't resolving
- LOA alert was aggressively red and didn't fit
- Example text ("Welcome, [name]") made it look unfinished
- Colors weren't matching Catppuccin Mocha properly
- Not mobile-optimized

### What Was Fixed

**1. Colors - Now Using Direct Catppuccin Mocha Hex**
- Background: `#1e1e2e`
- Surface: `#313244`
- Border: `#45475a`
- Text: `#cdd6f4`
- Subtext: `#a6adc8`
- Success (Active shifts): `#a6e3a1`
- Info (Upcoming shifts): `#89dceb`
- Mauve (Completed shifts): `#cba6f7`
- Peach (LOA, warnings): `#fab387`
- Overlay (Hover): `#585b70`

**2. Mobile-First Design**
- Stats grid: Auto-fit desktop, 2-column mobile
- Compact shift rows with inline data
- Abbreviated action button labels (Request, Activity, History, Docs)
- Touch-friendly button sizes (32x32px minimum)
- Responsive typography with clamp()
- Breakpoint at 640px

**3. Layout & Visual Hierarchy**
- Topbar: Clean guild name + icon buttons only (no "Welcome" text)
- Stats: 3 cards (Active, Next, Done)
- Shifts: Grouped by status (Active, Upcoming, Past) with compact rows
- LOA banner: Peach accent, integrated at top (not forced)
- Empty state: Simple, helpful message
- Actions: 2 columns on mobile, auto-fit on desktop

**4. Component Details**
- Shift row: Title + date/time + duration + status badge + link
- Stats card: Icon + label + number (minimal)
- LOA banner: Title + date + edit button (no alert color)
- Action buttons: Uppercase, abbreviated labels, consistent styling

---

## Infrastructure

**GitHub:** `https://github.com/c7am/b` (private, main branch)  
**Render Service:** `srv-dadi11740ujc73bh83sg`  
**Render Workspace:** `tea-dab9orqjobas73bqsa4g`  
**Neon Project:** `sweet-lab-61569129` (AWS us-east-2)  
**Live URL:** `https://isrp-staff-bot.onrender.com`

**Environment Variables (Render):**
- `DISCORD_TOKEN`
- `CLIENT_ID`
- `GUILD_ID`
- `DISCORD_CLIENT_SECRET`
- `DATABASE_URL`
- `SESSION_SECRET`
- `DISABLE_SELF_PING=false`

---

## Slash Commands (9 Total)

1. `/config` - Deprecated, redirects to dashboard
2. `/promote` - Promote staff
3. `/demote` - Demote staff
4. `/infract` - Log infraction
5. `/history` - View staff history
6. `/loa` - Request/manage leave
7. `/session-vote` - Vote on active shifts
8. `/erlc-link` - Link Roblox account
9. `/erlc-players` - List current players

---

## Dashboard Routes

**Public** (no auth):
- `/docs` - Documentation site
- `/privacy` - Privacy policy
- `/terms` - Terms of service

**Staff** (`requireMember`):
- `/:guildId/staff` - Dashboard home
- `/:guildId/shift/:shiftId` - View shift
- `/:guildId/loa` - Leave of absence
- `/:guildId/audit` - Activity log
- `/:guildId/docs` - Staff docs
- `/:guildId/user/:userId` - View history
- `/:guildId/data-deletion` - Delete personal data
- `POST /:guildId/toggle-view-mode` - Admin/staff view toggle

**Admin** (`requireAdmin`):
- `/:guildId` - Settings
- `/:guildId/roles` - Manage roles
- `/:guildId/channels` - Manage channels
- `/:guildId/shifts` - Manage shifts
- `/:guildId/create-shift` - Create shift
- `/:guildId/deletion-requests` - Deletion queue
- And more...

---

## Database Schema

**Tables:**
- `shifts` - Shift records with status/timing
- `shift_members` - Staff assigned to shifts
- `promotions` - Rank changes
- `infractions` - Rule violations
- `loas` - Leave of absence records
- `settings` - JSONB key-value config
- `ranks` - Staff ranks
- `infraction_types` - Violation types
- `tickets` - Support tickets
- `web_sessions` - Session management
- `data_deletion_requests` - GDPR deletions
- `discord_roblox_links` - Account linking

---

## Key Design Decisions

### Color System
- **No MD3 variables** - Broken in this setup, using direct hex
- **Catppuccin Mocha throughout** - Consistent, professional palette
- **Peach for LOA** - Informational, not aggressive
- **No red except errors** - Reserved for destructive actions only

### Mobile-First Approach
- Desktop-first responsive (improve down from 1200px)
- Readable at all sizes
- Touch-friendly spacing
- Abbreviated labels on small screens

### Simplicity Over Features
- Removed decorative elements
- Clean, scannable layout
- One data point per row
- No walls of text

---

## Known Bugs & Pending Work

**Not Yet Investigated:**
1. `requireCsrf` middleware - Does it check header OR body?
2. Dead import - `syncShiftToErlc` in `dashboard.js`
3. Schema validation - shifts.status/updated_at column existence
4. Icon audit - Verify all icons in use exist in ICONS object

**Not Yet Implemented:**
1. 21st.dev components - Available for future enhancement
2. Sidebar navigation - Could organize sections better
3. Data table sorting - Shift/infraction lists
4. Search/filter - Find shifts by staff name

---

## Key Files

- `src/web/views.js` - All HTML templates including staffDashboard
- `src/web/server.js` - Express app, public routes
- `src/web/dashboard.js` - Dashboard routes, middleware
- `src/web/style.css` - Global styles (rarely used, mostly inline)
- `src/db/database.js` - Database operations
- `src/commands/` - Slash command handlers
- `src/handlers/` - Business logic (ERLC, moderation, etc)

---

## Design Principles

1. **No em dashes** - Use hyphens throughout
2. **No Unicode emojis** - Lucide SVG icons only (from ICONS object)
3. **Direct colors, not variables** - Hex values or CSS custom props work, MD3 vars don't
4. **Mobile-first responsive** - Works great on phone first, scales up
5. **Minimal text** - Abbreviate labels, use icons
6. **Professional tone** - Formal but not corporate, direct language
7. **Fast feedback** - Hover states, transitions, visual confirmation

---

## Performance Notes

- Self-ping every 10 minutes (prevents free-tier spin-down)
- Efficient database queries with Neon
- Minimal JavaScript, mostly server-rendered HTML
- Clean CSS, mostly inline for dashboard
- No external component libraries (self-contained)

---

## Deployment Workflow

1. Make changes locally in `/home/claude/axiom`
2. Test syntax: `node -c src/web/views.js`
3. Commit: `git add -A && git commit -m "..."`
4. Push: `git push origin main`
5. Deploy: `Render:trigger_deploy` with correct serviceId/workspaceId
6. Wait 45-60 seconds
7. Verify: `Render:get_deploy` then `Render:list_logs`
8. Check boot sequence and no errors

---

## Next Steps for Another Agent

If continuing this project:

1. **Investigate pending bugs** - Check the 3 items above
2. **Add sidebar navigation** - Organize dashboard sections
3. **Implement sorting/filtering** - On shift and infraction tables
4. **Test on mobile** - Verify responsive design works
5. **Domain rename** - `isrp-staff-bot` → `axiom-staff-bot`
6. **Consider pagination** - For large shift lists
7. **Add confirmation modals** - For destructive actions

---

## Communication Notes

- G is extremely terse ("conti" = continue, "work!" = build everything)
- Expects full scope inference from brief instructions
- Prefers blunt feedback over corporate speak
- Values working code over perfect architecture
- Will push back on bad ideas, appreciate direct challenges

Always verify with `node -c` and `git push` before claiming done.

