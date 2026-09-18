# Tracking visits from the NextGen link page

The NextGen link page (https://bcs.pedro.ai, reached from the QR tags handed round on NextGen
walks and events) tags every link it sends to a BCS form. This page is for BCS staff who
want to see that traffic in their reports.

## What gets tagged

| Button | Destination | Recorded in |
|---|---|---|
| Sign in for today's walk | NextGen sign-in & waiver form (EveryAction) | EveryAction |
| Donate or Become a Member | birdsconnectsea.org/donate/ (EveryAction form on the site) | EveryAction **and** Google Analytics |
| Protect owls from rat poison | Rat-poison action form (EveryAction) | EveryAction |

The events calendar and social links aren't tagged: they aren't BCS forms.

Every tagged link carries these parameters:

| Parameter | Value | Meaning |
|---|---|---|
| `ms` | `nextgen_linktree`, or `nextgen_linktree_<event>` | EveryAction **Market Source** |
| `utm_source` | `nextgen_linktree` | Google Analytics: where the visit came from |
| `utm_medium` | `qr` | Google Analytics: how (a scanned QR tag) |
| `utm_campaign` | `<event>`, or `nextgen_event` when no event is known | Google Analytics: which event |

`<event>` is filled in, in this order:

1. **From the QR tag itself:** a tag printed for one place can point at
   `bcs.pedro.ai/?src=discovery_park`, which always wins.
2. **From the BCS calendar:** the NextGen-tagged event on the calendar (Tockify) whose
   time window covers the visit, from one hour before it starts to one hour after it ends.
   It's written as the event's date plus a short title, e.g.
   `2026_09_13_carkeek_park_scope_and_sip`.
3. **Neither:** no event part; `ms` is just `nextgen_linktree` and the campaign is
   `nextgen_event`.

All values are lowercase with underscores, at most 48 characters for the event part (cut at a
word boundary).
Nothing personal is ever included.

## Finding it in reports

**EveryAction (every button).** Filter or group by **Market Source**:

- *everything* from the link page: Market Source **starts with** (or contains) `nextgen_linktree`
- *a specific event*: Market Source contains the event, e.g. `carkeek`
- *link page, event unknown*: Market Source **is exactly** `nextgen_linktree`

**Google Analytics 4 (donate page only).** *Reports → Acquisition → Traffic acquisition*,
primary dimension **Session source / medium** = `nextgen_linktree / qr`, secondary
dimension **Session campaign** to split by event. GA's default channel grouping doesn't
recognise the medium `qr`, so these visits show as *Unassigned* in channel reports;
filter by source/medium instead.

The walk sign-in and action pages (secure.birdsconnectsea.org) don't load Google
Analytics, so for those, EveryAction's Market Source is the record.

## Checking it end to end

Recommended once after launch, by someone who can delete test records:

1. Open `https://bcs.pedro.ai/?src=tracking_test` and tap a button. The address that opens
   should include `ms=nextgen_linktree_tracking_test`.
2. Submit the form with obviously fake details.
3. Confirm Market Source reads `nextgen_linktree_tracking_test` on that record in
   EveryAction, then delete the record.
