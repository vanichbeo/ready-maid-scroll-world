# Ready Maid Production Baseline Lock

Authoritative production visual baseline:

- Vercel deployment ID: `dpl_CRSeYnh13Kdijyg2L45pgBA5pdm1`
- Deployment URL: `https://ready-maid-scroll-world-ns4s804uw-readymaid.vercel.app`
- Purpose: approved Meet DUKE homepage with DUKE hero, six video thumbnails and built-in video player.

## Locked production rule

Automated SEO/AEO work must not replace, rebuild, restyle, reorder or remove the Meet DUKE homepage implementation without explicit approval.

The following are visual baseline elements and must be treated as locked:

- Meet DUKE section markup and section order.
- DUKE hero/photo/frame proportions.
- Six DUKE video cards and their responsive grid.
- DUKE video modal/player behavior.
- DUKE thumbnails and video asset paths.
- Meet DUKE CSS classes including `.duke-klcc-*`, `.duke-video-*` and related responsive rules.

## SEO work allowed

SEO automation may work on metadata, canonical tags, structured data, sitemap, robots directives, internal SEO/content pages, and other non-visual SEO changes provided the locked homepage visual implementation is preserved.

## Production routing

`vercel.json` pins production to the immutable deployment above. Do not remove or change that routing as part of automated SEO work. A production baseline change requires explicit approval and visual QA first.
