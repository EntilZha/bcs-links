/**
 * Referral tagging for links that leave this page for a BCS form.
 *
 * Both the walk sign-up form and the donate page run on EveryAction, which reads an `ms`
 * ("marketing source") query string and records it against the submission. Unlike
 * `sourceid`, `ms` is free text and needs nothing set up on the EveryAction side, which
 * is why it carries the tag. The utm_* parameters are for Google Analytics on
 * birdsconnectsea.org, so the traffic is visible even to people who never open EveryAction.
 *
 * Everything is lowercase with underscores, matching the `nextgen_event` campaign name.
 */

/** The `ms` value every tagged link carries; an event tag is appended to it. */
export const MS_PREFIX = "nextgen_linktree";
export const UTM_SOURCE = "nextgen_linktree";
export const UTM_MEDIUM = "qr";
/** utm_campaign when there is no `?src=` and no NextGen event on right now. */
export const DEFAULT_CAMPAIGN = "nextgen_event";
// Keeps `ms` (prefix + tag) at 65 characters at most; EveryAction documents no limit for it.
const MAX_TAG_LENGTH = 48;

/**
 * Reduce a tag (a `?src=` value, or an event name) to something safe to paste into another
 * site's query string and readable in a report: lowercase, `a-z0-9_` only, no leading,
 * trailing or doubled underscores. Returns null when nothing usable is left.
 */
export function sanitizeSrc(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (cleaned.length > MAX_TAG_LENGTH) {
    // Cut at a word boundary where there is one, so a report reads "…_lake" not "…_lake_samma".
    const cut = cleaned.slice(0, MAX_TAG_LENGTH + 1);
    const lastBreak = cut.lastIndexOf("_");
    cleaned = lastBreak > MAX_TAG_LENGTH / 2 ? cut.slice(0, lastBreak) : cleaned.slice(0, MAX_TAG_LENGTH);
  }
  return cleaned.replace(/_+$/, "") || null;
}

/**
 * Return `href` with the referral parameters set. Existing parameters are kept, and ours
 * are overwritten rather than appended, so tagging an already-tagged URL is a no-op
 * apart from the tag.
 */
export function withReferral(href: string, src?: string | null): string {
  const tag = sanitizeSrc(src);
  const url = new URL(href);
  url.searchParams.set("ms", tag ? `${MS_PREFIX}_${tag}` : MS_PREFIX);
  url.searchParams.set("utm_source", UTM_SOURCE);
  url.searchParams.set("utm_medium", UTM_MEDIUM);
  url.searchParams.set("utm_campaign", tag ?? DEFAULT_CAMPAIGN);
  return url.toString();
}
