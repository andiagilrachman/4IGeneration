# 4IGeneration Python SDK

Akses Public API 4IGeneration dari Python — data saham IDX & analisis AI.

## Install

```bash
pip install -e packages/sdk-python
```

## Penggunaan

```python
from sdk_python import FourIG

client = FourIG(api_key="4IG_XXXX_YYYY")

# Daftar saham IDX
stocks = client.stocks.list()

# Data saham BBCA
bbca = client.stocks.detail("BBCA")
print(bbca["price"], bbca["roe"])

# Screener fundamental (ROE >= 15%)
hasil = client.analysis.screener(min_roe=0.15, limit=10)

# Analisis 1 saham
analisis = client.analysis.stock("TLKM")
print(analisis["content"])
```
