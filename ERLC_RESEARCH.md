# ERLC API & Bot Features Research

**Date:** 2026-09-18  
**Source:** Public API docs, GitHub repos, Discord bot ecosystem

## ERLC API Overview

### Base Info
- **Official Docs:** https://apidocs.erlc.gg
- **Endpoint Base:** `https://api.erlc.gg/v2/`
- **Auth:** Server key in `server-key` header (purchased API pack required)
- **Rate Limiting:** Dynamic, default enabled; global keys for large scale
- **Webhooks:** Event-driven, real-time notifications supported
- **Current Version:** v2 (v1 deprecated)

### Core Endpoints (v2 API)

**Server Data:**
- `GET /server` - Server name, status, join key, player count, queue length
- `GET /players` - Full player list with Roblox ID, name, team, permission level, location
- `GET /staff` - Staff-only data, ranks, callsigns
- `GET /queue` - Queue list with join timestamps
- `GET /vehicles` - Spawned vehicles on server (model, driver, location)
- `GET /bans` - Ban list with Roblox IDs, ban reason, timestamp
- `GET /logs/killlogs` - Kill logs with victim, killer, weapon, timestamp
- `GET /logs/commandlogs` - Command execution logs (what mod ran, command, target)
- `GET /logs/modcalls` - Moderator call logs

**Server Control:**
- `POST /command` - Execute in-game commands (`:kick`, `:ban`, `:pm`, `:announce`, `:weather`, etc.)
- `POST /team/lock` - Lock team to specific roles
- `POST /team/unlock` - Unlock team

### Popular Library Wrappers
- **erlc-api.py** (Python) - Typed, async/sync, dashboard utilities, webhooks
- **erlcjs** (TypeScript monorepo) - Modern, full-typed, rate limiting, caching
- **erlc-api** (npm) - Lightweight, v2-first, GlobalToken support
- **prc.api** (Python) - Actively maintained, comprehensive coverage

---

## Common Discord Bot Features (Ecosystem Survey)

### High Priority (70%+ adoption)
1. **Player List Display**
   - Real-time online players with team, callsign, permission level
   - Clickable Roblox profile links
   - Searchable/sortable by team or name

2. **Server Info Panel**
   - Live join key, queue count, staff count
   - Server name, player capacity
   - Often auto-updating embed every 5-10s

3. **Command Execution**
   - Slash command wrapper for `:kick`, `:ban`, `:pm`, `:announce`
   - Permission checks (e.g., only role X can kick)
   - Command validation before execution

4. **Logging & Audit Trail**
   - Join/leave logs → Discord channel
   - Kill logs → Discord channel (with killer + victim names)
   - Command logs (staff action logs) → audit channel
   - Optional: Ban/unban logs

5. **API Key Management**
   - `/setapi <key>` per Discord server
   - `/removeapi` to clear
   - Secure storage (environment or encrypted DB)

### Medium Priority (40-60% adoption)
6. **Infraction System**
   - Warn → kick → ban progression
   - Database of infractions per player
   - Integration with in-game `:warn`, `:kick`, `:ban` commands

7. **Shift Management**
   - Officers can `/shift start` and `/shift end`
   - Tracks shift duration, on-duty status
   - SQLite/JSON storage of shift logs
   - Optionally expose via REST API for dashboards

8. **Webhooks & Real-Time Events**
   - Listen for ERLC webhooks (join, leave, kill, command)
   - Post to Discord immediately (no polling delay)
   - Event-driven vs. polling (webhooks are 1000x faster)

9. **Server Shutdown & Alerts**
   - `/shutdown` with in-game alert & mass kick
   - Auto-announces to Discord
   - Graceful countdown timer

10. **Role/Team Sync**
    - Sync Discord roles to in-game teams
    - Restrict teams by role (e.g., only LEOs on police team)
    - Warn if mismatch or role-lock violated

### Low Priority (< 40% adoption, but nice-to-have)
11. **SSV (Server Start-Up Vote)**
    - `/ssv` to initiate, bot counts votes
    - Auto-starts server when threshold met
    - Discord role filtering (staff/mods only)

12. **Ban Appeals System**
    - Modal form in Discord → appeal channel
    - Staff can accept/deny with button reactions
    - SQLite record of appeals

13. **Character Auto-Generation**
    - Civilian players create character via Discord
    - Bot auto-populates in CAD/server
    - Sync with group ranks

14. **Moderation Tools**
    - Mute/unmute in Discord
    - Permission role management (`/addrole`, `/removerole`)
    - Promotion/demotion workflow

15. **Dashboard REST API**
    - FastAPI/Express endpoint exposing shift logs, player stats
    - Foundation for custom web UI or MDT/CAD integration
    - Used by Sonoran CAD, AwareCAD, etc.

---

