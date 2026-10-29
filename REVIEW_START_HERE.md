# 🎓 ChurnWise MLOps – Faculty Review Quick-Start Guide

Welcome to the **ChurnWise MLOps Platform** review. This guide provides exact Windows PowerShell commands to execute, test, and demonstrate the entire system end-to-end.

---

## 🌟 Executive Architecture Summary

```
                      +------------------------------------+
                      | React 18 + Vite Frontend (:5173)   |
                      +-----------------+------------------+
                                        |
                                        v
                      +------------------------------------+
                      | Node.js Express REST API (:5000)   |
                      +--------+-------------------+-------+
                               |                   |
               Proxy & Enriched|                   | (Offline JSON Fallback)
                     Inference |                   v
                               v          +--------------------+
    +----------------------------------+  | MySQL Workbench DB |
    | FastAPI ML Microservice (:8000)  |  |   churnwise_db     |
    +-----------------+----------------+  +--------------------+
                      |
                      | Loads model artifact
                      v
    +----------------------------------+
    | Best Model: Gradient Boosting    |
    | (models/best_churn_model.joblib) |
    +-----------------+----------------+
                      ^
         Logged during| Training
                      |
    +-----------------+----------------+
    | MLflow Tracking Server (:8080)   |
    | (sqlite:///mlflow.db, mlruns/)   |
    +----------------------------------+
```

---

## 🚀 Exact Windows PowerShell Execution Steps

Open Windows PowerShell in the project root directory: `c:\Users\devis\Downloads\churnwise mlfow`.

### Step 1: Install Dependencies (If not already installed)
```powershell
pip install -r requirements.txt
npm run install:all
```

---

### Step 2: Train Model & Log Experiments to MLflow
Trains candidate models (`RandomForest`, `GradientBoosting`, `LogisticRegression`) on the authentic **5,000-record** dataset (`streaming_churn_dataset.csv`), evaluates metrics, logs parameters/artifacts to SQLite MLflow, and saves the top performer to `models/best_churn_model.joblib`:

```powershell
python backend/app/ml/train.py
```

* **Dataset Target**: `ChurnStatus` (`Churned` = 1, `Active` = 0)
* **Best Model**: `Gradient_Boosting_Classifier` (Test Accuracy: **97.07%**, Test Recall: **95.10%**, Val F1: **91.35%**, Val ROC-AUC: **0.9940**)
* **Metadata Export**: `models/model_metadata.json`

---

### Step 3: Start MLflow Experiment Tracking UI (Terminal 1)
```powershell
python launch_mlflow.py
```
* **MLflow Dashboard URL**: [http://127.0.0.1:8080](http://127.0.0.1:8080)
* **What to inspect**: Click into the experiment `ChurnWise_Retention_System` to view model runs, hyperparameters, accuracy, F1-score, ROC-AUC curves, and the logged `.joblib` model artifacts.

---

### Step 4: Start FastAPI Prediction Microservice (Terminal 2)
```powershell
python -m uvicorn backend.app.main:app --reload --port 8000
```
* **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check**: [http://localhost:8000/health](http://localhost:8000/health) (validates that `model_loaded: true`)

---

### Step 5: Start Node.js API & React Frontend (Terminal 3)
Run both backend and frontend concurrently with a single command from root:
```powershell
npm run dev
```

* **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
* **Backend REST API**: [http://localhost:5000](http://localhost:5000)

*(Alternatively, run in separate terminals: `cd backend; node server.js` and `cd frontend; npm run dev`).*

---

## 🔐 Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `devisrichowdaryk@gmail.com` | `admin` | Full CRUD, bulk operations, subscriber enrollment, analytics |
| **Operations Admin**| `admin@churnwise.com` | `admin` | System admin privileges |
| **Retention Analyst** | `demo@churnwise.com` | `demo123` | Read-only inspection & what-if simulator |

---

## 🧪 Automated Test Verification

Run both test suites to prove 100% end-to-end functionality:

### 1. Python MLOps & FastAPI Test Suite (10 Passed)
```powershell
python -m pytest tests/test_mlops.py -v
```
Validates:
* Dataset schema, 5,000 records, non-null features, binary target
* Model artifact and metadata validity
* FastAPI `/health`, `/api/predict`, `/api/predict/batch`, `/api/predict/simulate`
* Input bounds validation (rejection with HTTP 422)
* Data drift engine and MLflow SQLite database persistence

### 2. Node.js Express REST API Test Suite (10 Passed)
```powershell
npm --prefix backend test
```
Validates:
* Health endpoint, JWT authentication, subscriber CRUD
* Churn prediction endpoint with FastAPI proxy integration and graceful offline fallback
* What-if strategy simulator
* Analytics KPIs & cohorts
* MySQL connection verification

---

## 📊 Data Drift Monitoring & Transparency

Run the drift monitor to evaluate feature shifts against the reference baseline:

```powershell
python backend/app/ml/drift_monitor.py
```

* **Open Interactive HTML Report**: `drift_reports/churn_drift_report.html`
* **Faculty Review Note**: The baseline reference uses the authentic 5,000 records from `streaming_churn_dataset.csv`. The evaluation dataset uses a controlled simulated stress-test shift (22% drop in watch hours, elevated buffering tickets) to demonstrate drift detection sensitivity without falsely claiming to be live production stream data.

---

## 💡 Viva / Faculty Discussion Q&A

### Q1: What dataset did you use and what is the target variable?
> **Answer:** We used `streaming_churn_dataset.csv` containing 5,000 multi-platform streaming records across Netflix, Amazon Prime Video, Spotify, and JioHotstar. The target column is `ChurnStatus`, mapped to binary `1` (Churned) and `0` (Active). Features include 5 categorical attributes (Platform, Plan, Device, Contract, Payment) and 6 numerical attributes (Tenure, Weekly Watch Hours, Support Tickets, Profiles, Monthly Charges, Total Charges).

### Q2: Why did Gradient Boosting win over other models?
> **Answer:** In churn prediction, false negatives (missing a customer who will churn) are vastly more costly than false positives. Gradient Boosting achieved the highest Validation F1-score (**91.35%**) and test recall (**95.10%** with ROC-AUC **0.9898**), making it superior for capturing non-linear feature interactions between low watch hours and monthly contract structures.

### Q3: What is the role of MLflow in this architecture?
> **Answer:** MLflow provides experiment tracking, metric comparison, hyperparameter logging, and model artifact management. We configured a persistent SQLite backend (`sqlite:///mlflow.db`) with local artifact storage (`mlruns/`). Every training run records validation/test accuracy, F1, recall, ROC-AUC, and packages the scikit-learn pipeline for reproducible deployment.

### Q4: How is DVC integrated?
> **Answer:** DVC (`dvc.yaml`) tracks data file dependencies (`streaming_churn_dataset.csv`), pipelines code stages (`train` and `drift_monitor`), and guarantees reproducibility of outputs (`models/best_churn_model.joblib` and `drift_reports/`).

### Q5: How is Data Drift detected?
> **Answer:** We employ two-sample Kolmogorov-Smirnov (KS) hypothesis tests for continuous numeric features (`WeeklyWatchHours`, `SupportTickets`, `TenureMonths`) and Total Variation Distance (TVD) for categorical distributions. If $\ge 30\%$ of features exhibit significant divergence ($p < 0.05$), a Dataset Drift alert is triggered.

### Q6: What are the project limitations?
> **Answer:**
> 1. Real-world streaming telemetry generates clickstream events (second-by-second pause/skip events), whereas our dataset operates at the session/aggregate level.
> 2. Model retraining is currently triggered via DVC/pipeline scripts rather than automated real-time online learning triggers.

