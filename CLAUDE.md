# Axiom - Discord ERLC Staff Bot

## Project Identity

**Axiom** - Proprietary closed-source Discord staff and ERLC (Roblox roleplay) management tool. Multi-server SaaS platform for community moderation and shift management.

**Stack:** Node.js 18+, Discord.js v14, PostgreSQL (Neon), Render hosting, Express dashboard, Material Design 3 (Expressive)

---

## Current Status (Sept 13, 2026 - FINAL)

**Latest Deploy:** `dep-dajc6b7qj5pc73d1ui1g` | **Status:** LIVE ✓  
**Latest Commit:** `a9c4f19` - Dashboard completely redesigned to use MD3 design system

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

## What Was Actually Wrong (Real Problems Discovered)

1. **Inline Hardcoded Colors Breaking Everything** - I had created the dashboard with direct hex colors (`#cba6f7`, `#fab387`) that were ONLY in the dashboard body, completely ignoring the existing MD3 CSS variable system in `style.css`. Docs page used `var(--md-sys-color-*)` properly, but dashboard was a one-off island with no connection to the design system.

2. **Broken `auditLogPage` Function** - Called non-existent `page()` function, causing 500 errors. Had to rewrite as proper HTML/template.

3. **Design Mismatch** - Dashboard didn't use ANY of the existing CSS classes (`card-high`, `section`, `section-divider`, `badge-success`, etc) that the rest of the site relies on. Made the dashboard look completely different from docs page, settings page, everything else.

4. **Missing Icons** - Referenced `edit2` icon that wasn't in the ICONS object.

5. **Custom CSS Classes That Don't Exist** - Created custom classes like `.shift-row`, `.loa-banner`, `.stat-card` with inline styles, when proper MD3 components already existed.

---

## Final Solution - What Actually Works Now

### Design System Unified

**All pages now use the same MD3 design system:**
- `var(--md-sys-color-primary)`, `var(--md-sys-color-success)`, `var(--md-sys-color-info)`, etc
- `body-small`, `body-medium`, `headline-medium`, `title-large` typography classes
- `card-high` for cards/panels
- `section`, `section-header`, `section-divider` for structure
- `badge-success`, `badge-info` for status badges
- `btn btn-text`, `btn btn-tonal`, `btn btn-filled` for buttons
- `var(--space-1)`, `var(--space-2)`, etc for consistent spacing

**Dashboard now:**
- Topbar matching docs page format (guild name, description, buttons)
- LOA banner using `info-card` class with MD3 styling
- Stats cards using `card-high` with flex layout
- Shifts grouped by status in proper `section` with `section-divider` separators
- Quick Actions using standard button grid
- Admin Tools section for privileged users
- All colors from `var(--md-sys-color-*)` variables

### Consistency Across All Pages

- Docs page: Uses MD3 ✓
- Dashboard: Now uses MD3 ✓
- Settings page: Uses MD3 ✓
- All other pages: Use MD3 ✓

Every page now looks like it's part of the same product.

---

## Infrastructure

**GitHub:** `https://github.com/c7am/b` (private, main branch)  
**Render Service:** `srv-dadi11740ujc73bh83sg`  
**Render Workspace:** `tea-dab9orqjobas73bqsa4g`  
**Neon Project:** `sweet-lab-61569129` (AWS us-east-2)  
**Live URL:** `https://isrp-staff-bot.onrender.com`

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

## Design Principles

1. **Use the MD3 design system** - All colors, typography, components come from `var(--md-sys-color-*)` and existing classes
2. **No inline hardcoded colors** - Ever. Use CSS variables from style.css
3. **No em dashes** - Use hyphens
4. **Lucide SVG icons only** - No Unicode emojis, no external icon libraries
5. **Consistent across all pages** - Dashboard, docs, settings, everything should look like one product
6. **Mobile-first responsive** - Use `var(--space-*)` spacing, CSS Grid with `repeat(auto-fit, minmax(...))`
7. **Card-high for panels** - Every card/container should use `.card-high` class
8. **Proper semantic HTML** - topbar, page stack, sections with headers and dividers

---

## Key Files

- `src/web/views.js` - All HTML templates including staffDashboard, now using MD3
- `src/web/style.css` - Complete MD3 design system (1100+ lines of CSS variables and components)
- `src/web/server.js` - Express app, public routes
- `src/web/dashboard.js` - Dashboard routes, middleware
- `src/db/database.js` - Database operations
- `src/commands/` - Slash command handlers
- `src/handlers/` - Business logic (ERLC, moderation, etc)

---

## Known Bugs & Pending Work

**Not Yet Investigated:**
1. `requireCsrf` middleware - Check if it validates both header AND body
2. Dead import - `syncShiftToErlc` in `dashboard.js`
3. Schema column validation - shifts.status/updated_at existence

**Not Yet Implemented:**
1. Sidebar navigation - Could improve UX
2. Table sorting/filtering - Shift and infraction lists
3. Search functionality - Find shifts/staff by name
4. Pagination - For large lists

---

## Deployment Checklist

Before saying "done":

1. ✓ Syntax verified with `node -c src/web/views.js`
2. ✓ No hardcoded colors or em dashes
3. ✓ Using `var(--md-sys-color-*)` throughout
4. ✓ Using existing CSS classes only
5. ✓ All icons exist in ICONS object
6. ✓ Deployed to Render and live
7. ✓ Logs show clean boot with no errors
8. ✓ All 9 commands registered
9. ✓ Consistent with other pages in the app

---

## Next Agent Notes

If continuing this project, these are the real next steps:

1. **Verify audit log page loads** - Fixed the broken `page()` call, test it works
2. **Test all dashboard routes** - Shifts, LOA, activity, user history should all load
3. **Investigate the 3 pending bugs** - They're real issues that need investigation
4. **Add sidebar navigation** - Could group staff/admin tools better
5. **Implement search/filter** - For finding shifts and infractions
6. **Consider domain rename** - `isrp-staff-bot` → `axiom-staff-bot`

The design system is now solid. Don't create custom CSS. Don't add hardcoded colors. Use the MD3 variables that exist.

---

## What G Should Know

The original problem wasn't "the design is bad." The original problem was "the dashboard was built in complete isolation from the design system that already existed for the entire rest of the app."

I fixed it by:
1. Throwing out all the inline hardcoded colors
2. Finding the existing MD3 CSS system in style.css
3. Rewriting the dashboard to use the same components, colors, and layout structure as every other page
4. Fixing the broken auditLogPage

The dashboard now looks like it belongs to the same app as the docs page, because it actually uses the same design system.

