# Axiom - Staff Management Bot for ERLC Communities

**Last updated**: 2026-09-09. Transitioning from single-server ISRP deployment to multi-server proprietary platform for ERLC (Emergency Response: Liberty County) roleplay automation.

## What This Project Is

**Axiom** is a proprietary, self-hosted Discord bot for staff management and server automation in ERLC roleplay communities. Eight slash commands (`/config`, `/promote`, `/demote`, `/infract`, `/history`, `/ticket-panel`, `/session-vote`, `/loa`), a web dashboard for staff self-service and admin management, Postgres (Neon) backend, free Render hosting with self-ping to avoid idle spin-down.

**Status**: Rebranding from ISRP to Axiom (multi-server support). Ticket panel command removal and dashboard migration in progress. ERLC API integration planned.

All async. No em dashes anywhere in code, comments, or user-facing text. No Unicode emojis, custom Lucide-derived Discord application emojis only. Material Design 3 Expressive (Catppuccin Mocha, Mauve seed `#cba6f7`), Google Sans Flex typography.

G communicates in short directives, expects scope inference, wants direct pushback on bad ideas, has granted full autonomous authority over code, database, git, and Render deploys.

## Current live state (verified, not assumed)

Live at https://isrp-staff-bot.onrender.com, commit `14e14c4`, confirmed via `Render:get_deploy` returning `status: live` and via fresh log output showing a clean boot (`[db] schema ready` -> `[bot] hi#9174 is online` -> `8 slash commands registered` -> `[web] dashboard listening`) with no errors. Also confirmed by booting the app locally and issuing real HTTP requests to `/`, `/privacy`, `/terms`, `/style.css`, all returning 200 with expected content.

The `shifts` and `shift_members` tables exist in the live Neon database (`sweet-lab-61569129`, branch `br-plain-mud-aee6csdd`) for the first time as of this session, confirmed via `Neon:get_database_tables`, not assumed from having written the schema.

## Critical bugs found and fixed this session, in the order that matters

1. **Process crashed at require() time on every deploy since this morning.** `startLoa`, `getActiveLoa`, `endLoa`, `getActiveLoas` were listed in `database.js`'s `module.exports` and called by both the real `/loa` Discord command and this session's new dashboard routes, but were never actually implemented anywhere in the file. `ReferenceError` at module load, before `main()`, before `initDatabase()`, before anything. This means `/loa` was likely broken independent of anything from this session. Implemented all four, matching the exact contract `commands/loa.js` expects (plain `YYYY-MM-DD` text dates, not timestamps, since `ends_at` is a TEXT column templated directly into Discord timestamp markup).

2. **Every single page on the site rendered completely unstyled.** The `<link>` tag in every page's `<head>` requests `/style.css`. The Express route serving that file was mounted at `/static/style.css`, a path nothing ever requested. There was also a dead `express.static()` call pointing at a `public/` directory that never existed in this project. Net effect: no Material Design 3 styling, no fonts, no colors, no cards, no layout has ever actually rendered in a browser, just raw unstyled HTML. This is almost certainly what "the site looks empty" actually was. Fixed by mounting the route at the exact path requested.

3. **The web dashboard and the bot's own slash commands used two different, inconsistent permission systems.** The dashboard gated all access on Discord's raw ADMINISTRATOR permission bit (`adminGuildIds`, derived from OAuth). The bot's commands (`/promote`, `/demote`, `/infract`, `/history`, `/config` handlers) gate on `canManageStaff`: a configurable Staff Manage role OR the native Manage Roles permission. A staff member who could run `/promote` in Discord could not log into the dashboard at all unless they also happened to hold full server Administrator, meaning the entire staff self-service feature set (shifts, LOA, check-in) was unreachable by its actual intended audience. Fixed by adding `requireMember` (any live guild member, checked against the bot's own gateway member cache, not the OAuth session snapshot) for staff routes, and `requireAdmin` (reusing the real `canManageStaff` logic) for admin routes.

4. **`requireAdmin` was referenced four times in route definitions but never defined anywhere.** Would throw `ReferenceError` the moment `buildDashboardRouter(client)` ran during startup, on its own, independent of bug #1.

5. **Every form-backed page was broken.** `req.csrfToken()` was called as a function in seven places; no such method was ever attached to `req` anywhere (no `csurf` middleware, nothing). The actual token lives in `req.session.csrfToken`, a plain string set once at login and checked by the existing `requireCsrf` middleware. Every page calling the phantom method would 500 the instant it tried to render. Fixed by using `req.session.csrfToken` consistently everywhere.

