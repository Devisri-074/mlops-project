-- ======================================================================
-- ChurnWise PRO - Multi-Platform Streaming & OTT Churn Intelligence System
-- Supports: Netflix, Amazon Prime Video, Spotify, JioHotstar
-- MySQL Database Schema & Analytical Queries for MySQL Workbench
-- ======================================================================

-- 1. Create and Switch to Database
CREATE DATABASE IF NOT EXISTS churnwise_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE churnwise_db;

-- 2. Create Accounts Table (Authentication & Access Control)
CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Data Analyst', 'Retention Lead', 'Viewer') DEFAULT 'Data Analyst',
  title VARCHAR(100),
  department VARCHAR(100),
  avatar VARCHAR(10),
  avatarColor VARCHAR(20) DEFAULT '#E50914',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Create Multi-Platform Streaming Subscribers (Customers) Table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  platform ENUM('Netflix', 'Amazon Prime Video', 'Spotify', 'JioHotstar') NOT NULL DEFAULT 'Netflix',
  company VARCHAR(100) DEFAULT 'Streaming Subscriber',
  plan VARCHAR(60) NOT NULL DEFAULT 'Standard',
  subscriptionPlan VARCHAR(60) DEFAULT 'Standard',
  deviceType VARCHAR(60) DEFAULT 'Smart TV',
  age INT DEFAULT 28,
  gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
  tenure INT NOT NULL DEFAULT 1 COMMENT 'Subscription tenure in months',
  monthlyCharges DECIMAL(10, 2) NOT NULL DEFAULT 499.00 COMMENT 'Monthly Subscription Fee (INR)',
  totalCharges DECIMAL(12, 2) NOT NULL DEFAULT 499.00,
  contract ENUM('Monthly', 'Annual', 'Two-Year') NOT NULL DEFAULT 'Annual',
  paymentMethod VARCHAR(50) DEFAULT 'UPI AutoPay',
  supportTickets INT NOT NULL DEFAULT 0 COMMENT 'Streaming/buffering/ad complaints count',
  watchHoursPerWeek DECIMAL(5, 2) DEFAULT 15.0 COMMENT 'Average weekly watch / listening hours',
  numProfiles INT DEFAULT 2 COMMENT 'Active user profiles / accounts',
  streamingTV ENUM('Yes', 'No') DEFAULT 'Yes',
  streamingMovies ENUM('Yes', 'No') DEFAULT 'Yes',
  downloadOffline ENUM('Yes', 'No') DEFAULT 'Yes',
  churn ENUM('Active', 'Churned') NOT NULL DEFAULT 'Active',
  risk_score INT DEFAULT 25,
  risk_level VARCHAR(30) DEFAULT 'Low Risk',
  joinedDate DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_platform (platform),
  INDEX idx_churn (churn),
  INDEX idx_plan (plan),
  INDEX idx_tenure (tenure),
  INDEX idx_watch_hours (watchHoursPerWeek)
);

-- 4. Create AI Churn Predictions Log Table
CREATE TABLE IF NOT EXISTS predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id VARCHAR(20),
  customer_name VARCHAR(100),
  churn_probability INT NOT NULL COMMENT 'Churn risk probability percentage 0-100',
  risk_level ENUM('Low Risk', 'Moderate Risk', 'High Risk', 'Critical Risk') NOT NULL,
  risk_color VARCHAR(20),
  confidence INT DEFAULT 94,
  top_factors JSON COMMENT 'Key negative churn risk drivers with impact weights',
  positive_drivers JSON COMMENT 'Protective retention drivers',
  recommendations JSON COMMENT 'Actionable retention interventions',
  predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_risk_level (risk_level),
  INDEX idx_predicted_at (predicted_at)
);

