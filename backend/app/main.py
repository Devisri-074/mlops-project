"""
ChurnWise FastAPI Prediction & MLOps Microservice
Provides real-time ML churn inference, what-if retention simulation, batch scoring,
and Evidently AI / statistical data drift monitoring endpoints.
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

# Resolve Base Directory
BASE_DIR = Path(__file__).resolve().parents[2]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionResponse,
    SimulationRequest,
    SimulationResponse
)
from backend.app.ml.drift_monitor import generate_drift_report

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ChurnWise-API")

app = FastAPI(
    title="ChurnWise AI Prediction & MLOps Microservice",
    description="Multi-Platform Streaming Subscriber Churn Prediction, MLflow Model Inference & Drift Monitoring",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = BASE_DIR / "models" / "best_churn_model.joblib"
METADATA_PATH = BASE_DIR / "models" / "model_metadata.json"

model_pipeline = None
model_metadata = {}


def load_ml_model():
    """Loads the trained scikit-learn pipeline from disk."""
    global model_pipeline, model_metadata
    if MODEL_PATH.exists():
        try:
            model_pipeline = joblib.load(MODEL_PATH)
            logger.info(f"Successfully loaded model artifact from {MODEL_PATH}")
            if METADATA_PATH.exists():
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    model_metadata = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            model_pipeline = None
    else:
        logger.warning(f"Model not found at {MODEL_PATH}. Attempting to train...")
        try:
            from backend.app.ml.train import train_and_track_mlflow
            train_and_track_mlflow()
            if MODEL_PATH.exists():
                model_pipeline = joblib.load(MODEL_PATH)
        except Exception as te:
            logger.error(f"Auto-training failed: {te}")


# Load model on startup
load_ml_model()


def normalize_input_features(req: PredictionRequest) -> Dict[str, Any]:
    """
    Standardizes client request data to match model training feature schema.
    """
    # 1. Platform normalization
    raw_platform = (req.platform or "Netflix").strip()
    norm_p = raw_platform.lower()
    if "prime" in norm_p or "amazon" in norm_p:
        platform = "Amazon Prime Video"
    elif "spotify" in norm_p:
        platform = "Spotify"
    elif "hotstar" in norm_p or "disney" in norm_p:
        platform = "JioHotstar"
    else:
        platform = "Netflix"

    # 2. Subscription Plan normalization
    raw_plan = (req.plan or req.subscription_plan or "Standard 1080p").strip()
    norm_plan = raw_plan.lower()
    if "premium" in norm_plan or "4k" in norm_plan or "family" in norm_plan:
        plan = "Premium 4K"
    elif "mobile" in norm_plan or "480" in norm_plan or "lite" in norm_plan:
        plan = "Mobile 480p"
    elif "basic" in norm_plan or "720" in norm_plan:
        plan = "Basic 720p"
    else:
        plan = "Standard 1080p"

    # 3. Device Type normalization
    raw_device = (req.deviceType or req.device_type or "Smart TV").strip()
    norm_device = raw_device.lower()
    if "mobile" in norm_device or "phone" in norm_device or "android" in norm_device or "ios" in norm_device:
        device = "Mobile (Android / iOS)"
    elif "laptop" in norm_device or "web" in norm_device or "pc" in norm_device or "mac" in norm_device:
        device = "Laptop / Web"
    elif "stick" in norm_device or "fire" in norm_device or "chromecast" in norm_device or "apple tv" in norm_device:
        device = "Streaming Stick"
    else:
        device = "Smart TV"

    # 4. Contract normalization
    raw_contract = (req.contract or "Monthly").strip()
    norm_c = raw_contract.lower()
    if "two" in norm_c or "2" in norm_c:
        contract = "Two-Year"
    elif "annual" in norm_c or "year" in norm_c:
        contract = "Annual"
    else:
        contract = "Monthly"

    # 5. Payment Method normalization
    raw_pm = (req.paymentMethod or req.payment_method or "UPI AutoPay").strip()
    norm_pm = raw_pm.lower()
    if "credit" in norm_pm or "card" in norm_pm or "debit" in norm_pm:
        payment = "Credit Card"
    elif "net" in norm_pm or "banking" in norm_pm:
        payment = "Net Banking"
    elif "manual" in norm_pm:
        payment = "Manual UPI"
    else:
        payment = "UPI AutoPay"

    # Numerical metrics
    tenure = int(req.tenure if req.tenure is not None else 12)
    watch_hours = float(
        req.weekly_watch_hours
        if req.weekly_watch_hours is not None
        else (req.watch_hours_per_week if req.watch_hours_per_week is not None else (req.watchHoursPerWeek if req.watchHoursPerWeek is not None else 15.0))
    )
    support_tickets = int(
        req.support_tickets
        if req.support_tickets is not None
        else (req.supportTickets if req.supportTickets is not None else 0)
    )
    num_profiles = int(
        req.num_profiles
        if req.num_profiles is not None
        else (req.numProfiles if req.numProfiles is not None else 2)
    )
    monthly_charges = float(
        req.monthly_charges
        if req.monthly_charges is not None
        else (req.monthlyCharges if req.monthlyCharges is not None else 499.0)
    )
    total_charges = float(
        req.total_charges
        if req.total_charges is not None
        else (req.totalCharges if req.totalCharges is not None else (monthly_charges * max(1, tenure)))
    )

    return {
        "Platform": platform,
        "SubscriptionPlan": plan,
        "DeviceType": device,
        "ContractType": contract,
        "PaymentMethod": payment,
        "TenureMonths": tenure,
        "WeeklyWatchHours": watch_hours,
        "SupportTickets": support_tickets,
        "NumProfiles": num_profiles,
        "MonthlyChargesINR": monthly_charges,
        "TotalChargesINR": total_charges
    }


def compute_prediction_attributions(feats: Dict[str, Any], proba: float) -> tuple:
    """Generates explainable drivers and retention recommendations based on subscriber inputs."""
    top_factors = []
    positive_drivers = []
    recommendations = []

    platform = feats["Platform"]
    watch_hours = feats["WeeklyWatchHours"]
    tickets = feats["SupportTickets"]
    contract = feats["ContractType"]
    tenure = feats["TenureMonths"]
    payment = feats["PaymentMethod"]

    # Negative churn factors
    if watch_hours < 4.0:
        top_factors.append(f"Critically low streaming consumption ({watch_hours:.1f} hrs/week vs 18h benchmark)")
    elif watch_hours < 8.0:
        top_factors.append(f"Sub-optimal weekly engagement ({watch_hours:.1f} hrs/week)")

    if tickets >= 3:
        top_factors.append(f"Excessive buffering & streaming support tickets ({tickets} unresolved complaints)")
    elif tickets == 2:
        top_factors.append("Moderate playback complaints logged in last billing cycle")

    if contract == "Monthly":
        top_factors.append("Month-to-month subscription with zero commitment/lock-in")

    if tenure <= 3:
        top_factors.append(f"High-vulnerability onboarding window (Tenure: {tenure} months)")

    if payment == "Manual UPI":
        top_factors.append("Manual non-automated payment friction leading to recurring lapse risk")

    # Positive retention signals
    if watch_hours >= 18.0:
        positive_drivers.append(f"High power streamer engagement ({watch_hours:.1f} hrs/week)")
    if contract in ["Annual", "Two-Year"]:
        positive_drivers.append(f"Long-term pass commitment ({contract} Pass)")
    if tickets == 0:
        positive_drivers.append("Flawless streaming playback (0 technical complaints)")
    if tenure >= 18:
        positive_drivers.append(f"Loyal veteran subscriber tenure ({tenure} months)")
    if feats["NumProfiles"] >= 3:
        positive_drivers.append(f"Multi-screen household profile utilization ({feats['NumProfiles']} profiles)")

    # Actionable Retention Playbooks
    if proba >= 0.50:
        if tickets >= 2:
            recommendations.append(f"Dispatch VIP engineering triage for {platform} CDN routing & bitrate optimization")
        if contract == "Monthly":
            recommendations.append(f"Trigger 20% annual pass discount incentive before next billing renewal")
        if watch_hours < 8.0:
            recommendations.append(f"Push personalized Top-10 trending recommendations & tailored trailer reels")
        if payment == "Manual UPI":
            recommendations.append("Prompt UPI AutoPay activation with one-time 50 INR bill credit")
    else:
        recommendations.append("Maintain loyalty engagement with early content previews and anniversary badges")

    return top_factors, positive_drivers, recommendations


@app.get("/")
def root():
    return {
        "system": "ChurnWise MLOps Prediction Platform",
        "version": "2.0.0",
        "status": "online",
        "model_loaded": model_pipeline is not None,
        "model_architecture": model_metadata.get("best_model_name", "Gradient_Boosting_Classifier"),
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "predict": "/api/predict",
            "batch_predict": "/api/predict/batch",
            "simulate": "/api/predict/simulate",
            "drift_report": "/api/drift/report",
            "drift_report_view": "/api/drift/report/view"
        }
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model_pipeline is not None,
        "model_path": str(MODEL_PATH),
        "model_metadata": model_metadata,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.post("/api/predict", response_model=PredictionResponse)
def predict_churn(request: PredictionRequest):
    global model_pipeline
    if model_pipeline is None:
        load_ml_model()

    if model_pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Model not trained or found. Please run: python backend/app/ml/train.py"
        )

    # Standardize input features to match training DataFrame schema
    feats = normalize_input_features(request)
    df_input = pd.DataFrame([feats])

    try:
        proba = float(model_pipeline.predict_proba(df_input)[0][1])
    except Exception as e:
        logger.error(f"Inference error with pipeline: {e}")
        try:
            pred = int(model_pipeline.predict(df_input)[0])
            proba = 0.85 if pred == 1 else 0.15
        except Exception as inner_e:
            raise HTTPException(status_code=500, detail=f"Inference error: {inner_e}")

    prob_pct = round(proba * 100, 1)
    is_churn = proba >= 0.5

    # Categorize Risk Tier
    if prob_pct >= 75.0:
        risk_level = "Critical Risk"
        risk_color = "red"
    elif prob_pct >= 50.0:
        risk_level = "High Risk"
        risk_color = "orange"
    elif prob_pct >= 30.0:
        risk_level = "Moderate Risk"
        risk_color = "amber"
    else:
        risk_level = "Low Risk / Retained"
        risk_color = "green"

    top_factors, positive_drivers, recommendations = compute_prediction_attributions(feats, proba)

    confidence = round(max(prob_pct, 100.0 - prob_pct), 1)
    active_model = model_metadata.get("best_model_name", "Gradient_Boosting_Classifier")

    return PredictionResponse(
        customer_id=request.customer_id or "SUB-001",
        customer_name=request.name or "Anonymous Subscriber",
        platform=feats["Platform"],
        prediction="Likely to Churn" if is_churn else "Retained",
        churn_probability=prob_pct,
        risk_level=risk_level,
        risk_color=risk_color,
        confidence=confidence,
        model_version=f"{active_model} (MLflow Logged)",
        top_factors=top_factors,
        positive_drivers=positive_drivers,
        recommendations=recommendations,
        predicted_at=datetime.now(timezone.utc)
    )


@app.post("/api/predict/batch", response_model=BatchPredictionResponse)
def predict_batch(subscribers: List[PredictionRequest]):
    results = [predict_churn(sub) for sub in subscribers]
    return BatchPredictionResponse(
        total_scored=len(results),
        high_risk_count=sum(1 for r in results if r.churn_probability >= 50.0),
        predictions=results
    )


@app.post("/api/predict/simulate", response_model=SimulationResponse)
def simulate_retention_scenario(payload: SimulationRequest):
    """
    Simulates what-if parameter alterations (e.g. converting monthly pass to annual pass
    or reducing support complaints) and measures predicted risk reduction and protected revenue.
    """
    base_sub = payload.customer or PredictionRequest(customer_id=payload.customer_id or "SIM-001")
    baseline_res = predict_churn(base_sub)

    # Apply overrides
    sim_dict = base_sub.model_dump()
    for k, v in payload.overrides.items():
        if k in sim_dict:
            sim_dict[k] = v
        # Also map frontend property names
        elif k == "watchHoursPerWeek":
            sim_dict["weekly_watch_hours"] = float(v)
        elif k == "supportTickets":
            sim_dict["support_tickets"] = int(v)
        elif k == "monthlyCharges":
            sim_dict["monthly_charges"] = float(v)

    sim_sub = PredictionRequest(**sim_dict)
    sim_res = predict_churn(sim_sub)

    delta = round(baseline_res.churn_probability - sim_res.churn_probability, 1)
    risk_reduced = delta > 0

    monthly_fee = sim_dict.get("monthly_charges") or 499.0
    protected_revenue = round((delta / 100.0) * monthly_fee * 12.0, 2) if risk_reduced else 0.0

    return SimulationResponse(
        customer_id=baseline_res.customer_id,
        baseline=baseline_res,
        simulated=sim_res,
        probability_delta=delta,
        risk_reduced=risk_reduced,
        protected_revenue_inr=protected_revenue,
        summary=f"Risk reduced by {delta}% with projected {protected_revenue:,.2f} INR saved ARR."
        if risk_reduced
        else f"Simulation increased risk by {abs(delta)}%."
    )


@app.get("/api/drift/report")
def get_drift_report():
    return generate_drift_report()


@app.get("/api/drift/report/view", response_class=HTMLResponse)
def view_drift_report_html():
    html_path = BASE_DIR / "drift_reports" / "churn_drift_report.html"
    if not html_path.exists():
        generate_drift_report()

    with open(html_path, "r", encoding="utf-8") as f:
        return f.read()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
