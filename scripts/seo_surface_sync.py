#!/usr/bin/env python3
"""Verify every published guide is discoverable in sitemap.xml.

Auto SEO treats existing Readymaid pages, including guides/index.html, as immutable.
New guides are therefore required in sitemap.xml but are not allowed to rewrite the hub.
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
LINK_TAG_RE = re.compile(r"<link\b[^>]*>", re.I)
ATTR_RE = re.compile(r"([:\w-]+)\s*=\s*([\"'])(.*?)\2", re.I | re.S)
HREF_RE = re.compile(r'href=["\']([^"\']+)["\']', re.I)
LOC_RE = re.compile(r"<loc>(.*?)</loc>", re.I | re.S)


def clean_title(raw: str) -> str:
    text = html.unescape(re.sub(r"\s+", " ", raw)).strip()
    return re.sub(r"\s*\|\s*Ready Maid.*$", "", text, flags=re.I).strip()


def canonical_from_html(text: str) -> str | None:
    for tag in LINK_TAG_RE.findall(text):
        attrs = {name.lower(): value for name, _, value in ATTR_RE.findall(tag)}
        rel_tokens = {token.lower() for token in attrs.get("rel", "").split()}
        if "canonical" in rel_tokens and attrs.get("href"):
            return attrs["href"].strip()
    return None


def published_guides():
    out = []
    for page in sorted(GUIDES.glob("*/index.html")):
        text = page.read_text(encoding="utf-8")
        title_m = TITLE_RE.search(text)
        canonical = canonical_from_html(text)
        if not title_m or not canonical:
            raise SystemExit(f"Missing title/canonical: {page.relative_to(ROOT)}")
        path = urlparse(canonical).path
        if not path.startswith("/guides/") or path == "/guides/":
            raise SystemExit(f"Unexpected guide canonical: {canonical}")
        out.append((path, clean_title(title_m.group(1)), canonical))
    return out


def check() -> int:
    sitemap = SITEMAP.read_text(encoding="utf-8")
    locs = {html.unescape(x.strip()) for x in LOC_RE.findall(sitemap)}
    errors = []
    guides = published_guides()
    for path, title, canonical in guides:
        if canonical not in locs:
            errors.append(f"sitemap missing {canonical}")
    if errors:
        print("SEO surface sync FAILED")
        for err in errors:
            print(f"- {err}")
        return 1
    print(f"SEO surface sync PASS: {len(guides)} published guides represented in sitemap")
    return 0

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.parse_args()
    return check()


if __name__ == "__main__":
    sys.exit(main())
