from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    customer_id = Column(String(50), ForeignKey("customers.id", ondelete="CASCADE"), nullable=True)
    customer_name = Column(String(150), nullable=True)
    
    churn_prediction = Column(String(20), default="No Churn")  # Churn / No Churn
    churn_probability = Column(Float, nullable=False)          # 0 - 100 percentage
    risk_level = Column(String(50), nullable=False)            # Low Risk, Moderate Risk, High Risk, Critical Risk
    risk_color = Column(String(20), default="green")
    confidence = Column(Float, default=92.0)
    model_version = Column(String(50), default="RandomForest_v1.0")
    
    # Detailed Explainability & Factors
    top_factors = Column(JSON, nullable=True)       # Negative drivers increasing churn
    positive_drivers = Column(JSON, nullable=True)  # Protective retention signals
    recommendations = Column(JSON, nullable=True)   # Tailored retention actions
    
    predicted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="predictions")