-- 5. Seed Enterprise Accounts
INSERT INTO accounts (id, name, email, password, role, title, department, avatar, avatarColor)
VALUES 
  ('ACC-00', 'Devisri chowdary Koya', 'devisrichowdaryk@gmail.com', 'admin', 'Admin', 'Head of Subscriber Retention', 'Global OTT Growth & Retention', 'DC', '#E50914'),
  ('ACC-01', 'Demo Enterprise User', 'demo@churnwise.com', 'demo123', 'Admin', 'Head of Operations', 'Executive Strategy', 'DU', '#E50914'),
  ('ACC-02', 'OTT Operations Lead', 'admin@churnwise.com', 'admin', 'Admin', 'VP of Streaming Operations', 'Multi-Platform Strategy', 'OL', '#00A8E1'),
  ('ACC-03', 'Marcus Chen', 'analyst@churnwise.com', 'admin', 'Data Analyst', 'Lead Churn & Retention Analyst', 'Streaming Intelligence', 'MC', '#1DB954')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 6. Seed Multi-Platform Subscribers Data (Netflix, Amazon Prime, Spotify, JioHotstar)
INSERT INTO customers (id, name, email, phone, platform, company, plan, subscriptionPlan, deviceType, age, gender, tenure, monthlyCharges, totalCharges, contract, paymentMethod, supportTickets, watchHoursPerWeek, numProfiles, streamingTV, streamingMovies, downloadOffline, churn, risk_score, risk_level, joinedDate)
VALUES
  -- Netflix
  ('NFLX-101', 'Aarav Sharma', 'aarav.sharma@example.com', '+91 98450 12345', 'Netflix', 'Netflix Family', 'Premium (4K + HDR)', 'Premium (4K + HDR)', 'Smart TV (Samsung OLED)', 28, 'Male', 18, 799.00, 14382.00, 'Annual', 'UPI AutoPay', 0, 26.5, 4, 'Yes', 'Yes', 'Yes', 'Active', 12, 'Low Risk', '2023-03-15'),
  ('NFLX-102', 'Priya Patel', 'priya.patel@example.com', '+91 98230 45678', 'Netflix', 'Netflix Personal', 'Standard (1080p FHD)', 'Standard (1080p FHD)', 'Apple TV 4K', 32, 'Female', 14, 649.00, 9086.00, 'Annual', 'Credit Card', 0, 19.0, 2, 'Yes', 'Yes', 'Yes', 'Active', 15, 'Low Risk', '2023-07-20'),
  ('NFLX-103', 'Vikram Reddy', 'vikram.reddy@example.com', '+91 97120 78901', 'Netflix', 'Netflix Individual', 'Mobile (480p SD)', 'Mobile (480p SD)', 'Mobile (Android)', 22, 'Male', 2, 199.00, 398.00, 'Monthly', 'UPI', 4, 3.2, 1, 'No', 'Yes', 'No', 'Churned', 92, 'Critical Risk', '2024-07-10'),
  ('NFLX-104', 'Sneha Rao', 'sneha.rao@example.com', '+91 96540 23456', 'Netflix', 'Netflix Duo', 'Standard (1080p FHD)', 'Standard (1080p FHD)', 'iPad Pro / Tablet', 29, 'Female', 30, 649.00, 19470.00, 'Annual', 'Credit Card', 1, 21.0, 2, 'Yes', 'Yes', 'Yes', 'Active', 14, 'Low Risk', '2022-03-01'),

  -- Amazon Prime Video
  ('AMZN-201', 'Rahul Verma', 'rahul.verma@example.com', '+91 98330 11223', 'Amazon Prime Video', 'Prime All-Access', 'Prime Annual (Video + Delivery)', 'Prime Annual (Video + Delivery)', 'Fire TV Stick 4K', 31, 'Male', 24, 125.00, 3000.00, 'Annual', 'Amazon Pay UPI', 0, 22.0, 3, 'Yes', 'Yes', 'Yes', 'Active', 14, 'Low Risk', '2022-08-10'),
  ('AMZN-202', 'Ananya Iyer', 'ananya.iyer@example.com', '+91 99000 22334', 'Amazon Prime Video', 'Prime Monthly Pass', 'Prime Monthly (Video Only)', 'Prime Monthly (Video Only)', 'Mobile (iPhone 15)', 25, 'Female', 2, 299.00, 598.00, 'Monthly', 'Credit Card', 3, 3.5, 1, 'No', 'Yes', 'No', 'Active', 74, 'High Risk', '2024-07-01'),
  ('AMZN-203', 'Sanjay Gupta', 'sanjay.gupta@example.com', '+91 98111 33445', 'Amazon Prime Video', 'Prime Lite Plan', 'Prime Lite (HD 720p)', 'Prime Lite (HD 720p)', 'Smart TV (Sony)', 44, 'Male', 12, 67.00, 804.00, 'Annual', 'Net Banking', 1, 15.0, 2, 'Yes', 'Yes', 'No', 'Active', 22, 'Low Risk', '2023-08-15'),
  ('AMZN-204', 'Divya Menon', 'divya.menon@example.com', '+91 97450 44556', 'Amazon Prime Video', 'Prime Monthly', 'Prime Monthly (Video Only)', 'Prime Monthly (Video Only)', 'Web Browser (Chrome)', 27, 'Female', 3, 299.00, 897.00, 'Monthly', 'Debit Card', 5, 2.0, 1, 'No', 'No', 'No', 'Churned', 88, 'Critical Risk', '2024-05-20'),

  -- Spotify
  ('SPOT-301', 'Arjun Kapoor', 'arjun.kapoor@example.com', '+91 98765 55667', 'Spotify', 'Spotify Music Lover', 'Premium Individual (Lossless)', 'Premium Individual (Lossless)', 'Mobile (Android Auto / Car)', 23, 'Male', 20, 119.00, 2380.00, 'Monthly', 'UPI AutoPay', 0, 35.0, 1, 'No', 'No', 'Yes', 'Active', 10, 'Low Risk', '2023-01-10'),
  ('SPOT-302', 'Neha Singhal', 'neha.singhal@example.com', '+91 98220 66778', 'Spotify', 'Spotify Family Plan', 'Premium Family (6 Accounts)', 'Premium Family (6 Accounts)', 'Smart Speaker (Alexa/Sonos)', 33, 'Female', 28, 179.00, 5012.00, 'Annual', 'Credit Card', 0, 42.0, 6, 'No', 'No', 'Yes', 'Active', 8, 'Low Risk', '2022-04-12'),
  ('SPOT-303', 'Rohit Malhotra', 'rohit.malhotra@example.com', '+91 97111 77889', 'Spotify', 'Spotify Free Tier', 'Free with Audio Ads', 'Free with Audio Ads', 'Mobile (iOS)', 20, 'Male', 1, 0.00, 0.00, 'Monthly', 'None', 4, 2.2, 1, 'No', 'No', 'No', 'Churned', 90, 'Critical Risk', '2024-08-01'),
  ('SPOT-304', 'Tanya Sen', 'tanya.sen@example.com', '+91 99880 88990', 'Spotify', 'Spotify Campus Plan', 'Premium Student (50% Off)', 'Premium Student (50% Off)', 'iPad Pro / Mac', 21, 'Female', 8, 59.00, 472.00, 'Monthly', 'UPI AutoPay', 0, 24.0, 1, 'No', 'No', 'Yes', 'Active', 16, 'Low Risk', '2023-12-15'),

  -- JioHotstar
  ('JHOT-401', 'Karthik Subramanian', 'karthik.sub@example.com', '+91 98455 99001', 'JioHotstar', 'JioHotstar VIP Sports', 'Premium 4K Annual (4 Screens)', 'Premium 4K Annual (4 Screens)', 'Smart TV (LG OLED 4K)', 30, 'Male', 22, 125.00, 2750.00, 'Annual', 'UPI AutoPay', 0, 28.0, 4, 'Yes', 'Yes', 'Yes', 'Active', 11, 'Low Risk', '2022-10-05'),
  ('JHOT-402', 'Meera Nambiar', 'meera.nambiar@example.com', '+91 98110 00112', 'JioHotstar', 'JioHotstar Duo', 'Super (1080p FHD 2 Screens)', 'Super (1080p FHD 2 Screens)', 'Smart TV (Mi TV)', 29, 'Female', 15, 75.00, 1125.00, 'Annual', 'Credit Card', 1, 16.5, 2, 'Yes', 'Yes', 'Yes', 'Active', 18, 'Low Risk', '2023-06-10'),
  ('JHOT-403', 'Varun Joshi', 'varun.joshi@example.com', '+91 97220 11224', 'JioHotstar', 'Hotstar Cricket Only', 'Mobile Only (480p 1 Screen)', 'Mobile Only (480p 1 Screen)', 'Mobile (Android)', 22, 'Male', 2, 49.00, 98.00, 'Monthly', 'UPI', 5, 2.5, 1, 'No', 'No', 'No', 'Churned', 94, 'Critical Risk', '2024-07-15'),
  ('JHOT-404', 'Ritu Saxena', 'ritu.saxena@example.com', '+91 99000 22335', 'JioHotstar', 'Hotstar Entertainment', 'Super (1080p FHD 2 Screens)', 'Super (1080p FHD 2 Screens)', 'Fire TV Stick', 36, 'Female', 3, 75.00, 225.00, 'Monthly', 'UPI', 3, 4.0, 2, 'Yes', 'Yes', 'No', 'Active', 72, 'High Risk', '2024-06-20')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 7. Seed Sample AI Predictions Log