## Ecosystem Competitive Analysis

### Existing Solutions (What Users Buy Instead)

**Sonoran CAD** (Industry Leader)
- Free tier: dispatch + MDT + 911 sync + bodycam + character gen
- ERLC integration: live 3D map, unit tracking, automated traffic stops
- Requires: API pack purchase from ERLC
- Weakness: Not Discord-native (separate web UI)

**AwareCAD** (Emerging)
- Built specifically for ERLC from day one
- Single sign-on across 3+ roleplay groups
- Dispatch board, officer MDT, civilians portal
- Real-time sync (no refresh lag)
- Application tracks, member management, audit log
- Weakness: Paid product, less free tier

**Popular Discord Bots** (Niche Leaders)
- Velra: Player list, server info, ERLC command execution, API key per server
- ERLC Aid: Moderation, utility, built for ER:LC specifically
- CRP: Logging & tracking infractions
- TogetherHumanity/erlc: Shift management + FastAPI dashboard foundation

### What's Missing / Opportunity
- **No unified Discord-first hub** combining all features above
- **No visual dashboard** accessible from Discord (embeds are limit)
- **No structured permissions system** with role hierarchy
- **Limited historical analytics** (kill/command logs kept but not analyzed)
- **No built-in CAD/MDT** within Discord (all external)

---

## Features We Should Borrow for Axiom

### Tier 1: Must Have (Quick Wins)
1. Real-time player list with Roblox profile links (already have)
2. Server info panel (live, auto-updating)
3. Command execution via slash commands (with permission checks)
4. Join/leave/kill logs → Discord channels (event webhooks)
5. API key management per guild

### Tier 2: Should Have (Medium Effort)
6. Infraction system with warn/kick/ban progression
7. Shift management with `/shift start` / `/shift end`
8. Webhook event handling (real-time instead of polling)
9. Server shutdown with alerts and mass kick
10. Team/role sync across Discord & in-game

### Tier 3: Nice to Have (Differentiate)
11. Ban appeals system with modal forms
12. Dashboard REST API (FastAPI) for shift logs, player analytics
13. Staff review/promotion workflow
14. Moderation audit log (who kicked who, when, why)
15. Scheduled events (SSV votes, maintenance windows)

---

## Technical Debt / Lessons from Ecosystem

### What Works
- **Webhooks >> Polling.** Event-driven updates (join, leave, command) are instant vs. 5-10s delay
- **Typed responses.** The best ERLC libraries (erlc-api.py, erlcjs) use TypeScript/dataclasses — saves bugs
- **Modular design.** Separate classes for API access, Discord handlers, database — easier to extend
- **Rate limit handling.** Default on; transparent to user — prevents accidental bans

### What Breaks Easily
- **Nested template literals in JS.** Most ERLC bots have syntax errors from overly complex escaping (seen in 3+ projects)
- **No data validation.** Raw API responses dumped to DB without type checking → garbage data
- **Blocking polls.** Some bots poll `/players` every 1s on 10 servers → rate limits
- **Unencrypted keys.** Several projects store API keys in plaintext `.env` or Discord messages

### What ERLC Communities Actually Need
1. A single source of truth (not Discord + CAD + spreadsheet)
2. Role hierarchy: head admin > moderator > staff > member
3. Audit trails for every action (who warned, when, why)
4. Automated workflows (warn 3x → auto-kick; join without role → warn staff)
5. Dashboard accessible from phone (not just Discord)

---

## Recommendations for Axiom

### Short Term (This Sprint)
- Add webhook listener for ERLC events (replace polling)
- Build infraction system with persistent DB
- Add team/role sync (lock police team to @LEO role)
- Implement moderation audit log

### Medium Term (Next Sprint)
- Shift management system (start/end commands + storage)
- Ban appeals modal form + review workflow
- FastAPI dashboard (shift logs, player stats, infraction history)
- Automated infraction workflow (warn count → auto action)

### Long Term (Product Roadmap)
- Styled web dashboard (not just Discord embeds)
- Character generator (civilians create via form → auto in-game)
- Dispatch integration (receive 911 calls, dispatch units, track units on map)
- Multi-server management (Axiom runs on 3+ servers, unified dashboard)
- Analytics (who kills whom, shift durations, infraction trends)

---

## ERLC API Gotchas

1. **Server key is per-server**, not per-account — can't list all your servers without hardcoding keys
2. **Rate limits vary** by endpoint and global key status — no official limits published
3. **Webhooks are optional** — without them, polling `/logs/*` adds latency
4. **Ban list is append-only** — no soft-delete, hard to sync with Discord ban DB
5. **Command results are async** — `:kick` might fail silently, no confirmation back via API
6. **Player locations are approximate** — useful for mapping, not precision
7. **Team names are hard-coded in-game** — can't rename via API, limits customization

