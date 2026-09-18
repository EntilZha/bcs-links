import { eventTag, parseTockify, pickActive, type CalendarEvent } from "./activeEvent";
import { withReferral } from "./referral";

const H = 60 * 60 * 1000;
const PDT = -7 * H;
// 13 Sep 2026, 9:00–11:00 Seattle time.
const walkStart = Date.UTC(2026, 8, 13, 16);
const walk: CalendarEvent = {
  title: "Neighborhood Bird Outing: Carkeek Park Scope and Sip (All ages welcome!)",
  start: walkStart,
  end: walkStart + 2 * H,
  offset: PDT,
};

describe("pickActive", () => {
  it("counts an hour either side of the event", () => {
    expect(pickActive([walk], walk.start - 59 * 60 * 1000)).toBe(walk);
    expect(pickActive([walk], walk.end + 59 * 60 * 1000)).toBe(walk);
    expect(pickActive([walk], walk.start - 61 * 60 * 1000)).toBeNull();
    expect(pickActive([walk], walk.end + 61 * 60 * 1000)).toBeNull();
  });

  it("prefers the event that started most recently when windows overlap", () => {
    const later = { ...walk, title: "Later", start: walk.start + H, end: walk.end + H };
    expect(pickActive([walk, later], walk.start + 90 * 60 * 1000)).toBe(later);
  });
});

describe("eventTag", () => {
  it("is the Seattle date plus the title without calendar boilerplate", () => {
    expect(eventTag(walk)).toBe("2026-09-13 Carkeek Park Scope and Sip");
    expect(new URL(withReferral("https://birdsconnectsea.org/donate/", eventTag(walk))).searchParams.get("utm_campaign")).toBe(
      "2026_09_13_carkeek_park_scope_and_sip",
    );
  });

  it("uses the local date for a late-evening event", () => {
    // 19 Sep 2026, 7pm PDT is already the 20th in UTC.
    const trivia = { ...walk, title: "Beers for Birds Trivia night", start: Date.UTC(2026, 8, 20, 2), end: Date.UTC(2026, 8, 20, 4) };
    expect(eventTag(trivia)).toBe("2026-09-19 Beers for Birds Trivia night");
  });

  it("drops the '+ extras' part of a title", () => {
    expect(eventTag({ ...walk, title: "Neighborhood Bird Outing: BIPOC Birding at Lake Sammamish + optional Pot Luck" })).toBe(
      "2026-09-13 BIPOC Birding at Lake Sammamish",
    );
  });

  it("drops status flags like **Rescheduled**", () => {
    expect(eventTag({ ...walk, title: "**Rescheduled** Neighborhood Bird Outing: Seward Park" })).toBe("2026-09-13 Seward Park");
  });
});

describe("parseTockify", () => {
  it("reads Tockify's event shape and skips cancelled or malformed events", () => {
    const json = {
      events: [
        {
          when: { start: { millis: 1, offset: PDT }, end: { millis: 2 } },
          content: { summary: { text: "NextGen Wingspan Game Night" } },
          status: { name: "scheduled" },
        },
        { when: { start: { millis: 3 }, end: { millis: 4 } }, content: { summary: { text: "Gone" } }, status: { name: "cancelled" } },
        { content: { summary: { text: "No time" } } },
      ],
    };
    expect(parseTockify(json)).toEqual([{ title: "NextGen Wingspan Game Night", start: 1, end: 2, offset: PDT }]);
    expect(parseTockify(null)).toEqual([]);
  });
});
