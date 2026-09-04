# Deployment Guide: ISRP Staff Bot

This guide walks you through deploying the Discord staff bot to Render with a Neon Postgres database. Follow these steps exactly.

## What to upload to GitHub

Everything in the project root, no exceptions, no cherry-picking. Confirmed by checking the actual extracted zip: `node_modules/`, `data/`, and `.env` (the things `.gitignore` excludes) do not exist in the archive, so there is nothing to strip out. Upload the whole folder as-is:

```
CHANGES.md
CLAUDE.md
QUICKSTART.md
README.md
TS_RESOURCES.md
.env.example       (safe, contains no real secrets, only placeholder text)
.gitignore
assets/            (42 recolored icon PNGs, ~224K, used by upload-emojis.js)
package.json
package-lock.json
render.yaml
scripts/
src/
```

Do NOT create or upload a real `.env` file. All real secrets (`DATABASE_URL`, `DISCORD_TOKEN`, etc) get entered directly into Render's environment variable fields during service creation, never committed to git.

## Prerequisites

You need:
- A GitHub account
- A Render.com account
- Discord Developer Portal application already set up (with bot token, client ID, and OAuth2 client secret)
- A Neon Postgres project created (already exists, see CLAUDE.md for the project ID and how to pull a fresh connection string)

## Step 1: Prepare the Neon Database Connection String

Before you touch GitHub, get your `DATABASE_URL`.

### If you already have the Neon project:
1. Go to your Neon project dashboard
2. Find the connection string under "Connection" or "Connection string"
3. Copy the full PostgreSQL URL (looks like: `postgresql://user:password@host/database?sslmode=require`)
4. **Do not commit this anywhere. Store it securely for Step 5.**

### If you need to fetch it programmatically:
Use the Neon MCP tool:
- `project_id`: `sweet-lab-61569129`
- `database_name`: `staffbot`
- This returns the connection string with the real password

## Step 2: Push Code to GitHub

1. **Create a new GitHub repository** (name it whatever you want, e.g., `staff-bot`)
2. **Clone the repository locally:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/staff-bot.git
   cd staff-bot
   ```
3. **Extract the bot code** from `staff-bot-complete_5.zip` into this directory
4. **Verify the state before committing:**
   ```bash
   grep -rn "better-sqlite3" src/ package.json    # should return nothing
   grep "pg" package.json                          # should show pg as a dependency
   ls src/db/database.js                           # should exist and use pg
   ```
5. **Create CLAUDE.md inside the project root** (copy from uploaded CLAUDE.md or use the updated version below)
6. **Commit and push:**
   ```bash
   git add .
   git commit -m "Initial commit: Discord staff bot with Postgres"
   git push origin main
   ```

## Step 3: Set Up Discord OAuth

This must be done BEFORE the first deploy, or the login flow will fail immediately after deployment.

1. Go to Discord Developer Portal (https://discord.com/developers/applications)
2. Select your bot application
3. Go to "OAuth2" > "Redirects" in the left sidebar
4. **Add a redirect URI:** (exact format matters)
   - You don't know your Render URL yet, so you have two options:
     - **Option A (safer):** Deploy first (Step 4), then come back and add the real URL here
     - **Option B (if you know the pattern):** Render URLs are `https://SERVICE_NAME.onrender.com`. So if you name your service `staff-bot`, add `https://staff-bot.onrender.com/auth/callback`. Verified directly against `src/web/auth.js`, the route is `/auth/callback`, not `/auth/discord/callback`.
5. Save the changes

## Step 4: Deploy to Render

