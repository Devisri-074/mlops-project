import React from "react";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "40px 20px" }}>
      <div className="panel animate-scale-up" style={{ padding: "48px 36px", maxWidth: "480px", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "var(--brand-primary-light)", color: "var(--brand-primary)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <ShieldAlert size={32} />
        </div>
        <span style={{ fontSize: "56px", fontWeight: "900", fontFamily: "Outfit, sans-serif", color: "var(--brand-primary)", display: "block", lineHeight: "1" }}>
          404
        </span>
        <h2 style={{ fontSize: "22px", margin: "12px 0 8px" }}>Page Not Found</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", lineHeight: "1.6", marginBottom: "24px" }}>
          The requested route does not exist or has been relocated within the ChurnWise workspace.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="secondary-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Go Back
          </button>
          <button className="primary-btn" onClick={() => navigate("/dashboard")}>
            <Home size={16} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}