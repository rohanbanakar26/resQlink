import { useMemo } from "react";
import MapPanel from "../components/MapPanel";
import StatusPill from "../components/StatusPill";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { getCategoryMeta } from "../data/system";
import { formatDistance, getDirectionsUrl, haversineDistance } from "../utils/geo";

function RequestCard({ request, role, volunteers, location, onAccept, onAssign, onAdvance, onComplete }) {
  const matchedDistance = haversineDistance(location, request.location);

  return (
    <article className="request-card">
      <div className="request-card-top">
        <div>
          <strong>{getCategoryMeta(request.category).label}</strong>
          <p>{request.description || "No additional details."}</p>
        </div>
        <StatusPill status={request.status} />
      </div>

      <div className="request-meta">
        <span>{formatDistance(matchedDistance)}</span>
        <span>Volunteer: {request.volunteerName || "Not yet assigned"}</span>
        <span>NGO: {request.ngoName || "Open network"}</span>
      </div>

      <div className="request-actions">
        {role === "ngo" ? (
          <>
            <button className="ghost-button" onClick={() => onAccept(request.id)} type="button">
              Accept
            </button>
            <select defaultValue="" onChange={(event) => onAssign(request.id, event.target.value)}>
              <option value="">Assign volunteer</option>
              {volunteers.map((volunteer) => (
                <option key={volunteer.id} value={volunteer.id}>
                  {volunteer.name}
                </option>
              ))}
            </select>
            <button className="primary-button" onClick={() => onComplete(request.id)} type="button">
              Complete
            </button>
          </>
        ) : null}

        {role === "volunteer" ? (
          <>
            <button className="ghost-button" onClick={() => onAdvance(request.id, "Accepted")} type="button">
              Accept
            </button>
            <button className="ghost-button" onClick={() => onAdvance(request.id, "In progress")} type="button">
              Start
            </button>
            <a className="ghost-button" href={getDirectionsUrl(request.location, location)} rel="noreferrer" target="_blank">
              Navigate
            </a>
            <button className="primary-button" onClick={() => onComplete(request.id)} type="button">
              Complete
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}

function RequestsPage() {
  const { profile } = useAuth();
  const {
    location,
    requests,
    myRequests,
    nearbyRequests,
    volunteers,
    acceptRequest,
    assignVolunteer,
    volunteerAdvance,
    completeRequest,
    ngos,
  } = useAppData();

  const role = profile?.role ?? "citizen";

  const visibleRequests = useMemo(() => {
    if (role === "citizen") {
      return myRequests;
    }

    if (role === "volunteer") {
      return myRequests.length ? myRequests : nearbyRequests.slice(0, 8);
    }

    return requests;
  }, [myRequests, nearbyRequests, requests, role]);

  return (
    <div className="page-stack">
      <section className="hero-card compact">
        <div>
          <span className="section-label">
            {role === "ngo" ? "NGO dashboard" : role === "volunteer" ? "Volunteer queue" : "Your requests"}
          </span>
          <h1>
            {role === "ngo"
              ? "Coordinate requests, assign people, and clear the queue."
              : role === "volunteer"
                ? "See assigned work and nearby requests in real time."
                : "Follow your request live from submission to completion."}
          </h1>
        </div>
        <div className="hero-kpis">
          <div className="stat-card">
            <strong>{visibleRequests.length}</strong>
            <span>{role === "ngo" ? "incoming" : "visible requests"}</span>
          </div>
          <div className="stat-card">
            <strong>{ngos.length}</strong>
            <span>NGOs ready</span>
          </div>
          <div className="stat-card">
            <strong>{volunteers.filter((item) => item.available || item.availability).length}</strong>
            <span>volunteers online</span>
          </div>
        </div>
      </section>

      <section className="request-layout">
        <div className="request-list">
          {visibleRequests.length ? (
            visibleRequests.map((request) => (
              <RequestCard
                key={request.id}
                location={location}
                onAccept={acceptRequest}
                onAdvance={volunteerAdvance}
                onAssign={assignVolunteer}
                onComplete={completeRequest}
                request={request}
                role={role}
                volunteers={volunteers.filter((item) => item.available || item.availability)}
              />
            ))
          ) : (
            <div className="card empty-card">
              <strong>No live requests here yet.</strong>
              <p>The feed will update instantly when a new request is reported.</p>
            </div>
          )}
        </div>

        <MapPanel
          ngos={ngos.slice(0, 10)}
          requests={visibleRequests.slice(0, 20)}
          title="Live request map"
          userLocation={location}
          volunteers={volunteers.slice(0, 10)}
        />
      </section>
    </div>
  );
}

export default RequestsPage;
