import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initialAccounts, initialCustomers } from "../services/seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");
const DB_FILE = path.join(DATA_DIR, "database.json");

class Database {
  constructor() {
    this.data = {
      accounts: [],
      customers: [],
      resetCodes: {}
    };
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        this.data = {
          accounts: Array.isArray(parsed.accounts) && parsed.accounts.length > 0 ? parsed.accounts : [...initialAccounts],
          customers: Array.isArray(parsed.customers) && parsed.customers.length > 0 ? parsed.customers : [...initialCustomers],
          resetCodes: parsed.resetCodes || {}
        };
      } catch (err) {
        console.warn("Database parse warning, initializing with seed data:", err.message);
        this.resetToSeed();
      }
    } else {
      this.resetToSeed();
    }
  }

  persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist database to disk:", err);
    }
  }

  resetToSeed() {
    this.data = {
      accounts: JSON.parse(JSON.stringify(initialAccounts)),
      customers: JSON.parse(JSON.stringify(initialCustomers)),
      resetCodes: {}
    };
    this.persist();
    return this.data;
  }

  // Account operations
  getAccounts() {
    return this.data.accounts;
  }

  findAccountByEmail(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    return this.data.accounts.find((a) => a.email.toLowerCase() === normalized) || null;
  }

  findAccountById(id) {
    return this.data.accounts.find((a) => a.id === id) || null;
  }

  createAccount(account) {
    this.data.accounts.push(account);
    this.persist();
    return account;
  }

  updateAccount(idOrEmail, updates) {
    const idx = this.data.accounts.findIndex(
      (a) => a.id === idOrEmail || a.email.toLowerCase() === (idOrEmail || "").toLowerCase()
    );
    if (idx !== -1) {
      this.data.accounts[idx] = { ...this.data.accounts[idx], ...updates };
      this.persist();
      return this.data.accounts[idx];
    }
    return null;
  }

  setResetCode(email, code) {
    this.data.resetCodes[email.toLowerCase()] = code;
    this.persist();
  }

  getResetCode(email) {
    return this.data.resetCodes[email.toLowerCase()];
  }

  clearResetCode(email) {
    delete this.data.resetCodes[email.toLowerCase()];
    this.persist();
  }

  // Customer operations
  getCustomers() {
    return this.data.customers;
  }

  findCustomerById(id) {
    return this.data.customers.find((c) => c.id === id) || null;
  }

  createCustomer(customer) {
    this.data.customers.unshift(customer);
    this.persist();
    return customer;
  }

  updateCustomer(id, updates) {
    const idx = this.data.customers.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.customers[idx] = { ...this.data.customers[idx], ...updates };
      this.persist();
      return this.data.customers[idx];
    }
    return null;
  }

  deleteCustomer(id) {
    const initialLen = this.data.customers.length;
    this.data.customers = this.data.customers.filter((c) => c.id !== id);
    const deleted = this.data.customers.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  batchDeleteCustomers(ids) {
    const set = new Set(ids);
    const before = this.data.customers.length;
    this.data.customers = this.data.customers.filter((c) => !set.has(c.id));
    const count = before - this.data.customers.length;
    this.persist();
    return count;
  }

  batchUpdateStatus(ids, status) {
    const set = new Set(ids);
    let count = 0;
    this.data.customers = this.data.customers.map((c) => {
      if (set.has(c.id)) {
        count++;
        return { ...c, churn: status };
      }
      return c;
    });
    this.persist();
    return count;
  }
}

export const db = new Database();
export default db;
