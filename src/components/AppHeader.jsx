import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const showBottomChrome =
    location.pathname !== "/" &&
    location.pathname !== "/auth" &&
    !location.pathname.startsWith("/profile/ngo/") &&
    !location.pathname.startsWith("/profile/volunteer/");

  return (
    <header className="zip-header">
      <div className="zip-header-inner">
        <Link className="zip-brand" to={currentUser ? "/app" : "/"}>
          <div className="zip-brand-badge">R</div>
          <div className="zip-brand-copy">
            <strong>ResQLink</strong>
            <span>Smart Resource Allocation</span>
          </div>
        </Link>

        <div className="zip-header-actions">
          <button className="zip-circle-button" onClick={() => navigate("/search")} type="button">
            Search
          </button>
          {currentUser && (
            <button className="zip-circle-button notif-dot" onClick={() => navigate("/news")} type="button">
              Alerts
            </button>
          )}

          {currentUser ? (
            <div className="zip-user-menu">
              <button className="zip-profile-button" onClick={() => navigate("/profile")} type="button">
                <span className="zip-user-avatar">{(profile?.name || "U").charAt(0)}</span>
                <span className="zip-user-copy">
                  <strong>{profile?.name || "User"}</strong>
                  <small>{profile?.role || "guest"}</small>
                </span>
              </button>
              <button className="ghost-button small-ghost" onClick={handleLogout} type="button">
                Logout
              </button>
            </div>
          ) : (
            <div className="zip-header-actions">
              <button className="ghost-button small-ghost" onClick={() => navigate("/auth")} type="button">
                Login
              </button>
              <button className="danger-button small-danger" onClick={() => navigate("/auth")} type="button">
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {showBottomChrome && location.pathname === "/app" && (
        <div className="zip-live-banner">
          <span>Active alert: critical zones update live as reports are submitted.</span>
          <button className="alert-cta" onClick={() => navigate("/report")} type="button">
            Report
          </button>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
