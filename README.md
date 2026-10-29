# 🎬 ChurnWise – Netflix Subscriber Churn Prediction & Retention Intelligence System

**ChurnWise** is a full-stack, enterprise-grade web application tailored for **Netflix Subscriber Churn Prediction, Behavioral Streaming Analytics, and Proactive Retention Playbooks**. Built with **React 18 + Vite** on the frontend, **Node.js + Express** on the backend, and direct integration with **MySQL Workbench Database (`churnwise_db`)**.

---

## 🌟 Key Features

1. **Executive Streaming KPI Dashboard**:
   - Total Netflix Subscribers, Active vs Cancelled counts.
   - Monthly Recurring Revenue (MRR) & Annual Revenue at Churn Risk.
   - Average Weekly Watch Hours across subscriber base.
   - Historical churn trajectory and retention rate curves.

2. **Netflix Subscriber Management (Full CRUD)**:
   - Search, filter by Netflix Plan Tier (`Premium 4K`, `Standard 1080p`, `Basic 720p`, `Mobile 480p`), Risk Tier (`Critical`, `High`, `Moderate`, `Low`), and Status (`Active`, `Cancelled`).
   - Batch operations (Batch Delete, Batch Status updates).
   - Instant CSV export formatted with streaming metrics.

3. **AI Churn Prediction & Factor Attribution Engine**:
   - Real-time churn probability scoring (0–100%) and classification.
   - Negative churn drivers (e.g. low weekly watch hours `< 4h/wk`, buffering complaints, month-to-month pass).
   - Positive retention signals (e.g. long tenure, annual pass, multi-screen profile usage).
   - Prescribed retention playbooks (e.g. customized trailers, discount vouchers, priority CDN routing).

4. **Interactive "What-If" Streaming Retention Sandbox**:
   - Simulate plan swaps, watch time improvements, and pass upgrades to forecast risk drop and protected revenue in real time.

5. **Deep Streaming Behavioral Analytics**:
   - Churn by Netflix Plan Tier breakdown.
   - Watch Time Cohorts vs Churn curve (`< 4 hrs/wk`, `4–10 hrs/wk`, `10–20 hrs/wk`, `20+ hrs/wk`).
   - Primary streaming hardware distribution (Smart TVs, Apple TV, Mobile, Tablets, Consoles).

6. **MySQL Workbench Integration**:
   - `churnwise_schema.sql` creates database `churnwise_db`, tables (`accounts`, `customers`, `predictions`), and pre-seeds Netflix subscribers.
   - Live synchronization via `mysql2` connection pool with graceful offline JSON fallback.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite, Recharts, Lucide Icons, Axios, React Router 6, CSS Design System (Netflix Crimson Dark Theme)
- **Backend**: Node.js, Express REST API, JWT Authentication, bcryptjs, mysql2
- **Database**: MySQL 8.0+ / MySQL Workbench (`churnwise_db`)

---

## 📁 Project Structure

```
churnwise/
├── churnwise_schema.sql         # MySQL Workbench schema & analytical SQL queries
├── package.json                 # Monorepo runner scripts
├── README.md                    # Project documentation & viva guide
│
├── backend/                     # Node.js + Express REST API
│   ├── config/
│   │   ├── database.js          # Persistent JSON fallback store
│   │   └── mysql.js             # MySQL connection pool & auto-sync service
│   ├── controllers/
│   │   ├── authController.js    # JWT Authentication & user roles
│   │   ├── customerController.js# Subscriber CRUD & search
│   │   ├── predictionController.js # AI Churn scoring & what-if simulator
│   │   └── analyticsController.js  # KPIs & streaming charts data
│   ├── routes/                  # API endpoints
│   ├── services/
│   │   ├── predictionEngine.js  # Netflix multi-factor churn scoring logic
│   │   └── seedData.js          # Pre-seeded Netflix subscriber records
│   ├── server.js                # Express entrypoint
│   ├── test-api.js              # Automated backend test suite
│   ├── .env                     # MySQL database credentials
│   └── package.json
│
└── frontend/                    # React 18 + Vite Application
    ├── src/
    │   ├── components/          # Reusable UI cards, badges, modals
    │   ├── context/             # Auth, Theme, and Toast Contexts
    │   ├── pages/
    │   │   ├── Dashboard.jsx    # Streaming executive KPIs & charts
    │   │   ├── Customers.jsx    # Netflix subscriber directory
    │   │   ├── AddCustomer.jsx  # Subscriber enrollment & live AI predictor
    │   │   ├── CustomerDetails.jsx # Subscriber 360 & retention sandbox
    │   │   ├── EditCustomer.jsx # Update subscriber profile
    │   │   ├── Analytics.jsx    # Streaming retention analytics
    │   │   ├── Settings.jsx     # MySQL database health & theme switcher
    │   │   └── Login.jsx        # Netflix-styled login portal
    │   ├── services/            # API client & customer data sync
    │   └── styles/
    │       └── global.css       # Netflix Crimson Dark design system
    ├── index.html
    └── package.json
```

