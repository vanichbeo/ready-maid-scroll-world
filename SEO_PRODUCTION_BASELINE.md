# Ready Maid Production Baseline Lock

Authoritative visual reference:

- Historical Vercel reference deployment: `dpl_CRSeYnh13Kdijyg2L45pgBA5pdm1`
- Reference URL: `https://ready-maid-scroll-world-ns4s804uw-readymaid.vercel.app`
- Purpose: approved Meet DUKE homepage with DUKE hero, six video thumbnails and built-in video player.

## Source of truth

The production source of truth is the current GitHub `main` branch. The CRSe deployment is a visual/reference baseline only. Do not proxy, rewrite, or route the whole production site to the historical deployment.

## Locked production rule

Automated SEO/AEO work must not replace, rebuild, restyle, reorder or remove the Meet DUKE homepage implementation without explicit approval.

The following are locked:

- Meet DUKE section markup and section order.
- DUKE hero/photo/frame proportions.
- Six DUKE video cards and their responsive grid.
- DUKE video modal/player behavior.
- DUKE thumbnails and video asset paths.
- Meet DUKE CSS classes including `.duke-klcc-*`, `.duke-video-*` and related responsive rules.
- The inline `meet-duke-production-lock` sizing block in `index.html` unless an explicitly approved visual change is being made.

## SEO work allowed

SEO automation may update metadata, canonical tags, structured data, sitemap, robots directives, internal links, refund/fees/legal pages, location pages, service pages, guides and other non-visual SEO content, provided the locked Meet DUKE homepage implementation is preserved.

## Mandatory compliance pages

The SEO system must keep these live, indexable and internally linked:

- `/refund-policy/`
- `/fees-payment-replacement-policy/`
- `/licence-company-verification/`
- `/contact-ready-maid/`
- `/domestic-helper-faq/`

`/refund-policy/` and `/fees-payment-replacement-policy/` must remain present in `sitemap.xml` and visible from the homepage footer.

## Vercel rule

`vercel.json` is for headers, CSP and approved redirects only. It must not contain a catch-all rewrite to an old deployment. Meet DUKE video media from the reference deployment must remain permitted by CSP while those asset URLs are in use.

Any future production baseline change requires explicit approval and visual QA before deployment.
