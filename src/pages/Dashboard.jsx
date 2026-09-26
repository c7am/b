import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useShiftStore } from '../stores/shiftStore';
import { Layout } from '../components/Layout';
import { ShapeCard } from '../components/ShapeCard';
import '@m3e/react/card';
import '@m3e/react/button';
import '@m3e/react/shape';
import '@m3e/react/slider';
import '@m3e/react/progress-indicator';
import '@m3e/react/divider';

export const DashboardPage = () => {
  const { user, accessToken } = useAuthStore();
  const { shifts, currentShift, timer, fetchShifts, startShift, pauseShift, endShift } = useShiftStore();

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const statCards = [
    {
      id: 'active',
      title: 'Active Sessions',
      value: currentShift ? '1' : '0',
      metric: 'shifts',
    },
    {
      id: 'upcoming',
      title: 'Upcoming Shifts',
      value: shifts.filter((s) => s.status === 'scheduled').length,
      metric: 'shifts',
    },
    {
      id: 'completed',
      title: 'Completed',
      value: shifts.filter((s) => s.status === 'completed').length,
      metric: 'shifts',
    },
    {
      id: 'moderations',
      title: 'Moderations',
      value: '0',
      metric: 'actions',
    },
    {
      id: 'weekly',
      title: 'Weekly Hours',
      value: currentShift ? formatTimer(timer) : '--:--:--',
      metric: 'time',
    },
  ];

  const formatTimer = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartShift = async () => {
    await startShift();
  };

  const handlePauseShift = async () => {
    if (currentShift) {
      await pauseShift();
    }
  };

  const handleEndShift = async () => {
    if (currentShift) {
      await endShift();
    }
  };

  return (
    <Layout currentPage="dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Stat Cards Grid - https://matraic.github.io/m3e/#/components/card.html */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {statCards.map((card) => (
            <ShapeCard key={card.id} shape="8-leaf-clover">
              <div
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '32px', fontWeight: '600' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>
                  {card.metric}
                </div>
              </div>
            </ShapeCard>
          ))}
        </div>

        {/* Shift Controls */}
        <ShapeCard shape="pill">
          <div
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '100%',
            }}
          >
            <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '500' }}>
              Shift Management
            </h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <m3e-button variant="filled" onClick={handleStartShift}
                disabled={!!currentShift}
              >Start Shift</m3e-button>
              <m3e-button variant="outlined" onClick={handlePauseShift}
                disabled={!currentShift}
              >Pause Shift</m3e-button>
              <m3e-button variant="tonal" onClick={handleEndShift}
                disabled={!currentShift}
              >End Shift</m3e-button>
            </div>
            {currentShift && (
              <div style={{ padding: '12px', backgroundColor: 'var(--md-sys-color-tertiary-container)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                  Current Shift Duration
                </div>
                <div style={{ fontSize: '24px', fontWeight: '600', fontFamily: 'monospace' }}>
                  {formatTimer(timer)}
                </div>
              </div>
            )}
          </div>
        </ShapeCard>

        {/* Recent Shifts Table */}
        <ShapeCard shape="sunny">
          <div style={{ padding: '16px', width: '100%' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '500' }}>
              Recent Shifts
            </h2>
            {shifts.length === 0 ? (
              <div style={{ opacity: 0.6, fontSize: '14px', padding: '16px', textAlign: 'center' }}>
                No shifts yet
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', opacity: 0.7 }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', opacity: 0.7 }}>Duration</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', opacity: 0.7 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.slice(0, 5).map((shift) => (
                    <tr key={shift.id} style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
                      <td style={{ padding: '8px', fontSize: '14px' }}>
                        {new Date(shift.startedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '8px', fontSize: '14px' }}>
                        {formatTimer(shift.duration || 0)}
                      </td>
                      <td style={{ padding: '8px', fontSize: '14px', textTransform: 'capitalize' }}>
                        {shift.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ShapeCard>
      </div>
    </Layout>
  );
};
