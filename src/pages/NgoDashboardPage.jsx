import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import AnalyticsMapPanel from "../components/AnalyticsMapPanel";
import CampaignsPanel from "../components/CampaignsPanel";
import MapPanel from "../components/MapPanel";
import TrendPanel from "../components/TrendPanel";
import { mockAnalyticsSummary, mockPendingRequests } from "../data/presentationData";
import { db } from "../lib/firebase";
import { formatCoordinates } from "../utils/geo";
import { buildPriorityZones, getZoneKey } from "../utils/analytics";
import { findBestVolunteer } from "../utils/matching";

function NgoDashboardPage() {
  const [problems, setProblems] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const problemsQuery = query(collection(db, "problems"), orderBy("timestamp", "desc"));
    const unsubscribeProblems = onSnapshot(problemsQuery, (snapshot) => {
      setProblems(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
    });
    const unsubscribeVolunteers = onSnapshot(collection(db, "volunteers"), (snapshot) => {
      setVolunteers(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
    });
    const unsubscribeAnalytics = onSnapshot(collection(db, "analytics"), (snapshot) => {
      setAnalytics(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
    });
    const unsubscribeCampaigns = onSnapshot(collection(db, "campaigns"), (snapshot) => {
      setCampaigns(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
    });

    return () => {
      unsubscribeProblems();
      unsubscribeVolunteers();
      unsubscribeAnalytics();
      unsubscribeCampaigns();
    };
  }, []);

  const priorityZones = useMemo(() => buildPriorityZones(analytics, problems), [analytics, problems]);

  const handleManualAssign = async (problemId, volunteerId) => {
    if (!volunteerId) return;
    await updateDoc(doc(db, "problems", problemId), { status: "assigned", volunteerId });
  };

  const handleAutoAssign = async (problem) => {
    const bestVolunteer = findBestVolunteer(problem, volunteers);
    if (!bestVolunteer) return;
    await updateDoc(doc(db, "problems", problem.id), {
      status: "assigned",
      volunteerId: bestVolunteer.id,
    });
  };

  const handleComplete = async (problemId) => {
    await updateDoc(doc(db, "problems", problemId), { status: "completed" });
  };

  return (
    <div className="v2-ngo-dashboard">
      <section className="v2-dashboard-hero">
        <div>
          <p className="v2-kicker">NGO intelligence</p>
          <h1>See the pressure points before resources are wasted.</h1>
          <p>
            Monitor critical areas, incoming requests, and live allocation from one clear decision surface.
          </p>
        </div>
        <div className="v2-dashboard-metrics">
          <div>
            <strong>{problems.filter((item) => item.status !== "completed").length || 12}</strong>
            <span>active requests</span>
          </div>
          <div>
            <strong>{mockAnalyticsSummary.activeVolunteers}</strong>
            <span>volunteers active</span>
          </div>
          <div>
            <strong>{mockAnalyticsSummary.averageResponseTime}</strong>
            <span>avg response</span>
          </div>
        </div>
      </section>

      <div className="v2-dashboard-tabs">
        {["overview", "requests", "heatmap"].map((tab) => (
          <button
            className={activeTab === tab ? "active" : ""}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <section className="v2-dashboard-grid">
          <div className="v2-surface">
            <div className="v2-section-head left">
              <p className="v2-kicker">Critical areas</p>
              <h2>Where attention is needed most</h2>
            </div>
            <div className="v2-zone-list">
              {(priorityZones.length ? priorityZones.slice(0, 4) : mockAnalyticsSummary.topAreas).map((zone, index) => (
                <article className="v2-zone-row" key={zone.id || zone.area}>
                  <span className="v2-zone-rank">{index + 1}</span>
                  <div>
                    <strong>{zone.location ? formatCoordinates(zone.location) : zone.area}</strong>
                    <p>{zone.trend || zone.mainIssue} · {zone.frequency || zone.reports} reports</p>
                  </div>
                  <span className="v2-score-chip">{zone.priorityScore || zone.score}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="v2-side-stack">
            <div className="v2-surface tight">
              <div className="v2-section-head left">
                <p className="v2-kicker">Suggested actions</p>
                <h2>AI recommendations</h2>
              </div>
              <div className="v2-action-list">
                <article><strong>Critical</strong><p>Deploy food drive to Yamuna Vihar.</p></article>
                <article><strong>High</strong><p>Assign more volunteers to Okhla.</p></article>
                <article><strong>Medium</strong><p>Schedule cleanliness response in Laxmi Nagar.</p></article>
              </div>
            </div>
            <div className="v2-surface tight">
              <div className="v2-section-head left">
                <p className="v2-kicker">Campaign signal</p>
                <h2>Current platform momentum</h2>
              </div>
              <div className="v2-mini-metrics">
                <div><strong>{campaigns.length || 3}</strong><span>campaigns</span></div>
                <div><strong>{volunteers.length || 12}</strong><span>volunteers ready</span></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "requests" && (
        <section className="v2-request-stack">
          {(problems.length ? problems : mockPendingRequests).map((problem) => (
            <article className="v2-request-card" key={problem.id}>
              <div className="v2-request-top">
                <div>
                  <strong>{problem.area || formatCoordinates(problem.location)}</strong>
                  <p>{problem.description}</p>
                </div>
                <span className={`v2-status-tag ${problem.urgency || "medium"}`}>
                  {problem.urgency || "medium"}
                </span>
              </div>
              <div className="v2-request-actions">
                <button className="v2-secondary-button" onClick={() => handleAutoAssign(problem)} type="button">
                  Smart assign
                </button>
                <select defaultValue="" onChange={(event) => handleManualAssign(problem.id, event.target.value)}>
                  <option value="">Assign manually</option>
                  {volunteers.map((volunteer) => (
                    <option key={volunteer.id} value={volunteer.id}>
                      {volunteer.name}
                    </option>
                  ))}
                </select>
                <button className="v2-primary-button" onClick={() => handleComplete(problem.id)} type="button">
                  Complete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {activeTab === "heatmap" && (
        <section className="v2-heatmap-stack">
          <AnalyticsMapPanel zones={priorityZones} />
          <TrendPanel zones={priorityZones} />
          <MapPanel
            problems={problems.filter((problem) =>
              priorityZones.slice(0, 3).some((zone) => zone.id === getZoneKey(problem.location)),
            )}
            title="Live problem map"
          />
          <CampaignsPanel campaigns={campaigns} />
        </section>
      )}
    </div>
  );
}

export default NgoDashboardPage;
