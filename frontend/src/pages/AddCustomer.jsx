import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Zap,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Film,
  Tv,
  Smartphone,
  Clock,
  Music,
  Trophy,
  ShoppingBag,
  Headphones,
  Gift,
  ArrowRight,
  TrendingDown,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addCustomer } from "../services/customerService";
import { Field, RiskBadge, PlatformBadge } from "../components/ProtectedForm";
import { calculateChurnRisk, fetchMLPrediction } from "../services/predictionEngine";
import { useToast } from "../context/ToastContext";
import { PlatformLogo, NetflixLogo, PrimeVideoLogo, SpotifyLogo, DisneyHotstarLogo, PlatformEmblem } from "../components/BrandLogos";

const PLATFORMS = [
  { id: "Netflix", name: "Netflix", color: "#E50914", bg: "rgba(229, 9, 20, 0.12)", cardBg: "linear-gradient(135deg, rgba(30, 8, 12, 0.95) 0%, rgba(12, 14, 22, 0.95) 100%)", desc: "Originals, Series & 4K UHD" },
  { id: "Amazon Prime Video", name: "Prime Video", color: "#00A8E1", bg: "rgba(0, 168, 225, 0.12)", cardBg: "linear-gradient(135deg, rgba(6, 24, 42, 0.95) 0%, rgba(12, 14, 22, 0.95) 100%)", desc: "Prime Shows + 1-Day Delivery" },
  { id: "Disney+ Hotstar", name: "Disney+ Hotstar", color: "#0063E5", bg: "rgba(0, 99, 229, 0.15)", cardBg: "linear-gradient(135deg, rgba(6, 18, 48, 0.95) 0%, rgba(12, 17, 34, 0.95) 100%)", desc: "Live Cricket, Sports & Disney" },
  { id: "Spotify", name: "Spotify", color: "#1DB954", bg: "rgba(29, 185, 84, 0.12)", cardBg: "linear-gradient(135deg, rgba(8, 34, 18, 0.95) 0%, rgba(12, 14, 22, 0.95) 100%)", desc: "Music, Podcasts & Hi-Fi Lossless" }
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
    "Prime Monthly (Video Only)": 299,
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

const PLATFORM_DEVICES = {
  "Netflix": [
    "Smart TV (Samsung/LG OLED 4K)",
    "Apple TV 4K / Fire Stick",
    "iPad Pro / Tablet",
    "Mobile (Android/iOS)",
    "PlayStation / Xbox",
    "Web Browser (Mac/PC)"
  ],
  "Amazon Prime Video": [
    "Amazon Fire TV Stick 4K",
    "Smart TV (Sony/LG)",
    "Mobile (Android/iOS)",
    "iPad / Tablet",
    "Echo Show Smart Display",
    "Web Browser"
  ],
  "Disney+ Hotstar": [
    "Smart TV (Live Cricket 4K OLED)",
    "Mobile (Android/iOS)",
    "Android TV / Smart Set-Top Box",
    "iPad / Tablet",
    "Fire TV Stick 4K",
    "Web Browser"
  ],
  "Spotify": [
    "Mobile (Android / iPhone)",
    "Car Bluetooth / Android Auto",
    "Smart Speaker (Echo / Google Nest)",
    "Desktop App (Mac / Windows)",
    "Headphones / Wireless Earbuds",
    "Web Player"
  ]
};

// Faculty Presentation Pre-configured Demo Stories
const sampleProfiles = {
  Netflix: {
    high: {
      name: "Rahul Verma",
      email: "rahul.verma@example.com",
      phone: "+91 98765 11223",
      platform: "Netflix",
      company: "Netflix Individual",
      plan: "Standard (1080p FHD)",
      deviceType: "Smart TV (Samsung/LG OLED 4K)",
      age: 23,
      gender: "Male",
      tenure: 2,
      monthlyCharges: 649,
      totalCharges: 1298,
      contract: "Monthly",
      paymentMethod: "UPI",
      supportTickets: 1,
      watchHoursPerWeek: 2.8,
      numProfiles: 1,
      streamingTV: "Yes",
      streamingMovies: "Yes",
      downloadOffline: "No",
      churn: "Active"
    },
    low: {
      name: "Ananya Deshmukh",
      email: "ananya.d@example.com",
      phone: "+91 98220 44556",
      platform: "Netflix",
      company: "Netflix Family Tier",
      plan: "Premium (4K + HDR)",
      deviceType: "Smart TV (Samsung/LG OLED 4K)",
      age: 34,
      gender: "Female",
      tenure: 24,
      monthlyCharges: 799,
      totalCharges: 19176,
      contract: "Annual",
      paymentMethod: "UPI AutoPay",
      supportTickets: 0,
      watchHoursPerWeek: 28.0,
      numProfiles: 4,
      streamingTV: "Yes",
      streamingMovies: "Yes",
      downloadOffline: "Yes",
      churn: "Active"
    }
  },
  "Amazon Prime Video": {
    high: {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 98490 88771",
      platform: "Amazon Prime Video",
      company: "Prime Monthly Pass",
      plan: "Prime Monthly (Video Only)",
      deviceType: "Mobile (Android/iOS)",
      age: 25,
      gender: "Female",
      tenure: 3,
      monthlyCharges: 299,
      totalCharges: 897,
      contract: "Monthly",
      paymentMethod: "Net Banking",
      supportTickets: 2,
      watchHoursPerWeek: 3.2,
      numProfiles: 1,
      streamingTV: "Yes",
      streamingMovies: "No",
      downloadOffline: "No",
      churn: "Active"
    },
    low: {
      name: "Vikram Malhotra",
      email: "vikram.m@example.com",
      phone: "+91 97112 33445",
      platform: "Amazon Prime Video",
      company: "Prime Household",
      plan: "Prime Annual (Video + Delivery)",
      deviceType: "Amazon Fire TV Stick 4K",
      age: 38,
      gender: "Male",
      tenure: 36,
      monthlyCharges: 125,
      totalCharges: 4500,
      contract: "Annual",
      paymentMethod: "Credit Card",
      supportTickets: 0,
      watchHoursPerWeek: 24.0,
      numProfiles: 3,
      streamingTV: "Yes",
      streamingMovies: "Yes",
      downloadOffline: "Yes",
      churn: "Active"
    }
  },
  "Disney+ Hotstar": {
    high: {
      name: "Amit Patel",
      email: "amit.patel@example.com",
      phone: "+91 98300 44332",
      platform: "Disney+ Hotstar",
      company: "Hotstar Cricket Pass",
      plan: "Super Monthly (FHD 2 Screens)",
      deviceType: "Smart TV (Live Cricket 4K OLED)",
      age: 22,
      gender: "Male",
      tenure: 1,
      monthlyCharges: 299,
      totalCharges: 299,
      contract: "Monthly",
      paymentMethod: "UPI",
      supportTickets: 3,
      watchHoursPerWeek: 2.5,
      numProfiles: 1,
      streamingTV: "Yes",
      streamingMovies: "No",
      downloadOffline: "No",
      churn: "Active"
    },
    low: {
      name: "Karthik Subramanian",
      email: "karthik.sub@example.com",
      phone: "+91 98860 11998",
      platform: "Disney+ Hotstar",
      company: "Hotstar 4K VIP Club",
      plan: "Premium 4K (4 Screens)",
      deviceType: "Smart TV (Live Cricket 4K OLED)",
      age: 30,
      gender: "Male",
      tenure: 22,
      monthlyCharges: 125,
      totalCharges: 2750,
      contract: "Annual",
      paymentMethod: "UPI AutoPay",
      supportTickets: 0,
      watchHoursPerWeek: 28.0,
      numProfiles: 4,
      streamingTV: "Yes",
      streamingMovies: "Yes",
      downloadOffline: "Yes",
      churn: "Active"
    }
  },
  Spotify: {
    high: {
      name: "Sneha Nair",
      email: "sneha.n@example.com",
      phone: "+91 99401 22334",
      platform: "Spotify",
      company: "Spotify Individual",
      plan: "Premium Individual",
      deviceType: "Mobile (Android / iPhone)",
      age: 21,
      gender: "Female",
      tenure: 2,
      monthlyCharges: 119,
      totalCharges: 238,
      contract: "Monthly",
      paymentMethod: "UPI",
      supportTickets: 2,
      watchHoursPerWeek: 3.0,
      numProfiles: 1,
      streamingTV: "No",
      streamingMovies: "No",
      downloadOffline: "No",
      churn: "Active"
    },
    low: {
      name: "Arjun Kapoor",
      email: "arjun.audio@example.com",
      phone: "+91 98200 77665",
      platform: "Spotify",
      company: "Spotify Family Pass",
      plan: "Premium Family (6 Accounts)",
      deviceType: "Car Bluetooth / Android Auto",
      age: 29,
      gender: "Male",
      tenure: 20,
      monthlyCharges: 179,
      totalCharges: 3580,
      contract: "Annual",
      paymentMethod: "UPI AutoPay",
      supportTickets: 0,
      watchHoursPerWeek: 35.0,
      numProfiles: 6,
      streamingTV: "No",
      streamingMovies: "No",
      downloadOffline: "Yes",
      churn: "Active"
    }
  }
};

const getInitialForm = (platform = "Netflix") => {
  const plans = PLATFORM_PLANS[platform] || PLATFORM_PLANS["Netflix"];
  const defaultPlan = Object.keys(plans)[0];
  const defaultFee = plans[defaultPlan];
  const devices = PLATFORM_DEVICES[platform] || PLATFORM_DEVICES["Netflix"];

  return {
    name: "",
    email: "",
    phone: "",
    platform: platform,
    company: `${platform} Subscriber`,
    plan: defaultPlan,
    deviceType: devices[0],
    age: 24,
    gender: "Male",
    tenure: 6,
    monthlyCharges: defaultFee,
    totalCharges: defaultFee * 6,
    contract: "Annual",
    paymentMethod: "UPI AutoPay",
    supportTickets: 0,
    watchHoursPerWeek: platform === "Spotify" ? 24.0 : 18.0,
    numProfiles: platform === "Spotify" ? 1 : 2,
    streamingTV: "Yes",
    streamingMovies: "Yes",
    downloadOffline: "Yes",
    churn: "Active"
  };
};

export default function AddCustomer() {
  const navigate = useNavigate();
  const toast = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState("Netflix");
  const [form, setForm] = useState(() => getInitialForm("Netflix"));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPlans = PLATFORM_PLANS[form.platform || selectedPlatform] || PLATFORM_PLANS["Netflix"];
  const currentDevices = PLATFORM_DEVICES[form.platform || selectedPlatform] || PLATFORM_DEVICES["Netflix"];

  const handlePlatformChange = (pId) => {
    setSelectedPlatform(pId);
    const plans = PLATFORM_PLANS[pId] || PLATFORM_PLANS["Netflix"];
    const defaultPlan = Object.keys(plans)[0];
    const defaultFee = plans[defaultPlan];
    const devices = PLATFORM_DEVICES[pId] || PLATFORM_DEVICES["Netflix"];

    setForm((prev) => {
      const tenure = Number(prev.tenure || 1);
      return {
        ...prev,
        platform: pId,
        company: `${pId} Subscriber`,
        plan: defaultPlan,
        deviceType: devices[0],
        monthlyCharges: defaultFee,
        totalCharges: defaultFee * Math.max(1, tenure)
      };
    });
    setErrors({});
    toast.info(`Switched to ${pId} subscriber enrollment.`);
  };

  const update = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "platform") {
        const plans = PLATFORM_PLANS[value] || PLATFORM_PLANS["Netflix"];
        const defaultPlan = Object.keys(plans)[0];
        const defaultFee = plans[defaultPlan];
        const devices = PLATFORM_DEVICES[value] || PLATFORM_DEVICES["Netflix"];
        setSelectedPlatform(value);
        updated.plan = defaultPlan;
        updated.deviceType = devices[0];
        updated.monthlyCharges = defaultFee;
        const t = Number(updated.tenure || 1);
        updated.totalCharges = defaultFee * Math.max(1, t);
      } else if (name === "plan" && currentPlans[value] !== undefined) {
        const fee = currentPlans[value];
        updated.monthlyCharges = fee;
        const t = Number(updated.tenure || 1);
        updated.totalCharges = fee * Math.max(1, t);
      } else if (name === "monthlyCharges" || name === "tenure") {
        const m = name === "monthlyCharges" ? Number(value) : Number(prev.monthlyCharges);
        const t = name === "tenure" ? Number(value) : Number(prev.tenure);
        if (!isNaN(m) && !isNaN(t) && m >= 0 && t >= 0) {
          updated.totalCharges = m * Math.max(1, t);
        }
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const loadPreset = (preset, label) => {
    setSelectedPlatform(preset.platform);
    setForm(preset);
    setErrors({});
    toast.info(`Loaded ${label} profile for ${preset.platform} (${preset.name}).`);
  };

  const handleReset = () => {
    setForm(getInitialForm(selectedPlatform));
    setErrors({});
    toast.info("Form reset to defaults.");
  };

  const [liveRisk, setLiveRisk] = useState(() => calculateChurnRisk(form));

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const mlResult = await fetchMLPrediction({ ...form, platform: selectedPlatform });
        if (active && mlResult) {
          setLiveRisk(mlResult);
        }
      } catch (err) {
        // Fallback remains active
      }
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [form, selectedPlatform]);

  // Expected risk drop calculation if retention offer is applied
  const expectedRetainedRisk = Math.max(12, Math.round(liveRisk.probability * 0.28));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Subscriber full name is required";
    if (!form.email.trim() || !form.email.includes("@")) errs.email = "Valid email is required";
    if (!form.plan) errs.plan = "Please select a plan tier";
    if (!form.contract) errs.contract = "Please select a billing pass term";
    if (form.tenure === "" || Number(form.tenure) < 0) errs.tenure = "Tenure is required";
    if (form.monthlyCharges === "" || Number(form.monthlyCharges) < 0) errs.monthlyCharges = "Fee required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please resolve the highlighted form errors.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = addCustomer({
        ...form,
        platform: form.platform || selectedPlatform,
        plan: form.plan || Object.keys(currentPlans)[0],
        deviceType: form.deviceType || currentDevices[0],
        gender: form.gender || "Male",
        contract: form.contract || "Annual",
        paymentMethod: form.paymentMethod || "UPI AutoPay",
        age: Number(form.age || 24),
        tenure: Number(form.tenure || 1),
        monthlyCharges: Number(form.monthlyCharges !== undefined ? form.monthlyCharges : 199),
        totalCharges: Number(form.totalCharges || 0),
        supportTickets: Number(form.supportTickets || 0),
        watchHoursPerWeek: Number(form.watchHoursPerWeek || 15.0),
        numProfiles: Number(form.numProfiles || 1)
      });

      toast.success(`Subscriber ${created.name} (${created.id}) successfully enrolled on ${created.platform}!`);
      navigate(`/customers/${created.id}`);
    } catch (err) {
      toast.error("Failed to enroll subscriber. Please check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPlatformObj = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];
  const isAudioPlatform = selectedPlatform === "Spotify";

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate("/customers")}>
            <ArrowLeft size={16} /> Back to Subscriber Directory
          </button>
          <span className="eyebrow blue" style={{ background: `${currentPlatformObj.color}15`, color: currentPlatformObj.color, border: `1px solid ${currentPlatformObj.color}35` }}>
            <Sparkles size={13} /> MULTI-PLATFORM ENROLLMENT & RISK SCORING
          </span>
          <h2>Enroll Streaming Subscriber</h2>
          <p>
            Add a new subscriber for <strong>Netflix, Amazon Prime Video, Disney+ Hotstar, or Spotify</strong> with instant AI-predicted churn intelligence.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="secondary-btn"
            onClick={() => loadPreset(sampleProfiles[selectedPlatform]?.high || sampleProfiles.Netflix.high, "High Risk Persona")}
            title="Load high churn risk customer data profile (e.g. Rahul on Netflix)"
            style={{ borderColor: "var(--color-danger-border)", color: "var(--color-danger)" }}
          >
            <AlertTriangle size={16} color="var(--color-danger)" /> Load At-Risk Persona ({selectedPlatform === "Netflix" ? "Rahul" : selectedPlatform === "Amazon Prime Video" ? "Priya" : selectedPlatform === "Disney+ Hotstar" ? "Amit" : "Sneha"})
          </button>
          <button
            className="secondary-btn"
            onClick={() => loadPreset(sampleProfiles[selectedPlatform]?.low || sampleProfiles.Netflix.low, "Protected Safe Persona")}
          >
            <CheckCircle2 size={16} color="var(--color-success)" /> Load Safe Profile
          </button>
          <button className="secondary-btn" onClick={handleReset}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Platform Selector Cards */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "10px", display: "block" }}>
          Select Streaming Service Platform:
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px" }}>
          {PLATFORMS.map((p) => {
            const isSelected = selectedPlatform === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handlePlatformChange(p.id)}
                style={{
                  position: "relative",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: isSelected ? `2px solid ${p.color}` : "1px solid rgba(255, 255, 255, 0.12)",
                  background: p.cardBg || "var(--bg-surface)",
                  boxShadow: isSelected ? `0 0 24px ${p.color}44, 0 8px 24px rgba(0,0,0,0.4)` : "0 4px 12px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "125px"
                }}
              >
                {/* Ambient Radial Brand Glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 80% 30%, ${p.color}26 0%, transparent 70%)`,
                    pointerEvents: "none"
                  }}
                />

                {/* Top Row: Active status or platform badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2 }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: isSelected ? p.color : "var(--text-muted)" }}>
                    {p.name}
                  </span>
                  {isSelected ? (
                    <span style={{ fontSize: "10px", background: p.color, color: "#fff", padding: "2px 8px", borderRadius: "10px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", boxShadow: `0 2px 8px ${p.color}66` }}>
                      Selected
                    </span>
                  ) : (
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                  )}
                </div>

                {/* Center: Official Logo */}
                <div style={{ position: "relative", zIndex: 2, margin: "10px 0 6px", display: "flex", alignItems: "center" }}>
                  <PlatformLogo platform={p.id} height={26} />
                </div>

                {/* Bottom: Description */}
                <div style={{ position: "relative", zIndex: 2, fontSize: "11.5px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                  {p.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 400px", alignItems: "start" }}>
        {/* Main Enrollment Form */}
        <section className="panel">
          <div className="panel-head" style={{ borderLeft: `4px solid ${currentPlatformObj.color}` }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3>Subscriber Details & Usage Profile</h3>
                <PlatformBadge platform={selectedPlatform} />
              </div>
              <p>Calibrated for streaming churn prediction and synced to MySQL</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
            {/* Section 1: Personal Info & Platform Selector */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "13px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
                1. Subscriber Profile & Streaming Platform
              </h4>

              <div className="form-grid-3" style={{ marginBottom: "14px" }}>
                <Field label="Streaming Platform (Service)" required>
                  <select
                    name="platform"
                    value={form.platform || selectedPlatform}
                    onChange={update}
                    style={{ fontWeight: "600", borderColor: currentPlatformObj.color }}
                  >
                    <option value="Netflix">Netflix (Red)</option>
                    <option value="Amazon Prime Video">Amazon Prime Video (Blue)</option>
                    <option value="Disney+ Hotstar">Disney+ Hotstar (Royal Blue/Gold)</option>
                    <option value="Spotify">Spotify (Green)</option>
                  </select>
                </Field>

                <Field label="Full Name" required error={errors.name}>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={update}
                    placeholder="e.g. Rahul Verma"
                  />
                </Field>

                <Field label="Email Address" required error={errors.email}>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={update}
                    placeholder="e.g. rahul.verma@example.com"
                  />
                </Field>
              </div>

              <div className="form-grid-3">
                <Field label="Phone Number">
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={update}
                    placeholder="+91 98765 11223"
                  />
                </Field>

                <Field label="Age" error={errors.age}>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={update}
                    min="14"
                    max="99"
                  />
                </Field>

                <Field label="Gender">
                  <select name="gender" value={form.gender} onChange={update}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* Section 2: Platform Plan & Billing */}
            <div style={{ marginBottom: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
              <h4 style={{ fontSize: "13px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
                2. {selectedPlatform} Plan Tier & Billing Pass
              </h4>
              <div className="form-grid-2">
                <Field label={`${selectedPlatform} Plan Tier`} required error={errors.plan}>
                  <select name="plan" value={form.plan} onChange={update}>
                    {Object.entries(currentPlans).map(([planName, price]) => (
                      <option key={planName} value={planName}>
                        {planName} {price === 0 ? "(Free)" : `— ₹${price}/mo`}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Billing Commitment Term" required error={errors.contract}>
                  <select name="contract" value={form.contract} onChange={update}>
                    <option value="Monthly">Monthly Pass (Cancel Anytime — Higher Risk)</option>
                    <option value="Annual">Annual Pass (Committed — Low Risk)</option>
                  </select>
                </Field>
              </div>

              <div className="form-grid-3" style={{ marginTop: "12px" }}>
                <Field label="Tenure (Months Subscribed)" required error={errors.tenure}>
                  <input
                    type="number"
                    name="tenure"
                    value={form.tenure}
                    onChange={update}
                    min="0"
                    placeholder="e.g. 2"
                  />
                </Field>

                <Field label="Monthly Fee (INR)" required error={errors.monthlyCharges}>
                  <input
                    type="number"
                    name="monthlyCharges"
                    value={form.monthlyCharges}
                    onChange={update}
                    min="0"
                  />
                </Field>

                <Field label="Payment Method">
                  <select name="paymentMethod" value={form.paymentMethod} onChange={update}>
                    <option value="UPI AutoPay">UPI AutoPay (Automated Safe)</option>
                    <option value="Credit Card">Credit Card (Automated)</option>
                    <option value="UPI">Manual UPI (Monthly Friction)</option>
                    <option value="Net Banking">Net Banking / Debit</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* Section 3: Streaming Engagement & Technical Experience */}
            <div style={{ marginBottom: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
              <h4 style={{ fontSize: "13px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
                3. {isAudioPlatform ? "Listening & Audio Usage" : "Streaming Consumption & Playback Experience"}
              </h4>
              <div className="form-grid-3">
                <Field label={isAudioPlatform ? "Weekly Audio Stream Hours" : "Weekly Video Watch Hours"}>
                  <input
                    type="number"
                    step="0.5"
                    name="watchHoursPerWeek"
                    value={form.watchHoursPerWeek}
                    onChange={update}
                    placeholder={isAudioPlatform ? "e.g. 30.0" : "e.g. 18.5"}
                    min="0"
                    max="168"
                  />
                </Field>

                <Field label="Primary Streaming Device">
                  <select name="deviceType" value={form.deviceType} onChange={update}>
                    {currentDevices.map((dev) => (
                      <option key={dev} value={dev}>{dev}</option>
                    ))}
                  </select>
                </Field>

                <Field label={isAudioPlatform ? "Allowed Devices / Profiles" : "Active Profiles / Screens"}>
                  <select name="numProfiles" value={form.numProfiles} onChange={update}>
                    <option value="1">1 Profile / Device</option>
                    <option value="2">2 Profiles / Screens</option>
                    <option value="3">3 Profiles</option>
                    <option value="4">4 Profiles (Family Ultra)</option>
                    <option value="6">6 Accounts (Family Tier)</option>
                  </select>
                </Field>
              </div>

              <div className="form-grid-2" style={{ marginTop: "12px" }}>
                <Field label={isAudioPlatform ? "App / Playback Complaints (Tickets)" : "Buffering / Playback Complaints (Tickets)"}>
                  <input
                    type="number"
                    name="supportTickets"
                    value={form.supportTickets}
                    onChange={update}
                    min="0"
                    max="20"
                  />
                </Field>

                <Field label="Initial Subscriber Status">
                  <select name="churn" value={form.churn} onChange={update}>
                    <option value="Active">Active Subscription</option>
                    <option value="Churned">Cancelled / Churned</option>
                  </select>
                </Field>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid var(--border-default)" }}>
              <button type="button" className="secondary-btn" onClick={() => navigate("/customers")}>
                Cancel
              </button>
              <button
                type="submit"
                className="primary-btn"
                disabled={isSubmitting}
                style={{ background: currentPlatformObj.color, borderColor: currentPlatformObj.color }}
              >
                <Save size={16} /> {isSubmitting ? "Enrolling..." : `Enroll ${selectedPlatform} Subscriber`}
              </button>
            </div>
          </form>
        </section>

        {/* Live AI Risk Intelligence & Before vs. After Preview Sidebar */}
        <aside className="panel" style={{ position: "sticky", top: "20px" }}>
          <div className="panel-head" style={{ background: "var(--bg-surface-elevated)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} color={currentPlatformObj.color} />
                <h3 style={{ fontSize: "15px" }}>Live AI Risk Predictor</h3>
              </div>
              <p style={{ fontSize: "11.5px" }}>Tailored for {selectedPlatform} churn indicators</p>
            </div>
          </div>

          <div style={{ padding: "20px" }}>
            {/* Churn Risk Gauge */}
            <div style={{ textAlign: "center", padding: "16px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <div
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  margin: "0 auto 12px",
                  border: `6px solid ${liveRisk.probability >= 60 ? "var(--color-danger)" : liveRisk.probability >= 35 ? "var(--color-warning)" : "var(--color-success)"}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--bg-canvas)",
                  boxShadow: `0 0 20px ${liveRisk.probability >= 60 ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`
                }}
              >
                <span style={{ fontSize: "28px", fontWeight: "800", color: liveRisk.probability >= 60 ? "var(--color-danger)" : liveRisk.probability >= 35 ? "var(--color-warning)" : "var(--color-success)" }}>
                  {liveRisk.probability}%
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Risk Score
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "8px", alignItems: "center" }}>
                <PlatformBadge platform={selectedPlatform} />
                <RiskBadge score={liveRisk.probability} level={liveRisk.riskLevel} />
              </div>
            </div>

            {/* "BEFORE VS. AFTER" RETENTION COMPARISON PREVIEW (Shown on High Risk) */}
            {liveRisk.probability >= 50 && (
              <div
                style={{
                  margin: "16px 0",
                  background: "var(--bg-canvas)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "12px",
                  padding: "14px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "var(--brand-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Sparkles size={12} /> Before vs. After Comparison
                  </span>
                  <span style={{ fontSize: "10.5px", color: "var(--color-success)", fontWeight: "700" }}>
                    -{liveRisk.probability - expectedRetainedRisk}% Risk Drop
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "8px", alignItems: "center", textAlign: "center", marginBottom: "10px" }}>
                  <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "8px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.25)" }}>
                    <small style={{ fontSize: "10px", color: "var(--color-danger)", display: "block", fontWeight: "700" }}>CURRENT</small>
                    <strong style={{ fontSize: "18px", color: "var(--color-danger)" }}>{liveRisk.probability}%</strong>
                    <span style={{ fontSize: "9.5px", color: "var(--text-muted)", display: "block" }}>Month-to-Month</span>
                  </div>

                  <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>➔</span>

                  <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "8px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                    <small style={{ fontSize: "10px", color: "var(--color-success)", display: "block", fontWeight: "700" }}>IF 20% DISCOUNT</small>
                    <strong style={{ fontSize: "18px", color: "var(--color-success)" }}>{expectedRetainedRisk}%</strong>
                    <span style={{ fontSize: "9.5px", color: "var(--text-muted)", display: "block" }}>Annual Upgrade</span>
                  </div>
                </div>

                <div style={{ fontSize: "11px", color: "var(--text-secondary)", background: "var(--bg-muted)", padding: "8px 10px", borderRadius: "6px", lineHeight: "1.35" }}>
                  💡 <b>Proactive Action:</b> Automatically trigger a 20% Annual Upgrade popup before renewal to lock in retention.
                </div>
              </div>
            )}

            {/* Negative Churn Drivers */}
            <div style={{ marginTop: "16px" }}>
              <h5 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--color-danger)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertTriangle size={13} /> Risk Factors ({liveRisk.topFactors?.length || 0})
              </h5>
              {liveRisk.topFactors && liveRisk.topFactors.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                  {liveRisk.topFactors.map((f, i) => (
                    <li key={i} style={{ fontSize: "11.5px", background: "var(--color-danger-bg)", color: "var(--color-danger)", padding: "6px 10px", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
                      <span>{f.name}</span>
                      <b>{f.impact}</b>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
                  No significant risk drivers identified.
                </div>
              )}
            </div>

            {/* Positive Retention Signals */}
            <div style={{ marginTop: "16px" }}>
              <h5 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--color-success)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={13} /> Protective Drivers ({liveRisk.positiveDrivers?.length || 0})
              </h5>
              {liveRisk.positiveDrivers && liveRisk.positiveDrivers.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                  {liveRisk.positiveDrivers.map((d, i) => (
                    <li key={i} style={{ fontSize: "11.5px", background: "var(--color-success-bg)", color: "var(--color-success)", padding: "6px 10px", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
                      <span>{d.name}</span>
                      <b>{d.impact}</b>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
                  Add longer tenure or higher engagement for protective signals.
                </div>
              )}
            </div>

            {/* Recommended Retention Playbook */}
            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
              <h5 style={{ fontSize: "12px", textTransform: "uppercase", color: currentPlatformObj.color, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={13} /> Tailored {selectedPlatform} Retention Offer
              </h5>
              <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: "1.4", background: "var(--bg-muted)", borderLeft: `3px solid ${currentPlatformObj.color}`, padding: "8px 12px", borderRadius: "0 8px 8px 0" }}>
                {liveRisk.recommendations?.[0] || `Offer 20% discount on upgrading to ${selectedPlatform} Annual Plan.`}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}