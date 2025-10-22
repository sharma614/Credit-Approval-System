from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from .models import Customer, Loan
from .serializers import (
    CustomerSerializer, CustomerRegistrationSerializer,
    CheckEligibilitySerializer, CreateLoanSerializer,
    LoanDetailSerializer, CustomerLoanSerializer
)
from .services import LoanEligibilityChecker, LoanService

class RegisterCustomerView(APIView):
    def post(self, request):
        serializer = CustomerRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        monthly_income = data['monthly_income']
        approved_limit = (monthly_income * 36).quantize(Decimal('1'))
        approved_limit = round(approved_limit / 100000) * 100000
        
        # Generate next customer_id
        last_customer = Customer.objects.order_by('-customer_id').first()
        next_customer_id = (last_customer.customer_id + 1) if last_customer else 1

        customer = Customer.objects.create(
            customer_id=next_customer_id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            age=data['age'],
            phone_number=data['phone_number'],
            monthly_salary=monthly_income,
            approved_limit=approved_limit,
            current_debt=0
        )
        
        response_serializer = CustomerSerializer(customer)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class CheckEligibilityView(APIView):
    def post(self, request):
        serializer = CheckEligibilitySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        try:
            customer = Customer.objects.get(customer_id=data['customer_id'])
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        
        eligibility = LoanEligibilityChecker.check_eligibility(
            customer=customer,
            loan_amount=data['loan_amount'],
            interest_rate=data['interest_rate'],
            tenure=data['tenure']
        )
        
        response_data = {
            'customer_id': customer.customer_id,
            'approval': eligibility['approval'],
            'interest_rate': float(data['interest_rate']),
            'corrected_interest_rate': float(eligibility['corrected_interest_rate']),
            'tenure': data['tenure'],
            'monthly_installment': float(eligibility['monthly_installment'])
        }
        return Response(response_data, status=status.HTTP_200_OK)

class CreateLoanView(APIView):
    def post(self, request):
        serializer = CreateLoanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        try:
            customer = Customer.objects.get(customer_id=data['customer_id'])
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        
        eligibility = LoanEligibilityChecker.check_eligibility(
            customer=customer,
            loan_amount=data['loan_amount'],
            interest_rate=data['interest_rate'],
            tenure=data['tenure']
        )
        
        if not eligibility['approval']:
            response_data = {
                'loan_id': None,
                'customer_id': customer.customer_id,
                'loan_approved': False,
                'message': 'Loan not approved',
                'monthly_installment': float(eligibility['monthly_installment'])
            }
            return Response(response_data, status=status.HTTP_200_OK)
        
        loan = LoanService.create_loan(
            customer=customer,
            loan_amount=data['loan_amount'],
            interest_rate=eligibility['corrected_interest_rate'],
            tenure=data['tenure']
        )
        
        response_data = {
            'loan_id': loan.loan_id,
            'customer_id': customer.customer_id,
            'loan_approved': True,
            'message': 'Loan approved',
            'monthly_installment': float(loan.monthly_repayment)
        }
        return Response(response_data, status=status.HTTP_201_CREATED)

class ViewLoanView(APIView):
    def get(self, request, loan_id):
        try:
            loan = Loan.objects.select_related('customer').get(loan_id=loan_id)
        except Loan.DoesNotExist:
            return Response({'error': 'Loan not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = LoanDetailSerializer(loan)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ViewCustomerLoansView(APIView):
    def get(self, request, customer_id):
        try:
            customer = Customer.objects.get(customer_id=customer_id)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        
        loans = Loan.objects.filter(customer=customer)
        serializer = CustomerLoanSerializer(loans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
