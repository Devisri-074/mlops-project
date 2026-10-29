import React, { useState } from "react";
import {
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Mail,
  KeyRound,
  AlertCircle
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { NetflixLogo, PrimeVideoLogo, SpotifyLogo, DisneyHotstarLogo, ChurnWiseLogo } from "../components/BrandLogos";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  const { login, requestPasswordReset, verifyAndResetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await login(email, password, rememberMe);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password. Please check your credentials.");
      toast.error(err.message || "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);
    try {
      const res = await requestPasswordReset(resetEmail);
      setGeneratedCode(res.simulatedCode);
      setResetStep(2);
      toast.info(`Verification code sent to ${resetEmail}: ${res.simulatedCode}`);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setResetError("");

    if (newPassword.length < 6) {
      setResetError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setResetLoading(true);
    try {
      await verifyAndResetPassword(resetEmail, resetCode, newPassword);
      toast.success("Password reset successfully! You can now sign in.");
      setForgotModalOpen(false);
      setResetStep(1);
      setEmail(resetEmail);
      setPassword("");
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-page-modern">
      {/* Left Visual Hero with Official Streaming Logos */}
      <section
        className="auth-hero-section"
        style={{
          background: "radial-gradient(circle at 20% 30%, rgba(229, 9, 20, 0.15) 0%, rgba(10, 14, 26, 0.95) 50%, rgba(5, 8, 15, 1) 100%)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div className="auth-hero-brand">
          <ChurnWiseLogo height={36} />
        </div>

        <div className="auth-hero-copy">
          <span className="eyebrow cyan">
            <Sparkles size={13} /> MULTI-PLATFORM RETENTION AI
          </span>
          <h1>
            Predict streaming churn <span>across every platform.</span>
          </h1>
          <p>
            Real-time subscriber risk scoring, binge engagement analytics, and automated retention playbooks for <strong>Netflix, Amazon Prime Video, Spotify, and Disney+ Hotstar</strong>.
          </p>

          {/* Official Streaming Logos Showcase Strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", margin: "20px 0" }}>
            <div style={{ padding: "8px 12px", borderRadius: "10px", background: "rgba(20, 10, 15, 0.8)", border: "1px solid rgba(229, 9, 20, 0.35)", display: "flex", alignItems: "center" }}>
              <NetflixLogo height={18} />
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "10px", background: "rgba(5, 20, 35, 0.8)", border: "1px solid rgba(0, 168, 225, 0.35)", display: "flex", alignItems: "center" }}>
              <PrimeVideoLogo height={18} />
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "10px", background: "rgba(5, 30, 18, 0.8)", border: "1px solid rgba(29, 185, 84, 0.35)", display: "flex", alignItems: "center" }}>
              <SpotifyLogo height={18} />
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "10px", background: "rgba(5, 18, 40, 0.8)", border: "1px solid rgba(0, 99, 229, 0.35)", display: "flex", alignItems: "center" }}>
              <DisneyHotstarLogo height={18} />
            </div>
          </div>

          <div className="auth-floating-metrics">
            <div className="floating-metric-card">
              <small>Average Churn Reduction</small>
              <strong>-38.4%</strong>
              <span>Across 4 major streaming services</span>
            </div>
            <div className="floating-metric-card">
              <small>Prediction Accuracy</small>
              <strong>94.2%</strong>
              <span>Multi-variable ML confidence</span>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
            🔒 256-bit SSL encrypted · Connected to MySQL Database (churnwise_db)
          </p>
        </div>
      </section>

      {/* Right Form Section */}
      <section className="auth-form-section">
        <div className="auth-card-container animate-fade-in">
          <div className="auth-header-block">
            <span className="eyebrow blue">SECURE ACCESS</span>
            <h2>Sign in to ChurnWise</h2>
            <p>Enter your account credentials to access your workspace.</p>
          </div>

          {error && (
            <div className="field-error-message" style={{ padding: "10px 14px", background: "var(--color-danger-bg)", borderRadius: "var(--radius-md)" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "grid", gap: "16px" }}>
            <div className="field-container">
              <label className="field-label">Email Address</label>
              <div className="field-control">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="field-container">
              <div className="field-label-row">
                <label className="field-label">Password</label>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => {
                    setResetEmail(email);
                    setForgotModalOpen(true);
                  }}
                  style={{ fontSize: "11.5px" }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="password-input-wrap field-control">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "var(--text-secondary)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: "15px", height: "15px" }}
                />
                Remember me on this device
              </label>
            </div>

            <button className="primary-btn full" type="submit" disabled={isLoading} style={{ height: "44px", fontSize: "14px" }}>
              {isLoading ? "Signing in..." : "Sign In"} <ArrowRight size={17} />
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "8px" }}>
            Don't have an account yet?{" "}
            <Link to="/signup" style={{ color: "var(--brand-primary)", fontWeight: "700" }}>
              Sign up here
            </Link>
          </p>
        </div>
      </section>

      {/* Interactive Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setForgotModalOpen(false)}>
          <div className="modal-dialog animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-icon-wrap primary">
              <KeyRound size={24} />
            </div>
            <div className="modal-content-body">
              <h3>Reset Your Password</h3>
              <p>
                {resetStep === 1
                  ? "Enter your registered email address to receive a 6-digit verification code."
                  : resetStep === 2
                  ? "Enter the verification code and choose your new password."
                  : "Password update completed."}
              </p>
            </div>

            {resetError && (
              <div className="field-error-message" style={{ padding: "8px 12px", background: "var(--color-danger-bg)", borderRadius: "var(--radius-sm)" }}>
                <AlertCircle size={15} />
                <span>{resetError}</span>
              </div>
            )}

            {resetStep === 1 && (
              <form onSubmit={handleSendResetCode} style={{ display: "grid", gap: "14px" }}>
                <div className="field-container">
                  <label className="field-label">Registered Email</label>
                  <div className="field-control">
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer-actions">
                  <button type="button" className="secondary-btn" onClick={() => setForgotModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn" disabled={resetLoading}>
                    {resetLoading ? "Sending..." : "Send Verification Code"}
                  </button>
                </div>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleVerifyAndReset} style={{ display: "grid", gap: "14px" }}>
                <div className="field-container">
                  <label className="field-label">6-Digit Verification Code</label>
                  <div className="field-control">
                    <input
                      type="text"
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. 123456"
                      required
                      style={{ letterSpacing: "4px", fontWeight: "700", textAlign: "center" }}
                    />
                  </div>
                </div>

                <div className="field-container">
                  <label className="field-label">New Password</label>
                  <div className="field-control">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>
                </div>

                <div className="field-container">
                  <label className="field-label">Confirm New Password</label>
                  <div className="field-control">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer-actions">
                  <button type="button" className="secondary-btn" onClick={() => setResetStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="primary-btn" disabled={resetLoading}>
                    {resetLoading ? "Updating..." : "Set New Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}