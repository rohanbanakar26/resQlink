import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../lib/firebase";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const VOLUNTEER_SKILLS = ["medical", "food distribution", "logistics", "rescue"];

function ProfilePage() {
  const { currentUser, profile, saveUserProfile } = useAuth();
  const { myRequests, updateVolunteerAvailability, volunteerAdvance, completeRequest } = useAppData();
  const [roleDoc, setRoleDoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (!currentUser || !profile?.role) {
      return;
    }

    const collectionName =
      profile.role === "ngo" ? "ngos" : profile.role === "volunteer" ? "volunteers" : "citizens";

    getDoc(doc(db, collectionName, currentUser.uid)).then((snapshot) => {
      setRoleDoc(snapshot.exists() ? snapshot.data() : null);
    });
  }, [currentUser, profile?.role]);

  useEffect(() => {
    setName(profile?.name || "");
  }, [profile?.name]);

  useEffect(() => {
    setSkills(roleDoc?.skills || []);
  }, [roleDoc?.skills]);

  const activeCount = myRequests.filter((item) => item.status !== "Completed").length;
  const completedCount = myRequests.filter((item) => item.status === "Completed").length;
  const trustScore = roleDoc?.trustScore || profile?.trustScore || 4.5;

  const headline = useMemo(() => {
    if (profile?.role === "ngo") {
      return "Coordinate the network from one trusted profile.";
    }

    if (profile?.role === "volunteer") {
      return "Stay visible and available when help is needed nearby.";
    }

    return "Keep your profile ready so you can request help faster.";
  }, [profile?.role]);

  const handleSave = async () => {
    setSaving(true);
    await saveUserProfile({ name });
    if (profile?.role === "volunteer" && currentUser) {
      await updateDoc(doc(db, "volunteers", currentUser.uid), {
        skills,
      });
    }
    setSaving(false);
  };

  const toggleSkill = (skill) => {
    setSkills((current) =>
      current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill],
    );
  };

  return (
    <div className="page-stack">
      <section className="hero-card compact">
        <div>
          <span className="section-label">Profile</span>
          <h1>{headline}</h1>
        </div>
        <div className="hero-kpis">
          <div className="stat-card">
            <strong>{activeCount}</strong>
            <span>active tasks</span>
          </div>
          <div className="stat-card">
            <strong>{completedCount}</strong>
            <span>completed</span>
          </div>
          <div className="stat-card">
            <strong>{trustScore}</strong>
            <span>trust score</span>
          </div>
        </div>
      </section>

      <section className="split-grid">
        <article className="card form-stack">
          <div className="profile-head">
            <span className="profile-avatar">{(profile?.name || "R").charAt(0)}</span>
            <div>
              <strong>{profile?.role}</strong>
              <p>{profile?.email}</p>
            </div>
          </div>

          <label>
            Name
            <input onChange={(event) => setName(event.target.value)} value={name} />
          </label>

          {profile?.role === "volunteer" ? (
            <>
              <label className="toggle-row">
                <span>Available for assignments</span>
                <input
                  checked={Boolean(roleDoc?.available || roleDoc?.availability)}
                  onChange={(event) => updateVolunteerAvailability(event.target.checked)}
                  type="checkbox"
                />
              </label>
              <div className="skill-editor">
                {VOLUNTEER_SKILLS.map((skill) => (
                  <button
                    className={skills.includes(skill) ? "skill-chip active" : "skill-chip"}
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    type="button"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <button className="primary-button" disabled={saving} onClick={handleSave} type="button">
            {saving ? "Saving..." : "Save profile"}
          </button>
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <span className="section-label">Capabilities</span>
              <h2>Role-specific details</h2>
            </div>
          </div>
          <div className="detail-stack">
            <div>
              <strong>Location</strong>
              <p>
                {profile?.location?.lat != null
                  ? `${profile.location.lat.toFixed(4)}, ${profile.location.lng.toFixed(4)}`
                  : "Waiting for location permission"}
              </p>
            </div>
            <div>
              <strong>Skills / Services</strong>
              <p>{(roleDoc?.skills || roleDoc?.services || []).join(", ") || "Not added yet"}</p>
            </div>
            <div>
              <strong>Verification</strong>
              <p>{roleDoc?.verificationStatus || "verified"}</p>
            </div>
            <div>
              <strong>Vehicle / Capacity</strong>
              <p>{roleDoc?.vehicleAvailability || roleDoc?.capacity || "Not specified"}</p>
            </div>
          </div>
        </article>
      </section>

      {profile?.role === "volunteer" ? (
        <section className="card">
          <div className="section-head">
            <div>
              <span className="section-label">Active tasks</span>
              <h2>Take action fast</h2>
            </div>
          </div>
          <div className="mini-list">
            {myRequests.length ? (
              myRequests.slice(0, 4).map((request) => (
                <article className="mini-row" key={request.id}>
                  <strong>{request.category}</strong>
                  <span>{request.status}</span>
                  <div className="request-actions">
                    <button className="ghost-button" onClick={() => volunteerAdvance(request.id, "Accepted")} type="button">
                      Accept
                    </button>
                    <button className="primary-button" onClick={() => completeRequest(request.id)} type="button">
                      Complete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="muted-copy">No active tasks.</p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default ProfilePage;
