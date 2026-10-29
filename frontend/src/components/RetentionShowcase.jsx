import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Gift,
  CreditCard,
  Tv,
  Headphones,
  Film,
  Trophy,
  ShoppingBag,
  Percent,
  Layers,
  Clock,
  User,
  X,
  ChevronRight,
  Info,
  Search,
  Check,
  ChevronDown
} from "lucide-react";
import { PlatformLogo, PlatformEmblem } from "./BrandLogos";
import { getCustomers, updateCustomer } from "../services/customerService";
import { calculateChurnRisk, simulateWhatIf } from "../services/predictionEngine";

/**
 * Universal Retention Profile Generator
 * Dynamically generates rich Before vs. After retention case studies for ANY customer
 * (seeded default customers or newly enrolled customers).
 */
export function buildCustomerRetentionProfile(customer) {
  if (!customer) return null;

  const platform = customer.platform || "Netflix";
  const normPlatform = platform.toLowerCase();

  let brandColor = "#E50914";
  let brandGlow = "rgba(229, 9, 20, 0.4)";
  if (normPlatform.includes("prime") || normPlatform.includes("amazon")) {
    brandColor = "#00A8E1";
    brandGlow = "rgba(0, 168, 225, 0.4)";
  } else if (normPlatform.includes("spotify")) {
    brandColor = "#1DB954";
    brandGlow = "rgba(29, 185, 84, 0.4)";
  } else if (normPlatform.includes("hotstar") || normPlatform.includes("disney") || normPlatform.includes("jio")) {
    brandColor = "#0063E5";
    brandGlow = "rgba(0, 99, 229, 0.4)";
  }

  const risk = calculateChurnRisk(customer);
  const beforeRisk = Math.round(risk.probability);

  // Simulated after risk when retention playbook is applied
  const sim = simulateWhatIf(customer, {
    contract: "Annual",
    supportTickets: 0,
    watchHoursPerWeek: Math.max(20, (Number(customer.watchHoursPerWeek) || 12) + 6)
  });
  const afterRisk = Math.max(12, Math.min(30, Math.round(sim.newProbability || Math.round(beforeRisk * 0.28))));

  const monthlyCharges = Number(
    customer.monthlyCharges ||
      customer.monthly_charges ||
      (normPlatform.includes("spotify") ? 119 : normPlatform.includes("hotstar") ? 299 : normPlatform.includes("prime") ? 299 : 649)
  );
  const retainedARR = Math.round(monthlyCharges * 12 * (Math.max(15, beforeRisk - afterRisk) / 100));

  const tenure = Number(customer.tenure || 1);
  const contract = customer.contract || "Monthly";
  const paymentMethod = customer.paymentMethod || "Manual UPI";
  const watchHours = Number(customer.watchHoursPerWeek || 10);
  const supportTickets = Number(customer.supportTickets || 0);
  const plan = customer.plan || customer.subscriptionPlan || "Standard Tier";

  // Dynamic Churn Vulnerability Story based on the customer's actual signals
  let storyProblem = "";
  if (beforeRisk >= 75) {
    storyProblem = `${customer.name} joined ${tenure} months ago on ${platform} (${plan}). Currently on a ${contract} pass paying ₹${monthlyCharges}/mo via ${paymentMethod}. With ${watchHours} hrs/wk activity and ${supportTickets} support ticket(s), ${customer.name} has an acute ${beforeRisk}% churn risk. Traditional systems only detect this after cancellation occurs!`;
  } else if (beforeRisk >= 50) {
    storyProblem = `${customer.name} has been subscribed for ${tenure} months (${watchHours} hrs/wk engagement). On a flexible ${contract} plan via ${paymentMethod}, ${customer.name} displays early warning signs with a ${beforeRisk}% churn probability.`;
  } else {
    storyProblem = `${customer.name} is a healthy active subscriber with ${tenure} months tenure and ${watchHours} hrs/wk usage. Currently at ${beforeRisk}% churn risk, retention can be solidified with annual bundle incentives.`;
  }

  // Dynamic AI Detection explanation
  const topFactorNames = (risk.topFactors || []).map((f) => f.name).join(", ");
  const aiDetection = topFactorNames
    ? `Our ML Model flags critical risk signals: ${topFactorNames}.`
    : `Our ML Model evaluated subscriber tenure (${tenure} mos), contract (${contract}), and ${paymentMethod} billing.`;

  // Dynamic Retention Offer based on platform
  let retentionOffer = {};
  if (normPlatform.includes("netflix")) {
    const discountedMonthly = Math.round(monthlyCharges * 0.8);
    retentionOffer = {
      title: `Special Retention Offer for ${customer.name}`,
      badge: "20% ANNUAL UPGRADE + 4K PERKS",
      headline: `Upgrade to Netflix Annual Ultra 4K & Save 20% (₹${discountedMonthly}/mo) + 1 Extra Profile Free!`,
      discountedMonthly,
      annualTotal: discountedMonthly * 12,
      perks: [
        "20% Direct Discount on 12-Month Plan",
        "Free Upgrade to 4K Ultra HD + Dolby Atmos",
        "1 Free Additional Screen Profile for Family/Friends",
        "Instant ₹100 Cashback on UPI AutoPay setup"
      ],
      callToAction: "Accept 20% Annual Upgrade"
    };
  } else if (normPlatform.includes("prime") || normPlatform.includes("amazon")) {
    retentionOffer = {
      title: `Special Retention Offer for ${customer.name}`,
      badge: "ALL-IN-ONE ECOSYSTEM BUNDLE",
      headline: "Upgrade to Prime Annual All-in-One for ₹1,499/yr (Save 58%) & Get Free Same-Day Delivery!",
      discountedMonthly: 125,
      annualTotal: 1499,
      perks: [
        "58% Effective Discount vs Monthly Video Tier",
        "Unlimited Free Same-Day & 1-Day Amazon Delivery",
        "Ad-Free Prime Music (100M Songs) + Prime Reading",
        "Prime Video 4K HDR Multi-Device Access"
      ],
      callToAction: "Claim Prime All-in-One Bundle"
    };
  } else if (normPlatform.includes("hotstar") || normPlatform.includes("disney") || normPlatform.includes("jio")) {
    retentionOffer = {
      title: `Special Retention Offer for ${customer.name}`,
      badge: "ANNUAL VIP PASS + CRICKET PASS",
      headline: "Lock in 12-Month Hotstar VIP Pass at ₹899/yr + Free Access to all upcoming Live Tournaments!",
      discountedMonthly: 75,
      annualTotal: 899,
      perks: [
        "70% Savings vs Monthly Renewal (₹899/yr)",
        "Guaranteed 4K 50FPS Ultra-low Latency Live Sports Stream",
        "Full Access to HBO & Disney+ Originals",
        "Dedicated VIP CDN Server to Eliminate Buffering"
      ],
      callToAction: "Activate 12-Month VIP Pass"
    };
  } else {
    // Spotify
    retentionOffer = {
      title: `Special Retention Offer for ${customer.name}`,
      badge: "FAMILY / DUO 40% OFF",
      headline: "Switch to Spotify Premium Duo / Family at 40% OFF or get 3 Months Free Spotify Lossless Hi-Fi!",
      discountedMonthly: 71,
      annualTotal: 852,
      perks: [
        "40% Off Shared Family/Duo Tier",
        "3 Months Free Spotify Lossless Hi-Fi Audio",
        "Curated AI Discover Weekly & Daily Mix Boost",
        "Unlimited Offline Song & Podcast Downloads"
      ],
      callToAction: "Claim Spotify Family / Duo Discount"
    };
  }

  const facultyPitch = `Key Retention Impact: Proactive AI identifies ${customer.name}'s ${beforeRisk}% risk 10 days before renewal and triggers a targeted ${platform} retention offer. Applying this drops churn risk to ${afterRisk}%, locking in ₹${retainedARR.toLocaleString("en-IN")} annual protected revenue!`;

  const isDefaultSeed = /^(NFLX-10[1-4]|AMZN-20[1-4]|SPOT-30[1-4]|DHOT-40[1-4])$/.test(customer.id);

  return {
    id: customer.id,
    customerId: customer.id,
    rawCustomer: customer,
    personaName: customer.name,
    avatar: (customer.name || "CU").slice(0, 2).toUpperCase(),
    platform,
    brandColor,
    brandGlow,
    roleTag: `${customer.gender || "Subscriber"} · ${customer.deviceType || "Smart TV"}`,
    plan,
    monthlyFee: monthlyCharges,
    tenure,
    contract,
    paymentMethod,
    watchHours,
    device: customer.deviceType || "Smart TV",
    supportTickets,
    beforeRisk,
    afterRisk,
    retainedARR,
    storyProblem,
    aiDetection,
    retentionOffer,
    facultyPitch,
    isCustomAdded: !isDefaultSeed
  };
}

