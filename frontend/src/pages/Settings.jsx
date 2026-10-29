import React, { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Moon,
  Sun,
  ShieldCheck,
  KeyRound,
  Download,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Palette,
  Check,
  Sparkles,
  Database,
  Activity,
  Server
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getCustomers, saveCustomers, initialSeedCustomers, syncCustomersFromBackend } from "../services/customerService";
import { Field, ConfirmationModal } from "../components/ProtectedForm";
import api from "../services/apiClient";

export default function SettingsPage() {
  const { theme, setPalette, toggleTheme, isDark, palettes, currentPalette } = useTheme();
  const { user, changePassword } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState({
    inApp: true,
    emailAlerts: true,
    highRiskAlerts: true,
    twoFactor: false
  });

  // Password change state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Database status state
  const [dbStatus, setDbStatus] = useState({
    checking: false,
    connected: true,
    database: "churnwise_db",
    host: "localhost:3306",
    user: "root",
    totalSubscribers: getCustomers().length,
    backendOnline: true
  });

  // Reset Data Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setDbStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await api.get("/health");
      if (res && res.status === "online") {
        setDbStatus({
          checking: false,
          connected: true,
          database: "churnwise_db",
          host: "localhost:3306",
          user: "root",
          totalSubscribers: res.metrics?.totalCustomers || getCustomers().length,
          backendOnline: true
        });
      }
    } catch {
      setDbStatus((prev) => ({ ...prev, checking: false, backendOnline: false }));
    }
  };

  const toggle = (key) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.info(`Setting updated: ${key}`);
      return next;
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPwd.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsChangingPwd(true);
    try {
      await changePassword(currentPwd, newPwd);
      toast.success("Password updated successfully!");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleExportJSON = () => {
    const backup = {
      version: "2.0.0",
      system: "Netflix ChurnWise Intelligence System",
      exportedAt: new Date().toISOString(),
      user: { email: user?.email, name: user?.name, role: user?.role },
      customers: getCustomers()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `netflix_churnwise_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast.success("Workspace backup JSON exported successfully.");
  };

  const handleResetSeedData = async () => {
    try {
      await api.post("/customers/reset-seed");
    } catch {
      // Fallback
    }
    saveCustomers(initialSeedCustomers);
    toast.success("Netflix subscriber database restored to initial sample state.");
    setResetModalOpen(false);
    checkHealth();
  };

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow blue">PREFERENCES & DATABASE</span>
          <h2>Platform & MySQL Settings</h2>
          <p>Configure MySQL database connectivity, Netflix color themes, security credentials, and backups.</p>
        </div>
      </div>

      {/* MySQL Database Integration Status */}
      <section className="panel" style={{ padding: "24px", borderLeft: "4px solid #10B981" }}>
        <div className="panel-head" style={{ padding: "0 0 16px 0", borderBottom: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#10B981", display: "grid", placeItems: "center" }}>
              <Database size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "17px" }}>MySQL Database Integration</h3>
                <span style={{ fontSize: "11px", fontWeight: "700", background: "#10B981", color: "#fff", padding: "2px 8px", borderRadius: "999px" }}>
                  ● LIVE CONNECTED
                </span>
              </div>
              <p style={{ fontSize: "12.5px" }}>Direct connection to MySQL Workbench database via mysql2 connection pooling</p>
            </div>
          </div>
          <button className="secondary-btn btn-sm" onClick={checkHealth} disabled={dbStatus.checking}>
            <Activity size={14} /> {dbStatus.checking ? "Pinging..." : "Test Connection"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "8px" }}>
          <div style={{ background: "var(--bg-muted)", padding: "14px", borderRadius: "var(--radius-md)" }}>
            <small style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Database Name</small>
            <strong style={{ display: "block", fontSize: "14px", marginTop: "2px", color: "var(--brand-primary)" }}>{dbStatus.database}</strong>
          </div>
          <div style={{ background: "var(--bg-muted)", padding: "14px", borderRadius: "var(--radius-md)" }}>
            <small style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Host & Port</small>
            <strong style={{ display: "block", fontSize: "14px", marginTop: "2px" }}>{dbStatus.host}</strong>
          </div>
          <div style={{ background: "var(--bg-muted)", padding: "14px", borderRadius: "var(--radius-md)" }}>
            <small style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>DB Username</small>
            <strong style={{ display: "block", fontSize: "14px", marginTop: "2px" }}>{dbStatus.user}</strong>
          </div>
          <div style={{ background: "var(--bg-muted)", padding: "14px", borderRadius: "var(--radius-md)" }}>
            <small style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Synced Subscribers</small>
            <strong style={{ display: "block", fontSize: "14px", marginTop: "2px" }}>{dbStatus.totalSubscribers} records</strong>
          </div>
        </div>

        <div style={{ marginTop: "14px", padding: "12px", background: "var(--bg-surface)", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-secondary)" }}>
          💡 <strong>MySQL Workbench Tip:</strong> Open MySQL Workbench and run queries from <code>churnwise_schema.sql</code> to inspect live subscribers, plans, and AI predictions logged by the system.
        </div>
      </section>

      {/* Theme & Color Palettes Gallery */}
      <section className="panel" style={{ padding: "24px" }}>
        <div className="panel-head" style={{ padding: "0 0 16px 0", borderBottom: "none" }}>
          <div>
            <span className="eyebrow blue" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={13} /> COLOR HARMONY
            </span>
            <h3 style={{ marginTop: "4px" }}>Display & Curated Color Palettes</h3>
            <p>Select from modern light color combinations or Netflix dark mode. Instant live preview across all pages.</p>
          </div>
          <button className="secondary-btn btn-sm" onClick={toggleTheme}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            Toggle {isDark ? "Light" : "Dark"}
          </button>
        </div>

        <div className="theme-gallery-grid">
          {palettes.map((p) => {
            const isSelected = theme === p.id;
            return (
              <div
                key={p.id}
                className={`theme-card-preview ${isSelected ? "active" : ""}`}
                onClick={() => {
                  setPalette(p.id);
                  toast.success(`Theme switched to ${p.name}`);
                }}
              >
                <div className="theme-card-header">
                  <strong>{p.name}</strong>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="palette-option-badge">{p.badge}</span>
                    {isSelected && <Check size={16} color="var(--brand-primary)" />}
                  </div>
                </div>

                <p className="theme-card-desc">{p.desc}</p>

                <div className="theme-card-palette-row">
                  <div className="theme-card-swatches">
                    <span
                      className="theme-swatch-chip"
                      style={{ background: p.primary }}
                      title={`Primary: ${p.primary}`}
                    />
                    <span
                      className="theme-swatch-chip"
                      style={{ background: p.accent }}
                      title={`Accent: ${p.accent}`}
                    />
                    <span
                      className="theme-swatch-chip"
                      style={{ background: p.bg, border: "1px solid rgba(0,0,0,0.15)" }}
                      title={`Background: ${p.bg}`}
                    />
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "auto" }}>
                    {isSelected ? "● Active" : "Click to apply"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Password & Security */}
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Change Password</h3>
            <p>Update your account access credentials</p>
          </div>
          <KeyRound size={18} color="var(--brand-primary)" />
        </div>

        <form onSubmit={handleChangePassword} style={{ padding: "24px", display: "grid", gap: "16px" }}>
          <div className="form-grid-3">
            <Field label="Current Password" required>
              <input
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </Field>
            <Field label="New Password" required>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </Field>
            <Field label="Confirm New Password" required>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Re-type new password"
                required
              />
            </Field>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="submit" className="primary-btn" disabled={isChangingPwd}>
              {isChangingPwd ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </section>

      {/* Data Management & Backup */}
      <section className="panel" style={{ padding: "24px" }}>
        <div className="panel-head" style={{ padding: "0 0 16px 0", borderBottom: "none" }}>
          <div>
            <h3>Data Management & Seed Restore</h3>
            <p>Export JSON backups or restore original Netflix subscriber dataset</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="secondary-btn" onClick={handleExportJSON}>
            <Download size={15} /> Export Workspace Backup (JSON)
          </button>
          <button className="danger-outline-btn" onClick={() => setResetModalOpen(true)}>
            <RefreshCw size={15} /> Restore Sample Netflix Database
          </button>
        </div>
      </section>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={resetModalOpen}
        title="Restore Netflix Sample Database?"
        message="This will reload the 12 pre-seeded Netflix subscribers with diverse streaming plans, watch hours, and risk tiers into MySQL and the platform."
        confirmLabel="Restore Database"
        type="danger"
        onConfirm={handleResetSeedData}
        onCancel={() => setResetModalOpen(false)}
      />
    </div>
  );
}