/**
 * ERLC API Client
 * Simple wrapper around the ER:LC v2 API
 * Docs: https://apidocs.erlc.gg
 */

const https = require('https');

class ERLCClient {
  constructor(serverKey, globalKey = null) {
    this.serverKey = serverKey;
    this.globalKey = globalKey;
    this.baseUrl = 'api.erlc.gg';
    this.rateLimits = { remaining: 10000, resetTime: Date.now() };
  }

  async request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: `/v2${path}`,
        method,
        headers: {
          'server-key': this.serverKey,
          'content-type': 'application/json',
        },
      };

      if (this.globalKey) options.headers['global-key'] = this.globalKey;

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data || '{}'));
            } catch (e) {
              resolve(data);
            }
          } else {
            reject(new Error(`ERLC API Error ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  async getServer() {
    return this.request('/server');
  }

  async getPlayers() {
    return this.request('/players');
  }

  async getStaff() {
    return this.request('/staff');
  }

  async getQueue() {
    return this.request('/queue');
  }

  async getVehicles() {
    return this.request('/vehicles');
  }

  async getBans() {
    return this.request('/bans');
  }

  async getKillLogs() {
    return this.request('/logs/killlogs');
  }

  async getCommandLogs() {
    return this.request('/logs/commandlogs');
  }

  async getModcalls() {
    return this.request('/logs/modcalls');
  }

  async runCommand(command) {
    return this.request('/command', 'POST', { command });
  }

  async lockTeam(team) {
    return this.request(`/team/${team}/lock`, 'POST');
  }

  async unlockTeam(team) {
    return this.request(`/team/${team}/unlock`, 'POST');
  }

  // Convenience: get full server snapshot
  async getBundle() {
    const [server, players, staff, queue, vehicles, bans, killLogs, commandLogs] = await Promise.all([
      this.getServer(),
      this.getPlayers(),
      this.getStaff(),
      this.getQueue(),
      this.getVehicles(),
      this.getBans(),
      this.getKillLogs(),
      this.getCommandLogs(),
    ]);

    return {
      server,
      players: Array.isArray(players) ? players : [],
      staff: Array.isArray(staff) ? staff : [],
      queue: Array.isArray(queue) ? queue : [],
      vehicles: Array.isArray(vehicles) ? vehicles : [],
      bans: Array.isArray(bans) ? bans : [],
      killLogs: Array.isArray(killLogs) ? killLogs : [],
      commandLogs: Array.isArray(commandLogs) ? commandLogs : [],
    };
  }
}

module.exports = { ERLCClient };
