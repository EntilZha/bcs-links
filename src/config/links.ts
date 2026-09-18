/**
 * Everything the page links to. Edit here; the page renders straight from this list.
 *
 * `tracked` links get the referral tags from src/lib/referral.ts appended — only set it on
 * links that land on an EveryAction form (EveryAction reads the `ms` tag) or on
 * birdsconnectsea.org (Google Analytics reads the utm_* tags).
 *
 * If BCS staff ever create an EveryAction Source Code for the linktree, its numeric id
 * can be added to a tracked href as `?sourceid=<id>`; withReferral() keeps existing
 * parameters.
 */
import type { ArtId } from "../art/registry";

export interface LinkItem {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  bird: ArtId;
  /** a short tag shown beside the label, e.g. for a current campaign */
  badge?: string;
  /** primary links get the large, coloured treatment at the top of the page */
  tier: "primary" | "secondary";
  tracked: boolean;
}

export interface SocialLink {
  id: "instagram" | "facebook" | "youtube";
  label: string;
  href: string;
}

export const LINKS: LinkItem[] = [
  {
    id: "signup",
    label: "Sign in for today's walk",
    sublabel: "Sign-in, Waiver, and Newsletter",
    href: "https://secure.birdsconnectsea.org/a/nextgen-event-sign-and-waiver-form",
    bird: "hummingbird",
    tier: "primary",
    tracked: true,
  },
  {
    id: "donate",
    label: "Donate or Become a Member",
    sublabel: "One-time, monthly, or membership",
    href: "https://birdsconnectsea.org/donate/",
    bird: "heron",
    tier: "primary",
    tracked: true,
  },
  {
    id: "owls",
    label: "Protect owls from rat poison",
    sublabel: "Ask legislators to restrict it",
    badge: "Take action",
    href: "https://secure.birdsconnectsea.org/a/tell-our-leaders-rat-poison-wildlife-poison",
    bird: "owl",
    tier: "secondary",
    tracked: true,
  },
  {
    id: "calendar",
    label: "Upcoming walks & events",
    sublabel: "Find your next outing",
    href: "https://entilzha.github.io/bcs-calendar/",
    bird: "robin",
    tier: "secondary",
    tracked: false,
  },
];

export const SOCIALS: SocialLink[] = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/birdsconnectsea/" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/birdsconnectseattle/" },
  { id: "youtube", label: "YouTube", href: "https://www.youtube.com/@birdsconnectsea" },
];

export const BCS_HOME = "https://birdsconnectsea.org/";
