"""
ChurnWise MLOps Pipeline - Production Model Training & MLflow Tracking
Trains classification models (Random Forest, Gradient Boosting, Logistic Regression, XGBoost)
on the authentic Streaming Subscriber Churn Dataset (streaming_churn_dataset.csv),
logging all hyperparameters, metrics, and model artifacts directly into MLflow.
"""

import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime, timezone
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report
)

try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

import mlflow
import mlflow.sklearn

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ChurnWise-Trainer")

# Resolve Base Paths
BASE_DIR = Path(__file__).resolve().parents[3]
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Feature Schema
CATEGORICAL_FEATURES = [
    "Platform",
    "SubscriptionPlan",
    "DeviceType",
    "ContractType",
    "PaymentMethod"
]

NUMERICAL_FEATURES = [
    "TenureMonths",
    "WeeklyWatchHours",
    "SupportTickets",
    "NumProfiles",
    "MonthlyChargesINR",
    "TotalChargesINR"
]

TARGET_COLUMN = "ChurnStatus"


def locate_dataset() -> Path:
    """Finds streaming_churn_dataset.csv across possible project directories."""
    candidates = [
        BASE_DIR / "streaming_churn_dataset.csv",
        Path.cwd() / "streaming_churn_dataset.csv",
        BASE_DIR / "data" / "kaggle_ott_streaming_churn_dataset.csv",
        Path.cwd() / "data" / "kaggle_ott_streaming_churn_dataset.csv"
    ]
    for p in candidates:
        if p.exists():
            logger.info(f"Loaded dataset from: {p.resolve()}")
            return p.resolve()
    raise FileNotFoundError("Could not find streaming_churn_dataset.csv in workspace.")


def load_and_preprocess_dataset(csv_path: Path):
    """
    Loads authentic streaming churn dataset and extracts clean feature matrix X and target y.
    """
    df = pd.read_csv(csv_path)
    logger.info(f"Authentic dataset loaded successfully. Shape: {df.shape}")

    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Required target column '{TARGET_COLUMN}' not found in dataset. Columns: {df.columns.tolist()}")

    # Ensure all required features are present
    missing_cats = [c for c in CATEGORICAL_FEATURES if c not in df.columns]
    missing_nums = [c for c in NUMERICAL_FEATURES if c not in df.columns]
    if missing_cats or missing_nums:
        raise ValueError(f"Missing required columns. Cats: {missing_cats}, Nums: {missing_nums}")

    # Binary target encoding: 'Churned' -> 1, 'Active' -> 0
    y = df[TARGET_COLUMN].apply(
        lambda val: 1 if str(val).strip().lower() in ["churned", "1", "true", "yes"] else 0
    )

    churn_rate = float(y.mean() * 100)
    logger.info(f"Dataset Target Distribution -> Active: {(y == 0).sum()}, Churned: {(y == 1).sum()} ({churn_rate:.2f}% churn rate)")

    X = df[CATEGORICAL_FEATURES + NUMERICAL_FEATURES].copy()

    # Fill numerical nulls with median and categorical with mode if any
    for col in NUMERICAL_FEATURES:
        X[col] = pd.to_numeric(X[col], errors="coerce").fillna(X[col].median())
    for col in CATEGORICAL_FEATURES:
        X[col] = X[col].astype(str).fillna("Unknown")

    return X, y


def build_preprocessor() -> ColumnTransformer:
    """Builds a scikit-learn ColumnTransformer for standardizing numeric features and encoding categoricals."""
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(
        drop="first",
        handle_unknown="ignore",
        sparse_output=False
    )
    return ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES)
        ]
    )


