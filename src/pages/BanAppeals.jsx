import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useShiftStore } from '../stores/shiftStore';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
import '@m3e/react/stepper';
import '@m3e/react/form-field';
import '@m3e/react/select';
import '@m3e/react/autocomplete';
import '@m3e/react/button';
import '@m3e/react/dialog';
import '@m3e/react/card';
import '@m3e/react/breadcrumb';
import '@m3e/react/tooltip';

const APPEAL_REASONS = [
  { id: 'wrongful-ban', label: 'Wrongful Ban', description: 'I believe I was banned unfairly' },
  { id: 'appeal-after-wait', label: 'Appeal After Wait', description: 'Sufficient time has passed' },
  { id: 'evidence', label: 'New Evidence', description: 'I have new evidence to present' },
  { id: 'behavior-change', label: 'Behavior Change', description: 'I have changed my behavior' },
];

export const BanAppealsPage = () => {
  const { user, accessToken } = useAuthStore();
  const [step, setStep] = useState(0);
  const [robloxUsername, setRobloxUsername] = useState('');
  const [robloxLinked, setRobloxLinked] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealDescription, setAppealDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Step 1: Roblox Account Linking
  const handleLinkRoblox = async () => {
    if (!robloxUsername.trim()) {
      setSubmitError('Please enter a Roblox username');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Mock API call - verify Roblox account exists
      // In production: POST /api/appeals/verify-roblox with username
      await new Promise((resolve) => setTimeout(resolve, 500)); // Mock delay
      
      if (robloxUsername.toLowerCase() === 'invalid') {
        setSubmitError('Roblox account not found');
        setIsSubmitting(false);
        return;
      }

      setRobloxLinked(true);
      setStep(1);
      setIsSubmitting(false);
    } catch (err) {
      setSubmitError(err.message);
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit Appeal
  const handleSubmitAppeal = () => {
    if (!appealReason) {
      setSubmitError('Please select a reason');
      return;
    }
    if (!appealDescription.trim()) {
      setSubmitError('Please describe your appeal');
      return;
    }
    setShowConfirmDialog(true);
  };

  // Step 3: Confirmation & Submit
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const appealData = {
        robloxUsername,
        reason: appealReason,
        description: appealDescription,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appeals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appealData),
      });

      if (!res.ok) {
        throw new Error('Failed to submit appeal');
      }

      const result = await res.json();
      setSubmitSuccess(true);
      setShowConfirmDialog(false);
      setStep(2);
      setIsSubmitting(false);
    } catch (err) {
      setSubmitError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setRobloxUsername('');
    setRobloxLinked(false);
    setAppealReason('');
    setAppealDescription('');
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  return (
    <Layout currentPage="appeals">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* M3E Stepper - https://matraic.github.io/m3e/#/components/stepper.html */}
        <m3e-stepper
          active-step={step}
          steps-count={3}
          style={{ marginBottom: '32px' }}
        >
          <div slot="step-label-0" style={{ fontSize: '14px', fontWeight: '500' }}>
            Link Roblox Account
          </div>
          <div slot="step-label-1" style={{ fontSize: '14px', fontWeight: '500' }}>
            Submit Appeal
          </div>
          <div slot="step-label-2" style={{ fontSize: '14px', fontWeight: '500' }}>
            Confirmation
          </div>
        </m3e-stepper>

        {/* Step 1: Authentication & Roblox Linking */}
        {step === 0 && (
          <m3e-card elevated>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '500' }}>
                Step 1: Link Your Roblox Account
              </h2>

              <div style={{ fontSize: '14px', opacity: 0.7 }}>
                You are signed in as: <strong>{user.username}</strong>
              </div>

              {/* Autocomplete for Roblox Username - https://matraic.github.io/m3e/#/components/autocomplete.html */}
              <m3e-form-field label="Roblox Username">
                <input
                  type="text"
                  placeholder="Enter your Roblox username"
                  value={robloxUsername}
                  onChange={(e) => setRobloxUsername(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--md-sys-color-outline)',
                    fontSize: '14px',
                  }}
                />
              </m3e-form-field>

              {submitError && (
                <div
                  style={{
                    color: '#f24822',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(242, 72, 34, 0.1)',
                    fontSize: '13px',
                  }}
                >
                  {submitError}
                </div>
              )}

              <m3e-button-filled
                label="Verify & Continue"
                onClick={handleLinkRoblox}
                disabled={isSubmitting || !robloxUsername.trim()}
              />
            </div>
          </m3e-card>
        )}

        {/* Step 2: Appeal Submission */}
        {step === 1 && (
          <m3e-card elevated>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '500' }}>
                Step 2: Submit Your Appeal
              </h2>

              <div style={{ fontSize: '13px', opacity: 0.7 }}>
                Account: {user.username} | Roblox: {robloxUsername}
              </div>

              {/* Select Appeal Reason - https://matraic.github.io/m3e/#/components/select.html */}
              <div>
                <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>
                  Appeal Reason
                </label>
                <select
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
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
                  <option value="">Select a reason...</option>
                  {APPEAL_REASONS.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason Description */}
              {appealReason && (
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    opacity: 0.8,
                  }}
                >
                  {APPEAL_REASONS.find((r) => r.id === appealReason)?.description}
                </div>
              )}

              {/* Form Field - Appeal Description - https://matraic.github.io/m3e/#/components/form-field.html */}
              <div>
                <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>
                  Detailed Explanation
                </label>
                <textarea
                  placeholder="Please explain your appeal in detail..."
                  value={appealDescription}
                  onChange={(e) => setAppealDescription(e.target.value)}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid var(--md-sys-color-outline)',
                    fontSize: '13px',
                    backgroundColor: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontFamily: 'inherit',
                    resize: 'none',
                  }}
                />
              </div>

              {submitError && (
                <div
                  style={{
                    color: '#f24822',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(242, 72, 34, 0.1)',
                    fontSize: '13px',
                  }}
                >
                  {submitError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <m3e-button-outlined
                  label="Back"
                  onClick={() => setStep(0)}
                  disabled={isSubmitting}
                />
                <m3e-button-filled
                  label="Review & Submit"
                  onClick={handleSubmitAppeal}
                  disabled={isSubmitting || !appealReason || !appealDescription.trim()}
                />
              </div>
            </div>
          </m3e-card>
        )}

        {/* Step 3: Confirmation */}
        {step === 2 && (
          <m3e-card elevated>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
              <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '500' }}>
                Appeal Submitted Successfully
              </h2>
              <p style={{ margin: '0', fontSize: '14px', opacity: 0.7 }}>
                Your ban appeal has been received. Our moderation team will review it within 3-7 days and contact you via Discord.
              </p>

              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--md-sys-color-tertiary-container)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                <strong>Appeal ID:</strong> {Math.random().toString(36).substring(7).toUpperCase()}
              </div>

              <m3e-button-filled
                label="Submit Another Appeal"
                onClick={handleReset}
              />
            </div>
          </m3e-card>
        )}

        {/* Confirmation Dialog - https://matraic.github.io/m3e/#/components/dialog.html */}
        {showConfirmDialog && (
          <m3e-dialog open>
            <div slot="headline" style={{ fontSize: '16px', fontWeight: '500' }}>
              Confirm Your Appeal
            </div>
            <div
              slot="content"
              style={{
                fontSize: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>
                <strong>Discord:</strong> {user.username}
              </div>
              <div>
                <strong>Roblox:</strong> {robloxUsername}
              </div>
              <div>
                <strong>Reason:</strong> {APPEAL_REASONS.find((r) => r.id === appealReason)?.label}
              </div>
              <div>
                <strong>Message:</strong>
                <p style={{ margin: '8px 0 0 0', opacity: 0.8 }}>{appealDescription}</p>
              </div>
            </div>
            <div slot="actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <m3e-button-outlined
                label="Cancel"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isSubmitting}
              />
              <m3e-button-filled
                label="Submit Appeal"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
              />
            </div>
          </m3e-dialog>
        )}
      </div>
    </Layout>
  );
};
