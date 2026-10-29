import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role || "Admin";

  const isAdmin = role === "Admin";
  const isAnalyst = role === "Data Analyst";
  const isRetentionLead = role === "Retention Lead";

  return {
    role,
    isAdmin,
    isAnalyst,
    isRetentionLead,
    canAccessDashboard: true,
    canAccessCustomers: true,
    canAccessAnalytics: true,
    canAddCustomer: isAdmin || isRetentionLead,
    canEditCustomer: isAdmin || isRetentionLead,
    canDeleteCustomer: isAdmin,
    canAccessSettings: isAdmin,
    canExportData: true,
    canApplyStrategy: isAdmin || isRetentionLead,
    canResetDatabase: isAdmin
  };
}

export function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || "Admin";

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="page animate-fade-in" style={{ padding: "40px 20px" }}>
        <div
          className="panel"
          style={{
            maxWidth: "540px",
            margin: "40px auto",
            padding: "48px 32px",
            textAlign: "center"
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "var(--color-danger-bg)",
              color: "var(--color-danger)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px"
            }}
          >
            <Lock size={28} />
          </div>
          <span className="eyebrow red" style={{ color: "var(--color-danger)", fontWeight: "800" }}>
            ACCESS RESTRICTED
          </span>
          <h2 style={{ fontSize: "22px", margin: "8px 0" }}>Administrator Permission Required</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", lineHeight: "1.6", marginBottom: "24px" }}>
            Your current role is <strong>{userRole}</strong>. This feature requires{" "}
            <strong>{allowedRoles.join(" or ")}</strong> privileges. Please contact your workspace administrator for elevated access.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button className="primary-btn" onClick={() => navigate("/dashboard")}>
              <ArrowLeft size={16} /> Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