6. **The settings page saved to field names the bot never reads.** Used `modRoleId`, `logsChannelId`, `ticketsChannelId`, none of which exist in the real `SCALAR_KEYS` (`staffManageRoleId`, `ticketStaffRoleId`, `sessionPingRoleId`, `logChannelId`, `ticketCategoryId`, defined in `utils/guildConfig.js`) or in the actual POST handlers. Submitting the channels form specifically would have actively nulled out the real, already-configured log channel and ticket category on every save, since the correct field names were simply never present in the request body. Rewrote the page with correct field names, and added the missing add-rank and infraction-type forms it never had despite the delete buttons already existing.

7. **Shift join/leave/check-in had backend routes with no UI to trigger them.** Added the actual buttons to the shift details page, wired to the existing (now CSRF-protected) routes.

8. **`join`/`leave` shift routes were the only two mutating routes missing CSRF protection.** Fixed.

9. **LOA end date used a `datetime-local` input**, producing values like `2026-09-15T14:30`, while the database column and the Discord `/loa` command's own validation expect a plain `YYYY-MM-DD` string, and the command templates it directly into `${ends_at}T00:00:00Z` for Discord's timestamp markup. A web-submitted LOA would have produced an invalid, broken timestamp anywhere `/loa list` displayed it. Fixed to a plain `<input type="date">`.

10. Three duplicate `module.exports` blocks in `views.js` from three separate `cat >> file` appends in a row (functionally harmless in CommonJS, since the last one wins, but dead code that could silently break exports later). Cleaned up to one.

11. Unused imports (`SCALAR_KEYS` in `views.js`, `buildCard` in `interactionCreate.js`) removed.

Verified clean afterward via a full ESLint `no-undef` plus correctness rule sweep (`no-dupe-keys`, `no-unreachable`, `no-redeclare`, etc.) across the entire `src/` tree: zero errors. Also manually cross-checked every command file (`promote.js`, `demote.js`, `infract.js`, `history.js`, `config.js`, `ticket-panel.js`, `loa.js`, `session-vote.js`), both interaction handlers (`configHandler.js`, `ticketHandler.js`), and `components.js` against the actual database function signatures they call. All consistent.

## New this session: Privacy Policy, Terms of Service, footer, richer login

- `GET /privacy` and `GET /terms`, public, no login required, in `server.js`
- Content is written to match what the code actually does, not generic boilerplate: no stored OAuth access tokens (used once at login, discarded), 24-hour httpOnly/secure session cookies stored server-side in Postgres, Google Fonts CDN disclosure (the only third-party request the site makes), staff record retention rationale, who can access what (self plus Staff Manage/Manage Roles for others)
- Site-wide footer linking both, added to the shared `layout()` function in `views.js`, appears on every page
- Login page expanded with a three-item feature summary and a "by continuing you agree to Terms/Privacy" line, partly addressing the "site looks empty" feedback alongside the CSS routing fix above (which is probably the bigger factor)

## Data deletion requests (added 2026-09-07)

Table `data_deletion_requests` (guild_id, user_id, reason, status, requested_at, handled_by, handled_at). Functions in `database.js`: `createDeletionRequest`, `getLatestDeletionRequest`, `getPendingDeletionRequests`, `getDeletionRequest`, `completeDeletionRequest` (transactional, deletes `shift_members` and `loas` rows for the user and marks the request completed atomically, so one can never happen without the other), `denyDeletionRequest`.

Deliberately does not touch `infractions` or `promotions`. Those remain the server's accountability record per the ToS ("Staff Records Are Real Records"), not self-erasable personal data.

Routes: `GET/POST /dashboard/:guildId/data-deletion` (staff, `requireMember`), `GET /dashboard/:guildId/deletion-requests` plus `.../complete` and `.../deny` (admin, `requireAdmin`). Linked from the staff dashboard under Your Profile, and from the admin section.

## Legal pages: verified subprocessor links (added 2026-09-07)

Privacy Policy and ToS both link to Render's actual current pages (`render.com/privacy`, `render.com/terms`, fetched and confirmed directly, not guessed) and to Databricks' current pages for Neon, since Neon was acquired by Databricks in 2025 and no longer has an independent privacy policy. `databricks.com/legal/privacynotice` is used in the Privacy Policy's subprocessor section, `databricks.com/legal/terms-of-use` in the ToS's infrastructure section. These are two different Databricks URLs for two different purposes, do not conflate them if editing.

