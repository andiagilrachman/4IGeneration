"""Stock cache — delegasi ke Redis cache (Week 10).

File ini dipertahankan agar API lama (`from app.services.stock import cache`)
tetap berfungsi; implementasi asli dipindah ke
`app.services.cache.redis_cache` (Redis + fallback disk).
"""

from app.services.cache.redis_cache import (
    clear_all,
    get_cached,
    set_cached,
    stats,
)

__all__ = ["get_cached", "set_cached", "clear_all", "stats"]
