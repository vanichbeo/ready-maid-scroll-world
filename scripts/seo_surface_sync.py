#!/usr/bin/env python3
"""Verify published guide discovery surfaces stay synchronized.

Scans guides/*/index.html (excluding guides/index.html), extracts each page's
canonical URL and <title>, and verifies every published guide is represented
in both guides/index.html and sitemap.xml. Designed for --check in CI.
"""
from __future__ import annotations

import argparse
import html
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
GUIDES = ROOT / "guides"
HUB = GUIDES / "index.html"
SITEMAP = ROOT / "sitemap.xml"
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.I | re.S)
CANON_RE = re.compile(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', re.I)
HREF_RE = re.compile(r'href=["\']([^"\']+)["\']', re.I)
LOC_RE = re.compile(r"<loc>(.*?)</loc>", re.I | re.S)


def clean_title(raw: str) -> str:
    text = html.unescape(re.sub(r"\s+", " ", raw)).strip()
    return re.sub(r"\s*\|\s*Ready Maid.*$", "", text, flags=re.I).strip()


def published_guides():
    out = []
    for page in sorted(GUIDES.glob("*/index.html")):
        text = page.read_text(encoding="utf-8")
        title_m = TITLE_RE.search(text)
        canon_m = CANON_RE.search(text)
        if not title_m or not canon_m:
            raise SystemExit(f"Missing title/canonical: {page.relative_to(ROOT)}")
        canonical = canon_m.group(1).strip()
        path = urlparse(canonical).path
        if not path.startswith("/guides/") or path == "/guides/":
            raise SystemExit(f"Unexpected guide canonical: {canonical}")
        out.append((path, clean_title(title_m.group(1)), canonical))
    return out


def check() -> int:
    hub = HUB.read_text(encoding="utf-8")
    sitemap = SITEMAP.read_text(encoding="utf-8")
    hrefs = set(HREF_RE.findall(hub))
    locs = {html.unescape(x.strip()) for x in LOC_RE.findall(sitemap)}
    errors = []
    guides = published_guides()
    for path, title, canonical in guides:
        if path not in hrefs:
            errors.append(f"hub missing {path} ({title})")
        if canonical not in locs:
            errors.append(f"sitemap missing {canonical}")
    guide_hrefs = {h for h in hrefs if h.startswith('/guides/') and h != '/guides/'}
    valid_paths = {g[0] for g in guides}
    for path in sorted(guide_hrefs - valid_paths):
        errors.append(f"hub has stale/nonexistent guide link {path}")
    if errors:
        print("SEO surface sync FAILED")
        for err in errors:
            print(f"- {err}")
        return 1
    print(f"SEO surface sync PASS: {len(guides)} published guides represented in hub and sitemap")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.parse_args()
    return check()


if __name__ == "__main__":
    sys.exit(main())
