import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { NetflixLogo, PrimeVideoLogo, SpotifyLogo, DisneyHotstarLogo, ChurnWiseLogo } from "../components/BrandLogos";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Admin",
    department: "Customer Success",
    password: "",
    confirm: "",
    agreed: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Password Strength Criteria
  const passwordCriteria = useMemo(() => {
    const pwd = form.password;
    return {
      hasLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[^A-Za-z0-9]/.test(pwd)
    };
  }, [form.password]);

  const strengthScore = useMemo(() => {
    if (!form.password) return 0;
    let score = 0;
    if (passwordCriteria.hasLength) score += 25;
    if (passwordCriteria.hasUpper && passwordCriteria.hasLower) score += 25;
    if (passwordCriteria.hasNumber) score += 25;
    if (passwordCriteria.hasSpecial) score += 25;
    return score;
  }, [form.password, passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (strengthScore === 0) return "";
    if (strengthScore <= 50) return "weak";
    if (strengthScore <= 75) return "medium";
    return "strong";
  }, [strengthScore]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please provide your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please provide your email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.agreed) {
      setError("Please accept the terms and privacy policy to continue.");
      return;
    }

    setIsLoading(true);
    try {
      const defaultTitle =
        form.role === "Data Analyst"
          ? "Data Analyst"
          : form.role === "Retention Lead"
          ? "Customer Success Lead"
          : "Operations Administrator";

      const newUser = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        title: defaultTitle,
        department: form.department
      });

      toast.success(`Account created! Welcome to ChurnWise, ${newUser?.name || "Administrator"}!`);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create account.");
      toast.error(err.message || "Account creation failed");
    } finally {
      setIsLoading(false);
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
            <Sparkles size={13} /> INSTANT STREAMING WORKSPACE SETUP
          </span>
          <h1>
            Empower your team with <span>smart retention tools.</span>
          </h1>
          <p>
            Create your high-performance streaming analytics environment. Monitor live risk factors for <strong>Netflix, Prime Video, Spotify, and Disney+ Hotstar</strong>.
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

          <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", color: "#cbd5e1" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.2)", color: "#34d399", display: "grid", placeItems: "center", fontSize: "12px" }}>✓</div>
              <span>Multi-Platform Churn Risk ML algorithms</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", color: "#cbd5e1" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.2)", color: "#34d399", display: "grid", placeItems: "center", fontSize: "12px" }}>✓</div>
              <span>Interactive "What-If" retention strategy simulator</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", color: "#cbd5e1" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.2)", color: "#34d399", display: "grid", placeItems: "center", fontSize: "12px" }}>✓</div>
              <span>Synchronized with MySQL database (churnwise_db)</span>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          <p style={{ fontSize: "12px", color: "#64748b" }}>
            SOC2 Type II certified · Role-based team provisioning
          </p>
        </div>
      </section>

      {/* Right Form Section */}
      <section className="auth-form-section" style={{ overflowY: "auto" }}>
        <div className="auth-card-container animate-fade-in" style={{ padding: "20px 0" }}>
          <div className="auth-header-block">
            <span className="eyebrow blue">GET STARTED</span>
            <h2>Create Your Account</h2>
            <p>Start managing customer retention with predictive intelligence.</p>
          </div>

          {error && (
            <div className="field-error-message" style={{ padding: "10px 14px", background: "var(--color-danger-bg)", borderRadius: "var(--radius-md)" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }} autoComplete="off">
            <div className="form-grid-2">
              <div className="field-container">
                <label className="field-label">Full Name *</label>
                <div className="field-control">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={update}
                    placeholder="Enter your name"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="field-container">
                <label className="field-label">Work Email *</label>
                <div className="field-control">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={update}
                    placeholder="name@company.com"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="field-container">
              <label className="field-label">System Role</label>
              <div className="field-control">
                <select name="role" value={form.role} onChange={update}>
                  <option value="Admin">Administrator (Full Access)</option>
                  <option value="Data Analyst">Data Analyst (Analytics & Models)</option>
                  <option value="Retention Lead">Retention Lead (Customer Success)</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="field-container">
                <label className="field-label">Password *</label>
                <div className="password-input-wrap field-control">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={update}
                    placeholder="Create a password"
                    autoComplete="new-password"
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

              <div className="field-container">
                <label className="field-label">Confirm Password *</label>
                <div className="field-control">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirm"
                    value={form.confirm}
                    onChange={update}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password strength visual meter */}
            {form.password && (
              <div>
                <div className="password-strength-bar">
                  <div className={`strength-indicator ${strengthLabel}`} />
                </div>
                <div className="strength-hints">
                  <span>Security Strength: <strong style={{ textTransform: "capitalize" }}>{strengthLabel || "Low"}</strong></span>
                  <span>{passwordCriteria.hasLength ? "✓ 8+ chars" : "• 8+ chars"} {passwordCriteria.hasNumber ? "✓ number" : "• number"}</span>
                </div>
              </div>
            )}

            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12.5px", color: "var(--text-secondary)", cursor: "pointer", marginTop: "4px" }}>
              <input
                type="checkbox"
                name="agreed"
                checked={form.agreed}
                onChange={update}
                style={{ width: "16px", height: "16px", marginTop: "2px" }}
                required
              />
              <span>
                I agree to the ChurnWise Enterprise Terms of Service and Privacy Policy.
              </span>
            </label>

            <button className="primary-btn full" type="submit" disabled={isLoading} style={{ height: "44px", fontSize: "14px", marginTop: "6px" }}>
              {isLoading ? "Creating Account..." : "Create Workspace Account"} <ArrowRight size={17} />
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "8px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--brand-primary)", fontWeight: "700" }}>
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}