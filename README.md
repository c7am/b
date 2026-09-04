# Staff Bot

A Discord bot for staff management with promotions, infractions, ticket system, and session voting. Built on discord.js v14 with Components V2 (Catppuccin Mocha + Lucide icons) for clean, professional cards.

## Features

### Staff Management
- **`/promote`** - Promote a staff member to a configured rank. Logs to database, DMsthe user, posts to log channel.
- **`/infract`** - Issue an infraction (warning, strike, suspension) with point tracking. User gets DMed automatically.
- **`/history`** - Look up a staff member's full promotion and infraction history, with active point totals.

### Ticket System
- **`/ticket-panel`** - Post the support panel in a channel. Select dropdown shows categories (General, Management, Partnership, Ownership).
- **Selecting a category** - Opens a modal to describe the issue in detail.
- **Auto-create** - New ticket channel spawns with naming: `username-category-ticketid`. Only the opener and staff can see it. Initial message shows the issue description.
- **`[Close & Delete]`** - Staff or ticket opener can close and delete. Before deletion, the bot saves the full message transcript to the log channel as a `.txt` file for record-keeping.

### Leave of Absence
- **`/loa start`** - Mark a staff member as on leave. Requires reason (dropdown: vacation, personal, medical, work/studies, other) and return date (YYYY-MM-DD format).
- **`/loa end`** - Mark a staff member as back from leave.
- **`/loa list`** - View all currently active leaves of absence.

### Session Voting
- **`/session-vote`** - Staff starts a vote to begin a session. Specifies how many votes are required.
- **Single button** - "Vote" button with live tally (e.g., "Vote (3/5)"). Click to vote, click again to unvote.
- **Auto-ping** - After posting, bot pings the `Citizen` role to notify everyone.

### Web Dashboard
- Browser-based alternative to `/config`'s modal, with real dropdowns for roles and channels instead of a 5-field-per-modal limit.
- Log in with Discord OAuth2. Only shows servers where you have Administrator permission and the bot is present.
- Same underlying settings as `/config`, changes made on one show up in the other immediately, since both write to the same database.
- Material Design 3 styling (Expressive variant), dark theme matching the bot's own Catppuccin Mocha identity.
- Optional: the bot runs fine without it if the relevant environment variables are not set (see `.env.example`).

### Visual Design
- All outputs use Discord Components V2 containers (accent-colored cards, no ugly embeds).
- Icons from **Lucide** recolored to **Catppuccin Mocha** palette and rendered as server custom emojis.
- Clean, professional look: headings, body text, thumbnails, dividers, buttons, footers.

### Data Persistence
- **Postgres**, shared between the bot process and the web dashboard, stores all promotions, infractions, ranks, infraction types, settings, tickets, and leaves of absence.
- Query `/history` to see full timeline, sorted newest first.
- On startup, the schema is created automatically if it does not already exist.

---

## Installation

### Prerequisites
- Node.js 18+ (check with `node --version`)
- Git
- A Discord bot token and server to test in

### Setup Steps

1. **Clone or extract the bot folder**, then `cd staff-bot`.

2. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

