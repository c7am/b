import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Layout } from '../components/Layout';
import '@m3e/react/card';
import '@m3e/react/select';
import '@m3e/react/switch';
import '@m3e/react/form-field';
import '@m3e/react/button';
import '@m3e/react/chips';
import '@m3e/react/skeleton';

export const SettingsPage = () => {
  const { user } = useAuthStore();
  // Live-checked servers this user can actually manage (see /api/auth/me).
  // NOT adminGuildIds: that is a stale Discord-permission snapshot from OAuth
  // login and does not match how the API itself authorizes these endpoints.
  const manageableGuildIds = user?.manageableGuildIds || [];
  const [selectedGuildId, setSelectedGuildId] = useState(null);
  const [config, setConfig] = useState({
    modRole: '',
    staffRole: '',
    logsChannel: '',
    appeals: true,
    autoMod: false,
    dmNotifications: true,
  });
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Default to the first manageable server once the list is known. If there is
  // more than one, the picker below lets the user switch.
  useEffect(() => {
    if (selectedGuildId === null && manageableGuildIds.length > 0) {
      setSelectedGuildId(manageableGuildIds[0]);
    }
  }, [manageableGuildIds, selectedGuildId]);

  useEffect(() => {
    if (!selectedGuildId) {
      setIsLoadingConfig(false);
      return;
    }
    let cancelled = false;
    setIsLoadingConfig(true);
    setLoadError(null);
    fetch(`/api/config/${selectedGuildId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load settings for this server');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        // guild_config columns are snake_case; the form state is camelCase.
        setConfig({
          modRole: data.mod_role || '',
          staffRole: data.staff_role || '',
          logsChannel: data.logs_channel || '',
          appeals: data.appeals_enabled ?? true,
          autoMod: data.auto_mod ?? false,
          dmNotifications: data.dm_notifications ?? true,
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingConfig(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedGuildId]);

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSaveConfig = async () => {
    if (!selectedGuildId) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/config/${selectedGuildId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error('Failed to save config');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout currentPage="settings">
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {manageableGuildIds.length === 0 && (
          <div style={{ fontSize: '14px', opacity: 0.7, padding: '16px', textAlign: 'center' }}>
            You are not staff in any server this bot is in.
          </div>
        )}

        {manageableGuildIds.length > 1 && (
          <div>
            <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>
              Server
            </label>
            <select
              value={selectedGuildId || ''}
              onChange={(e) => setSelectedGuildId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid var(--md-sys-color-outline)',
                fontSize: '14px',
                backgroundColor: 'var(--md-sys-color-surface)',
                color: 'var(--md-sys-color-on-surface)',
              }}
            >
              {manageableGuildIds.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
        )}

        {loadError && (
          <div
            style={{
              color: '#f24822',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(242, 72, 34, 0.1)',
              fontSize: '13px',
            }}
          >
            {loadError}
          </div>
        )}

        {/* One skeleton per top-level card below; loaded reveals the real content. */}
        {/* https://matraic.github.io/m3e/components/skeleton.html */}
        <m3e-skeleton loaded={!isLoadingConfig} shape="rounded" aria-busy={isLoadingConfig}>
        {/* Server Configuration */}
        <m3e-card variant="elevated">
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '500' }}>
              Server Configuration
            </h2>

            {/* Mod Role Select - https://matraic.github.io/m3e/#/components/select.html */}
            <div>
              <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>
                Moderator Role
              </label>
              <select
                value={config.modRole}
                onChange={(e) => handleConfigChange('modRole', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--md-sys-color-outline)',
                  fontSize: '14px',
                  backgroundColor: 'var(--md-sys-color-surface)',
                  color: 'var(--md-sys-color-on-surface)',
                }}
              >
                <option value="">Select role...</option>
                <option value="mod">Moderator</option>
                <option value="admin">Administrator</option>
                <option value="custom">Custom Role</option>
              </select>
            </div>

            {/* Staff Role Select */}
            <div>
              <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>
                Staff Role
              </label>
              <select
                value={config.staffRole}
                onChange={(e) => handleConfigChange('staffRole', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--md-sys-color-outline)',
                  fontSize: '14px',
                  backgroundColor: 'var(--md-sys-color-surface)',
                  color: 'var(--md-sys-color-on-surface)',
                }}
              >
                <option value="">Select role...</option>
                <option value="staff">Staff</option>
                <option value="helper">Helper</option>
                <option value="custom">Custom Role</option>
              </select>
            </div>

            {/* Logs Channel Input - https://matraic.github.io/m3e/#/components/form-field.html */}
            <div>
              <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>
                Moderation Logs Channel
              </label>
              <input
                type="text"
                placeholder="#moderation-logs"
                value={config.logsChannel}
                onChange={(e) => handleConfigChange('logsChannel', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--md-sys-color-outline)',
                  fontSize: '14px',
                  backgroundColor: 'var(--md-sys-color-surface)',
                  color: 'var(--md-sys-color-on-surface)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </m3e-card>

        {/* Feature Toggles */}
        <m3e-card variant="elevated">
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '500' }}>
              Feature Toggles
            </h2>

            {/* Ban Appeals Toggle - https://matraic.github.io/m3e/#/components/switch.html */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  Ban Appeals
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                  Allow users to submit ban appeals
                </div>
              </div>
              <m3e-switch
                checked={config.appeals}
                onChange={(e) => handleConfigChange('appeals', e.target.checked)}
              />
            </div>

            {/* Auto Moderation Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  Auto Moderation
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                  Automatically flag messages
                </div>
              </div>
              <m3e-switch
                checked={config.autoMod}
                onChange={(e) => handleConfigChange('autoMod', e.target.checked)}
              />
            </div>

            {/* DM Notifications Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  DM Notifications
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                  Notify staff via DM for important actions
                </div>
              </div>
              <m3e-switch
                checked={config.dmNotifications}
                onChange={(e) => handleConfigChange('dmNotifications', e.target.checked)}
              />
            </div>
          </div>
        </m3e-card>
        </m3e-skeleton>

        {/* Status Messages */}
        {saveError && (
          <div
            style={{
              color: '#f24822',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(242, 72, 34, 0.1)',
              fontSize: '13px',
            }}
          >
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div
            style={{
              color: '#2fbf6b',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(47, 191, 107, 0.1)',
              fontSize: '13px',
            }}
          >
            Settings saved successfully
          </div>
        )}

        {/* Save Button */}
        <m3e-button
          variant="filled"
          onClick={handleSaveConfig}
          disabled={isSaving || isLoadingConfig || !selectedGuildId}
          style={{ width: '100%' }}
        >{isSaving ? 'Saving...' : 'Save Settings'}</m3e-button>
      </div>
    </Layout>
  );
};
