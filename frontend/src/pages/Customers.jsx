import React, { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
  X,
  Download,
  CheckSquare,
  Square,
  ArrowUpDown,
  Zap,
  Sparkles,
  AlertTriangle,
  Tv,
  Clock,
  Film,
  Music,
  ShoppingBag,
  Trophy
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getCustomers,
  syncCustomersFromBackend,
  deleteCustomer,
  batchDeleteCustomers,
  batchUpdateStatus,
  exportCustomersToCSV
} from "../services/customerService";
import { StatusBadge, RiskBadge, PlatformBadge, EmptyState, ConfirmationModal } from "../components/ProtectedForm";
import { openCustomerDataModal } from "../components/RetentionShowcase";
import { usePermissions } from "../components/RoleGuard";
import { useToast } from "../context/ToastContext";

const PLATFORM_FILTERS = [
  { id: "All", name: "All Platforms" },
  { id: "Netflix", name: "Netflix" },
  { id: "Amazon Prime Video", name: "Prime Video" },
  { id: "Disney+ Hotstar", name: "Disney+ Hotstar" },
  { id: "Spotify", name: "Spotify" }
];

export default function Customers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { canAddCustomer, canEditCustomer, canDeleteCustomer, role } = usePermissions();
  const [customers, setCustomers] = useState(getCustomers());

  const initialPlatform = searchParams.get("platform") || "All";

  useEffect(() => {
    syncCustomersFromBackend().then((data) => {
      if (data && data.length > 0) setCustomers(data);
    });
  }, []);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState(initialPlatform);
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");

  useEffect(() => {
    const p = searchParams.get("platform");
    if (p) setPlatformFilter(p);
  }, [searchParams]);

  // Sorting
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Selection & Batch
  const [selectedIds, setSelectedIds] = useState([]);

  // Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 8;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filtered = useMemo(() => {
    return customers
      .filter((c) => {
        const matchesQuery =
          (c.name + c.email + c.id + (c.platform || "") + (c.plan || "") + (c.deviceType || "")).toLowerCase().includes(search.toLowerCase());
        const matchesPlatform = platformFilter === "All" || (c.platform || "Netflix").toLowerCase() === platformFilter.toLowerCase();
        const matchesStatus = statusFilter === "All" || (c.churn || "").toLowerCase() === statusFilter.toLowerCase();
        const matchesPlan = planFilter === "All" || (c.plan || "").toLowerCase().includes(planFilter.toLowerCase());
        const matchesRisk =
          riskFilter === "All" ||
          (riskFilter === "Low" && (c.riskScore || 0) < 35) ||
          (riskFilter === "Moderate" && (c.riskScore || 0) >= 35 && (c.riskScore || 0) < 60) ||
          (riskFilter === "High" && (c.riskScore || 0) >= 60);

        return matchesQuery && matchesPlatform && matchesStatus && matchesPlan && matchesRisk;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [customers, search, platformFilter, statusFilter, planFilter, riskFilter, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pagedRows = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === pagedRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pagedRows.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const confirmDeleteSingle = (customer) => {
    if (!canDeleteCustomer) {
      toast.error("Permission denied: Only Administrators can delete subscriber records.");
      return;
    }
    setDeleteTarget(customer);
    setDeleteModalOpen(true);
  };

  const confirmDeleteBatch = () => {
    if (!canDeleteCustomer) {
      toast.error("Permission denied: Only Administrators can perform batch deletions.");
      return;
    }
    setDeleteTarget("batch");
    setDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (deleteTarget === "batch") {
      batchDeleteCustomers(selectedIds);
      toast.success(`Successfully removed ${selectedIds.length} subscriber records.`);
      setSelectedIds([]);
    } else if (deleteTarget) {
      deleteCustomer(deleteTarget.id);
      toast.success(`Subscriber ${deleteTarget.name} (${deleteTarget.id}) removed.`);
    }
    setCustomers(getCustomers());
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleExportCSV = () => {
    exportCustomersToCSV(filtered);
    toast.success(`Exported ${filtered.length} subscriber records to CSV.`);
  };

  const handleBatchStatus = (newStatus) => {
    batchUpdateStatus(selectedIds, newStatus);
    setCustomers(getCustomers());
    toast.success(`Updated ${selectedIds.length} accounts to ${newStatus}.`);
    setSelectedIds([]);
  };

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow blue">SUBSCRIBER DIRECTORY</span>
          <h2>Streaming Subscribers</h2>
          <p>
            Monitor accounts across <strong>Netflix, Prime Video, Spotify, and Disney+ Hotstar</strong>, filter by service platform, and trigger retention playbooks.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="secondary-btn"
            onClick={() => openCustomerDataModal()}
            title="Open Interactive Customer Retention Suite"
          >
            <Sparkles size={15} color="var(--brand-primary)" /> Customer Retention Suite
          </button>
          <button className="secondary-btn" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          {canAddCustomer && (
            <button className="primary-btn" onClick={() => navigate("/add-customer")}>
              <Plus size={17} /> Enroll Subscriber
            </button>
          )}
        </div>
      </div>

      {/* Platform Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
        {PLATFORM_FILTERS.map((pf) => {
          const isCurrent = platformFilter === pf.id;
          const count = pf.id === "All"
            ? customers.length
            : customers.filter((c) => (c.platform || "Netflix").toLowerCase() === pf.id.toLowerCase()).length;
          return (
            <button
              key={pf.id}
              onClick={() => {
                setPlatformFilter(pf.id);
                setPage(1);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "12.5px",
                fontWeight: isCurrent ? "700" : "500",
                background: isCurrent ? "var(--brand-primary)" : "var(--bg-surface)",
                color: isCurrent ? "#fff" : "var(--text-secondary)",
                border: isCurrent ? "1px solid var(--brand-primary)" : "1px solid var(--border-default)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap"
              }}
            >
              <span>{pf.name}</span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  background: isCurrent ? "rgba(255, 255, 255, 0.25)" : "var(--bg-muted)",
                  color: isCurrent ? "#fff" : "var(--text-muted)"
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <section className="panel">
        {/* Toolbar & Filters */}
        <div className="toolbar-modern">
          <div className="search-box-modern">
            <Search size={17} color="var(--text-muted)" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, ID, platform, plan, device..."
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color: "var(--text-muted)" }}>
                <X size={15} />
              </button>
            )}
          </div>

          <div className="filters-group">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Subscription</option>
              <option value="Churned">Cancelled / Churned</option>
            </select>

            <select
              className="filter-select"
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Risk Tiers</option>
              <option value="Low">Low Risk (&lt;35%)</option>
              <option value="Moderate">Moderate Risk (35–59%)</option>
              <option value="High">High Risk (≥60%)</option>
            </select>
          </div>
        </div>

        {/* Batch Actions Toolbar */}
        {selectedIds.length > 0 && (
          <div
            style={{
              padding: "10px 24px",
              background: "var(--brand-primary-light)",
              borderBottom: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--brand-primary)" }}>
              {selectedIds.length} subscriber{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="secondary-btn btn-sm"
                onClick={() => handleBatchStatus("Active")}
              >
                Mark Active
              </button>
              <button
                className="secondary-btn btn-sm"
                onClick={() => handleBatchStatus("Churned")}
              >
                Mark Churned
              </button>
              {canDeleteCustomer && (
                <button className="danger-btn btn-sm" onClick={confirmDeleteBatch}>
                  <Trash2 size={13} /> Delete Selected
                </button>
              )}
            </div>
          </div>
        )}

        {/* Table View */}
        {pagedRows.length > 0 ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.length === pagedRows.length && pagedRows.length > 0}
                        onChange={toggleSelectAll}
                        style={{ width: "15px", height: "15px", cursor: "pointer" }}
                      />
                    </th>
                    <th className="sortable" onClick={() => handleSort("name")}>
                      Subscriber {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th>Platform</th>
                    <th>Plan Tier</th>
                    <th className="sortable" onClick={() => handleSort("watchHoursPerWeek")}>
                      Usage {sortField === "watchHoursPerWeek" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="sortable" onClick={() => handleSort("tenure")}>
                      Tenure {sortField === "tenure" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th>Pass</th>
                    <th className="sortable" onClick={() => handleSort("riskScore")}>
                      AI Churn Risk {sortField === "riskScore" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((c) => {
                    const isSelected = selectedIds.includes(c.id);
                    const isAudio = (c.platform || "").toLowerCase() === "spotify";
                    return (
                      <tr key={c.id} style={{ background: isSelected ? "var(--bg-muted)" : "inherit" }}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(c.id)}
                            style={{ width: "15px", height: "15px", cursor: "pointer" }}
                          />
                        </td>
                        <td>
                          <div
                            className="customer-cell"
                            onClick={() => navigate(`/customers/${c.id}`)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="avatar small">{c.name.slice(0, 2).toUpperCase()}</div>
                            <div>
                              <strong>{c.name}</strong>
                              <small>{c.id} · {c.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <PlatformBadge platform={c.platform} />
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "var(--brand-primary)", fontWeight: "600" }}>
                            {c.plan || "Standard"}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "12.5px" }}>
                            {c.watchHoursPerWeek || 15} {isAudio ? "hrs listen" : "hrs watch"}
                          </span>
                        </td>
                        <td>{c.tenure} mo.</td>
                        <td>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {c.contract}
                          </span>
                        </td>
                        <td>
                          <RiskBadge score={c.riskScore} level={c.riskLevel} />
                        </td>
                        <td>
                          <StatusBadge status={c.churn} />
                        </td>
                        <td>
                          <div className="row-actions" style={{ justifyContent: "flex-end" }}>
                            <button
                              className="row-action-btn"
                              title="View Customer Retention Data & Before/After Comparison"
                              onClick={() => openCustomerDataModal(c.id)}
                              style={{ color: "var(--brand-primary)" }}
                            >
                              <Sparkles size={15} />
                            </button>
                            <button
                              className="row-action-btn"
                              title="View Subscriber Profile & Diagnostic"
                              onClick={() => navigate(`/customers/${c.id}`)}
                            >
                              <Eye size={15} />
                            </button>
                            {canEditCustomer && (
                              <button
                                className="row-action-btn"
                                title="Edit Subscriber"
                                onClick={() => navigate(`/edit-customer/${c.id}`)}
                              >
                                <Pencil size={15} />
                              </button>
                            )}
                            {canDeleteCustomer && (
                              <button
                                className="row-action-btn danger-action"
                                title="Delete Record (Admin Only)"
                                onClick={() => confirmDeleteSingle(c)}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-modern">
              <span>
                Showing <b>{pagedRows.length}</b> of <b>{filtered.length}</b> subscribers
              </span>
              <div className="pagination-btns">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={page === i + 1 ? "current" : ""}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No subscribers match your search"
            text="Try adjusting your keywords or clearing active filters."
            actionText="Clear Filters"
            onAction={() => {
              setSearch("");
              setPlatformFilter("All");
              setStatusFilter("All");
              setPlanFilter("All");
              setRiskFilter("All");
            }}
          />
        )}
      </section>

      {/* Confirmation Modal */}
      {deleteModalOpen && (
        <ConfirmationModal
          title={deleteTarget === "batch" ? "Confirm Batch Deletion" : "Delete Subscriber Record"}
          message={
            deleteTarget === "batch"
              ? `Are you sure you want to permanently remove ${selectedIds.length} selected subscriber records from MySQL? This action cannot be undone.`
              : `Are you sure you want to delete ${deleteTarget?.name} (${deleteTarget?.id}) from MySQL? This action cannot be undone.`
          }
          confirmLabel="Yes, Delete Record"
          cancelLabel="Cancel"
          danger
          onConfirm={executeDelete}
          onCancel={() => {
            setDeleteModalOpen(false);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}