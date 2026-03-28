import { doc, getDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { mockNgoCards, mockVolunteerCards } from "../data/presentationData";
import { db } from "../lib/firebase";

function ProfilePage() {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const { currentUser, profile } = useAuth();
  const [volunteerDoc, setVolunteerDoc] = useState(null);
  const [ngoDoc, setNgoDoc] = useState(null);

  const isPublicNgo = type === "ngo" && id;
  const isPublicVolunteer = type === "volunteer" && id;

  useEffect(() => {
    if (isPublicNgo) {
      getDoc(doc(db, "ngos", id)).then((snapshot) => {
        setNgoDoc(snapshot.exists() ? { id, ...snapshot.data() } : mockNgoCards.find((item) => item.id === id) || mockNgoCards[0]);
      });
      return;
    }

    if (isPublicVolunteer) {
      getDoc(doc(db, "volunteers", id)).then((snapshot) => {
        setVolunteerDoc(snapshot.exists() ? { id, ...snapshot.data() } : mockVolunteerCards.find((item) => item.id === id) || mockVolunteerCards[0]);
      });
      return;
    }

    if (profile?.role === "ngo" && currentUser) {
      getDoc(doc(db, "ngos", currentUser.uid)).then((snapshot) => {
        setNgoDoc(snapshot.exists() ? snapshot.data() : mockNgoCards[0]);
      });
    }
    if (profile?.role === "volunteer" && currentUser) {
      getDoc(doc(db, "volunteers", currentUser.uid)).then((snapshot) => {
        setVolunteerDoc(snapshot.exists() ? snapshot.data() : mockVolunteerCards[0]);
      });
    }
  }, [currentUser, id, isPublicNgo, isPublicVolunteer, profile]);

  const activeNgo = useMemo(() => ngoDoc && ({
    ...ngoDoc,
    ngoName: ngoDoc.ngoName || ngoDoc.name,
    logo: ngoDoc.logo || (ngoDoc.ngoName || ngoDoc.name || "N").charAt(0),
    services: ngoDoc.services || [],
  }), [ngoDoc]);

  const activeVolunteer = useMemo(() => volunteerDoc && ({
    ...volunteerDoc,
    photo: volunteerDoc.photo || volunteerDoc.profilePhoto || (volunteerDoc.name || "V").charAt(0),
    skills: volunteerDoc.skills || [],
    location: volunteerDoc.location?.label || (volunteerDoc.location?.lat ? `${volunteerDoc.location.lat.toFixed(4)}, ${volunteerDoc.location.lng.toFixed(4)}` : "Location unavailable"),
  }), [volunteerDoc]);

  const showUserSelf = !isPublicNgo && !isPublicVolunteer && profile?.role === "user";

  return (
    <div className="v2-profile-page">
      <section className="v2-profile-cover">
        {(isPublicNgo || isPublicVolunteer) && (
          <button className="v2-inline-link" onClick={() => navigate(-1)} type="button">
            Back
          </button>
        )}
      </section>

      {showUserSelf && (
        <section className="v2-profile-shell">
          <div className="v2-profile-head">
            <span className="v2-profile-avatar">{(profile?.name || "U").charAt(0)}</span>
            <div>
              <h1>{profile?.name || "User"}</h1>
              <p>{profile?.phone || "Verified account"}</p>
            </div>
          </div>
          <div className="v2-profile-stats">
            <div><strong>1</strong><span>active request</span></div>
            <div><strong>2</strong><span>resolved</span></div>
            <div><strong>4.2</strong><span>trust rating</span></div>
          </div>
        </section>
      )}

      {(isPublicNgo || (!isPublicVolunteer && profile?.role === "ngo")) && activeNgo && (
        <section className="v2-profile-shell">
          <div className="v2-profile-head">
            <span className="v2-profile-avatar square">{String(activeNgo.logo).slice(0, 2).toUpperCase()}</span>
            <div>
              <h1>{activeNgo.ngoName}</h1>
              <p>{activeNgo.officeAddress || "Coverage area"}</p>
            </div>
          </div>
          <div className="v2-profile-stats">
            <div><strong>{activeNgo.trustScore || 4.7}</strong><span>trust score</span></div>
            <div><strong>{activeNgo.totalHelped || 1240}</strong><span>people helped</span></div>
            <div><strong>{activeNgo.activeCampaigns || 3}</strong><span>campaigns</span></div>
          </div>
          <div className="v2-profile-content">
            <div className="tag-cloud">
              {(activeNgo.services || []).map((service) => (
                <span className="tag-pill" key={service}>{service}</span>
              ))}
            </div>
            <p>{activeNgo.description || "Verified NGO profile."}</p>
            <div className="v2-home-actions">
              <button className="v2-primary-button" type="button">Request Support</button>
              <button className="v2-secondary-button" type="button">Follow NGO</button>
            </div>
          </div>
        </section>
      )}

      {(isPublicVolunteer || (!isPublicNgo && profile?.role === "volunteer")) && activeVolunteer && (
        <section className="v2-profile-shell">
          <div className="v2-profile-head">
            <span className="v2-profile-avatar">{String(activeVolunteer.photo).slice(0, 2).toUpperCase()}</span>
            <div>
              <h1>{activeVolunteer.name}</h1>
              <p>{activeVolunteer.location}</p>
            </div>
          </div>
          <div className="v2-profile-stats">
            <div><strong>{activeVolunteer.rating || 4.8}</strong><span>rating</span></div>
            <div><strong>{activeVolunteer.tasksCompleted || 0}</strong><span>tasks done</span></div>
            <div><strong>{activeVolunteer.successRate || "95%"}</strong><span>success rate</span></div>
          </div>
          <div className="v2-profile-content">
            <div className="tag-cloud">
              {(activeVolunteer.skills || []).map((skill) => (
                <span className="tag-pill" key={skill}>{skill}</span>
              ))}
            </div>
            <p>Vehicle: {activeVolunteer.vehicleAvailability || "None"} · NGO: {activeVolunteer.ngo || "Independent volunteer"}</p>
            <div className="v2-home-actions">
              <button className="v2-primary-button" type="button">Contact</button>
              <button className="v2-secondary-button" type="button">Follow</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default ProfilePage;
