# Final Financial Audit — 2026-08-16

## Scope

Final checkpoint for the financial normalization work. Financial calculation logic is intentionally not modified by this checkpoint.

## Regression coverage

- Non-bank contract: bank-only NIM/LDR/CASA fields must not be fabricated for non-bank issuers.
- YTD → standalone quarter: Q1 = YTD Q1; Q2 = YTD Q2 − YTD Q1; Q3 = YTD Q3 − YTD Q2; Q4 = FY − YTD Q3.
- Annualization: Q1 ×4, H1 ×2, 9M ×4/3, FY ×1.
- Scale anomaly: multiplying numerator and denominator by the same factor must preserve the ratio.
- Cash-flow reconciliation: beginning cash + CFO + CFI + CFF + FX effect = ending cash.
- Balance-sheet values remain point-in-time and are not YTD-delta converted.

## Implemented

`apps/ai-service/tests/test_financial_audit.py` contains deterministic regression tests for the rules above.

`apps/admin/package.json` now explicitly includes `@types/node` so the Vite/React TypeScript environment has Node globals available without relying on transitive dependencies. No financial source file was changed.

## Live-data status

The GitHub backup branch contains the v11 application source, but the exact live `/api/stocks/:code/fundamental` implementation and its live financial payload are not present in that branch's visible source tree. Therefore a live non-bank/Q4/cash-flow HTTP verification cannot honestly be marked PASS from GitHub alone.

The deterministic regression suite protects the conversion/reconciliation rules, while live endpoint verification must be run against the working archive/environment that exposes the fundamental endpoint.

## Release gate

Do not label the financial endpoint itself as fully live-regression-verified until the working archive returns at least one non-bank issuer and one Q4/FY dataset through the actual endpoint, and the full cash-flow fields required for reconciliation are present.
