import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AlertPanel from "./AlertPanel";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, profile, logout } = useAuth();
  const { nearbyCriticalRequests, emergencyMode, setEmergencyMode, networkOnline } = useAppData();
  const [panelOpen, setPanelOpen] = useState(false);

  const shouldHideChrome = location.pathname === "/auth";

  if (shouldHideChrome) {
    return null;
  }

  return (
    <>
      <header className="app-header">
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
                <label className="mode-toggle">
                  <span>Emergency mode</span>
                  <input
                    checked={emergencyMode}
                    onChange={(event) => setEmergencyMode(event.target.checked)}
                    type="checkbox"
                  />
                </label>
                <button className="header-chip" onClick={() => navigate("/network")} type="button">
                  {networkOnline ? "Live network" : "Offline mode"}
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

      {nearbyCriticalRequests.length ? (
        <AlertPanel
          alerts={nearbyCriticalRequests.slice(0, 4)}
          expanded={panelOpen}
          onRespond={() => navigate("/requests")}
          onToggle={() => setPanelOpen((current) => !current)}
          onViewMap={() => navigate("/map")}
        />
      ) : null}
    </>
  );
}

export default AppHeader;
