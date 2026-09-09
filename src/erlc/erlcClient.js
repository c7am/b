const https = require('https');

/**
 * ERLC (Emergency Response: Liberty County) Private Server API Client
 * Integrates with Roblox ERLC servers via their PRC (Private Roleplay Community) API
 */

class ErlcClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('ERLC API key is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.esx-rp.com/v1'; // Update if endpoint changes
    this.timeout = 5000;
  }

  /**
   * Make HTTPS request to ERLC API
   */
  async _request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: this.timeout,
      };

      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (res.statusCode >= 400) {
              reject(new Error(`ERLC API error: ${json.message || `HTTP ${res.statusCode}`}`));
            } else {
              resolve(json);
            }
          } catch (err) {
            reject(new Error(`Failed to parse ERLC API response: ${err.message}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.abort();
        reject(new Error('ERLC API request timeout'));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  /**
   * Get current players on the server
   */
  async getPlayers() {
    try {
      const data = await this._request('GET', '/server/players');
      return data.players || [];
    } catch (err) {
      console.error(`[erlc] Failed to fetch players: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get server status and metadata
   */
  async getServerStatus() {
    try {
      const data = await this._request('GET', '/server/status');
      return data;
    } catch (err) {
      console.error(`[erlc] Failed to fetch server status: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get player details by username or player ID
   */
  async getPlayerDetails(username) {
    try {
      const data = await this._request('GET', `/players/${encodeURIComponent(username)}`);
      return data;
    } catch (err) {
      console.error(`[erlc] Failed to fetch player details for ${username}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get team assignments (staff roles, ranks, etc.)
   */
  async getTeams() {
    try {
      const data = await this._request('GET', '/server/teams');
      return data.teams || [];
    } catch (err) {
      console.error(`[erlc] Failed to fetch teams: ${err.message}`);
      throw err;
    }
  }

  /**
   * Assign player to a team
   */
  async setPlayerTeam(playerId, teamId) {
    try {
      const data = await this._request('POST', `/players/${playerId}/team`, { teamId });
      return data;
    } catch (err) {
      console.error(`[erlc] Failed to set player team: ${err.message}`);
      throw err;
    }
  }

  /**
   * Kick player from server
   */
  async kickPlayer(playerId, reason = '') {
    try {
      const data = await this._request('POST', `/players/${playerId}/kick`, { reason });
      return data;
    } catch (err) {
      console.error(`[erlc] Failed to kick player: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get server logs (joins, leaves, kills, etc.)
   */
  async getLogs(options = {}) {
    try {
      const params = new URLSearchParams(options);
      const data = await this._request('GET', `/server/logs?${params.toString()}`);
      return data.logs || [];
    } catch (err) {
      console.error(`[erlc] Failed to fetch logs: ${err.message}`);
      throw err;
    }
  }
}

module.exports = { ErlcClient };
