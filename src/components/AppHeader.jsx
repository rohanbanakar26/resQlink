import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { getCategoryMeta } from "../data/system";

function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, profile, logout } = useAuth();
  const { nearbyCriticalRequests } = useAppData();
  const [panelOpen, setPanelOpen] = useState(false);

  const shouldHideChrome = location.pathname === "/auth";
  const topAlert = nearbyCriticalRequests[0];

  if (shouldHideChrome) {
    return null;
  }

  return (
    <>
      <header className="app-header">
        {topAlert ? (
          <div className="live-alert-banner">
            <button className="alert-button" onClick={() => setPanelOpen((current) => !current)} type="button">
              <span className="live-dot" />
              {nearbyCriticalRequests.length} critical alert{nearbyCriticalRequests.length > 1 ? "s" : ""} near you
            </button>
            <button className="text-button" onClick={() => navigate("/map")} type="button">
              Open map
            </button>
          </div>
        ) : null}

        <div className="header-row">
          <Link className="brand" to={currentUser ? "/emergency" : "/"}>
            <span className="brand-badge">R</span>
            <div>
              <strong>ResQLink</strong>
              <small>Real-time help coordination</small>
            </div>
          </Link>

          <div className="header-actions">
            {currentUser ? (
              <>
                <button className="header-chip" onClick={() => navigate("/network")} type="button">
                  Nearby network
                </button>
                <button className="profile-chip" onClick={() => navigate("/profile")} type="button">
                  <span className="avatar-dot">{(profile?.name || "R").charAt(0)}</span>
                  <span>{profile?.role || "member"}</span>
                </button>
                <button className="ghost-button" onClick={() => logout()} type="button">
                  Logout
                </button>
              </>
            ) : (
              <button className="primary-button" onClick={() => navigate("/auth")} type="button">
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {panelOpen && topAlert ? (
        <div className="alert-panel">
          {nearbyCriticalRequests.slice(0, 4).map((request) => (
            <button
              className="alert-row"
              key={request.id}
              onClick={() => {
                setPanelOpen(false);
                navigate("/requests");
              }}
              type="button"
            >
              <div>
                <strong>{getCategoryMeta(request.category).label}</strong>
                <p>{request.description || "Critical incident reported nearby"}</p>
              </div>
              <span>{request.distanceKm?.toFixed(1) ?? "?"} km</span>
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

export default AppHeader;
