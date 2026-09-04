# CLAUDE.md - Project Continuity Notes

Last updated: deployed version ready, added comprehensive deployment guide. Bot runs on Node.js, Discord.js v14, Postgres (Neon), Catppuccin Mocha colors, no em dashes anywhere, no Unicode emojis (custom Discord application emojis only).

## What this project is

A production Discord staff management bot for an ISRP (Indiana State Roleplay) community server. Eight slash commands: `/config`, `/promote`, `/demote`, `/infract`, `/history`, `/ticket-panel`, `/session-vote`, `/loa`. Plus a browser-based configuration dashboard (OAuth2 login, Postgres-backed sessions, Material Design 3 styling).

Database is Postgres (Neon), not local SQLite. All database calls are `async`/`await`. Custom emojis are built from Lucide SVGs through a recolor-and-rasterize pipeline.

G communicates in short directives, expects scope to be inferred, wants direct pushback on bad ideas, and has authorized managing connected Neon infrastructure directly.

## Before you trust anything in this file

Previous sessions have died mid-task before final packaging, losing features that had to be rebuilt. If you are reading this: do not assume the current state matches what's written here.

Verify:
```bash
find . -type f -not -path "./node_modules/*" -not -path "./.git/*" | sort
grep -rn "better-sqlite3" src/ package.json   # should return nothing
grep "pg\b" package.json                      # should show pg as a dependency
ls src/db/database.js                         # should exist
```

If `better-sqlite3` appears or `src/db/database.js` does not require `pg`, the Postgres migration is not complete in your copy.

## The Postgres migration (completed)

Bot originally used local SQLite (`better-sqlite3`). Moved to Postgres (Neon) because Render's free tier has an ephemeral filesystem wiped on every redeploy. SQLite cannot survive there.

**What changed:**
- `src/db/database.js`: rewritten around a `pg.Pool`. Uses `SERIAL` for IDs (not `BIGSERIAL`), because `pg` returns `BIGINT` as strings, which would silently convert every ID to a string. Verified against real Postgres before committing.
- Ranks and infraction types moved into real tables (`ranks`, `infraction_types`) with atomic `ON CONFLICT ... DO UPDATE` upserts instead of read-modify-write at the JS level (was a race condition over the network).
- `loas.ends_at` stays `TEXT`, not `TIMESTAMPTZ`, because `loa.js` string-templates it directly. A `TIMESTAMPTZ` column comes back as a `Date` object, which would break the pattern.
- Session store switched to `connect-pg-simple` instead of hand-rolled SQLite class.
- SSL handling: `ssl: { rejectUnauthorized: false }` for non-local hosts, `ssl: false` only for localhost/127.0.0.1.

**Verified, not assumed:** ran every database function against a real local Postgres 16 instance, then against the real Neon project via its own tools. Both matched.

## The Neon database

Real Neon project created via MCP integration (G authorized this):
- **Org**: `org-small-tree-54996986` (free plan)
- **Project ID**: `sweet-lab-61569129`, name `staff-bot`
- **Database**: `staffbot`, role `staffbot_owner`
- **Region**: AWS us-east-2

Schema already applied and verified, currently empty, ready for real use.

The `DATABASE_URL` connection string (with real password) was given in chat, not stored here or committed (this file is tracked). If lost, fetch it again with Neon MCP: `get_connection_string` with `project_id: sweet-lab-61569129`, `database_name: staffbot`. Paste it into Render's environment variables when deploying, never into a file.

**Why Neon over Render's own Postgres**: Render's free Postgres is deleted after 30 days + 14-day grace period. Neon suspends idle free-tier databases instead, and wakes them transparently on the next query.

## The Render deployment

`render.yaml` deliberately sets `plan: starter`, not free. Reason is in the file's own comment: free plan spins the process down after 15 minutes idle, and this process holds the live Discord gateway connection, not just the web dashboard. Spin-down would take the whole bot offline, not just the browser config page. Do not "optimize" this back to free without understanding that tradeoff first.

Region is `ohio`, picked to sit close to the Neon project's `us-east-2` region.

Bot binds to `0.0.0.0:PORT` (Render sets `PORT` automatically, do not set it yourself). Auto-detects `RENDER_EXTERNAL_URL` for the web dashboard when `WEB_BASE_URL` is left unset. Includes a self-ping every 10 minutes via `DISABLE_SELF_PING=false` as a leftover safeguard from when this ran on free plan; harmless but pointless on `starter`, which has no spin-down to begin with.

**Real env vars, from `.env.example` and `render.yaml`, not guessed:**
- `DISCORD_TOKEN` - bot token, required to boot
- `CLIENT_ID` - bot's application/client ID, required
- `GUILD_ID` - the server's guild ID, required
- `DATABASE_URL` - Neon connection string, required, get with Neon MCP `get_connection_string` (see above), never commit this
- `DISCORD_CLIENT_SECRET` - OAuth2 client secret for the web dashboard login flow, from the same Developer Portal app as `CLIENT_ID`. Note the name: not `CLIENT_SECRET`, that was wrong in an earlier draft of this file.
- `SESSION_SECRET` - `render.yaml` has Render auto-generate this, no action needed
- `WEB_BASE_URL` - leave unset on Render
- `DISABLE_SELF_PING` - leave `false`, irrelevant on `starter` but harmless

**OAuth callback path, verified against `src/web/auth.js` directly, not documentation:** the real route is `/auth/callback`, mounted under whatever base path `server.js` uses for the auth router. It is NOT `/auth/discord/callback`, an earlier draft of this file had that wrong. Full redirect URI to register in Discord Developer Portal is `<WEB_BASE_URL or Render URL>/auth/callback`.

