// Business-day helpers. Tony's day starts at 06:00 local time, so an "order day"
// runs from 06:00 on the chosen date to 06:00 the next date. We resolve these
// boundaries in a fixed timezone (default Europe/Amsterdam) so the window is the
// same regardless of where the server or a given browser happens to run.

export const APP_TIMEZONE =
  process.env.NEXT_PUBLIC_APP_TIMEZONE || "Europe/Amsterdam";

export const DAY_START_HOUR = 6;

// Offset (local - UTC) in ms for a given instant in a timezone.
function tzOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  // Intl renders hour "24" at midnight; normalize to 0.
  const hour = map.hour === 24 ? 0 : map.hour;
  const asUTC = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    hour,
    map.minute,
    map.second,
  );
  return asUTC - date.getTime();
}

// The UTC instant of `hour:00` local time on a given calendar date in `timeZone`.
function zonedTimeToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  timeZone: string,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, 0, 0);
  // One correction pass is enough except for the rare instant that lands inside
  // a DST gap; 06:00 is never in one, so this is exact for our use.
  const offset = tzOffsetMs(timeZone, new Date(utcGuess));
  return new Date(utcGuess - offset);
}

function parseDateString(date: string): [number, number, number] {
  const [y, m, d] = date.split("-").map(Number);
  return [y, m, d];
}

// Validate a YYYY-MM-DD string.
export function isValidDateString(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [y, m, d] = parseDateString(date);
  return (
    Number.isFinite(y) && m >= 1 && m <= 12 && d >= 1 && d <= 31
  );
}

// The current business date (YYYY-MM-DD) in APP_TIMEZONE. Before 06:00 it still
// counts as the previous day.
export function currentBusinessDate(
  timeZone: string = APP_TIMEZONE,
  now: Date = new Date(),
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
  }).formatToParts(now);
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;
  let [y, m, d] = [Number(map.year), Number(map.month), Number(map.day)];
  const hour = map.hour === "24" ? 0 : Number(map.hour);
  if (hour < DAY_START_HOUR) {
    const prev = new Date(Date.UTC(y, m - 1, d));
    prev.setUTCDate(prev.getUTCDate() - 1);
    y = prev.getUTCFullYear();
    m = prev.getUTCMonth() + 1;
    d = prev.getUTCDate();
  }
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// The [start, end) UTC window for a business date, as ISO strings.
export function businessDayWindow(
  date: string,
  timeZone: string = APP_TIMEZONE,
): { startISO: string; endISO: string } {
  const [y, m, d] = parseDateString(date);
  const start = zonedTimeToUtc(y, m, d, DAY_START_HOUR, timeZone);
  const next = new Date(Date.UTC(y, m - 1, d));
  next.setUTCDate(next.getUTCDate() + 1);
  const end = zonedTimeToUtc(
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    next.getUTCDate(),
    DAY_START_HOUR,
    timeZone,
  );
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}