INSERT INTO predictions (customer_id, customer_name, churn_probability, risk_level, risk_color, confidence, top_factors, positive_drivers, recommendations)
VALUES
  ('NFLX-103', 'Vikram Reddy', 92, 'Critical Risk', 'red', 95, 
   '["Low streaming watch time (< 4 hrs/week) (+32%)", "4 buffering complaints (+26%)", "Month-to-month subscription (+22%)"]',
   '[]',
   '["Deploy personalized email highlighting trending series", "Offer 50% discount to upgrade to Standard plan"]'),
  ('SPOT-303', 'Rohit Malhotra', 90, 'Critical Risk', 'red', 95,
   '["Low audio listening time (< 4 hrs/week) (+34%)", "4 audio ad complaints (+26%)", "Free tier friction (+14%)"]',
   '[]',
   '["Offer 3 months Spotify Premium trial for ₹59", "Push curated Daily Mix playlist update"]'),
  ('JHOT-403', 'Varun Joshi', 94, 'Critical Risk', 'red', 96,
   '["Post-tournament engagement drop (+32%)", "5 buffering complaints (+26%)", "Mobile single screen (+14%)"]',
   '[]',
   '["Promote upcoming ICC & Premier League live streaming schedule with VIP pass"]');

-- ======================================================================
-- 📊 USEFUL MYSQL WORKBENCH QUERIES (RUN THESE IN WORKBENCH FOR VIVA DEMO)
-- ======================================================================

