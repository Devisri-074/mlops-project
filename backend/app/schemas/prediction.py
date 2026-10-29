"""
Pydantic Schemas for ChurnWise Prediction & Inference Service
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator


class PredictionRequest(BaseModel):
    customer_id: Optional[str] = Field(default="SUB-001", description="Unique subscriber identifier")
    name: Optional[str] = Field(default="Subscriber", description="Full name")
    platform: Optional[str] = Field(default="Netflix", description="Streaming platform: Netflix, Amazon Prime Video, Spotify, JioHotstar")
    subscription_plan: Optional[str] = Field(default="Standard 1080p", description="Plan tier (e.g. Premium 4K, Standard 1080p, Basic 720p, Mobile 480p)")
    device_type: Optional[str] = Field(default="Smart TV", description="Primary hardware: Smart TV, Mobile (Android / iOS), Laptop / Web, Streaming Stick")
    tenure: Optional[int] = Field(default=12, ge=0, le=120, description="Tenure in months")
    contract: Optional[str] = Field(default="Monthly", description="Contract/Pass type: Monthly, Annual, Two-Year")
    payment_method: Optional[str] = Field(default="UPI AutoPay", description="Billing method: UPI AutoPay, Credit Card, Net Banking, Manual UPI")
    weekly_watch_hours: Optional[float] = Field(default=15.0, ge=0.0, le=168.0, description="Weekly watch/listening consumption hours")
    support_tickets: Optional[int] = Field(default=0, ge=0, le=50, description="Technical/buffering support tickets lodged")
    num_profiles: Optional[int] = Field(default=2, ge=1, le=10, description="Number of active viewer profiles")
    monthly_charges: Optional[float] = Field(default=499.0, ge=0.0, description="Monthly fee in INR")
    total_charges: Optional[float] = Field(default=None, ge=0.0, description="Cumulative lifetime charges in INR")

    # Compatibility aliases for alternative naming schemes
    plan: Optional[str] = None
    deviceType: Optional[str] = None
    paymentMethod: Optional[str] = None
    watch_hours_per_week: Optional[float] = None
    watchHoursPerWeek: Optional[float] = None
    supportTickets: Optional[int] = None
    numProfiles: Optional[int] = None
    monthlyCharges: Optional[float] = None
    totalCharges: Optional[float] = None

    class Config:
        populate_by_name = True


class PredictionResponse(BaseModel):
    customer_id: str
    customer_name: str
    platform: str
    prediction: str = Field(..., description="'Likely to Churn' or 'Retained'")
    churn_probability: float = Field(..., description="Churn probability percentage (0.0 to 100.0%)")
    risk_level: str = Field(..., description="Risk category: Critical Risk, High Risk, Moderate Risk, Low Risk / Retained")
    risk_color: str = Field(..., description="'red', 'orange', 'amber', or 'green'")
    confidence: float = Field(..., description="Model classification confidence percentage")
    model_version: str = Field(..., description="Active MLflow trained model architecture")
    top_factors: List[str] = Field(default_factory=list, description="Top negative churn drivers")
    positive_drivers: List[str] = Field(default_factory=list, description="Top positive retention signals")
    recommendations: List[str] = Field(default_factory=list, description="Prescribed proactive retention playbooks")
    predicted_at: Optional[datetime] = None


class BatchPredictionResponse(BaseModel):
    total_scored: int
    high_risk_count: int
    predictions: List[PredictionResponse]


class PredictionHistoryItem(PredictionResponse):
    id: Optional[int] = None
    predicted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SimulationRequest(BaseModel):
    customer_id: Optional[str] = None
    customer: Optional[PredictionRequest] = None
    overrides: Dict[str, Any] = Field(default_factory=dict, description="Attributes to alter (e.g. contract, weekly_watch_hours)")


class SimulationResponse(BaseModel):
    customer_id: str
    baseline: PredictionResponse
    simulated: PredictionResponse
    probability_delta: float
    risk_reduced: bool
    protected_revenue_inr: float
    summary: str