3. **Get a Postgres database.** [Neon](https://neon.tech) or [Supabase](https://supabase.com) both work and both have a usable free tier. Do not use Render's own free Postgres offering for this: Render deletes a free database entirely after 30 days plus a 14-day grace period, Neon and Supabase's free tiers suspend an idle database instead of deleting it. Either one gives you a connection string.

4. **Fill in `.env`,** the boot secrets plus your database connection string, everything else is configured in Discord or on the web dashboard:
   ```
   DISCORD_TOKEN=your_bot_token
   CLIENT_ID=your_app_id
   GUILD_ID=your_server_id
   DATABASE_URL=postgres://user:password@host/dbname?sslmode=require
   ```

5. **Set up icons** (one-time):
   ```bash
   node scripts/prepare-icons.js
   ```
   This requires `rsvg-convert` on your PATH (`sudo apt install librsvg2-bin` on Linux, `brew install librsvg` on macOS).
   
   Then, with your Discord credentials in `.env`, run:
   ```bash
   node scripts/upload-emojis.js
   ```
   This pushes the custom Lucide icons to Discord as application emojis. The bot works without it (no icons shown), but running this completes the visual identity.

6. **Start the bot:**
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm install -D nodemon
   npm run dev
   ```

7. **Configure it from inside Discord,** run `/config` (admin-only by default). It shows your current setup and gives you buttons for Roles, Channels, Ranks, and Infractions. Each opens a short form. Run `/config` again any time to check on things or make changes. The web dashboard (see above) does the same thing with real dropdowns instead.

---

## Deploying on Render

A `render.yaml` blueprint is included. In the Render Dashboard: New -> Blueprint, point it at this repo, and Render reads `render.yaml` and provisions the service.

A few things worth knowing before you do:

- **This has to be a Web Service, not a Background Worker.** The dashboard needs a public HTTP endpoint, and only Web Services get one. The tradeoff is that the same process holding the Discord gateway connection is now also the one serving HTTP.
- **Free plan will not work well for this.** Render's free web services spin down after 15 minutes with no HTTP traffic, and since the bot's gateway connection lives in that same process, spin-down takes the bot offline too, not just the dashboard. The included self-ping (see `.env.example`'s `DISABLE_SELF_PING`) works around this by generating its own traffic every 10 minutes, but it is a workaround, not a fix, Render can still restart the instance for other reasons. A paid Starter plan ($7/mo at time of writing) removes the spin-down entirely and is the actually-reliable option.
- **`DATABASE_URL` needs to be a Neon or Supabase connection string,** set manually in the Render Dashboard on first Blueprint sync (`render.yaml` marks it `sync: false` so it is never committed to the repo). See the Installation section above for why not Render's own free Postgres.
- **`WEB_BASE_URL` does not need to be set on Render**, it is auto-detected from `RENDER_EXTERNAL_URL`, which Render sets automatically. Set it only if you are deploying somewhere else.
- After the first deploy, go back to the Discord Developer Portal's OAuth2 tab and add `<your-service>.onrender.com/auth/callback` as a redirect URI, or login will fail.

---

## Configuration

Everything's set live in Discord (run `/config`) or on the web dashboard, nothing to edit on disk.

### Roles
Staff Manage (who can use `/promote`, `/demote`, `/infract`, `/history`, `/session-vote`), Ticket Staff (auto-added to every ticket), Session Ping (pinged when `/session-vote` runs).

### Channels
Log channel (where promote/infract/demote cards get mirrored) and the category new ticket channels spawn under.

### Ranks
Name, role ID, and a level number for ordering. `/promote` and `/demote` autocomplete from this list. Add the same name again to update it instead of duplicating it.

### Infraction Types
Name and a point value, must be zero or positive. `/infract` autocompletes from this list. Points add up per person, check the running total with `/history`.

### Ticket Categories
General, Management, Partnership, and Ownership are built into the ticket panel, not something you configure, they're just always there.

### Icons
Icons are Lucide SVGs recolored to Catppuccin Mocha and uploaded as Discord application emojis for a cohesive, professional look.

1. **Local setup:** `node scripts/prepare-icons.js` recolors Lucide SVGs and rasterizes them to 128x128 PNGs. Requires `rsvg-convert` on PATH.
2. **Upload to Discord:** `node scripts/upload-emojis.js` pushes the PNGs to your Discord application, generating `src/generated/icons.json` with their IDs.
3. **Usage:** `icon('name')` returns the `<:name:id>` tag; `iconEmoji('name')` returns `{id, name}` for button/option emoji assignment.

The bot runs without icons (they're not strictly needed), but uploading them completes the visual polish.

---

## Usage Examples

### Promoting a Staff Member
```
/promote user: @john rank: Moderator reason: Consistent performance
```
- John gets promoted, DMed, and a card is posted to the log channel.
- Database records the promotion with timestamp.

### Issuing an Infraction
```
/infract user: @jane type: Strike reason: Breaking rule 5 twice
```
- Jane receives a 4-point strike, DMed with details.
- `/history jane` will show it in her timeline.

### Opening a Ticket
1. User clicks **Open Ticket** button on the ticket panel.
2. Modal asks for category + description.
3. Private thread spawns; staff is auto-added.
4. User sees confirmation card; staff can help.
5. Click **Close Ticket** when done; user can't write.
6. Staff clicks **Delete** to remove the channel.

### Session Vote
```
/session-vote title: Promote John to Admin description: He's been solid for 3 months
```
- Staff react yes/no; counts update live.
- Hit **Close Vote**; result shown (passed/failed).
- If passed, bot pings `SESSION_PING_ROLE_ID`.

---

## Troubleshooting

### Bot doesn't respond to commands
- Check `DISCORD_TOKEN` and `CLIENT_ID` in `.env`.
- Ensure bot has "Use Slash Commands" permission in your server.
- Run the bot with `node src/index.js` and watch for errors.

### Database errors
- Check `DATABASE_URL` is set and reachable, `node -e "require('./src/db/database').pool.query('SELECT 1').then(() => console.log('OK')).catch(e => console.error(e))"` will confirm connectivity on its own.
- If it hangs rather than erroring, check the connection string's host is actually reachable from wherever the bot is running (a firewall or a stale/rotated Neon branch endpoint are the usual causes).
- Schema is created automatically on boot if missing, there is nothing to delete and recreate the way there was with the old SQLite file.

### Components V2 not rendering
- Ensure `discord.js` is v14.27+: `npm ls discord.js`
- Check that all commands use `...V2` flag in replies.

---

## Development

### File Structure
```
staff-bot/
├── src/
│   ├── index.js                    # Client setup, command loading, awaits DB init before login
│   ├── config.js                   # Colors, custom Lucide icons, icon helpers
│   ├── commands/
│   │   ├── config.js               # /config dashboard
│   │   ├── promote.js              # /promote
│   │   ├── demote.js               # /demote
│   │   ├── infract.js              # /infract
│   │   ├── history.js              # /history
│   │   ├── ticket-panel.js         # /ticket-panel
│   │   ├── session-vote.js         # /session-vote
│   │   └── loa.js                  # /loa (start/end/list)
│   ├── handlers/
│   │   ├── configHandler.js        # /config button/modal flow
│   │   └── ticketHandler.js        # Ticket creation, transcripts, deletion
│   ├── events/
│   │   ├── ready.js                # Bot ready event, registers commands, starts the web dashboard
│   │   └── interactionCreate.js    # Routes: autocomplete, slash, modals, buttons, select menus
│   ├── db/
│   │   └── database.js             # Postgres: promotions, infractions, settings, ranks, infraction types, tickets, LOAs
│   ├── web/
│   │   ├── server.js               # Express app assembly, session middleware, Render PORT/host binding, self-ping
│   │   ├── auth.js                 # OAuth2 login/callback/logout routes
│   │   ├── dashboard.js            # Guild list + settings CRUD routes
│   │   ├── discordApi.js           # OAuth token exchange, current-user/guilds fetch, admin bitwise check
│   │   ├── sessionStore.js         # Postgres-backed express-session store (connect-pg-simple)
│   │   ├── views.js                # All HTML rendering, plain template literals
│   │   └── style.css               # Material Design 3 (Expressive) tokens and styling
│   └── utils/
│       ├── components.js           # buildCard() helper
│       ├── permissions.js          # canManageStaff(), isTicketStaff()
│       └── guildConfig.js          # Per-guild settings read/write, thin wrapper over db/database.js
├── scripts/
│   ├── prepare-icons.js            # Recolors Lucide SVGs to Catppuccin Mocha, rasterizes to PNG
│   ├── upload-emojis.js            # Uploads PNGs to Discord, generates icons.json
│   └── generate-theme.mjs          # Dev-only: regenerates the MD3 color scheme if the brand seed color changes
├── assets/
│   ├── icons-raw/                  # Recolored SVGs
│   └── icons-png/                  # Rasterized 128x128 PNGs
├── src/generated/
│   └── icons.json                  # Generated by upload-emojis.js, consumed by config.js
├── package.json
├── render.yaml                     # Render Blueprint for one-step deployment
├── .env.example
├── README.md
└── QUICKSTART.md
```

### Adding a New Command
1. Create `src/commands/mycommand.js` with `data` (SlashCommandBuilder) and `execute`.
2. Module is auto-loaded in `src/index.js`; no registration needed.

### Adding a New Icon
1. Edit `scripts/prepare-icons.js`: add a mapping in `ICON_SET` (e.g., `myicon: { file: 'lucide-icon-name', color: 'colorkey' }`). Check `lucide-static/icons/` for available icon names.
2. Run `npm run prepare-icons` to generate PNGs in `assets/icons-png/`.
3. Run `npm run upload-emojis` (requires `DISCORD_TOKEN` and `CLIENT_ID` in `.env`) to push to Discord and generate `src/generated/icons.json`.
4. Call `icon('myicon')` in text or `iconEmoji('myicon')` for button/select menu emojis.

### Adding a New Per-Guild Setting
1. Add a getter/setter pair to `src/utils/guildConfig.js` (follow the scalar or array pattern already there).
2. Wire it into a new `/config` subcommand in `src/commands/config.js`.
3. Read it wherever needed with `getScalar(guildId, key)` or the relevant getter.

---

## License

ISC (edit as needed for your org).
