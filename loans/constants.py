"""
Domain-level constants for the loans application.

Centralising these values here means:
  - score thresholds, minimum rates, and field constraints are never duplicated
  - a single edit propagates through services, serializers, and views automatically
"""
from decimal import Decimal

# ── Decimal field constraints ─────────────────────────────────────────────────
DECIMAL_MAX_DIGITS: int = 12
DECIMAL_PLACES: int = 2
RATE_MAX_DIGITS: int = 5
RATE_DECIMAL_PLACES: int = 2

# ── Loan amount / rate validation bounds ──────────────────────────────────────
MIN_LOAN_AMOUNT: Decimal = Decimal("0.01")
MIN_INTEREST_RATE: Decimal = Decimal("0.00")

# ── Credit-score slab thresholds ──────────────────────────────────────────────
SCORE_GOOD: int = 50    # score > SCORE_GOOD  → approved, rate as requested
SCORE_FAIR: int = 30    # score > SCORE_FAIR  → approved, min rate = RATE_FAIR
SCORE_LOW: int = 10     # score > SCORE_LOW   → approved, min rate = RATE_LOW
                        # score ≤ SCORE_LOW   → rejected

# ── Minimum corrected interest rates (per slab) ───────────────────────────────
RATE_FAIR: Decimal = Decimal("12")   # minimum rate for credit score 30–50
RATE_LOW: Decimal = Decimal("16")    # minimum rate for credit score 10–30

# ── Affordability cap: total EMI ≤ EMI_SALARY_RATIO × monthly salary ─────────
EMI_SALARY_RATIO: Decimal = Decimal("0.5")

# ── Approved-limit multiplier: limit = monthly_salary × LIMIT_MULTIPLIER ─────
LIMIT_MULTIPLIER: int = 36

# ── Month approximation used for loan end-date calculation (days per month) ───
# NOTE: This is a deliberate 30-day-per-month approximation matching the
# original data ingestion convention. True calendar months would require
# dateutil.relativedelta, which is not in requirements.txt.
DAYS_PER_MONTH: int = 30