## CSS aesthetic-consistency fixes (added 2026-09-07)

Found and fixed the same class of bug that caused the earlier outage, just in the stylesheet instead of server code: several selectors and tokens were referenced but silently wrong or duplicated, with no error thrown since CSS fails silently, unlike JS's `ReferenceError`. Worth knowing before touching `style.css` again:

- `--md-sys-typescale-font` was set to Roboto Flex while `body` separately hardcoded Google Sans Flex to override it. Fixed so the token itself is correct (Google Sans Flex, falling back to Roboto Flex, then system fonts) and nothing needs a separate override anymore.
- `.guild-item`, `.guild-icon`, `.guild-icon-placeholder`, `.list-row` were each defined twice (same duplicate-append pattern as the `module.exports` bug in `views.js` from the previous session). Consolidated to one definition each. If a class ever renders differently than its comment says it should, check for a second definition further down the file before assuming the logic itself is wrong.
- `--md-sys-motion-duration-short2` was referenced in five transitions but never defined, silently resolving to `0s` per the CSS spec's handling of an invalid `var()` reference with no fallback. All five "hover" transitions were snapping instantly with no animation. Now defined at 100ms, matching the real MD3 spec value.
- Added real elevation shadows to `.card`/`.card-high` and hover feedback to `.shift-card`, both previously flat/static despite being used for prominent or clickable content.

**When adding new CSS classes, grep for the selector first** (`grep -n "^\.your-class" src/web/style.css`) before appending a new block. This whole category of bug came from adding CSS via `cat >> file` without checking what already existed.

## Known, non-urgent design note (not a bug)

`/config` in Discord defaults to requiring full Administrator via Discord's own per-command permission system (`setDefaultMemberPermissions(PermissionFlagsBits.Administrator)`), while the equivalent web settings page only requires `canManageStaff` (Staff Manage role or Manage Roles). A Staff Manager without Administrator can edit these settings on the web but Discord will hide the `/config` command from them entirely unless the server owner explicitly reconfigures its permissions in Discord's Integrations settings. This may be intentional (settings are more consequential than day-to-day staff actions) but is worth confirming with G rather than unilaterally changing.

## Database Schema (current, verified against live Neon)

Tables: `shifts`, `shift_members`, `promotions`, `infractions`, `loas`, `settings`, `ranks`, `infraction_types`, `tickets`, `web_sessions`.

All database functions in `src/db/database.js` are exported and now actually implemented, including the four LOA functions that were missing. See the file directly for exact signatures rather than trusting a summary here, since that mismatch is exactly what caused today's outage.

## Dashboard Routes (current)

**Public, no auth:** `GET /`, `GET /privacy`, `GET /terms`

**Staff self-service** (`requireMember`, any live guild member): `/dashboard/:guildId/staff`, `/shift/:shiftId` (view, join, leave, check-in, check-out), `/loa` (view, start, end), `/user/:userId` (self always allowed, others require `canManageStaff`)

**Admin only** (`requireAdmin`, reuses `canManageStaff`): `/dashboard/:guildId` (settings), `/roles`, `/channels`, `/add-rank`, `/remove-rank`, `/add-infraction-type`, `/remove-infraction-type`, `/shifts` (list/manage), `/create-shift`, `/delete-shift`

## Render Deployment

Service: `isrp-staff-bot` (`srv-dadi11740ujc73bh83sg`, free plan, self-ping every 10 minutes). Workspace `tea-dab9orqjobas73bqsa4g`.

Env vars (set in Render dashboard): `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `DISCORD_CLIENT_SECRET`, `DATABASE_URL`, `SESSION_SECRET`, `DISABLE_SELF_PING=false`.

OAuth callback registered in Discord Developer Portal: `https://isrp-staff-bot.onrender.com/auth/callback`.

**After every push, do not trust `build_in_progress`.** Wait, then call `Render:get_deploy` on the specific deploy ID and confirm `status: live`. Pull fresh logs if there's any doubt. This exact mistake caused an entire session's worth of work to sit undeployed while being reported as done.

## GitHub

Repo `https://github.com/c7am/b`, branch `main`. Claude has autonomous push authority via PAT. Standard flow: edit locally in `/home/claude/bot`, verify with `node -c` plus the ESLint sweep plus actually executing changed code where feasible, commit, push, trigger deploy, confirm `status: live`, check logs.

## Rebranding to Axiom (2026-09-09)