---

## 🚀 How to Run the Application

### Step 1: Set up MySQL Database (Optional but Recommended)
1. Open **MySQL Workbench**.
2. Open `churnwise_schema.sql` located in the root directory.
3. Click **Execute** (⚡) to create `churnwise_db` and seed accounts and subscribers.
4. Verify your credentials in `backend/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=YourPassword
   DB_NAME=churnwise_db
   ```

### Step 2: Start the Backend Server
```bash
cd backend
npm install
node server.js
```
* Backend will be running at: `http://localhost:5000`

### Step 3: Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
* Frontend will be running at: `http://localhost:5173`

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin (Devisri)** | `devisrichowdaryk@gmail.com` | `admin` |
| **Admin (Operations)** | `admin@churnwise.com` | `admin` |
| **Demo User** | `demo@churnwise.com` | `demo123` |
| **Data Analyst** | `analyst@churnwise.com` | `admin` |

---

## 🧪 Automated Test Suite

Run backend integration tests:
```bash
cd backend
node test-api.js
```
Validates:
- Health check endpoint
- JWT Authentication & Profile retrieval
- Subscriber CRUD & deletion
- AI Churn Prediction Engine scoring
- What-If Strategy Simulator
- Analytics KPI aggregations
- MySQL database connectivity

---

## 📊 Useful MySQL Workbench Queries for Viva / Demo

Run these in MySQL Workbench during your presentation:

```sql
USE churnwise_db;

-- 1. View all subscribers sorted by engagement
SELECT id, name, plan, deviceType, watchHoursPerWeek, supportTickets, churn, risk_level 
FROM customers 
ORDER BY watchHoursPerWeek DESC;

-- 2. Churn rate per Netflix Plan Tier
SELECT 
  plan AS 'Netflix Plan',
  COUNT(*) AS 'Total Subscribers',
  SUM(CASE WHEN churn = 'Churned' THEN 1 ELSE 0 END) AS 'Churned Count',
  ROUND(SUM(CASE WHEN churn = 'Churned' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS 'Churn Rate %'
FROM customers
GROUP BY plan;

-- 3. AI Churn Prediction audit trail
SELECT * FROM predictions ORDER BY predicted_at DESC;
```

---

## 🤖 MLOps Toolchain & Architecture

| MLOps Component | Technology | Role & Functionality |
| :--- | :--- | :--- |
| **Churn Prediction** | `Scikit-learn` / `GradientBoosting` | Multi-model training on authentic `streaming_churn_dataset.csv` with hyperparameter logging |
| **Customer Data Versioning** | `DVC` | Tracks streaming dataset snapshots (`streaming_churn_dataset.csv`) and pipeline dependencies |
| **Experiment Tracking & Registry** | `MLflow` | Logs runs, metrics (Accuracy, ROC-AUC, F1), model hyperparameters, and `.joblib` model artifacts to SQLite |
| **Prediction Microservice** | `FastAPI` | Real-time & batch churn prediction API with swagger docs at `http://localhost:8000/docs` |
| **Containerization** | `Docker` & `docker-compose` | Multi-container setup orchestrating FastAPI, MLflow, Node backend, and MySQL database |
| **Drift Monitoring** | `Statistical Engine / Evidently` | Feature drift monitoring with interactive reports at `drift_reports/` (explicitly labeled evaluation mode) |
| **CI/CD Automation** | `GitHub Actions` | Automated pipeline for linting, data validation, test runs, and container builds |

### 🚀 Running the Services (Windows PowerShell):

For comprehensive step-by-step review instructions and faculty presentation guide, see **`REVIEW_START_HERE.md`**.

```powershell
# 1. Train models on authentic dataset and log to MLflow
python backend/app/ml/train.py

# 2. Open MLflow Dashboard (Port 8080)
python launch_mlflow.py

# 3. Start FastAPI Prediction Service (Port 8000)
python -m uvicorn backend.app.main:app --reload --port 8000

# 4. Start Node.js API and React Frontend (Ports 5000 & 5173)
npm run dev

# 5. Run Automated Test Suites
python -m pytest tests/test_mlops.py -v
npm --prefix backend test

# 6. Generate Data Drift Report
python backend/app/ml/drift_monitor.py
```
