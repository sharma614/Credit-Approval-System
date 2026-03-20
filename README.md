# 🏦 Credit Approval System

![Django](https://img.shields.io/badge/Django-4.2.7-092E20?style=flat-square&logo=django)
![DRF](https://img.shields.io/badge/DRF-3.14.0-red?style=flat-square&logo=django)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![Celery](https://img.shields.io/badge/Celery-5.3.4-37814A?style=flat-square&logo=celery)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

A full-stack **Credit Approval System** built with a **Django REST API** backend and a **Vite + React** frontend. The system supports customer registration, credit score evaluation using a 4-factor model, loan eligibility checks, loan disbursement, and loan history tracking.

---

## 📐 Architecture

```mermaid
graph TD
    FE["🖥️ React Frontend<br/>Vite (port 5173)"]
    NX["Vite Dev Proxy<br/>/api → :8000"]
    DRF["Django REST Framework<br/>(port 8000)"]
    PG["PostgreSQL<br/>Database"]
    CW["Celery Worker<br/>(Async Tasks)"]
    RD["Redis<br/>(Message Broker)"]

    FE -->|HTTP/JSON| NX
    NX -->|Proxied| DRF
    DRF -->|ORM| PG
    DRF -->|Enqueue Task| RD
    RD -->|Consume| CW
    CW -->|Write| PG
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **Customer Registration** | Auto-computes credit limit as `36 × monthly income`, rounded to nearest lakh |
| **4-Factor Credit Score** | Weighted model: payment history (40%), loan count (20%), current-year activity (20%), utilization (20%) |
| **Loan Eligibility Check** | Evaluates credit score slabs + EMI affordability (≤ 50% of salary) |
| **Interest Rate Correction** | Automatically adjusts rate to slab minimum if requested rate is too low |
| **Loan Disbursement** | Creates loans with auto-assigned IDs and EMI calculation |
| **Loan History** | View per-loan detail or full customer loan portfolio with repayment progress |
| **Async Data Import** | Celery tasks ingest `customer_data.xlsx` and `loan_data.xlsx` on startup |
| **React UI** | Dark-mode glassmorphism frontend with dashboard, forms, and data visualizations |

---

## 🖼️ Screenshots & Demo

### 🎬 Live Demo

![CreditFlow UI Demo](docs/screenshots/demo.webp)

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

*System overview with stats grid, quick-action cards, and credit score slab reference table*

### Register Customer

![Register Customer](docs/screenshots/register.png)

*5-field customer registration form — credit limit is auto-computed on submission*

### Create Loan

![Create Loan](docs/screenshots/create_loan.png)

*Loan creation form with inline eligibility hint and EMI display on result*

---

## 🧮 Credit Score Algorithm

The credit score (0–100) is computed from four weighted factors:

```
Score = Payment History (40pts) + Loan Count (20pts) + Current Year Activity (20pts) + Credit Utilization (20pts)
```

**Slab → Decision:**

| Score | Decision | Min Interest Rate |
|---|---|---|
| > 50 | ✅ Approved | As requested |
| 30 – 50 | ✅ Approved | 12% |
| 10 – 30 | ✅ Approved | 16% |
| < 10 | ❌ Rejected | — |

> **Note:** Even if the credit score qualifies, the loan is rejected if:  
> `(existing EMIs + proposed EMI) > 50% of monthly salary`

> **Note:** If current outstanding loans > approved credit limit, score is forced to **0**.

---

## 🗂️ Project Structure

```
Credit-Approval-System/
├── credit_system/          # Django project settings & config
│   ├── settings.py
│   ├── urls.py
│   └── celery.py           # Celery app configuration
├── loans/                  # Core Django app
│   ├── models.py           # Customer & Loan models
│   ├── serializers.py      # DRF serializers
│   ├── views.py            # API views (5 endpoints)
│   ├── services.py         # Credit score, EMI calculation, eligibility logic
│   ├── tasks.py            # Celery async data ingestion tasks
│   └── urls.py             # App URL routing
├── data/
│   ├── customer_data.xlsx  # Seed data: 300 customers
│   └── loan_data.xlsx      # Seed data: 1000 loans
├── frontend/               # Vite + React UI
│   ├── src/
│   │   ├── api/client.js   # Axios client (all 5 endpoints)
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── RegisterCustomer.jsx
│   │   │   ├── CheckEligibility.jsx
│   │   │   ├── CreateLoan.jsx
│   │   │   ├── ViewLoan.jsx
│   │   │   └── ViewCustomerLoans.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css       # Dark-mode design system
│   └── vite.config.js      # Proxy: /api → localhost:8000
├── scripts/
│   └── entrypoint.sh       # Docker entrypoint
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

---

## 🚀 Quick Start

### Option A — Docker Compose (Recommended)

> Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
# 1. Clone the repo
git clone https://github.com/sharma614/Credit-Approval-System.git
cd Credit-Approval-System

# 2. Start all services (Django + PostgreSQL + Redis + Celery Worker)
docker compose up --build

# 3. In a new terminal, start the React frontend
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

### Option B — Local Development (Manual)

#### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Node.js 18+

#### Backend Setup

```bash
# Create & activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create a PostgreSQL database
psql -U postgres -c "CREATE DATABASE credit_db;"

# Configure environment variables (create .env or export directly)
export DATABASE_URL=postgresql://postgres:password@localhost:5432/credit_db
export REDIS_URL=redis://localhost:6379

# Apply migrations
python manage.py migrate

# Start Celery worker (loads seed data from Excel files on startup)
celery -A credit_system worker --loglevel=info

# In a separate terminal — run Django dev server
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> The Vite dev server runs on **http://localhost:5173** and proxies `/api/*` calls to the Django backend at `http://localhost:8000`.

---

## 🔌 API Reference

Base URL: `http://localhost:8000`

All endpoints are CSRF-exempt and return JSON. Auto-generated IDs should not be passed in request bodies.

### POST `/api/register/`
Register a new customer.

**Request body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "age": 30,
  "monthly_income": 60000,
  "phone_number": 9876543210
}
```

**Response:** Customer details including auto-generated `customer_id` and computed `approved_limit` (`36 × monthly_income`, rounded to nearest lakh).

---

### POST `/api/check-eligibility/`
Evaluate loan eligibility without creating a loan.

**Request body:**
```json
{
  "customer_id": 302,
  "loan_amount": 500000,
  "interest_rate": 10,
  "tenure": 24
}
```

**Response:**
```json
{
  "customer_id": 302,
  "approval": true,
  "interest_rate": 10,
  "corrected_interest_rate": 12,
  "tenure": 24,
  "monthly_installment": 23536.72,
  "credit_score": 42
}
```

---

### POST `/api/create-loan/`
Create and disburse a loan (runs eligibility check internally).

**Request body:** Same as check-eligibility.

**Response:**
```json
{
  "loan_id": 9997,
  "customer_id": 302,
  "loan_approved": true,
  "message": "Loan approved",
  "monthly_installment": 23536.72
}
```

---

### GET `/api/view-loan/{loan_id}/`
Retrieve full loan details including nested customer profile.

**Example:** `GET /api/view-loan/9997/`

**Response:**
```json
{
  "loan_id": 9997,
  "customer": {
    "id": 302,
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": 9876543210,
    "age": 30
  },
  "loan_amount": "500000.00",
  "interest_rate": "12.00",
  "monthly_installment": "23536.72",
  "tenure": 24
}
```

---

### GET `/api/view-loans/{customer_id}/`
List all loans for a customer with repayments remaining.

**Example:** `GET /api/view-loans/302/`

**Response:**
```json
[
  {
    "loan_id": 9997,
    "loan_amount": "500000.00",
    "interest_rate": "12.00",
    "monthly_installment": "23536.72",
    "repayments_left": 18
  }
]
```

---

### Error Responses

| Scenario | HTTP Status | Response |
|---|---|---|
| Customer / Loan not found | 404 | `{"error": "Customer not found"}` |
| Invalid input fields | 400 | Field-level error object |
| EMI affordability failure | 200 | `approval: false` with explanation |
| Credit score too low | 200 | `approval: false` |

---

## 🧪 Sample Test Flow (via Postman or the UI)

1. **Register** a customer → capture `customer_id`
2. **Check Eligibility** using `customer_id`, `loan_amount`, `interest_rate`, `tenure` → note `corrected_interest_rate`
3. **Create Loan** (if eligible) → capture `loan_id`
4. **View Loan** by `loan_id` → verify full loan details
5. **View Customer Loans** by `customer_id` → see all loans with `repayments_left`

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | Django 4.2 + Django REST Framework |
| Database | PostgreSQL 15 |
| Task Queue | Celery 5.3 |
| Message Broker | Redis 7 |
| Data Processing | Pandas + OpenPyXL (Excel ingestion) |
| Frontend | React 18 + Vite 5 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Containerization | Docker + Docker Compose |

---

## 🐳 Docker Services

| Service | Image | Port |
|---|---|---|
| `web` | Django (Gunicorn) | 8000 |
| `db` | postgres:15 | 5432 |
| `redis` | redis:7 | 6379 |
| `celery` | Same as web | — |

---

## 📄 License

MIT — feel free to fork and extend.
