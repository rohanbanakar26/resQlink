import { getCategoryMeta } from "../data/system";

function AlertPanel({ alerts, expanded, onToggle, onViewMap, onRespond }) {
  return (
    <section className="alert-panel-card">
      <button className="alert-panel-toggle" onClick={onToggle} type="button">
        <span>🚨 {alerts.length} critical alerts near you</span>
        <span>{expanded ? "Hide" : "Show"}</span>
      </button>

      {expanded ? (
        <div className="alert-panel-list">
          {alerts.map((alert) => (
            <article className="alert-item" key={alert.id}>
              <div>
                <strong>{getCategoryMeta(alert.category).label}</strong>
                <p>{alert.distanceKm?.toFixed(1) ?? "?"} km away</p>
                <small>
                  {alert.createdAt?.seconds
                    ? new Date(alert.createdAt.seconds * 1000).toLocaleTimeString()
                    : "Just now"}
                </small>
              </div>
              <div className="alert-item-actions">
                <button className="ghost-button" onClick={() => onViewMap(alert)} type="button">
                  View on map
                </button>
                <button className="primary-button" onClick={() => onRespond(alert)} type="button">
                  Respond
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default AlertPanel;
