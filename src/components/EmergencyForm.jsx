import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { getCurrentPosition } from "../utils/geo";
import {
  calculateProblemPriority,
  getAnalyticsSnapshotForLocation,
  upsertAnalyticsForProblem,
} from "../utils/analytics";
import { findBestVolunteer } from "../utils/matching";

const defaultForm = {
  category: "food-shortage",
  urgency: "critical",
  description: "",
};

function EmergencyForm({ domain }) {
  const [form, setForm] = useState({
    ...defaultForm,
    category: domain?.category || defaultForm.category,
  });
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [extras, setExtras] = useState({});

  useEffect(() => {
    setForm((current) => ({
      ...current,
      category: domain?.category || defaultForm.category,
    }));
    setExtras({});
  }, [domain]);

  useEffect(() => {
    getCurrentPosition()
      .then((coords) => setLocation(coords))
      .catch((error) => {
        setMessage(error.message || "Unable to read live location.");
        setLocation(null);
      });
  }, []);

  const handleVoiceInput = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setMessage("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.start();
    setVoiceEnabled(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setForm((current) => ({ ...current, description: transcript }));
      setVoiceEnabled(false);
    };

    recognition.onerror = () => {
      setVoiceEnabled(false);
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const liveLocation = await getCurrentPosition();
      const currentAnalytics = await getAnalyticsSnapshotForLocation(liveLocation);
      const projectedFrequency = (currentAnalytics.frequency ?? 0) + 1;
      const projectedRecentReports =
        currentAnalytics.trend === "rising" ? 3 : currentAnalytics.frequency ? 2 : 1;
      const priorityScore = calculateProblemPriority({
        urgency: form.urgency,
        category: form.category,
        frequency: projectedFrequency,
        recentReports: projectedRecentReports,
      });

      const problemRef = await addDoc(collection(db, "problems"), {
        category: form.category,
        urgency: form.urgency,
        location: liveLocation,
        description: form.description.trim(),
        extraDetails: extras,
        status: "pending",
        volunteerId: "",
        priorityScore,
        timestamp: serverTimestamp(),
      });
      await upsertAnalyticsForProblem({
        category: form.category,
        urgency: form.urgency,
        location: liveLocation,
      });

      const volunteerSnapshot = await getDocs(collection(db, "volunteers"));
      const volunteers = volunteerSnapshot.docs.map((volunteer) => ({
        id: volunteer.id,
        ...volunteer.data(),
      }));
      const bestVolunteer = findBestVolunteer(
        {
          category: form.category,
          urgency: form.urgency,
          location: liveLocation,
          priorityScore,
        },
        volunteers,
      );

      await updateDoc(doc(db, "problems", problemRef.id), {
        analyticsSynced: true,
        status: bestVolunteer ? "assigned" : "pending",
        volunteerId: bestVolunteer?.id ?? "",
      });
      setMessage(
        bestVolunteer
          ? `Report captured, prioritized, and assigned to ${bestVolunteer.name}.`
          : "Problem captured and prioritized. No available volunteer matched instantly.",
      );

      setForm({
        ...defaultForm,
        category: domain?.category || defaultForm.category,
      });
      setExtras({});
    } catch (error) {
      setMessage(error.message || "Unable to submit emergency.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="panel emergency-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{domain ? "Domain request" : "Emergency intake"}</p>
          <h2>{domain ? domain.cta : "File a new incident"}</h2>
        </div>
        <button className="voice-button" onClick={handleVoiceInput} type="button">
          {voiceEnabled ? "Listening..." : "Voice note"}
        </button>
      </div>

      <div className="form-grid">
        <label>
          Category
          <select
            disabled={Boolean(domain)}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            value={form.category}
          >
            <option value="food-shortage">Food shortage</option>
            <option value="senior-help">Senior citizen daily help</option>
            <option value="disaster-relief">Disaster relief coordination</option>
            <option value="education-support">Education support drives</option>
            <option value="cleanliness-drive">City cleanliness drives</option>
          </select>
        </label>

        <label>
          Urgency
          <select
            onChange={(event) => setForm((current) => ({ ...current, urgency: event.target.value }))}
            value={form.urgency}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>

        <label className="full-span">
          Live GPS
          <input
            disabled
            placeholder="Waiting for current location..."
            value={
              location
                ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                : "GPS required for dispatch"
            }
          />
        </label>

        <label className="full-span">
          Description
          <textarea
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Describe the situation briefly."
            rows="4"
            value={form.description}
          />
        </label>

        {domain?.fields?.map((field) => (
          <label className="full-span" key={field.id}>
            {field.label}
            {field.type === "select" ? (
              <select
                onChange={(event) =>
                  setExtras((current) => ({ ...current, [field.id]: event.target.value }))
                }
                value={extras[field.id] || ""}
              >
                <option value="">Select</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                onChange={(event) =>
                  setExtras((current) => ({ ...current, [field.id]: event.target.value }))
                }
                type={field.type}
                value={extras[field.id] || ""}
              />
            )}
          </label>
        ))}
      </div>

      <button
        className="danger-button large-button"
        disabled={submitting || !location}
        type="submit"
      >
        {submitting ? "Submitting..." : domain?.cta || "Dispatch Emergency"}
      </button>

      {message && <p className="form-message">{message}</p>}
    </form>
  );
}

export default EmergencyForm;
