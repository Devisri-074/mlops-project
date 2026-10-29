from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class DashboardSummary(BaseModel):
    total_customers: int
    active_customers: int
    churned_customers: int
    churn_rate: float
    high_risk_customers: int
    high_risk_percentage: float
    average_churn_probability: float
    average_monthly_charges: float
    average_tenure: float
    average_watch_hours: float
    total_predictions: int


class PlanDistribution(BaseModel):
    plan: str
    count: int
    churn_rate: float


class RiskDistribution(BaseModel):
    risk_level: str
    count: int
    percentage: float
    color: str


class MonthlyTrend(BaseModel):
    month: str
    active: int
    churned: int
    predictions: int


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    plan_distribution: List[PlanDistribution]
    risk_distribution: List[RiskDistribution]
    monthly_trend: List[MonthlyTrend]
    churn_by_contract: List[Dict[str, Any]]
    churn_by_device: List[Dict[str, Any]]
    churn_by_payment: List[Dict[str, Any]]
