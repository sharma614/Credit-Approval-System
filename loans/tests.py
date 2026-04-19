from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Customer, Loan
from .services import CreditScoreCalculator, EMICalculator, LoanEligibilityChecker, LoanService
from .serializers import LoanRequestSerializer


class CreditScoreCalculatorTest(TestCase):
    def setUp(self):
        # Create test customer
        self.customer = Customer.objects.create(
            customer_id=1,
            first_name="Test",
            last_name="User",
            age=30,
            phone_number=1234567890,
            monthly_salary=50000,
            approved_limit=1800000,
            current_debt=0
        )

    def test_credit_score_new_customer(self):
        """Test credit score calculation for new customer with no loans"""
        score = CreditScoreCalculator.calculate_credit_score(self.customer)
        self.assertEqual(score, 60)  # New customer gets 60 score (20+20+20)

    def test_credit_score_with_loans(self):
        """Test credit score calculation with existing loans"""
        # Create a loan for the customer
        loan = Loan.objects.create(
            loan_id=1,
            customer=self.customer,
            loan_amount=100000,
            tenure=12,
            interest_rate=10,
            monthly_repayment=8791.59,
            emis_paid_on_time=12,
            start_date="2023-01-01",
            end_date="2024-01-01"
        )

        score = CreditScoreCalculator.calculate_credit_score(self.customer)
        self.assertGreater(score, 0)
        self.assertLessEqual(score, 100)


class EMICalculatorTest(TestCase):
    def test_calculate_emi_zero_interest(self):
        """Test EMI calculation with zero interest rate"""
        principal = Decimal('100000')
        rate = Decimal('0')
        tenure = 12

        emi = EMICalculator.calculate_emi(principal, rate, tenure)
        expected_emi = principal / tenure
        self.assertEqual(emi, expected_emi)

    def test_calculate_emi_with_interest(self):
        """Test EMI calculation with interest rate"""
        principal = Decimal('100000')
        rate = Decimal('12')  # 12%
        tenure = 12

        emi = EMICalculator.calculate_emi(principal, rate, tenure)
        self.assertGreater(emi, principal / tenure)  # EMI should be higher than simple division
        self.assertEqual(emi, Decimal('8884.88'))  # Pre-calculated value


