import React from "react";
import { AlertCircle, HelpCircle, ShieldAlert, CheckCircle2, XCircle, Tv, Film, Music, Play } from "lucide-react";
import { PlatformEmblem } from "./BrandLogos";

export function Field({ label, required = false, hint, children, error, className = "" }) {
  return (
    <div className={`field-container ${className}`}>
      {label && (
        <div className="field-label-row">
          <label className="field-label">
            {label}
            {required && <span className="field-required">*</span>}
          </label>
          {hint && (
            <span className="field-hint" title={hint}>
              <HelpCircle size={13} />
            </span>
          )}
        </div>
      )}
      <div className={`field-control ${error ? "has-error" : ""}`}>
        {children}
      </div>
      {error && (
        <div className="field-error-message animate-fade-in">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export function PlatformBadge({ platform = "Netflix" }) {
  const norm = (platform || "").toLowerCase();
  let style = {
    background: "rgba(229, 9, 20, 0.12)",
    color: "#E50914",
    border: "1px solid rgba(229, 9, 20, 0.35)"
  };

  let displayTitle = platform;

  if (norm.includes("prime") || norm.includes("amazon")) {
    displayTitle = "Prime Video";
    style = {
      background: "rgba(0, 168, 225, 0.12)",
      color: "#00A8E1",
      border: "1px solid rgba(0, 168, 225, 0.35)"
    };
  } else if (norm.includes("spotify")) {
    displayTitle = "Spotify";
    style = {
      background: "rgba(29, 185, 84, 0.12)",
      color: "#1DB954",
      border: "1px solid rgba(29, 185, 84, 0.35)"
    };
  } else if (norm.includes("disney") || norm.includes("hotstar")) {
    displayTitle = "Disney+ Hotstar";
    style = {
      background: "rgba(0, 99, 229, 0.15)",
      color: "#3B82F6",
      border: "1px solid rgba(0, 99, 229, 0.35)"
    };
  } else if (norm.includes("netflix")) {
    displayTitle = "Netflix";
    style = {
      background: "rgba(229, 9, 20, 0.12)",
      color: "#E50914",
      border: "1px solid rgba(229, 9, 20, 0.35)"
    };
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "0.03em",
        ...style
      }}
    >
      <PlatformEmblem platform={platform} size={13} />
      <span>{displayTitle}</span>
    </span>
  );
}

export function StatusBadge({ status }) {
  const isChurned = status === "Churned";
  return (
    <span className={`status-badge-modern ${isChurned ? "status-churned" : "status-active"}`}>
      <span className="status-indicator-dot" />
      {isChurned ? "Churned" : "Active"}
    </span>
  );
}

export function RiskBadge({ score = 0, level = "Low Risk" }) {
  let toneClass = "risk-low";
  if (score >= 75) toneClass = "risk-critical";
  else if (score >= 55) toneClass = "risk-high";
  else if (score >= 30) toneClass = "risk-moderate";

  return (
    <span className={`risk-badge-modern ${toneClass}`} title={`Estimated churn risk: ${score}%`}>
      <span className="risk-score-value">{score}%</span>
      <span className="risk-level-label">{level}</span>
    </span>
  );
}

export function EmptyState({
  title = "No results found",
  text = "Try adjusting your search queries or filter parameters.",
  actionText,
  onAction,
  icon
}) {
  return (
    <div className="empty-state-modern animate-fade-in">
      <div className="empty-state-icon-wrap">
        {icon || <ShieldAlert size={28} />}
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {actionText && onAction && (
        <button className="primary-btn btn-sm" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}

export function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "danger",
  onConfirm,
  onCancel,
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onCancel}>
      <div className="modal-dialog animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header-icon-wrap ${type}`}>
          {type === "danger" ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
        </div>
        <div className="modal-content-body">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
        <div className="modal-footer-actions">
          <button className="secondary-btn" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={type === "danger" ? "danger-btn" : "primary-btn"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}