1. **Log into Render** (https://render.com)
2. **Click "New +" in the top right, select "Blueprint"**
3. **Point it at your GitHub repository:**
   - Connect your GitHub account if prompted
   - Select the repository you pushed in Step 2
   - Render will automatically read `render.yaml` from the root, which already sets `plan: starter` and `region: ohio`. Do not change these to free plan or a different region to save a few cents, the plan choice specifically prevents the free-tier idle spin-down from killing the bot's live Discord connection, and the region was picked to sit close to the Neon database.
4. **Name your service** (this becomes part of the URL, e.g., `staff-bot` means `https://staff-bot.onrender.com`)
5. **Render will prompt you for environment variables.** These are the real names, taken from `render.yaml` and `.env.example` directly, not memory:
   - `DISCORD_TOKEN` (your bot's token, from Developer Portal > Bot > Token)
   - `CLIENT_ID` (your bot's application/client ID, Developer Portal > General Information)
   - `GUILD_ID` (your Discord server's ID, right-click server icon > Copy Server ID, requires Developer Mode enabled in Discord settings)
   - `DATABASE_URL` (from Step 1, the Neon connection string)
   - `DISCORD_CLIENT_SECRET` (from Discord Developer Portal > OAuth2 > Client Secret. Note this exact name, not `CLIENT_SECRET`)
   - `SESSION_SECRET` (`render.yaml` has Render auto-generate this, you won't need to enter it manually)
   - `WEB_BASE_URL` (leave this unset, Render auto-detects its own URL)
6. **Deploy**

The first deploy takes 2-5 minutes. Watch the logs to confirm:
- `[web] self-ping enabled` should appear
- No errors about database connection
- Bot logs in to Discord successfully

## Step 5: Fix the OAuth Redirect URI (if you used Option B above)

After the first successful deploy, Render tells you the actual URL. Go back to Discord Developer Portal and add the exact callback URI:

```
https://YOUR_SERVICE_NAME.onrender.com/auth/callback
```

Test it: visit `https://YOUR_SERVICE_NAME.onrender.com` and click "Login with Discord". If you get redirected back successfully, OAuth is working.

## Step 6: Upload Custom Emojis

Once the bot is live and you have a real bot token, run the emoji upload script:

```bash
DISCORD_TOKEN=your_real_token node scripts/upload-emojis.js --force
```

This replaces the greyed-out placeholder icons with the actual colored Lucide SVGs. Only needs to run once. `--force` overwrites existing emojis.

## Step 7: Test the Bot Live

1. **Invite the bot to your Discord server** (if not already there)
   - Discord Developer Portal > General > Copy Client ID
   - Paste into URL: `https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot`
2. **Test commands in Discord:**
   - `/config` should work (opens a modal)
   - Try `/promote`, `/demote`, `/infract` to confirm database writes
   - Web dashboard should be accessible at `https://YOUR_SERVICE_NAME.onrender.com`
3. **Watch Render logs** for any errors:
   - Render dashboard > Services > staff-bot > Logs
   - Any database connection errors will show here immediately

## Troubleshooting

### "OAuth login fails" / "Redirect URI mismatch"
- Make sure the callback URI in Discord Developer Portal **exactly** matches your Render service's URL + `/auth/callback` (not `/auth/discord/callback`, verified against the actual route in `src/web/auth.js`)
- Case-sensitive, trailing slashes matter

### "Database connection refused"
- Check `DATABASE_URL` is pasted correctly in Render's environment variables
- Make sure it includes the full connection string with password
- Verify Neon project is still active (not suspended)

### Bot goes offline / random disconnects
- `render.yaml` already specifies `plan: starter`, not free, specifically because free plan spin-down would kill the live Discord gateway connection, not just the dashboard. If the service somehow got created on free plan instead, that mismatch is the first thing to check and fix.
- If it's genuinely on `starter` and still disconnecting, check Render's status page for an outage, or check the bot's own error logs for a Discord API issue unrelated to hosting

### `/config` modal does not appear
- Check browser console for errors (F12 > Console)
- Confirm all environment variables are set correctly in Render

## What NOT to do

- Do not commit `DATABASE_URL` or `DISCORD_TOKEN` to GitHub
- Do not use `better-sqlite3` (project is now Postgres-only)
- Do not manually restart the bot unless necessary (Render handles this)
- Do not change `PORT` manually (Render sets this automatically)

## Keeping the bot updated

Once deployed:
1. Make code changes locally
2. Commit and push to GitHub
3. Render automatically redeploys
4. Watch logs to confirm the new deployment succeeded

---

**Still stuck?** Check CLAUDE.md's "Known bugs / open items" and "Testing notes" sections. If you hit something not documented there, add it and commit.
