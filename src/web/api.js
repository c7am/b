const express = require('express');
const { query } = require('../db/db');

function buildApiRouter(client, config) {
  const router = express.Router();

  // Middleware: require auth
  const requireAuth = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };

  // =========================================================================
  // AUTH ENDPOINTS
  // =========================================================================
  router.get('/auth/me', requireAuth, (req, res) => {
    res.json({
      id: req.session.user.id,
      username: req.session.user.username,
      adminGuildIds: req.session.adminGuildIds || [],
      memberGuildIds: req.session.memberGuildIds || [],
    });
  });

  // =========================================================================
  // SHIFTS ENDPOINTS (personal timesheet tracking)
  // =========================================================================
  router.get('/shifts', requireAuth, async (req, res) => {
    try {
      const result = await query(
        `SELECT * FROM personal_shifts WHERE user_id = $1 ORDER BY started_at DESC LIMIT 50`,
        [req.session.user.id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('[api/shifts] get failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/shifts/start', requireAuth, async (req, res) => {
    try {
      const result = await query(
        `INSERT INTO personal_shifts (user_id, started_at, status) 
         VALUES ($1, NOW(), 'active') 
         RETURNING *`,
        [req.session.user.id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[api/shifts/start] failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/shifts/:id/pause', requireAuth, async (req, res) => {
    try {
      const result = await query(
        `UPDATE personal_shifts SET status = 'paused' 
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [req.params.id, req.session.user.id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Shift not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[api/shifts/:id/pause] failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/shifts/:id/end', requireAuth, async (req, res) => {
    try {
      const result = await query(
        `UPDATE personal_shifts SET status = 'completed', ended_at = NOW() 
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [req.params.id, req.session.user.id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Shift not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[api/shifts/:id/end] failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // APPEALS ENDPOINTS
  // =========================================================================
  router.get('/appeals', requireAuth, async (req, res) => {
    try {
      const result = await query(
        `SELECT * FROM appeals WHERE created_by = $1 ORDER BY created_at DESC LIMIT 50`,
        [req.session.user.id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('[api/appeals] get failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/appeals', requireAuth, async (req, res) => {
    const { robloxUsername, reason, description } = req.body;
    if (!robloxUsername || !reason || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const result = await query(
        `INSERT INTO appeals (created_by, roblox_username, reason, description, status) 
         VALUES ($1, $2, $3, $4, 'pending') 
         RETURNING *`,
        [req.session.user.id, robloxUsername, reason, description]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[api/appeals] create failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/appeals/:id', requireAuth, async (req, res) => {
    try {
      const result = await query(
        `SELECT * FROM appeals WHERE id = $1 AND created_by = $2`,
        [req.params.id, req.session.user.id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Appeal not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[api/appeals/:id] get failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // CONFIG/SETTINGS ENDPOINTS
  // =========================================================================
  router.get('/config/:guildId', requireAuth, async (req, res) => {
    try {
      const result = await query(
        `SELECT * FROM guild_config WHERE guild_id = $1`,
        [req.params.guildId]
      );
      if (result.rowCount === 0) {
        return res.json({ guild_id: req.params.guildId, appeals_enabled: true });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[api/config/:guildId] get failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/config/:guildId', requireAuth, async (req, res) => {
    const { modRole, staffRole, logsChannel, appeals, autoMod, dmNotifications } = req.body;

    try {
      // Upsert: insert if not exists, update if exists
      const result = await query(
        `INSERT INTO guild_config (guild_id, mod_role, staff_role, logs_channel, appeals_enabled, auto_mod, dm_notifications) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (guild_id) DO UPDATE SET 
           mod_role = $2, staff_role = $3, logs_channel = $4, 
           appeals_enabled = $5, auto_mod = $6, dm_notifications = $7
         RETURNING *`,
        [req.params.guildId, modRole, staffRole, logsChannel, appeals, autoMod, dmNotifications]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[api/config/:guildId] update failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // MODERATIONS ENDPOINTS
  // =========================================================================
  router.get('/moderations', requireAuth, async (req, res) => {
    try {
      const result = await query(
        `SELECT * FROM moderations ORDER BY created_at DESC LIMIT 100`
      );
      res.json(result.rows);
    } catch (err) {
      console.error('[api/moderations] get failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/moderations', requireAuth, async (req, res) => {
    const { target, type, reason } = req.body;
    if (!target || !type || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const result = await query(
        `INSERT INTO moderations (target_user, violation_type, reason, moderator_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [target, type, reason, req.session.user.id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[api/moderations] create failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = buildApiRouter;
