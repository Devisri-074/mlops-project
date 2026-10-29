from sqlalchemy import Column, String, DateTime
from datetime import datetime
from ..database import Base


class User(Base):
    __tablename__ = "accounts"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="Data Analyst")  # Admin, Data Analyst, Retention Lead, Viewer
    title = Column(String(100), default="Customer Retention Lead")
    department = Column(String(100), default="Netflix Growth & Retention")
    avatar = Column(String(10), default="CW")
    avatar_color = Column(String(20), default="#E50914")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