/**
 * Helper to dispatch event to open Customer Data modal for a specific customer
 */
export function openCustomerDataModal(customerId) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-customer-data-modal", { detail: { customerId } })
    );
  }
}

/**
 * Static fallback personas (for backward compatibility)
 */
export const FACULTY_DEMO_PERSONAS = [
  {
    id: "netflix-rahul",
    platform: "Netflix",
    brandColor: "#E50914",
    brandGlow: "rgba(229, 9, 20, 0.4)",
    personaName: "Rahul Verma",
    avatar: "RV",
    roleTag: "College Student / Tech Enthusiast",
    plan: "Standard Plan (1080p FHD)",
    monthlyFee: 649,
    tenure: 2,
    contract: "Month-to-Month (Cancel Anytime)",
    paymentMethod: "Manual UPI (No AutoPay)",
    watchHours: 2.8,
    device: "Smart TV & Mobile",
    supportTickets: 1,
    beforeRisk: 87,
    afterRisk: 24,
    retainedARR: 6228,
    storyProblem:
      "Rahul joined 2 months ago and pays ₹649 every month manually via UPI. Because he is on a monthly plan with no lock-in and his watch time dropped, he gets bored and is 87% likely to click Cancel next week. Traditional Netflix only discovers this after he cancels.",
    aiDetection:
      "Our ML Model flags 4 critical risk signals: 2-month trial tenure (+20%), Month-to-month contract volatility (+22%), Manual UPI friction (+12%), and Critically low watch time (<4h/wk, +32%).",
    retentionOffer: {
      title: "Special Retention Offer for Rahul",
      badge: "20% ANNUAL UPGRADE",
      headline: "Upgrade to Netflix Annual Ultra 4K & Save 20% + 1 Extra Screen Free!",
      discountedMonthly: 519,
      annualTotal: 6228,
      perks: [
        "20% Direct Discount on 12-Month Plan",
        "Free Upgrade to 4K Ultra HD + Dolby Atmos",
        "1 Free Additional Screen Profile",
        "Instant ₹100 Cashback on UPI AutoPay setup"
      ],
      callToAction: "Accept 20% Annual Upgrade"
    },
    facultyPitch:
      "Key Retention Impact: Proactive AI identifies Rahul's 87% risk 10 days before renewal and triggers a targeted 20% annual discount popup. Rahul sees a great deal and stays, turning a churned customer into ₹6,228 locked-in annual revenue!"
  },
  {
    id: "prime-priya",
    platform: "Amazon Prime Video",
    brandColor: "#00A8E1",
    brandGlow: "rgba(0, 168, 225, 0.4)",
    personaName: "Priya Sharma",
    avatar: "PS",
    roleTag: "Working Professional / Web Series Fan",
    plan: "Prime Monthly (Video Only)",
    monthlyFee: 299,
    tenure: 3,
    contract: "Month-to-Month Pass",
    paymentMethod: "Manual Credit Card",
    watchHours: 3.2,
    device: "Mobile (iPhone 15)",
    supportTickets: 2,
    beforeRisk: 79,
    afterRisk: 21,
    retainedARR: 3588,
    storyProblem:
      "Priya joined 3 months ago strictly to binge a trending Prime Original series. Now that the season ended, she only uses Video-Only and hasn't utilized Prime Fast Delivery or Prime Music, making her 79% likely to drop out.",
    aiDetection:
      "Our ML Model identifies low video usage (+30%), lack of multi-service bundling, and manual credit card renewal friction.",
    retentionOffer: {
      title: "Special Retention Offer for Priya",
      badge: "ALL-IN-ONE ECOSYSTEM BUNDLE",
      headline:
        "Upgrade to Prime Annual All-in-One for ₹1,499/yr (Save 58%) & Get Free Same-Day Amazon Delivery!",
      discountedMonthly: 125,
      annualTotal: 1499,
      perks: [
        "58% Effective Discount vs Monthly Video Tier",
        "Unlimited Free Same-Day & 1-Day Amazon Delivery",
        "Ad-Free Prime Music (100M Songs) + Prime Reading",
        "Prime Video 4K HDR Multi-Device Access"
      ],
      callToAction: "Claim Prime All-in-One Bundle"
    },
    facultyPitch:
      "Key Retention Impact: The AI leverages cross-service bundle economics. Converting a standalone video watcher into the Amazon Prime ecosystem drops churn risk from 79% down to 21% while increasing customer lifetime value."
  },
  {
    id: "hotstar-amit",
    platform: "Disney+ Hotstar",
    brandColor: "#0063E5",
    brandGlow: "rgba(0, 99, 229, 0.4)",
    personaName: "Amit Patel",
    avatar: "AP",
    roleTag: "Live Sports & Cricket Enthusiast",
    plan: "Super Monthly (FHD 2 Screens)",
    monthlyFee: 299,
    tenure: 1,
    contract: "Monthly Tournament Pass",
    paymentMethod: "Manual UPI",
    watchHours: 2.5,
    device: "Smart TV (4K Live Sports)",
    supportTickets: 3,
    beforeRisk: 85,
    afterRisk: 22,
    retainedARR: 3588,
    storyProblem:
      "Amit enrolled 1 month ago solely to stream a live cricket tournament. Once the tournament finished, his watch hours collapsed and he experienced buffering tickets, leading to an 85% post-tournament churn risk.",
    aiDetection:
      "Our ML Model catches tournament cycle decay (+32%), 3 unresolved stream quality complaints (+26%), and 1-month tenure vulnerability (+20%).",
    retentionOffer: {
      title: "Special Retention Offer for Amit",
      badge: "ANNUAL VIP PASS + CRICKET PASS",
      headline:
        "Lock in 12-Month Hotstar Premium 4K Pass at ₹899/yr + Free Access to all upcoming ICC & Premier League Tournaments!",
      discountedMonthly: 75,
      annualTotal: 899,
      perks: [
        "70% Savings vs Monthly Renewal (₹899/yr)",
        "Guaranteed 4K 50FPS Ultra-low Latency Live Sports Stream",
        "Full Access to HBO & Disney+ Global Originals",
        "Dedicated VIP CDN Server to Eliminate Buffering"
      ],
      callToAction: "Activate 12-Month VIP Pass"
    },
    facultyPitch:
      "Key Retention Impact: Solves the biggest challenge in live-sports OTT (post-tournament subscriber cliff). Early detection and annual pass incentives transform seasonal churners into loyal year-round subscribers."
  },
  {
    id: "spotify-sneha",
    platform: "Spotify",
    brandColor: "#1DB954",
    brandGlow: "rgba(29, 185, 84, 0.4)",
    personaName: "Sneha Nair",
    avatar: "SN",
    roleTag: "Casual Music Listener / Student",
    plan: "Premium Individual",
    monthlyFee: 119,
    tenure: 2,
    contract: "Month-to-Month Plan",
    paymentMethod: "Manual UPI",
    watchHours: 3.0,
    device: "Mobile (Android / Earbuds)",
    supportTickets: 2,
    beforeRisk: 82,
    afterRisk: 19,
    retainedARR: 2148,
    storyProblem:
      "Sneha has been on Spotify Individual for 2 months, paying manually via UPI. Because she hasn't set up offline playlists and her daily streaming dropped below 4 hrs/wk, she feels ₹119/mo is unnecessary and is 82% likely to churn.",
    aiDetection:
      "Our ML Model flags low audio streaming engagement (+34%), manual billing friction (+12%), and month-to-month cancellation ease (+22%).",
    retentionOffer: {
      title: "Special Retention Offer for Sneha",
      badge: "FAMILY / DUO 40% OFF",
      headline:
        "Switch to Spotify Premium Duo / Family at 40% OFF or get 3 Months Free Spotify Lossless Hi-Fi!",
      discountedMonthly: 71,
      annualTotal: 852,
      perks: [
        "40% Off Premium Duo / Family Tier (Share with friends/family)",
        "3 Months Free Spotify Lossless Hi-Fi Audio",
        "Curated AI Discover Weekly & Daily Mix Algorithm Boost",
        "Unlimited Offline Song & Podcast Downloads"
      ],
      callToAction: "Claim Spotify Family / Duo Discount"
    },
    facultyPitch:
      "Key Retention Impact: In audio streaming, social multi-account plans (Family/Duo) have a 78% lower churn rate than individual plans. Converting Sneha to a shared plan locks in retention and multi-user stickiness."
  }
];

