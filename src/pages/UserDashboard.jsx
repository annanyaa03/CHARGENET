import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      id: 1,
      title: "Total Sessions",
      value: "42",
      change: "+4%",
    },
    {
      id: 2,
      title: "Energy Used (kWh)",
      value: "840",
      change: "+12%",
    },
    {
      id: 3,
      title: "Total Time Charged",
      value: "126h",
      change: "+8%",
    },
    {
      id: 4,
      title: "Amount Spent (₹)",
      value: "15,400",
      change: "+5%",
    },
  ];

  const recentSessions = [
    {
      id: 101,
      station: "Westlands EV Hub",
      date: "20 Apr 2026",
      duration: "45 min",
      energy: "22 kWh",
      cost: "₹ 440",
    },
    {
      id: 102,
      station: "Kilimani Fast Charge",
      date: "18 Apr 2026",
      duration: "30 min",
      energy: "15 kWh",
      cost: "₹ 300",
    },
    {
      id: 103,
      station: "CBD Charging Point",
      date: "15 Apr 2026",
      duration: "1h 10m",
      energy: "35 kWh",
      cost: "₹ 700",
    },
  ];

  const history = [
    ...recentSessions,
    {
      id: 104,
      station: "Karen EV Station",
      date: "10 Apr 2026",
      duration: "60 min",
      energy: "30 kWh",
      cost: "₹ 600",
      status: "Completed",
    },
    {
      id: 105,
      station: "Thika Road Hub",
      date: "05 Apr 2026",
      duration: "15 min",
      energy: "4 kWh",
      cost: "₹ 80",
      status: "Failed",
    },
  ];

  const savedStations = [
    {
      id: 1,
      name: "Westlands EV Hub",
      location: "Westlands, Mumbai",
      status: "Active",
      distance: "2.5 km",
    },
    {
      id: 4,
      name: "Kilimani Fast Charge",
      location: "Kilimani, Mumbai",
      status: "Active",
      distance: "4.8 km",
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Charging Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back, {user?.name || "User"}. Track your charging history and usage.
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          style={styles.findBtn}
        >
          FIND A STATION
        </button>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.id} style={styles.statCard}>
            <div style={styles.statTop}>
              <span style={styles.statLabel}>{stat.title}</span>
              <span style={styles.statTrend}>{stat.change} UP</span>
            </div>
            <h2 style={styles.statValue}>{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["overview", "history", "saved stations"].map((tab) => (
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

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div style={styles.overviewGrid}>
          {/* Usage Chart */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>WEEKLY ENERGY USAGE</h3>
            <div style={styles.chartArea}>
              {[40, 70, 30, 85, 60, 45, 90].map((h, i) => (
                <div key={i} style={styles.barWrapper}>
                  <div style={{ ...styles.bar, height: `${h}%` }} />
                  <span style={styles.barLabel}>{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Favourite Station */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>FAVOURITE STATION</h3>
              <p style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0' }}>Westlands EV Hub</p>
              <p style={{ fontSize: '13px', color: '#666', margin: '0 0 20px 0' }}>Westlands, Mumbai</p>
              <button 
                onClick={() => navigate('/station/1')}
                style={styles.actionBtn}
              >
                CHARGE HERE
              </button>
            </div>

            {/* Recent list */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>RECENT SESSIONS</h3>
              {recentSessions.map(s => (
                <div key={s.id} style={styles.sessionItem}>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '14px', margin: 0 }}>{s.station}</p>
                    <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{s.date.toUpperCase()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '700', fontSize: '14px', margin: 0 }}>{s.energy}</p>
                    <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{s.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Date", "Station", "Location", "Duration", "Energy", "Cost", "Status"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(s => (
                <tr key={s.id} style={styles.tr}>
                  <td style={styles.td}>{s.date}</td>
                  <td style={styles.td}>{s.station}</td>
                  <td style={styles.td}>{s.location || "Mumbai"}</td>
                  <td style={styles.td}>{s.duration}</td>
                  <td style={styles.td}>{s.energy}</td>
                  <td style={styles.td}>{s.cost}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      color: s.status === "Failed" ? "#FF1744" : "#00C853",
                      border: `1px solid ${s.status === "Failed" ? "#FF1744" : "#00C853"}`,
                    }}>
                      {(s.status || "Completed").toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "saved stations" && (
        <div style={styles.stationGrid}>
          {savedStations.map(s => (
            <div key={s.id} style={styles.card}>
              <p style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0' }}>{s.name}</p>
              <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px 0' }}>{s.location}</p>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#00C853' }}>{s.status.toUpperCase()}</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#999' }}>{s.distance.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => navigate(`/station/${s.id}`)}
                  style={styles.outlineBtn}
                >
                  VIEW DETAILS
                </button>
                <button 
                  onClick={() => window.open('https://maps.google.com', '_blank')}
                  style={styles.outlineBtn}
                >
                  DIRECTIONS
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f5f5",
    padding: "40px",
    fontFamily: "'Inter', sans-serif",
    color: "#1a1a1a",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: "#666",
    margin: "8px 0 0",
    fontSize: "15px",
  },
  findBtn: {
    background: "#00C853",
    color: "#fff",
    border: "none",
    padding: "14px 28px",
    borderRadius: "4px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    letterSpacing: "0.05em",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
    marginBottom: "48px",
  },
  statCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #e0e0e0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  statTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statTrend: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#00C853",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "800",
    margin: 0,
    letterSpacing: "-0.03em",
  },
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
    fontWeight: "700",
    fontSize: "13px",
    letterSpacing: "0.1em",
    cursor: "pointer",
  },
  activeTab: {
    color: "#00C853",
    borderBottom: "2px solid #00C853",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "1.8fr 1fr",
    gap: "24px",
  },
  card: {
    background: "#fff",
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid #e0e0e0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  cardTitle: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 24px 0",
  },
  chartArea: {
    display: "flex",
    gap: "20px",
    height: "200px",
    alignItems: "flex-end",
  },
  barWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  bar: {
    width: "100%",
    background: "#00C853",
    borderRadius: "2px",
  },
  barLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#999",
    textAlign: "center",
  },
  actionBtn: {
    background: "#00C853",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "4px",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
  },
  sessionItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e0e0e0",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    background: "#fafafa",
    padding: "16px 24px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "800",
    color: "#999",
    textTransform: "uppercase",
    borderBottom: "1px solid #e0e0e0",
  },
  tr: { borderBottom: "1px solid #f9f9f9" },
  td: { padding: "20px 24px", fontSize: "14px", fontWeight: "600" },
  badge: {
    padding: "4px 8px",
    fontSize: "10px",
    fontWeight: "800",
  },
  stationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  outlineBtn: {
    background: "transparent",
    border: "1px solid #e0e0e0",
    padding: "10px 16px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default UserDashboard;
