from decimal import Decimal, ROUND_HALF_UP
from datetime import date, timedelta
from django.db.models import Sum, Q
from .models import Customer, Loan

class CreditScoreCalculator:
    @staticmethod
    def calculate_credit_score(customer):
        loans = Loan.objects.filter(customer=customer)
        current_loans = loans.filter(end_date__gte=date.today())
        current_loan_sum = current_loans.aggregate(total=Sum('loan_amount'))['total'] or Decimal('0')
        
        if current_loan_sum > customer.approved_limit:
            return 0
        
        score = 0
        
        # Factor 1: Payment history (40 points)
        total_emis = 0
        emis_paid_on_time = 0
        for loan in loans:
            total_emis += loan.total_emis
            emis_paid_on_time += loan.emis_paid_on_time
        
        if total_emis > 0:
            payment_ratio = emis_paid_on_time / total_emis
            score += payment_ratio * 40
        
        # Factor 2: Number of loans (20 points)
        loan_count = loans.count()
        if loan_count == 0:
            score += 20
        elif 2 <= loan_count <= 4:
            score += 20
        elif loan_count == 1 or loan_count == 5:
            score += 15
        elif loan_count == 6:
            score += 10
        else:
            score += 5
        
        # Factor 3: Current year activity (20 points)
        current_year = date.today().year
        current_year_loans = loans.filter(Q(start_date__year=current_year) | Q(end_date__year=current_year)).count()
        
        if current_year_loans == 0:
            score += 20
        elif current_year_loans <= 2:
            score += 15
        elif current_year_loans <= 4:
            score += 10
        else:
            score += 5
        
        # Factor 4: Credit utilization (20 points)
        if customer.approved_limit > 0:
            utilization = (current_loan_sum / customer.approved_limit) * 100
            if utilization < 30:
                score += 20
            elif utilization < 50:
                score += 15
            elif utilization < 70:
                score += 10
            else:
                score += 5
        else:
            score += 20
        
        return min(100, max(0, int(score)))

class EMICalculator:
    @staticmethod
    def calculate_emi(principal, annual_rate, tenure_months):
        if annual_rate == 0:
            return principal / tenure_months
        
        monthly_rate = Decimal(annual_rate) / Decimal('12') / Decimal('100')
        numerator = principal * monthly_rate * ((Decimal('1') + monthly_rate) ** tenure_months)
        denominator = ((Decimal('1') + monthly_rate) ** tenure_months) - Decimal('1')
        emi = numerator / denominator
        return emi.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

class LoanEligibilityChecker:
    @staticmethod
    def check_eligibility(customer, loan_amount, interest_rate, tenure):
        credit_score = CreditScoreCalculator.calculate_credit_score(customer)
        current_loans = Loan.objects.filter(customer=customer, end_date__gte=date.today())
        current_emi_sum = current_loans.aggregate(total=Sum('monthly_repayment'))['total'] or Decimal('0')
        proposed_emi = EMICalculator.calculate_emi(loan_amount, interest_rate, tenure)
        total_emi = current_emi_sum + proposed_emi
        emi_threshold = customer.monthly_salary * Decimal('0.5')
        
        if total_emi > emi_threshold:
            return {
                'approval': False,
                'corrected_interest_rate': interest_rate,
                'monthly_installment': proposed_emi,
                'credit_score': credit_score
            }
        
        if credit_score > 50:
            approval = True
            corrected_rate = interest_rate
        elif 30 < credit_score <= 50:
            approval = True
            corrected_rate = Decimal('12') if interest_rate < 12 else interest_rate
        elif 10 < credit_score <= 30:
            approval = True
            corrected_rate = Decimal('16') if interest_rate < 16 else interest_rate
        else:
            approval = False
            corrected_rate = interest_rate
        
        if corrected_rate != interest_rate:
            proposed_emi = EMICalculator.calculate_emi(loan_amount, corrected_rate, tenure)
        
        return {
            'approval': approval,
            'corrected_interest_rate': corrected_rate,
            'monthly_installment': proposed_emi,
            'credit_score': credit_score
        }

class LoanService:
    @staticmethod
    def create_loan(customer, loan_amount, interest_rate, tenure):
        emi = EMICalculator.calculate_emi(loan_amount, interest_rate, tenure)
        start_date = date.today()
        end_date = start_date + timedelta(days=30 * tenure)
        
        # Generate next loan_id
        last_loan = Loan.objects.order_by('-loan_id').first()
        next_loan_id = (last_loan.loan_id + 1) if last_loan else 1

        loan = Loan.objects.create(
            loan_id=next_loan_id,
            customer=customer,
            loan_amount=loan_amount,
            tenure=tenure,
            interest_rate=interest_rate,
            monthly_repayment=emi,
            emis_paid_on_time=0,
            start_date=start_date,
            end_date=end_date
        )
        
        customer.current_debt += loan_amount
        customer.save()
        return loan
