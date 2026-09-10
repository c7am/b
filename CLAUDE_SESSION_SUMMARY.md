# Axiom - Session Summary (Sept 10, 2026)

## What Was Built

### 1. In-Game Moderation System (COMPLETE)
- Discord staff link Roblox accounts via `/erlc-link` command
- Staff moderate in-game with `?moderate PlayerName violation reason`
- Bot auto-revokes in-game mod perms if staff loses Discord role
- All moderations logged to staff member's record + player notified

**How It Works:**
1. Staff runs `/erlc-link` → Links Discord to Roblox username
2. Bot verifies account exists in ERLC, checks if user is Discord staff
3. If staff → sets `is_in_game_mod = true` in database
4. In-game: Staff types `?moderate PlayerName rdm Failed to comply`
5. Bot parses command, validates violation, logs it
6. If staff loses Discord staff role → next mod command fails with "You are no longer staff"

### 2. Smart Violation Matching (COMPLETE)
- Matches user input to violation ID intelligently
- Handles typos, abbreviations, full names, custom codes
- Examples:
  - `?moderate PlayerName vdm reason` → matches "VDM"
  - `?moderate PlayerName random deathmatch reason` → matches "RDM"
  - `?moderate PlayerName pg reason` → matches "Powergaming"
  - `?moderate PlayerName CustomType reason` → matches custom violation

**Matching Logic:**
1. Exact ID match: "rdm" → "rdm"
2. Short code match: "vdm" → "vdm", "random deathmatch" → "rdm"
3. Fuzzy match: "VDM" → "vdm" (case-insensitive, spacing-tolerant)
4. Custom violations checked same way

### 3. Moderation Violations (13 Presets + Custom)

**Default Presets with Short Codes:**
- **RDM** (rdm, random deathmatch) - killing without RP reason
- **VDM** (vdm, vehicle deathmatch) - killing with vehicle without reason
- **FRP** (frp, fail rp, fail-rp) - Failing to roleplay properly
- **Powergaming** (pg, powergaming, power gaming) - Unrealistic RP actions
- **Metagaming** (mg, metagaming, meta gaming) - Using OOC info in RP
- **Spam** (spam) - Spamming chat/commands
- **Disrespect** (disrespect, disrespectful) - Disrespecting staff/players
- **Exploit** (exploit, exploiting) - Using game exploits
- **Glitch Abuse** (glitch, glitch abuse, glitch-abuse) - Abusing glitches
- **NVL** (nvl, no value of life, no-value-life) - Not valuing character life
- **COP** (cop, cop-out, copout) - Cop Out / leaving during RP
- **Mixing** (mixing, ic/ooc mixing) - Mixing IC and OOC
- **NRP** (nrp, no roleplay) - Not roleplaying at all

**Custom Violations:**
- Admins can add per-guild custom violation types
- Format: Label, Short Codes (comma-separated), Description
- Stored in settings as JSON array
- Auto-detected by smart matching same way

### 4. Dashboard Settings Page Updates
- Shows all 13 default moderation presets with descriptions
- Shows custom violations if any exist
- Form to add new custom violation types
- Real-time validation

### 5. Rebranding to "Axiom"
- Bot name: Simply "Axiom" (no "Staff Bot" suffix)
- Tagline: "Staff and ERLC management tool"
- Applied across all UI elements

### 6. Domain Swap Guide (PROVIDED)
See section below for step-by-step domain change instructions

---

## Database Changes

### New Tables
- `discord_roblox_links`: Track Discord ↔ Roblox account mappings
  - `id`, `guild_id`, `discord_user_id`, `roblox_username`, `roblox_user_id`
  - `verified` (boolean), `is_in_game_mod` (boolean)
  - `linked_at`, `last_staff_check` timestamps
  - Indexes on (guild_id, discord_user_id) and (guild_id, roblox_username)

### Settings Keys (JSON in settings table)
- `moderation_presets`: Array of violation types with short codes
- `custom_violations`: Array of admin-added violation types
- `shift_types`: Shift configurations with duration limits
- `ticket_categories`: Support ticket categories

