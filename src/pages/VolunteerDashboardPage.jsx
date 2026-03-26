import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import {
  formatCoordinates,
  formatDistance,
  getDirectionsUrl,
  haversineDistance,
  watchCurrentPosition,
} from "../utils/geo";

function VolunteerDashboardPage() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [volunteer, setVolunteer] = useState(null);
  const [notification, setNotification] = useState("");
  const seenTaskIdsRef = useRef([]);

  useEffect(() => {
    const unsubscribeVolunteer = onSnapshot(doc(db, "volunteers", currentUser.uid), (snapshot) => {
      setVolunteer(snapshot.exists() ? snapshot.data() : null);
    });
    const tasksQuery = query(collection(db, "problems"), where("volunteerId", "==", currentUser.uid));
    const unsubscribeProblems = onSnapshot(tasksQuery, (snapshot) => {
      const rows = snapshot.docs
        .map((docItem) => ({ id: docItem.id, ...docItem.data() }))
        .filter((problem) => problem.status !== "completed");
      const currentIds = rows.map((row) => row.id);
      if (seenTaskIdsRef.current.length && currentIds.some((taskId) => !seenTaskIdsRef.current.includes(taskId))) {
        setNotification("New task assigned nearby");
      }
      seenTaskIdsRef.current = currentIds;
      setTasks(rows);
    });
    return () => {
      unsubscribeVolunteer();
      unsubscribeProblems();
    };
  }, [currentUser.uid]);

  useEffect(() => {
    const watchId = watchCurrentPosition(
      async (coords) => {
        await updateDoc(doc(db, "volunteers", currentUser.uid), {
          location: coords,
          updatedAt: serverTimestamp(),
        });
      },
      () => {},
    );
    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, [currentUser.uid]);

  const enrichedTasks = useMemo(
    () =>
      tasks.map((task) => {
        const distance = haversineDistance(task.location, volunteer?.location);
        return {
          ...task,
          directionsUrl: getDirectionsUrl(task.location, volunteer?.location),
          distanceLabel: formatDistance(distance),
        };
      }),
    [tasks, volunteer],
  );

  const handleAccept = async (taskId) => {
    await updateDoc(doc(db, "problems", taskId), {
      status: "assigned",
      acceptedAt: serverTimestamp(),
    });
  };

  const handleComplete = async (taskId) => {
    await updateDoc(doc(db, "problems", taskId), {
      status: "completed",
    });
  };

  return (
    <div className="v2-volunteer-page">
      <section className="v2-dashboard-hero">
        <div>
          <p className="v2-kicker">Volunteer queue</p>
          <h1>Move quickly. Keep the task list simple.</h1>
          <p>Accept, navigate, and complete work without digging through crowded screens.</p>
        </div>
        <div className="v2-dashboard-metrics">
          <div>
            <strong>{enrichedTasks.length}</strong>
            <span>active tasks</span>
          </div>
          <div>
            <strong>{volunteer?.vehicleAvailability || "None"}</strong>
            <span>vehicle</span>
          </div>
          <div>
            <strong>{volunteer?.availability || volunteer?.available ? "Online" : "Offline"}</strong>
            <span>status</span>
          </div>
        </div>
      </section>

      {notification && <div className="alert-banner">{notification}</div>}

      <section className="v2-request-stack">
        {enrichedTasks.length ? (
          enrichedTasks.map((task) => (
            <article className="v2-request-card" key={task.id}>
              <div className="v2-request-top">
                <div>
                  <strong>{task.category}</strong>
                  <p>{task.description || "No extra notes."}</p>
                  <small>{formatCoordinates(task.location)} · {task.distanceLabel}</small>
                </div>
                <span className={`v2-status-tag ${task.urgency}`}>{task.urgency}</span>
              </div>
              <div className="v2-request-actions">
                <button className="v2-secondary-button" onClick={() => handleAccept(task.id)} type="button">
                  Accept
                </button>
                {task.directionsUrl ? (
                  <a className="v2-secondary-button" href={task.directionsUrl} rel="noreferrer" target="_blank">
                    Navigate
                  </a>
                ) : null}
                <button className="v2-primary-button" onClick={() => handleComplete(task.id)} type="button">
                  Complete
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">No assigned tasks yet.</div>
        )}
      </section>
    </div>
  );
}

export default VolunteerDashboardPage;
