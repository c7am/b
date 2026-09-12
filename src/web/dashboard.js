const express = require('express');
const { ChannelType } = require('discord.js');
const { syncShiftToErlc } = require('../handlers/erlcHandler');
const {
  docsPage,
  guildListPage,
  staffDashboard,
  shiftDetailsPage,
  createShiftPage,
  shiftsListPage,
  loaRequestPage,
  checkInPage,
  userProfilePage,
  settingsPage,
  auditLogPage,
  dataDeletionPage,
  deletionRequestsListPage,
  inGameModerationPage,
} = require('./views');
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
  createShift,
  deleteShift,
  joinShift,
  leaveShift,
  getShiftMembers,
  getUserShifts,
  checkInShift,
  checkOutShift,
  getActiveLoa,
  startLoa,
  endLoa,
  getUser,
  createDeletionRequest,
  getLatestDeletionRequest,
  getPendingDeletionRequests,
  getDeletionRequest,
  completeDeletionRequest,
  denyDeletionRequest,
  getTicketCategories,
  setTicketCategories,
  getShiftTypes,
  setShiftTypes,
  addShiftType,
  removeShiftType,
  getModerationPresets,
  getCustomViolations,
  addCustomViolation,
  matchViolation,
} = require('../db/database');
const { canManageStaff } = require('../utils/permissions');

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

  // Guild-membership gate for staff self-service pages (shifts, LOA,
  // check-in). Deliberately checked live against the bot's own gateway
  // member cache rather than trusted from the OAuth session snapshot,
  // since someone can leave the guild or have their roles changed after
  // logging in but before the session cookie expires (24h). Sets req.guild,
  // req.member (a real discord.js GuildMember, not the raw OAuth partial),
  // and req.isAdmin so every view can consistently show or hide
  // admin-only UI without re-deriving it per route.
  //
  // Wrapped in its own try/catch, same reasoning as asyncRoute below: this
  // runs as Express middleware, not through asyncRoute, and an async
  // function that throws without being awaited by the caller becomes an
  // unhandled rejection. Modern Node terminates the whole process on those
  // by default, which would take the entire bot offline over one bad
  // canManageStaff DB lookup, not just fail the one request.
  async function requireMember(req, res, next) {
    try {
      const { guildId } = req.params;
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        return res.status(404).send('This bot is not in that server.');
      }
      let member;
      try {
        member = await guild.members.fetch(req.session.user.id);
      } catch {
        return res.status(403).send('You are not a member of that server.');
      }
      req.guild = guild;
      req.member = member;
      req.isAdmin = await canManageStaff(member, guildId);
      next();
    } catch (err) {
      console.error('[dashboard] requireMember error:', err);
      if (!res.headersSent) res.status(500).send('Something went wrong checking server access. Check the server logs.');
    }
  }

  // Stricter gate for admin-only pages (settings, shift creation/deletion,
  // arbitrary user history). Reuses the exact same canManageStaff check the
  // slash commands already enforce (configured Staff Manage role, or the
  // Discord-native Manage Roles permission), instead of the OAuth
  // ADMINISTRATOR bit the dashboard used previously. That mismatch meant a
  // person who could run /promote in Discord could not reach these pages
  // at all unless they also happened to hold full server Administrator.
  function requireAdmin(req, res, next) {
    requireMember(req, res, () => {
      if (!req.isAdmin) {
        return res.status(403).send('This page requires the Staff Manage role or Manage Roles permission.');
      }
      next();
    });
  }

  function requireCsrf(req, res, next) {
    if (req.body._csrf && req.body._csrf === req.session.csrfToken) return next();
    return res.status(403).send('Your session expired. Please refresh the page and try again.');
  }

  router.use(requireAuth);

  router.get('/', (req, res) => {
    // Guilds the bot is actually in, intersected with guilds this user
    // belongs to per their last login. Not filtered to admin-only anymore,
    // since regular staff (not just admins) need to reach their own
    // shifts/LOA pages, not just server owners.
    const memberIds = new Set(req.session.memberGuildIds || []);
    const manageable = client.guilds.cache
      .filter((g) => memberIds.has(g.id))
      .map((g) => ({ id: g.id, name: g.name, icon: g.icon }));
    res.send(guildListPage({ guilds: manageable, username: req.session.user.username }));
  });

  // Documentation
  router.get('/docs', asyncRoute(async (req, res) => {
    res.send(docsPage());
  }));

  router.get('/:guildId/docs', requireMember, asyncRoute(async (req, res) => {
    const guild = req.guild;
    res.send(docsPage({ guild, guildId: guild.id }));
  }));

  // Staff dashboard - shows user's shifts and LOA status
  router.get('/:guildId/staff', requireMember, asyncRoute(async (req, res) => {
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
      isAdmin: req.isAdmin,
    }));
  }));

  // Shift details - shows members and status
  router.get('/:guildId/shift/:shiftId', requireMember, asyncRoute(async (req, res) => {
    const guild = req.guild;
    const shiftId = parseInt(req.params.shiftId, 10);
    const shift = await getShift(shiftId);
    
    if (!shift || shift.guild_id !== guild.id) {
      return res.status(404).send('Shift not found.');
    }

    const members = await getShiftMembers(shiftId);
    const isJoined = members.some(m => m.user_id === req.session.user.id);
    
    // Check ERLC SSU status
    const { checkSsuStatus } = require('../handlers/erlcHandler');
    const ssuStatus = await checkSsuStatus(guild.id);
    
    // Get shift state status
    const { getShiftStatus } = require('../db/database');
    const shiftStatus = await getShiftStatus(shiftId);

    res.send(shiftDetailsPage({
      guild,
      shift,
      members,
      isJoined,
      csrfToken: req.session.csrfToken,
      guildId: guild.id,
      shiftId,
      ssuStatus,
      shiftStatus,
    }));
  }));

  // Join shift
  router.post('/:guildId/shift/:shiftId/join', requireMember, requireCsrf, asyncRoute(async (req, res) => {
    const guild = req.guild;
    const shiftId = parseInt(req.params.shiftId, 10);
    const userId = req.session.user.id;
    const shift = await getShift(shiftId);
    
    if (!shift || shift.guild_id !== guild.id) {
      return res.status(404).send('Shift not found.');
    }

    // Check SSU status before allowing join
    const { checkSsuStatus } = require('../handlers/erlcHandler');
    const ssuStatus = await checkSsuStatus(guild.id);
    
    if (!ssuStatus.ready) {
      return res.status(400).send(`Cannot join shift: ${ssuStatus.reason}`);
    }

    await joinShift(shiftId, userId);
    res.redirect(`/dashboard/${guild.id}/shift/${shiftId}`);
  }));

  // Leave shift
  router.post('/:guildId/shift/:shiftId/leave', requireMember, requireCsrf, asyncRoute(async (req, res) => {
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

  // Admin: List and manage shifts
  router.get('/:guildId/shifts', requireAdmin, asyncRoute(async (req, res) => {
    const shifts = await getShifts(req.guild.id, { active: true });
    res.send(shiftsListPage({
      guild: req.guild,
      shifts,
      csrfToken: req.session.csrfToken,
      guildId: req.guild.id,
    }));
  }));

  // Admin: Create shift form
  router.get('/:guildId/create-shift', requireAdmin, asyncRoute(async (req, res) => {
    res.send(createShiftPage({
      guild: req.guild,
      csrfToken: req.session.csrfToken,
      guildId: req.guild.id,
    }));
  }));

  // Admin: Create shift (POST)
  router.post('/:guildId/create-shift', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
    const { name, description, startsAt, endsAt } = req.body;
    if (!name || !startsAt || !endsAt) {
      return res.status(400).send('Missing required fields.');
    }

    await createShift({
      guildId: req.guild.id,
      name,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      description: description || null,
      createdBy: req.session.user.id,
    });

    res.redirect(`/dashboard/${req.guild.id}/shifts`);
  }));

  // Admin: Delete shift
  router.post('/:guildId/delete-shift', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
    const shiftId = parseInt(req.body.shiftId, 10);
    const shift = await getShift(shiftId);
    
    if (!shift || shift.guild_id !== req.guild.id) {
      return res.status(404).send('Shift not found.');
    }

    await deleteShift(shiftId);
    res.redirect(`/dashboard/${req.guild.id}/shifts`);
  }));

  // Shift state management (start/pause/resume/end)
  router.post('/:guildId/shift/:shiftId/start', requireMember, requireCsrf, asyncRoute(async (req, res) => {
    const shiftId = parseInt(req.params.shiftId, 10);
    const shift = await getShift(shiftId);
    
    if (!shift || shift.guild_id !== req.guild.id) {
      return res.status(404).send('Shift not found.');
    }

    await startShift(shiftId);
    res.json({ status: 'ok', message: 'Shift started' });
  }));

  router.post('/:guildId/shift/:shiftId/pause', requireMember, requireCsrf, asyncRoute(async (req, res) => {
    const shiftId = parseInt(req.params.shiftId, 10);
    const shift = await getShift(shiftId);
    
    if (!shift || shift.guild_id !== req.guild.id) {
      return res.status(404).send('Shift not found.');
    }

    await pauseShift(shiftId);
    res.json({ status: 'ok', message: 'Shift paused' });
  }));

  router.post('/:guildId/shift/:shiftId/resume', requireMember, requireCsrf, asyncRoute(async (req, res) => {
    const shiftId = parseInt(req.params.shiftId, 10);
    const shift = await getShift(shiftId);
    
    if (!shift || shift.guild_id !== req.guild.id) {
      return res.status(404).send('Shift not found.');
    }

    await resumeShift(shiftId);
    res.json({ status: 'ok', message: 'Shift resumed' });
  }));

  router.post('/:guildId/shift/:shiftId/end', requireMember, requireCsrf, asyncRoute(async (req, res) => {
    const shiftId = parseInt(req.params.shiftId, 10);
    const shift = await getShift(shiftId);
    
    if (!shift || shift.guild_id !== req.guild.id) {
      return res.status(404).send('Shift not found.');
    }

    await endShift(shiftId);
    res.json({ status: 'ok', message: 'Shift ended' });
  }));

  // Staff: Check-in/check-out page
  router.get('/:guildId/shift/:shiftId/check-in', requireMember, asyncRoute(async (req, res) => {
    const shiftId = parseInt(req.params.shiftId, 10);
    const shift = await getShift(shiftId);
    
    if (!shift || shift.guild_id !== req.guild.id) {
      return res.status(404).send('Shift not found.');
    }

    const members = await getShiftMembers(shiftId);
    const userMember = members.find(m => m.user_id === req.session.user.id);
    
    if (!userMember) {
      return res.status(403).send('You are not assigned to this shift.');
    }

    res.send(checkInPage({
      guild: req.guild,
      shift,
      userMember,
      csrfToken: req.session.csrfToken,
      guildId: req.guild.id,
      shiftId,
    }));
  }));

  // Staff: Check in
  router.post('/:guildId/shift/:shiftId/check-in', requireMember, requireCsrf, asyncRoute(async (req, res) => {
    const shiftId = parseInt(req.params.shiftId, 10);
    const shift = await getShift(shiftId);
    
    if (!shift || shift.guild_id !== req.guild.id) {
      return res.status(404).send('Shift not found.');
    }

    const members = await getShiftMembers(shiftId);
    const userMember = members.find(m => m.user_id === req.session.user.id);
    
    if (!userMember) {
      return res.status(403).send('You are not assigned to this shift.');
    }

    // Update checked_in status in shift_members
    await checkInShift(shiftId, req.session.user.id);
    
    res.redirect(`/dashboard/${req.guild.id}/shift/${shiftId}/check-in`);
  }));

  // Staff: Check out
  router.post('/:guildId/shift/:shiftId/check-out', requireMember, requireCsrf, asyncRoute(async (req, res) => {
    const shiftId = parseInt(req.params.shiftId, 10);
    const shift = await getShift(shiftId);
    
    if (!shift || shift.guild_id !== req.guild.id) {
      return res.status(404).send('Shift not found.');
    }

    const members = await getShiftMembers(shiftId);
    const userMember = members.find(m => m.user_id === req.session.user.id);
    
    if (!userMember) {
      return res.status(403).send('You are not assigned to this shift.');
    }

    // Update checked_out status in shift_members
    await checkOutShift(shiftId, req.session.user.id);
    
    res.redirect(`/dashboard/${req.guild.id}/shift/${shiftId}/check-in`);
  }));

  // Staff: LOA request form
  router.get('/:guildId/loa', requireMember, asyncRoute(async (req, res) => {
    const activeLoa = await getActiveLoa(req.guild.id, req.session.user.id);
    res.send(loaRequestPage({
      guild: req.guild,
      currentLoa: activeLoa,
      csrfToken: req.session.csrfToken,
      guildId: req.guild.id,
      userId: req.session.user.id,
    }));
  }));

  // Staff: Start LOA
  router.post('/:guildId/start-loa', requireMember, requireCsrf, asyncRoute(async (req, res) => {
    const { reason, endsAt } = req.body;
    if (!reason || !endsAt) {
      return res.status(400).send('Missing required fields.');
    }

    await startLoa({
      guildId: req.guild.id,
      userId: req.session.user.id,
      reason,
      endsAt,
    });

    res.redirect(`/dashboard/${req.guild.id}/loa`);
  }));

  // Staff: End LOA
  router.post('/:guildId/end-loa', requireMember, requireCsrf, asyncRoute(async (req, res) => {
    await endLoa(req.guild.id, req.session.user.id);
    res.redirect(`/dashboard/${req.guild.id}/staff`);
  }));

  // Staff: Data deletion request status or form
  router.get('/:guildId/data-deletion', requireMember, asyncRoute(async (req, res) => {
    const latestRequest = await getLatestDeletionRequest(req.guild.id, req.session.user.id);
    res.send(dataDeletionPage({
      guild: req.guild,
      guildId: req.guild.id,
      // ?new=1 lets someone submit again after a completed or denied
      // request instead of being stuck looking at the old one forever.
      latestRequest: req.query.new === '1' ? null : latestRequest,
      csrfToken: req.session.csrfToken,
    }));
  }));

  // Staff: Submit a data deletion request
  router.post('/:guildId/request-deletion', requireMember, requireCsrf, asyncRoute(async (req, res) => {
    const existing = await getLatestDeletionRequest(req.guild.id, req.session.user.id);
    if (existing && existing.status === 'pending') {
      return res.status(400).send('You already have a pending deletion request.');
    }
    await createDeletionRequest({
      guildId: req.guild.id,
      userId: req.session.user.id,
      reason: req.body.reason || null,
    });
    res.redirect(`/dashboard/${req.guild.id}/data-deletion`);
  }));

  // Admin: Review queue for pending deletion requests
  router.get('/:guildId/deletion-requests', requireAdmin, asyncRoute(async (req, res) => {
    const requests = await getPendingDeletionRequests(req.guild.id);
    res.send(deletionRequestsListPage({
      guild: req.guild,
      guildId: req.guild.id,
      requests,
      csrfToken: req.session.csrfToken,
    }));
  }));

  // Admin: Complete a deletion request (actually deletes shift/LOA data)
  router.post('/:guildId/deletion-requests/:requestId/complete', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
    const request = await getDeletionRequest(parseInt(req.params.requestId, 10));
    if (!request || request.guild_id !== req.guild.id) {
      return res.status(404).send('Request not found.');
    }
    if (request.status !== 'pending') {
      return res.status(400).send('That request has already been handled.');
    }
    await completeDeletionRequest({
      requestId: request.id,
      guildId: req.guild.id,
      userId: request.user_id,
      handledBy: req.session.user.id,
    });
    res.redirect(`/dashboard/${req.guild.id}/deletion-requests`);
  }));

  // Admin: Deny a deletion request
  router.post('/:guildId/deletion-requests/:requestId/deny', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
    const request = await getDeletionRequest(parseInt(req.params.requestId, 10));
    if (!request || request.guild_id !== req.guild.id) {
      return res.status(404).send('Request not found.');
    }
    if (request.status !== 'pending') {
      return res.status(400).send('That request has already been handled.');
    }
    await denyDeletionRequest({ requestId: request.id, handledBy: req.session.user.id });
    res.redirect(`/dashboard/${req.guild.id}/deletion-requests`);
  }));

  // Staff: Audit log with filters and export
  router.get('/:guildId/audit', requireMember, asyncRoute(async (req, res) => {
    const { type, userId, dateFrom, dateTo } = req.query;
    
    // Fetch all audit data
    const { addInfraction, addPromotion, getInfractionsByGuild, getPromotionsByGuild, getShifts } = require('../db/database');
    
    const infractions = await getInfractionsByGuild(req.guild.id);
    const promotions = await getPromotionsByGuild(req.guild.id);
    const shifts = await getShifts(req.guild.id, { active: false, upcoming: false });
    
    // Fetch shift members for each shift
    const shiftsWithMembers = await Promise.all(shifts.map(async (shift) => {
      const { getShiftMembers } = require('../db/database');
      const members = await getShiftMembers(shift.id);
      return { ...shift, members };
    }));

    res.send(auditLogPage({
      guild: req.guild,
      guildId: req.guild.id,
      infractions: infractions || [],
      promotions: promotions || [],
      shifts: shiftsWithMembers || [],
      csrfToken: req.session.csrfToken,
      filter: { type, userId, dateFrom, dateTo },
    }));
  }));

  // User profile view. Anyone can view their own profile (that is
  // baseline staff self-service, same as checking your own shifts or
  // LOA); viewing someone else's requires the same canManageStaff gate
  // as the /history slash command, since infraction/promotion history
  // is management data there too, not public.
  router.get('/:guildId/user/:userId', requireMember, asyncRoute(async (req, res) => {
    const targetUserId = req.params.userId;
    
    if (!SNOWFLAKE_RE.test(targetUserId)) {
      return res.status(400).send('Invalid user ID.');
    }

    const isSelf = targetUserId === req.session.user.id;
    if (!isSelf && !req.isAdmin) {
      return res.status(403).send('This page requires the Staff Manage role or Manage Roles permission.');
    }

    const userInfo = await getUser(req.guild.id, targetUserId);
    // The bot never stores Discord usernames locally, so look the display
    // name up live via the guild's own member cache (GuildMembers intent
    // is already on for the bot's slash commands). Falls back to a bare
    // user ID only if they have since left the server.
    let username = `User ${targetUserId}`;
    if (isSelf) {
      username = req.session.user.username;
    } else {
      try {
        const targetMember = await req.guild.members.fetch(targetUserId);
        username = targetMember.user.username;
      } catch {
        // Left the server, or never was a member here, keep the fallback.
      }
    }

    res.send(userProfilePage({
      guild: req.guild,
      userInfo,
      username,
      csrfToken: req.session.csrfToken,
      guildId: req.guild.id,
      isAdmin: req.isAdmin,
    }));
  }));

  router.get('/:guildId', requireAdmin, asyncRoute(async (req, res) => {
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
    const [scalarValues, ranks, infractionTypes, ticketCategories, shiftTypes, moderationPresets, customViolations] = await Promise.all([
      Promise.all(scalarKeys.map((key) => getScalar(guild.id, key))),
      getRanks(guild.id),
      getInfractionTypes(guild.id),
      getTicketCategories(guild.id),
      getShiftTypes(guild.id),
      getModerationPresets(guild.id),
      getCustomViolations(guild.id),
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
      ticketCategories,
      shiftTypes,
      moderationPresets,
      customViolations,
      csrfToken: req.session.csrfToken,
      guildId: guild.id,
      flash,
    });
  }

  router.post('/:guildId/roles', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
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

  router.post('/:guildId/channels', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
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

  router.post('/:guildId/add-rank', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
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

  router.post('/:guildId/remove-rank', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
    const removed = await removeRank(req.guild.id, req.body.name || '');
    res.send(await renderSettings(req, removed
      ? { type: 'success', message: 'Rank removed.' }
      : { type: 'error', message: 'That rank was already removed.' }));
  }));

  router.post('/:guildId/add-infraction-type', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
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

  router.post('/:guildId/remove-infraction-type', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
    const removed = await removeInfractionType(req.guild.id, req.body.name || '');
    res.send(await renderSettings(req, removed
      ? { type: 'success', message: 'Infraction type removed.' }
      : { type: 'error', message: 'That infraction type was already removed.' }));
  }));

  router.post('/:guildId/set-erlc-api-key', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey || apiKey.trim().length === 0) {
      return res.send(await renderSettings(req, { type: 'error', message: 'API key cannot be empty.' }));
    }

    try {
      // Test the API key before saving
      const { verifyApiKey, setErlcApiKey } = require('../handlers/erlcHandler');
      const verification = await verifyApiKey(req.guild.id, apiKey.trim());
      
      if (!verification.valid) {
        return res.send(await renderSettings(req, { type: 'error', message: `API key verification failed: ${verification.error}` }));
      }

      // Save the API key
      await setErlcApiKey(req.guild.id, apiKey.trim());
      res.send(await renderSettings(req, { type: 'success', message: 'ERLC API key saved and verified.' }));
    } catch (err) {
      res.send(await renderSettings(req, { type: 'error', message: `Failed to save API key: ${err.message}` }));
    }
  }));

  router.post('/:guildId/add-custom-violation', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
    const { label, codes, description } = req.body;
    if (!label?.trim() || !codes?.trim()) {
      return res.send(await renderSettings(req, { type: 'error', message: 'Violation needs a label and at least one code.' }));
    }
    const shortCodes = codes.split(',').map(c => c.trim().toLowerCase()).filter(c => c);
    if (shortCodes.length === 0) {
      return res.send(await renderSettings(req, { type: 'error', message: 'At least one short code is required.' }));
    }
    await addCustomViolation(req.guild.id, {
      label: label.trim(),
      shortCodes,
      description: description?.trim() || '',
    });
    res.send(await renderSettings(req, { type: 'success', message: `Custom violation "${label.trim()}" added.` }));
  }));

  router.post('/:guildId/add-shift-type', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
    const { label, minDuration, maxDuration } = req.body;
    if (!label?.trim() || !minDuration || !maxDuration) {
      return res.send(await renderSettings(req, { type: 'error', message: 'All fields are required.' }));
    }
    const minVal = parseInt(minDuration, 10);
    const maxVal = parseInt(maxDuration, 10);
    if (isNaN(minVal) || isNaN(maxVal) || minVal < 1 || maxVal < 1 || minVal > maxVal) {
      return res.send(await renderSettings(req, { type: 'error', message: 'Invalid duration values. Min must be less than max.' }));
    }
    
    try {
      const { addShiftType } = require('../db/database');
      await addShiftType(req.guild.id, { label: label.trim(), minDuration: minVal, maxDuration: maxVal });
      res.send(await renderSettings(req, { type: 'success', message: `Shift type "${label.trim()}" added.` }));
    } catch (err) {
      res.send(await renderSettings(req, { type: 'error', message: `Failed to add shift type: ${err.message}` }));
    }
  }));

  router.post('/:guildId/remove-shift-type', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
    const { shiftTypeId } = req.body;
    if (!shiftTypeId) {
      return res.send(await renderSettings(req, { type: 'error', message: 'Shift type ID required.' }));
    }
    
    try {
      const { removeShiftType } = require('../db/database');
      await removeShiftType(req.guild.id, shiftTypeId);
      res.send(await renderSettings(req, { type: 'success', message: 'Shift type removed.' }));
    } catch (err) {
      res.send(await renderSettings(req, { type: 'error', message: `Failed to remove shift type: ${err.message}` }));
    }
  }));

  router.post('/:guildId/post-ticket-panel', requireAdmin, requireCsrf, asyncRoute(async (req, res) => {
    const { channelId } = req.body;
    if (!channelId) {
      return res.send(await renderSettings(req, { type: 'error', message: 'Please select a channel.' }));
    }

    const channel = await req.guild.channels.fetch(channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) {
      return res.send(await renderSettings(req, { type: 'error', message: 'Invalid channel selected.' }));
    }

    try {
      const categories = await getTicketCategories(req.guild.id);
      const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
      const { COLORS, icon, iconEmoji } = require('../config');
      const { buildCard: buildCardUtil, V2 } = require('../utils/components');

      const lines = [
        'Need help with something? Pick the category below that best matches your issue, and you will be asked to describe it in a bit more detail before your ticket is created. A member of staff will be with you as soon as they are able.',
        '',
        ...categories.map(c => `**${c.label}**: ${c.description}`),
        '',
        '-# Please only open one ticket at a time for a given issue, duplicates just split up the conversation and slow things down for everyone.',
      ];

      const card = buildCardUtil({
        accentColor: COLORS.mauve,
        heading: `${icon('ticket')} Support Tickets`,
        lines,
      });

      const select = new StringSelectMenuBuilder()
        .setCustomId('ticket_category_select')
        .setPlaceholder('Select a category to begin');

      for (const cat of categories) {
        const builder = new StringSelectMenuOptionBuilder()
          .setLabel(cat.label)
          .setValue(cat.id)
          .setDescription(cat.description);
        const emoji = iconEmoji(cat.id);
        if (emoji) builder.setEmoji(emoji);
        select.addOptions(builder);
      }

      const selectRow = new ActionRowBuilder().addComponents(select);
      await channel.send({
        components: [card, selectRow],
        ...V2,
      });

      res.send(await renderSettings(req, { type: 'success', message: `Ticket panel posted to ${channel}` }));
    } catch (err) {
      console.error(`[dashboard] Failed to post ticket panel: ${err.message}`);
      res.send(await renderSettings(req, { type: 'error', message: `Failed to post panel: ${err.message}` }));
    }
  }));

  return router;
}

module.exports = { buildDashboardRouter };
