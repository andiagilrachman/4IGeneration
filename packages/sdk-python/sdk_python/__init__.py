"""4IGeneration Python SDK — Public API.

Contoh:
    from sdk_python import FourIG
    client = FourIG(api_key="4IG_XXXX_YYYY")
    data = client.stocks.detail("BBCA")
"""

from __future__ import annotations

import json
from typing import Any
from urllib.request import Request, urlopen
from urllib.error import HTTPError

DEFAULT_BASE_URL = "http://localhost:3001/api/v1"


class FourIGError(Exception):
    def __init__(self, status: int, code: str, message: str):
        super().__init__(message)
        self.status = status
        self.code = code


class FourIG:
    def __init__(self, api_key: str, base_url: str = DEFAULT_BASE_URL):
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self.stocks = Stocks(self)
        self.analysis = Analysis(self)

    def request(self, method: str, path: str, body: dict | None = None) -> Any:
        url = f"{self._base_url}{path}"
        data = json.dumps(body).encode() if body is not None else None
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": self._api_key,
        }
        req = Request(url, data=data, headers=headers, method=method)
        try:
            with urlopen(req, timeout=60) as resp:
                payload = json.loads(resp.read().decode())
        except HTTPError as e:
            raw = e.read().decode()
            try:
                err = json.loads(raw).get("error", {})
            except json.JSONDecodeError:
                err = {"code": "HTTP_ERROR", "message": raw[:200]}
            raise FourIGError(e.code, err.get("code", "HTTP_ERROR"), err.get("message", str(e))) from e
        if not payload.get("success", False):
            err = payload.get("error", {})
            raise FourIGError(400, err.get("code", "ERROR"), err.get("message", "Request gagal"))
        return payload.get("data")


class Stocks:
    def __init__(self, client: FourIG):
        self._client = client

    def list(self) -> list[dict]:
        return self._client.request("GET", "/public/stocks")

    def detail(self, ticker: str) -> dict:
        return self._client.request("GET", f"/public/stocks/{ticker.upper()}")


class Analysis:
    def __init__(self, client: FourIG):
        self._client = client

    def screener(
        self,
        sector: str | None = None,
        max_pe: float | None = None,
        min_roe: float | None = None,
        limit: int = 10,
        analyze: bool = False,
    ) -> dict:
        return self._client.request(
            "POST",
            "/public/analysis/screener",
            {
                "sector": sector,
                "max_pe": max_pe,
                "min_roe": min_roe,
                "limit": limit,
                "analyze": analyze,
            },
        )

    def stock(self, ticker: str) -> dict:
        return self._client.request("POST", "/public/analysis/stock", {"ticker": ticker.upper()})
