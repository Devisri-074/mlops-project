import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building,
  Calendar,
  CreditCard,
  Globe,
  User,
  ShieldAlert,
  Sparkles,
  Zap,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Layers,
  DollarSign,
  History,
  Tv,
  Film,
  Clock,
  Smartphone,
  Download,
  Music,
  ShoppingBag,
  Trophy,
  Headphones
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getCustomers, deleteCustomer, updateCustomer } from "../services/customerService";
import { StatusBadge, RiskBadge, PlatformBadge, ConfirmationModal } from "../components/ProtectedForm";
import { calculateChurnRisk, simulateWhatIf, fetchSimulationFromAPI, fetchMLPrediction } from "../services/predictionEngine";
import { usePermissions } from "../components/RoleGuard";
import { useToast } from "../context/ToastContext";

const PLATFORM_PLANS = {
  "Netflix": [
    "Premium (4K + HDR)",
    "Standard (1080p FHD)",
    "Basic (720p HD)",
    "Mobile (480p SD)"
  ],
  "Amazon Prime Video": [
    "Prime Annual (Video + Delivery)",
    "Prime Monthly",
    "Prime Lite (Video Only HD)",
    "Prime Shopping Bundle"
  ],
  "Spotify": [
    "Premium Individual",
    "Premium Family (6 Accounts)",
    "Premium Duo (2 Accounts)",
    "Student Discount",
    "Free Tier (Ad-Supported)"
  ],
  "Disney+ Hotstar": [
    "Premium 4K (4 Screens)",
    "Super (1080p FHD 2 Screens)",
    "Super Monthly (FHD 2 Screens)",
    "Mobile (HD 1 Screen)"
  ]
};

import { PlatformLogo, NetflixLogo, PrimeVideoLogo, SpotifyLogo, DisneyHotstarLogo, PlatformEmblem } from "../components/BrandLogos";
import { openCustomerDataModal } from "../components/RetentionShowcase";

const PLATFORM_COLORS = {
  "Netflix": "#E50914",
  "Amazon Prime Video": "#00A8E1",
  "Spotify": "#1DB954",
  "Disney+ Hotstar": "#0063E5"
};

