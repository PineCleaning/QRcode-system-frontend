/**
 * Every feedback/asset timestamp in the admin portal renders in
 * Australia/Sydney regardless of where the Next.js server process
 * itself is running - without an explicit timeZone, Intl.DateTimeFormat
 * defaults to the server's own local zone, which silently drifted from
 * Sydney once deployed (e.g. a UTC-hosted server showed times ~10-11
 * hours behind what the client's team, all in Sydney, actually expects).
 */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
