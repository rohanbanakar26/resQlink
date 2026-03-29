import { useEffect, useMemo, useState } from "react";
import { REQUEST_CATEGORIES, URGENCY_OPTIONS, getCategoryMeta } from "../data/system";
import { useAppData } from "../context/AppDataContext";

function EmergencyForm({ open, onClose, request }) {
  const { location, locationError, updateRequestDetails } = useAppData();
  const [category, setCategory] = useState("general");
  const [urgency, setUrgency] = useState("critical");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!request) {
      return;
    }

    setCategory(request.category || "general");
    setUrgency(request.urgency || "critical");
    setDescription(request.description || "");
    setPhotoFile(null);
    setError("");
  }, [request]);

  const categoryMeta = useMemo(() => getCategoryMeta(category), [category]);

  if (!open || !request) {
    return null;
  }

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateRequestDetails(request.id, {
        category,
        urgency,
        description: description.trim(),
        photoFile,
      });
      onClose();
    } catch (saveError) {
      setError(saveError.message || "Unable to update request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sheet-overlay" role="presentation">
      <div className="bottom-sheet">
        <div className="sheet-handle" />
        <div className="sheet-head compact">
          <div>
            <span className="section-label emergency-label">Edit request</span>
            <h2>{categoryMeta.label}</h2>
          </div>
          <button className="ghost-button" onClick={onClose} type="button">
            Done
          </button>
        </div>

        <form className="sheet-form" onSubmit={handleSave}>
          <div className="form-grid">
            <label>
              Category
              <select onChange={(event) => setCategory(event.target.value)} value={category}>
                {REQUEST_CATEGORIES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
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
            <label className="full-span">
              Note
              <textarea
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add details responders should know"
                rows="3"
                value={description}
              />
            </label>
            <label className="full-span">
              Image
              <input
                accept="image/*"
                onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                type="file"
              />
            </label>
            <label className="full-span">
              GPS
              <input
                disabled
                value={
                  location
                    ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                    : "Waiting for GPS"
                }
              />
            </label>
          </div>

          {(error || locationError) && <div className="form-alert">{error || locationError}</div>}

          <button className="danger-button full-width" disabled={saving} type="submit">
            {saving ? "Saving..." : "Update request"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmergencyForm;
