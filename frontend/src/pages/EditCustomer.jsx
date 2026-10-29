import React, { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Save, Sparkles, AlertCircle, Tv, Smartphone, Clock, Film, Music, ShoppingBag, Trophy, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getCustomers, updateCustomer } from "../services/customerService";
import { Field, RiskBadge, PlatformBadge } from "../components/ProtectedForm";
import { calculateChurnRisk } from "../services/predictionEngine";
import { useToast } from "../context/ToastContext";

const PLATFORMS = [
  { id: "Netflix", name: "Netflix", color: "#E50914" },
  { id: "Amazon Prime Video", name: "Prime Video", color: "#00A8E1" },
  { id: "Disney+ Hotstar", name: "Disney+ Hotstar", color: "#0063E5" },
  { id: "Spotify", name: "Spotify", color: "#1DB954" }
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

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const existing = getCustomers().find((c) => c.id === id);

  const [form, setForm] = useState(existing || {});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!existing) {
      toast.error("Subscriber record not found.");
      navigate("/customers");
    }
  }, [existing, navigate, toast]);

  if (!existing) return null;

  const currentPlatform = form.platform || "Netflix";
  const isAudio = currentPlatform.toLowerCase() === "spotify";
  const currentPlans = PLATFORM_PLANS[currentPlatform] || PLATFORM_PLANS["Netflix"];
  const currentDevices = PLATFORM_DEVICES[currentPlatform] || PLATFORM_DEVICES["Netflix"];

  const update = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "platform") {
        const newPlans = PLATFORM_PLANS[value] || PLATFORM_PLANS["Netflix"];
        const defaultPlan = Object.keys(newPlans)[0];
        const defaultFee = newPlans[defaultPlan];
        const newDevices = PLATFORM_DEVICES[value] || PLATFORM_DEVICES["Netflix"];
        updated.plan = defaultPlan;
        updated.monthlyCharges = defaultFee;
        updated.deviceType = newDevices[0];
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
        updated.totalCharges = m * Math.max(1, t);
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const liveRisk = useMemo(() => {
    return calculateChurnRisk(form);
  }, [form]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Please fill in the required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      updateCustomer(id, {
        ...form,
        age: Number(form.age || 25),
        tenure: Number(form.tenure || 1),
        monthlyCharges: Number(form.monthlyCharges || 199),
        totalCharges: Number(form.totalCharges || 0),
        supportTickets: Number(form.supportTickets || 0),
        watchHoursPerWeek: Number(form.watchHoursPerWeek || 15)
      });
      toast.success(`Subscriber ${form.name} updated and synced to MySQL!`);
      navigate(`/customers/${id}`);
    } catch (err) {
      toast.error("Failed to update subscriber record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page animate-fade-in">
      <div className="back-row">
        <button className="back-btn" onClick={() => navigate(`/customers/${id}`)}>
          <ArrowLeft size={16} /> Back to Subscriber Profile
        </button>
      </div>

      <div className="page-header">
        <div>
          <h2>Edit Subscriber: {existing.name}</h2>
          <p>Modify streaming parameters and test real-time risk impact</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
        <form onSubmit={handleSubmit} className="panel">
          <div className="panel-head">
            <div>
              <h3>Subscription & Profile Details</h3>
              <p>Updates persist directly to MySQL</p>
            </div>
            <PlatformBadge platform={currentPlatform} />
          </div>

          <div style={{ padding: "24px" }}>
            <Field label="Streaming Service Platform" required>
              <select name="platform" value={form.platform || "Netflix"} onChange={update}>
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>

            <div className="form-grid-2">
              <Field label="Full Name" required>
                <input name="name" value={form.name || ""} onChange={update} />
              </Field>
              <Field label="Email Address" required>
                <input type="email" name="email" value={form.email || ""} onChange={update} />
              </Field>
            </div>

            <div className="form-grid-3">
              <Field label="Phone">
                <input name="phone" value={form.phone || ""} onChange={update} />
              </Field>
              <Field label="Age">
                <input type="number" name="age" value={form.age || ""} onChange={update} />
              </Field>
              <Field label="Gender">
                <select name="gender" value={form.gender || "Male"} onChange={update}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </Field>
            </div>

            <div className="form-grid-2">
              <Field label={`${currentPlatform} Plan Tier`}>
                <select name="plan" value={form.plan || ""} onChange={update}>
                  {Object.entries(currentPlans).map(([planName, price]) => (
                    <option key={planName} value={planName}>
                      {planName} {price === 0 ? "(Free)" : `— ₹${price}/mo`}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Pass Commitment Term">
                <select name="contract" value={form.contract || "Monthly"} onChange={update}>
                  <option value="Annual">Annual Pass (Committed)</option>
                  <option value="Monthly">Monthly Pass (Cancel Anytime)</option>
                </select>
              </Field>
            </div>

            <div className="form-grid-3">
              <Field label="Tenure (Months)">
                <input type="number" name="tenure" value={form.tenure || 0} onChange={update} />
              </Field>
              <Field label="Monthly Charges (INR)">
                <input type="number" name="monthlyCharges" value={form.monthlyCharges || 0} onChange={update} />
              </Field>
              <Field label="Payment Method">
                <select name="paymentMethod" value={form.paymentMethod || "UPI AutoPay"} onChange={update}>
                  <option value="UPI AutoPay">UPI AutoPay</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="UPI">Manual UPI</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </Field>
            </div>

            <div className="form-grid-3">
              <Field label={isAudio ? "Weekly Audio Hours" : "Weekly Watch Hours"}>
                <input type="number" step="0.5" name="watchHoursPerWeek" value={form.watchHoursPerWeek || 0} onChange={update} />
              </Field>
              <Field label="Primary Streaming Device">
                <select name="deviceType" value={form.deviceType || currentDevices[0]} onChange={update}>
                  {currentDevices.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="Buffering / Complaint Tickets">
                <input type="number" name="supportTickets" value={form.supportTickets || 0} onChange={update} />
              </Field>
            </div>

            <Field label="Subscription Status">
              <select name="churn" value={form.churn || "Active"} onChange={update}>
                <option value="Active">Active Subscription</option>
                <option value="Churned">Cancelled / Churned</option>
              </select>
            </Field>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              <button type="button" className="secondary-btn" onClick={() => navigate(`/customers/${id}`)}>
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={isSubmitting}>
                <Save size={16} /> {isSubmitting ? "Saving..." : "Save Changes to MySQL"}
              </button>
            </div>
          </div>
        </form>

        <aside className="panel">
          <div className="panel-head">
            <div>
              <h3>Real-Time Risk Feedback</h3>
              <p>Recalculated on edit</p>
            </div>
          </div>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: liveRisk.probability >= 50 ? "var(--color-danger)" : "var(--color-success)" }}>
              {liveRisk.probability}%
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>Predicted Churn Probability</p>
            <RiskBadge score={liveRisk.probability} level={liveRisk.riskLevel} />

            <div style={{ marginTop: "20px", textAlign: "left", fontSize: "12px", color: "var(--text-secondary)" }}>
              <strong>Prescribed Platform Action:</strong>
              <p style={{ marginTop: "4px", background: "var(--bg-muted)", padding: "8px 10px", borderRadius: "6px" }}>{liveRisk.recommendations?.[0]}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}