**Status as of this note: no GitHub repo exists yet.** Code has not been pushed anywhere. `Render:create_web_service` needs a real git URL to clone from, so nothing can be created on Render's side until that repo exists. If you are reading this and a live Render service already exists, this note is stale, verify state with `Render:list_services` before assuming the below sequence still needs doing.

**For the first deploy:**
1. Create a GitHub repo, push everything in the project root except what `.gitignore` already excludes (`node_modules/`, `data/`, `.env`, `*.log`, `.DS_Store`, none of which exist in the current tree, so as of this note the entire tree ships as-is)
2. Get the repo URL, call `Render:create_web_service` with `runtime: node`, `plan: starter`, `region: ohio`, `buildCommand: npm install`, `startCommand: npm start`, and the real env vars above (pull `DATABASE_URL` fresh from Neon MCP rather than trusting an old copy)
3. After the service comes up, take the real `onrender.com` URL Render assigns and register `<that URL>/auth/callback` in Discord Developer Portal under OAuth2 > Redirects
4. Confirm via `Render:list_deploys` or logs that the deploy succeeded and the bot logged into Discord, not just that the build finished

See `DEPLOYMENT_GUIDE.md` (in the root) for the full walkthrough, including exact instructions for what to upload to GitHub and why.

## Known bugs / open items

- **Unresolved for four sessions**: `/session-vote`'s final "Start Session" announcement pings `staffManageRoleId`. Never explicitly confirmed. One-line change in `buildAnnouncementCard`'s caller if wrong role.
- **Known gap, not built**: if voters un-vote after the SSU threshold DM goes out (dropping tally below required count), nothing re-checks at "Start" click time.
- **Not yet live-tested**: actual Render deployment (PORT detection, self-ping working in production, OAuth redirect matching) and real Neon connection from deployed instance. This sandbox could not reach neon.tech directly. Both need a real deploy to confirm.

## Testing notes

- Full database layer tested against real local Postgres 16: every function in `database.js`, case-insensitive upsert/delete, JSONB round-tripping, RETURNING id, SERIAL vs BIGSERIAL return types.
- Schema DDL and ON CONFLICT pattern also run against real Neon project via its own `run_sql` tool.
- 24-check end-to-end HTTP test against real running Express app (real Postgres, full OAuth flow, guild access control, CSRF enforcement, every CRUD path, logout).
- Full module-load regression across every command, event, handler, util, and web module after async conversion.
- Full `src/index.js` boot with real Postgres connection: confirmed database initializes successfully and proceeds to Discord gateway login (fails only because sandbox cannot reach discord.com).

**Not verified**: live Discord OAuth against real Developer Portal app, live Render deployment, live Neon connection from outside this sandbox. All require G to actually deploy.

## Quick file map

- `src/index.js` - entry point, awaits `initDatabase()` before login.
- `src/events/ready.js` - registers slash commands, starts web dashboard once guild cache populated.
- `src/events/interactionCreate.js` - central dispatcher for every interaction type.
- `src/commands/*.js` - one file per slash command, all async DB calls.
- `src/handlers/ticketHandler.js` - ticket creation, closing, transcripts.
- `src/handlers/configHandler.js` - `/config` modal and button logic.
- `src/utils/components.js` - `buildCard()`, shared Components V2 card builder.
- `src/utils/guildConfig.js` - thin async wrapper over database, preserves function names so both `/config` and web dashboard use same interface.
- `src/utils/permissions.js` - `canManageStaff`, `isTicketStaff`, both async.
- `src/db/database.js` - Postgres schema, all queries, exports the `pool`.
- `src/config.js` - Catppuccin Mocha palette, `icon()` and `iconEmoji()` helpers.
- `src/web/server.js` - Express app assembly, Render PORT/host binding, `RENDER_EXTERNAL_URL` auto-detection, self-ping.
- `src/web/auth.js` - OAuth2 login/callback/logout routes.
- `src/web/dashboard.js` - guild list and settings CRUD routes, all async.
- `src/web/discordApi.js` - OAuth token exchange, current-user/guilds fetch, administrator bitwise check.
- `src/web/sessionStore.js` - `connect-pg-simple`-backed session store.
- `src/web/views.js` - all HTML rendering, plain template literals.
- `src/web/style.css` - MD3 Expressive design tokens and styling.
- `scripts/generate-theme.mjs` - dev-only, regenerates MD3 color scheme from Catppuccin Mauve if seed changes. `npm run generate-theme`, paste output into `style.css`'s `:root` by hand.
- `scripts/prepare-icons.js` - Lucide SVG to recolored PNG.
- `scripts/upload-emojis.js` - PNG to Discord application emoji (`--force` refreshes).
- `render.yaml` - Render Blueprint for deployment.
- `DEPLOYMENT_GUIDE.md` - step-by-step deployment walkthrough.

## Continue prompt for another agent

> This is an ongoing Discord staff bot project. Read CLAUDE.md first (in the root, inside the project), all of it including the "Before you trust anything" section. Then independently verify the actual state before assuming anything is present. Check that `src/db/database.js` requires `pg` and that `better-sqlite3` is gone from `package.json`. Sessions on this project have died before their packaging step more than once.
>
> Once confirmed, the bot is ready to deploy. See `DEPLOYMENT_GUIDE.md` for full step-by-step instructions: GitHub setup, Discord OAuth config, Render Blueprint deployment, environment variables, emoji upload, and troubleshooting.
>
> Expectations: infer scope, do not re-summarize prior work, push back directly if something is a bad idea, no em dashes anywhere, keep that rule enforced across the whole codebase.
