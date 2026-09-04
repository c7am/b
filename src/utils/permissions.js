const { PermissionFlagsBits } = require('discord.js');
const { getScalar } = require('./guildConfig');

// interaction.member is *usually* a full GuildMember (with .roles.cache and
// .guild), but discord.js's own types allow it to come through as the raw
// APIInteractionGuildMember payload instead (plain .roles: string[], no
// .guild at all) if the guild wasn't resolvable when the interaction was
// parsed. Reading member.guild.id crashed on that shape. Fix: never touch
// member.guild, take guildId from interaction.guildId instead, and read
// roles/permissions in a way that works for either shape.

function memberRoleIds(member) {
  if (!member) return new Set();
  if (member.roles?.cache) return new Set(member.roles.cache.keys()); // real GuildMember
  if (Array.isArray(member.roles)) return new Set(member.roles); // raw partial
  return new Set();
}

function memberHasPermission(member, flag) {
  if (!member?.permissions) return false;
  if (typeof member.permissions.has === 'function') return member.permissions.has(flag); // real GuildMember
  try {
    return (BigInt(member.permissions) & BigInt(flag)) === BigInt(flag); // raw partial: permission string
  } catch {
    return false;
  }
}

// True if the member can run /promote, /infract, /history, /session-vote.
// Passes if they hold the configured staff-manage role, OR have the
// Discord-native Manage Roles permission (so it still works before /config
// has been run).
async function canManageStaff(member, guildId) {
  if (!member || !guildId) return false;
  const roleId = await getScalar(guildId, 'staffManageRoleId');
  if (roleId && memberRoleIds(member).has(roleId)) return true;
  return memberHasPermission(member, PermissionFlagsBits.ManageRoles);
}

// True if the member should be able to see/manage ticket channels.
async function isTicketStaff(member, guildId) {
  if (!member || !guildId) return false;
  const roleId = await getScalar(guildId, 'ticketStaffRoleId');
  if (roleId && memberRoleIds(member).has(roleId)) return true;
  return memberHasPermission(member, PermissionFlagsBits.ManageChannels);
}

module.exports = { canManageStaff, isTicketStaff };
