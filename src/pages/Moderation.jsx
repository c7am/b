import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
import '@m3e/react/card';
import '@m3e/react/button';
import '@m3e/react/dialog';
import '@m3e/react/form-field';
import '@m3e/react/select';
import '@m3e/react/search';
import '@m3e/react/menu';

const VIOLATION_TYPES = [
  { id: 'rdm', label: 'RDM', description: 'Random Death Match' },
  { id: 'vdm', label: 'VDM', description: 'Vehicle Death Match' },
  { id: 'failrp', label: 'Fail RP', description: 'Failure to Roleplay' },
  { id: 'powergaming', label: 'Powergaming', description: 'Powergaming' },
  { id: 'metagaming', label: 'Metagaming', description: 'Metagaming' },
  { id: 'spam', label: 'Spam', description: 'Chat/Radio Spam' },
  { id: 'disrespect', label: 'Disrespect', description: 'Staff Disrespect' },
  { id: 'exploit', label: 'Exploit', description: 'Exploit Usage' },
  { id: 'glitch', label: 'Glitch Abuse', description: 'Glitch Abuse' },
  { id: 'novol', label: 'No Value of Life', description: 'No Value of Life' },
];

export const ModerationPage = () => {
  const { user, accessToken } = useAuthStore();
  const [moderations, setModerations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickModerate, setShowQuickModerate] = useState(false);
  const [moderateTarget, setModerateTarget] = useState('');
  const [violationType, setViolationType] = useState('');
  const [violationReason, setViolationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderateError, setModerateError] = useState(null);

  // Mock fetch moderations on load
  useEffect(() => {
    // In production: const data = await api.moderation.getModerations(accessToken);
    setModerations([
      {
        id: 1,
        target: 'Player123',
        type: 'RDM',
        reason: 'Killed without reason',
        moderator: 'Mod#1234',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: 2,
        target: 'BadPlayer99',
        type: 'Spam',
        reason: 'Chat spam',
        moderator: user.username,
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        id: 3,
        target: 'RogueMember',
        type: 'Disrespect',
        reason: 'Staff disrespect',
        moderator: 'Admin#5678',
        timestamp: new Date(Date.now() - 86400000),
      },
    ]);
    setIsLoading(false);
  }, [accessToken, user.username]);

  const handleQuickModerate = async () => {
    if (!moderateTarget.trim() || !violationType) {
      setModerateError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setModerateError(null);

    try {
      const modAction = {
        target: moderateTarget,
        type: violationType,
        reason: violationReason,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/moderations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modAction),
      });

      if (!res.ok) throw new Error('Failed to create moderation');
      const result = await res.json();

      // Add to list
      setModerations((prev) => [
        {
          ...result,
          timestamp: new Date(result.created_at),
        },
        ...prev,
      ]);

      // Reset form
      setModerateTarget('');
      setViolationType('');
      setViolationReason('');
      setShowQuickModerate(false);
      setIsSubmitting(false);
    } catch (err) {
      setModerateError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <Layout currentPage="moderation">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Quick Moderate Button */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <m3e-button
            variant="filled"
            onClick={() => setShowQuickModerate(true)}
          >Quick Moderate</m3e-button>
        </div>

        {/* Moderation History - M3E List - https://matraic.github.io/m3e/#/components/list.html */}
        <m3e-card variant="elevated">
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '500' }}>
              Moderation History
            </h2>

            {isLoading ? (
              <div style={{ fontSize: '14px', opacity: 0.6, padding: '16px', textAlign: 'center' }}>
                Loading moderations...
              </div>
            ) : moderations.length === 0 ? (
              <div style={{ fontSize: '14px', opacity: 0.6, padding: '16px', textAlign: 'center' }}>
                No moderations yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {moderations.map((mod) => (
                  <div
                    key={mod.id}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--md-sys-color-surface-container)',
                      borderRadius: '8px',
                      borderLeft: '4px solid var(--md-sys-color-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {mod.target}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                        <strong>{mod.type}</strong> - {mod.reason}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
                        By {mod.moderator} • {mod.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </m3e-card>

        {/* Quick Moderate Dialog - https://matraic.github.io/m3e/#/components/dialog.html */}
        {showQuickModerate && (
          <m3e-dialog open>
            <div slot="headline" style={{ fontSize: '16px', fontWeight: '500' }}>
              Quick Moderation Action
            </div>
            <div
              slot="content"
              style={{
                fontSize: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Target Player */}
              <div>
                <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>
                  Target Player
                </label>
                <input
                  type="text"
                  placeholder="Enter player username"
                  value={moderateTarget}
                  onChange={(e) => setModerateTarget(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--md-sys-color-outline)',
                    fontSize: '14px',
                    backgroundColor: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Violation Type - https://matraic.github.io/m3e/#/components/select.html */}
              <div>
                <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>
                  Violation Type
                </label>
                <select
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--md-sys-color-outline)',
                    fontSize: '14px',
                    backgroundColor: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select violation type...</option>
                  {VIOLATION_TYPES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} - {v.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason/Notes */}
              <div>
                <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>
                  Reason/Notes
                </label>
                <textarea
                  placeholder="Enter reason for moderation"
                  value={violationReason}
                  onChange={(e) => setViolationReason(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--md-sys-color-outline)',
                    fontSize: '13px',
                    backgroundColor: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontFamily: 'inherit',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {moderateError && (
                <div
                  style={{
                    color: '#f24822',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(242, 72, 34, 0.1)',
                    fontSize: '12px',
                  }}
                >
                  {moderateError}
                </div>
              )}
            </div>
            <div slot="actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <m3e-button
                variant="outlined"
                onClick={() => {
                  setShowQuickModerate(false);
                  setModerateError(null);
                }}
                disabled={isSubmitting}
              >Cancel</m3e-button>
              <m3e-button variant="filled" onClick={handleQuickModerate}
                disabled={isSubmitting || !moderateTarget || !violationType}
              >Create Action</m3e-button>
            </div>
          </m3e-dialog>
        )}
      </div>
    </Layout>
  );
};
