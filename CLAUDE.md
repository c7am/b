# CLAUDE.md - Project Continuity Notes

**Last updated**: 2026-09-06. The bot was completely down since the morning of 2026-09-06 due to a crash-at-startup bug; it is now confirmed genuinely live and working end to end. Read this whole file before touching anything, the last "feature complete" claims in this file's history were wrong and not verified against a live deploy.

## Hard-learned lesson from this session

Earlier summaries in this project claimed features were "production ready" based on seeing `build_in_progress` on a triggered deploy and never circling back to confirm the deploy actually finished successfully. It did not. Every deploy from commit `f9af26a` onward failed, and the live site sat on a stale pre-shifts commit for the entire session while multiple "complete" writeups were produced. **Never declare something live without pulling the actual final deploy status and, ideally, real logs or a real HTTP request against the live URL.** `Render:get_deploy` on the specific deploy ID, checked after waiting for it to finish, not `Render:trigger_deploy`'s immediate response, is the source of truth.

Similarly: manual code review missed several real, severe bugs this session (undefined functions referenced in `module.exports`, a CSS route mismatch that meant the entire site rendered unstyled, `req.csrfToken()` called as a function that never existed). What actually caught these: running ESLint's `no-undef` rule across the whole `src/` tree, and actually executing every view function with fixture data plus booting the real Express app and issuing real HTTP requests. Prefer executing code over reading it whenever feasible.

## What this project is

Production Discord staff management bot for ISRP (Indiana State Roleplay) Roblox community. Eight slash commands (`/config`, `/promote`, `/demote`, `/infract`, `/history`, `/ticket-panel`, `/session-vote`, `/loa`), a web dashboard for staff self-service and admin management, Postgres (Neon) backend, free Render hosting with self-ping to avoid idle spin-down.

All async. No em dashes anywhere in code, comments, or user-facing text. No Unicode emojis, custom Lucide-derived Discord application emojis only. Material Design 3 Expressive throughout, Google Sans Flex typography. Catppuccin Mocha palette (Mauve seed, `#cba6f7`).

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

## Next steps

No specific feature was in flight when this note was written. Await direction from G. If resuming without direction: consider (a) confirming the `/config` Administrator-vs-canManageStaff question above with G rather than guessing, (b) further "less empty" work like dashboard stats or richer empty states if that's still wanted, (c) a live end-to-end click-through of the actual dashboard in a real browser against a real Discord account, which has not been done, only simulated locally with fixture data.
