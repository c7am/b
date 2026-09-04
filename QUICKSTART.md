# Quick Start Checklist

## 1. Bot Registration

- [ ] Create a Discord application at https://discord.dev/applications
- [ ] Create a bot user under the app
- [ ] Copy **TOKEN** to `.env` as `DISCORD_TOKEN`
- [ ] Copy **APPLICATION ID** to `.env` as `CLIENT_ID`
- [ ] Copy your **server ID** to `.env` as `GUILD_ID` (right-click server icon > Copy Server ID, Developer Mode must be on)
- [ ] Invite the bot: OAuth2 > URL Generator, select `bot` + `applications.commands` scopes, and at minimum: Manage Roles, Manage Channels, Send Messages, Use Slash Commands

## 2. Database

- [ ] Create a free Postgres database at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com). Not Render's own free Postgres, it deletes itself after 30 days.
- [ ] Copy the connection string to `.env` as `DATABASE_URL`

## 3. Install Dependencies

```bash
npm install
```

## 4. Set Up Icons (Optional but Recommended)

To get beautiful Lucide-based custom emojis in Discord:

```bash
npm run prepare-icons
npm run upload-emojis
```

First command requires `rsvg-convert` on your PATH:
- **Linux:** `sudo apt install librsvg2-bin`
- **macOS:** `brew install librsvg`

The bot works fine without running these, it just won't show custom icons (they appear blank). Running these commands requires DISCORD_TOKEN and CLIENT_ID to already be in `.env`.

## 5. Start the Bot

```bash
npm start
```

Watch for:
```
[bot] YourBotName#0000 is online
[sync] 8 slash commands registered
```

## 6. Configure It

Run `/config`. It posts one card showing your current setup, with buttons underneath:

- **Roles**: opens a form for Staff Manage, Ticket Staff, Session Ping role IDs
- **Channels**: opens a form for the log channel and ticket category IDs
- **Ranks**: add or remove a rank (name + role ID + level, or just a name to remove it)
- **Infractions**: same idea, name + points, or just a name to remove it

Run `/config` again any time to see current state or change something.

Ticket categories (General, Management, Partnership, Ownership) are built in, nothing to configure there.

## 7. Test It

- [ ] `/promote user:@someone rank:YourRank`: check the card, their DM, and the log channel
- [ ] `/demote user:@someone new_rank:LowerRank reason:"..." appealable:Yes`: same checks
- [ ] `/infract user:@someone type:YourType reason:"..."`: check the point total
- [ ] `/history user:@someone`: both should show up
- [ ] `/loa start user:@someone reason:"vacation" until:2026-09-15`: mark someone on leave
- [ ] `/loa list`: see active leaves of absence
- [ ] `/loa end user:@someone`: bring them back
- [ ] `/ticket-panel`: posts to the channel. Select a category from the dropdown, describe your issue, confirm the channel shows up with the right people able to see it. Close the ticket, channel should delete in a couple seconds and a transcript should appear in your log channel.
- [ ] `/session-vote votes:3`: vote, unvote, vote again, watch the count update on the button itself

## Reference

| What | Where |
|------|-------|
| Boot secrets (token, IDs) | `.env` |
| Everything else | `/config` in Discord |
| Database | Postgres, connection string in `DATABASE_URL` |
| Colors and icons | `src/config.js` |
| Custom emoji mappings | `scripts/prepare-icons.js` |

## Troubleshooting

**Bot doesn't show up after invite:** make sure `applications.commands` was checked in the OAuth2 URL Generator, then reload Discord.

**`/promote` or `/demote` says no ranks configured:** add one through `/config` first.

**`/infract`'s type field is empty:** same thing, add an infraction type through `/config` first.

**Ticket select menu doesn't do anything on its own:** that's expected, selecting a category opens a modal where you describe the issue. The ticket gets created when you submit the modal.

**Icons show as blank:** run `npm run prepare-icons && npm run upload-emojis` (if you haven't already), or check that the bot has the "Manage Guild Expressions" permission.

---

Full docs: `README.md`.
