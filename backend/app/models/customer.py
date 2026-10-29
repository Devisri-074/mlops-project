from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False, unique=True, index=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(100), nullable=True, default="Netflix Personal")
    
    # Netflix / Streaming specific features
    subscription_plan = Column(String(50), default="Standard")  # Mobile, Basic, Standard, Premium
    device_type = Column(String(50), default="Smart TV")       # Smart TV, Mobile, Tablet, Web, Game Console
    gender = Column(String(20), default="Male")
    age = Column(Integer, default=28)
    tenure = Column(Integer, default=6)                         # Months active
    monthly_charges = Column(Float, default=649.0)              # Monthly subscription cost
    total_charges = Column(Float, default=3894.0)               # Lifetime bill
    contract = Column(String(50), default="Monthly")            # Monthly, Annual
    payment_method = Column(String(50), default="Credit Card")  # UPI, Credit Card, Bank Transfer, PayPal
    support_tickets = Column(Integer, default=0)                # Streaming/Login issues reported
    watch_hours_per_week = Column(Float, default=14.5)          # Weekly engagement
    num_profiles = Column(Integer, default=2)                   # 1-5 active profiles
    streaming_tv = Column(String(20), default="Yes")            # Series / Shows
    streaming_movies = Column(String(20), default="Yes")        # Films
    download_offline = Column(String(20), default="Yes")        # Offline feature usage
    
    # Churn status & Risk scoring
    churn = Column(String(20), default="Active")                # Active, Churned
    churn_probability = Column(Float, default=15.0)             # 0 - 100%
    risk_level = Column(String(50), default="Low Risk")         # Low Risk, Moderate Risk, High Risk, Critical Risk
    risk_color = Column(String(20), default="green")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    predictions = relationship("Prediction", back_populates="customer", cascade="all, delete-orphan")
