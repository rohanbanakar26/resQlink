import StatusPill from "./StatusPill";
import { formatCoordinates } from "../utils/geo";

function TaskList({ tasks, onAccept, onComplete }) {
  if (!tasks.length) {
    return <div className="empty-state">No assigned tasks yet.</div>;
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <article className="task-card" key={task.id}>
          <div className="task-card-header">
            <div>
              <p className="eyebrow">{task.category}</p>
              <h3>{formatCoordinates(task.location)}</h3>
            </div>
            <StatusPill value={task.status} />
          </div>

          <p className="task-note">{task.description || "No extra notes."}</p>
          <div className="task-meta">
            <span>Urgency: {task.urgency}</span>
            <span>Distance: {task.distanceLabel || "Estimating..."}</span>
          </div>

          <div className="task-actions">
            <button className="ghost-button" onClick={() => onAccept(task.id)} type="button">
              Accept task
            </button>
            <button className="success-button" onClick={() => onComplete(task.id)} type="button">
              Mark completed
            </button>
            {task.directionsUrl && (
              <a className="ghost-button" href={task.directionsUrl} rel="noreferrer" target="_blank">
                Navigate
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export default TaskList;
