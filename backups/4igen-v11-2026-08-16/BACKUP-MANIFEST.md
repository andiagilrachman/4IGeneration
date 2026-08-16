# 4IGeneration — v11 Backup Manifest

Backup date: 2026-08-16
Source package: `4igen-v11-market-history.zip`

## Package

- Version: v11 — Market History + Chart
- Local archive SHA-256: `2db618b2f0a14ec6b5fc7a6e37fd09a40c09f212810f537bc8503d657912a9d1`
- Archive size: 90 KB
- Archive integrity: verified before backup
- Excluded from source package backup: `node_modules/` runtime dependencies

## Included v11 scope

- Historical OHLCV chart API: `/api/stocks/[code]/chart`
- Invezgo chart client
- 180-day default chart range
- `from` / `to` date validation
- 5-minute chart cache
- Research stock chart integration
- Existing fundamental, bank scoring, valuation, scanner, and peer-comparison work from the audited v10 baseline

## Important

This branch is a **backup branch** and does not merge the v11 standalone package into the existing `main` application tree. The v11 archive remains the canonical package for this checkpoint.

The working archive is available from the ChatGPT conversation as `4igen-v11-market-history.zip` and its SHA-256 above can be used to verify that archive.
