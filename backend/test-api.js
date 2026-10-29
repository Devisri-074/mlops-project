// Set test environment before importing express app
process.env.NODE_ENV = "test";

import http from "http";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

async function runTests() {
  const { default: app } = await import("./server.js");

  console.log(`\n${CYAN}${BOLD}======================================================${RESET}`);
  console.log(`${CYAN}${BOLD}🧪 ChurnWise Backend API Test Suite${RESET}`);
  console.log(`${CYAN}${BOLD}======================================================${RESET}\n`);

  // Start temporary test server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let failed = 0;
  let token = "";
  let createdCustomerId = "";

  async function test(name, fn) {
    try {
      await fn();
      console.log(` ${GREEN}✔ PASS${RESET}  ${name}`);
      passed++;
    } catch (err) {
      console.error(` ❌ ${RED}FAIL${RESET}  ${name}`);
      console.error(`    ${RED}Error: ${err.message}${RESET}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    await test("GET /api/health - returns online status", async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      const data = await res.json();
      if (res.status !== 200 || data.status !== "online") {
        throw new Error(`Expected status 200 & 'online', got ${res.status} & ${data.status}`);
      }
    });

    // 2. Auth Login (Demo Credentials)
    await test("POST /api/auth/login - authenticates demo user & returns token", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@churnwise.com", password: "demo123" })
      });
      const data = await res.json();
      if (res.status !== 200 || !data.token) {
        throw new Error(`Login failed with status ${res.status}: ${data.message || JSON.stringify(data)}`);
      }
      token = data.token;
    });

    // 3. Auth Profile
    await test("GET /api/auth/me - gets authenticated user profile", async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.status !== 200 || data.user.email !== "demo@churnwise.com") {
        throw new Error(`Failed to get profile: ${res.status}`);
      }
    });

    // 4. Customers List
    await test("GET /api/customers - retrieves customer records", async () => {
      const res = await fetch(`${baseUrl}/api/customers`);
      const data = await res.json();
      if (res.status !== 200 || !Array.isArray(data.data)) {
        throw new Error(`Expected array in data.data, got status ${res.status}`);
      }
      if (data.data.length === 0) {
        throw new Error("Expected at least 1 customer in seed dataset");
      }
    });

    // 5. Create Customer
    await test("POST /api/customers - creates a new customer", async () => {
      const newCust = {
        name: "Acme Test Corp",
        email: "contact@acmetest.io",
        phone: "+1 555-0199",
        company: "Acme Corp",
        age: 35,
        gender: "Female",
        tenure: 12,
        monthlyCharges: 499,
        contract: "Annual",
        internetService: "Fiber Optic",
        paymentMethod: "Credit Card",
        supportTickets: 1,
        churn: "Active"
      };
      const res = await fetch(`${baseUrl}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCust)
      });
      const data = await res.json();
      if (res.status !== 201 || !data.data || !data.data.id) {
        throw new Error(`Failed to create customer: status ${res.status}, msg: ${data.message}`);
      }
      createdCustomerId = data.data.id;
    });

    // 6. AI Churn Prediction
    await test("POST /api/predict/churn - returns ML risk score & breakdown", async () => {
      const res = await fetch(`${baseUrl}/api/predict/churn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract: "Monthly",
          monthlyCharges: 120,
          tenure: 2,
          supportTickets: 6,
          paymentMethod: "Electronic Check"
        })
      });
      const data = await res.json();
      if (res.status !== 200 || !data.data || !data.data.prediction || typeof data.data.prediction.probability !== "number") {
        throw new Error(`Invalid prediction response: ${JSON.stringify(data)}`);
      }
    });

    // 7. What-if Simulator
    await test("POST /api/predict/simulate - simulates parameter changes", async () => {
      const res = await fetch(`${baseUrl}/api/predict/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerData: {
            contract: "Monthly",
            monthlyCharges: 100,
            tenure: 6,
            supportTickets: 4
          },
          overrides: {
            contract: "Annual",
            supportTickets: 1
          }
        })
      });
      const data = await res.json();
      if (res.status !== 200 || !data.data || !data.data.currentRisk || !data.data.newRisk) {
        throw new Error(`Invalid simulator response: ${JSON.stringify(data)}`);
      }
    });

    // 8. Analytics Stats
    await test("GET /api/analytics/stats - returns dashboard overview metrics", async () => {
      const res = await fetch(`${baseUrl}/api/analytics/stats`);
      const data = await res.json();
      if (res.status !== 200 || !data.data || typeof data.data.totalCustomers !== "number") {
        throw new Error(`Failed to fetch stats: ${res.status}`);
      }
    });

    // 9. Analytics Trends
    await test("GET /api/analytics/trends - returns cohort trends & breakdowns", async () => {
      const res = await fetch(`${baseUrl}/api/analytics/trends`);
      const data = await res.json();
      if (res.status !== 200 || !data.data) {
        throw new Error(`Failed to fetch trends: ${res.status}`);
      }
    });

    // 10. Customer Cleanup
    if (createdCustomerId) {
      await test(`DELETE /api/customers/${createdCustomerId} - removes test customer`, async () => {
        const res = await fetch(`${baseUrl}/api/customers/${createdCustomerId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status !== 200) {
          throw new Error(`Failed to delete customer: status ${res.status}`);
        }
      });
    }

    console.log(`\n${CYAN}------------------------------------------------------${RESET}`);
    console.log(`Results: ${GREEN}${passed} passed${RESET}, ${failed > 0 ? RED : ""}${failed} failed${RESET}`);
    console.log(`${CYAN}======================================================${RESET}\n`);

    if (server.closeAllConnections) {
      server.closeAllConnections();
    }
    server.close();
  } catch (err) {
    console.error("Test runner unexpected error:", err);
    process.exit(1);
  }
}

runTests();
