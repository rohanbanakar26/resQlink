import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { problemDomains } from "../data/appContent";
import { uiProblemCategories } from "../data/presentationData";
function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, profile, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <>
      {isMenuOpen && (
        <div className="zip-overlay" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
      )}
      
      <div className={`zip-side-drawer ${isMenuOpen ? "open" : ""}`}>
        <div className="zip-drawer-header">
          <span className="zip-drawer-title">Community Needs</span>
          <button className="zip-close-button" onClick={() => setIsMenuOpen(false)} type="button">
            ✕
          </button>
        </div>
        <nav className="zip-drawer-nav">
          {problemDomains.map((domain) => {
            const categoryMeta = uiProblemCategories.find(c => c.id === domain.category) || uiProblemCategories[0];
            return (
              <button
                key={domain.slug}
                className="zip-drawer-link"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate(`/domain/${domain.slug}`);
                }}
                type="button"
              >
                <span className="emoji">{categoryMeta.emoji}</span>
                {domain.shortTitle}
              </button>
            );
          })}
        </nav>
      </div>

      <header className="zip-header">
        <div className="zip-header-inner">
          <div className="zip-header-left">
            <button 
              className="zip-hamburger-button" 
              onClick={() => setIsMenuOpen(true)}
              type="button"
              aria-label="Open menu"
            >
              ☰
            </button>
            <Link className="zip-brand" to={currentUser ? "/app" : "/"}>
              <div className="zip-brand-badge">R</div>
              <div className="zip-brand-copy">
                <strong>ResQLink</strong>
                <span>Smart Resource Allocation</span>
              </div>
            </Link>
          </div>

        <div className="zip-header-actions">
          <button className="zip-circle-button" onClick={() => navigate("/search")} type="button">
            Search
          </button>
          {currentUser && (
            <button className="zip-circle-button notif-dot" onClick={() => navigate("/news")} type="button">
              Alerts
            </button>
          )}

          {loading ? (
            <div className="zip-user-menu" style={{ opacity: 0 }}>
              <button className="zip-profile-button" type="button" disabled>
                <span className="zip-user-avatar" />
              </button>
            </div>
          ) : currentUser ? (
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
    </>
  );
}

export default AppHeader;