const PLATFORM_LOGOS = {
  "Netflix": "/images/netflix_logo.svg",
  "Amazon Prime Video": "/images/prime_logo.svg",
  "Spotify": "/images/spotify_logo.svg",
  "JioHotstar": "/images/hotstar_logo.svg"
};

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { canEditCustomer, canDeleteCustomer, canApplyStrategy } = usePermissions();
  const customer = getCustomers().find((x) => x.id === id);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // What-if simulator state
  const [simContract, setSimContract] = useState(customer?.contract || "Monthly");
  const [simPlan, setSimPlan] = useState(customer?.plan || "Standard (1080p FHD)");
  const [simWatchHours, setSimWatchHours] = useState(customer?.watchHoursPerWeek || 15);
  const [simTickets, setSimTickets] = useState(customer?.supportTickets || 0);

  if (!customer) {
    return (
      <div className="page animate-fade-in">
        <div className="panel" style={{ padding: "48px 24px", textAlign: "center" }}>
          <ShieldAlert size={40} color="var(--color-danger)" style={{ margin: "0 auto 16px" }} />
          <h3>Subscriber Record Not Found</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
            The requested subscriber ID does not exist or was deleted.
          </p>
          <button className="primary-btn" onClick={() => navigate("/customers")}>
            Back to Subscriber Directory
          </button>
        </div>
      </div>
    );
  }

  const platform = customer.platform || "Netflix";
  const isAudio = platform.toLowerCase() === "spotify";
  const availablePlans = PLATFORM_PLANS[platform] || PLATFORM_PLANS["Netflix"];
  const brandColor = PLATFORM_COLORS[platform] || "#E50914";
  const risk = customer.riskAnalysis || calculateChurnRisk(customer);

  const [simulationResult, setSimulationResult] = useState(() =>
    simulateWhatIf(customer, {
      contract: simContract,
      plan: simPlan,
      watchHoursPerWeek: Number(simWatchHours),
      supportTickets: Number(simTickets)
    })
  );

  useEffect(() => {
    let active = true;
    const overrides = {
      contract: simContract,
      plan: simPlan,
      watchHoursPerWeek: Number(simWatchHours),
      supportTickets: Number(simTickets)
    };
    const timer = setTimeout(async () => {
      try {
        const sim = await fetchSimulationFromAPI(customer, overrides);
        if (active && sim) {
          setSimulationResult(sim);
        }
      } catch (err) {}
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customer, simContract, simPlan, simWatchHours, simTickets]);

  const handleDelete = () => {
    if (!canDeleteCustomer) {
      toast.error("Permission denied: Only Administrators can delete subscriber records.");
      return;
    }
    deleteCustomer(customer.id);
    toast.success(`Subscriber ${customer.name} removed from system.`);
    navigate("/customers");
  };

  const handleApplyStrategy = () => {
    if (!canApplyStrategy) {
      toast.error("Permission denied to apply retention strategies.");
      return;
    }
    updateCustomer(customer.id, {
      contract: simContract,
      plan: simPlan,
      watchHoursPerWeek: Number(simWatchHours),
      supportTickets: Number(simTickets)
    });
    toast.success(`Retention strategy applied for ${customer.name} and synced to MySQL!`);
  };

  return (
    <div className="page animate-fade-in">
      <div className="back-row">
        <button className="back-btn" onClick={() => navigate("/customers")}>
          <ArrowLeft size={16} /> Back to Subscriber Directory
        </button>
      </div>

      {/* Hero Card with Platform Brand Logo */}
      <section
        className="panel"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "28px",
          borderLeft: `4px solid ${brandColor}`
        }}
      >
        {/* Ambient Brand Glow Backdrop */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-5%",
            width: "350px",
            height: "140%",
            background: `radial-gradient(circle, ${brandColor}22 0%, transparent 70%)`,
            pointerEvents: "none"
          }}
        />

        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div className="avatar xl" style={{ background: customer.churn === "Churned" ? "var(--color-danger)" : "var(--brand-primary)" }}>
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span className="eyebrow blue">{customer.id}</span>
                <PlatformBadge platform={platform} />
                <StatusBadge status={customer.churn} />
                <RiskBadge score={risk.probability} level={risk.riskLevel} />
              </div>
              <h2 style={{ fontSize: "26px", margin: "2px 0 6px" }}>{customer.name}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", color: "var(--text-muted)", fontSize: "12.5px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {isAudio ? <Headphones size={14} /> : <Tv size={14} />} {customer.plan || "Standard"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Mail size={14} /> {customer.email}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={14} /> {customer.phone || "+91 98000 00000"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Smartphone size={14} /> {customer.deviceType || "Smart TV"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
            <div style={{ padding: "6px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.35)", border: `1px solid ${brandColor}44`, display: "flex", alignItems: "center" }}>
              <PlatformLogo platform={platform} height={24} />
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button
                className="primary-btn"
                onClick={() => openCustomerDataModal(customer.id)}
                style={{
                  background: brandColor,
                  borderColor: brandColor,
                  boxShadow: `0 3px 10px ${brandColor}55`
                }}
              >
                <Sparkles size={15} /> Customer Retention Data
              </button>
              {canEditCustomer && (
                <button className="secondary-btn" onClick={() => navigate(`/edit-customer/${customer.id}`)}>
                  <Pencil size={15} /> Edit Record
                </button>
              )}
              {canDeleteCustomer && (
                <button className="danger-btn" onClick={() => setDeleteModalOpen(true)}>
                  <Trash2 size={15} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Subscriber Stats Metrics Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid var(--border-subtle)"
          }}
        >
          <div className="sub-stat">
            <span className="sub-stat-lbl">Subscription Plan</span>
            <span className="sub-stat-val" style={{ color: "var(--brand-primary)" }}>{customer.plan || "Standard"}</span>
          </div>
          <div className="sub-stat">
            <span className="sub-stat-lbl">{isAudio ? "Weekly Audio Listening" : "Weekly Watch Time"}</span>
            <span className="sub-stat-val">{customer.watchHoursPerWeek || 15} hrs/wk</span>
          </div>
          <div className="sub-stat">
            <span className="sub-stat-lbl">Tenure & Contract</span>
            <span className="sub-stat-val">{customer.tenure} Months ({customer.contract})</span>
          </div>
          <div className="sub-stat">
            <span className="sub-stat-lbl">Monthly & Total Spend</span>
            <span className="sub-stat-val">₹{customer.monthlyCharges}/mo · ₹{customer.totalCharges || (customer.monthlyCharges * Math.max(1, customer.tenure))}</span>
          </div>
          <div className="sub-stat">
            <span className="sub-stat-lbl">Complaints / Tickets</span>
            <span className="sub-stat-val" style={{ color: customer.supportTickets > 2 ? "var(--color-danger)" : "inherit" }}>
              {customer.supportTickets || 0} open issues
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid: AI Retention Playbook & What-If Simulator */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: "24px" }}>
        {/* Left: AI Risk Breakdown & Drivers */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} color="var(--brand-primary)" />
                <h3>AI Churn Diagnostic & Playbook</h3>
              </div>
              <p>Platform-calibrated risk factors and retention strategies</p>
            </div>
            <RiskBadge score={risk.probability} level={risk.riskLevel} />
          </div>

          <div style={{ padding: "20px" }}>
            {/* Top Risk Drivers */}
            <h4 style={{ fontSize: "12.5px", textTransform: "uppercase", color: "var(--color-danger)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={14} /> Churn Risk Drivers ({risk.topFactors?.length || 0})
            </h4>
            {risk.topFactors && risk.topFactors.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {risk.topFactors.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--color-danger-bg)",
                      border: "1px solid rgba(229, 9, 20, 0.2)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "13px", color: "var(--color-danger)", display: "block" }}>
                        {f.name}
                      </strong>
                      <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>{f.description}</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-danger)" }}>
                      {f.impact}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "20px" }}>
                No critical churn risk factors detected for this subscriber.
              </p>
            )}

            {/* Protective Signals */}
            <h4 style={{ fontSize: "12.5px", textTransform: "uppercase", color: "var(--color-success)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={14} /> Retention Strengths ({risk.positiveDrivers?.length || 0})
            </h4>
            {risk.positiveDrivers && risk.positiveDrivers.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {risk.positiveDrivers.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--color-success-bg)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "13px", color: "var(--color-success)", display: "block" }}>
                        {d.name}
                      </strong>
                      <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>{d.description}</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-success)" }}>
                      {d.impact}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Platform Retention Recommendations */}
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
              <h4 style={{ fontSize: "12.5px", textTransform: "uppercase", color: "var(--brand-primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={14} /> Recommended {platform} Retention Actions
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(risk.recommendations || []).map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "var(--bg-muted)",
                      borderLeft: "3px solid var(--brand-primary)",
                      fontSize: "12px",
                      lineHeight: "1.4"
                    }}
                  >
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right: What-If Churn Simulator */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={16} color="var(--brand-primary)" />
                <h3>What-If Retention Simulator</h3>
              </div>
              <p>Simulate subscription changes and evaluate probability drop</p>
            </div>
          </div>

          <div style={{ padding: "20px" }}>
            {/* Before vs After Impact Metric Card */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                background: "var(--bg-canvas)",
                border: "1px solid var(--border-default)",
                borderRadius: "14px",
                padding: "16px 20px",
                marginBottom: "20px",
                textAlign: "center"
              }}
            >
              <div style={{ background: risk.probability >= 50 ? "rgba(239, 68, 68, 0.08)" : "transparent", padding: "10px", borderRadius: "10px", border: risk.probability >= 50 ? "1px solid rgba(239, 68, 68, 0.25)" : "none" }}>
                <span style={{ fontSize: "10.5px", color: "var(--color-danger)", textTransform: "uppercase", fontWeight: "700", display: "block" }}>BEFORE (CURRENT)</span>
                <div style={{ fontSize: "28px", fontWeight: "900", color: risk.probability >= 50 ? "var(--color-danger)" : "var(--color-success)" }}>
                  {risk.probability}%
                </div>
                <small style={{ fontSize: "10px", color: "var(--text-muted)" }}>{customer.contract} Pass</small>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--brand-primary)", color: "#fff", display: "grid", placeItems: "center" }}>
                  ➔
                </div>
                {simulationResult.riskReduction > 0 && (
                  <span style={{ fontSize: "10.5px", fontWeight: "800", color: "var(--color-success)", marginTop: "4px" }}>
                    -{simulationResult.riskReduction}%
                  </span>
                )}
              </div>

              <div style={{ background: simulationResult.newProbability < 40 ? "rgba(16, 185, 129, 0.1)" : "transparent", padding: "10px", borderRadius: "10px", border: simulationResult.newProbability < 40 ? "1px solid rgba(16, 185, 129, 0.3)" : "none" }}>
                <span style={{ fontSize: "10.5px", color: "var(--color-success)", textTransform: "uppercase", fontWeight: "700", display: "block" }}>AFTER (SIMULATED)</span>
                <div style={{ fontSize: "28px", fontWeight: "900", color: simulationResult.newProbability >= 50 ? "var(--color-danger)" : "var(--color-success)" }}>
                  {simulationResult.newProbability}%
                </div>
                <small style={{ fontSize: "10px", color: "var(--text-muted)" }}>{simContract} Plan</small>
              </div>
            </div>

            {simulationResult.riskReduction > 0 ? (
              <div
                style={{
                  background: "var(--color-success-bg)",
                  color: "var(--color-success)",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={15} /> Strategy reduces churn probability by {simulationResult.riskReduction}%!
                </span>
                <span style={{ fontSize: "11px", fontWeight: "700" }}>
                  Retains ~₹{Math.round(customer.monthlyCharges * 12 * (simulationResult.riskReduction / 100))}/yr ARR
                </span>
              </div>
            ) : null}

            {/* Quick 1-Click Retention Offer Preset */}
            <div style={{ marginBottom: "16px", padding: "12px", background: "var(--bg-muted)", borderRadius: "10px", border: `1px dashed ${brandColor}55` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "11.5px", color: brandColor, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Zap size={13} /> Recommended {platform} Offer:
                </strong>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--color-success)" }}>
                  Expected Risk Drop: ~{Math.max(15, risk.probability - 24)}%
                </span>
              </div>
              <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", margin: "0 0 10px", lineHeight: "1.35" }}>
                {platform.includes("Netflix")
                  ? "Upgrade to 20% Discounted Annual Plan (₹519/mo) + UPI AutoPay setup."
                  : platform.includes("Prime")
                  ? "Upgrade to Prime Annual All-in-One Bundle (₹1,499/yr — Save 58%)."
                  : platform.includes("Hotstar")
                  ? "Activate 12-Month Hotstar VIP Pass (₹899/yr) + Free ICC Tournament Pass."
                  : "Switch to Spotify Premium Family / Duo at 40% OFF or 3 Months Free."}
              </p>
              <button
                type="button"
                className="primary-btn btn-sm"
                onClick={() => {
                  setSimContract("Annual");
                  setSimTickets(0);
                  setSimWatchHours(Math.max(20, (customer.watchHoursPerWeek || 15) + 6));
                  toast.success(`Applied 20% Annual Upgrade Strategy for ${platform}!`);
                }}
                style={{ width: "100%", justifyContent: "center", background: brandColor, borderColor: brandColor }}
              >
                <Sparkles size={13} /> Apply 20% Annual Retention Upgrade
              </button>
            </div>

            {/* Simulation Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                  Pass Commitment Term:
                </label>
                <select
                  value={simContract}
                  onChange={(e) => setSimContract(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "var(--bg-canvas)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                >
                  <option value="Annual">Annual Pass (Committed Discount — Low Risk)</option>
                  <option value="Monthly">Monthly Pass (Cancel Anytime — High Volatility)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                  {platform} Plan Tier:
                </label>
                <select
                  value={simPlan}
                  onChange={(e) => setSimPlan(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "var(--bg-canvas)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                >
                  {availablePlans.map((pl) => (
                    <option key={pl} value={pl}>{pl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span>Target {isAudio ? "Weekly Audio Hours" : "Weekly Watch Hours"}:</span>
                  <b>{simWatchHours} hrs/wk</b>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={simWatchHours}
                  onChange={(e) => setSimWatchHours(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--brand-primary)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span>Target Resolved Complaints (Tickets):</span>
                  <b>{simTickets}</b>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={simTickets}
                  onChange={(e) => setSimTickets(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--brand-primary)" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setSimContract(customer.contract || "Monthly");
                    setSimPlan(customer.plan || availablePlans[0]);
                    setSimWatchHours(customer.watchHoursPerWeek || 15);
                    setSimTickets(customer.supportTickets || 0);
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleApplyStrategy}
                  disabled={!canApplyStrategy}
                  style={{ background: brandColor, borderColor: brandColor }}
                >
                  <Zap size={15} /> Save Strategy to MySQL
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation Modal */}
      {deleteModalOpen && (
        <ConfirmationModal
          title="Delete Subscriber Record"
          message={`Are you sure you want to permanently delete ${customer.name} (${customer.id}) from MySQL? This action cannot be undone.`}
          confirmLabel="Yes, Delete Subscriber"
          cancelLabel="Cancel"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}