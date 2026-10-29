import React, { useState, useEffect, useRef } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate
} from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Search,
  ShieldCheck,
  Moon,
  Sun,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Lock,
  Palette,
  Check
} from "lucide-react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import AddCustomer from "./pages/AddCustomer";
import CustomerDetails from "./pages/CustomerDetails";
import EditCustomer from "./pages/EditCustomer";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import GlobalSearchModal from "./components/GlobalSearchModal";
import { RoleGuard, usePermissions } from "./components/RoleGuard";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";
import { useTheme } from "./context/ThemeContext";
import { PlatformEmblem } from "./components/BrandLogos";
import { FacultyDemoModal } from "./components/RetentionShowcase";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { canAddCustomer, canAccessSettings, role } = usePermissions();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.info("Signed out successfully.");
    navigate("/login");
  };

  const navItems = [
    { label: "Executive Dashboard", path: "/dashboard", icon: LayoutDashboard, show: true },
    { label: "Subscriber Directory", path: "/customers", icon: Users, show: true },
    { label: "Enroll Subscriber", path: "/add-customer", icon: UserPlus, show: canAddCustomer },
    { label: "Streaming Analytics", path: "/analytics", icon: BarChart3, show: true }
  ].filter((item) => item.show);

  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="brand-mark" style={{ background: "linear-gradient(135deg, #E50914 0%, #1DB954 50%, #0057FF 100%)", color: "#fff" }}>
          <ShieldCheck size={22} />
        </div>
        <div>
          <div className="brand-name">
            ChurnWise <span className="brand-badge" style={{ background: "linear-gradient(135deg, #E50914, #0057FF)", color: "#fff", fontSize: "10px", padding: "2px 6px" }}>STREAMING</span>
          </div>
          <div className="brand-sub">Multi-Platform Retention AI</div>
        </div>
        <button className="sidebar-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="nav-section-title">INTELLIGENCE</div>
      <nav className="sidebar-nav">
        {navItems.map(({ label, path, icon: Icon }) => (
          <button
            key={path}
            className={`nav-item ${location.pathname === path ? "active" : ""}`}
            onClick={() => {
              navigate(path);
              onClose();
            }}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="nav-section-title">WORKSPACE</div>
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}
          onClick={() => {
            navigate("/profile");
            onClose();
          }}
        >
          <UserCircle size={18} />
          <span>Profile & Team</span>
        </button>
        {canAccessSettings && (
          <button
            className={`nav-item ${location.pathname === "/settings" ? "active" : ""}`}
            onClick={() => {
              navigate("/settings");
              onClose();
            }}
          >
            <Settings size={18} />
            <span>MySQL Settings</span>
          </button>
        )}
      </nav>

      <div className="sidebar-bottom">
        {user && (
          <div className="sidebar-user-preview">
            <div className="avatar small" style={{ background: user.avatarColor || "var(--brand-primary)" }}>
              {user.avatar || user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-role">{role}</span>
            </div>
          </div>
        )}
        <button className="nav-item logout-item" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function Topbar({ onMenu, onOpenSearch, onOpenFacultyDemo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { canAccessSettings, role } = usePermissions();
  const { theme, setPalette, isDark, toggleTheme, currentPalette, palettes } = useTheme();
  const toast = useToast();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const paletteRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (paletteRef.current && !paletteRef.current.contains(e.target)) {
        setPaletteMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const titleMap = {
    "/dashboard": ["Executive Dashboard", "Subscription portfolio health & live churn risk"],
    "/customers": ["Subscriber Directory", "Manage subscriber profiles and churn interventions"],
    "/add-customer": ["Enroll Subscriber", "Register record and evaluate instant retention probability"],
    "/analytics": ["Streaming Analytics", "Cross-platform cohort retention patterns & AI simulator"],
    "/profile": ["User Profile & Security", "Manage your account credentials and team permissions"],
    "/settings": ["MySQL Settings", "Configure database connection and system parameters"]
  };

  const currentPath = location.pathname;
  const currentTitle = titleMap[currentPath]?.[0] || (currentPath.startsWith("/edit-customer") ? "Edit Subscriber Record" : "Subscriber Intelligence");
  const currentSub = titleMap[currentPath]?.[1] || "Detailed subscriber profile and retention playbook";

  const notificationsList = [
    { id: 1, title: "High Churn Risk Flagged", msg: "Rahul Verma (Netflix) reached 87% churn probability.", time: "5m ago", type: "alert" },
    { id: 2, title: "Retention Playbook Applied", msg: "20% Annual Upgrade applied to Priya Sharma (Prime).", time: "45m ago", type: "success" },
    { id: 3, title: "Post-Tournament Risk Detected", msg: "Amit Patel (Disney+ Hotstar) flagged at 85% risk.", time: "2h ago", type: "alert" },
    { id: 4, title: "Model Accuracy Verified", msg: "Streaming Retention AI benchmarked at 94.2% accuracy.", time: "4h ago", type: "info" }
  ];

  const streamingBrands = [
    { name: "Netflix", color: "#E50914", bg: "rgba(229, 9, 20, 0.12)", border: "rgba(229, 9, 20, 0.35)", path: "Netflix" },
    { name: "Prime Video", color: "#00A8E1", bg: "rgba(0, 168, 225, 0.12)", border: "rgba(0, 168, 225, 0.35)", path: "Amazon Prime Video" },
    { name: "Disney+ Hotstar", color: "#0063E5", bg: "rgba(0, 99, 229, 0.15)", border: "rgba(0, 99, 229, 0.35)", path: "Disney+ Hotstar" },
    { name: "Spotify", color: "#1DB954", bg: "rgba(29, 185, 84, 0.12)", border: "rgba(29, 185, 84, 0.35)", path: "Spotify" }
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onMenu}>
          <Menu size={20} />
        </button>
        <div className="topbar-title-wrap">
          <h1>{currentTitle}</h1>
          <p>{currentSub}</p>
        </div>
      </div>

      {/* Official Streaming Brand Badges in Navbar */}
      <div
        className="navbar-streaming-ribbon"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "3px 6px",
          borderRadius: "999px",
          background: "var(--bg-muted)",
          border: "1px solid var(--border-default)",
          flexShrink: 0
        }}
      >
        {streamingBrands.map((b) => (
          <button
            key={b.name}
            className="navbar-brand-pill"
            onClick={() => navigate(`/customers?platform=${encodeURIComponent(b.path)}`)}
            title={`View ${b.name} Subscribers & Retention`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "3px 8px",
              borderRadius: "999px",
              background: b.bg,
              border: `1px solid ${b.border}`,
              color: b.color,
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
              flexShrink: 0,
              height: "24px",
              lineHeight: "1",
              cursor: "pointer",
              transition: "all 0.18s ease"
            }}
          >
            <PlatformEmblem platform={b.name} size={13} />
            <span>{b.name}</span>
          </button>
        ))}
      </div>

      <div className="topbar-actions">
        {/* Customer Data Showcase Launcher Button */}
        <button
          className="faculty-demo-btn animate-pulse-subtle"
          onClick={onOpenFacultyDemo}
          title="Open Customer Data & Live Retention Case Studies (Netflix, Prime, Hotstar, Spotify)"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #E50914 0%, #7B2CBF 50%, #0063E5 100%)",
            color: "#fff",
            border: "none",
            fontSize: "11.5px",
            fontWeight: "800",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            flexShrink: 0,
            height: "32px",
            lineHeight: "1",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(229, 9, 20, 0.35)",
            transition: "all 0.18s ease"
          }}
        >
          <Sparkles size={13} />
          <span>Customer Data</span>
        </button>

        {/* Spotlight Command Search Launcher */}
        <button className="search-trigger-btn" onClick={onOpenSearch}>
          <Search size={14} />
          <span>Quick search...</span>
          <span className="search-kbd-shortcut">⌘K</span>
        </button>

        {/* Curated Light Color Themes & Palette Picker */}
        <div ref={paletteRef} style={{ position: "relative" }}>
          <button
            className="palette-trigger-btn"
            onClick={() => setPaletteMenuOpen((v) => !v)}
            title="Curated Color Themes & Palettes"
          >
            <div className="palette-swatch-dots">
              <span className="swatch-dot" style={{ background: currentPalette?.primary || "#4f46e5" }} />
              <span className="swatch-dot" style={{ background: currentPalette?.accent || "#06b6d4" }} />
            </div>
            <span>{currentPalette?.name ? currentPalette.name.split(" ")[0] : "Theme"}</span>
            <ChevronDown size={13} color="var(--text-muted)" />
          </button>

          {paletteMenuOpen && (
            <div className="dropdown-modern palette-dropdown-panel animate-scale-up">
              <div className="palette-dropdown-title">Curated Color Palettes</div>
              <div className="palette-options-list">
                {palettes.map((p) => {
                  const isSelected = theme === p.id;
                  return (
                    <button
                      key={p.id}
                      className={`palette-option-item ${isSelected ? "active" : ""}`}
                      onClick={() => {
                        setPalette(p.id);
                        toast.info(`Theme applied: ${p.name}`);
                        setPaletteMenuOpen(false);
                      }}
                    >
                      <div className="palette-option-left">
                        <div className="palette-option-swatches">
                          <span className="swatch-1" style={{ background: p.primary }} />
                          <span className="swatch-2" style={{ background: p.accent }} />
                        </div>
                        <div className="palette-option-info">
                          <strong>{p.name}</strong>
                          <span>{p.category === "dark" ? "Dark Mode" : "Light Mode"}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="palette-option-badge">{p.badge}</span>
                        {isSelected && <Check size={14} color="var(--brand-primary)" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher Quick Toggle */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div ref={notificationRef} style={{ position: "relative" }}>
          <button
            className="icon-btn"
            onClick={() => setNotificationsOpen((v) => !v)}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="notification-dot" />
          </button>

          {notificationsOpen && (
            <div className="dropdown-modern notification-panel-modern">
              <div className="notification-header">
                <strong>Streaming Alerts & Interventions</strong>
                <span style={{ fontSize: "11px", color: "var(--brand-primary)", fontWeight: "600" }}>4 unread</span>
              </div>
              <div style={{ display: "grid", gap: "4px", padding: "6px 0" }}>
                {notificationsList.map((n) => (
                  <div key={n.id} className="notification-item" onClick={() => navigate("/analytics")}>
                    <div
                      className="notification-item-icon"
                      style={{
                        background: n.type === "alert" ? "var(--color-danger-bg)" : "var(--brand-primary-light)",
                        color: n.type === "alert" ? "var(--color-danger)" : "var(--brand-primary)"
                      }}
                    >
                      {n.type === "alert" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    </div>
                    <div className="notification-item-content">
                      <strong>{n.title}</strong>
                      <p>{n.msg}</p>
                      <small style={{ fontSize: "10px", color: "var(--text-light)", marginTop: "3px", display: "block" }}>{n.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu - Avatar Only */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <div
            className="profile-trigger"
            onClick={() => setProfileMenuOpen((v) => !v)}
            title={`${user?.name || "Devisri chowdary Koya"} (${role})`}
            style={{ padding: "2px", borderRadius: "50%" }}
          >
            <div className="avatar small" style={{ background: user?.avatarColor || "var(--brand-primary)" }}>
              {user?.avatar || (user?.name || "DC").slice(0, 2).toUpperCase()}
            </div>
          </div>

          {profileMenuOpen && (
            <div className="dropdown-modern">
              <div className="dropdown-user-header">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
                <div>
                  <span className="dropdown-role-pill">{role}</span>
                </div>
              </div>

              <button
                className="dropdown-btn"
                onClick={() => {
                  navigate("/profile");
                  setProfileMenuOpen(false);
                }}
              >
                <UserCircle size={16} /> Profile & Details
              </button>

              {canAccessSettings && (
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/settings");
                    setProfileMenuOpen(false);
                  }}
                >
                  <Settings size={16} /> System Settings
                </button>
              )}

              <div className="dropdown-divider" />

              <button
                className="dropdown-btn danger-btn-text"
                onClick={() => {
                  logout();
                  toast.info("Logged out successfully.");
                  navigate("/login");
                  setProfileMenuOpen(false);
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [facultyDemoOpen, setFacultyDemoOpen] = useState(false);
  const [targetCustomerId, setTargetCustomerId] = useState(null);

  useEffect(() => {
    const handleOpenModal = (e) => {
      if (e.detail?.customerId) {
        setTargetCustomerId(e.detail.customerId);
      }
      setFacultyDemoOpen(true);
    };
    window.addEventListener("open-customer-data-modal", handleOpenModal);
    return () => window.removeEventListener("open-customer-data-modal", handleOpenModal);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <div className="main-shell">
        <Topbar
          onMenu={() => setSidebarOpen(true)}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenFacultyDemo={() => {
            setTargetCustomerId(null);
            setFacultyDemoOpen(true);
          }}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <GlobalSearchModal
        open={searchModalOpen}
        onClose={setSearchModalOpen}
      />

      <FacultyDemoModal
        isOpen={facultyDemoOpen}
        onClose={() => setFacultyDemoOpen(false)}
        initialCustomerId={targetCustomerId}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route
            path="/add-customer"
            element={
              <RoleGuard allowedRoles={["Admin", "Retention Lead"]}>
                <AddCustomer />
              </RoleGuard>
            }
          />
          <Route
            path="/edit-customer/:id"
            element={
              <RoleGuard allowedRoles={["Admin", "Retention Lead"]}>
                <EditCustomer />
              </RoleGuard>
            }
          />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/settings"
            element={
              <RoleGuard allowedRoles={["Admin"]}>
                <SettingsPage />
              </RoleGuard>
            }
          />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}