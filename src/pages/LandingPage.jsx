import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { ROLE_OPTIONS } from "../data/system";

function LandingPage() {
  const navigate = useNavigate();
  const { activeRequests, volunteers, ngos, priorityZones } = useAppData();
  const topZone = priorityZones[0];

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="section-label">ResQLink</span>
          <h1>Emergency help should move like a live network, not a static website.</h1>
          <p>
            Citizens report help needed, NGOs coordinate the response, and volunteers move in real time
            from one shared map and request stream.
          </p>
          <div className="hero-actions">
            <button className="danger-button" onClick={() => navigate("/auth")} type="button">
              Start emergency flow
            </button>
            <button className="ghost-button" onClick={() => navigate("/auth")} type="button">
              Join the network
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <strong>{activeRequests.length}</strong>
              <span>live requests</span>
            </div>
            <div className="stat-card">
              <strong>{volunteers.length}</strong>
              <span>volunteers online</span>
            </div>
            <div className="stat-card">
              <strong>{ngos.length}</strong>
              <span>NGOs connected</span>
            </div>
            <div className="stat-card">
              <strong>{topZone?.priorityScore ?? 0}</strong>
              <span>top zone priority</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-badge">Live allocation</div>
          <h2>{topZone?.area || "No hot zone yet"}</h2>
          <p>
            {topZone
              ? `${topZone.activeRequests} active requests are pushing this area to the top of the queue.`
              : "As requests come in, high-pressure areas rise automatically."}
          </p>
          <div className="mini-feed">
            {ROLE_OPTIONS.map((role) => (
              <article className="mini-feed-row" key={role.id}>
                <strong>{role.shortLabel}</strong>
                <span>{role.description}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