def train_and_track_mlflow():
    """
    Executes model training across candidate algorithms, tracks experiments with MLflow,
    and exports the best performing model pipeline.
    """
    csv_path = locate_dataset()
    X, y = load_and_preprocess_dataset(csv_path)

    # MLflow SQLite Tracking Configuration
    db_file = (BASE_DIR / "mlflow.db").resolve()
    mlflow_tracking_uri = f"sqlite:///{db_file.as_posix()}"
    artifacts_dir = (BASE_DIR / "mlruns").resolve().as_uri()

    os.environ["MLFLOW_ALLOW_FILE_STORE"] = "true"
    os.environ["MLFLOW_DEFAULT_ARTIFACT_ROOT"] = artifacts_dir
    mlflow.set_tracking_uri(mlflow_tracking_uri)
    experiment_name = "ChurnWise_Retention_System"
    mlflow.set_experiment(experiment_name)
    logger.info(f"MLflow tracking configured -> URI: {mlflow_tracking_uri}, Artifacts: {artifacts_dir}")

    # Stratified Train / Validation / Test Split (70% Train, 15% Validation, 15% Test)
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.1765, random_state=42, stratify=y_train_val
    )

    logger.info(f"Splits -> Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

    preprocessor = build_preprocessor()

    # Candidate Classifier Pipelines
    models = {
        "Random_Forest_Classifier": RandomForestClassifier(
            n_estimators=150,
            max_depth=10,
            class_weight="balanced",
            random_state=42
        ),
        "Gradient_Boosting_Classifier": GradientBoostingClassifier(
            n_estimators=120,
            learning_rate=0.08,
            max_depth=5,
            random_state=42
        ),
        "Logistic_Regression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        )
    }

    if HAS_XGBOOST:
        scale_pos = float((y == 0).sum() / max(1, (y == 1).sum()))
        models["XGBoost_Classifier"] = XGBClassifier(
            n_estimators=120,
            max_depth=6,
            learning_rate=0.08,
            scale_pos_weight=scale_pos,
            random_state=42,
            eval_metric="logloss"
        )

    best_f1 = -1.0
    best_model_name = ""
    best_pipeline = None
    best_metrics = {}

    for model_name, clf in models.items():
        with mlflow.start_run(run_name=model_name):
            logger.info(f"\nTraining algorithm: {model_name}...")
            pipeline = Pipeline(steps=[
                ("preprocessor", preprocessor),
                ("classifier", clf)
            ])
            pipeline.fit(X_train, y_train)

            # Validation metrics
            y_val_pred = pipeline.predict(X_val)
            y_val_proba = pipeline.predict_proba(X_val)[:, 1]

            val_acc = accuracy_score(y_val, y_val_pred)
            val_prec = precision_score(y_val, y_val_pred, zero_division=0)
            val_rec = recall_score(y_val, y_val_pred, zero_division=0)
            val_f1 = f1_score(y_val, y_val_pred, zero_division=0)
            val_roc = roc_auc_score(y_val, y_val_proba)

            # Test set metrics
            y_test_pred = pipeline.predict(X_test)
            y_test_proba = pipeline.predict_proba(X_test)[:, 1]
            test_acc = accuracy_score(y_test, y_test_pred)
            test_prec = precision_score(y_test, y_test_pred, zero_division=0)
            test_rec = recall_score(y_test, y_test_pred, zero_division=0)
            test_f1 = f1_score(y_test, y_test_pred, zero_division=0)
            test_roc = roc_auc_score(y_test, y_test_proba)

            logger.info(f"[{model_name}] Val Acc: {val_acc*100:.2f}%, F1: {val_f1*100:.2f}%, Recall: {val_rec*100:.2f}%, ROC-AUC: {val_roc:.4f}")
            logger.info(f"[{model_name}] Test Acc: {test_acc*100:.2f}%, Test F1: {test_f1*100:.2f}%, Test ROC-AUC: {test_roc:.4f}")

            # Log parameters to MLflow
            mlflow.log_param("model_name", model_name)
            mlflow.log_param("dataset_source", "streaming_churn_dataset.csv")
            mlflow.log_param("train_samples", len(X_train))
            mlflow.log_param("val_samples", len(X_val))
            mlflow.log_param("test_samples", len(X_test))
            mlflow.log_param("num_features", len(NUMERICAL_FEATURES) + len(CATEGORICAL_FEATURES))

            if hasattr(clf, "get_params"):
                params = clf.get_params()
                for p_key in ["n_estimators", "max_depth", "learning_rate", "class_weight", "C", "max_iter"]:
                    if p_key in params:
                        mlflow.log_param(f"clf_{p_key}", str(params[p_key]))

            # Log metrics to MLflow
            mlflow.log_metric("val_accuracy", float(val_acc))
            mlflow.log_metric("val_precision", float(val_prec))
            mlflow.log_metric("val_recall", float(val_rec))
            mlflow.log_metric("val_f1_score", float(val_f1))
            mlflow.log_metric("val_roc_auc", float(val_roc))

            mlflow.log_metric("test_accuracy", float(test_acc))
            mlflow.log_metric("test_precision", float(test_prec))
            mlflow.log_metric("test_recall", float(test_rec))
            mlflow.log_metric("test_f1_score", float(test_f1))
            mlflow.log_metric("test_roc_auc", float(test_roc))

            # Log Scikit-Learn Model Artifact to MLflow with explicit pip requirements
            try:
                mlflow.sklearn.log_model(
                    pipeline,
                    artifact_path="model",
                    pip_requirements=["scikit-learn", "numpy", "pandas", "joblib"]
                )
                logger.info(f"Successfully logged model artifact for {model_name} to MLflow.")
            except Exception as e:
                logger.error(f"Error logging model artifact to MLflow: {e}", exc_info=True)
                raise e

            # Select Best Model based on Validation F1-score (harmonic mean of precision & recall)
            if val_f1 > best_f1:
                best_f1 = val_f1
                best_model_name = model_name
                best_pipeline = pipeline
                best_metrics = {
                    "val_accuracy": round(float(val_acc), 4),
                    "val_precision": round(float(val_prec), 4),
                    "val_recall": round(float(val_rec), 4),
                    "val_f1_score": round(float(val_f1), 4),
                    "val_roc_auc": round(float(val_roc), 4),
                    "test_accuracy": round(float(test_acc), 4),
                    "test_precision": round(float(test_prec), 4),
                    "test_recall": round(float(test_rec), 4),
                    "test_f1_score": round(float(test_f1), 4),
                    "test_roc_auc": round(float(test_roc), 4)
                }

    # Save Best Model locally for FastAPI service
    model_output_path = MODELS_DIR / "best_churn_model.joblib"
    joblib.dump(best_pipeline, model_output_path)
    logger.info(f"Best model '{best_model_name}' (F1: {best_f1*100:.2f}%) saved to: {model_output_path}")

    # Save metadata summary
    metadata = {
        "best_model_name": best_model_name,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset": "streaming_churn_dataset.csv",
        "total_records": len(X),
        "target_column": TARGET_COLUMN,
        "features": {
            "categorical": CATEGORICAL_FEATURES,
            "numerical": NUMERICAL_FEATURES
        },
        "metrics": best_metrics
    }
    metadata_path = MODELS_DIR / "model_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Model metadata exported to: {metadata_path}")
    print("\n=======================================================")
    print(f"[*] [TRAINING COMPLETE] Best Model: {best_model_name}")
    print(f"    Validation F1-Score : {best_metrics['val_f1_score']*100:.2f}%")
    print(f"    Validation ROC-AUC  : {best_metrics['val_roc_auc']:.4f}")
    print(f"    Test Accuracy       : {best_metrics['test_accuracy']*100:.2f}%")
    print(f"    Test Recall         : {best_metrics['test_recall']*100:.2f}%")
    print(f"    Model Artifact      : {model_output_path}")
    print(f"    MLflow Tracking URI : {mlflow_tracking_uri}")
    print("=======================================================\n")
    return best_model_name, best_metrics


if __name__ == "__main__":
    train_and_track_mlflow()
