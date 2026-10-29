import { calculateChurnRisk } from "./predictionEngine";
import api from "./apiClient";

export const initialSeedCustomers = [
  // ================= NETFLIX =================
  {
    id: "NFLX-101",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98450 12345",
    platform: "Netflix",
    company: "Netflix Family",
    plan: "Premium (4K + HDR)",
    subscriptionPlan: "Premium (4K + HDR)",
    deviceType: "Smart TV (Samsung OLED)",
    age: 28,
    gender: "Male",
    tenure: 18,
    monthlyCharges: 799,
    totalCharges: 14382,
    contract: "Annual",
    paymentMethod: "UPI AutoPay",
    supportTickets: 0,
    watchHoursPerWeek: 26.5,
    numProfiles: 4,
    streamingTV: "Yes",
    streamingMovies: "Yes",
    downloadOffline: "Yes",
    churn: "Active",
    joinedDate: "2023-03-15"
  },
  {
    id: "NFLX-102",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 98230 45678",
    platform: "Netflix",
    company: "Netflix Personal",
    plan: "Standard (1080p FHD)",
    subscriptionPlan: "Standard (1080p FHD)",
    deviceType: "Apple TV 4K",
    age: 32,
    gender: "Female",
    tenure: 14,
    monthlyCharges: 649,
    totalCharges: 9086,
    contract: "Annual",
    paymentMethod: "Credit Card",
    supportTickets: 0,
    watchHoursPerWeek: 19.0,
    numProfiles: 2,
    streamingTV: "Yes",
    streamingMovies: "Yes",
    downloadOffline: "Yes",
    churn: "Active",
    joinedDate: "2023-07-20"
  },
  {
    id: "NFLX-103",
    name: "Vikram Reddy",
    email: "vikram.reddy@example.com",
    phone: "+91 97120 78901",
    platform: "Netflix",
    company: "Netflix Individual",
    plan: "Mobile (480p SD)",
    subscriptionPlan: "Mobile (480p SD)",
    deviceType: "Mobile (Android)",
    age: 22,
    gender: "Male",
    tenure: 2,
    monthlyCharges: 199,
    totalCharges: 398,
    contract: "Monthly",
    paymentMethod: "UPI",
    supportTickets: 4,
    watchHoursPerWeek: 3.2,
    numProfiles: 1,
    streamingTV: "No",
    streamingMovies: "Yes",
    downloadOffline: "No",
    churn: "Churned",
    joinedDate: "2024-07-10"
  },
  {
    id: "NFLX-104",
    name: "Sneha Rao",
    email: "sneha.rao@example.com",
    phone: "+91 96540 23456",
    platform: "Netflix",
    company: "Netflix Duo",
    plan: "Standard (1080p FHD)",
    subscriptionPlan: "Standard (1080p FHD)",
    deviceType: "iPad Pro / Tablet",
    age: 29,
    gender: "Female",
    tenure: 30,
    monthlyCharges: 649,
    totalCharges: 19470,
    contract: "Annual",
    paymentMethod: "Credit Card",
    supportTickets: 1,
    watchHoursPerWeek: 21.0,
    numProfiles: 2,
    streamingTV: "Yes",
    streamingMovies: "Yes",
    downloadOffline: "Yes",
    churn: "Active",
    joinedDate: "2022-03-01"
  },

  // ================= AMAZON PRIME VIDEO =================
  {
    id: "AMZN-201",
    name: "Rahul Verma",
    email: "rahul.verma@example.com",
    phone: "+91 98330 11223",
    platform: "Amazon Prime Video",
    company: "Prime All-Access",
    plan: "Prime Annual (Video + Delivery)",
    subscriptionPlan: "Prime Annual (Video + Delivery)",
    deviceType: "Fire TV Stick 4K",
    age: 31,
    gender: "Male",
    tenure: 24,
    monthlyCharges: 125,
    totalCharges: 3000,
    contract: "Annual",
    paymentMethod: "Amazon Pay UPI",
    supportTickets: 0,
    watchHoursPerWeek: 22.0,
    numProfiles: 3,
    streamingTV: "Yes",
    streamingMovies: "Yes",
    downloadOffline: "Yes",
    churn: "Active",
    joinedDate: "2022-08-10"
  },
  {
    id: "AMZN-202",
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "+91 99000 22334",
    platform: "Amazon Prime Video",
    company: "Prime Monthly Pass",
    plan: "Prime Monthly (Video Only)",
    subscriptionPlan: "Prime Monthly (Video Only)",
    deviceType: "Mobile (iPhone 15)",
    age: 25,
    gender: "Female",
    tenure: 2,
    monthlyCharges: 299,
    totalCharges: 598,
    contract: "Monthly",
    paymentMethod: "Credit Card",
    supportTickets: 3,
    watchHoursPerWeek: 3.5,
    numProfiles: 1,
    streamingTV: "No",
    streamingMovies: "Yes",
    downloadOffline: "No",
    churn: "Active",
    joinedDate: "2024-07-01"
  },
  {
    id: "AMZN-203",
    name: "Sanjay Gupta",
    email: "sanjay.gupta@example.com",
    phone: "+91 98111 33445",
    platform: "Amazon Prime Video",
    company: "Prime Lite Plan",
    plan: "Prime Lite (HD 720p)",
    subscriptionPlan: "Prime Lite (HD 720p)",
    deviceType: "Smart TV (Sony)",
    age: 44,
    gender: "Male",
    tenure: 12,
    monthlyCharges: 67,
    totalCharges: 804,
    contract: "Annual",
    paymentMethod: "Net Banking",
    supportTickets: 1,
    watchHoursPerWeek: 15.0,
    numProfiles: 2,
    streamingTV: "Yes",
    streamingMovies: "Yes",
    downloadOffline: "No",
    churn: "Active",
    joinedDate: "2023-08-15"
  },
  {
    id: "AMZN-204",
    name: "Divya Menon",
    email: "divya.menon@example.com",
    phone: "+91 97450 44556",
    platform: "Amazon Prime Video",
    company: "Prime Monthly",
    plan: "Prime Monthly (Video Only)",
    subscriptionPlan: "Prime Monthly (Video Only)",
    deviceType: "Web Browser (Chrome)",
    age: 27,
    gender: "Female",
    tenure: 3,
    monthlyCharges: 299,
    totalCharges: 897,
    contract: "Monthly",
    paymentMethod: "Debit Card",
    supportTickets: 5,
    watchHoursPerWeek: 2.0,
    numProfiles: 1,
    streamingTV: "No",
    streamingMovies: "No",
    downloadOffline: "No",
    churn: "Churned",
    joinedDate: "2024-05-20"
  },

  // ================= SPOTIFY =================
  {
    id: "SPOT-301",
    name: "Arjun Kapoor",
    email: "arjun.kapoor@example.com",
    phone: "+91 98765 55667",
    platform: "Spotify",
    company: "Spotify Music Lover",
    plan: "Premium Individual (Lossless)",
    subscriptionPlan: "Premium Individual (Lossless)",
    deviceType: "Mobile (Android Auto / Car)",
    age: 23,
    gender: "Male",
    tenure: 20,
    monthlyCharges: 119,
    totalCharges: 2380,
    contract: "Monthly",
    paymentMethod: "UPI AutoPay",
    supportTickets: 0,
    watchHoursPerWeek: 35.0,
    numProfiles: 1,
    streamingTV: "No",
    streamingMovies: "No",
    downloadOffline: "Yes",
    churn: "Active",
    joinedDate: "2023-01-10"
  },
  {
    id: "SPOT-302",
    name: "Neha Singhal",
    email: "neha.singhal@example.com",
    phone: "+91 98220 66778",
    platform: "Spotify",
    company: "Spotify Family Plan",
    plan: "Premium Family (6 Accounts)",
    subscriptionPlan: "Premium Family (6 Accounts)",
    deviceType: "Smart Speaker (Alexa/Sonos)",
    age: 33,
    gender: "Female",
    tenure: 28,
    monthlyCharges: 179,
    totalCharges: 5012,
    contract: "Annual",
    paymentMethod: "Credit Card",
    supportTickets: 0,
    watchHoursPerWeek: 42.0,
    numProfiles: 6,
    streamingTV: "No",
    streamingMovies: "No",
    downloadOffline: "Yes",
    churn: "Active",
    joinedDate: "2022-04-12"
  },
  {
    id: "SPOT-303",
    name: "Rohit Malhotra",
    email: "rohit.malhotra@example.com",
    phone: "+91 97111 77889",
    platform: "Spotify",
    company: "Spotify Free Tier",
    plan: "Free with Audio Ads",
    subscriptionPlan: "Free with Audio Ads",
    deviceType: "Mobile (iOS)",
    age: 20,
    gender: "Male",
    tenure: 1,
    monthlyCharges: 0,
    totalCharges: 0,
    contract: "Monthly",
    paymentMethod: "None",
    supportTickets: 4,
    watchHoursPerWeek: 2.2,
    numProfiles: 1,
    streamingTV: "No",
    streamingMovies: "No",
    downloadOffline: "No",
    churn: "Churned",
    joinedDate: "2024-08-01"
  },
  {
    id: "SPOT-304",
    name: "Tanya Sen",
    email: "tanya.sen@example.com",
    phone: "+91 99880 88990",
    platform: "Spotify",
    company: "Spotify Campus Plan",
    plan: "Premium Student (50% Off)",
    subscriptionPlan: "Premium Student (50% Off)",
    deviceType: "iPad Pro / Mac",
    age: 21,
    gender: "Female",
    tenure: 8,
    monthlyCharges: 59,
    totalCharges: 472,
    contract: "Monthly",
    paymentMethod: "UPI AutoPay",
    supportTickets: 0,
    watchHoursPerWeek: 24.0,
    numProfiles: 1,
    streamingTV: "No",
    streamingMovies: "No",
    downloadOffline: "Yes",
    churn: "Active",
    joinedDate: "2023-12-15"
  },

  // ================= DISNEY+ HOTSTAR =================
  {
    id: "DHOT-401",
    name: "Karthik Subramanian",
    email: "karthik.sub@example.com",
    phone: "+91 98455 99001",
    platform: "Disney+ Hotstar",
    company: "Hotstar VIP Sports",
    plan: "Premium 4K (4 Screens)",
    subscriptionPlan: "Premium 4K (4 Screens)",
    deviceType: "Smart TV (LG OLED 4K)",
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
    churn: "Active",
    joinedDate: "2022-10-05"
  },
  {
    id: "DHOT-402",
    name: "Meera Nambiar",
    email: "meera.nambiar@example.com",
    phone: "+91 98110 00112",
    platform: "Disney+ Hotstar",
    company: "Hotstar Super Family",
    plan: "Super (1080p FHD 2 Screens)",
    subscriptionPlan: "Super (1080p FHD 2 Screens)",
    deviceType: "Smart TV & Tablet",
    age: 28,
    gender: "Female",
    tenure: 16,
    monthlyCharges: 75,
    totalCharges: 1200,
    contract: "Annual",
    paymentMethod: "UPI AutoPay",
    supportTickets: 0,
    watchHoursPerWeek: 20.5,
    numProfiles: 2,
    streamingTV: "Yes",
    streamingMovies: "Yes",
    downloadOffline: "Yes",
    churn: "Active",
    joinedDate: "2023-05-18"
  },
  {
    id: "DHOT-403",
    name: "Amit Patel",
    email: "amit.patel@example.com",
    phone: "+91 97220 11224",
    platform: "Disney+ Hotstar",
    company: "Hotstar Cricket Pass",
    plan: "Super Monthly (FHD 2 Screens)",
    subscriptionPlan: "Super Monthly (FHD 2 Screens)",
    deviceType: "Smart TV (4K Live Sports)",
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
    churn: "Churned",
    joinedDate: "2024-07-15"
  },
  {
    id: "DHOT-404",
    name: "Ritu Saxena",
    email: "ritu.saxena@example.com",
    phone: "+91 99000 22335",
    platform: "Disney+ Hotstar",
    company: "Hotstar Specials",
    plan: "Super (1080p FHD 2 Screens)",
    subscriptionPlan: "Super (1080p FHD 2 Screens)",
    deviceType: "Fire TV Stick",
    age: 36,
    gender: "Female",
    tenure: 3,
    monthlyCharges: 75,
    totalCharges: 225,
    contract: "Monthly",
    paymentMethod: "UPI",
    supportTickets: 3,
    watchHoursPerWeek: 4.0,
    numProfiles: 2,
    streamingTV: "Yes",
    streamingMovies: "Yes",
    downloadOffline: "No",
    churn: "Active",
    joinedDate: "2024-06-20"
  }
];

