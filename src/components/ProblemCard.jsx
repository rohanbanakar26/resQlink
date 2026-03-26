import StatusPill from "./StatusPill";
import { formatCoordinates } from "../utils/geo";

function ProblemCard({
  problem,
  volunteerName,
  distanceLabel,
  onAutoAssign,
  onComplete,
  onManualAssign,
  volunteerOptions,
}) {
  return (
    <article className="problem-card">
      <div className="problem-card-top">
        <div>
          <p className="eyebrow">{problem.category}</p>
          <h3>{formatCoordinates(problem.location)}</h3>
        </div>
        <StatusPill value={problem.status} />
      </div>

      <div className="problem-meta">
        <span>Urgency: {problem.urgency}</span>
        <span>Priority: {problem.priorityScore ?? "Pending"}</span>
        <span>Volunteer: {volunteerName || "Unassigned"}</span>
        <span>Distance: {distanceLabel || "Not available"}</span>
      </div>

      {problem.description && <p className="problem-note">{problem.description}</p>}

      <div className="problem-actions">
        {problem.status !== "completed" && (
          <button className="ghost-button" onClick={() => onAutoAssign(problem)} type="button">
            Smart assign
          </button>
        )}
        <select
          aria-label={`Assign volunteer for ${problem.id}`}
          defaultValue=""
          onChange={(event) => onManualAssign(problem.id, event.target.value)}
        >
          <option disabled value="">
            Assign manually
          </option>
          {volunteerOptions.map((volunteer) => (
            <option key={volunteer.id} value={volunteer.id}>
              {volunteer.name}
            </option>
          ))}
        </select>

        <button className="success-button" onClick={() => onComplete(problem.id)} type="button">
          Mark completed
        </button>
      </div>
    </article>
  );
}

export default ProblemCard;
