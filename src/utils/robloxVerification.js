/**
 * Roblox Account Verification System
 * Staff must place a 12-word random phrase in their Roblox bio to verify ownership
 */

// Common words that won't get censored (curated for Roblox safety)
const VERIFICATION_WORDS = [
  'verify', 'axiom', 'staff', 'link', 'discord', 'account', 'auth',
  'check', 'test', 'proof', 'valid', 'claim', 'confirm', 'approve',
  'match', 'sync', 'badge', 'role', 'member', 'team', 'squad',
  'group', 'clan', 'guild', 'org', 'pass', 'code', 'token',
  'secure', 'safe', 'trust', 'real', 'true', 'real', 'legit',
  'official', 'auth', 'login', 'access', 'grant', 'enable', 'active',
  'online', 'ready', 'set', 'go', 'start', 'begin', 'init',
  'load', 'run', 'exec', 'call', 'spawn', 'create', 'build',
  'make', 'form', 'shape', 'craft', 'forge', 'forge', 'mint',
  'mark', 'sign', 'stamp', 'seal', 'stamp', 'brand', 'tag',
  'label', 'name', 'title', 'call', 'id', 'ident', 'key',
];

/**
 * Generate a random 12-word verification phrase
 */
function generateVerificationPhrase() {
  const words = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * VERIFICATION_WORDS.length);
    words.push(VERIFICATION_WORDS[randomIndex]);
  }
  return words.join(' ');
}

/**
 * Check if Roblox bio contains verification phrase
 * Normalize both strings to handle spacing/case variations
 */
function verifyBioPhrase(bio, phrase) {
  if (!bio || !phrase) return false;
  
  const normalizedBio = bio.toLowerCase().replace(/[\s\-]/g, ' ').trim();
  const normalizedPhrase = phrase.toLowerCase().replace(/[\s\-]/g, ' ').trim();
  
  // Check if phrase is in bio (allows for extra text)
  return normalizedBio.includes(normalizedPhrase);
}

/**
 * Store verification code temporarily (in-memory or DB)
 * Returns code that was stored
 */
async function storeVerificationCode(discordUserId, guildId, phrase) {
  // In-memory storage with 1-hour expiry
  if (!global.verificationCodes) {
    global.verificationCodes = {};
  }
  
  const code = `${discordUserId}:${guildId}`;
  global.verificationCodes[code] = {
    phrase,
    timestamp: Date.now(),
    expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
  };
  
  return phrase;
}

/**
 * Get stored verification code
 */
function getVerificationCode(discordUserId, guildId) {
  if (!global.verificationCodes) return null;
  
  const code = `${discordUserId}:${guildId}`;
  const stored = global.verificationCodes[code];
  
  if (!stored) return null;
  if (stored.expiresAt < Date.now()) {
    delete global.verificationCodes[code];
    return null;
  }
  
  return stored.phrase;
}

/**
 * Clear verification code after successful verification
 */
function clearVerificationCode(discordUserId, guildId) {
  if (!global.verificationCodes) return;
  
  const code = `${discordUserId}:${guildId}`;
  delete global.verificationCodes[code];
}

module.exports = {
  generateVerificationPhrase,
  verifyBioPhrase,
  storeVerificationCode,
  getVerificationCode,
  clearVerificationCode,
};