export const seedData = initialSeedCustomers;

export function getCustomers() {
  try {
    const raw = localStorage.getItem("churnwise_customers");
    if (!raw) {
      saveCustomers(initialSeedCustomers);
      return initialSeedCustomers.map(attachIntelligence);
    }
    let parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveCustomers(initialSeedCustomers);
      return initialSeedCustomers.map(attachIntelligence);
    }

    // Ensure all 4 platforms (Netflix, Prime, Spotify, Hotstar) have subscriber data
    const hasPrime = parsed.some((c) => (c.platform || "").toLowerCase().includes("prime") || (c.platform || "").toLowerCase().includes("amazon"));
    const hasSpotify = parsed.some((c) => (c.platform || "").toLowerCase().includes("spotify"));
    const hasHotstar = parsed.some((c) => (c.platform || "").toLowerCase().includes("hotstar") || (c.platform || "").toLowerCase().includes("disney") || (c.platform || "").toLowerCase().includes("jio"));

    if (!hasPrime || !hasSpotify || !hasHotstar || parsed.length < 16) {
      const existingIds = new Set(parsed.map((c) => c.id));
      const missingSeeds = initialSeedCustomers.filter((c) => !existingIds.has(c.id));
      parsed = [...parsed, ...missingSeeds];
    }

    // Ensure seed churned customers are accurately marked Churned for 25% platform benchmarks
    const churnedIds = new Set(["NFLX-103", "AMZN-204", "SPOT-303", "DHOT-403", "JHOT-403"]);
    let mutated = false;
    parsed = parsed.map((c) => {
      if (churnedIds.has(c.id) && (c.churn || "").toUpperCase() !== "CHURNED") {
        mutated = true;
        return { ...c, churn: "Churned" };
      }
      return c;
    });

    if (mutated || !hasPrime || !hasSpotify || !hasHotstar) {
      saveCustomers(parsed);
    }

    return parsed.map(attachIntelligence);
  } catch {
    return initialSeedCustomers.map(attachIntelligence);
  }
}

