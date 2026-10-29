import React, { useState, useEffect, useMemo } from "react";
import { getCustomers, syncCustomersFromBackend } from "../services/customerService";
import { calculateChurnRisk } from "../services/predictionEngine";
import {
  Users,
  UserX,
  Percent,
  TrendingDown,
  Sparkles,
  DollarSign,
  BarChart3,
  Sliders,
  Zap,
  Activity,
  Layers,
  Tv,
  Film,
  Clock,
  Smartphone,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Music,
  ShoppingBag,
  Trophy
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { RiskBadge, PlatformBadge } from "../components/ProtectedForm";
import { useTheme } from "../context/ThemeContext";
import { PlatformLogo, NetflixLogo, PrimeVideoLogo, SpotifyLogo, DisneyHotstarLogo } from "../components/BrandLogos";

const PLATFORMS = [
  { id: "Netflix", name: "Netflix", logo: "/images/netflix_logo.svg", color: "#E50914", cardBg: "linear-gradient(135deg, rgba(30, 8, 12, 0.95) 0%, rgba(12, 14, 22, 0.95) 100%)" },
  { id: "Amazon Prime Video", name: "Prime Video", logo: "/images/prime_logo.svg", color: "#00A8E1", cardBg: "linear-gradient(135deg, rgba(6, 24, 42, 0.95) 0%, rgba(12, 14, 22, 0.95) 100%)" },
  { id: "Disney+ Hotstar", name: "Disney+ Hotstar", logo: "/images/hotstar_logo.svg", color: "#0063E5", cardBg: "linear-gradient(135deg, rgba(6, 18, 48, 0.95) 0%, rgba(12, 17, 34, 0.95) 100%)" },
  { id: "Spotify", name: "Spotify", logo: "/images/spotify_logo.svg", color: "#1DB954", cardBg: "linear-gradient(135deg, rgba(8, 34, 18, 0.95) 0%, rgba(12, 14, 22, 0.95) 100%)" }
];

const PLATFORM_PLANS = {
  "Netflix": {
    "Premium (4K + HDR)": 799,
    "Standard (1080p FHD)": 649,
    "Basic (720p HD)": 499,
    "Mobile (480p SD)": 199
  },
  "Amazon Prime Video": {
    "Prime Annual (Video + Delivery)": 125,
    "Prime Monthly": 299,
    "Prime Lite (Video Only HD)": 67,
    "Prime Shopping Bundle": 149
  },
  "Disney+ Hotstar": {
    "Premium 4K (4 Screens)": 125,
    "Super (1080p FHD 2 Screens)": 75,
    "Super Monthly (FHD 2 Screens)": 299,
    "Mobile (HD 1 Screen)": 49
  },
  "Spotify": {
    "Premium Individual": 119,
    "Premium Family (6 Accounts)": 179,
    "Premium Duo (2 Accounts)": 149,
    "Student Discount": 59,
    "Free Tier (Ad-Supported)": 0
  }
};

export default function Analytics() {
  const { currentPalette } = useTheme();
  const [customers, setCustomers] = useState(getCustomers());

  useEffect(() => {
    syncCustomersFromBackend().then((data) => {
      if (data && data.length > 0) setCustomers(data);
    });
  }, []);

  const total = customers.length;
  const churned = customers.filter((x) => (x.churn || "").toUpperCase() === "CHURNED").length;
  const active = total - churned;
  const churnRate = total ? Math.round((churned / total) * 100) : 0;
  const avgWatch = total
    ? Math.round((customers.reduce((s, c) => s + Number(c.watchHoursPerWeek || 15), 0) / total) * 10) / 10
    : 18.5;

  // Sandbox State for custom prediction simulator
  const [testPlatform, setTestPlatform] = useState("Netflix");
  const [testTenure, setTestTenure] = useState(3);
  const [testPlan, setTestPlan] = useState("Standard (1080p FHD)");
  const [testContract, setTestContract] = useState("Monthly");
  const [testWatchHours, setTestWatchHours] = useState(4.0);
  const [testDevice, setTestDevice] = useState("Smart TV");
  const [testTickets, setTestTickets] = useState(3);
  const [testPayment, setTestPayment] = useState("UPI AutoPay");

  const currentPlans = PLATFORM_PLANS[testPlatform] || PLATFORM_PLANS["Netflix"];

  const handlePlatformSwitch = (pId) => {
    setTestPlatform(pId);
    const plans = PLATFORM_PLANS[pId] || PLATFORM_PLANS["Netflix"];
    setTestPlan(Object.keys(plans)[0]);
  };

  const sandboxPrediction = useMemo(() => {
    return calculateChurnRisk({
      platform: testPlatform,
      tenure: testTenure,
      plan: testPlan,
      contract: testContract,
      watchHoursPerWeek: testWatchHours,
      deviceType: testDevice,
      monthlyCharges: currentPlans[testPlan] || 199,
      paymentMethod: testPayment,
      supportTickets: testTickets
    });
  }, [testPlatform, testTenure, testPlan, testContract, testWatchHours, testDevice, testPayment, testTickets, currentPlans]);

  // Platform Churn Comparison
  const platformComparison = useMemo(() => {
    return PLATFORMS.map((p) => {
      const pNorm = p.id.toLowerCase();
      const pCusts = customers.filter((c) => {
        const cNorm = (c.platform || "Netflix").toLowerCase();
        if (pNorm.includes("prime") || pNorm.includes("amazon")) return cNorm.includes("prime") || cNorm.includes("amazon");
        if (pNorm.includes("spotify")) return cNorm.includes("spotify");
        if (pNorm.includes("hotstar") || pNorm.includes("disney") || pNorm.includes("jio")) return cNorm.includes("hotstar") || cNorm.includes("disney") || cNorm.includes("jio");
        return cNorm.includes("netflix");
      });
      const pTotal = pCusts.length;
      const pChurned = pCusts.filter((c) => (c.churn || "").toUpperCase() === "CHURNED").length;
      const pRate = pTotal ? Math.round((pChurned / pTotal) * 100) : 0;
      const pAvgTime = pTotal
        ? Math.round((pCusts.reduce((s, c) => s + Number(c.watchHoursPerWeek || 15), 0) / pTotal) * 10) / 10
        : 0;

      return {
        name: p.name,
        color: p.color,
        Total: pTotal,
        Active: pTotal - pChurned,
        Churned: pChurned,
        churnRate: pRate,
        avgUsage: pAvgTime
      };
    });
  }, [customers]);

  // Platform Distribution Pie
  const platformPieData = useMemo(() => {
    return PLATFORMS.map((p) => {
      const pNorm = p.id.toLowerCase();
      const count = customers.filter((c) => {
        const cNorm = (c.platform || "Netflix").toLowerCase();
        if (pNorm.includes("prime") || pNorm.includes("amazon")) return cNorm.includes("prime") || cNorm.includes("amazon");
        if (pNorm.includes("spotify")) return cNorm.includes("spotify");
        if (pNorm.includes("hotstar") || pNorm.includes("disney") || pNorm.includes("jio")) return cNorm.includes("hotstar") || cNorm.includes("disney") || cNorm.includes("jio");
        return cNorm.includes("netflix");
      }).length;
      return {
        name: p.name,
        value: count,
        color: p.color
      };
    });
  }, [customers]);

  // Watch Time vs Churn Cohort Curve
  const watchTimeCurve = [
    {
      cohort: "< 4 hrs/wk",
      Active: customers.filter((c) => Number(c.watchHoursPerWeek || 0) < 4 && (c.churn || "").toUpperCase() !== "CHURNED").length,
      Churned: customers.filter((c) => Number(c.watchHoursPerWeek || 0) < 4 && (c.churn || "").toUpperCase() === "CHURNED").length
    },
    {
      cohort: "4–10 hrs/wk",
      Active: customers.filter((c) => Number(c.watchHoursPerWeek || 0) >= 4 && Number(c.watchHoursPerWeek || 0) < 10 && (c.churn || "").toUpperCase() !== "CHURNED").length,
      Churned: customers.filter((c) => Number(c.watchHoursPerWeek || 0) >= 4 && Number(c.watchHoursPerWeek || 0) < 10 && (c.churn || "").toUpperCase() === "CHURNED").length
    },
    {
      cohort: "10–20 hrs/wk",
      Active: customers.filter((c) => Number(c.watchHoursPerWeek || 0) >= 10 && Number(c.watchHoursPerWeek || 0) < 20 && (c.churn || "").toUpperCase() !== "CHURNED").length,
      Churned: customers.filter((c) => Number(c.watchHoursPerWeek || 0) >= 10 && Number(c.watchHoursPerWeek || 0) < 20 && (c.churn || "").toUpperCase() === "CHURNED").length
    },
    {
      cohort: "20+ hrs/wk",
      Active: customers.filter((c) => Number(c.watchHoursPerWeek || 0) >= 20 && (c.churn || "").toUpperCase() !== "CHURNED").length,
      Churned: customers.filter((c) => Number(c.watchHoursPerWeek || 0) >= 20 && (c.churn || "").toUpperCase() === "CHURNED").length
    }
  ];

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow blue">
            <Sparkles size={13} /> STREAMING SUITE INTELLIGENCE
          </span>
          <h2>Multi-Platform Churn Analytics</h2>
          <p>
            Comparative retention benchmarks across <strong>Netflix, Amazon Prime Video, Spotify, and Disney+ Hotstar</strong>.
          </p>
        </div>
      </div>

      {/* Cross-Platform Comparison Bar & Platform Share Pie */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: "1.4fr 1fr", marginBottom: "24px" }}>
        {/* Cross-Platform Churn Benchmark */}
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>Cross-Platform Churn Rate Benchmark</h3>
              <p>Churn rate percentage by streaming service</p>
            </div>
          </div>
          <div style={{ height: "260px", marginTop: "12px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformComparison} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-surface-elevated)",
                    borderColor: "var(--border-default)",
                    borderRadius: "10px",
                    boxShadow: "var(--shadow-lg)"
                  }}
                  formatter={(val) => [`${val}%`, "Churn Rate"]}
                />
                <Bar dataKey="churnRate" radius={[6, 6, 0, 0]}>
                  {platformComparison.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Platform Share Donut */}
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>Subscriber Base Share</h3>
              <p>Distribution across streaming platforms</p>
            </div>
          </div>
          <div className="pie-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={platformPieData}
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {platformPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend" style={{ flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
            {platformPieData.map((p) => (
              <span key={p.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color }} />
                {p.name}: <b>{p.value}</b>
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Engagement Curve */}
      <section className="panel chart-panel" style={{ marginBottom: "24px" }}>
        <div className="panel-head">
          <div>
            <h3>Engagement vs Retention Cohort</h3>
            <p>Weekly watch/listen hours correlation with active vs churned subscribers</p>
          </div>
        </div>
        <div style={{ height: "260px", marginTop: "12px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={watchTimeCurve} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="cohort" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-surface-elevated)",
                  borderColor: "var(--border-default)",
                  borderRadius: "10px",
                  boxShadow: "var(--shadow-lg)"
                }}
              />
              <Legend />
              <Bar dataKey="Active" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Churned" fill="#E50914" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Interactive AI Prediction Sandbox */}
      <section className="panel" style={{ borderTop: "4px solid var(--brand-primary)" }}>
        <div className="panel-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sliders size={18} color="var(--brand-primary)" />
              <h3>Interactive Multi-Platform AI Sandbox</h3>
            </div>
            <p>Test custom scenarios across streaming services to predict real-time churn probability</p>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Platform Toggle */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
              Test Streaming Platform:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
              {PLATFORMS.map((p) => {
                const isCurrent = testPlatform === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handlePlatformSwitch(p.id)}
                    style={{
                      position: "relative",
                      borderRadius: "10px",
                      overflow: "hidden",
                      padding: "10px 12px",
                      minHeight: "68px",
                      cursor: "pointer",
                      border: isCurrent ? `2px solid ${p.color}` : "1px solid rgba(255, 255, 255, 0.12)",
                      background: p.cardBg || "var(--bg-surface)",
                      boxShadow: isCurrent ? `0 0 16px ${p.color}55, 0 4px 12px rgba(0,0,0,0.3)` : "0 2px 6px rgba(0,0,0,0.2)",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: isCurrent ? p.color : "var(--text-muted)" }}>
                        {p.name}
                      </span>
                      {isCurrent && (
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", margin: "4px 0" }}>
                      <PlatformLogo platform={p.id} height={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Scenario Tester Buttons for Faculty Presentation */}
          <div style={{ marginBottom: "20px", padding: "12px 14px", background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Zap size={13} color="var(--brand-primary)" /> Quick Customer Test Scenarios:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="secondary-btn btn-sm"
                onClick={() => {
                  setTestPlatform("Netflix");
                  setTestPlan("Standard (1080p FHD)");
                  setTestContract("Monthly");
                  setTestWatchHours(2.8);
                  setTestTenure(2);
                  setTestTickets(1);
                  setTestPayment("UPI");
                }}
                style={{ fontSize: "11px", border: "1px solid rgba(229, 9, 20, 0.4)", color: "#E50914" }}
              >
                🔴 Test Rahul (Netflix · 87%)
              </button>
              <button
                type="button"
                className="secondary-btn btn-sm"
                onClick={() => {
                  setTestPlatform("Amazon Prime Video");
                  setTestPlan("Prime Monthly (Video Only)");
                  setTestContract("Monthly");
                  setTestWatchHours(3.2);
                  setTestTenure(3);
                  setTestTickets(2);
                  setTestPayment("Net Banking");
                }}
                style={{ fontSize: "11px", border: "1px solid rgba(0, 168, 225, 0.4)", color: "#00A8E1" }}
              >
                🔵 Test Priya (Prime · 79%)
              </button>
              <button
                type="button"
                className="secondary-btn btn-sm"
                onClick={() => {
                  setTestPlatform("Disney+ Hotstar");
                  setTestPlan("Super Monthly (FHD 2 Screens)");
                  setTestContract("Monthly");
                  setTestWatchHours(2.5);
                  setTestTenure(1);
                  setTestTickets(3);
                  setTestPayment("UPI");
                }}
                style={{ fontSize: "11px", border: "1px solid rgba(0, 99, 229, 0.4)", color: "#0063E5" }}
              >
                🟡 Test Amit (Hotstar · 85%)
              </button>
              <button
                type="button"
                className="secondary-btn btn-sm"
                onClick={() => {
                  setTestPlatform("Spotify");
                  setTestPlan("Premium Individual");
                  setTestContract("Monthly");
                  setTestWatchHours(3.0);
                  setTestTenure(2);
                  setTestTickets(2);
                  setTestPayment("UPI");
                }}
                style={{ fontSize: "11px", border: "1px solid rgba(29, 185, 84, 0.4)", color: "#1DB954" }}
              >
                🟢 Test Sneha (Spotify · 82%)
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
            {/* Sandbox Controls */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                  Plan Tier:
                </label>
                <select
                  value={testPlan}
                  onChange={(e) => setTestPlan(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "var(--bg-canvas)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                >
                  {Object.entries(currentPlans).map(([planName, price]) => (
                    <option key={planName} value={planName}>
                      {planName} {price === 0 ? "(Free)" : `(₹${price}/mo)`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                  Commitment Pass:
                </label>
                <select
                  value={testContract}
                  onChange={(e) => setTestContract(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "var(--bg-canvas)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                >
                  <option value="Annual">Annual Pass</option>
                  <option value="Monthly">Monthly Pass</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span>Weekly Usage:</span>
                  <b>{testWatchHours} hrs/wk</b>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={testWatchHours}
                  onChange={(e) => setTestWatchHours(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--brand-primary)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span>Tenure (Months):</span>
                  <b>{testTenure} mo.</b>
                </label>
                <input
                  type="range"
                  min="0"
                  max="36"
                  step="1"
                  value={testTenure}
                  onChange={(e) => setTestTenure(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--brand-primary)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span>Complaints (Tickets):</span>
                  <b>{testTickets}</b>
                </label>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={testTickets}
                  onChange={(e) => setTestTickets(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--brand-primary)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                  Payment Method:
                </label>
                <select
                  value={testPayment}
                  onChange={(e) => setTestPayment(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "var(--bg-canvas)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                >
                  <option value="UPI AutoPay">UPI AutoPay</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="UPI">Manual UPI</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>
            </div>

            {/* Sandbox Output Gauge Card */}
            <div
              style={{
                background: "var(--bg-canvas)",
                border: "1px solid var(--border-default)",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center"
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                <PlatformBadge platform={testPlatform} />
              </div>
              <div
                style={{
                  fontSize: "40px",
                  fontWeight: "800",
                  color: sandboxPrediction.probability >= 50 ? "var(--color-danger)" : sandboxPrediction.probability >= 35 ? "var(--color-warning)" : "var(--color-success)"
                }}
              >
                {sandboxPrediction.probability}%
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                Predicted Churn Probability
              </p>
              <RiskBadge score={sandboxPrediction.probability} level={sandboxPrediction.riskLevel} />

              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", textAlign: "left" }}>
                <strong style={{ fontSize: "11.5px", color: "var(--brand-primary)", textTransform: "uppercase" }}>Recommended Action:</strong>
                <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: "1.4" }}>
                  {sandboxPrediction.recommendations?.[0] || "Maintain current service quality."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}