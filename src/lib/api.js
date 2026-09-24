const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  // Auth endpoints
  auth: {
    getMe: async (token) => {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    signOut: async (token) => {
      const res = await fetch(`${API_URL}/auth/signout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to sign out');
      return res.json();
    },
  },

  // Shift endpoints
  shifts: {
    getAll: async (token) => {
      const res = await fetch(`${API_URL}/api/shifts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch shifts');
      return res.json();
    },
    start: async (token) => {
      const res = await fetch(`${API_URL}/api/shifts/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to start shift');
      return res.json();
    },
    pause: async (token, shiftId) => {
      const res = await fetch(`${API_URL}/api/shifts/${shiftId}/pause`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to pause shift');
      return res.json();
    },
    end: async (token, shiftId) => {
      const res = await fetch(`${API_URL}/api/shifts/${shiftId}/end`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to end shift');
      return res.json();
    },
  },

  // Ban appeals endpoints
  appeals: {
    getAll: async (token) => {
      const res = await fetch(`${API_URL}/api/appeals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch appeals');
      return res.json();
    },
    create: async (token, appealData) => {
      const res = await fetch(`${API_URL}/api/appeals`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(appealData),
      });
      if (!res.ok) throw new Error('Failed to create appeal');
      return res.json();
    },
    getById: async (token, appealId) => {
      const res = await fetch(`${API_URL}/api/appeals/${appealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch appeal');
      return res.json();
    },
  },

  // Settings endpoints
  settings: {
    getServerConfig: async (token, serverId) => {
      const res = await fetch(`${API_URL}/api/config/${serverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch config');
      return res.json();
    },
    updateServerConfig: async (token, serverId, config) => {
      const res = await fetch(`${API_URL}/api/config/${serverId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to update config');
      return res.json();
    },
  },

  // Moderation endpoints
  moderation: {
    getModerations: async (token) => {
      const res = await fetch(`${API_URL}/api/moderations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch moderations');
      return res.json();
    },
    createModeration: async (token, moderationData) => {
      const res = await fetch(`${API_URL}/api/moderations`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(moderationData),
      });
      if (!res.ok) throw new Error('Failed to create moderation');
      return res.json();
    },
  },
};