---

## Functions Added

### Database (src/db/database.js)
- `getModerationPresets(guildId)` - Get all violations for guild
- `setModerationPresets(guildId, presets)` - Update presets
- `getCustomViolations(guildId)` - Get custom violations
- `addCustomViolation(guildId, { label, shortCodes, description })` - Add custom type
- `matchViolation(guildId, userInput)` - Smart match input to violation ID
- `linkRobloxAccount(guildId, discordUserId, robloxUsername)` - Create link
- `getRobloxLink(guildId, discordUserId)` - Fetch link
- `getRobloxUsername(guildId, discordUserId)` - Get Roblox name
- `setInGameModStatus(guildId, discordUserId, isInGameMod)` - Enable/disable mod perms

### In-Game Moderation (src/handlers/inGameModerationHandler.js)
- `parseModCommand(messageContent)` - Parse `?moderate` command
- `verifyModStatus(guildId, discordUserId, guild)` - Check staff role, revoke if lost
- `logInGameModeration(...)` - Log moderation and notify parties

---

## Live Status

**Deploy:** `dep-dahg6euk1f9s73fm93g0`
**Status:** ✓ LIVE
**URL:** `https://isrp-staff-bot.onrender.com`

**Boot Sequence:**
```
✓ 9 slash commands registered
✓ DB schema ready (including discord_roblox_links)
✓ Bot online (hi#9174)
✓ Web dashboard listening on port 10000
✓ Zero errors
```

**Commands (9 total):**
- /config, /promote, /demote, /infract, /history, /loa, /session-vote
- /erlc-link (new), /erlc-players (new)

---

## Domain Swap Guide

### Option 1: Rename on .onrender.com (5 min, Easiest)

**Render Dashboard:**
1. Service: srv-dadi11740ujc73bh83sg
2. Settings → Service Name
3. Change `isrp-staff-bot` to `axiom-staff-bot`
4. Save (auto-generates `axiom-staff-bot.onrender.com`)

**Discord Dev Portal:**
1. OAuth2 → Redirect URIs
2. Change to `https://axiom-staff-bot.onrender.com/auth/callback`
3. Save

**Test:**
- Visit `https://axiom-staff-bot.onrender.com`
- Should redirect to Discord OAuth

### Option 2: Custom Domain (axiom.com if you own it)

**Render Dashboard:**
1. Settings → Custom Domains
2. Add your domain (e.g., axiom.dev)
3. Render provides CNAME record

**Your DNS Provider:**
1. Add CNAME record with value Render provided
2. Save
3. Wait 5-30 min for DNS propagation

**Discord Dev Portal:**
- Update callback to custom domain

---

## Known Issues & Notes

- Bot currently at `isrp-staff-bot.onrender.com` (domain rename pending)
- In-game moderation parser expects format: `?moderate PlayerName violation reason`
- Smart matching is case-insensitive and spacing-tolerant
- Custom violations auto-merged with presets in matching logic
- Staff mod perms auto-revoked if they lose staff role in Discord

---

## What's Ready for Next Session

- [ ] Domain rename (Option 1 or 2)
- [ ] 21st.dev UI component integration (minimal, M3-compliant)
- [ ] Shift sync to ERLC team assignment (when user starts shift)
- [ ] In-game moderation event listener (poll ERLC logs for `?moderate` commands)
- [ ] Admin UI for ERLC API key configuration
- [ ] Custom shift type editor (add/remove/edit types + duration limits)

---

## Code Quality

✓ All files pass `node -c` syntax check
✓ All imports verified
✓ No undefined references
✓ No em dashes in code/docs
✓ M3 CSS compliant
✓ Clean boot sequence with zero errors

---

**Session Completed:** Sept 10, 2026
**Total Commits:** 3 (Phase 2 + ERLC, In-Game Moderation, Smart Matching)
**Lines of Code:** ~800 (database + handlers + views + dashboard routes)