class LoanEligibilityCheckerTest(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create(
            customer_id=2,
            first_name="Eligibility",
            last_name="Test",
            age=25,
            phone_number=9876543210,
            monthly_salary=45000,
            approved_limit=1620000,
            current_debt=0
        )

    def test_eligibility_approved(self):
        """Test loan eligibility for approval"""
        result = LoanEligibilityChecker.check_eligibility(
            self.customer, Decimal('100000'), Decimal('10'), 12
        )

        self.assertTrue(result['approval'])
        self.assertEqual(result['corrected_interest_rate'], Decimal('10'))
        self.assertGreater(result['monthly_installment'], 0)
        self.assertGreaterEqual(result['credit_score'], 0)

    def test_eligibility_rejected_high_emi(self):
        """Test loan eligibility rejection due to high EMI"""
        # Create a scenario where EMI exceeds 50% of monthly salary
        result = LoanEligibilityChecker.check_eligibility(
            self.customer, Decimal('1000000'), Decimal('15'), 12  # Very high amount
        )

        self.assertFalse(result['approval'])


class LoanServiceTest(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create(
            customer_id=3,
            first_name="Loan",
            last_name="Service",
            age=35,
            phone_number=5555555555,
            monthly_salary=60000,
            approved_limit=2160000,
            current_debt=0
        )

    def test_create_loan(self):
        """Test loan creation service"""
        loan_amount = Decimal('200000')
        interest_rate = Decimal('12')
        tenure = 24

        loan = LoanService.create_loan(self.customer, loan_amount, interest_rate, tenure)

        self.assertIsNotNone(loan.loan_id)
        self.assertEqual(loan.customer, self.customer)
        self.assertEqual(loan.loan_amount, loan_amount)
        self.assertEqual(loan.interest_rate, interest_rate)
        self.assertEqual(loan.tenure, tenure)
        self.assertGreater(loan.monthly_repayment, 0)

        # Check customer debt updated
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.current_debt, loan_amount)


class APITestCase(APITestCase):
    def setUp(self):
        self.customer = Customer.objects.create(
            customer_id=100,
            first_name="API",
            last_name="Test",
            age=28,
            phone_number=1111111111,
            monthly_salary=55000,
            approved_limit=1980000,
            current_debt=0
        )

    def test_register_customer(self):
        """Test customer registration API"""
        url = reverse('register')
        data = {
            'first_name': 'New',
            'last_name': 'Customer',
            'age': 26,
            'monthly_income': 50000,
            'phone_number': 2222222222
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check customer was created with auto-generated ID
        customer = Customer.objects.filter(first_name='New', last_name='Customer').first()
        self.assertIsNotNone(customer)
        self.assertIsNotNone(customer.customer_id)

    def test_check_eligibility(self):
        """Test loan eligibility check API"""
        url = reverse('check-eligibility')
        data = {
            'customer_id': self.customer.customer_id,
            'loan_amount': 150000,
            'interest_rate': 11,
            'tenure': 18
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertIn('approval', response_data)
        self.assertIn('monthly_installment', response_data)

    def test_check_eligibility_invalid_customer(self):
        """Test eligibility check with invalid customer ID"""
        url = reverse('check-eligibility')
        data = {
            'customer_id': 99999,  # Non-existent customer
            'loan_amount': 100000,
            'interest_rate': 10,
            'tenure': 12
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()['error'], 'Customer not found')

    def test_create_loan(self):
        """Test loan creation API"""
        url = reverse('create-loan')
        data = {
            'customer_id': self.customer.customer_id,
            'loan_amount': 120000,
            'interest_rate': 9,
            'tenure': 24
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response_data = response.json()
        self.assertIn('loan_id', response_data)
        self.assertEqual(response_data['customer_id'], self.customer.customer_id)

        # Verify loan was created in database
        loan = Loan.objects.filter(customer=self.customer).first()
        self.assertIsNotNone(loan)
        self.assertIsNotNone(loan.loan_id)

    def test_view_loan(self):
        """Test view single loan API"""
        # Create a loan first
        loan = Loan.objects.create(
            loan_id=200,
            customer=self.customer,
            loan_amount=80000,
            tenure=12,
            interest_rate=8,
            monthly_repayment=7044.44,
            emis_paid_on_time=0,
            start_date="2024-01-01",
            end_date="2025-01-01"
        )

        url = reverse('view-loan', kwargs={'loan_id': loan.loan_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(response_data['loan_id'], loan.loan_id)
        self.assertEqual(response_data['customer']['id'], self.customer.customer_id)

    def test_view_loan_not_found(self):
        """Test view loan with invalid loan ID"""
        url = reverse('view-loan', kwargs={'loan_id': 99999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()['error'], 'Loan not found')

    def test_view_customer_loans(self):
        """Test view customer loans API"""
        # Create a loan for the customer
        loan = Loan.objects.create(
            loan_id=300,
            customer=self.customer,
            loan_amount=90000,
            tenure=18,
            interest_rate=10,
            monthly_repayment=5764.44,
            emis_paid_on_time=5,
            start_date="2024-01-01",
            end_date="2025-07-01"
        )

        url = reverse('view-loans', kwargs={'customer_id': self.customer.customer_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertIsInstance(response_data, list)
        self.assertGreater(len(response_data), 0)

        # Check loan data
        loan_data = response_data[0]
        self.assertEqual(loan_data['loan_id'], loan.loan_id)
        self.assertEqual(loan_data['loan_amount'], '90000.00')

    def test_view_customer_loans_not_found(self):
        """Test view customer loans with invalid customer ID"""
        url = reverse('view-loans', kwargs={'customer_id': 99999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()['error'], 'Customer not found')
