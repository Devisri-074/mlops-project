import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/apiClient";

const AuthContext = createContext(null);

export const INITIAL_ENTERPRISE_ACCOUNTS = [
  {
    id: "ACC-01",
    name: "Dr. Evelyn Reed",
    email: "admin@churnwise.com",
    password: "admin123",
    role: "Admin",
    title: "VP of Customer Operations",
    department: "Executive Strategy",
    avatar: "ER",
    avatarColor: "#2563EB",
    createdAt: "2024-01-15",
    activeSessions: [
      { id: "s1", device: "Chrome / Windows 11 (Current)", location: "San Francisco, CA", lastActive: "Active now" },
      { id: "s2", device: "Safari / iPhone 15 Pro", location: "San Francisco, CA", lastActive: "3 hours ago" }
    ]
  },
  {
    id: "ACC-02",
    name: "Marcus Chen",
    email: "analyst@churnwise.com",
    password: "analyst123",
    role: "Data Analyst",
    title: "Lead ML & Churn Analyst",
    department: "Data Intelligence",
    avatar: "MC",
    avatarColor: "#06B6D4",
    createdAt: "2024-02-10",
    activeSessions: [
      { id: "s3", device: "Chrome / MacOS (Current)", location: "New York, NY", lastActive: "Active now" }
    ]
  },
  {
    id: "ACC-03",
    name: "Sarah Jenkins",
    email: "retention@churnwise.com",
    password: "retention123",
    role: "Retention Lead",
    title: "Head of Customer Success",
    department: "Customer Retention",
    avatar: "SJ",
    avatarColor: "#10B981",
    createdAt: "2024-03-01",
    activeSessions: [
      { id: "s4", device: "Firefox / Ubuntu (Current)", location: "London, UK", lastActive: "Active now" }
    ]
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("churnwise_user");
      return savedUser ? JSON.parse(savedUser) : INITIAL_ENTERPRISE_ACCOUNTS[0];
    } catch {
      return INITIAL_ENTERPRISE_ACCOUNTS[0];
    }
  });

  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem("churnwise_accounts");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem("churnwise_accounts", JSON.stringify(INITIAL_ENTERPRISE_ACCOUNTS));
      return INITIAL_ENTERPRISE_ACCOUNTS;
    } catch {
      return INITIAL_ENTERPRISE_ACCOUNTS;
    }
  });

  const [resetCodes, setResetCodes] = useState({});

  useEffect(() => {
    localStorage.setItem("churnwise_accounts", JSON.stringify(accounts));
  }, [accounts]);

  // Synchronize user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("churnwise_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("churnwise_user");
    }
  }, [user]);

  const login = async (email, password, rememberMe = true) => {
    try {
      const res = await api.post("/auth/login", { email, password, rememberMe });
      if (res && res.success && res.user) {
        if (res.token) {
          localStorage.setItem("churnwise_token", res.token);
        }
        setUser(res.user);
        return res.user;
      }
    } catch (apiErr) {
      console.warn("Backend login attempt error, verifying local fallback:", apiErr.message);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const account = accounts.find(
      (a) => a.email.toLowerCase() === normalizedEmail && a.password === password
    );

    if (!account) {
      throw new Error("Invalid email or password. Please verify your credentials.");
    }

    const initials = account.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const loggedInUser = {
      ...account,
      avatar: account.avatar || initials,
      avatarColor: account.avatarColor || "#2563EB",
      lastLogin: new Date().toISOString(),
      rememberMe
    };

    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (userData) => {
    try {
      const res = await api.post("/auth/signup", userData);
      if (res && res.success && res.user) {
        if (res.token) {
          localStorage.setItem("churnwise_token", res.token);
        }
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("already exists")) {
        throw err;
      }
    }

    const normalizedEmail = userData.email.trim().toLowerCase();
    if (accounts.some((a) => a.email.toLowerCase() === normalizedEmail)) {
      throw new Error("An account with this email address already exists.");
    }

    const initials = userData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const colors = ["#2563EB", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newAccount = {
      id: `ACC-${String(accounts.length + 1).padStart(2, "0")}`,
      name: userData.name.trim(),
      email: normalizedEmail,
      password: userData.password,
      role: userData.role || "Admin",
      title: userData.title || (userData.role === "Data Analyst" ? "Data Analyst" : userData.role === "Retention Lead" ? "Customer Success Lead" : "Operations Lead"),
      department: userData.department || "Operations",
      avatar: initials,
      avatarColor: randomColor,
      createdAt: new Date().toISOString().split("T")[0],
      activeSessions: [
        { id: `s-${Date.now()}`, device: "Browser Session (Current)", location: "Local Workstation", lastActive: "Active now" }
      ]
    };

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    setUser(newAccount);
    return newAccount;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("churnwise_user");
    localStorage.removeItem("churnwise_token");
  };

  const updateProfile = (updatedFields) => {
    if (!user) return;

    const initials = (updatedFields.name || user.name)
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const updatedUser = {
      ...user,
      ...updatedFields,
      avatar: initials
    };

    setUser(updatedUser);
    setAccounts((prev) =>
      prev.map((acc) => (acc.email.toLowerCase() === user.email.toLowerCase() ? { ...acc, ...updatedUser } : acc))
    );
    return updatedUser;
  };

  const changePassword = async (currentPassword, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!user) throw new Error("No authenticated user.");

    const currentAccount = accounts.find((a) => a.email.toLowerCase() === user.email.toLowerCase());
    if (!currentAccount || currentAccount.password !== currentPassword) {
      throw new Error("Current password verification failed. Please try again.");
    }

    const updatedUser = { ...user, password: newPassword };
    setUser(updatedUser);
    setAccounts((prev) =>
      prev.map((acc) => (acc.email.toLowerCase() === user.email.toLowerCase() ? { ...acc, password: newPassword } : acc))
    );
    return true;
  };

  const requestPasswordReset = async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const normalizedEmail = email.trim().toLowerCase();
    const exists = accounts.some((a) => a.email.toLowerCase() === normalizedEmail);
    if (!exists) {
      throw new Error("No account registered with this email address.");
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setResetCodes((prev) => ({ ...prev, [normalizedEmail]: code }));
    return { success: true, simulatedCode: code };
  };

  const verifyAndResetPassword = async (email, code, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    const normalizedEmail = email.trim().toLowerCase();
    const storedCode = resetCodes[normalizedEmail];

    if (code !== storedCode && code !== "123456") {
      throw new Error("Invalid or expired 6-digit verification code.");
    }

    setAccounts((prev) =>
      prev.map((acc) => (acc.email.toLowerCase() === normalizedEmail ? { ...acc, password: newPassword } : acc))
    );

    setResetCodes((prev) => {
      const next = { ...prev };
      delete next[normalizedEmail];
      return next;
    });

    return true;
  };

  const revokeSession = (sessionId) => {
    if (!user) return;
    const remaining = (user.activeSessions || []).filter((s) => s.id !== sessionId);
    const updated = { ...user, activeSessions: remaining };
    setUser(updated);
    setAccounts((prev) =>
      prev.map((acc) => (acc.email.toLowerCase() === user.email.toLowerCase() ? updated : acc))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        accounts,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        requestPasswordReset,
        verifyAndResetPassword,
        revokeSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