export function BeforeAfterComparisonCard({
  persona,
  applied,
  onApply,
  onReset,
  compact = false
}) {
  if (!persona) return null;

  const currentRisk = applied ? persona.afterRisk : persona.beforeRisk;
  const isProtected = applied || currentRisk < 40;
  const riskDrop = (persona.beforeRisk || 80) - (persona.afterRisk || 20);

  return (
    <div
      className="retention-comparison-box"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${applied ? "rgba(16, 185, 129, 0.4)" : "var(--border-default)"}`,
        borderRadius: "14px",
        padding: compact ? "12px" : "14px 16px",
        boxShadow: applied ? "0 6px 20px rgba(16, 185, 129, 0.12)" : "var(--shadow-sm)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          right: "-10%",
          width: "200px",
          height: "200px",
          background: `radial-gradient(circle, ${applied ? "rgba(16, 185, 129, 0.12)" : persona.brandGlow || "rgba(229,9,20,0.3)"} 0%, transparent 70%)`,
          pointerEvents: "none"
        }}
      />

      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          position: "relative",
          zIndex: 2
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <PlatformEmblem platform={persona.platform || "Netflix"} size={26} />
          <div>
            <strong
              style={{
                fontSize: "13.5px",
                color: "var(--text-main)",
                display: "block",
                lineHeight: "1.2"
              }}
            >
              {persona.personaName} · {persona.platform}
            </strong>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {persona.roleTag || "Streaming Subscriber"}
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: "10px",
            fontWeight: "800",
            padding: "2px 8px",
            borderRadius: "20px",
            background: applied ? "var(--color-success-bg)" : "var(--color-danger-bg)",
            color: applied ? "var(--color-success)" : "var(--color-danger)",
            border: `1px solid ${applied ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          {applied ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
          {applied ? "RETENTION ACTIVE" : "HIGH CHURN RISK"}
        </span>
      </div>

      {/* Comparison Grid: BEFORE vs AFTER */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "8px",
          alignItems: "stretch",
          background: "var(--bg-canvas)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "10px",
          padding: "10px",
          marginBottom: "10px",
          position: "relative",
          zIndex: 2
        }}
      >
        {/* BEFORE SIDE */}
        <div
          style={{
            padding: "8px 10px",
            borderRadius: "8px",
            background: !applied ? "rgba(239, 68, 68, 0.08)" : "transparent",
            border: !applied
              ? "1px solid rgba(239, 68, 68, 0.25)"
              : "1px dashed var(--border-default)",
            transition: "all 0.25s ease"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--color-danger)"
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                color: "var(--color-danger)"
              }}
            >
              Current Status
            </span>
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: "900",
              color: "var(--color-danger)",
              lineHeight: "1.1",
              margin: "2px 0"
            }}
          >
            {persona.beforeRisk}%
          </div>
          <p
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              margin: "2px 0 4px",
              lineHeight: "1.3"
            }}
          >
            🔴 {persona.contract || "Monthly"} (₹{persona.monthlyFee}/mo) · {persona.paymentMethod || "UPI"}
          </p>
          <div
            style={{
              fontSize: "9.5px",
              color: "var(--color-danger)",
              fontWeight: "600"
            }}
          >
            Risk: Churn Vulnerable
          </div>
        </div>

        {/* ARROW DIVIDER */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: applied ? "var(--color-success)" : "var(--brand-primary)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all 0.25s ease"
            }}
          >
            <ArrowRight size={13} />
          </div>
          <span
            style={{
              fontSize: "9.5px",
              fontWeight: "800",
              color: "var(--color-success)",
              marginTop: "4px"
            }}
          >
            -{riskDrop}%
          </span>
        </div>

        {/* AFTER SIDE */}
        <div
          style={{
            padding: "8px 10px",
            borderRadius: "8px",
            background: applied ? "rgba(16, 185, 129, 0.12)" : "transparent",
            border: applied
              ? "1px solid rgba(16, 185, 129, 0.35)"
              : "1px dashed var(--border-default)",
            transition: "all 0.25s ease"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--color-success)"
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                color: "var(--color-success)"
              }}
            >
              If Offer Applied
            </span>
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: "900",
              color: "var(--color-success)",
              lineHeight: "1.1",
              margin: "2px 0"
            }}
          >
            {persona.afterRisk}%
          </div>
          <p
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              margin: "2px 0 4px",
              lineHeight: "1.3"
            }}
          >
            🟢 Annual Upgrade · AutoPay Setup
          </p>
          <div
            style={{
              fontSize: "9.5px",
              color: "var(--color-success)",
              fontWeight: "600"
            }}
          >
            Status: Protected Safe
          </div>
        </div>
      </div>

      {/* Triggered Retention Offer Pop-up Banner */}
      <div
        style={{
          background: applied ? "var(--color-success-bg)" : "var(--bg-muted)",
          border: `1px solid ${applied ? "rgba(16, 185, 129, 0.3)" : "var(--border-default)"}`,
          borderRadius: "10px",
          padding: "10px 12px",
          marginBottom: "10px",
          position: "relative",
          zIndex: 2
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "4px"
          }}
        >
          <span
            style={{
              fontSize: "9.5px",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: persona.brandColor || "var(--brand-primary)"
            }}
          >
            <Gift size={11} style={{ verticalAlign: "middle", marginRight: "3px" }} />
            {persona.retentionOffer?.badge || "SPECIAL RETENTION OFFER"}
          </span>
          <span style={{ fontSize: "10.5px", fontWeight: "700", color: "var(--text-main)" }}>
            Retains ₹{(persona.retainedARR || 3500).toLocaleString("en-IN")}/yr ARR
          </span>
        </div>
        <h5
          style={{
            fontSize: "11.5px",
            color: "var(--text-main)",
            fontWeight: "700",
            margin: "0 0 4px",
            lineHeight: "1.3"
          }}
        >
          {persona.retentionOffer?.headline || "Personalized Annual Retention Bundle"}
        </h5>
        <ul
          style={{
            margin: "0 0 8px",
            paddingLeft: "16px",
            fontSize: "10.5px",
            color: "var(--text-secondary)",
            lineHeight: "1.35"
          }}
        >
          {(persona.retentionOffer?.perks || ["20% Annual Plan Discount", "Free Multi-Screen Upgrade"]).slice(0, 2).map((perk, i) => (
            <li key={i}>{perk}</li>
          ))}
        </ul>

        {/* Action Button */}
        <div style={{ display: "flex", gap: "6px" }}>
          {!applied ? (
            <button
              className="primary-btn btn-sm"
              onClick={onApply}
              style={{
                background: persona.brandColor || "var(--brand-primary)",
                borderColor: persona.brandColor || "var(--brand-primary)",
                width: "100%",
                justifyContent: "center",
                height: "30px",
                fontSize: "11.5px",
                boxShadow: `0 3px 10px ${persona.brandGlow || "rgba(0,0,0,0.2)"}`
              }}
            >
              <Zap size={13} /> Simulate Retention Offer Trigger
            </button>
          ) : (
            <button
              className="secondary-btn btn-sm"
              onClick={onReset}
              style={{
                width: "100%",
                justifyContent: "center",
                height: "30px",
                fontSize: "11px"
              }}
            >
              Reset to Before ({persona.beforeRisk}% Risk)
            </button>
          )}
        </div>
      </div>

      {/* Key Business Insight Note */}
      <div
        style={{
          background: "rgba(79, 70, 229, 0.08)",
          borderLeft: "3px solid var(--brand-primary)",
          borderRadius: "0 6px 6px 0",
          padding: "6px 10px",
          fontSize: "10.5px",
          color: "var(--text-secondary)",
          lineHeight: "1.35",
          position: "relative",
          zIndex: 2
        }}
      >
        <strong
          style={{
            color: "var(--brand-primary)",
            display: "inline-block",
            marginRight: "4px"
          }}
        >
          💡 Key Business Insight:
        </strong>
        {persona.facultyPitch}
      </div>
    </div>
  );
}

