import jwt from "jsonwebtoken";
import db from "../config/database.js";

const JWT_SECRET = process.env.JWT_SECRET || "churnwise_super_secret_jwt_key_2026_enterprise_grade";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token required. Please log in."
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const account = db.findAccountById(decoded.id) || db.findAccountByEmail(decoded.email);

    if (!account) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists."
      });
    }

    req.user = account;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session token. Please log in again."
    });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthenticated request." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required role: ${allowedRoles.join(" or ")}, but your role is ${req.user.role}.`
      });
    }

    next();
  };
}

export function generateToken(account) {
  return jwt.sign(
    {
      id: account.id,
      email: account.email,
      role: account.role,
      name: account.name
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}
