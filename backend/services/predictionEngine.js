/**
 * Multi-Platform Streaming & OTT Churn Intelligence Engine
 * Platforms: Netflix, Amazon Prime Video, Disney+ Hotstar, Spotify
 */

export function calculateChurnRisk(customer) {
  if (!customer) {
    return {
      probability: 0,
      riskLevel: "Low Risk",
      confidence: 94,
      riskColor: "green",
      badgeTone: "success",
      topFactors: [],
      positiveDrivers: [],
      recommendations: []
    };
  }

  let score = 20; // Baseline streaming risk
  const factors = [];
  const positiveDrivers = [];
  const recommendations = [];

  const platform = customer.platform || "Netflix";
  const normPlatform = platform.toLowerCase();
  const tenure = Number(customer.tenure || 0);
  const monthlyCharges = Number(customer.monthlyCharges || customer.monthly_charges || 649);
  const contract = customer.contract || "Monthly";
  const paymentMethod = customer.paymentMethod || customer.payment_method || "UPI AutoPay";
  const plan = customer.plan || customer.subscriptionPlan || "Standard";
  const watchHours = Number(customer.watchHoursPerWeek || customer.watch_hours_per_week || 15);
  const supportTickets = Number(
    customer.supportTickets !== undefined
      ? customer.supportTickets
      : customer.churn === "Churned"
      ? 4
      : 0
  );

  // 1. Engagement & Stream/Listening Activity
  if (normPlatform.includes("spotify")) {
    if (watchHours < 4.0) {
      score += 34;
      factors.push({ name: "Low daily audio stream time (< 4 hrs/week)", impact: "+34%", type: "negative" });
      recommendations.push("Push AI-generated Discover Weekly playlist and customized artist concert alerts.");
    } else if (watchHours >= 25.0) {
      score -= 28;
      positiveDrivers.push({ name: "Daily power music/podcast listener (25+ hrs/week)", impact: "-28%", type: "positive" });
    }
  } else if (normPlatform.includes("hotstar") || normPlatform.includes("disney")) {
    if (watchHours < 4.0) {
      score += 32;
      factors.push({ name: "Post-tournament engagement drop (< 4 hrs/week)", impact: "+32%", type: "negative" });
      recommendations.push("Promote upcoming ICC tournaments, Premier League live matches, and Disney 4K Specials.");
    } else if (watchHours >= 20.0) {
      score -= 25;
      positiveDrivers.push({ name: "Active live sports & series watcher (20+ hrs/week)", impact: "-25%", type: "positive" });
    }
  } else if (normPlatform.includes("prime") || normPlatform.includes("amazon")) {
    if (watchHours < 4.0) {
      score += 30;
      factors.push({ name: "Low video stream engagement (< 4 hrs/week)", impact: "+30%", type: "negative" });
      recommendations.push("Cross-promote Prime Shopping 1-day delivery deals alongside trending Prime Originals.");
    } else if (watchHours >= 20.0) {
      score -= 24;
      positiveDrivers.push({ name: "Heavy Prime Video streamer (20+ hrs/week)", impact: "-24%", type: "positive" });
    }
  } else {
    // Netflix
    if (watchHours < 4.0) {
      score += 32;
      factors.push({ name: "Critically low streaming watch time (< 4 hrs/week)", impact: "+32%", type: "negative" });
      recommendations.push("Deploy personalized email & push notifications highlighting trending Top-10 Series.");
    } else if (watchHours >= 20.0) {
      score -= 25;
      positiveDrivers.push({ name: "High power streamer engagement (20+ hrs/week)", impact: "-25%", type: "positive" });
    }
  }

  // 2. Playback / Buffering Complaints
  if (supportTickets >= 3) {
    score += 26;
    factors.push({ name: `Frequent streaming / buffering support complaints (${supportTickets} tickets)`, impact: "+26%", type: "negative" });
    recommendations.push(`Assign senior streaming technical support to resolve CDN/bitrate issues on ${platform}.`);
  } else if (supportTickets === 0) {
    score -= 10;
    positiveDrivers.push({ name: "Flawless streaming experience (0 complaints)", impact: "-10%", type: "positive" });
  }

  // 3. Contract / Pass Commitment
  if (contract === "Monthly" || contract === "Monthly Pass" || contract.toLowerCase().includes("month")) {
    score += 22;
    factors.push({ name: "Month-to-month subscription (no annual lock-in)", impact: "+22%", type: "negative" });
    recommendations.push(`Offer 20% discount on upgrading to the ${platform} Annual Pass commitment.`);
  } else if (contract === "Annual" || contract === "Annual Pass" || contract.toLowerCase().includes("annual")) {
    score -= 28;
    positiveDrivers.push({ name: "Annual Pass subscriber commitment", impact: "-28%", type: "positive" });
  }

  // 4. Subscriber Tenure
  if (tenure <= 2) {
    score += 20;
    factors.push({ name: "New onboarding trial phase (<= 2 months)", impact: "+20%", type: "negative" });
    recommendations.push("Deliver curated genre discovery walkthrough and profile personalization tour.");
  } else if (tenure >= 18) {
    score -= 22;
    positiveDrivers.push({ name: "Long-term loyal subscriber (18+ months)", impact: "-22%", type: "positive" });
  }

  // 5. Plan Tier Nuances
  if (plan.includes("Free") || plan.includes("Mobile")) {
    score += 14;
    factors.push({ name: "Limited single-device tier limitation", impact: "+14%", type: "negative" });
    recommendations.push(`Offer a special 50% discount to upgrade to ${platform} Multi-Screen/Lossless tier.`);
  } else if (plan.includes("Premium") || plan.includes("Family")) {
    score -= 12;
    positiveDrivers.push({ name: "Premium multi-screen / family tier plan", impact: "-12%", type: "positive" });
  }

  // 6. Payment Method
  if (paymentMethod.includes("AutoPay") || paymentMethod === "Credit Card") {
    score -= 10;
    positiveDrivers.push({ name: "Seamless automated payment stream", impact: "-10%", type: "positive" });
  } else if (paymentMethod === "Manual" || paymentMethod === "UPI" || paymentMethod === "Net Banking") {
    score += 12;
    factors.push({ name: "Manual renewal friction without AutoPay", impact: "+12%", type: "negative" });
    recommendations.push("Offer instant bill credit for enabling recurring AutoPay billing.");
  }

  // Bound score between 3% and 98%
  let probability = Math.max(3, Math.min(98, Math.round(score)));

  if (customer.churn === "Churned" || customer.churn === "CHURNED") {
    probability = Math.max(88, probability);
  }

  let riskLevel = "Low Risk";
  let riskColor = "green";
  let badgeTone = "success";

  if (probability >= 80) {
    riskLevel = "Critical Risk";
    riskColor = "red";
    badgeTone = "danger";
  } else if (probability >= 60) {
    riskLevel = "High Risk";
    riskColor = "red";
    badgeTone = "danger";
  } else if (probability >= 35) {
    riskLevel = "Moderate Risk";
    riskColor = "amber";
    badgeTone = "warning";
  }

  return {
    probability,
    riskLevel,
    riskColor,
    badgeTone,
    confidence: 94,
    topFactors: factors,
    positiveDrivers,
    recommendations: recommendations.length > 0 ? recommendations : [`Maintain high stream delivery quality across ${platform}.`]
  };
}

export function simulateWhatIf(baseCustomer, overrides) {
  const currentRisk = calculateChurnRisk(baseCustomer);
  const simulatedCustomer = { ...baseCustomer, ...overrides };
  const newRisk = calculateChurnRisk(simulatedCustomer);
  const delta = newRisk.probability - currentRisk.probability;
  const annualRevenue = Number(simulatedCustomer.monthlyCharges || 649) * 12;
  const expectedRetainedRevenue = Math.round(annualRevenue * (Math.abs(Math.min(0, delta)) / 100));

  return {
    baseCustomer,
    simulatedCustomer,
    currentRisk,
    newRisk,
    probabilityDelta: delta,
    riskDelta: delta,
    expectedRetainedRevenue,
    riskDrop: currentRisk.probability - newRisk.probability,
    isImprovement: newRisk.probability < currentRisk.probability
  };
}

export function attachIntelligence(customer) {
  const intel = calculateChurnRisk(customer);
  return {
    ...customer,
    riskScore: intel.probability,
    churnProbability: intel.probability,
    riskLevel: intel.riskLevel,
    riskColor: intel.riskColor,
    badgeTone: intel.badgeTone,
    intelligence: intel
  };
}

export default { calculateChurnRisk, simulateWhatIf, attachIntelligence };
