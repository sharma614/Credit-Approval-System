from rest_framework import serializers
from .models import Customer, Loan
from decimal import Decimal

class CustomerSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    monthly_income = serializers.DecimalField(source='monthly_salary', max_digits=12, decimal_places=2)
    
    class Meta:
        model = Customer
        fields = ['customer_id', 'name', 'age', 'monthly_income', 'approved_limit', 'phone_number']
        read_only_fields = ['customer_id', 'approved_limit']
    
    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

class CustomerRegistrationSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    age = serializers.IntegerField(min_value=18)
    monthly_income = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    phone_number = serializers.IntegerField()

class CheckEligibilitySerializer(serializers.Serializer):
    customer_id = serializers.IntegerField()
    loan_amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    interest_rate = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=Decimal('0.00'))
    tenure = serializers.IntegerField(min_value=1)

class CreateLoanSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField()
    loan_amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    interest_rate = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=Decimal('0.00'))
    tenure = serializers.IntegerField(min_value=1)

class LoanDetailSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    monthly_installment = serializers.DecimalField(source='monthly_repayment', max_digits=12, decimal_places=2)
    
    class Meta:
        model = Loan
        fields = ['loan_id', 'customer', 'loan_amount', 'interest_rate', 'monthly_installment', 'tenure']
    
    def get_customer(self, obj):
        return {
            'id': obj.customer.customer_id,
            'first_name': obj.customer.first_name,
            'last_name': obj.customer.last_name,
            'phone_number': obj.customer.phone_number,
            'age': obj.customer.age
        }

class CustomerLoanSerializer(serializers.ModelSerializer):
    monthly_installment = serializers.DecimalField(source='monthly_repayment', max_digits=12, decimal_places=2)
    repayments_left = serializers.IntegerField(source='remaining_emis')
    
    class Meta:
        model = Loan
        fields = ['loan_id', 'loan_amount', 'interest_rate', 'monthly_installment', 'repayments_left']
