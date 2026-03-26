import { NavLink, useLocation } from "react-router-dom";

const items = [
  { to: "/app", label: "Home", icon: "⌂" },
  { to: "/search", label: "Search", icon: "⌕" },
  { to: "/news", label: "News", icon: "◫" },
  { to: "/about", label: "About", icon: "i" },
  { to: "/profile", label: "Profile", icon: "◉" },
];

function BottomNav() {
  const location = useLocation();

  if (location.pathname === "/" || location.pathname === "/auth") {
    return null;
  }

  return (
    <nav className="zip-bottom-nav">
      <div className="zip-bottom-nav-inner">
        {items.map((item) => (
          <NavLink className="zip-bottom-link" key={item.to} to={item.to}>
            {({ isActive }) => (
              <>
                <span className={isActive ? "zip-bottom-icon active" : "zip-bottom-icon"}>{item.icon}</span>
                <span className={isActive ? "zip-bottom-label active" : "zip-bottom-label"}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
