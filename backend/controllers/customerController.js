import db from "../config/database.js";
import { attachIntelligence, calculateChurnRisk } from "../services/predictionEngine.js";
import { syncCustomerToMysql } from "../config/mysql.js";

export function getCustomers(req, res, next) {
  try {
    let list = db.getCustomers().map(attachIntelligence);
    const { search, churn, contract, plan, platform, riskLevel, sortBy, sortOrder = "asc" } = req.query;

    // Filter by search query (name, email, company, id, phone, plan, platform)
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.id && c.id.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q)) ||
          (c.plan && c.plan.toLowerCase().includes(q)) ||
          (c.platform && c.platform.toLowerCase().includes(q)) ||
          (c.deviceType && c.deviceType.toLowerCase().includes(q))
      );
    }

    // Filter by Platform (Netflix, Amazon Prime Video, Spotify, JioHotstar)
    if (platform && platform !== "all") {
      list = list.filter((c) => (c.platform || "Netflix").toLowerCase() === platform.toLowerCase());
    }

    // Filter by churn status
    if (churn && churn !== "all") {
      list = list.filter((c) => (c.churn || "Active").toLowerCase() === churn.toLowerCase());
    }

    // Filter by contract
    if (contract && contract !== "all") {
      list = list.filter((c) => (c.contract || "").toLowerCase() === contract.toLowerCase());
    }

    // Filter by plan
    if (plan && plan !== "all") {
      list = list.filter((c) => (c.plan || "").toLowerCase().includes(plan.toLowerCase()));
    }

    // Filter by risk level
    if (riskLevel && riskLevel !== "all") {
      list = list.filter((c) => (c.riskLevel || "").toLowerCase() === riskLevel.toLowerCase());
    }

    // Sort
    if (sortBy) {
      list.sort((a, b) => {
        let fieldA = a[sortBy];
        let fieldB = b[sortBy];

        if (typeof fieldA === "string") {
          const comp = (fieldA || "").localeCompare(fieldB || "");
          return sortOrder === "desc" ? -comp : comp;
        } else {
          return sortOrder === "desc" ? (fieldB || 0) - (fieldA || 0) : (fieldA || 0) - (fieldB || 0);
        }
      });
    }

    return res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    next(err);
  }
}

