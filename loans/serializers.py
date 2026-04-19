from rest_framework import serializers
from decimal import Decimal
from .models import Customer, Loan
from .constants import (
    DECIMAL_MAX_DIGITS, DECIMAL_PLACES,
    RATE_MAX_DIGITS, RATE_DECIMAL_PLACES,
    MIN_LOAN_AMOUNT, MIN_INTEREST_RATE,
)


class CustomerSerializer(serializers.ModelSerializer):
    """Read serializer for Customer — exposes `monthly_income` alias."""

    name = serializers.SerializerMethodField()
    monthly_income = serializers.DecimalField(
        source='monthly_salary',
        max_digits=DECIMAL_MAX_DIGITS,
        decimal_places=DECIMAL_PLACES,
    )

    class Meta:
        model = Customer
        fields = ['customer_id', 'name', 'age', 'monthly_income', 'approved_limit', 'phone_number']
        read_only_fields = ['customer_id', 'approved_limit']

    def get_name(self, obj: Customer) -> str:
        return f"{obj.first_name} {obj.last_name}"


class CustomerRegistrationSerializer(serializers.Serializer):
    """Input serializer for POST /register/."""

    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    age = serializers.IntegerField(min_value=18)
    monthly_income = serializers.DecimalField(
        max_digits=DECIMAL_MAX_DIGITS,
        decimal_places=DECIMAL_PLACES,
        min_value=Decimal('0.01'),
    )
    phone_number = serializers.IntegerField()


class LoanRequestSerializer(serializers.Serializer):
    """
    Shared input serializer for both /check-eligibility/ and /create-loan/.

    Both endpoints accept the same four fields with the same validation rules.
    Using a single class prevents the two from drifting apart silently.
    """

    customer_id = serializers.IntegerField()
    loan_amount = serializers.DecimalField(
        max_digits=DECIMAL_MAX_DIGITS,
        decimal_places=DECIMAL_PLACES,
        min_value=MIN_LOAN_AMOUNT,
    )
    interest_rate = serializers.DecimalField(
        max_digits=RATE_MAX_DIGITS,
        decimal_places=RATE_DECIMAL_PLACES,
        min_value=MIN_INTEREST_RATE,
    )
    tenure = serializers.IntegerField(min_value=1)


class LoanDetailSerializer(serializers.ModelSerializer):
    """Read serializer for a single Loan — includes embedded customer snapshot."""

    customer = serializers.SerializerMethodField()
    monthly_installment = serializers.DecimalField(
        source='monthly_repayment',
        max_digits=DECIMAL_MAX_DIGITS,
        decimal_places=DECIMAL_PLACES,
    )

    class Meta:
        model = Loan
        fields = ['loan_id', 'customer', 'loan_amount', 'interest_rate', 'monthly_installment', 'tenure']

    def get_customer(self, obj: Loan) -> dict:
        return {
            'id': obj.customer.customer_id,
            'first_name': obj.customer.first_name,
            'last_name': obj.customer.last_name,
            'phone_number': obj.customer.phone_number,
            'age': obj.customer.age,
        }


class CustomerLoanSerializer(serializers.ModelSerializer):
    """Read serializer for listing a customer's loans."""

    monthly_installment = serializers.DecimalField(
        source='monthly_repayment',
        max_digits=DECIMAL_MAX_DIGITS,
        decimal_places=DECIMAL_PLACES,
    )
    repayments_left = serializers.IntegerField(source='remaining_emis')

    class Meta:
        model = Loan
        fields = ['loan_id', 'loan_amount', 'interest_rate', 'monthly_installment', 'repayments_left', 'tenure']
