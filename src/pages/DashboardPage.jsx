import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      id: 1,
      title: "Total Stations",
      value: "124",
      change: "+12%",
      color: "#00C853",
    },
    {
      id: 2,
      title: "Active Chargers",
      value: "98",
      change: "+5%",
      color: "#2979FF",
    },
    {
      id: 3,
      title: "Total Sessions Today",
      value: "342",
      change: "+18%",
      color: "#FF6D00",
    },
    {
      id: 4,
      title: "Energy Delivered (kWh)",
      value: "5,820",
      change: "+9%",
      color: "#AA00FF",
    },
  ];

  const stations = [
    {
      id: 1,
      name: "Westlands EV Hub",
      location: "Westlands, Nairobi",
      status: "Active",
      chargers: 8,
      available: 3,
      sessions: 45,
      energy: "820 kWh",
    },
    {
      id: 2,
      name: "CBD Charging Point",
      location: "CBD, Nairobi",
      status: "Active",
      chargers: 6,
      available: 1,
      sessions: 38,
      energy: "610 kWh",
    },
    {
      id: 3,
      name: "Karen EV Station",
      location: "Karen, Nairobi",
      status: "Maintenance",
      chargers: 4,
      available: 0,
      sessions: 12,
      energy: "210 kWh",
    },
    {
      id: 4,
      name: "Kilimani Fast Charge",
      location: "Kilimani, Nairobi",
      status: "Active",
      chargers: 10,
      available: 6,
      sessions: 60,
      energy: "1,100 kWh",
    },
    {
      id: 5,
      name: "Thika Road Hub",
      location: "Thika Rd, Nairobi",
      status: "Offline",
      chargers: 5,
      available: 0,
      sessions: 0,
      energy: "0 kWh",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: "John M.",
      station: "Westlands EV Hub",
      duration: "45 min",
      energy: "22 kWh",
      time: "2 mins ago",
      status: "Completed",
    },
    {
      id: 2,
      user: "Sarah K.",
      station: "Kilimani Fast Charge",
      duration: "30 min",
      energy: "15 kWh",
      time: "15 mins ago",
      status: "Completed",
    },
    {
      id: 3,
      user: "Peter O.",
      station: "CBD Charging Point",
      duration: "In Progress",
      energy: "8 kWh",
      time: "Just now",
      status: "Active",
    },
    {
      id: 4,
      user: "Alice W.",
      station: "Karen EV Station",
      duration: "60 min",
      energy: "30 kWh",
      time: "1 hr ago",
      status: "Completed",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "#00C853";
      case "Maintenance":
        return "#FF6D00";
      case "Offline":
        return "#FF1744";
      case "Completed":
        return "#00C853";
      default:
        return "#666";
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back. Monitor your charging network performance in real-time.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            style={styles.mapBtn}
            onClick={() => navigate("/map")}
          >
            VIEW MAP
          </button>
          <button style={styles.exportBtn}>EXPORT REPORT</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.id} style={styles.statCard}>
            <div style={styles.statTop}>
              <span style={{ ...styles.statTitle, color: "#666" }}>{stat.title}</span>
              <span
                style={{
                  ...styles.statChange,
                  color: "#00C853",
                }}
              >
                {stat.change} UP
              </span>
            </div>
            <h2 style={{ ...styles.statValue, color: "#1a1a1a" }}>
              {stat.value}
            </h2>
            <div style={{ width: '40px', height: '2px', background: stat.color, marginTop: '10px' }} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["overview", "stations", "activity"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {}),
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div style={styles.overviewGrid}>
          {/* Chart Placeholder */}
          <div style={styles.chartCard}>
            <h3 style={styles.cardTitle}>ENERGY DELIVERED THIS WEEK</h3>
            <div style={styles.chartPlaceholder}>
              {[60, 80, 45, 90, 70, 85, 95].map((h, i) => (
                <div key={i} style={styles.barWrapper}>
                  <div
                    style={{
                      ...styles.bar,
                      height: `${h}%`,
                      background: "#00C853",
                    }}
                  />
                  <span style={styles.barLabel}>
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Breakdown */}
          <div style={styles.statusCard}>
            <h3 style={styles.cardTitle}>STATION STATUS</h3>
            {[
              { label: "Active", count: 98, color: "#00C853" },
              { label: "Maintenance", count: 15, color: "#FF6D00" },
              { label: "Offline", count: 11, color: "#FF1744" },
            ].map((item) => (
              <div key={item.label} style={styles.statusRow}>
                <div style={styles.statusLeft}>
                  <span style={styles.statusLabel}>{item.label}</span>
                </div>
                <div style={styles.statusBarOuter}>
                  <div
                    style={{
                      ...styles.statusBarInner,
                      width: `${(item.count / 124) * 100}%`,
                      background: item.color,
                    }}
                  />
                </div>
                <span style={styles.statusCount}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stations Tab */}
      {activeTab === "stations" && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  "Station",
                  "Location",
                  "Status",
                  "Chargers",
                  "Available",
                  "Sessions",
                  "Energy",
                  "Action",
                ].map((h) => (
                  <th key={h} style={styles.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id} style={styles.tr}>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.location}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        color: getStatusColor(s.status),
                        border: `1px solid ${getStatusColor(s.status)}`,
                      }}
                    >
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={styles.td}>{s.chargers}</td>
                  <td style={styles.td}>{s.available}</td>
                  <td style={styles.td}>{s.sessions}</td>
                  <td style={styles.td}>{s.energy}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.detailBtn}
                      onClick={() => navigate(`/station/${s.id}`)}
                    >
                      VIEW DETAILS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div style={styles.activityList}>
          {recentActivity.map((a) => (
            <div key={a.id} style={styles.activityCard}>
              <div style={styles.activityAvatar}>
                {a.user.charAt(0)}
              </div>
              <div style={styles.activityInfo}>
                <p style={styles.activityUser}>{a.user}</p>
                <p style={styles.activityStation}>STATION: {a.station}</p>
              </div>
              <div style={styles.activityMeta}>
                <p style={styles.metaText}>DURATION: {a.duration}</p>
                <p style={styles.metaText}>ENERGY: {a.energy}</p>
              </div>
              <div style={styles.activityRight}>
                <span
                  style={{
                    ...styles.badge,
                    color: getStatusColor(a.status),
                    border: `1px solid ${getStatusColor(a.status)}`,
                  }}
                >
                  {a.status.toUpperCase()}
                </span>
                <p style={styles.timeText}>{a.time.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===================== STYLES =====================
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f5f5",
    padding: "40px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: "#1a1a1a",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    flexWrap: "wrap",
    gap: "20px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    margin: 0,
    color: "#1a1a1a",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: "#666",
    margin: "8px 0 0",
    fontSize: "15px",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  mapBtn: {
    background: "transparent",
    border: "1px solid #e0e0e0",
    color: "#1a1a1a",
    padding: "12px 24px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.05em",
  },
  exportBtn: {
    background: "#00C853",
    border: "none",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.05em",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
    marginBottom: "40px",
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "0px",
    padding: "24px",
  },
  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  statChange: { fontSize: "11px", fontWeight: "800" },
  statValue: {
    fontSize: "36px",
    fontWeight: "800",
    margin: "0",
    letterSpacing: "-0.03em",
  },
  statTitle: { fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" },
  tabs: {
    display: "flex",
    gap: "32px",
    marginBottom: "32px",
    borderBottom: "1px solid #e0e0e0",
  },
  tab: {
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#999",
    padding: "0 0 12px 0",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    transition: "all 0.2s",
  },
  activeTab: {
    color: "#00C853",
    borderBottom: "2px solid #00C853",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
  },
  chartCard: {
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "0px",
    padding: "32px",
  },
  chartPlaceholder: {
    display: "flex",
    alignItems: "flex-end",
    gap: "20px",
    height: "200px",
    marginTop: "32px",
  },
  barWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    gap: "12px",
  },
  bar: {
    width: "100%",
    borderRadius: "0px",
    transition: "height 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  barLabel: { color: "#999", fontSize: "11px", fontWeight: "700" },
  statusCard: {
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "0px",
    padding: "32px",
  },
  cardTitle: {
    color: "#1a1a1a",
    margin: "0 0 32px",
    fontSize: "14px",
    fontWeight: "800",
    letterSpacing: "0.05em",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  statusLeft: { width: "100px" },
  statusLabel: { color: "#666", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" },
  statusBarOuter: {
    flex: 1,
    background: "#f0f0f0",
    borderRadius: "0px",
    height: "6px",
    overflow: "hidden",
  },
  statusBarInner: { height: "100%", borderRadius: "0px" },
  statusCount: { color: "#1a1a1a", fontSize: "13px", fontWeight: "800", width: "40px", textAlign: "right" },
  tableWrapper: {
    overflowX: "auto",
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "0px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "16px 24px",
    textAlign: "left",
    color: "#999",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e0e0e0",
    background: "#fafafa",
  },
  tr: { borderBottom: "1px solid #e0e0e0", transition: "background 0.2s" },
  td: { padding: "20px 24px", color: "#1a1a1a", fontSize: "14px", fontWeight: "500" },
  badge: {
    padding: "4px 10px",
    borderRadius: "0px",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.05em",
  },
  detailBtn: {
    background: "transparent",
    border: "1px solid #00C853",
    color: "#00C853",
    padding: "8px 16px",
    borderRadius: "0px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.05em",
    transition: "all 0.2s",
  },
  activityList: { display: "flex", flexDirection: "column", gap: "16px" },
  activityCard: {
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "0px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap",
  },
  activityAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "0px",
    background: "#1a1a1a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "800",
    flexShrink: 0,
  },
  activityInfo: { flex: 1, minWidth: "200px" },
  activityUser: { margin: 0, fontWeight: "800", fontSize: "16px", letterSpacing: "-0.01em" },
  activityStation: { margin: "4px 0 0", color: "#666", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" },
  activityMeta: { display: "flex", gap: "32px" },
  metaText: { color: "#666", fontSize: "12px", margin: 0, fontWeight: "700" },
  activityRight: { textAlign: "right" },
  timeText: { color: "#999", fontSize: "10px", margin: "8px 0 0", fontWeight: "800", letterSpacing: "0.05em" },
};

export default DashboardPage;
