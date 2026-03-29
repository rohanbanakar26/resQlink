import { useNavigate } from "react-router-dom";
import MapPanel from "../components/MapPanel";
import StatusPill from "../components/StatusPill";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { REQUEST_CATEGORIES, getCategoryMeta } from "../data/system";

function EmergencyPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { myRequests, nearbyRequests, volunteers, ngos, location } = useAppData();

  const latestOwnRequest = myRequests[0];

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <span className="section-label">Emergency mode</span>
          <h1>Fast actions first. Everything else comes after help is moving.</h1>
          <p>
            Report a need from the sticky emergency button, then follow assignment, ETA, and completion
            live from one place.
          </p>
        </div>
        <div className="hero-kpis">
          <div className="stat-card">
            <strong>{nearbyRequests.length}</strong>
            <span>active nearby</span>
          </div>
          <div className="stat-card">
            <strong>{volunteers.filter((item) => item.available || item.availability).length}</strong>
            <span>volunteers online</span>
          </div>
          <div className="stat-card">
            <strong>{ngos.length}</strong>
            <span>NGOs online</span>
          </div>
        </div>
      </section>

      {profile?.role === "citizen" ? (
        <section className="split-grid">
          <article className="card status-card">
            <div className="section-head">
              <div>
                <span className="section-label">Your request</span>
                <h2>Track your active help status</h2>
              </div>
              {latestOwnRequest ? <StatusPill status={latestOwnRequest.status} /> : null}
            </div>
            {latestOwnRequest ? (
              <div className="timeline-card">
                <strong>{getCategoryMeta(latestOwnRequest.category).label}</strong>
                <p>{latestOwnRequest.description || "No additional description."}</p>
                <div className="timeline-meta">
                  <span>Volunteer: {latestOwnRequest.volunteerName || "Matching..."}</span>
                  <span>ETA: {latestOwnRequest.etaMinutes ? `${latestOwnRequest.etaMinutes} mins` : "Pending"}</span>
                </div>
              </div>
            ) : (
              <p className="muted-copy">No active request yet. Use the emergency button to send one.</p>
            )}
          </article>

          <article className="card">
            <div className="section-head">
              <div>
                <span className="section-label">Nearby help</span>
                <h2>Response options around your location</h2>
              </div>
            </div>
            <div className="mini-list">
              {ngos.slice(0, 3).map((ngo) => (
                <button className="mini-row" key={ngo.id} onClick={() => navigate("/network")} type="button">
                  <strong>{ngo.ngoName}</strong>
                  <span>Trust {ngo.trustScore || 4.5}</span>
                </button>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      <section className="card">
        <div className="section-head">
          <div>
            <span className="section-label">Categories</span>
            <h2>Jump straight into the right type of request</h2>
          </div>
        </div>
        <div className="category-grid compact">
          {REQUEST_CATEGORIES.map((item) => (
            <button
              className="category-card compact"
              key={item.id}
              onClick={() => navigate(`/emergency?compose=1&category=${item.id}`)}
              type="button"
            >
              <span className="category-emoji">{item.emoji}</span>
              <strong>{item.label}</strong>
              <p>{item.summary}</p>
            </button>
          ))}
        </div>
      </section>

      <MapPanel
        ngos={ngos.slice(0, 15)}
        requests={nearbyRequests.slice(0, 20)}
        title="Nearby emergencies, NGOs, and volunteers"
        userLocation={location}
        volunteers={volunteers.slice(0, 20)}
      />
    </div>
  );
}

export default EmergencyPage;
