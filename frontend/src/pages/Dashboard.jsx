import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  UserCheck,
  UserX,
  TrendingDown,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  DollarSign,
  Activity,
  ArrowRight,
  Zap,
  Filter,
  Tv,
  Clock,
  Film,
  Music,
  ShoppingBag,
  Trophy,
  Play,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Headphones,
  Smartphone,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCustomers, syncCustomersFromBackend } from "../services/customerService";
import { StatusBadge, RiskBadge, PlatformBadge } from "../components/ProtectedForm";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LabelList
} from "recharts";
import { PlatformLogo, NetflixLogo, PrimeVideoLogo, SpotifyLogo, DisneyHotstarLogo, PlatformEmblem } from "../components/BrandLogos";
import { openCustomerDataModal } from "../components/RetentionShowcase";

const STREAMING_PLATFORMS = [
  {
    id: "Netflix",
    name: "Netflix",
    subtitle: "Originals · Series · 4K HDR",
    tag: "Global Leader",
    logo: "/images/netflix_logo.svg",
    color: "#E50914",
    glow: "rgba(229, 9, 20, 0.45)",
    genre: "Binge & Series",
    benchmark: "18.5h binge avg",
    cardBg: "linear-gradient(135deg, rgba(30, 8, 12, 0.95) 0%, rgba(12, 14, 22, 0.95) 100%)"
  },
  {
    id: "Amazon Prime Video",
    name: "Prime Video",
    subtitle: "Prime Originals & Live Sports",
    tag: "OTT + Shopping",
    logo: "/images/prime_logo.svg",
    color: "#00A8E1",
    glow: "rgba(0, 168, 225, 0.45)",
    genre: "Movies & Sports",
    benchmark: "Shopping + OTT Bundle",
    cardBg: "linear-gradient(135deg, rgba(6, 24, 42, 0.95) 0%, rgba(12, 14, 22, 0.95) 100%)"
  },
  {
    id: "Disney+ Hotstar",
    name: "Disney+ Hotstar",
    subtitle: "Live Cricket & Specials",
    tag: "Live Sports & OTT",
    logo: "/images/hotstar_logo.svg",
    color: "#0063E5",
    glow: "rgba(0, 99, 229, 0.45)",
    genre: "Cricket & Specials",
    benchmark: "Tournament Retention",
    cardBg: "linear-gradient(135deg, rgba(6, 18, 48, 0.95) 0%, rgba(12, 17, 34, 0.95) 100%)"
  },
  {
    id: "Spotify",
    name: "Spotify",
    subtitle: "Lossless Audio & Podcasts",
    tag: "Hi-Fi Streaming",
    logo: "/images/spotify_logo.svg",
    color: "#1DB954",
    glow: "rgba(29, 185, 84, 0.45)",
    genre: "Music & Podcasts",
    benchmark: "28.0h audio avg",
    cardBg: "linear-gradient(135deg, rgba(8, 34, 18, 0.95) 0%, rgba(12, 14, 22, 0.95) 100%)"
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPalette } = useTheme();
  const [allCustomers, setAllCustomers] = useState(getCustomers());
  const [activePlatform, setActivePlatform] = useState("All");
  const [timeRange, setTimeRange] = useState("8M");

  const platformSubscribersRef = useRef(null);

  useEffect(() => {
    syncCustomersFromBackend().then((data) => {
      if (data && data.length > 0) setAllCustomers(data);
    });
  }, []);

  const handlePlatformCardClick = (pId) => {
    const nextPlatform = activePlatform === pId ? "All" : pId;
    setActivePlatform(nextPlatform);
    if (nextPlatform !== "All") {
      setTimeout(() => {
        platformSubscribersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  };

  const customers = useMemo(() => {
    if (activePlatform === "All") return allCustomers;
    const pNorm = activePlatform.toLowerCase();
    return allCustomers.filter((c) => {
      const cNorm = (c.platform || "Netflix").toLowerCase();
      if (pNorm.includes("prime") || pNorm.includes("amazon")) return cNorm.includes("prime") || cNorm.includes("amazon");
      if (pNorm.includes("spotify")) return cNorm.includes("spotify");
      if (pNorm.includes("hotstar") || pNorm.includes("disney") || pNorm.includes("jio")) return cNorm.includes("hotstar") || cNorm.includes("disney") || cNorm.includes("jio");
      return cNorm.includes("netflix");
    });
  }, [allCustomers, activePlatform]);

  const activePlatformObj = useMemo(() => {
    if (activePlatform === "All") return null;
    const pNorm = activePlatform.toLowerCase();
    return STREAMING_PLATFORMS.find((p) => {
      const idNorm = p.id.toLowerCase();
      if (pNorm.includes("prime") || pNorm.includes("amazon")) return idNorm.includes("prime") || idNorm.includes("amazon");
      if (pNorm.includes("spotify")) return idNorm.includes("spotify");
      if (pNorm.includes("hotstar") || pNorm.includes("disney") || pNorm.includes("jio")) return idNorm.includes("hotstar") || idNorm.includes("disney") || idNorm.includes("jio");
      return idNorm.includes("netflix");
    }) || null;
  }, [activePlatform]);

  const total = customers.length;
  const churned = customers.filter((c) => (c.churn || "").toUpperCase() === "CHURNED").length;
  const active = total - churned;
  const churnRate = total ? Math.round((churned / total) * 100) : 0;

  // Revenue & Risk calculations
  const totalMonthlyRevenue = customers.reduce((sum, c) => sum + ((c.churn || "").toUpperCase() !== "CHURNED" ? Number(c.monthlyCharges || 199) : 0), 0);
  const totalARR = totalMonthlyRevenue * 12;

  const highRiskCustomers = useMemo(() => {
    return customers
      .filter((c) => (c.churn || "").toUpperCase() !== "CHURNED" && (c.riskScore || 0) >= 50)
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
  }, [customers]);

  const atRiskMonthlyRevenue = highRiskCustomers.reduce((sum, c) => sum + Number(c.monthlyCharges || 199), 0);
  const atRiskARR = atRiskMonthlyRevenue * 12;

  const avgUsage = total
    ? Math.round((customers.reduce((s, c) => s + Number(c.watchHoursPerWeek || 15), 0) / total) * 10) / 10
    : 18.5;

  const stats = [
    {
      label: activePlatform === "All" ? "Total Active Subscribers" : `${activePlatform} Subscribers`,
      value: total,
      subValue: `${active} Active · ${churned} Cancelled`,
      icon: Users,
      tone: "blue",
      trend: "+8.4% vs last mo.",
      trendType: "positive"
    },
    {
      label: activePlatform === "Spotify" ? "Avg Weekly Listening" : "Avg Weekly Watch Time",
      value: `${avgUsage} hrs`,
      subValue: "Streaming engagement benchmark: 15h",
      icon: Clock,
      tone: "green",
      trend: "+2.1 hrs uptick",
      trendType: "positive"
    },
    {
      label: "ARR at Churn Risk",
      value: atRiskARR >= 100000 ? `₹${(atRiskARR / 100000).toFixed(2)}L` : `₹${atRiskARR.toLocaleString("en-IN")}`,
      subValue: `${highRiskCustomers.length} high-risk ${highRiskCustomers.length === 1 ? "subscriber" : "subscribers"}`,
      icon: ShieldAlert,
      tone: "red",
      trend: "Requires intervention",
      trendType: "negative"
    },
    {
      label: "Subscriber Churn Rate",
      value: `${churnRate}%`,
      subValue: "Industry benchmark: 12-15%",
      icon: TrendingDown,
      tone: "amber",
      trend: "-2.3% improvement",
      trendType: "positive"
    }
  ];

  const trendData = useMemo(() => {
    if (timeRange === "3M") {
      return [
        { m: "Jun", rate: 12, active: 10, churned: 2 },
        { m: "Jul", rate: 15, active: 11, churned: 2 },
        { m: "Aug", rate: churnRate, active: active, churned: churned }
      ];
    }
    return [
      { m: "Jan", rate: 14, active: 8, churned: 1 },
      { m: "Feb", rate: 12, active: 9, churned: 1 },
      { m: "Mar", rate: 10, active: 10, churned: 1 },
      { m: "Apr", rate: 16, active: 10, churned: 2 },
      { m: "May", rate: 14, active: 11, churned: 2 },
      { m: "Jun", rate: 13, active: 11, churned: 2 },
      { m: "Jul", rate: 15, active: 12, churned: 3 },
      { m: "Aug", rate: churnRate, active: active, churned: churned }
    ];
  }, [timeRange, churnRate, active, churned]);

  const pieData = [
    { name: "Active Subscribers", value: active, color: "#10B981" },
    { name: "Churned Subscribers", value: churned, color: "#E50914" }
  ];

  // Cross-Platform Churn Comparison
  const platformComparison = useMemo(() => {
    const platforms = [
      { id: "netflix", name: "Netflix", keys: ["netflix"], grad: "url(#netflixBarGrad)", color: "#E50914" },
      { id: "prime", name: "Prime Video", keys: ["prime", "amazon"], grad: "url(#primeBarGrad)", color: "#00A8E1" },
      { id: "spotify", name: "Spotify", keys: ["spotify"], grad: "url(#spotifyBarGrad)", color: "#1DB954" },
      { id: "hotstar", name: "Disney+ Hotstar", keys: ["hotstar", "disney", "jio"], grad: "url(#hotstarBarGrad)", color: "#0063E5" }
    ];

    return platforms.map((p) => {
      const pCusts = allCustomers.filter((c) => {
        const cNorm = (c.platform || "Netflix").toLowerCase();
        return p.keys.some((k) => cNorm.includes(k));
      });
      const pTotal = pCusts.length;
      const pChurned = pCusts.filter((c) => (c.churn || "").toUpperCase() === "CHURNED").length;
      const pRate = pTotal ? Math.round((pChurned / pTotal) * 100) : 0;
      return {
        name: p.name,
        grad: p.grad,
        color: p.color,
        total: pTotal,
        churnRate: pRate,
        active: pTotal - pChurned,
        churned: pChurned
      };
    });
  }, [allCustomers]);

  return (
    <div className="page animate-fade-in">
      {/* Executive Hero Showcase Banner with Official Streaming Brand Ribbon */}
      <div className="hero-cinema-banner">
        <div className="hero-cinema-overlay">
          <div style={{ maxWidth: "680px" }}>
            <span className="eyebrow blue" style={{ background: "rgba(229, 9, 20, 0.15)", color: "#ff4d58", border: "1px solid rgba(229, 9, 20, 0.35)" }}>
              <Sparkles size={13} /> MULTI-PLATFORM STREAMING RETENTION AI
            </span>
            <h1 style={{ fontSize: "28px", color: "#fff", margin: "10px 0 8px", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
              Executive Streaming Intelligence Hub
            </h1>
            <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "14px", lineHeight: "1.5", marginBottom: "16px" }}>
              Welcome back, <strong>{user?.name || "Administrator"}</strong>. Real-time churn prediction, subscriber analytics, and retention intelligence across <strong>Netflix, Prime Video, Spotify, and Disney+ Hotstar</strong>.
            </p>

            {/* Official Platform Quick Partner Ribbon */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)" }}>
                Supported Platforms:
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span className="hero-platform-badge" style={{ borderColor: "rgba(229, 9, 20, 0.4)" }}>
                  <NetflixLogo height={16} />
                </span>
                <span className="hero-platform-badge" style={{ borderColor: "rgba(0, 168, 225, 0.4)" }}>
                  <PrimeVideoLogo height={16} />
                </span>
                <span className="hero-platform-badge" style={{ borderColor: "rgba(29, 185, 84, 0.4)" }}>
                  <SpotifyLogo height={16} />
                </span>
                <span className="hero-platform-badge" style={{ borderColor: "rgba(0, 99, 229, 0.4)" }}>
                  <DisneyHotstarLogo height={16} />
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignSelf: "center" }}>
            <button
              className="primary-btn"
              onClick={() => navigate("/add-customer")}
              style={{ background: "#E50914", borderColor: "#E50914", boxShadow: "0 4px 16px rgba(229, 9, 20, 0.4)" }}
            >
              <Plus size={17} /> Enroll Subscriber
            </button>
            <button
              className="secondary-btn"
              onClick={() => navigate("/analytics")}
              style={{ background: "rgba(255, 255, 255, 0.12)", color: "#fff", backdropFilter: "blur(10px)", borderColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <Activity size={16} /> View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Streaming Platform Interactive Original Logo Cards */}
      <div className="streaming-hub-showcase">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h3 style={{ fontSize: "16px", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Streaming Platform Portfolios</span>
              <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.08)", color: "var(--text-secondary)" }}>
                {activePlatform === "All" ? "Viewing All Services" : `Filtered: ${activePlatform}`}
              </span>
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Click any official streaming logo card to filter analytics, subscribers, and churn risk</p>
          </div>
          {activePlatform !== "All" && (
            <button
              className="secondary-btn btn-sm"
              onClick={() => setActivePlatform("All")}
              style={{ fontSize: "11.5px" }}
            >
              Reset to All Services
            </button>
          )}
        </div>

        <div className="streaming-posters-grid">
          {STREAMING_PLATFORMS.map((p) => {
            const isSelected = activePlatform === p.id;
            const pNorm = p.id.toLowerCase();
            const pCusts = allCustomers.filter((c) => {
              const cNorm = (c.platform || "Netflix").toLowerCase();
              if (pNorm.includes("prime") || pNorm.includes("amazon")) return cNorm.includes("prime") || cNorm.includes("amazon");
              if (pNorm.includes("spotify")) return cNorm.includes("spotify");
              if (pNorm.includes("hotstar") || pNorm.includes("disney") || pNorm.includes("jio")) return cNorm.includes("hotstar") || cNorm.includes("disney") || cNorm.includes("jio");
              return cNorm.includes("netflix");
            });
            const pCount = pCusts.length;
            const pChurned = pCusts.filter((c) => (c.churn || "").toUpperCase() === "CHURNED").length;
            const pRate = pCount ? Math.round((pChurned / pCount) * 100) : 0;

            return (
              <div
                key={p.id}
                className={`streaming-poster-card streaming-brand-card ${isSelected ? "active-poster" : ""}`}
                style={{
                  background: p.cardBg,
                  "--poster-glow": p.glow,
                  borderColor: isSelected ? p.color : "rgba(255, 255, 255, 0.12)",
                  boxShadow: isSelected ? `0 0 24px ${p.glow}, 0 8px 30px rgba(0,0,0,0.5)` : "0 8px 24px rgba(0,0,0,0.3)"
                }}
                onClick={() => handlePlatformCardClick(p.id)}
              >
                {/* Ambient Logo Glow Backdrop */}
                <div
                  className="brand-ambient-glow"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, ${p.color}33 0%, transparent 70%)`
                  }}
                />

                {/* Top Badge Row */}
                <div className="poster-top-row">
                  <span className="poster-brand-badge" style={{ background: isSelected ? p.color : "rgba(255, 255, 255, 0.12)", color: "#fff" }}>
                    {isSelected ? "Active Filter" : p.name}
                  </span>
                  <span className="poster-tag" style={{ border: `1px solid ${p.color}44` }}>
                    {p.tag}
                  </span>
                </div>

                {/* Center Brand Official Logo */}
                <div className="brand-logo-container" style={{ padding: "16px 0 12px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <PlatformLogo platform={p.id} height={32} />
                </div>

                {/* Bottom Stats & Subtitle Info */}
                <div className="poster-info">
                  <div className="poster-title" style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.75)", fontWeight: "500" }}>
                    {p.subtitle}
                  </div>
                  <div className="poster-sub" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Risk Rate: <strong style={{ color: pRate > 30 ? "#ff4d58" : "#22c55e" }}>{pRate}%</strong>
                    </span>
                    <strong style={{ color: "#fff", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: p.color }} />
                      {pCount} Subscribers
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          ACTIVE PLATFORM SUBSCRIBERS (Appears ONLY when an App Card is Clicked)
         ========================================================================= */}
      {activePlatform !== "All" && (
        <section
          ref={platformSubscribersRef}
          className="panel animate-fade-in"
          style={{
            margin: "20px 0",
            borderTop: `4px solid ${activePlatformObj?.color || "var(--brand-primary)"}`,
            borderRadius: "16px",
            boxShadow: `0 8px 30px ${activePlatformObj?.glow || "rgba(0,0,0,0.15)"}`
          }}
        >
          {/* Header */}
          <div
            className="panel-head"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              paddingBottom: "14px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: "10px",
                  background: "rgba(0,0,0,0.3)",
                  border: `1px solid ${activePlatformObj?.color || "var(--border-default)"}55`,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <PlatformLogo platform={activePlatform} height={24} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: "17px", margin: 0, fontWeight: "800", color: "var(--text-main)" }}>
                    {activePlatform} Subscribers
                  </h3>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: `${activePlatformObj?.color || "var(--brand-primary)"}22`,
                      color: activePlatformObj?.color || "var(--brand-primary)",
                      border: `1px solid ${activePlatformObj?.color || "var(--brand-primary)"}44`
                    }}
                  >
                    {customers.length} {customers.length === 1 ? "Subscriber" : "Subscribers"}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                  Active subscriber profiles, weekly usage, and live churn risk on {activePlatform}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                className="primary-btn btn-sm"
                onClick={() => navigate(`/add-customer`)}
                style={{
                  background: activePlatformObj?.color || "var(--brand-primary)",
                  borderColor: activePlatformObj?.color || "var(--brand-primary)",
                  fontSize: "11.5px",
                  height: "30px"
                }}
              >
                <Plus size={13} /> Enroll {activePlatform} Subscriber
              </button>
              <button
                className="secondary-btn btn-sm"
                onClick={() => setActivePlatform("All")}
                style={{ fontSize: "11.5px", height: "30px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                title="Close and reset to all apps"
              >
                <X size={13} /> Close {activePlatform} View
              </button>
            </div>
          </div>

          {/* Subscribers Table for Selected App */}
          <div className="table-wrap">
            {customers.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Subscriber</th>
                    <th>Plan Tier</th>
                    <th>Device</th>
                    <th>Weekly Usage</th>
                    <th>Monthly Fee</th>
                    <th>AI Churn Risk</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const isAudio = (c.platform || "").toLowerCase() === "spotify";
                    const isChurned = (c.churn || "").toUpperCase() === "CHURNED";

                    return (
                      <tr key={c.id}>
                        <td>
                          <div className="customer-cell">
                            <div
                              className="avatar small"
                              style={{
                                background: isChurned
                                  ? "var(--color-danger-bg)"
                                  : `${activePlatformObj?.color || "var(--brand-primary)"}22`,
                                color: isChurned
                                  ? "var(--color-danger)"
                                  : (activePlatformObj?.color || "var(--brand-primary)"),
                                fontWeight: "800"
                              }}
                            >
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong style={{ color: "var(--text-main)", fontSize: "13px" }}>{c.name}</strong>
                              <small style={{ color: "var(--text-muted)" }}>{c.id} · {c.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong style={{ fontSize: "12px", color: activePlatformObj?.color || "var(--brand-primary)", display: "block" }}>
                              {c.plan || "Standard Tier"}
                            </strong>
                            <small style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>
                              {c.contract || "Monthly"} · {c.tenure || 1} mo tenure
                            </small>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--text-secondary)" }}>
                            {isAudio ? <Headphones size={13} color="var(--text-muted)" /> : <Tv size={13} color="var(--text-muted)" />}
                            <span>{c.deviceType || "Smart TV"}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", fontWeight: "600" }}>
                            {c.watchHoursPerWeek || (isAudio ? 25 : 15)} {isAudio ? "hrs audio" : "hrs watch"} / wk
                          </span>
                        </td>
                        <td>
                          <strong style={{ fontSize: "12.5px" }}>
                            {Number(c.monthlyCharges) === 0 ? "Free" : `₹${c.monthlyCharges}/mo`}
                          </strong>
                        </td>
                        <td>
                          <RiskBadge score={c.riskScore || 25} level={c.riskLevel || "Low"} />
                        </td>
                        <td>
                          <StatusBadge status={c.churn || "Active"} />
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              className="secondary-btn btn-sm"
                              onClick={() => navigate(`/customers/${c.id}`)}
                              style={{ fontSize: "11px", padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            >
                              <Eye size={12} /> View
                            </button>
                            <button
                              className="primary-btn btn-sm"
                              onClick={() => openCustomerDataModal(c.id)}
                              style={{
                                background: activePlatformObj?.color || "var(--brand-primary)",
                                borderColor: activePlatformObj?.color || "var(--brand-primary)",
                                fontSize: "11px",
                                padding: "3px 8px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <Zap size={12} /> Retention
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                  No subscribers found enrolled for {activePlatform}.
                </p>
                <button
                  className="primary-btn btn-sm"
                  onClick={() => navigate("/add-customer")}
                  style={{ marginTop: "8px", background: activePlatformObj?.color || "var(--brand-primary)", borderColor: activePlatformObj?.color || "var(--brand-primary)" }}
                >
                  <Plus size={13} /> Enroll First {activePlatform} Subscriber
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* KPI Cards Grid */}
      <div className="stats-grid">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div className="stat-card-modern" key={idx}>
              <div className="stat-card-top">
                <div className={`stat-icon-wrap ${item.tone}`}>
                  <Icon size={20} />
                </div>
                <span className={`stat-card-trend ${item.trendType}`}>
                  {item.trendType === "positive" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {item.trend}
                </span>
              </div>
              <div className="stat-card-body">
                <p>{item.label}</p>
                <h3>{item.value}</h3>
              </div>
              <div className="stat-card-footer">
                <span>{item.subValue}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Visuals Grid */}
      <div className="dashboard-grid">
        {/* Area Chart: Churn Rate Trend */}
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>{activePlatform === "All" ? "Overall" : activePlatform} Churn Rate Trajectory</h3>
              <p>Historical monthly churn percentage and retention trends</p>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                className={`filter-select ${timeRange === "3M" ? "current" : ""}`}
                style={{ height: "30px", padding: "0 10px", fontSize: "11px" }}
                onClick={() => setTimeRange("3M")}
              >
                3 Months
              </button>
              <button
                className={`filter-select ${timeRange === "8M" ? "current" : ""}`}
                style={{ height: "30px", padding: "0 10px", fontSize: "11px", background: timeRange === "8M" ? "var(--brand-primary)" : "var(--bg-surface)", color: timeRange === "8M" ? "#fff" : "inherit" }}
                onClick={() => setTimeRange("8M")}
              >
                Year to Date
              </button>
            </div>
          </div>
          <div style={{ height: "280px", marginTop: "12px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E50914" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#E50914" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-surface-elevated)",
                    borderColor: "var(--border-default)",
                    borderRadius: "10px",
                    boxShadow: "var(--shadow-lg)"
                  }}
                />
                <Area type="monotone" dataKey="rate" stroke="#E50914" strokeWidth={3} fill="url(#areaGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Donut Chart: Subscriber Status Distribution */}
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>{activePlatform === "All" ? "Cross-Platform" : activePlatform} Retention</h3>
              <p>Active vs Cancelled accounts</p>
            </div>
          </div>
          <div className="pie-wrap">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={66}
                  outerRadius={88}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-center">
              <strong>{100 - churnRate}%</strong>
              <span>Retained</span>
            </div>
          </div>
          <div className="legend">
            <span><i className="dot green-dot" /> Active: <b>{active}</b> ({total ? Math.round((active / total) * 100) : 0}%)</span>
            <span><i className="dot red-dot" /> Churned: <b>{churned}</b> ({churnRate}%)</span>
          </div>
        </section>
      </div>

      {/* Cross-Platform Comparison Bar Chart (Shown when All Services is selected) */}
      {activePlatform === "All" && (
        <section className="panel chart-panel" style={{ marginTop: "24px" }}>
          <div className="panel-head">
            <div>
              <h3>Streaming App Churn Rate Comparison</h3>
              <p>Benchmarking churn vulnerability across Netflix, Prime Video, Spotify, and Disney+ Hotstar</p>
            </div>
          </div>
          <div style={{ height: "240px", marginTop: "12px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformComparison} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="netflixBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E50914" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8A040B" stopOpacity={0.85} />
                  </linearGradient>
                  <linearGradient id="primeBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00A8E1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#005B7F" stopOpacity={0.85} />
                  </linearGradient>
                  <linearGradient id="spotifyBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1DB954" stopOpacity={1} />
                    <stop offset="100%" stopColor="#0D6B2D" stopOpacity={0.85} />
                  </linearGradient>
                  <linearGradient id="hotstarBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0063E5" stopOpacity={1} />
                    <stop offset="100%" stopColor="#042C73" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} unit="%" domain={[0, 40]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-surface-elevated)",
                    borderColor: "var(--border-default)",
                    borderRadius: "10px",
                    boxShadow: "var(--shadow-lg)"
                  }}
                  formatter={(val, name, item) => [
                    `${val}% (${item.payload.churned} of ${item.payload.total} cancelled)`,
                    "Churn Rate"
                  ]}
                />
                <Bar dataKey="churnRate" radius={[8, 8, 0, 0]} maxBarSize={48}>
                  {platformComparison.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.grad || "#E50914"} />
                  ))}
                  <LabelList
                    dataKey="churnRate"
                    position="top"
                    formatter={(val) => `${val}%`}
                    fill="var(--text-main)"
                    fontSize={12}
                    fontWeight={700}
                    offset={6}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Real-time High Risk Subscribers Alert Banner */}
      {highRiskCustomers.length > 0 && (
        <section className="panel" style={{ borderLeft: "4px solid var(--color-danger)", marginTop: "24px" }}>
          <div className="panel-head" style={{ background: "var(--color-danger-bg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(229, 9, 20, 0.2)", color: "var(--color-danger)", display: "grid", placeItems: "center" }}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 style={{ color: "var(--color-danger)" }}>High Churn Risk Subscribers Requiring Intervention</h3>
                <p>AI Engine detected {highRiskCustomers.length} active streaming accounts with elevated churn probability (&ge;50%).</p>
              </div>
            </div>
            <button className="secondary-btn btn-sm" onClick={() => navigate("/customers")}>
              View All High Risk <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subscriber</th>
                  <th>Platform</th>
                  <th>Plan Tier</th>
                  <th>Usage</th>
                  <th>Primary Risk Factor</th>
                  <th>AI Churn Risk</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {highRiskCustomers.slice(0, 4).map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="customer-cell">
                        <div className="avatar small" style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)" }}>
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong>{c.name}</strong>
                          <small>{c.id} · {c.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <PlatformBadge platform={c.platform} />
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--brand-primary)", fontWeight: "600" }}>
                        {c.plan || "Standard"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12.5px" }}>
                        {c.watchHoursPerWeek || 15} hrs/wk
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--color-danger)", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-danger)", display: "inline-block" }} />
                        {Number(c.watchHoursPerWeek || 15) < 5
                          ? "Critically Low Engagement"
                          : Number(c.supportTickets || 0) >= 3
                          ? "Multiple Unresolved Issues"
                          : c.contract === "Monthly"
                          ? "Monthly Pass Volatility"
                          : "Price Sensitivity"}
                      </span>
                    </td>
                    <td>
                      <RiskBadge score={c.riskScore || 65} level={c.riskLevel || "High"} />
                    </td>
                    <td>
                      <button
                        className="primary-btn btn-sm"
                        onClick={() => navigate(`/customers/${c.id}`)}
                      >
                        <Zap size={13} /> View Playbook
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}