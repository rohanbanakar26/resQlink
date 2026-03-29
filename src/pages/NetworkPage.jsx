import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { REQUEST_CATEGORIES } from "../data/system";
import { formatDistance, haversineDistance } from "../utils/geo";

function NetworkPage() {
  const navigate = useNavigate();
  const { ngos, volunteers, location } = useAppData();
  const [mode, setMode] = useState("ngos");
  const [distanceLimit, setDistanceLimit] = useState(25);
  const [category, setCategory] = useState("all");
  const [minTrust, setMinTrust] = useState(0);

  const rows = mode === "ngos" ? ngos : volunteers;

  const filteredRows = useMemo(() => {
    return rows
      .map((item) => {
        const distanceKm = haversineDistance(location, item.location);
        return { ...item, distanceKm };
      })
      .filter((item) => (item.distanceKm == null ? true : item.distanceKm <= distanceLimit))
      .filter((item) => {
        if (category === "all") {
          return true;
        }

        const haystack = [...(item.skills ?? []), ...(item.categoryTags ?? []), ...(item.services ?? [])]
          .join(" ")
          .toLowerCase();
        return haystack.includes(category);
      })
      .filter((item) => Number(item.trustScore ?? item.rating ?? 0) >= minTrust)
      .sort((left, right) => (left.distanceKm ?? 999) - (right.distanceKm ?? 999));
  }, [category, distanceLimit, location, minTrust, rows]);

  return (
    <div className="page-stack">
      <section className="hero-card compact">
        <div>
          <span className="section-label">Smart discovery</span>
          <h1>Recommended near you, filtered by distance, category, availability, and trust.</h1>
        </div>
      </section>

      <section className="card filter-card">
        <div className="tab-row">
          <button className={mode === "ngos" ? "active" : ""} onClick={() => setMode("ngos")} type="button">
            NGOs
          </button>
          <button className={mode === "volunteers" ? "active" : ""} onClick={() => setMode("volunteers")} type="button">
            Volunteers
          </button>
        </div>

        <div className="form-grid">
          <label>
            Distance
            <input
              min="1"
              onChange={(event) => setDistanceLimit(Number(event.target.value))}
              type="range"
              value={distanceLimit}
            />
            <small>{distanceLimit} km</small>
          </label>
          <label>
            Category
            <select onChange={(event) => setCategory(event.target.value)} value={category}>
              <option value="all">All</option>
              {REQUEST_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Minimum trust
            <input
              max="5"
              min="0"
              onChange={(event) => setMinTrust(Number(event.target.value))}
              step="0.5"
              type="range"
              value={minTrust}
            />
            <small>{minTrust.toFixed(1)}+</small>
          </label>
        </div>
      </section>

      <section className="network-grid">
        {filteredRows.map((item) => (
          <button className="network-card" key={item.id} onClick={() => navigate("/profile")} type="button">
            <div className="network-head">
              <strong>{item.ngoName || item.name}</strong>
              <span>{formatDistance(item.distanceKm)}</span>
            </div>
            <p>
              Trust {item.trustScore || item.rating || 4.4} ·{" "}
              {mode === "ngos"
                ? item.verificationStatus || "verified"
                : item.available || item.availability
                  ? "Available now"
                  : "Offline"}
            </p>
            <small>{(item.services || item.skills || item.categoryTags || []).slice(0, 3).join(" · ")}</small>
          </button>
        ))}
      </section>
    </div>
  );
}

export default NetworkPage;
