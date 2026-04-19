from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from .constants import DECIMAL_MAX_DIGITS, DECIMAL_PLACES, RATE_MAX_DIGITS, RATE_DECIMAL_PLACES


class Customer(models.Model):
    customer_id = models.IntegerField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    age = models.IntegerField(validators=[MinValueValidator(18)])
    phone_number = models.BigIntegerField()
    monthly_salary = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_PLACES)
    approved_limit = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_PLACES)
    current_debt = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_PLACES, default=0)

    class Meta:
        db_table = 'customers'

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"


class Loan(models.Model):
    loan_id = models.IntegerField(primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='loans', db_column='customer_id')
    loan_amount = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_PLACES)
    tenure = models.IntegerField(validators=[MinValueValidator(1)])
    interest_rate = models.DecimalField(max_digits=RATE_MAX_DIGITS, decimal_places=RATE_DECIMAL_PLACES)
    monthly_repayment = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_PLACES)
    emis_paid_on_time = models.IntegerField(default=0)
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        db_table = 'loans'

    def __str__(self) -> str:
        return f"Loan {self.loan_id}"

    @property
    def remaining_emis(self) -> int:
        """EMIs still outstanding (floored at 0 — never negative)."""
        return max(0, self.tenure - self.emis_paid_on_time)
