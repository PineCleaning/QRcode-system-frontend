import { apiFetch } from './server-fetch';
import type { ClickupStatus } from './types';

/**
 * Wraps apiFetch('/clickup/status') so a status-check failure (backend
 * briefly unreachable, session hiccup) never breaks the whole dashboard -
 * used by the global banner in (dashboard)/layout.tsx, which renders on
 * every admin page. The dedicated /settings/clickup page calls apiFetch
 * directly instead, since a real failure there should surface via the
 * normal error.tsx boundary rather than be swallowed.
 */
export async function getClickupStatusSafe(): Promise<ClickupStatus | null> {
  try {
    return await apiFetch<ClickupStatus>('/clickup/status');
  } catch {
    return null;
  }
}
