import { apiFetch } from '@/lib/api/server-fetch';
import type { ClickupStatus } from '@/lib/api/types';
import { ClickupTokenForm } from './ClickupTokenForm';

const STEPS = [
  <>
    Go to ClickUp → click your avatar (bottom-left) → <strong>Apps</strong>
  </>,
  <>
    Under <strong>API Token</strong>, click <strong>Generate</strong> (or <strong>Regenerate</strong> if one already
    exists)
  </>,
  <>
    Copy the token — it starts with <code className="rounded bg-line/50 px-1 py-0.5 font-mono text-[12px]">pk_</code>
  </>,
  <>
    Paste it below and click <strong>Reconnect</strong>
  </>,
];

export default async function ClickupSettingsPage() {
  const status = await apiFetch<ClickupStatus>('/clickup/status');

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-ink">ClickUp connection</h1>
      <p className="mt-1 text-sm text-ink-muted">Feedback submitted through a QR code is delivered to ClickUp as a ticket.</p>

      {status.needsReconnect ? (
        <div className="mt-6 rounded-[20px] border border-coral/30 bg-coral/10 p-5">
          <p className="text-sm font-bold text-ink">
            <span aria-hidden className="mr-1.5">
              ⚠
            </span>
            Disconnected — feedback isn&apos;t reaching ClickUp
          </p>
          {status.lastErrorMessage && <p className="mt-1 text-[13px] text-ink-muted">Last error: {status.lastErrorMessage}</p>}
          {status.disconnectedAt && (
            <p className="mt-1 text-[13px] text-ink-muted">Since {new Date(status.disconnectedAt).toLocaleString()}</p>
          )}

          <p className="mt-4 text-sm font-bold text-ink">To fix this, generate a new token and paste it here:</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[13.5px] text-ink">
            {STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <ClickupTokenForm />

          <p className="mt-3 text-[12px] text-ink-muted">
            {status.railwaySyncConfigured
              ? 'This will also update your Railway deployment automatically — no other steps needed.'
              : "This fixes ClickUp immediately. It won't touch Railway (auto-sync isn't set up) - that's fine, nothing else needs to change."}
          </p>
        </div>
      ) : status.connected ? (
        <div className="mt-6 rounded-[20px] border border-green/30 bg-green/10 p-5">
          <p className="text-sm font-bold text-ink">
            <span aria-hidden className="mr-1.5">
              ✓
            </span>
            Connected to {status.workspaceName ?? status.workspaceId}
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">{status.configured ? 'Fully configured.' : 'Connected, but list/field setup is incomplete.'}</p>
          <p className="mt-3 border-t border-green/20 pt-3 text-[13px] text-ink-muted">
            {status.railwaySyncConfigured ? (
              <>
                <span className="text-green">✓</span> Railway auto-sync is on — reconnecting here also updates your Railway deployment automatically.
              </>
            ) : (
              <>Railway auto-sync isn&apos;t set up — reconnecting here still fixes ClickUp instantly, it just won&apos;t also update Railway&apos;s backup copy.</>
            )}
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-[20px] border border-line bg-surface p-5">
          <p className="text-sm text-ink-muted">No ClickUp connection has been set up yet.</p>
        </div>
      )}
    </div>
  );
}
