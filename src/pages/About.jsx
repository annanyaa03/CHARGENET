import React from "react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.logo}>ChargeNet</div>
        <button 
          onClick={() => navigate("/")}
          style={styles.backBtn}
        >
          Back to Home
        </button>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.sectionLabel}>WHO WE ARE</div>
        <h1 style={styles.mainTitle}>Powering the Future of Electric Mobility</h1>
        <p style={styles.heroSubTitle}>We are building India's most reliable EV charging network.</p>
      </section>

      {/* Mission Section */}
      <section style={styles.missionSection}>
        <div style={styles.container}>
          <div style={styles.flexLayout}>
            <div style={styles.flexLeft}>
              <div style={styles.sectionLabel}>OUR MISSION</div>
              <h2 style={styles.sectionTitle}>Our Mission</h2>
            </div>
            <div style={styles.flexRight}>
              <p style={styles.bodyText}>
                Our mission is to make electric vehicle charging accessible, affordable, and available across every corner of India. We believe that the transition to sustainable energy should be seamless and worry-free for every driver.
              </p>
              <p style={styles.bodyText}>
                By deploying state-of-the-art charging infrastructure and intelligent software tools, we are empowering a new generation of EV owners and station operators to lead the charge toward a greener future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section style={styles.whiteSection}>
        <div style={styles.container}>
          <div style={styles.sectionLabel}>WHAT WE DO</div>
          <h2 style={styles.sectionTitle}>What We Do</h2>
          <div style={styles.list}>
            {[
              { 
                title: "EV Charging Stations", 
                desc: "Strategic deployment of AC and DC fast chargers in urban centers and key highways." 
              },
              { 
                title: "Real-Time Availability", 
                desc: "Live status tracking of every charger across our network via our unified platform." 
              },
              { 
                title: "Charging Session Management", 
                desc: "Seamless payment and session monitoring for a frictionless user experience." 
              },
              { 
                title: "Station Owner Tools", 
                desc: "Comprehensive analytics and management suites for businesses hosting our chargers." 
              }
            ].map((item, idx) => (
              <div key={idx} style={styles.listItem}>
                <div style={styles.itemTitle}>{item.title}</div>
                <div style={styles.itemDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={styles.greySection}>
        <div style={styles.container}>
          <div style={styles.sectionLabel}>OUR VALUES</div>
          <h2 style={styles.sectionTitle}>Our Values</h2>
          <div style={styles.cardRow}>
            {[
              { 
                title: "Reliability", 
                desc: "We prioritize uptime and consistency to ensure you never have to worry about your next charge." 
              },
              { 
                title: "Accessibility", 
                desc: "Designing solutions that work for everyone, from individual drivers to large-scale fleet operators." 
              },
              { 
                title: "Transparency", 
                desc: "Clear pricing and honest communication are at the heart of everything we build." 
              }
            ].map((value, idx) => (
              <div key={idx} style={styles.valueCard}>
                <div style={styles.cardTitle}>{value.title}</div>
                <div style={styles.cardDesc}>{value.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer Strip */}
      <footer style={styles.footerStrip}>
        <div style={styles.footerText}>© 2025 EVCharge. All rights reserved.</div>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    background: "#ffffff",
    color: "#1a1a1a",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: "100vh",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    background: "#ffffff",
    borderBottom: "1px solid #e0e0e0",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a1a",
  },
  backBtn: {
    background: "transparent",
    border: "1px solid #e0e0e0",
    color: "#1a1a1a",
    padding: "8px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  hero: {
    padding: "80px 40px",
    textAlign: "center",
    background: "#ffffff",
  },
  mainTitle: {
    fontSize: "42px",
    fontWeight: "700",
    margin: "20px 0",
    color: "#1a1a1a",
  },
  heroSubTitle: {
    fontSize: "18px",
    color: "#666",
    margin: 0,
  },
  sectionLabel: {
    color: "#00C853",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "3px",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 24px 0",
  },
  bodyText: {
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#444",
    marginBottom: "20px",
  },
  missionSection: {
    padding: "70px 40px",
    background: "#f9f9f9",
  },
  whiteSection: {
    padding: "70px 40px",
    background: "#ffffff",
  },
  greySection: {
    padding: "70px 40px",
    background: "#f9f9f9",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  flexLayout: {
    display: "flex",
    flexWrap: "wrap",
    gap: "40px",
  },
  flexLeft: {
    flex: "1 1 250px",
  },
  flexRight: {
    flex: "2 1 400px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  listItem: {
    padding: "24px 0",
    borderBottom: "1px solid #e0e0e0",
  },
  itemTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  itemDesc: {
    fontSize: "15px",
    color: "#666",
  },
  cardRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
  },
  valueCard: {
    flex: "1 1 250px",
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    padding: "30px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "12px",
  },
  cardDesc: {
    fontSize: "15px",
    color: "#444",
    lineHeight: "1.6",
  },
  footerStrip: {
    padding: "20px 40px",
    background: "#ffffff",
    borderTop: "1px solid #e0e0e0",
    textAlign: "center",
  },
  footerText: {
    color: "#aaa",
    fontSize: "13px",
  },
};

export default About;
