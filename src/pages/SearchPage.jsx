import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockNgoCards, mockVolunteerCards } from "../data/presentationData";
import { db } from "../lib/firebase";

function SearchPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("ngo");
  const [term, setTerm] = useState("");
  const [ngos, setNgos] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    const unsubscribeNgos = onSnapshot(collection(db, "ngos"), (snapshot) => {
      const live = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
      setNgos(live.length ? live : mockNgoCards);
    });
    const unsubscribeVolunteers = onSnapshot(collection(db, "volunteers"), (snapshot) => {
      const live = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
      setVolunteers(live.length ? live : mockVolunteerCards);
    });

    return () => {
      unsubscribeNgos();
      unsubscribeVolunteers();
    };
  }, []);

  const rows = mode === "ngo" ? ngos : volunteers;
  const filteredRows = useMemo(
    () =>
      rows.filter((item) =>
        `${item.name || ""} ${item.ngoName || ""} ${item.location || ""} ${item.officeAddress || ""}`
          .toLowerCase()
          .includes(term.trim().toLowerCase()),
      ),
    [rows, term],
  );

  return (
    <div className="v2-search-page">
      <section className="v2-search-head">
        <p className="v2-kicker">Discover people and organisations</p>
        <h1>Search verified NGOs and volunteers</h1>
        <div className="v2-search-bar">
          <input onChange={(event) => setTerm(event.target.value)} placeholder="Search by name or area" value={term} />
        </div>
        <div className="v2-dashboard-tabs">
          <button className={mode === "ngo" ? "active" : ""} onClick={() => setMode("ngo")} type="button">
            NGOs
          </button>
          <button className={mode === "volunteer" ? "active" : ""} onClick={() => setMode("volunteer")} type="button">
            Volunteers
          </button>
        </div>
      </section>

      <section className="v2-search-results">
        {filteredRows.length ? (
          filteredRows.map((item) => (
            <button
              className="v2-search-card"
              key={item.id}
              onClick={() => navigate(`/profile/${mode === "ngo" ? "ngo" : "volunteer"}/${item.id}`)}
              type="button"
            >
              <span className="v2-search-avatar">
                {item.logo || item.photo || (item.ngoName || item.name || "R").slice(0, 2).toUpperCase()}
              </span>
              <div>
                <strong>{item.ngoName || item.name}</strong>
                <p>{item.officeAddress || item.location || "Location unavailable"}</p>
                <small>
                  {mode === "ngo"
                    ? `Trust ${item.trustScore || "new"} · ${(item.services || []).slice(0, 2).join(", ")}`
                    : `Rating ${item.rating || "new"} · ${(item.skills || []).slice(0, 2).join(", ")}`}
                </small>
              </div>
            </button>
          ))
        ) : (
          <div className="empty-state">No results found.</div>
        )}
      </section>
    </div>
  );
}

export default SearchPage;
