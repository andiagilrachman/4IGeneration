"""4IGeneration — News Fetcher (Google News RSS).

Mengambil berita pasar modal Indonesia real-time (gratis, tanpa API key).
Referensi blueprint BAGIAN 11: Google News (scraping/RSS) — best for berita lokal.

Dipakai oleh: Market Recap (W19-20) — berita + sentiment + ringkasan harian.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)

QUERIES = {
    "ihsg": "IHSG",
    "saham": "saham IDX",
    "saham_bluechip": "saham blue chip",
    "rupiah": "rupiah kurs",
    "ekonomi": "ekonomi Indonesia",
}

RSS_URL = "https://news.google.com/rss/search?q={query}&hl=id&gl=ID&ceid=ID:id"


@dataclass
class NewsItem:
    title: str
    link: str
    published: str
    source: str = "Google News"

    def to_dict(self) -> dict[str, str]:
        return {
            "title": self.title,
            "link": self.link,
            "published": self.published,
            "source": self.source,
        }


def fetch_news(topic: str = "saham", limit: int = 10) -> list[dict[str, str]]:
    """Ambil berita terbaru untuk satu topik (Google News RSS)."""
    import feedparser

    query = QUERIES.get(topic, QUERIES["saham"])
    try:
        feed = feedparser.parse(RSS_URL.format(query=query))
        items: list[dict[str, str]] = []
        for e in feed.entries[:limit]:
            items.append(
                NewsItem(
                    title=e.get("title", ""),
                    link=e.get("link", ""),
                    published=e.get("published", ""),
                ).to_dict()
            )
        return items
    except Exception as exc:  # noqa: BLE001
        logger.warning("Gagal fetch berita %s: %s", topic, exc)
        return []


def fetch_news_multiple(topics: list[str] | None = None, per_topic: int = 5) -> list[dict[str, str]]:
    """Ambil berita dari beberapa topik, digabung & diurutkan (laporan harian)."""
    topics = topics or list(QUERIES.keys())
    all_items: list[dict[str, str]] = []
    for t in topics:
        all_items.extend(fetch_news(t, limit=per_topic))
    # dedup by title
    seen: set[str] = set()
    unique: list[dict[str, str]] = []
    for item in all_items:
        key = item["title"].lower()
        if key not in seen:
            seen.add(key)
            unique.append(item)
    return unique[:20]
