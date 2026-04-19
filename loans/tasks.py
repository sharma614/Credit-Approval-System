from celery import shared_task
import pandas as pd
from decimal import Decimal, InvalidOperation
from .models import Customer, Loan
import os


def _safe_decimal(value: object) -> Decimal:
    """
    Convert an arbitrary Excel cell value to Decimal.

    Raises ValueError on unconvertible input rather than silently producing 0
    or NaN — a deliberate choice so callers can surface bad rows clearly.
    """
    try:
        return Decimal(str(value))
    except InvalidOperation as exc:
        raise ValueError(f"Cannot convert {value!r} to Decimal") from exc


def _load_excel(path: str) -> pd.DataFrame | None:
    """
    Read an Excel file and return a DataFrame, or None if the file is missing.
    Prints a loading message on success.
    """
    if not os.path.exists(path):
        return None
    df = pd.read_excel(path)
    print(f"Loading {len(df)} rows from {os.path.basename(path)}…")
    return df


@shared_task
def ingest_data() -> str:
    """
    Celery task: populate the database from the Excel seed files in /data/.

    Customer rows are upserted first so that foreign-key references from
    the loan sheet can be resolved. Bad rows are skipped with a printed
    warning rather than aborting the entire import.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    customer_file = os.path.join(base_dir, 'data', 'customer_data.xlsx')
    loan_file = os.path.join(base_dir, 'data', 'loan_data.xlsx')

    # ── Ingest customers ──────────────────────────────────────────────────────
    df = _load_excel(customer_file)
    if df is not None:
        try:
            for _, row in df.iterrows():
                Customer.objects.update_or_create(
                    customer_id=int(row['Customer ID']),
                    defaults={
                        'first_name': str(row['First Name']),
                        'last_name': str(row['Last Name']),
                        'age': int(row['Age']),
                        'phone_number': int(row['Phone Number']),
                        'monthly_salary': _safe_decimal(row['Monthly Salary']),
                        'approved_limit': _safe_decimal(row['Approved Limit']),
                        'current_debt': Decimal('0'),
                    },
                )
            print(f"Successfully loaded {len(df)} customers")
        except (ValueError, KeyError) as exc:
            print(f"Error loading customers: {exc}")

    # ── Ingest loans ──────────────────────────────────────────────────────────
    df = _load_excel(loan_file)
    if df is not None:
        failed = 0
        for _, row in df.iterrows():
            try:
                customer = Customer.objects.get(customer_id=int(row['Customer ID']))
                Loan.objects.update_or_create(
                    loan_id=int(row['Loan ID']),
                    defaults={
                        'customer': customer,
                        'loan_amount': _safe_decimal(row['Loan Amount']),
                        'tenure': int(row['Tenure']),
                        'interest_rate': _safe_decimal(row['Interest Rate']),
                        'monthly_repayment': _safe_decimal(row['Monthly payment']),
                        'emis_paid_on_time': int(row['EMIs paid on Time']),
                        'start_date': pd.to_datetime(row['Date of Approval']).date(),
                        'end_date': pd.to_datetime(row['End Date']).date(),
                    },
                )
            except Customer.DoesNotExist:
                print(f"Skipping loan {row['Loan ID']}: customer {row['Customer ID']} not found")
                failed += 1
            except (ValueError, KeyError) as exc:
                print(f"Skipping loan {row['Loan ID']}: {exc}")
                failed += 1

        success = len(df) - failed
        print(f"Successfully loaded {success}/{len(df)} loans ({failed} skipped)")

    return "Data ingestion completed"
