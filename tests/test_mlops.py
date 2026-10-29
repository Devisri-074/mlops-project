"""
ChurnWise Automated MLOps Test Suite
Tests data integrity, model artifact, MLflow experiment tracking,
FastAPI prediction endpoints, input validation, and data drift monitoring.
"""

import os
import sys
import json
import pytest
from pathlib import Path
import pandas as pd
import numpy as np
import joblib

# Ensure repository root is in sys.path
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ml.drift_monitor import generate_drift_report

client = TestClient(app)


# ==============================================================================
# 1. Dataset Integrity Tests
# ==============================================================================

def test_dataset_exists_and_has_required_schema():
    csv_path = ROOT_DIR / "streaming_churn_dataset.csv"
    assert csv_path.exists(), "streaming_churn_dataset.csv does not exist in root directory"

    df = pd.read_csv(csv_path)
    assert len(df) >= 5000, f"Expected at least 5000 records, got {len(df)}"

    required_columns = [
        "CustomerID", "CustomerName", "Email", "Platform",
        "SubscriptionPlan", "DeviceType", "TenureMonths", "ContractType",
        "PaymentMethod", "WeeklyWatchHours", "SupportTickets", "NumProfiles",
        "MonthlyChargesINR", "TotalChargesINR", "ChurnStatus"
    ]
    for col in required_columns:
        assert col in df.columns, f"Required column '{col}' is missing from dataset"

    # Verify target column binary distribution
    target_values = set(df["ChurnStatus"].dropna().unique())
    assert "Active" in target_values and "Churned" in target_values, (
        f"ChurnStatus should have Active and Churned, got {target_values}"
    )

    # Verify no nulls in critical predictive features
    for col in ["Platform", "SubscriptionPlan", "DeviceType", "ContractType", "WeeklyWatchHours", "SupportTickets"]:
        assert df[col].isnull().sum() == 0, f"Feature '{col}' contains unexpected null values"


# ==============================================================================
# 2. Model Pipeline & Artifact Tests
# ==============================================================================

def test_model_artifact_and_metadata():
    model_path = ROOT_DIR / "models" / "best_churn_model.joblib"
    metadata_path = ROOT_DIR / "models" / "model_metadata.json"

    assert model_path.exists(), "best_churn_model.joblib not found in models/"
    assert metadata_path.exists(), "model_metadata.json not found in models/"

    pipeline = joblib.load(model_path)
    assert hasattr(pipeline, "predict_proba"), "Loaded model does not implement predict_proba"

    with open(metadata_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert "best_model_name" in meta
    assert "metrics" in meta
    assert meta["metrics"]["test_accuracy"] > 0.85, (
        f"Model test accuracy too low: {meta['metrics']['test_accuracy']}"
    )
    assert meta["metrics"]["val_roc_auc"] > 0.90, (
        f"Model ROC-AUC too low: {meta['metrics']['val_roc_auc']}"
    )


# ==============================================================================
# 3. FastAPI Endpoint Tests
# ==============================================================================

def test_fastapi_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "best_model_name" in data["model_metadata"]


def test_fastapi_predict_loyal_subscriber():
    payload = {
        "platform": "Netflix",
        "subscription_plan": "Premium 4K",
        "device_type": "Smart TV",
        "tenure": 24,
        "contract": "Annual",
        "payment_method": "UPI AutoPay",
        "weekly_watch_hours": 28.0,
        "support_tickets": 0,
        "num_profiles": 4,
        "monthly_charges": 799.0
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["prediction"] == "Retained"
    assert data["churn_probability"] < 25.0
    assert data["risk_level"] == "Low Risk / Retained"
    assert data["risk_color"] == "green"
    assert len(data["positive_drivers"]) > 0


def test_fastapi_predict_critical_risk_subscriber():
    payload = {
        "platform": "Netflix",
        "subscription_plan": "Basic 720p",
        "device_type": "Mobile (Android / iOS)",
        "tenure": 1,
        "contract": "Monthly",
        "payment_method": "Manual UPI",
        "weekly_watch_hours": 1.5,
        "support_tickets": 4,
        "num_profiles": 1,
        "monthly_charges": 499.0
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["prediction"] == "Likely to Churn"
    assert data["churn_probability"] >= 65.0
    assert data["risk_level"] in ["High Risk", "Critical Risk"]
    assert data["risk_color"] in ["orange", "red"]
    assert len(data["top_factors"]) > 0
    assert len(data["recommendations"]) > 0


def test_fastapi_input_validation():
    # Negative tenure or invalid bounds
    invalid_payload = {
        "platform": "Netflix",
        "tenure": -5,
        "weekly_watch_hours": 999.0
    }
    res = client.post("/api/predict", json=invalid_payload)
    assert res.status_code == 422, "FastAPI should validate bounds and return 422 Unprocessable Entity"


def test_fastapi_batch_prediction():
    batch_payload = [
        {
            "customer_id": "SUB-101",
            "name": "User One",
            "platform": "Netflix",
            "tenure": 20,
            "contract": "Annual",
            "weekly_watch_hours": 20.0,
            "support_tickets": 0
        },
        {
            "customer_id": "SUB-102",
            "name": "User Two",
            "platform": "Spotify",
            "tenure": 2,
            "contract": "Monthly",
            "weekly_watch_hours": 2.0,
            "support_tickets": 3
        }
    ]
    res = client.post("/api/predict/batch", json=batch_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_scored"] == 2
    assert len(data["predictions"]) == 2


def test_fastapi_whatif_simulator():
    sim_payload = {
        "customer": {
            "customer_id": "SIM-01",
            "platform": "Netflix",
            "tenure": 2,
            "contract": "Monthly",
            "weekly_watch_hours": 2.0,
            "support_tickets": 3,
            "monthly_charges": 499.0
        },
        "overrides": {
            "contract": "Annual",
            "weekly_watch_hours": 15.0,
            "support_tickets": 0
        }
    }
    res = client.post("/api/predict/simulate", json=sim_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["risk_reduced"] is True
    assert data["probability_delta"] > 0
    assert data["protected_revenue_inr"] > 0


# ==============================================================================
# 4. Drift Monitoring & Transparency Tests
# ==============================================================================

def test_drift_monitoring_and_labeling():
    report = generate_drift_report()
    assert report["status"] == "success"
    assert "monitoring_metadata" in report
    meta = report["monitoring_metadata"]
    assert meta["is_simulated_current_data"] is True
    assert "Simulated" in meta["evaluation_mode"]
    assert "streaming_churn_dataset.csv" in meta["reference_dataset"]

    # HTML report created and contains faculty transparency warning
    html_path = ROOT_DIR / "drift_reports" / "churn_drift_report.html"
    assert html_path.exists()
    html_content = html_path.read_text(encoding="utf-8")
    assert "FACULTY / REVIEW TRANSPARENCY NOTICE" in html_content


# ==============================================================================
# 5. MLflow Tracking Storage Test
# ==============================================================================

def test_mlflow_database_populated():
    db_path = ROOT_DIR / "mlflow.db"
    assert db_path.exists(), "mlflow.db SQLite database does not exist"
    assert db_path.stat().st_size > 10000, "mlflow.db appears to be empty"

