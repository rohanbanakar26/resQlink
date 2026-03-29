import MapPanel from "../components/MapPanel";
import StatusPill from "../components/StatusPill";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { getCategoryMeta } from "../data/system";
import { formatDistance } from "../utils/geo";

function EmergencyPage() {
  const { profile } = useAuth();
  const { myRequests, nearbyRequests, volunteers, ngos, location, emergencyMode, networkOnline } =
    useAppData();

  const latestOwnRequest = myRequests[0];
  const feedRows = profile?.role === "ngo" ? nearbyRequests : myRequests.length ? myRequests : nearbyRequests;

  return (
    <div className="page-stack">
      {!emergencyMode ? (
        <section className="hero-card compact">
          <div>
            <span className="section-label">Command center</span>
            <h1>Report → Assign → Help arrives</h1>
          </div>
          <div className="hero-kpis">
            <div className="stat-card">
              <strong>{nearbyRequests.length}</strong>
              <span>live nearby</span>
            </div>
            <div className="stat-card">
              <strong>{volunteers.filter((item) => item.available || item.availability).length}</strong>
              <span>volunteers</span>
            </div>
            <div className="stat-card">
              <strong>{networkOnline ? "Online" : "Offline"}</strong>
              <span>sync state</span>
            </div>
          </div>
        </section>
      ) : null}

      {profile?.role === "citizen" && latestOwnRequest ? (
        <section className="card status-card">
          <div className="section-head">
            <div>
              <span className="section-label">Active request</span>
              <h2>{getCategoryMeta(latestOwnRequest.category).label}</h2>
            </div>
            <StatusPill status={latestOwnRequest.status} />
          </div>
          <div className="timeline-meta">
            <span>Volunteer: {latestOwnRequest.volunteerName || "Matching"}</span>
            <span>ETA: {latestOwnRequest.etaMinutes ? `${latestOwnRequest.etaMinutes} mins` : "Pending"}</span>
            <span>{latestOwnRequest.distanceLabel || "Distance pending"}</span>
          </div>
        </section>
      ) : null}

      <section className="command-center">
        <MapPanel
          ngos={ngos.slice(0, 20)}
          requests={nearbyRequests.slice(0, 20)}
          title="Live coordination map"
          userLocation={location}
          volunteers={volunteers.slice(0, 20)}
        />

        <section className="card feed-card">
          <div className="section-head">
            <div>
              <span className="section-label">Live feed</span>
              <h2>Requests moving now</h2>
            </div>
          </div>
          <div className="feed-scroll">
            {feedRows.slice(0, 10).map((request) => (
              <article className="feed-item" key={request.id}>
                <div className="feed-item-top">
                  <strong>{getCategoryMeta(request.category).label}</strong>
                  <StatusPill status={request.status} />
                </div>
                <div className="feed-meta">
                  <span>{formatDistance(request.distanceKm)}</span>
                  <span>{request.volunteerName ? `Assigned to ${request.volunteerName}` : "Matching"}</span>
                  <span>{request.etaMinutes ? `ETA ${request.etaMinutes} mins` : "ETA pending"}</span>
                </div>
                {request.matchReasons?.length ? (
                  <small>Why matched: {request.matchReasons.join(" · ")}</small>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

export default EmergencyPage;
