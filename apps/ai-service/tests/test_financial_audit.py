from __future__ import annotations

from math import isclose


def quarter_delta(current_ytd: float, previous_ytd: float | None, quarter: int) -> float:
    """Convert cumulative YTD flow into the standalone quarter flow."""
    if quarter == 1:
        return current_ytd
    if quarter in (2, 3, 4):
        if previous_ytd is None:
            raise ValueError("previous_ytd is required for Q2-Q4")
        return current_ytd - previous_ytd
    raise ValueError("quarter must be 1..4")


def annualization_factor(quarter: int) -> float:
    return {1: 4.0, 2: 2.0, 3: 4.0 / 3.0, 4: 1.0}[quarter]


def annualize_quarter(value: float, quarter: int) -> float:
    return value * annualization_factor(quarter)


def scale_ratio(numerator: float, denominator: float) -> float:
    if denominator == 0:
        raise ZeroDivisionError("denominator must not be zero")
    return numerator / denominator


def cash_flow_reconciles(
    beginning_cash: float,
    cfo: float,
    cfi: float,
    cff: float,
    fx_effect: float,
    ending_cash: float,
    tolerance: float = 1e-6,
) -> bool:
    expected = beginning_cash + cfo + cfi + cff + fx_effect
    return isclose(expected, ending_cash, rel_tol=0.0, abs_tol=tolerance)


def test_ytd_to_quarter_q1_q2_q3_q4() -> None:
    ytd = {1: 100.0, 2: 230.0, 3: 390.0, 4: 540.0}
    previous = None
    quarters = []
    for q in range(1, 5):
        quarters.append(quarter_delta(ytd[q], previous, q))
        previous = ytd[q]
    assert quarters == [100.0, 130.0, 160.0, 150.0]


def test_annualization_is_consistent() -> None:
    assert annualize_quarter(10.0, 1) == 40.0
    assert annualize_quarter(10.0, 2) == 20.0
    assert isclose(annualize_quarter(10.0, 3), 40.0 / 3.0)
    assert annualize_quarter(10.0, 4) == 10.0


def test_scale_anomaly_preserves_ratio() -> None:
    base = scale_ratio(125.0, 1000.0)
    scaled = scale_ratio(125_000_000.0, 1_000_000_000.0)
    assert isclose(base, scaled)


def test_bank_metric_contract() -> None:
    # Bank-only operating metrics are meaningful only for bank rows.
    bank = {"is_bank": True, "nim": 0.059, "ldr": 0.798, "casa_ratio": 0.848}
    non_bank = {"is_bank": False, "nim": None, "ldr": None, "casa_ratio": None}
    assert bank["nim"] is not None
    assert bank["ldr"] is not None
    assert bank["casa_ratio"] is not None
    assert non_bank["nim"] is None
    assert non_bank["ldr"] is None
    assert non_bank["casa_ratio"] is None


def test_cash_flow_full_reconciliation() -> None:
    assert cash_flow_reconciles(
        beginning_cash=1_000.0,
        cfo=250.0,
        cfi=-100.0,
        cff=-50.0,
        fx_effect=5.0,
        ending_cash=1_105.0,
    )


def test_cash_flow_reconciliation_detects_missing_fx() -> None:
    assert not cash_flow_reconciles(
        beginning_cash=1_000.0,
        cfo=250.0,
        cfi=-100.0,
        cff=-50.0,
        fx_effect=5.0,
        ending_cash=1_100.0,
    )