export async function syncCustomersFromBackend() {
  try {
    const res = await api.get("/customers");
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      let data = res.data;
      // If backend has only Netflix or is missing platforms, backfill from local seed
      const hasPrime = data.some((c) => (c.platform || "").toLowerCase().includes("prime") || (c.platform || "").toLowerCase().includes("amazon"));
      const hasSpotify = data.some((c) => (c.platform || "").toLowerCase().includes("spotify"));
      const hasHotstar = data.some((c) => (c.platform || "").toLowerCase().includes("hotstar") || (c.platform || "").toLowerCase().includes("disney"));
      if (!hasPrime || !hasSpotify || !hasHotstar) {
        const existingIds = new Set(data.map((c) => c.id));
        const missing = initialSeedCustomers.filter((c) => !existingIds.has(c.id));
        data = [...data, ...missing];
      }
      saveCustomers(data);
      return data.map(attachIntelligence);
    }
  } catch (err) {
    // Fallback to local cache
  }
  return getCustomers();
}

// Auto kick-off initial sync
if (typeof window !== "undefined") {
  syncCustomersFromBackend();
}

function attachIntelligence(customer) {
  const riskAnalysis = customer.riskAnalysis || calculateChurnRisk(customer);
  return {
    ...customer,
    platform: customer.platform || "Netflix",
    riskScore: customer.riskScore !== undefined ? customer.riskScore : (customer.risk_score !== undefined ? customer.risk_score : riskAnalysis.probability),
    riskLevel: customer.riskLevel || customer.risk_level || riskAnalysis.riskLevel,
    riskColor: customer.riskColor || customer.risk_color || riskAnalysis.riskColor,
    riskAnalysis
  };
}

