"""4IGeneration — Data demo untuk screener (fallback saat Yahoo rate-limited).

Data statis yang realistis untuk 28 saham IDX. DIPAKAI HANYA bila fetch
live gagal (semua request Yahoo kena rate-limit). Setiap hasil diberi
label `source: "demo"` agar jelas bukan data real-time.

Saat koneksi normal / di server produksi, data nyata dari yfinance
otomatis terpakai (fallback hanya jalan bila live gagal total).
"""

import time

DEMO_STOCKS: list[dict] = [
    {"ticker": "BBCA", "name": "Bank Central Asia", "sector": "Financials", "price": 6375.0, "trailing_pe": 13.5, "roe": 0.218, "revenue_growth": 0.025, "profit_margin": 0.531, "week52_high": 8975.0, "week52_low": 4820.0},
    {"ticker": "BBRI", "name": "Bank Rakyat Indonesia", "sector": "Financials", "price": 4950.0, "trailing_pe": 10.2, "roe": 0.193, "revenue_growth": 0.088, "profit_margin": 0.312, "week52_high": 6100.0, "week52_low": 3850.0},
    {"ticker": "BBNI", "name": "Bank Negara Indonesia", "sector": "Financials", "price": 4120.0, "trailing_pe": 8.1, "roe": 0.156, "revenue_growth": 0.062, "profit_margin": 0.289, "week52_high": 5400.0, "week52_low": 3200.0},
    {"ticker": "BMRI", "name": "Bank Mandiri", "sector": "Financials", "price": 5600.0, "trailing_pe": 9.8, "roe": 0.205, "revenue_growth": 0.071, "profit_margin": 0.348, "week52_high": 7250.0, "week52_low": 4300.0},
    {"ticker": "TLKM", "name": "Telkom Indonesia", "sector": "Telecommunications", "price": 2480.0, "trailing_pe": 11.9, "roe": 0.187, "revenue_growth": 0.012, "profit_margin": 0.224, "week52_high": 3350.0, "week52_low": 1980.0},
    {"ticker": "ISAT", "name": "Indosat Ooredoo", "sector": "Telecommunications", "price": 10250.0, "trailing_pe": 18.4, "roe": 0.142, "revenue_growth": 0.089, "profit_margin": 0.121, "week52_high": 12800.0, "week52_low": 6100.0},
    {"ticker": "ASII", "name": "Astra International", "sector": "Industrials", "price": 4875.0, "trailing_pe": 9.3, "roe": 0.162, "revenue_growth": 0.054, "profit_margin": 0.117, "week52_high": 6125.0, "week52_low": 3980.0},
    {"ticker": "GGRM", "name": "Gudang Garam", "sector": "Consumer Staples", "price": 18900.0, "trailing_pe": 7.6, "roe": 0.098, "revenue_growth": -0.021, "profit_margin": 0.082, "week52_high": 23500.0, "week52_low": 15100.0},
    {"ticker": "UNVR", "name": "Unilever Indonesia", "sector": "Consumer Staples", "price": 2350.0, "trailing_pe": 24.8, "roe": 0.412, "revenue_growth": -0.043, "profit_margin": 0.154, "week52_high": 3450.0, "week52_low": 1900.0},
    {"ticker": "ICBP", "name": "Indofood CBP", "sector": "Consumer Staples", "price": 10750.0, "trailing_pe": 14.2, "roe": 0.198, "revenue_growth": 0.031, "profit_margin": 0.148, "week52_high": 12400.0, "week52_low": 8400.0},
    {"ticker": "INDF", "name": "Indofood Sukses Makmur", "sector": "Consumer Staples", "price": 5950.0, "trailing_pe": 7.9, "roe": 0.151, "revenue_growth": 0.024, "profit_margin": 0.121, "week52_high": 7200.0, "week52_low": 4800.0},
    {"ticker": "KLBF", "name": "Kalbe Farma", "sector": "Healthcare", "price": 1520.0, "trailing_pe": 19.7, "roe": 0.182, "revenue_growth": 0.046, "profit_margin": 0.142, "week52_high": 1950.0, "week52_low": 1280.0},
    {"ticker": "PGAS", "name": "Perusahaan Gas Negara", "sector": "Energy", "price": 1480.0, "trailing_pe": 8.4, "roe": 0.127, "revenue_growth": 0.038, "profit_margin": 0.158, "week52_high": 1980.0, "week52_low": 1060.0},
    {"ticker": "ADRO", "name": "Adaro Energy", "sector": "Energy", "price": 2750.0, "trailing_pe": 4.8, "roe": 0.312, "revenue_growth": 0.112, "profit_margin": 0.248, "week52_high": 3425.0, "week52_low": 1820.0},
    {"ticker": "PTBA", "name": "Bukit Asam", "sector": "Energy", "price": 2650.0, "trailing_pe": 5.6, "roe": 0.274, "revenue_growth": 0.094, "profit_margin": 0.212, "week52_high": 3150.0, "week52_low": 1650.0},
    {"ticker": "ANTM", "name": "Aneka Tambang", "sector": "Materials", "price": 1620.0, "trailing_pe": 12.3, "roe": 0.118, "revenue_growth": 0.065, "profit_margin": 0.094, "week52_high": 2300.0, "week52_low": 1250.0},
    {"ticker": "INCO", "name": "Vale Indonesia", "sector": "Materials", "price": 4100.0, "trailing_pe": 11.5, "roe": 0.134, "revenue_growth": 0.072, "profit_margin": 0.158, "week52_high": 5450.0, "week52_low": 2850.0},
    {"ticker": "SMGR", "name": "Semen Indonesia", "sector": "Materials", "price": 4150.0, "trailing_pe": 15.2, "roe": 0.072, "revenue_growth": 0.018, "profit_margin": 0.084, "week52_high": 5400.0, "week52_low": 3300.0},
    {"ticker": "JSMR", "name": "Jasa Marga", "sector": "Infrastructure", "price": 3800.0, "trailing_pe": 9.1, "roe": 0.145, "revenue_growth": 0.121, "profit_margin": 0.231, "week52_high": 4600.0, "week52_low": 2700.0},
    {"ticker": "WIKA", "name": "Wijaya Karya", "sector": "Infrastructure", "price": 320.0, "trailing_pe": 22.5, "roe": 0.021, "revenue_growth": -0.115, "profit_margin": 0.012, "week52_high": 690.0, "week52_low": 246.0},
    {"ticker": "ACES", "name": "Ace Hardware Indonesia", "sector": "Retail", "price": 785.0, "trailing_pe": 12.1, "roe": 0.168, "revenue_growth": 0.052, "profit_margin": 0.104, "week52_high": 980.0, "week52_low": 610.0},
    {"ticker": "MAPI", "name": "Mitra Adiperkasa", "sector": "Retail", "price": 1450.0, "trailing_pe": 10.8, "roe": 0.189, "revenue_growth": 0.098, "profit_margin": 0.092, "week52_high": 1850.0, "week52_low": 880.0},
    {"ticker": "TOWR", "name": "Sarana Menara Nusantara", "sector": "Telecommunications", "price": 690.0, "trailing_pe": 9.7, "roe": 0.134, "revenue_growth": 0.034, "profit_margin": 0.412, "week52_high": 950.0, "week52_low": 590.0},
    {"ticker": "CPIN", "name": "Charoen Pokphand", "sector": "Consumer Staples", "price": 5100.0, "trailing_pe": 18.6, "roe": 0.204, "revenue_growth": 0.028, "profit_margin": 0.112, "week52_high": 6200.0, "week52_low": 4300.0},
    {"ticker": "EXCL", "name": "XL Axiata", "sector": "Telecommunications", "price": 2150.0, "trailing_pe": 21.3, "roe": 0.108, "revenue_growth": 0.064, "profit_margin": 0.088, "week52_high": 2650.0, "week52_low": 1600.0},
    {"ticker": "EMTK", "name": "Elang Mahkota Teknologi", "sector": "Media", "price": 615.0, "trailing_pe": 24.1, "roe": 0.061, "revenue_growth": 0.031, "profit_margin": 0.045, "week52_high": 920.0, "week52_low": 505.0},
    {"ticker": "MDKA", "name": "Merdeka Copper Gold", "sector": "Materials", "price": 2620.0, "trailing_pe": 32.4, "roe": 0.058, "revenue_growth": 0.142, "profit_margin": 0.068, "week52_high": 3650.0, "week52_low": 1720.0},
    {"ticker": "TINS", "name": "Timah", "sector": "Materials", "price": 1050.0, "trailing_pe": 14.7, "roe": 0.089, "revenue_growth": 0.052, "profit_margin": 0.061, "week52_high": 1650.0, "week52_low": 780.0},
]

# histori 5 hari sederhana untuk demo (naik/turun deterministik per ticker)
def _build_demo_history(s: dict) -> list[dict]:
    price = s["price"]
    base = price * 0.97
    out = []
    import datetime
    for i in range(5):
        d = (datetime.date.today() - datetime.timedelta(days=4 - i)).isoformat()
        step = base + (price - base) * (i + 1) / 5
        out.append({
            "date": d, "open": round(step * 0.995, 0),
            "high": round(step * 1.01, 0), "low": round(step * 0.99, 0),
            "close": round(step, 0), "volume": 50_000_000 + (i * 1_500_000),
        })
    return out


def get_demo_stocks() -> list[dict]:
    """Kembalikan daftar saham demo lengkap dengan histori."""
    result = []
    for s in DEMO_STOCKS:
        item = dict(s)
        item["history"] = _build_demo_history(s)
        result.append(item)
    return result


DEMO_NOTICE = (
    "⚠️ Data tampilan ini DEMO (Yahoo Finance sedang rate-limited di lingkungan ini). "
    "Struktur & alur fitur sudah sama persis dengan data live — saat koneksi normal, "
    "screener otomatis memakai data real-time."
)
