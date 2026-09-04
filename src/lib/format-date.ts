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

/**
 * For genuinely date-only values (e.g. Inventory's Last Supply Date, picked
 * via <input type="date"> - no time is ever collected). These are stored as
 * midnight UTC on the picked calendar date (a JS date-parsing quirk: a bare
 * "YYYY-MM-DD" string parses as UTC, not local time). Reading the UTC date
 * parts directly - not converting through Australia/Sydney like formatDate()
 * does - recovers exactly the date that was picked. Converting a date-only
 * value through a timezone would attach a fabricated, meaningless time
 * (confirmed bug 2026-09-03: midnight UTC rendered as "10:00 am" in Sydney).
 */
export function formatDateOnly(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
