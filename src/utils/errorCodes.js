/**
 * Axiom Error Codes
 * Format: [MODULE]_[CATEGORY]_[SPECIFIC]
 * All errors propagate to Discord channel logs (DISCORD_LOG_CHANNEL_ID)
 */

const ErrorCodes = {
  // AUTH / DISCORD
  AUTH_MISSING_TOKEN: 'AUTH_MISSING_TOKEN',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_PERMISSION_DENIED: 'AUTH_PERMISSION_DENIED',

  // ERLC / In-Game
  ERLC_CLIENT_INIT_FAILED: 'ERLC_CLIENT_INIT_FAILED',
  ERLC_CONNECTION_TIMEOUT: 'ERLC_CONNECTION_TIMEOUT',
  ERLC_INVALID_RESPONSE: 'ERLC_INVALID_RESPONSE',
  ERLC_PLAYER_NOT_FOUND: 'ERLC_PLAYER_NOT_FOUND',
  ERLC_SERVER_OFFLINE: 'ERLC_SERVER_OFFLINE',
  ERLC_RATE_LIMIT: 'ERLC_RATE_LIMIT',

  // DATABASE
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_SCHEMA_MISSING: 'DB_SCHEMA_MISSING',
  DB_MIGRATION_FAILED: 'DB_MIGRATION_FAILED',
  DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',

  // COMMAND EXECUTION
  CMD_NOT_FOUND: 'CMD_NOT_FOUND',
  CMD_EXECUTION_FAILED: 'CMD_EXECUTION_FAILED',
  CMD_INVALID_ARGS: 'CMD_INVALID_ARGS',
  CMD_TIMEOUT: 'CMD_TIMEOUT',
  CMD_MODAL_FAILED: 'CMD_MODAL_FAILED',

  // ROBLOX LINKING
  LINK_ALREADY_EXISTS: 'LINK_ALREADY_EXISTS',
  LINK_VERIFICATION_FAILED: 'LINK_VERIFICATION_FAILED',
  LINK_INVALID_ROBLOX_ID: 'LINK_INVALID_ROBLOX_ID',
  LINK_EXPIRED: 'LINK_EXPIRED',

  // INFRACTION SYSTEM
  INFRACT_INVALID_REASON: 'INFRACT_INVALID_REASON',
  INFRACT_PLAYER_IMMUNE: 'INFRACT_PLAYER_IMMUNE',
  INFRACT_RECORD_FAILED: 'INFRACT_RECORD_FAILED',
  INFRACT_HISTORY_EMPTY: 'INFRACT_HISTORY_EMPTY',

  // SHIFT TRACKING
  SHIFT_ALREADY_ACTIVE: 'SHIFT_ALREADY_ACTIVE',
  SHIFT_NOT_STARTED: 'SHIFT_NOT_STARTED',
  SHIFT_RECORD_FAILED: 'SHIFT_RECORD_FAILED',
  SHIFT_INVALID_DEPARTMENT: 'SHIFT_INVALID_DEPARTMENT',

  // WEB API
  API_RATE_LIMIT_EXCEEDED: 'API_RATE_LIMIT_EXCEEDED',
  API_INVALID_GUILD_ID: 'API_INVALID_GUILD_ID',
  API_MISSING_AUTH_HEADER: 'API_MISSING_AUTH_HEADER',
  API_ENDPOINT_NOT_FOUND: 'API_ENDPOINT_NOT_FOUND',
  API_PAYLOAD_INVALID: 'API_PAYLOAD_INVALID',

  // WEB UI
  UI_RENDER_FAILED: 'UI_RENDER_FAILED',
  UI_MODAL_RENDER_FAILED: 'UI_MODAL_RENDER_FAILED',
  UI_ASSET_MISSING: 'UI_ASSET_MISSING',

  // MODERATION
  MOD_TIMEOUT_FAILED: 'MOD_TIMEOUT_FAILED',
  MOD_KICK_FAILED: 'MOD_KICK_FAILED',
  MOD_BAN_FAILED: 'MOD_BAN_FAILED',
  MOD_INVALID_DURATION: 'MOD_INVALID_DURATION',

  // TEAM SYNC
  SYNC_ROLE_NOT_FOUND: 'SYNC_ROLE_NOT_FOUND',
  SYNC_MEMBER_NOT_FOUND: 'SYNC_MEMBER_NOT_FOUND',
  SYNC_ROLE_ASSIGN_FAILED: 'SYNC_ROLE_ASSIGN_FAILED',
  SYNC_ROBLOX_API_FAILED: 'SYNC_ROBLOX_API_FAILED',

  // AUDIT LOG
  AUDIT_LOG_WRITE_FAILED: 'AUDIT_LOG_WRITE_FAILED',
  AUDIT_LOG_READ_FAILED: 'AUDIT_LOG_READ_FAILED',

  // GENERIC
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_INPUT: 'INVALID_INPUT',
};