export function saveCustomers(customers) {
  localStorage.setItem("churnwise_customers", JSON.stringify(customers));
}

export function addCustomer(customerData) {
  const customers = getCustomers();
  const platform = customerData.platform || "Netflix";
  const normP = platform.toLowerCase();
  let prefix = "NFLX";
  if (normP.includes("prime") || normP.includes("amazon")) prefix = "AMZN";
  else if (normP.includes("spotify")) prefix = "SPOT";
  else if (normP.includes("hotstar") || normP.includes("disney")) prefix = "DHOT";

  const maxNum = customers
    .filter((c) => (c.id || "").startsWith(prefix))
    .reduce((max, c) => {
      const num = parseInt((c.id || "").replace(/\D/g, ""), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 100);

  const nextId = `${prefix}-${maxNum + 1}`;
  const newCustomer = {
    ...customerData,
    id: nextId,
    platform: platform,
    plan: customerData.plan || "Standard",
    deviceType: customerData.deviceType || "Smart TV",
    watchHoursPerWeek: Number(customerData.watchHoursPerWeek || 15),
    numProfiles: Number(customerData.numProfiles || 2),
    monthlyCharges: Number(customerData.monthlyCharges || 499),
    supportTickets: Number(customerData.supportTickets || 0),
    joinedDate: customerData.joinedDate || new Date().toISOString().split("T")[0]
  };

  const updatedList = [newCustomer, ...customers];
  saveCustomers(updatedList);

  // Sync to Backend API
  api.post("/customers", newCustomer).catch(() => {});

  return attachIntelligence(newCustomer);
}

export function updateCustomer(id, updatedFields) {
  const customers = getCustomers();
  const updatedList = customers.map((c) =>
    c.id === id ? { ...c, ...updatedFields } : c
  );
  saveCustomers(updatedList);

  // Sync to Backend API
  api.put(`/customers/${id}`, updatedFields).catch(() => {});

  const found = updatedList.find((c) => c.id === id);
  return found ? attachIntelligence(found) : null;
}

export function deleteCustomer(id) {
  const customers = getCustomers();
  const filtered = customers.filter((c) => c.id !== id);
  saveCustomers(filtered);

  // Sync to Backend API
  api.delete(`/customers/${id}`).catch(() => {});

  return filtered;
}

export function batchDeleteCustomers(ids) {
  const idSet = new Set(ids);
  const customers = getCustomers();
  const filtered = customers.filter((c) => !idSet.has(c.id));
  saveCustomers(filtered);

  // Sync to Backend API
  api.post("/customers/batch-delete", { ids }).catch(() => {});

  return filtered;
}

export function batchUpdateStatus(ids, newStatus) {
  const idSet = new Set(ids);
  const customers = getCustomers();
  const updated = customers.map((c) => (idSet.has(c.id) ? { ...c, churn: newStatus } : c));
  saveCustomers(updated);

  // Sync to Backend API
  api.post("/customers/batch-status", { ids, status: newStatus }).catch(() => {});

  return updated;
}

export function exportCustomersToCSV(customers) {
  const headers = [
    "Subscriber ID",
    "Platform",
    "Full Name",
    "Email",
    "Phone",
    "Plan Tier",
    "Device",
    "Weekly Watch/Listen Hrs",
    "Profiles",
    "Tenure (months)",
    "Monthly Fee (INR)",
    "Contract",
    "Payment Method",
    "Buffering/Ad Complaints",
    "Churn Status",
    "Churn Risk (%)",
    "Risk Classification"
  ];

  const rows = customers.map((c) => [
    `"${c.id}"`,
    `"${c.platform || "Netflix"}"`,
    `"${c.name}"`,
    `"${c.email}"`,
    `"${c.phone || "N/A"}"`,
    `"${c.plan || "Standard"}"`,
    `"${c.deviceType || "Smart TV"}"`,
    c.watchHoursPerWeek || 15,
    c.numProfiles || 2,
    c.tenure,
    c.monthlyCharges,
    `"${c.contract}"`,
    `"${c.paymentMethod}"`,
    c.supportTickets || 0,
    `"${c.churn}"`,
    c.riskScore || 0,
    `"${c.riskLevel || "N/A"}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `streaming_subscribers_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}