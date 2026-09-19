/**
 * ERLC REST API Routes
 * GET /api/erlc/server-info - Live server status
 * GET /api/erlc/shifts - Shift analytics
 * GET /api/erlc/infractions - Infraction analytics
 * GET /api/erlc/kills - Kill statistics
 * GET /api/erlc/audit-log - Full action trail
 * POST /api/erlc/ban-appeal - Submit ban appeal
 */

const express = require('express');
const { EmbedBuilder } = require('discord.js');
const erlcDb = require('../erlc/database');
const erlcFeatures = require('../erlc/features');
const { ERLCClient } = require('../erlc/client');

const router = express.Router();

/**
 * GET /api/erlc/server-info
 * Returns live server status (players, queue, staff, vehicles)
 */
router.get('/server-info', async (req, res) => {
  try {
    const guildId = req.query.guild_id;
    if (!guildId) return res.status(400).json({ error: 'guild_id required' });

    const guildConfig = await req.app.locals.db.get('SELECT * FROM guilds WHERE guild_id = ?', guildId);
    if (!guildConfig?.erlc_api_key) return res.status(400).json({ error: 'ERLC API not configured' });

    const client = new ERLCClient(guildConfig.erlc_api_key);
    const embed = await erlcFeatures.createServerInfoEmbed(client, guildConfig);

    res.json({ 
      embed: {
        title: embed.data.title,
        color: embed.data.color,
        fields: embed.data.fields,
        footer: embed.data.footer,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/erlc/shifts?days=30
 */
router.get('/shifts', async (req, res) => {
  try {
    const guildId = req.query.guild_id;
    const days = parseInt(req.query.days) || 30;
    if (!guildId) return res.status(400).json({ error: 'guild_id required' });

    const analytics = await erlcFeatures.getShiftAnalytics(req.app.locals.db, guildId, days);
    if (!analytics) return res.json({ data: null, message: 'No shifts recorded' });

    res.json({
      period: `${days} days`,
      totalShifts: analytics.totalShifts,
      totalHours: analytics.totalHours,
      avgDuration: analytics.avgDuration,
      maxDuration: analytics.maxDuration,
      uniqueOfficers: analytics.uniqueOfficers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/erlc/infractions?days=30&server_key=xxx
 */
router.get('/infractions', async (req, res) => {
  try {
    const guildId = req.query.guild_id;
    const serverKey = req.query.server_key;
    const days = parseInt(req.query.days) || 30;
    if (!guildId || !serverKey) return res.status(400).json({ error: 'guild_id and server_key required' });

    const analytics = await erlcFeatures.getInfractionAnalytics(req.app.locals.db, guildId, serverKey, days);
    if (!analytics) return res.json({ data: null, message: 'No infractions recorded' });

    res.json({
      period: `${days} days`,
      totalInfractions: analytics.totalInfractions,
      byType: analytics.byType,
      topStaff: analytics.topStaff,
      repeatOffenders: analytics.repeatOffenders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/erlc/kills?days=30
 */
router.get('/kills', async (req, res) => {
  try {
    const guildId = req.query.guild_id;
    const days = parseInt(req.query.days) || 30;
    if (!guildId) return res.status(400).json({ error: 'guild_id required' });

    const analytics = await erlcFeatures.getKillAnalytics(req.app.locals.db, guildId, days);
    if (!analytics) return res.json({ data: null, message: 'No kills recorded' });

    res.json({
      period: `${days} days`,
      totalKills: analytics.totalKills,
      topKillers: analytics.topKillers,
      byWeapon: analytics.byWeapon,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/erlc/audit-log?action=warn_issued&limit=50
 */
router.get('/audit-log', async (req, res) => {
  try {
    const guildId = req.query.guild_id;
    const action = req.query.action;
    const limit = parseInt(req.query.limit) || 50;
    if (!guildId) return res.status(400).json({ error: 'guild_id required' });

    const logs = await erlcDb.getAuditLog(req.app.locals.db, guildId, limit, action);
    res.json({
      count: logs.length,
      logs: logs.map(l => ({
        id: l.id,
        action: l.action,
        actor: l.actor_name,
        target: l.target_name,
        details: JSON.parse(l.details || '{}'),
        timestamp: new Date(l.created_at).toISOString(),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
