# BIMI sender logo

BIMI (Brand Indicators for Message Identification) puts the site logomark in the sender avatar slot of a reader's inbox instead of a generic letter tile. This is the free path: no certificate, no recurring cost. It is one DNS TXT record plus one static asset.

## What it does and does not buy

| Client | Shows the logo? |
| --- | --- |
| Apple Mail (iOS 16+/macOS 13+) | Yes |
| Yahoo / AOL | Yes |
| Fastmail | Yes |
| Gmail | **No.** Requires a paid VMC (~$1,350-1,750/yr) or CMC (~$650-1,100/yr) |

Gmail is the biggest slice of any consumer list, so treat this as a polish item, not a deliverability fix. It does not affect whether mail lands in the inbox; DMARC/DKIM/SPF do that, and those are already in place (see `newsletter-setup.md`).

The certificate is the only thing gating Gmail. If that ever looks worth four figures a year, nothing here has to change except adding `a=https://.../vmc.pem` to the record.

## Current state

Verified 2026-07-21:

- `_dmarc.meese.rs` is `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;`. BIMI requires DMARC at enforcement (`p=quarantine` or `p=reject`), and this was already there, so no monitoring window was needed.
- Sending domain is `mail.meese.rs` (From: `posts@mail.meese.rs`). DKIM is published at `resend._domainkey.mail.meese.rs`.
- There is no explicit `_dmarc.mail.meese.rs`. The subdomain inherits `sp=reject` from the org domain, which satisfies BIMI. An explicit record is optional and only worth adding if a validator complains.
- The BIMI record is live at `default._bimi.mail.meese.rs`.

The record lives on the **sending** subdomain, not the root. BIMI is looked up against the From domain, which is `mail.meese.rs`. A record on `meese.rs` alone would never be consulted by mail sent from this newsletter.

## The DNS record

```
Type:    TXT
Name:    default._bimi.mail          (i.e. default._bimi.mail.meese.rs)
Content: v=BIMI1; l=https://meese.rs/bimi-logo.svg; a=
```

`l=` is the logo URL and must be HTTPS. `a=` is the certificate URL, left empty for the free path. Leaving `a=` present but empty is valid and explicit; omitting it entirely also works.

## The asset

`public/bimi-logo.svg`, served at `https://meese.rs/bimi-logo.svg` as `image/svg+xml`.

It is deliberately not `public/logomark.svg`. BIMI requires the **SVG Tiny Portable/Secure** profile (`draft-svg-tiny-ps-abrotman`), a locked-down subset of SVG Tiny 1.2, and the logomark violates it. The constraints that matter:

- Root element MUST carry `xmlns`, `version="1.2"`, and `baseProfile="tiny-ps"`.
- Root element MUST NOT carry `x` or `y`. (Illustrator's SVG Tiny export adds these; they have to be deleted by hand.)
- Exactly one non-empty `<title>` as a direct child. `<desc>` is recommended.
- Forbidden: `<script>`, `<image>`, `<a>`, `<switch>`, `<foreignObject>`, animation elements, any external reference, and the attributes `zoomAndPan`, `externalResourcesRequired`, `focusable`, `snapshotTime`, `playbackOrder`, `timelineBegin`.
- No CSS. No `<style>` element, no `style=` attribute, no `class=`. Presentation attributes only.
- `role` and `aria-*` are not part of the profile, so the logomark's `role="img" aria-label="meese.rs"` has to go. The required `<title>` is what carries the accessible name.
- SHOULD be under 32 KB uncompressed. Ours is under 2 KB.

Two deliberate design departures from the logomark, both documented in a comment inside the file:

1. **Opaque full-bleed background, no rounded corners.** Clients crop the avatar themselves into a circle, a rounded square, or a square. Transparency renders unpredictably against light and dark client chrome, and pre-rounding the asset would leave bare corners wherever a client crops square.
2. **Edges are `#454B54`, not the logomark's `#30353C`.** This asset is displayed at roughly 40px. At that size the darker stroke disappears and the mark reads as three unconnected dots rather than a constellation.

Geometry is the logomark scaled 4x on a 128x128 viewBox and nudged down 4 units so the content is optically centered, which keeps all three nodes inside a circle crop.

## Order of operations

The asset must be **live** before the record does anything useful. Consumers fetch `l=` on receipt; if it 404s they fall back to the generic avatar, and a negative result can be cached for a while.

1. Merge to `master`. Workers Builds deploys automatically.
2. Confirm `curl -sSI https://meese.rs/bimi-logo.svg` returns `200` and `content-type: image/svg+xml`.
3. Only then does the DNS record matter. (It is already published, so in practice the deploy is the switch that turns this on.)
4. Validate, then send a real test to an Apple Mail, Yahoo, or Fastmail address.

## Validating

`pnpm validate:bimi` (`scripts/validate-bimi-svg.ts`) checks the asset against every constraint above and runs in CI. It is an allowlist: any element or attribute it does not recognise is an error, so a design-tool round-trip fails the build rather than silently shipping a logo mail clients will refuse.

For the record itself, or for a second opinion on the SVG:

- BIMI Group inspector: <https://bimigroup.org/bimi-generator/>
- Sequenzy SVG validator: <https://www.sequenzy.com/tools/bimi-svg-validator>

## Troubleshooting

- **Logo does not appear in Gmail.** Expected. Gmail requires a paid VMC/CMC. Not a misconfiguration.
- **Logo does not appear anywhere.** Check in this order: the asset returns 200 over HTTPS with `image/svg+xml`; DMARC is at `p=quarantine` or better on the org domain; the message actually passed DKIM alignment; the record is on the From subdomain (`mail.meese.rs`) rather than the root.
- **Logo still missing right after deploy.** Consumers cache both the DNS record and a failed logo fetch. Give it a TTL cycle before assuming something is broken.
- **A validator rejects the SVG after an edit.** Almost always a design tool re-adding `x`/`y` to the root, a `style=` attribute, or `role`/`aria-*`. Re-check against the constraint list above.
