from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from typing import Any
from .models import Customer, Loan
from .serializers import (
    CustomerSerializer,
    CustomerRegistrationSerializer,
    LoanRequestSerializer,
    LoanDetailSerializer,
    CustomerLoanSerializer,
)
from .services import LoanEligibilityChecker, LoanService
from .constants import LIMIT_MULTIPLIER


def get_customer_or_404(customer_id: int) -> tuple[Customer | None, Response | None]:
    """
    Fetch a Customer by primary key.

    Returns (customer, None) on success or (None, 404 Response) on miss.
    Call sites unpack the tuple and return early if the Response is not None.
    """
    try:
        return Customer.objects.get(customer_id=customer_id), None
    except Customer.DoesNotExist:
        return None, Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)


class RegisterCustomerView(APIView):
    def post(self, request: Any) -> Response:
        serializer = CustomerRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        monthly_income: Decimal = data['monthly_income']

        # Approved limit = 36× monthly income, rounded to the nearest lakh (100 000)
        approved_limit = round(
            int((monthly_income * LIMIT_MULTIPLIER).quantize(Decimal('1'))) / 100_000
        ) * 100_000

        # Generate next customer_id (monotonically increasing)
        last_customer = Customer.objects.order_by('-customer_id').first()
        next_customer_id: int = (last_customer.customer_id + 1) if last_customer else 1

        customer = Customer.objects.create(
            customer_id=next_customer_id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            age=data['age'],
            phone_number=data['phone_number'],
            monthly_salary=monthly_income,
            approved_limit=approved_limit,
            current_debt=0,
        )

        return Response(CustomerSerializer(customer).data, status=status.HTTP_201_CREATED)


class CheckEligibilityView(APIView):
    def post(self, request: Any) -> Response:
        serializer = LoanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        customer, error_response = get_customer_or_404(data['customer_id'])
        if error_response:
            return error_response

        eligibility = LoanEligibilityChecker.check_eligibility(
            customer=customer,
            loan_amount=data['loan_amount'],
            interest_rate=data['interest_rate'],
            tenure=data['tenure'],
        )

        return Response({
            'customer_id': customer.customer_id,
            'approval': eligibility['approval'],
            'interest_rate': float(data['interest_rate']),
            'corrected_interest_rate': float(eligibility['corrected_interest_rate']),
            'tenure': data['tenure'],
            'monthly_installment': float(eligibility['monthly_installment']),
        }, status=status.HTTP_200_OK)


class CreateLoanView(APIView):
    def post(self, request: Any) -> Response:
        serializer = LoanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        customer, error_response = get_customer_or_404(data['customer_id'])
        if error_response:
            return error_response

        eligibility = LoanEligibilityChecker.check_eligibility(
            customer=customer,
            loan_amount=data['loan_amount'],
            interest_rate=data['interest_rate'],
            tenure=data['tenure'],
        )

        if not eligibility['approval']:
            return Response({
                'loan_id': None,
                'customer_id': customer.customer_id,
                'loan_approved': False,
                'message': 'Loan not approved',
                'monthly_installment': float(eligibility['monthly_installment']),
            }, status=status.HTTP_200_OK)

        loan = LoanService.create_loan(
            customer=customer,
            loan_amount=data['loan_amount'],
            interest_rate=eligibility['corrected_interest_rate'],
            tenure=data['tenure'],
        )

        return Response({
            'loan_id': loan.loan_id,
            'customer_id': customer.customer_id,
            'loan_approved': True,
            'message': 'Loan approved',
            'monthly_installment': float(loan.monthly_repayment),
        }, status=status.HTTP_201_CREATED)


class ViewLoanView(APIView):
    def get(self, request: Any, loan_id: int) -> Response:
        try:
            loan = Loan.objects.select_related('customer').get(loan_id=loan_id)
        except Loan.DoesNotExist:
            return Response({'error': 'Loan not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(LoanDetailSerializer(loan).data, status=status.HTTP_200_OK)


class ViewCustomerLoansView(APIView):
    def get(self, request: Any, customer_id: int) -> Response:
        customer, error_response = get_customer_or_404(customer_id)
        if error_response:
            return error_response

        loans = Loan.objects.filter(customer=customer)
        return Response(CustomerLoanSerializer(loans, many=True).data, status=status.HTTP_200_OK)