const ErrorMessages = {
  AUTH_MISSING_TOKEN: 'Missing Discord bot token. Check DISCORD_TOKEN env var.',
  AUTH_INVALID_TOKEN: 'Invalid Discord bot token format.',
  AUTH_UNAUTHORIZED: 'User is not authorized to perform this action.',
  AUTH_PERMISSION_DENIED: 'Missing required permission. Ask a staff member.',

  ERLC_CLIENT_INIT_FAILED: 'Failed to initialize ERLC client. Check ERLC_API_KEY.',
  ERLC_CONNECTION_TIMEOUT: 'ERLC server took too long to respond. Try again.',
  ERLC_INVALID_RESPONSE: 'ERLC returned unexpected data format.',
  ERLC_PLAYER_NOT_FOUND: 'Player not found on ERLC server.',
  ERLC_SERVER_OFFLINE: 'ERLC server is currently offline.',
  ERLC_RATE_LIMIT: 'Too many requests to ERLC. Wait 60 seconds.',

  DB_CONNECTION_FAILED: 'Database connection failed. Retrying...',
  DB_QUERY_FAILED: 'Database query failed. Try again.',
  DB_SCHEMA_MISSING: 'Database schema not initialized.',
  DB_MIGRATION_FAILED: 'Database migration failed.',
  DB_CONSTRAINT_VIOLATION: 'Data constraint violation (duplicate, foreign key, etc).',

  CMD_NOT_FOUND: 'Command not found.',
  CMD_EXECUTION_FAILED: 'Command execution failed unexpectedly.',
  CMD_INVALID_ARGS: 'Invalid command arguments.',
  CMD_TIMEOUT: 'Command timed out. Try again.',
  CMD_MODAL_FAILED: 'Modal submission failed.',

  LINK_ALREADY_EXISTS: 'Your Discord account is already linked.',
  LINK_VERIFICATION_FAILED: 'Roblox verification failed. Try again.',
  LINK_INVALID_ROBLOX_ID: 'Invalid Roblox user ID.',
  LINK_EXPIRED: 'Verification link expired. Start over.',

  INFRACT_INVALID_REASON: 'Infraction reason must be 10-500 chars.',
  INFRACT_PLAYER_IMMUNE: 'Cannot infract this player (staff/immune).',
  INFRACT_RECORD_FAILED: 'Failed to record infraction.',
  INFRACT_HISTORY_EMPTY: 'No infractions on record.',

  SHIFT_ALREADY_ACTIVE: 'You already have an active shift.',
  SHIFT_NOT_STARTED: 'No active shift to end.',
  SHIFT_RECORD_FAILED: 'Failed to record shift.',
  SHIFT_INVALID_DEPARTMENT: 'Invalid department. Use: police, fire, ems, tow.',

  API_RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Retry after 60 seconds.',
  API_INVALID_GUILD_ID: 'Invalid or missing guild_id parameter.',
  API_MISSING_AUTH_HEADER: 'Missing Authorization header.',
  API_ENDPOINT_NOT_FOUND: 'API endpoint not found.',
  API_PAYLOAD_INVALID: 'Request payload is invalid JSON.',

  UI_RENDER_FAILED: 'Failed to render page. Reload or report bug.',
  UI_MODAL_RENDER_FAILED: 'Failed to render modal form.',
  UI_ASSET_MISSING: 'UI asset missing (icon, image, etc).',

  MOD_TIMEOUT_FAILED: 'Failed to timeout player.',
  MOD_KICK_FAILED: 'Failed to kick player.',
  MOD_BAN_FAILED: 'Failed to ban player.',
  MOD_INVALID_DURATION: 'Invalid timeout duration (1-40320 minutes).',

  SYNC_ROLE_NOT_FOUND: 'Role not configured or not found.',
  SYNC_MEMBER_NOT_FOUND: 'Member not found in guild.',
  SYNC_ROLE_ASSIGN_FAILED: 'Failed to assign role.',
  SYNC_ROBLOX_API_FAILED: 'Roblox API call failed.',

  AUDIT_LOG_WRITE_FAILED: 'Failed to write to audit log.',
  AUDIT_LOG_READ_FAILED: 'Failed to read audit log.',

  UNKNOWN_ERROR: 'An unknown error occurred. Report to developers.',
  NETWORK_ERROR: 'Network error. Check internet connection.',
  TIMEOUT: 'Operation timed out.',
  INVALID_INPUT: 'Invalid input provided.',
};

/**
 * Create an error with code and context
 * @param {string} code - Error code from ErrorCodes
 * @param {string} [details] - Additional context (user input, etc)
 * @param {Error} [originalError] - Original JS error object for logging
 * @returns {Error} Error object with code property
 */
