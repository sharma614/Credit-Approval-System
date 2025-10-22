from celery import shared_task
import pandas as pd
from decimal import Decimal
from .models import Customer, Loan
import os

@shared_task
def ingest_data():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    customer_file = os.path.join(base_dir, 'data', 'customer_data.xlsx')
    loan_file = os.path.join(base_dir, 'data', 'loan_data.xlsx')
    
    # Ingest customers
    if os.path.exists(customer_file):
        try:
            df = pd.read_excel(customer_file)
            print(f"Loading {len(df)} customers...")
            
            for _, row in df.iterrows():
                Customer.objects.update_or_create(
                    customer_id=int(row['Customer ID']),
                    defaults={
                        'first_name': str(row['First Name']),
                        'last_name': str(row['Last Name']),
                        'age': int(row['Age']),
                        'phone_number': int(row['Phone Number']),
                        'monthly_salary': Decimal(str(row['Monthly Salary'])),
                        'approved_limit': Decimal(str(row['Approved Limit'])),
                        'current_debt': Decimal('0')
                    }
                )
            print(f"Successfully loaded {len(df)} customers")
        except Exception as e:
            print(f"Error loading customers: {str(e)}")
    
    # Ingest loans
    if os.path.exists(loan_file):
        try:
            df = pd.read_excel(loan_file)
            print(f"Loading {len(df)} loans...")
            
            for _, row in df.iterrows():
                try:
                    customer = Customer.objects.get(customer_id=int(row['Customer ID']))
                    start_date = pd.to_datetime(row['Date of Approval']).date()
                    end_date = pd.to_datetime(row['End Date']).date()
                    
                    Loan.objects.update_or_create(
                        loan_id=int(row['Loan ID']),
                        defaults={
                            'customer': customer,
                            'loan_amount': Decimal(str(row['Loan Amount'])),
                            'tenure': int(row['Tenure']),
                            'interest_rate': Decimal(str(row['Interest Rate'])),
                            'monthly_repayment': Decimal(str(row['Monthly payment'])),
                            'emis_paid_on_time': int(row['EMIs paid on Time']),
                            'start_date': start_date,
                            'end_date': end_date
                        }
                    )
                except Customer.DoesNotExist:
                    print(f"Customer {row['Customer ID']} not found for loan {row['Loan ID']}")
                    continue
            
            print(f"Successfully loaded {len(df)} loans")
        except Exception as e:
            print(f"Error loading loans: {str(e)}")
    
    return "Data ingestion completed"
