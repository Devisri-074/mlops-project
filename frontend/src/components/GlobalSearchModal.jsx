import React, { useState, useEffect, useRef } from "react";
import { Search, User, BarChart3, Settings, UserPlus, Users, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCustomers } from "../services/customerService";

export default function GlobalSearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const customers = getCustomers();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose(!open);
      }
      if (e.key === "Escape" && open) {
        onClose(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const filteredCustomers = query.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.email.toLowerCase().includes(query.toLowerCase()) ||
          c.id.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const quickPages = [
    { name: "Executive Dashboard", path: "/dashboard", icon: BarChart3, category: "Analytics" },
    { name: "Customer Directory", path: "/customers", icon: Users, category: "Management" },
    { name: "Register New Customer", path: "/add-customer", icon: UserPlus, category: "Action" },
    { name: "Deep Analytics & Churn Predictor", path: "/analytics", icon: BarChart3, category: "Intelligence" },
    { name: "Account Profile", path: "/profile", icon: User, category: "Preferences" },
    { name: "System Settings", path: "/settings", icon: Settings, category: "Preferences" }
  ].filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || query.trim() === "");

  const handleSelect = (path) => {
    navigate(path);
    onClose(false);
  };

  return (
    <div className="search-modal-backdrop" onClick={() => onClose(false)}>
      <div className="search-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-input-row">
          <Search size={20} className="search-modal-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, actions, analytics, or type a command... (Esc to close)"
            className="search-modal-input"
          />
          <button className="search-modal-close" onClick={() => onClose(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="search-modal-results">
          {filteredCustomers.length > 0 && (
            <div className="search-result-group">
              <div className="search-group-title">CUSTOMERS</div>
              {filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  className="search-result-item"
                  onClick={() => handleSelect(`/customers/${c.id}`)}
                >
                  <div className="search-avatar">{c.name.slice(0, 2).toUpperCase()}</div>
                  <div className="search-result-info">
                    <strong>{c.name}</strong>
                    <span>
                      {c.id} · {c.email} · {c.churn}
                    </span>
                  </div>
                  <div className={`search-risk-pill ${c.riskColor || "green"}`}>
                    Risk: {c.riskScore || 0}%
                  </div>
                  <ArrowRight size={15} className="search-item-arrow" />
                </div>
              ))}
            </div>
          )}

          <div className="search-result-group">
            <div className="search-group-title">QUICK NAVIGATION</div>
            {quickPages.map((page) => {
              const Icon = page.icon;
              return (
                <div
                  key={page.path}
                  className="search-result-item"
                  onClick={() => handleSelect(page.path)}
                >
                  <div className="search-icon-box">
                    <Icon size={16} />
                  </div>
                  <div className="search-result-info">
                    <strong>{page.name}</strong>
                    <span>{page.category}</span>
                  </div>
                  <ArrowRight size={15} className="search-item-arrow" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="search-modal-footer">
          <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>Select with <kbd>Enter</kbd></span>
          <span>Close with <kbd>Esc</kbd></span>
        </div>
      </div>
    </div>
  );
}
