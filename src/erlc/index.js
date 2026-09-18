/**
 * ERLC Integration Module
 * Exports all ERLC-related functionality for easy import
 */

const { ERLCClient } = require('./client');
const erlcDb = require('./database');
const erlcCommands = require('./commands');
const { handleERLCWebhook } = require('./webhooks');

module.exports = {
  ERLCClient,
  erlcDb,
  erlcCommands,
  handleERLCWebhook,
};
