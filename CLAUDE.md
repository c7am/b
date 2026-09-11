# CLAUDE.md - Axiom Project State

**Last Updated:** September 11, 2026 | **Deploy:** dep-dahpgm9594qs7381fpug | **Status:** ✓ LIVE

---

## Project Overview

**Axiom** is a proprietary Discord staff and ERLC management tool for ERLC (Emergency Response: Liberty County) Roblox roleplay communities.

**Stack:** Node.js 18+, Discord.js v14, PostgreSQL (Neon), Render hosting, Express dashboard, Material Design 3 (Catppuccin Mocha)

---

## Session Completed (Sept 11, 2026)

### 1. Roblox Account Verification ✓
- `/erlc-link` generates random 12-word censorship-safe phrase
- Staff puts phrase in Roblox bio, clicks "Verify My Account"
- Bot prompts for Roblox username, fetches profile to verify
- Staff auto-get in-game mod perms if Discord staff role exists
- "Regenerate Words" button if Roblox censors phrase

### 2. Roblox Avatar Fetching ✓
- When moderation logged: bot fetches player's Roblox avatar
- Avatar included in Discord moderation channel embeds
- Uses public Roblox API (420x420 PNG), graceful fallback

### 3. Smart Violation Matching ✓
- 13 presets: RDM, VDM, FRP, Powergaming, Metagaming, Spam, Disrespect, Exploit, Glitch Abuse, NVL, COP, Mixing, NRP
- Handles typos, shorthand, custom types per-guild
- Case-insensitive matching via `matchViolation()`

### 4. In-Game Moderation System ✓
- Staff uses `?moderate PlayerName violation reason`
- Bot parses command, validates, logs with avatar
- Auto-revokes mod perms if staff loses Discord role
- Smart violation matching on input

### 5. ERLC Event Listener ✓
- Polls server logs every 30 seconds for `?moderate` commands
- Auto-processes moderation from in-game chat
- Posts to Discord mod channel with embeds
- Finds moderator by Roblox username link
- Graceful error handling (doesn't crash on failures)

### 6. Shift Sync to ERLC Teams ✓
- When staff joins shift: auto-syncs to mapped ERLC team
- Reads shift type, finds team ID from mapping
- Calls `setPlayerTeam()` via ERLC API
- Graceful fallback if sync fails

### 7. Admin ERLC Configuration UI ✓
- Settings page: "ERLC Server Configuration" section
- API key input (password-masked)
- Validation: tests key before saving
- Shows what gets enabled (players, shift sync, real-time monitoring)
- Route: `POST /dashboard/:guildId/set-erlc-api-key`

### 8. Minimal M3 Polish ✓
- Card hover states: subtle shadow elevation
- Status badges: success, warning, info variants
- Status indicator dots: active/inactive/warning with pulse animation
- Smooth transitions on all interactive elements
- Uses M3 motion tokens + Catppuccin colors

---

## Current Live State

**Deploy:** `dep-dahpgm9594qs7381fpug`
**Status:** ✓ LIVE (verified in logs)
**URL:** https://isrp-staff-bot.onrender.com
**Uptime:** Self-ping every 10 min (prevents Render free-tier spin-down)
**Commands:** 9 total (/config, /promote, /demote, /infract, /history, /loa, /session-vote, /erlc-link, /erlc-players)

**Boot Sequence (verified):**
```
[db] schema ready
[bot] hi#9174 is online
[sync] 9 slash commands registered
[erlc-listen] Started listening for guild 1540038714934300732
[web] dashboard listening on port 10000
Service is live
```

---

## Database State

**Tables:** shifts, shift_members, promotions, infractions, loas, settings (JSONB), ranks, infraction_types, tickets, web_sessions, data_deletion_requests, discord_roblox_links

**Key Settings Stored as JSONB:**
- `ticket_categories` - Ticket types (4 defaults)
- `shift_types` - Shift types with min/max duration (4 defaults)
- `moderation_presets` - 13 violation presets
- `custom_violations` - Admin-added violation types
- `erlc_api_key` - ERLC Private Server API key (per guild)
- `shift_type_team_map` - Maps shift type ID -> ERLC team ID

**discord_roblox_links Table:**
- Columns: id, guild_id, discord_user_id, roblox_username, roblox_user_id, verified, is_in_game_mod, linked_at, last_staff_check
- Unique index: (guild_id, discord_user_id)

---

## Files Modified This Session

- `src/erlc/erlcEventListener.js` (NEW - event polling + processing)
- `src/web/dashboard.js` (shift sync + API key route)
- `src/web/views.js` (ERLC config UI)
- `src/events/ready.js` (event listener startup)
- `src/web/style.css` (M3 polish styles)

---

## Pending Features (For Next Sessions)

1. **Domain Rename** (skipped this session per G)
   - isrp-staff-bot.onrender.com → axiom-staff-bot.onrender.com

2. **Proper Roblox Bio Verification**
   - Currently instructional (manual check)
   - Need: Roblox API OAuth to fetch user bio

3. **Admin Shift Type Editor**
   - Add/remove/edit shift types with duration limits

4. **Message Content Intent for Real-Time Moderation**
   - Currently polling (30sec delay), could use messageCreate event

5. **Audit Log Dashboard**
   - Display all infractions, moderation, promotions

---

## Quick Reference

**Test Local Syntax:**
```bash
for f in src/**/*.js; do node -c "$f"; done
```

**Deploy:**
```bash
git add -A
git commit -m "message"
git push origin main
Render:trigger_deploy
```

**Check Logs:**
```bash
Render:list_logs --resource srv-dadi11740ujc73bh83sg --limit 30
```

---

**All systems live. Ready for testing.**
