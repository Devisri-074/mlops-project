import React, { useState } from "react";
import {
  UserCircle,
  Mail,
  ShieldCheck,
  LogOut,
  Building,
  Briefcase,
  Calendar,
  Smartphone,
  Laptop,
  CheckCircle2,
  Pencil,
  KeyRound
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Field } from "../components/ProtectedForm";

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, updateProfile, logout, revokeSession } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "Admin User");
  const [email, setEmail] = useState(user?.email || "admin@churnwise.com");
  const [title, setTitle] = useState(user?.title || "VP of Customer Operations");
  const [department, setDepartment] = useState(user?.department || "Customer Retention");

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required.");
      return;
    }

    updateProfile({ name, email, title, department });
    setEditing(false);
    toast.success("Profile information updated successfully!");
  };

  const handleLogout = () => {
    logout();
    toast.info("You have signed out of ChurnWise.");
    navigate("/login");
  };

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow blue">ACCOUNT PROFILE</span>
          <h2>User Profile & Security</h2>
          <p>Manage your account credentials, role permissions, and active device sessions.</p>
        </div>
      </div>

      {/* Hero Profile Banner */}
      <section className="panel" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div className="avatar xxl" style={{ background: user?.avatarColor || "var(--brand-primary)" }}>
              {user?.avatar || (user?.name || "AD").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span className="dropdown-role-pill">{user?.role || "Admin"}</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>ID: {user?.id || "ACC-01"}</span>
              </div>
              <h2 style={{ fontSize: "24px", margin: "2px 0 4px" }}>{user?.name}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>
                {user?.title || "Operations Lead"} · {user?.department || "Operations"}
              </p>
            </div>
          </div>

          {!editing && (
            <button className="secondary-btn" onClick={() => setEditing(true)}>
              <Pencil size={15} /> Edit Profile
            </button>
          )}
        </div>
      </section>

      {/* Edit or View Information */}
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Personal Information</h3>
            <p>Your team workspace identity and communication email</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} style={{ padding: "24px", display: "grid", gap: "16px" }}>
            <div className="form-grid-2">
              <Field label="Full Name" required>
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <Field label="Email Address" required>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Field>
            </div>

            <div className="form-grid-2">
              <Field label="Job Title">
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Department">
                <input value={department} onChange={(e) => setDepartment(e.target.value)} />
              </Field>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button type="button" className="secondary-btn" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-btn">
                Save Profile Changes
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Full Name</span>
              <strong style={{ display: "block", fontSize: "13.5px", marginTop: "3px" }}>{user?.name}</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Work Email</span>
              <strong style={{ display: "block", fontSize: "13.5px", marginTop: "3px" }}>{user?.email}</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Job Title</span>
              <strong style={{ display: "block", fontSize: "13.5px", marginTop: "3px" }}>{user?.title || "N/A"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Department</span>
              <strong style={{ display: "block", fontSize: "13.5px", marginTop: "3px" }}>{user?.department || "Customer Retention"}</strong>
            </div>
          </div>
        )}
      </section>

      {/* Active Device Sessions */}
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Active Login Sessions & Devices</h3>
            <p>Manage currently authorized browsers and locations</p>
          </div>
        </div>
        <div style={{ padding: "16px 24px", display: "grid", gap: "12px" }}>
          {(user?.activeSessions || [
            { id: "s1", device: "Chrome / Windows 11 (Current)", location: "San Francisco, CA", lastActive: "Active now" }
          ]).map((session) => (
            <div
              key={session.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "var(--bg-muted)",
                borderRadius: "var(--radius-md)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Laptop size={18} color="var(--brand-primary)" />
                <div>
                  <strong style={{ fontSize: "13px", display: "block" }}>{session.device}</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {session.location} · {session.lastActive}
                  </span>
                </div>
              </div>
              {!session.device.includes("Current") && (
                <button
                  className="secondary-btn btn-sm"
                  onClick={() => {
                    revokeSession(session.id);
                    toast.success("Session revoked.");
                  }}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Sign Out Button */}
      <div>
        <button
          className="danger-outline-btn"
          style={{ width: "100%", height: "46px", fontSize: "14px" }}
          onClick={handleLogout}
        >
          <LogOut size={16} /> Sign Out of All Services
        </button>
      </div>
    </div>
  );
}