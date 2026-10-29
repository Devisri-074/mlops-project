from pydantic import BaseModel, Field
try:
    import email_validator
    from pydantic import EmailStr
except ImportError:
    EmailStr = str
from typing import Optional, List, Any
from datetime import datetime


class CustomerBase(BaseModel):
    name: str = Field(..., example="Aarav Sharma")
    email: EmailStr = Field(..., example="aarav.sharma@example.com")
    phone: Optional[str] = Field(None, example="+91 98765 43210")
    company: Optional[str] = Field("Netflix Personal", example="Netflix Premium Tier")
    
    # Subscription & Netflix Streaming Parameters
    subscription_plan: str = Field("Standard", example="Standard")  # Mobile, Basic, Standard, Premium
    device_type: str = Field("Smart TV", example="Smart TV")       # Smart TV, Mobile, Tablet, Web, Game Console
    gender: str = Field("Male", example="Male")
    age: int = Field(28, ge=16, le=100, example=28)
    tenure: int = Field(6, ge=1, le=120, example=6)                # Months
    monthly_charges: float = Field(649.0, ge=0, example=649.0)
    total_charges: Optional[float] = Field(None, example=3894.0)
    contract: str = Field("Monthly", example="Monthly")            # Monthly, Annual
    payment_method: str = Field("Credit Card", example="Credit Card")  # UPI, Credit Card, Bank Transfer, PayPal
    support_tickets: int = Field(0, ge=0, example=0)
    watch_hours_per_week: float = Field(14.5, ge=0, example=14.5)
    num_profiles: int = Field(2, ge=1, le=5, example=2)
    streaming_tv: str = Field("Yes", example="Yes")
    streaming_movies: str = Field("Yes", example="Yes")
    download_offline: str = Field("Yes", example="Yes")
    churn: Optional[str] = Field("Active", example="Active")


class CustomerCreate(CustomerBase):
    id: Optional[str] = None


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    subscription_plan: Optional[str] = None
    device_type: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    tenure: Optional[int] = None
    monthly_charges: Optional[float] = None
    total_charges: Optional[float] = None
    contract: Optional[str] = None
    payment_method: Optional[str] = None
    support_tickets: Optional[int] = None
    watch_hours_per_week: Optional[float] = None
    num_profiles: Optional[int] = None
    streaming_tv: Optional[str] = None
    streaming_movies: Optional[str] = None
    download_offline: Optional[str] = None
    churn: Optional[str] = None


class CustomerResponse(CustomerBase):
    id: str
    churn_probability: float
    risk_level: str
    risk_color: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
