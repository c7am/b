const express = require('express');
const { ChannelType } = require('discord.js');
const { guildListPage, staffDashboard, shiftDetailsPage } = require('./views');
const {
  SCALAR_KEYS,
  getScalar,
  setScalar,
  getRanks,
  upsertRank,
  removeRank,
  getInfractionTypes,
  upsertInfractionType,
  removeInfractionType,
} = require('../utils/guildConfig');
const {
  getShifts,
  getShift,
  joinShift,
  leaveShift,
  getShiftMembers,
  getUserShifts,
  getActiveLoa,
  getUser,
} = require('../db/database');

const SNOWFLAKE_RE = /^[0-9]{15,25}$/;

// Express 4 does not catch rejected promises thrown from an async handler,
// an unhandled rejection there just hangs the request. Every route below is
// wrapped in this so a database hiccup returns a 500 instead of a stuck tab.
function asyncRoute(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error('[dashboard] route error:', err);
      if (!res.headersSent) res.status(500).send('Something went wrong loading this page. Check the server logs.');
    });
  };
}

function buildDashboardRouter(client) {
  const router = express.Router();

  function requireAuth(req, res, next) {
    if (!req.session.user) return res.redirect('/');
    next();
  }

  // Only lets the request through if the logged-in user is an admin in this
  // guild AND the bot itself is actually in that guild. Both checks matter:
  // being admin somewhere the bot is not present should not surface a
  // settings page for it, and the reverse (bot present but user not admin)
  // is the whole point of the OAuth gate in the first place.
  function requireGuildAccess(req, res, next) {
    const { guildId } = req.params;
    if (!req.session.adminGuildIds?.includes(guildId)) {
      return res.status(403).send('You do not have Administrator access to that server.');
    }
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).send('This bot is not in that server.');
    }
    req.guild = guild;
    next();
  }

  function requireCsrf(req, res, next) {
    if (req.body._csrf && req.body._csrf === req.session.csrfToken) return next();
    return res.status(403).send('Your session expired. Please refresh the page and try again.');
  }

  router.use(requireAuth);

  router.get('/', (req, res) => {
    const manageable = client.guilds.cache
      .filter((g) => req.session.adminGuildIds?.includes(g.id))
      .map((g) => ({ id: g.id, name: g.name, icon: g.icon }));
    res.send(guildListPage({ guilds: manageable, username: req.session.user.username }));
  });

  // Staff dashboard - shows user's shifts and LOA status
  router.get('/:guildId/staff', requireGuildAccess, asyncRoute(async (req, res) => {
    const guild = req.guild;
    const userId = req.session.user.id;
    
    const [shifts, activeLoa] = await Promise.all([
      getUserShifts(userId, guild.id),
      getActiveLoa(guild.id, userId),
    ]);

    res.send(staffDashboard({
      guild,
      user: { id: userId, name: req.session.user.username },
      shifts,
      activeLoa,
      recentInfractions: [],
    }));
  }));

  // Shift details - shows members and status
  router.get('/:guildId/shift/:shiftId', requireGuildAccess, asyncRoute(async (req, res) => {
    const guild = req.guild;
    const shift = await getShift(parseInt(req.params.shiftId, 10));
    
    if (!shift || shift.guild_id !== guild.id) {
      return res.status(404).send('Shift not found.');
    }

    const members = await getShiftMembers(shift.id);
    res.send(shiftDetailsPage({ guild, shift, members }));
  }));

  // Join shift
  router.post('/:guildId/shift/:shiftId/join', requireGuildAccess, asyncRoute(async (req, res) => {
    const guild = req.guild;
    const shiftId = parseInt(req.params.shiftId, 10);
    const userId = req.session.user.id;
    const shift = await getShift(shiftId);
    
    if (!shift || shift.guild_id !== guild.id) {
      return res.status(404).send('Shift not found.');
    }

    await joinShift(shiftId, userId);
    res.redirect(`/dashboard/${guild.id}/shift/${shiftId}`);
  }));

  // Leave shift
  router.post('/:guildId/shift/:shiftId/leave', requireGuildAccess, asyncRoute(async (req, res) => {
    const guild = req.guild;
    const shiftId = parseInt(req.params.shiftId, 10);
    const userId = req.session.user.id;
    const shift = await getShift(shiftId);
    
    if (!shift || shift.guild_id !== guild.id) {
      return res.status(404).send('Shift not found.');
    }

    await leaveShift(shiftId, userId);
    res.redirect(`/dashboard/${guild.id}/staff`);
  }));

  router.get('/:guildId', requireGuildAccess, asyncRoute(async (req, res) => {
    res.send(await renderSettings(req));
  }));

  async function renderSettings(req, flash) {
    const guild = req.guild;
    // @everyone always has id === guild.id, and should never appear as an
    // assignable staff/ticket/session-ping role option.
    const roles = guild.roles.cache
      .filter((r) => r.id !== guild.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => ({ id: r.id, name: r.name }));
    const textChannels = guild.channels.cache
      .filter((c) => c.type === ChannelType.GuildText)
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ id: c.id, name: c.name }));
    const categoryChannels = guild.channels.cache
      .filter((c) => c.type === ChannelType.GuildCategory)
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ id: c.id, name: c.name }));

    const scalarKeys = Object.keys(SCALAR_KEYS);
    const [scalarValues, ranks, infractionTypes] = await Promise.all([
      Promise.all(scalarKeys.map((key) => getScalar(guild.id, key))),
      getRanks(guild.id),
      getInfractionTypes(guild.id),
    ]);
    const scalars = {};
    scalarKeys.forEach((key, i) => { scalars[key] = scalarValues[i]; });

    // Rendered directly in response to the POST rather than a
    // redirect-then-flash-via-query-param, so a page reload does not
    // resubmit the form and the message never leaks into the URL.
    return settingsPage({
      guild: { id: guild.id, name: guild.name },
      roles,
      textChannels,
      categoryChannels,
      scalars,
      ranks,
      infractionTypes,
      csrfToken: req.session.csrfToken,
      flash,
    });
  }

  router.post('/:guildId/roles', requireGuildAccess, requireCsrf, asyncRoute(async (req, res) => {
    for (const key of ['staffManageRoleId', 'ticketStaffRoleId', 'sessionPingRoleId']) {
      const value = req.body[key];
      if (!value) {
        await setScalar(req.guild.id, key, null);
      } else if (SNOWFLAKE_RE.test(value) && req.guild.roles.cache.has(value)) {
        await setScalar(req.guild.id, key, value);
      }
      // Silently ignored if it fails validation, same behavior as the
      // /config modal: garbage input just does not get saved rather than
      // erroring out the whole form.
    }
    res.send(await renderSettings(req, { type: 'success', message: 'Roles updated.' }));
  }));

  router.post('/:guildId/channels', requireGuildAccess, requireCsrf, asyncRoute(async (req, res) => {
    const logChannelId = req.body.logChannelId;
    if (!logChannelId) {
      await setScalar(req.guild.id, 'logChannelId', null);
    } else if (SNOWFLAKE_RE.test(logChannelId) && req.guild.channels.cache.get(logChannelId)?.type === ChannelType.GuildText) {
      await setScalar(req.guild.id, 'logChannelId', logChannelId);
    }

    const ticketCategoryId = req.body.ticketCategoryId;
    if (!ticketCategoryId) {
      await setScalar(req.guild.id, 'ticketCategoryId', null);
    } else if (SNOWFLAKE_RE.test(ticketCategoryId) && req.guild.channels.cache.get(ticketCategoryId)?.type === ChannelType.GuildCategory) {
      await setScalar(req.guild.id, 'ticketCategoryId', ticketCategoryId);
    }
    res.send(await renderSettings(req, { type: 'success', message: 'Channels updated.' }));
  }));

  router.post('/:guildId/add-rank', requireGuildAccess, requireCsrf, asyncRoute(async (req, res) => {
    const { name, roleId, level } = req.body;
    if (!name?.trim() || !SNOWFLAKE_RE.test(roleId || '') || !/^[0-9]+$/.test(level || '')) {
      return res.send(await renderSettings(req, { type: 'error', message: 'Rank needs a name, a valid role, and a numeric level.' }));
    }
    if (!req.guild.roles.cache.has(roleId)) {
      return res.send(await renderSettings(req, { type: 'error', message: 'That role no longer exists in this server.' }));
    }
    await upsertRank(req.guild.id, { name: name.trim(), roleId, level: parseInt(level, 10) });
    res.send(await renderSettings(req, { type: 'success', message: `Rank "${name.trim()}" saved.` }));
  }));

  router.post('/:guildId/remove-rank', requireGuildAccess, requireCsrf, asyncRoute(async (req, res) => {
    const removed = await removeRank(req.guild.id, req.body.name || '');
    res.send(await renderSettings(req, removed
      ? { type: 'success', message: 'Rank removed.' }
      : { type: 'error', message: 'That rank was already removed.' }));
  }));

  router.post('/:guildId/add-infraction-type', requireGuildAccess, requireCsrf, asyncRoute(async (req, res) => {
    const { name, points } = req.body;
    // Non-negative only, matching the Discord /config modal's validation
    // (configHandler.js requires points >= 0). The dashboard should not be
    // able to create data the primary interface refuses to create.
    if (!name?.trim() || !/^[0-9]+$/.test(points || '')) {
      return res.send(await renderSettings(req, { type: 'error', message: 'Infraction type needs a name and a non-negative point value.' }));
    }
    await upsertInfractionType(req.guild.id, { name: name.trim(), points: parseInt(points, 10) });
    res.send(await renderSettings(req, { type: 'success', message: `Infraction type "${name.trim()}" saved.` }));
  }));

  router.post('/:guildId/remove-infraction-type', requireGuildAccess, requireCsrf, asyncRoute(async (req, res) => {
    const removed = await removeInfractionType(req.guild.id, req.body.name || '');
    res.send(await renderSettings(req, removed
      ? { type: 'success', message: 'Infraction type removed.' }
      : { type: 'error', message: 'That infraction type was already removed.' }));
  }));

  return router;
}

module.exports = { buildDashboardRouter };