export function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;
    const customer = db.findCustomerById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Subscriber with ID '${id}' was not found.`
      });
    }

    return res.json({
      success: true,
      data: attachIntelligence(customer)
    });
  } catch (err) {
    next(err);
  }
}

export function createCustomer(req, res, next) {
  try {
    const customerData = req.body;
    const customers = db.getCustomers();

    const platform = customerData.platform || "Netflix";
    const normP = platform.toLowerCase();
    let prefix = "NFLX";
    if (normP.includes("prime") || normP.includes("amazon")) prefix = "AMZN";
    else if (normP.includes("spotify")) prefix = "SPOT";
    else if (normP.includes("hotstar") || normP.includes("disney") || normP.includes("jio")) prefix = "DHOT";

    const maxNum = customers
      .filter((c) => (c.id || "").startsWith(prefix))
      .reduce((max, c) => {
        const num = parseInt((c.id || "").replace(/\D/g, ""), 10);
        return !isNaN(num) && num > max ? num : max;
      }, 100);

    const nextId = `${prefix}-${maxNum + 1}`;

    const newCustomer = {
      id: customerData.id || nextId,
      name: customerData.name?.trim() || "Unnamed Subscriber",
      email: customerData.email?.trim() || "",
      phone: customerData.phone?.trim() || "",
      platform: platform,
      company: customerData.company?.trim() || `${platform} Subscriber`,
      plan: customerData.plan || customerData.subscriptionPlan || "Standard",
      subscriptionPlan: customerData.subscriptionPlan || customerData.plan || "Standard",
      deviceType: customerData.deviceType || "Smart TV",
      age: Number(customerData.age || 26),
      gender: customerData.gender || "Male",
      tenure: Number(customerData.tenure || 1),
      monthlyCharges: Number(customerData.monthlyCharges || 499),
      totalCharges: Number(
        customerData.totalCharges ||
          Number(customerData.monthlyCharges || 499) * Math.max(1, Number(customerData.tenure || 1))
      ),
      contract: customerData.contract || "Annual",
      paymentMethod: customerData.paymentMethod || "UPI AutoPay",
      supportTickets: Number(customerData.supportTickets || 0),
      watchHoursPerWeek: Number(customerData.watchHoursPerWeek || 15.0),
      numProfiles: Number(customerData.numProfiles || 2),
      streamingTV: customerData.streamingTV || "Yes",
      streamingMovies: customerData.streamingMovies || "Yes",
      downloadOffline: customerData.downloadOffline || "Yes",
      churn: customerData.churn || "Active",
      joinedDate: customerData.joinedDate || new Date().toISOString().split("T")[0]
    };

    db.createCustomer(newCustomer);
    syncCustomerToMysql(newCustomer).catch(() => {});
    const enriched = attachIntelligence(newCustomer);

    return res.status(201).json({
      success: true,
      message: `${platform} Subscriber ${enriched.name} (${enriched.id}) enrolled successfully.`,
      data: enriched
    });
  } catch (err) {
    next(err);
  }
}

export function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.age !== undefined) updates.age = Number(updates.age);
    if (updates.tenure !== undefined) updates.tenure = Number(updates.tenure);
    if (updates.monthlyCharges !== undefined) updates.monthlyCharges = Number(updates.monthlyCharges);
    if (updates.totalCharges !== undefined) updates.totalCharges = Number(updates.totalCharges);
    if (updates.supportTickets !== undefined) updates.supportTickets = Number(updates.supportTickets);
    if (updates.watchHoursPerWeek !== undefined) updates.watchHoursPerWeek = Number(updates.watchHoursPerWeek);
    if (updates.numProfiles !== undefined) updates.numProfiles = Number(updates.numProfiles);

    const updated = db.updateCustomer(id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Subscriber with ID '${id}' not found.`
      });
    }

    syncCustomerToMysql(updated).catch(() => {});
    const enriched = attachIntelligence(updated);
    return res.json({
      success: true,
      message: `Subscriber ${enriched.name} updated successfully.`,
      data: enriched
    });
  } catch (err) {
    next(err);
  }
}

export function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = db.deleteCustomer(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Subscriber with ID '${id}' not found.`
      });
    }

    return res.json({
      success: true,
      message: `Subscriber record '${id}' removed from system.`
    });
  } catch (err) {
    next(err);
  }
}

export function batchDeleteCustomers(req, res, next) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array of subscriber IDs is required for batch delete."
      });
    }

    const count = db.batchDeleteCustomers(ids);
    return res.json({
      success: true,
      message: `Successfully deleted ${count} subscriber record(s).`,
      deletedCount: count
    });
  } catch (err) {
    next(err);
  }
}

export function batchUpdateStatus(req, res, next) {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({
        success: false,
        message: "Array of subscriber IDs and target status are required."
      });
    }

    const count = db.batchUpdateStatus(ids, status);
    return res.json({
      success: true,
      message: `Updated status for ${count} subscriber(s) to '${status}'.`,
      updatedCount: count
    });
  } catch (err) {
    next(err);
  }
}

export function exportCSV(req, res, next) {
  try {
    const customers = db.getCustomers().map(attachIntelligence);

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
      "Risk Level"
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

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=streaming_subscribers_${new Date().toISOString().split("T")[0]}.csv`
    );

    return res.send(csvContent);
  } catch (err) {
    next(err);
  }
}

export function resetSeed(req, res, next) {
  try {
    db.resetToSeed();
    return res.json({
      success: true,
      message: "Multi-platform subscriber database and accounts restored to initial seed state."
    });
  } catch (err) {
    next(err);
  }
}
