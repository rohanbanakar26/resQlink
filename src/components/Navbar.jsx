import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { problemDomains } from "../data/appContent";

function Navbar() {
  const navigate = useNavigate();
  const { currentUser, profile, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link className="brand-mark" to="/">
        <span className="brand-dot" />
        <div>
          <p>{t("brand")}</p>
          <span>Smart NGO Response System</span>
        </div>
      </Link>

      <nav className="nav-links">
        <NavLink to="/report">{t("emergencyAction")}</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/news">News</NavLink>
        <NavLink to="/about">About</NavLink>
        {!currentUser && <NavLink to="/auth">{t("login")}</NavLink>}
        {profile?.role === "ngo" && <NavLink to="/ngo">{t("ngoDashboard")}</NavLink>}
        {profile?.role === "volunteer" && (
          <NavLink to="/volunteer">{t("volunteerDashboard")}</NavLink>
        )}
        {currentUser && <NavLink to="/profile">{t("profile")}</NavLink>}
      </nav>

      <div className="nav-actions">
        <select
          aria-label="Problem domain selector"
          className="language-toggle"
          defaultValue=""
          onChange={(event) => event.target.value && navigate(`/domain/${event.target.value}`)}
        >
          <option value="" disabled>
            Problems
          </option>
          {problemDomains.map((domain) => (
            <option key={domain.slug} value={domain.slug}>
              {domain.shortTitle}
            </option>
          ))}
        </select>
        <select
          aria-label="Language selector"
          className="language-toggle"
          onChange={(event) => setLanguage(event.target.value)}
          value={language}
        >
          <option value="en">EN</option>
          <option value="hi">HI</option>
        </select>

        {currentUser ? (
          <button className="ghost-button" onClick={handleLogout} type="button">
            {t("logout")}
          </button>
        ) : (
          <Link className="ghost-button" to="/auth">
            {t("register")}
          </Link>
        )}
      </div>
    </header>
  );
}

export default Navbar;
