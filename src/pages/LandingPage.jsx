import { useNavigate } from "react-router-dom";
import { pillars, problemDomains } from "../data/appContent";
import { mockAnalyticsSummary } from "../data/presentationData";

const roleCards = [
  {
    title: "For People",
    description: "Report needs fast, track status live, and discover verified support near you.",
    action: "Report an issue",
  },
  {
    title: "For Volunteers",
    description: "Join nearby response work with skill-based assignments and live task visibility.",
    action: "Join as volunteer",
  },
  {
    title: "For NGOs",
    description: "Coordinate requests, view critical zones, and allocate resources with confidence.",
    action: "Open NGO flow",
  },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="v2-landing">
      <section className="v2-hero">
        <div className="v2-hero-copy">
          <p className="v2-kicker">Real-time civic response</p>
          <h1>When a community needs help, the right NGO should know first.</h1>
          <p className="v2-hero-body">
            ResQLink helps people report urgent needs, helps NGOs see where action matters most,
            and helps volunteers move faster with live assignments.
          </p>
          <div className="v2-hero-actions">
            <button className="v2-primary-button" onClick={() => navigate("/auth")} type="button">
              Report Emergency
            </button>
            <button className="v2-secondary-button" onClick={() => navigate("/auth")} type="button">
              Register NGO
            </button>
          </div>
          <div className="v2-stat-strip">
            <div>
              <strong>{mockAnalyticsSummary.totalUsersHelped.toLocaleString()}+</strong>
              <span>people helped</span>
            </div>
            <div>
              <strong>{mockAnalyticsSummary.activeNGOs}+</strong>
              <span>verified NGOs</span>
            </div>
            <div>
              <strong>{mockAnalyticsSummary.activeVolunteers}+</strong>
              <span>active volunteers</span>
            </div>
            <div>
              <strong>{mockAnalyticsSummary.averageResponseTime}</strong>
              <span>avg response</span>
            </div>
          </div>
        </div>

        <div className="v2-hero-visual">
          <img src="/hero_illo.png" alt="Civic tech community connection" className="v2-hero-image" />
        </div>
      </section>

      <section className="v2-reference-features">
        <div className="v2-ref-card">
          <span className="v2-ref-icon">🛡️</span>
          <strong>Secure Authentication</strong>
          <p>OTP-verified phone numbers for all users</p>
        </div>
        
        <div className="v2-ref-card">
          <span className="v2-ref-icon">⭐</span>
          <strong>Trust Score System</strong>
          <p>Dynamic scores updated after every task completion</p>
        </div>

        <button className="v2-ref-button" onClick={() => navigate("/auth")} type="button">
          Join ResQLink Today →
        </button>

        <div className="v2-ref-footer">
          <div className="v2-ref-brand">
            <span className="v2-ref-brand-icon">R</span>
            ResQLink
          </div>
          <p>Smart Resource Allocation Platform · support@resqlink.in</p>
          <div className="v2-ref-links">
            <button onClick={() => navigate("/about")} type="button">About</button>
            <button onClick={() => navigate("/auth")} type="button">Login</button>
          </div>
        </div>
      </section>

      <section className="v2-foundation-layout">
        <div className="v2-foundation-panel">
          <div className="v2-section-head left">
            <p className="v2-kicker">Why this works</p>
            <h2>Designed for decisions, not just reporting.</h2>
          </div>
          <div className="v2-pillar-list">
            {pillars.map((pillar, index) => (
              <article className="v2-pillar-row" key={pillar}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{pillar}</strong>
                  <p>
                    {pillar === "Centralization" &&
                      "All reports, campaigns, volunteers, and area signals stay in one place."}
                    {pillar === "Real-time updates" &&
                      "Dashboards, assignments, and status changes update instantly."}
                    {pillar === "Smart matching" &&
                      "Assignments consider skill, availability, location, and live priority."}
                    {pillar === "Faster response" &&
                      "Urgent incidents are highlighted early and routed quickly."}
                    {pillar === "Better utilisation" &&
                      "NGOs see where demand is clustering before resources are wasted."}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="v2-role-panel">
          <div className="v2-section-head left">
            <p className="v2-kicker">Who it is for</p>
            <h2>Three actors. One clear flow.</h2>
          </div>
          <div className="v2-role-stack">
            {roleCards.map((card) => (
              <article className="v2-role-card" key={card.title}>
                <strong>{card.title}</strong>
                <p>{card.description}</p>
                <button className="v2-inline-link" onClick={() => navigate("/auth")} type="button">
                  {card.action}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