Bot name and Discord app name now simply **Axiom** (was "ISRP Staff Bot"). All references in dashboard, embeds, footer, Privacy Policy, and ToS updated to generic multi-server language. Package.json name remains `staff-bot` internally (implementation detail).

Dashboard URL remains at `https://isrp-staff-bot.onrender.com` for now (Render rename would require DNS reconfiguration; deferred unless G requests).

## Ticket Panel Migration Completed (2026-09-09 Session)

**Phase 1 - COMPLETE**:
- Deleted `/src/commands/ticket-panel.js` (slash command removed)
- Added `getTicketCategories(guildId)` and `setTicketCategories(guildId, categories)` to `src/db/database.js` (stores in settings table as JSON, defaults to 4 categories if not configured)
- Updated `src/handlers/ticketHandler.js` to fetch categories dynamically instead of hardcoded `CATEGORY_LABELS`
- Added "Ticket Categories" section to admin settings dashboard (`/dashboard/:guildId`)
- Implemented `POST /dashboard/:guildId/post-ticket-panel` route:
  - Admin selects a text channel
  - Route fetches configured categories from database
  - Builds panel embed with dynamic category descriptions
  - Posts to selected channel with functional select menu
  - Shows success/error message in settings page
- Updated `buildTranscript()` to fetch dynamic categories for transcript headers

**Code Status**: All 6 modified files pass Node syntax check. Git commit `8241494` ready for deployment.

**Critical**: The commit exists locally but needs to be pushed to GitHub before Render can deploy. This requires:
1. GitHub PAT authentication (G has this, Claude does not in this session)
2. `git push origin main` from any authenticated terminal
3. Alternatively: trigger Render deploy directly from the web dashboard once code is pushed

**Next immediate step**: PUSH TO GITHUB, then use Render MCP to trigger deploy and verify boot sequence.

## Phase 2 (DEFERRED TO NEXT SESSION)

Implement custom infraction and shift type configuration (database schema and admin UI already support this; only UI forms and test needed).

## Phase 3 (DEFERRED)

Verify shift redirect and full dashboard stability in live run-through.



## Deployment Checklist For Next Session

**BLOCKING**: Commit `8241494` must be pushed to GitHub before Render can deploy.

### Step 1: Push to GitHub
```bash
# From any terminal with GitHub PAT credentials:
cd /home/claude/axiom
git push origin main
```

### Step 2: Trigger Render Deploy
Use Render MCP with workspace `tea-dab9orqjobas73bqsa4g`, service `srv-dadi11740ujc73bh83sg`:
```
Render:trigger_deploy
```
Save the deployId from the response.

### Step 3: Verify Deployment
Wait ~45 seconds, then:
```
Render:get_deploy(deployId=<from step 2>)
// Confirm: status: "live"
```

### Step 4: Check Boot Logs
```
Render:list_logs(direction: "backward", type: ["app"])
// Look for:
// [db] schema ready
// [bot] axiom#XXXX is online
// 7 slash commands registered (ticket-panel should NOT appear)
// [web] dashboard listening
```

### Step 5: Test in Discord
1. Run `/help` or any slash command to verify 7 commands (not 8)
2. Log into dashboard at `https://isrp-staff-bot.onrender.com`
3. Navigate to Settings page
4. Verify "Ticket Categories" section exists at bottom
5. Select a test channel and click "Post Ticket Panel"
6. Go to that Discord channel and verify panel appears with working select menu

### Step 6: Test Ticket Creation
1. In Discord, select a category from the ticket panel
2. Fill in the description modal
3. Verify ticket channel is created with correct name
4. Verify ticket data persists in database

## Continuation Prompt (For Next Agent)

> You are continuing work on **Axiom**, a proprietary Discord staff management bot for ERLC roleplay communities. Commit `8241494` implements Phase 1 of ticket panel migration (slash command removed, moved to dashboard with dynamic categories).
>
> **IMMEDIATE PRIORITY**: Push commit to GitHub and deploy via Render, following the Deployment Checklist above.
>
> After deployment is verified live:
> 1. Test end-to-end: post panel, select category, create ticket, verify everything works
> 2. Phase 2 (deferred): Implement custom infraction and shift type configuration UI
> 3. Phase 3: Verify shift redirect flow (Discord -> dashboard confirmation)
> 4. Scope: Prepare for ERLC API integration (account linking, player list commands, shift sync)
>
> **Key principles**: Proprietary code only. Verify deploys with `Render:get_deploy` on specific deployId, not `list_deploys`. Test rigorously. Challenge bad ideas. Talk like a human.

