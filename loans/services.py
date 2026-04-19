from decimal import Decimal, ROUND_HALF_UP
from datetime import date, timedelta
from typing import Any
from django.db.models import Sum, Q, QuerySet
from .models import Customer, Loan
from .constants import (
    SCORE_GOOD, SCORE_FAIR, SCORE_LOW,
    RATE_FAIR, RATE_LOW,
    EMI_SALARY_RATIO,
    DAYS_PER_MONTH,
)


class CreditScoreCalculator:
    @staticmethod
    def calculate_credit_score(customer: Customer) -> int:
        """
        Compute a 0–100 credit score based on four equally-weighted factors:
          1. Payment history     (40 pts) — on-time EMI ratio
          2. Number of loans     (20 pts) — sweet spot is 0 or 2–4 loans
          3. Current-year loans  (20 pts) — fresh credit usage
          4. Credit utilisation  (20 pts) — current balance vs approved limit

        Returns 0 immediately if the customer is already over their approved limit.
        """
        loans: QuerySet = Loan.objects.filter(customer=customer)
        current_loans: QuerySet = loans.filter(end_date__gte=date.today())
        current_loan_sum: Decimal = (
            current_loans.aggregate(total=Sum('loan_amount'))['total'] or Decimal('0')
        )

        if current_loan_sum > customer.approved_limit:
            return 0

        score: float = 0.0

        # Factor 1: Payment history (40 points)
        total_emis: int = 0
        emis_paid_on_time: int = 0
        for loan in loans:
            total_emis += loan.tenure          # total_emis property was just loan.tenure
            emis_paid_on_time += loan.emis_paid_on_time

        if total_emis > 0:
            payment_ratio = emis_paid_on_time / total_emis
            score += payment_ratio * 40

        # Factor 2: Number of loans (20 points)
        loan_count: int = loans.count()
        if loan_count == 0:
            score += 20
        elif 2 <= loan_count <= 4:
            score += 20
        elif loan_count in (1, 5):
            score += 15
        elif loan_count == 6:
            score += 10
        else:
            score += 5

        # Factor 3: Current year activity (20 points)
        current_year: int = date.today().year
        current_year_loans: int = loans.filter(
            Q(start_date__year=current_year) | Q(end_date__year=current_year)
        ).count()

        if current_year_loans == 0:
            score += 20
        elif current_year_loans <= 2:
            score += 15
        elif current_year_loans <= 4:
            score += 10
        else:
            score += 5

        # Factor 4: Credit utilisation (20 points)
        if customer.approved_limit > 0:
            utilisation = (current_loan_sum / customer.approved_limit) * 100
            if utilisation < 30:
                score += 20
            elif utilisation < 50:
                score += 15
            elif utilisation < 70:
                score += 10
            else:
                score += 5
        else:
            score += 20

        return min(100, max(0, int(score)))


class EMICalculator:
    @staticmethod
    def calculate_emi(principal: Decimal, annual_rate: Decimal, tenure_months: int) -> Decimal:
        """
        Standard reducing-balance EMI formula.

        When annual_rate is 0 the formula is undefined; we fall back to a
        simple equal-instalment split instead.
        """
        if annual_rate == 0:
            return principal / tenure_months

        monthly_rate = Decimal(annual_rate) / Decimal('12') / Decimal('100')
        factor = (Decimal('1') + monthly_rate) ** tenure_months
        numerator = principal * monthly_rate * factor
        denominator = factor - Decimal('1')
        emi = numerator / denominator
        return emi.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


class LoanEligibilityChecker:
    @staticmethod
    def check_eligibility(
        customer: Customer,
        loan_amount: Decimal,
        interest_rate: Decimal,
        tenure: int,
    ) -> dict[str, Any]:
        """
        Determine whether a customer qualifies for a loan and at what rate.

        Returns a dict with keys:
          approval (bool), corrected_interest_rate (Decimal),
          monthly_installment (Decimal), credit_score (int)
        """
        credit_score: int = CreditScoreCalculator.calculate_credit_score(customer)

        # Reuse the same queryset to avoid a second DB round-trip
        current_loans: QuerySet = Loan.objects.filter(customer=customer, end_date__gte=date.today())
        current_emi_sum: Decimal = (
            current_loans.aggregate(total=Sum('monthly_repayment'))['total'] or Decimal('0')
        )

        proposed_emi: Decimal = EMICalculator.calculate_emi(loan_amount, interest_rate, tenure)
        total_emi: Decimal = current_emi_sum + proposed_emi
        emi_threshold: Decimal = customer.monthly_salary * EMI_SALARY_RATIO

        # Hard affordability gate — checked before scoring
        if total_emi > emi_threshold:
            return {
                'approval': False,
                'corrected_interest_rate': interest_rate,
                'monthly_installment': proposed_emi,
                'credit_score': credit_score,
            }

        # Credit-score slab decision
        if credit_score > SCORE_GOOD:
            approval = True
            corrected_rate = interest_rate
        elif credit_score > SCORE_FAIR:
            approval = True
            corrected_rate = RATE_FAIR if interest_rate < RATE_FAIR else interest_rate
        elif credit_score > SCORE_LOW:
            approval = True
            corrected_rate = RATE_LOW if interest_rate < RATE_LOW else interest_rate
        else:
            approval = False
            corrected_rate = interest_rate

        if corrected_rate != interest_rate:
            proposed_emi = EMICalculator.calculate_emi(loan_amount, corrected_rate, tenure)

        return {
            'approval': approval,
            'corrected_interest_rate': corrected_rate,
            'monthly_installment': proposed_emi,
            'credit_score': credit_score,
        }


class LoanService:
    @staticmethod
    def create_loan(
        customer: Customer,
        loan_amount: Decimal,
        interest_rate: Decimal,
        tenure: int,
    ) -> Loan:
        """
        Persist a new Loan and update the customer's current_debt.

        End-date is calculated as start_date + (tenure × DAYS_PER_MONTH).
        See constants.DAYS_PER_MONTH for the 30-day-month rationale.
        """
        emi: Decimal = EMICalculator.calculate_emi(loan_amount, interest_rate, tenure)
        start_date: date = date.today()
        end_date: date = start_date + timedelta(days=DAYS_PER_MONTH * tenure)

        # Generate next loan_id (monotonically increasing, not concurrent-safe —
        # acceptable for this single-worker deployment).
        last_loan = Loan.objects.order_by('-loan_id').first()
        next_loan_id: int = (last_loan.loan_id + 1) if last_loan else 1

        loan: Loan = Loan.objects.create(
            loan_id=next_loan_id,
            customer=customer,
            loan_amount=loan_amount,
            tenure=tenure,
            interest_rate=interest_rate,
            monthly_repayment=emi,
            emis_paid_on_time=0,
            start_date=start_date,
            end_date=end_date,
        )

        customer.current_debt += loan_amount
        customer.save()
        return loan