/**
 * CustomerDataModal (formerly FacultyDemoModal)
 * Clean, uncluttered design with platform brand tabs & subscriber search/dropdown!
 */
export function FacultyDemoModal({ isOpen, onClose, initialCustomerId }) {
  const [customersList, setCustomersList] = useState([]);
  const [platformTab, setPlatformTab] = useState("Netflix");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);
  const [appliedOffers, setAppliedOffers] = useState({});

  // Reload customers from customerService whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const all = getCustomers();
      setCustomersList(all);
      if (initialCustomerId) {
        setSelectedPersonaId(initialCustomerId);
        const target = all.find((c) => c.id === initialCustomerId);
        if (target && target.platform) {
          setPlatformTab(target.platform);
        }
      } else {
        // Choose high-risk Netflix subscriber by default (e.g. Rahul)
        const netflixCust = all.find((c) => (c.platform || "").toLowerCase().includes("netflix") && (c.riskScore || 0) >= 60) ||
          all.find((c) => (c.platform || "").toLowerCase().includes("netflix")) ||
          all[0];
        if (netflixCust) {
          setSelectedPersonaId(netflixCust.id);
          setPlatformTab("Netflix");
        }
      }
    }
  }, [isOpen, initialCustomerId]);

  // Convert raw customers to full dynamic retention profiles
  const retentionProfiles = useMemo(() => {
    return customersList.map(buildCustomerRetentionProfile).filter(Boolean);
  }, [customersList]);

  // Filter subscribers matching active platform and search
  const filteredProfiles = useMemo(() => {
    return retentionProfiles.filter((p) => {
      const matchesPlatform =
        platformTab === "All"
          ? true
          : platformTab === "HighRisk"
          ? p.beforeRisk >= 60
          : (p.platform || "").toLowerCase().includes(platformTab.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.personaName + p.id + p.platform + p.plan).toLowerCase().includes(q);

      return matchesPlatform && matchesSearch;
    });
  }, [retentionProfiles, platformTab, searchQuery]);

  // Handle switching platform tabs: immediately pick the best customer for that platform!
  const handleSelectPlatform = (tabId) => {
    setPlatformTab(tabId);
    setSearchQuery(""); // reset search on tab switch
    const matches = retentionProfiles.filter((p) => {
      if (tabId === "All") return true;
      if (tabId === "HighRisk") return p.beforeRisk >= 60;
      return (p.platform || "").toLowerCase().includes(tabId.toLowerCase());
    });
    if (matches.length > 0) {
      // Pick highest risk subscriber on this platform
      const topRisk = matches.reduce((max, p) => (p.beforeRisk > max.beforeRisk ? p : max), matches[0]);
      setSelectedPersonaId(topRisk.id);
    }
  };

  // Active persona
  const currentPersona = useMemo(() => {
    return (
      filteredProfiles.find((p) => p.id === selectedPersonaId) ||
      filteredProfiles[0] ||
      retentionProfiles[0] ||
      FACULTY_DEMO_PERSONAS[0]
    );
  }, [filteredProfiles, retentionProfiles, selectedPersonaId]);

  if (!isOpen) return null;

  const isApplied = !!appliedOffers[currentPersona?.id];

  const handleApply = () => {
    if (!currentPersona) return;
    setAppliedOffers((prev) => ({ ...prev, [currentPersona.id]: true }));
  };

  const handleReset = () => {
    if (!currentPersona) return;
    setAppliedOffers((prev) => ({ ...prev, [currentPersona.id]: false }));
  };

  const platformTabs = [
    { id: "Netflix", label: "Netflix", color: "#E50914", platformName: "Netflix" },
    { id: "Prime", label: "Prime Video", color: "#00A8E1", platformName: "Amazon Prime Video" },
    { id: "Hotstar", label: "Disney+ Hotstar", color: "#0063E5", platformName: "Disney+ Hotstar" },
    { id: "Spotify", label: "Spotify", color: "#1DB954", platformName: "Spotify" }
  ];

  return (
    <div
      className="modal-backdrop animate-fade-in"
      onClick={onClose}
      style={{ zIndex: 1000, padding: "16px" }}
    >
      <div
        className="modal-dialog animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "920px",
          width: "95vw",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "22px 26px",
          borderRadius: "16px",
          background: "var(--bg-surface)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px"
          }}
        >
          <div>
            <span
              className="eyebrow blue"
              style={{
                background: "rgba(229, 9, 20, 0.12)",
                color: "#E50914",
                border: "1px solid rgba(229, 9, 20, 0.3)",
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: "800",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <Sparkles size={12} /> CUSTOMER RETENTION SUITE
            </span>
            <h2
              style={{
                fontSize: "20px",
                margin: "6px 0 3px",
                color: "var(--text-main)",
                fontWeight: "800",
                letterSpacing: "-0.3px"
              }}
            >
              Customer Retention Data & Live Case Studies
            </h2>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0 }}>
              Live customer intelligence and machine learning retention models for{" "}
              <strong style={{ color: "var(--text-main)" }}>Netflix, Prime Video, Disney+ Hotstar, and Spotify</strong>.
            </p>
          </div>
          <button
            className="icon-btn"
            onClick={onClose}
            style={{
              background: "var(--bg-muted)",
              width: "34px",
              height: "34px",
              borderRadius: "8px"
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Streaming Brand Platforms Switcher Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px",
            marginBottom: "16px"
          }}
        >
          {platformTabs.map((t) => {
            const isCurrent = platformTab === t.id;
            const count = retentionProfiles.filter((p) =>
              (p.platform || "").toLowerCase().includes(t.id.toLowerCase())
            ).length;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectPlatform(t.id)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: isCurrent
                    ? `2px solid ${t.color}`
                    : "1px solid var(--border-default)",
                  background: isCurrent
                    ? `${t.color}15`
                    : "var(--bg-canvas)",
                  color: isCurrent ? "var(--text-main)" : "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: isCurrent ? `0 4px 16px ${t.color}35` : "var(--shadow-xs)",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  textAlign: "left"
                }}
              >
                <PlatformEmblem
                  platform={t.platformName || t.id}
                  size={32}
                />
                <div style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: isCurrent ? "800" : "600",
                      color: isCurrent ? t.color : "var(--text-main)",
                      lineHeight: "1.2",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {t.label}
                  </div>
                  <span
                    style={{
                      fontSize: "10.5px",
                      color: "var(--text-muted)",
                      display: "block",
                      marginTop: "1px"
                    }}
                  >
                    {count} {count === 1 ? "subscriber" : "subscribers"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Real-time Subscriber Search Bar (NO DROPDOWN) */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--brand-primary)",
                pointerEvents: "none"
              }}
            />
            <input
              type="text"
              placeholder="Search subscriber by name (e.g. Rahul, Priya, Amit, Sneha), ID (e.g. DHOT-403), or plan..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim()) {
                  const q = val.toLowerCase().trim();
                  const match = retentionProfiles.find((p) =>
                    (p.personaName + p.id + p.platform + p.plan).toLowerCase().includes(q)
                  );
                  if (match) {
                    setSelectedPersonaId(match.id);
                  }
                }
              }}
              style={{
                width: "100%",
                height: "42px",
                fontSize: "13px",
                fontWeight: "500",
                padding: "8px 38px 8px 40px",
                borderRadius: "10px",
                border: "1.5px solid var(--border-default)",
                background: "var(--bg-canvas)",
                color: "var(--text-main)",
                outline: "none",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "var(--bg-muted)",
                  border: "none",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  color: "var(--text-muted)"
                }}
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Subscriber Selector Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "8px",
            marginBottom: "16px",
            scrollbarWidth: "thin"
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            Subscribers ({filteredProfiles.length}):
          </span>

          {filteredProfiles.length === 0 ? (
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
              No subscribers found matching "{searchQuery}"
            </span>
          ) : (
            filteredProfiles.map((p) => {
              const isSelected = p.id === currentPersona?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPersonaId(p.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: isSelected
                      ? `1.5px solid ${p.brandColor || "var(--brand-primary)"}`
                      : "1px solid var(--border-default)",
                    background: isSelected
                      ? `${p.brandColor || "#4f46e5"}18`
                      : "var(--bg-canvas)",
                    color: isSelected ? "var(--text-main)" : "var(--text-secondary)",
                    fontWeight: isSelected ? "700" : "500",
                    fontSize: "12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: isSelected
                      ? `0 2px 10px ${p.brandGlow || "rgba(0,0,0,0.12)"}`
                      : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: p.brandColor || "var(--brand-primary)",
                      color: "#fff",
                      fontSize: "9.5px",
                      fontWeight: "800",
                      display: "grid",
                      placeItems: "center"
                    }}
                  >
                    {p.avatar}
                  </span>
                  <span>{p.personaName}</span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      background:
                        p.beforeRisk >= 60
                          ? "var(--color-danger-bg)"
                          : "var(--color-success-bg)",
                      color:
                        p.beforeRisk >= 60
                          ? "var(--color-danger)"
                          : "var(--color-success)"
                    }}
                  >
                    {p.beforeRisk}% Risk
                  </span>
                  {p.isCustomAdded && (
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: "800",
                        color: "#10B981",
                        background: "rgba(16, 185, 129, 0.15)",
                        padding: "1px 5px",
                        borderRadius: "3px"
                      }}
                    >
                      NEW
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Deep Dive Story & Comparison for Selected Customer */}
        {currentPersona ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.1fr",
              gap: "16px",
              alignItems: "start"
            }}
          >
            {/* Left: Persona Scenario Story */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                className="panel"
                style={{
                  padding: "16px",
                  borderLeft: `4px solid ${currentPersona.brandColor || "var(--brand-primary)"}`,
                  borderRadius: "12px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px"
                  }}
                >
                  <div
                    style={{
                      background: `${currentPersona.brandColor || "#4f46e5"}22`,
                      color: currentPersona.brandColor || "#4f46e5",
                      border: `1.5px solid ${currentPersona.brandColor || "#4f46e5"}55`,
                      fontWeight: "800",
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0
                    }}
                  >
                    {currentPersona.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          color: "var(--text-main)",
                          fontWeight: "800"
                        }}
                      >
                        {currentPersona.personaName}
                      </h4>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          color: "var(--text-muted)",
                          background: "var(--bg-muted)",
                          padding: "1px 6px",
                          borderRadius: "4px"
                        }}
                      >
                        {currentPersona.id}
                      </span>
                      {currentPersona.isCustomAdded && (
                        <span
                          style={{
                            fontSize: "9.5px",
                            fontWeight: "800",
                            color: "var(--color-success)",
                            background: "rgba(16, 185, 129, 0.15)",
                            padding: "1px 6px",
                            borderRadius: "4px"
                          }}
                        >
                          🌟 NEW SUBSCRIBER
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                      <PlatformEmblem platform={currentPersona.platform} size={16} />
                      <small style={{ color: "var(--text-muted)", fontSize: "11.5px" }}>
                        {currentPersona.platform} · {currentPersona.plan} · ₹{currentPersona.monthlyFee}/mo
                      </small>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "6px",
                    fontSize: "11px",
                    background: "var(--bg-canvas)",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    marginBottom: "10px"
                  }}
                >
                  <div>
                    <span
                      style={{
                        color: "var(--text-muted)",
                        display: "block",
                        fontSize: "9.5px"
                      }}
                    >
                      Contract Term:
                    </span>
                    <strong>{currentPersona.contract}</strong>
                  </div>
                  <div>
                    <span
                      style={{
                        color: "var(--text-muted)",
                        display: "block",
                        fontSize: "9.5px"
                      }}
                    >
                      Payment Method:
                    </span>
                    <strong
                      style={{
                        color:
                          (currentPersona.paymentMethod || "").includes("Manual") ||
                          currentPersona.paymentMethod === "UPI"
                            ? "var(--color-danger)"
                            : "var(--color-success)"
                      }}
                    >
                      {currentPersona.paymentMethod}
                    </strong>
                  </div>
                  <div>
                    <span
                      style={{
                        color: "var(--text-muted)",
                        display: "block",
                        fontSize: "9.5px"
                      }}
                    >
                      Usage (Weekly):
                    </span>
                    <strong>{currentPersona.watchHours} hrs/wk</strong>
                  </div>
                  <div>
                    <span
                      style={{
                        color: "var(--text-muted)",
                        display: "block",
                        fontSize: "9.5px"
                      }}
                    >
                      Tenure:
                    </span>
                    <strong>{currentPersona.tenure} Months</strong>
                  </div>
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <strong
                    style={{
                      fontSize: "10.5px",
                      color: "var(--color-danger)",
                      textTransform: "uppercase",
                      display: "block",
                      marginBottom: "3px"
                    }}
                  >
                    🔴 Real-Life Churn Vulnerability:
                  </strong>
                  <p
                    style={{
                      fontSize: "11.5px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.45",
                      margin: 0
                    }}
                  >
                    {currentPersona.storyProblem}
                  </p>
                </div>

                <div>
                  <strong
                    style={{
                      fontSize: "10.5px",
                      color: "var(--brand-primary)",
                      textTransform: "uppercase",
                      display: "block",
                      marginBottom: "3px"
                    }}
                  >
                    ⚡ AI Early Risk Detection:
                  </strong>
                  <p
                    style={{
                      fontSize: "11.5px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.45",
                      margin: 0
                    }}
                  >
                    {currentPersona.aiDetection}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Comparison Box */}
            <div>
              <BeforeAfterComparisonCard
                persona={currentPersona}
                applied={isApplied}
                onApply={handleApply}
                onReset={handleReset}
                compact={true}
              />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
            No subscribers found matching this search or filter.
          </div>
        )}

        {/* Modal Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid var(--border-subtle)"
          }}
        >
          <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
            Active Platform: <strong>{platformTab}</strong> ({filteredProfiles.length} subscriber profiles available)
          </span>
          <button
            className="primary-btn btn-sm"
            onClick={onClose}
            style={{
              background: currentPersona?.brandColor || "var(--brand-primary)",
              borderColor: currentPersona?.brandColor || "var(--brand-primary)",
              height: "32px",
              fontSize: "12px"
            }}
          >
            Close Customer Data
          </button>
        </div>
      </div>
    </div>
  );
}

// Alias for clean naming
export const CustomerDataModal = FacultyDemoModal;

export default {
  FACULTY_DEMO_PERSONAS,
  BeforeAfterComparisonCard,
  FacultyDemoModal,
  CustomerDataModal,
  buildCustomerRetentionProfile,
  openCustomerDataModal
};
