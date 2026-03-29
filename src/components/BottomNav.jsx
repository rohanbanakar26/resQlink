import { NavLink, useLocation } from "react-router-dom";

const items = [
  { to: "/emergency", label: "Emergency", icon: "🚨" },
  { to: "/requests", label: "Requests", icon: "📶" },
  { to: "/map", label: "Map", icon: "🗺️" },
  { to: "/network", label: "Network", icon: "🤝" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

function BottomNav() {
  const location = useLocation();

  if (location.pathname === "/" || location.pathname === "/auth") {
    return null;
  }

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink className="bottom-link" key={item.to} to={item.to}>
          {({ isActive }) => (
            <>
              <span className={`bottom-icon ${isActive ? "active" : ""}`}>{item.icon}</span>
              <span className={`bottom-label ${isActive ? "active" : ""}`}>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