-- Query 1: Cross-Platform Subscriber Churn Rate & Engagement Summary
SELECT 
  platform AS 'Streaming Platform',
  COUNT(*) AS 'Total Subscribers',
  SUM(CASE WHEN churn = 'Active' THEN 1 ELSE 0 END) AS 'Active Count',
  SUM(CASE WHEN churn = 'Churned' THEN 1 ELSE 0 END) AS 'Churned Count',
  ROUND(SUM(CASE WHEN churn = 'Churned' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS 'Churn Rate %',
  ROUND(AVG(watchHoursPerWeek), 1) AS 'Avg Weekly Stream Hrs',
  ROUND(AVG(monthlyCharges), 2) AS 'Avg Monthly Revenue (INR)'
FROM customers
GROUP BY platform
ORDER BY 'Total Subscribers' DESC;

-- Query 2: High Churn Risk Subscribers across all platforms
SELECT 
  id AS 'Subscriber ID',
  name AS 'Subscriber Name',
  platform AS 'Platform',
  plan AS 'Plan Tier',
  watchHoursPerWeek AS 'Weekly Hours',
  supportTickets AS 'Complaints',
  churn AS 'Status',
  risk_level AS 'Risk Category'
FROM customers
WHERE risk_level IN ('High Risk', 'Critical Risk')
ORDER BY watchHoursPerWeek ASC;

-- Query 3: Recent AI Prediction Audit Trail
SELECT 
  p.id AS 'Log ID',
  p.customer_id AS 'Subscriber ID',
  p.customer_name AS 'Subscriber Name',
  p.churn_probability AS 'Risk %',
  p.risk_level AS 'Risk Tier',
  p.predicted_at AS 'Evaluation Date'
FROM predictions p
ORDER BY p.predicted_at DESC;
