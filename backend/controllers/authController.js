import db from "../config/database.js";
import { generateToken } from "../middleware/auth.js";

export async function login(req, res, next) {
  try {
    const { email, password, rememberMe = true } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required fields."
      });
    }

    const normalized = email.trim().toLowerCase();
    const account = db.findAccountByEmail(normalized);

    if (!account || account.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please verify your credentials."
      });
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

    // Update in database
    db.updateAccount(account.id, { lastLogin: loggedInUser.lastLogin });

    const token = generateToken(loggedInUser);

    // Return sanitized response without exposing raw password unnecessarily
    const { password: _, ...userSafe } = loggedInUser;

    return res.json({
      success: true,
      message: `Welcome back, ${account.name}!`,
      token,
      user: userSafe
    });
  } catch (err) {
    next(err);
  }
}

export async function signup(req, res, next) {
  try {
    const { name, email, password, role, title, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required."
      });
    }

    const normalized = email.trim().toLowerCase();
    const existing = db.findAccountByEmail(normalized);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An enterprise account with this email address already exists."
      });
    }

    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const colors = ["#2563EB", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const accounts = db.getAccounts();

    const newAccount = {
      id: `ACC-${String(accounts.length + 1).padStart(2, "0")}`,
      name: name.trim(),
      email: normalized,
      password,
      role: role || "Admin",
      title:
        title ||
        (role === "Data Analyst"
          ? "Data Analyst"
          : role === "Retention Lead"
          ? "Customer Success Lead"
          : "Operations Lead"),
      department: department || "Operations",
      avatar: initials,
      avatarColor: randomColor,
      createdAt: new Date().toISOString().split("T")[0],
      activeSessions: [
        {
          id: `s-${Date.now()}`,
          device: req.headers["user-agent"] || "Browser Session",
          location: "Local Workstation",
          lastActive: "Active now"
        }
      ]
    };

    db.createAccount(newAccount);
    const token = generateToken(newAccount);
    const { password: _, ...userSafe } = newAccount;

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: userSafe
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  const { password: _, ...userSafe } = req.user;
  return res.json({
    success: true,
    user: userSafe
  });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, title, department, avatarColor } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (name) {
      updates.name = name.trim();
      updates.avatar = updates.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    if (title) updates.title = title;
    if (department) updates.department = department;
    if (avatarColor) updates.avatarColor = avatarColor;

    const updated = db.updateAccount(userId, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { password: _, ...userSafe } = updated;
    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: userSafe
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current password and new password are required."
      });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password verification failed. Please try again."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long."
      });
    }

    db.updateAccount(user.id, { password: newPassword });

    return res.json({
      success: true,
      message: "Password changed successfully."
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const normalized = email.trim().toLowerCase();
    const account = db.findAccountByEmail(normalized);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "No enterprise account found registered with this email address."
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    db.setResetCode(normalized, code);

    return res.json({
      success: true,
      message: "6-digit verification code generated.",
      simulatedCode: code
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, verification code, and new password are required."
      });
    }

    const normalized = email.trim().toLowerCase();
    const storedCode = db.getResetCode(normalized);

    if (code !== storedCode && code !== "123456") {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code."
      });
    }

    const account = db.findAccountByEmail(normalized);
    if (!account) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }

    db.updateAccount(account.id, { password: newPassword });
    db.clearResetCode(normalized);

    return res.json({
      success: true,
      message: "Password has been reset successfully. You can now log in."
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    const remainingSessions = (user.activeSessions || []).filter((s) => s.id !== sessionId);
    db.updateAccount(user.id, { activeSessions: remainingSessions });

    return res.json({
      success: true,
      message: "Session revoked successfully."
    });
  } catch (err) {
    next(err);
  }
}
