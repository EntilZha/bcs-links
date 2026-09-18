/**
 * Which NextGen event is happening right now, from the BCS calendar.
 *
 * The calendar lives on Tockify (the same source bcs-calendar crawls). Its JSON event API
 * sends `Access-Control-Allow-Origin: *`, so a phone can ask it directly when the page
 * opens — no rebuild needed when events change. The result only feeds the tracking tags;
 * if Tockify is slow or down, the page keeps its default tags and nothing breaks.
 */

export const TOCKIFY_CALENDAR = "birds.connect.sea";
export const NEXTGEN_TAG = "NextGen";
/** An event counts as active from an hour before it starts until an hour after it ends. */
export const WINDOW_MS = 60 * 60 * 1000;

export interface CalendarEvent {
  title: string;
  start: number; // epoch ms
  end: number; // epoch ms
  /** the event's UTC offset in ms (Tockify reports it), so dates are Seattle-local */
  offset: number;
}

// Just the parts of Tockify's /api/ngevent response we read.
interface TockifyEvent {
  when?: { start?: { millis?: number; offset?: number }; end?: { millis?: number } };
  content?: { summary?: { text?: string } };
  status?: { name?: string };
}

export function parseTockify(json: unknown): CalendarEvent[] {
  const events = (json as { events?: TockifyEvent[] })?.events ?? [];
  return events.flatMap((e) => {
    const start = e.when?.start?.millis;
    const end = e.when?.end?.millis ?? start;
    const title = e.content?.summary?.text?.trim();
    if (typeof start !== "number" || typeof end !== "number" || !title) return [];
    if (e.status?.name?.toLowerCase() === "cancelled") return [];
    return [{ title, start, end, offset: e.when?.start?.offset ?? 0 }];
  });
}

/** The event whose window contains `now`; if several do, the one that started last. */
export function pickActive(events: CalendarEvent[], now: number): CalendarEvent | null {
  const live = events.filter((e) => e.start - WINDOW_MS <= now && now <= e.end + WINDOW_MS);
  live.sort((a, b) => b.start - a.start);
  return live[0] ?? null;
}

/**
 * A readable tag for reports: the event's local date, then its title without the boilerplate
 * the calendar puts around it — "Neighborhood Bird Outing: Carkeek Park Scope and Sip (All
 * ages welcome!)" on 13 Sep 2026 becomes "2026-09-13 Carkeek Park Scope and Sip", which
 * referral.ts then lowercases and underscores.
 */
export function eventTag(e: CalendarEvent): string {
  const date = new Date(e.start + e.offset).toISOString().slice(0, 10);
  const title = e.title
    .replace(/\*\*[^*]*\*\*/g, "") // **Rescheduled** and similar flags
    .replace(/\([^)]*\)/g, "") // (for young adults <40), (All ages welcome!)
    .replace(/^.*?:\s*/, "") // "Neighborhood Bird Outing: ", "Field Trip: "
    .replace(/\s\+\s.*$/, "") // " + optional Pot Luck", " + Burke Gilman Brewing"
    .trim();
  return `${date} ${title || e.title}`;
}

export function tockifyUrl(now: number): string {
  const params = new URLSearchParams({
    calname: TOCKIFY_CALENDAR,
    tags: NEXTGEN_TAG,
    // Start the search a day back so an event that began earlier is still returned.
    startms: String(now - 24 * 60 * 60 * 1000),
    max: "20",
  });
  return `https://tockify.com/api/ngevent?${params}`;
}

/** Ask Tockify which NextGen event is on now. Resolves to null on any failure or timeout. */
export async function fetchActiveEvent(now = Date.now(), timeoutMs = 4000): Promise<CalendarEvent | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(tockifyUrl(now), { signal: controller.signal });
    if (!res.ok) return null;
    return pickActive(parseTockify(await res.json()), now);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