function createError(code, details, originalError) {
  const error = new Error(ErrorMessages[code] || ErrorMessages.UNKNOWN_ERROR);
  error.code = code;
  error.details = details;
  error.originalError = originalError;
  error.timestamp = new Date().toISOString();
  return error;
}

/**
 * Get icon emoji for error category
 */
function getErrorIcon(code) {
  if (code.startsWith('AUTH_')) return '🔐';
  if (code.startsWith('ERLC_')) return '🎮';
  if (code.startsWith('DB_')) return '💾';
  if (code.startsWith('CMD_')) return '⚡';
  if (code.startsWith('LINK_')) return '🔗';
  if (code.startsWith('INFRACT_')) return '⚠️';
  if (code.startsWith('SHIFT_')) return '⏱️';
  if (code.startsWith('API_')) return '🌐';
  if (code.startsWith('UI_')) return '🎨';
  if (code.startsWith('MOD_')) return '🛡️';
  if (code.startsWith('SYNC_')) return '🔄';
  if (code.startsWith('AUDIT_')) return '📋';
  return '❌';
}

/**
 * Get color for error severity
 */
function getErrorColor(code) {
  if (code.includes('FAILED') || code.includes('TIMEOUT')) return 0xFF6B6B; // Red
  if (code.includes('INVALID') || code.includes('MISSING')) return 0xFFD93D; // Yellow
  if (code.includes('DENIED') || code.includes('UNAUTHORIZED')) return 0xEE5A6F; // Dark Red
  if (code.includes('RATE_LIMIT')) return 0xFF9800; // Orange
  return 0xFF6B6B; // Default Red
}

/**
 * Format stack trace for Discord embed
 */
function formatStackTrace(stack) {
  if (!stack) return null;
  const lines = stack.split('\n').slice(0, 5);
  return `\`\`\`js\n${lines.join('\n')}\`\`\``;
}

/**
 * Log error to Discord audit channel + console with enhanced formatting
 * @param {Error} error - Error object with code property
 * @param {Object} context - { guild_id?, user_id?, command?, endpoint? }
 * @param {Object} client - Discord client for sending message
 * @param {Object} guildConfig - Guild config object (optional, will try to fetch if missing)
 */
async function logErrorToDiscord(error, context = {}, client, guildConfig) {
  const { guild_id, user_id, command, endpoint } = context;

  // Fallback: if no guildConfig provided but we have a guild_id, try to fetch it
  if (!guildConfig && guild_id && client) {
    try {
      const { getScalar } = require('./guildConfig');
      const logChannelId = await getScalar(guild_id, 'logChannelId');
      if (logChannelId) {
        guildConfig = { logChannelId };
      }
    } catch (err) {
      // Silently fail, will log to console instead
    }
  }

  const logChannelId = guildConfig?.logChannelId || process.env.DISCORD_LOG_CHANNEL_ID;

  if (!logChannelId || !client) {
    console.error(`[ERROR ${error.code}]`, {
      message: error.message,
      details: error.details,
      context,
      timestamp: error.timestamp,
    });
    return;
  }

  try {
    const channel = await client.channels.fetch(logChannelId);
    if (!channel) return;

    const icon = getErrorIcon(error.code);
    const color = getErrorColor(error.code);
    const [module, category] = error.code.split('_').slice(0, 2);

    // Build description with markdown
    let description = `\`${error.code}\`\n\n`;
    description += `**${error.message}**`;
    if (error.details) {
      description += `\n\n> ${error.details}`;
    }

    const embed = {
      color,
      title: `${icon} ${module} › ${category}`,
      description,
      fields: [],
      timestamp: error.timestamp,
      footer: { text: 'Axiom Error Monitor' },
    };

    // Context fields
    const contextFields = [];
    if (command) contextFields.push(`**Cmd:** \`${command}\``);
    if (user_id) contextFields.push(`**User:** \`${user_id}\``);
    if (guild_id) contextFields.push(`**Guild:** \`${guild_id}\``);
    if (endpoint) contextFields.push(`**API:** \`${endpoint}\``);

    if (contextFields.length > 0) {
      embed.fields.push({
        name: '📍 Context',
        value: contextFields.join(' • '),
        inline: false,
      });
    }

    // Stack trace if available
    if (error.originalError?.stack) {
      const stackStr = formatStackTrace(error.originalError.stack);
      if (stackStr) {
        embed.fields.push({
          name: '⚙️ Stack Trace',
          value: stackStr,
          inline: false,
        });
      }
    }

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('[ERROR LOG FAILED]', err);
  }
}

module.exports = {
  ErrorCodes,
  ErrorMessages,
  createError,
  logErrorToDiscord,
};
