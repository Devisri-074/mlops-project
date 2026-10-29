from pydantic import BaseModel
try:
    import email_validator
    from pydantic import EmailStr
except ImportError:
    EmailStr = str
from typing import Optional


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "Data Analyst"
    title: Optional[str] = "Customer Retention Lead"
    department: Optional[str] = "Netflix Growth & Retention"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
