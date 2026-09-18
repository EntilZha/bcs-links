import { sanitizeSrc, withReferral } from "./referral";

const DONATE = "https://birdsconnectsea.org/donate/";

describe("sanitizeSrc", () => {
  it("keeps a clean tag as-is", () => {
    expect(sanitizeSrc("discovery_park")).toBe("discovery_park");
  });
  it("lowercases and collapses anything else to single underscores", () => {
    expect(sanitizeSrc("  Discovery Park!! 2026 ")).toBe("discovery_park_2026");
    expect(sanitizeSrc("discovery-park")).toBe("discovery_park");
  });
  it("rejects values with nothing usable in them", () => {
    expect(sanitizeSrc("")).toBeNull();
    expect(sanitizeSrc(null)).toBeNull();
    expect(sanitizeSrc("<>&&")).toBeNull();
  });
  it("cuts long tags at a word boundary", () => {
    expect(sanitizeSrc("2026_09_19 BIPOC Birding at Lake Sammamish and more words")).toBe("2026_09_19_bipoc_birding_at_lake_sammamish_and");
  });
  it("caps the length without leaving a trailing underscore", () => {
    const out = sanitizeSrc("a".repeat(47) + " bbbbb")!;
    expect(out.length).toBeLessThanOrEqual(48);
    expect(out.endsWith("_")).toBe(false);
  });
});

describe("withReferral", () => {
  it("adds the default tags when there is no src", () => {
    const url = new URL(withReferral(DONATE));
    expect(url.origin + url.pathname).toBe(DONATE);
    expect(url.searchParams.get("ms")).toBe("nextgen_linktree");
    expect(url.searchParams.get("utm_source")).toBe("nextgen_linktree");
    expect(url.searchParams.get("utm_medium")).toBe("qr");
    expect(url.searchParams.get("utm_campaign")).toBe("nextgen_event");
  });

  it("folds a src into ms and utm_campaign", () => {
    const url = new URL(withReferral(DONATE, "Magnuson Park"));
    expect(url.searchParams.get("ms")).toBe("nextgen_linktree_magnuson_park");
    expect(url.searchParams.get("utm_campaign")).toBe("magnuson_park");
  });

  it("falls back to the defaults when src is junk", () => {
    const url = new URL(withReferral(DONATE, "%%%"));
    expect(url.searchParams.get("ms")).toBe("nextgen_linktree");
  });

  it("keeps the link's own query parameters", () => {
    const url = new URL(withReferral("https://example.org/form?amount=25"));
    expect(url.searchParams.get("amount")).toBe("25");
  });

  it("is idempotent: re-tagging overwrites instead of duplicating", () => {
    const twice = withReferral(withReferral(DONATE, "a"), "b");
    const url = new URL(twice);
    expect(url.searchParams.getAll("ms")).toEqual(["nextgen_linktree_b"]);
    expect(url.searchParams.getAll("utm_campaign")).toEqual(["b"]);
  });
});
