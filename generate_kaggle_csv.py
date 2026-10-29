"""
Generates standard Kaggle-style CSV dataset for ChurnWise OTT Subscriber Churn
"""
import os
import pandas as pd
import numpy as np

def create_kaggle_csv():
    np.random.seed(42)
    n_samples = 5000
    
    platforms = np.random.choice(["Netflix", "Amazon Prime Video", "Spotify", "JioHotstar"], size=n_samples, p=[0.4, 0.25, 0.2, 0.15])
    customer_ids = [f"{platforms[i][:4].upper()}-{1000 + i}" for i in range(n_samples)]
    
    first_names = ["Aarav", "Priya", "Rahul", "Ananya", "Rohan", "Sneha", "Vikram", "Neha", "Aditya", "Pooja", "Arjun", "Kavya", "Varun", "Isha", "Siddharth", "Meera", "Deepak", "Tanvi", "Amit", "Rhea"]
    last_names = ["Sharma", "Verma", "Patel", "Reddy", "Mehta", "Chopra", "Nair", "Iyer", "Kapoor", "Singh", "Joshi", "Bhat", "Deshmukh", "Chowdhury", "Rao", "Gupta", "Kulkarni", "Das", "Menon", "Saxena"]
    
    names = [f"{np.random.choice(first_names)} {np.random.choice(last_names)}" for _ in range(n_samples)]
    emails = [f"{n.lower().replace(' ', '.')}{np.random.randint(10, 99)}@gmail.com" for n in names]
    
    tenures = np.random.randint(1, 48, size=n_samples)
    contracts = np.random.choice(["Monthly", "Annual", "Two-Year"], size=n_samples, p=[0.50, 0.35, 0.15])
    payment_methods = np.random.choice(["UPI AutoPay", "Credit Card", "Net Banking", "Manual UPI"], size=n_samples, p=[0.45, 0.30, 0.15, 0.10])
    plans = np.random.choice(["Basic 720p", "Standard 1080p", "Premium 4K", "Mobile 480p"], size=n_samples, p=[0.25, 0.40, 0.25, 0.10])
    devices = np.random.choice(["Smart TV", "Mobile (Android / iOS)", "Laptop / Web", "Streaming Stick"], size=n_samples, p=[0.45, 0.30, 0.15, 0.10])
    
    watch_hours = np.round(np.random.uniform(1.0, 35.0, size=n_samples), 1)
    support_tickets = np.random.choice([0, 1, 2, 3, 4, 5], size=n_samples, p=[0.45, 0.25, 0.15, 0.08, 0.04, 0.03])
    num_profiles = np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.2, 0.4, 0.2, 0.15, 0.05])
    
    monthly_charges = np.where(
        plans == "Premium 4K", 799.0,
        np.where(plans == "Standard 1080p", 499.0,
        np.where(plans == "Basic 720p", 299.0, 149.0))
    )
    total_charges = np.round(monthly_charges * tenures, 2)
    
    risk_score = 0.0
    risk_score += np.where(watch_hours < 4.0, 35.0, np.where(watch_hours > 20.0, -25.0, 0.0))
    risk_score += np.where(support_tickets >= 3, 30.0, np.where(support_tickets == 0, -15.0, 0.0))
    risk_score += np.where(contracts == "Monthly", 25.0, -30.0)
    risk_score += np.where(tenures <= 3, 22.0, np.where(tenures >= 18, -25.0, 0.0))
    risk_score += np.where(payment_methods == "Manual UPI", 18.0, -12.0)
    
    noise = np.random.normal(0, 5, size=n_samples)
    final_score = risk_score + noise
    churn = np.where(final_score > 10.0, "Churned", "Active")
    
    df = pd.DataFrame({
        "CustomerID": customer_ids,
        "CustomerName": names,
        "Email": emails,
        "Platform": platforms,
        "SubscriptionPlan": plans,
        "DeviceType": devices,
        "TenureMonths": tenures,
        "ContractType": contracts,
        "PaymentMethod": payment_methods,
        "WeeklyWatchHours": watch_hours,
        "SupportTickets": support_tickets,
        "NumProfiles": num_profiles,
        "MonthlyChargesINR": monthly_charges,
        "TotalChargesINR": total_charges,
        "ChurnStatus": churn
    })
    
    # Save to root and data folder
    os.makedirs("data", exist_ok=True)
    df.to_csv("data/kaggle_ott_streaming_churn_dataset.csv", index=False)
    df.to_csv("streaming_churn_dataset.csv", index=False)
    print(f"[SUCCESS] Generated 5,000 samples Kaggle CSV dataset: streaming_churn_dataset.csv and data/kaggle_ott_streaming_churn_dataset.csv")

if __name__ == "__main__":
    create_kaggle_csv()
