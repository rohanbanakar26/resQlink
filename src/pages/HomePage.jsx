import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { problemDomains } from "../data/appContent";
import { mockNgoCards } from "../data/presentationData";
import { db } from "../lib/firebase";
import { buildPriorityZones } from "../utils/analytics";

function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [problems, setProblems] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    const problemsQuery = query(collection(db, "problems"), orderBy("timestamp", "desc"));
    const unsubscribeProblems = onSnapshot(problemsQuery, (snapshot) => {
      setProblems(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
    });
    const unsubscribeAnalytics = onSnapshot(collection(db, "analytics"), (snapshot) => {
      setAnalytics(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
    });
    const unsubscribeNgos = onSnapshot(collection(db, "ngos"), (snapshot) => {
      const rows = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
      setNgos(rows.length ? rows : mockNgoCards);
    });

    return () => {
      unsubscribeProblems();
      unsubscribeAnalytics();
      unsubscribeNgos();
    };
  }, []);

  const priorityZones = useMemo(() => buildPriorityZones(analytics, problems), [analytics, problems]);
  const criticalZone = priorityZones[0];
  const recentProblems = problems.slice(0, 3);

  return (
    <div className="v2-home">
      <section className="v2-home-hero">
        <div className="v2-home-copy">
          <p className="v2-kicker">Live community support</p>
          <h1>See what needs attention. Act in seconds.</h1>
          <p>
            Report a need, explore nearby NGOs, or move directly to the most critical area right now.
          </p>
          <div className="v2-home-actions">
            <button className="v2-primary-button" onClick={() => navigate("/report")} type="button">
              Dispatch Emergency
            </button>
            <button className="v2-secondary-button" onClick={() => navigate("/search")} type="button">
              Find NGOs
            </button>
          </div>
        </div>

        <div className="v2-home-command">
          <div className="v2-command-top">
            <span className="live-dot" />
            <strong>Live priority signal</strong>
          </div>
          <h3>{criticalZone?.area || "Yamuna Bank"}</h3>
          <p>{criticalZone?.mainIssue || "Disaster relief"} needs faster action.</p>
          <div className="v2-command-stats">
            <div>
              <strong>{criticalZone?.priorityScore || 91}</strong>
              <span>priority</span>
            </div>
            <div>
              <strong>{criticalZone?.frequency || 12}</strong>
              <span>reports</span>
            </div>
            <div>
              <strong>{ngos.length || 4}</strong>
              <span>NGOs nearby</span>
            </div>
          </div>
          {profile?.role === "ngo" && (
            <button className="v2-inline-link large" onClick={() => navigate("/ngo")} type="button">
              Open intelligence dashboard
            </button>
          )}
        </div>
      </section>

      <section className="v2-home-grid">


        <div className="v2-side-stack">
          <div className="v2-surface tight">
            <div className="v2-section-head left">
              <p className="v2-kicker">Nearby NGOs</p>
              <h2>Trusted response partners</h2>
            </div>
            <div className="v2-mini-list">
              {ngos.slice(0, 3).map((ngo) => (
                <button
                  className="v2-mini-card"
                  key={ngo.id}
                  onClick={() => navigate(`/profile/ngo/${ngo.id}`)}
                  type="button"
                >
                  <span>{ngo.logo || (ngo.ngoName || "N").charAt(0)}</span>
                  <div>
                    <strong>{ngo.ngoName || ngo.name}</strong>
                    <p>{ngo.officeAddress || ngo.location || "Coverage area"}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="v2-surface tight">
            <div className="v2-section-head left">
              <p className="v2-kicker">Recent reports</p>
              <h2>What just came in</h2>
            </div>
            <div className="v2-feed">
              {recentProblems.length ? (
                recentProblems.map((problem) => (
                  <article className="v2-feed-row" key={problem.id}>
                    <div>
                      <strong>{problem.category}</strong>
                      <p>{problem.description || "No description provided."}</p>
                    </div>
                    <span className={`v2-status-tag ${problem.urgency}`}>{problem.urgency}</span>
                  </article>
                ))
              ) : (
                <div className="empty-state">No live reports yet.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
