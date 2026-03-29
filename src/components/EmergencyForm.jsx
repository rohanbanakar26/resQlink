import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { REQUEST_CATEGORIES, URGENCY_OPTIONS, getCategoryMeta } from "../data/system";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

function EmergencyForm({ open, onClose, initialCategory = "medical" }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createEmergency, location, locationError } = useAppData();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(initialCategory);
  const [urgency, setUrgency] = useState("critical");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setCategory(initialCategory);
    setStep(1);
    setError("");
  }, [initialCategory, open]);

  const selectedCategory = useMemo(() => getCategoryMeta(category), [category]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createEmergency({
        category,
        urgency,
        description,
        photoFile,
      });
      onClose();
      navigate("/requests");
    } catch (submitError) {
      setError(submitError.message || "Unable to send the emergency request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="emergency-overlay" role="presentation">
      <div className="emergency-sheet">
        <div className="sheet-head">
          <div>
            <span className="section-label emergency-label">Emergency dispatch</span>
            <h2>Report help needed in under 10 seconds.</h2>
          </div>
          <button className="ghost-button" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <form className="sheet-form" onSubmit={handleSubmit}>
          <div className="stepper">
            <span className={step >= 1 ? "active" : ""}>1. Category</span>
            <span className={step >= 2 ? "active" : ""}>2. Details</span>
            <span className={step >= 3 ? "active" : ""}>3. Send</span>
          </div>

          {step === 1 ? (
            <div className="category-grid">
              {REQUEST_CATEGORIES.map((item) => (
                <button
                  className={`category-card ${category === item.id ? "active" : ""}`}
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  type="button"
                >
                  <span className="category-emoji">{item.emoji}</span>
                  <strong>{item.label}</strong>
                  <p>{item.summary}</p>
                </button>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="form-grid">
              <label>
                Urgency
                <select onChange={(event) => setUrgency(event.target.value)} value={urgency}>
                  {URGENCY_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                GPS location
                <input
                  disabled
                  value={
                    location
                      ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                      : "Waiting for GPS permission"
                  }
                />
              </label>
              <label className="full-span">
                What happened?
                <textarea
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={`Describe the ${selectedCategory.label.toLowerCase()} need briefly.`}
                  rows="4"
                  value={description}
                />
              </label>
              <label className="full-span">
                Optional photo
                <input
                  accept="image/*"
                  onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                  type="file"
                />
              </label>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="review-card">
              <div>
                <span className="section-label">Category</span>
                <strong>{selectedCategory.label}</strong>
              </div>
              <div>
                <span className="section-label">Urgency</span>
                <strong>{urgency}</strong>
              </div>
              <div>
                <span className="section-label">Location</span>
                <strong>
                  {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "GPS pending"}
                </strong>
              </div>
              <p>{description || "No description added."}</p>
            </div>
          ) : null}

          {(error || locationError) && <div className="form-alert">{error || locationError}</div>}

          <div className="sheet-actions">
            {step > 1 ? (
              <button className="ghost-button" onClick={() => setStep((current) => current - 1)} type="button">
                Back
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button className="primary-button" onClick={() => setStep((current) => current + 1)} type="button">
                Continue
              </button>
            ) : (
              <button className="danger-button" disabled={submitting || !location} type="submit">
                {submitting ? "Dispatching..." : "Send emergency"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmergencyForm;
