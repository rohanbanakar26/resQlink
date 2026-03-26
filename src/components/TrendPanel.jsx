function TrendPanel({ zones }) {
  return (
    <section className="panel trend-panel wow-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Trend graph</p>
          <h2>Zone momentum</h2>
        </div>
      </div>

      <div className="trend-list">
        {zones.length ? (
          zones.slice(0, 6).map((zone) => (
            <div className="trend-row" key={zone.id}>
              <div>
                <strong>{zone.id}</strong>
                <span>
                  {zone.trend} | {zone.recentReports} recent reports
                </span>
              </div>
              <div className="trend-bar">
                <div
                  className="trend-fill"
                  style={{ width: `${Math.min(zone.priorityScore / 4, 100)}%` }}
                />
              </div>
              <span className="heat-score">{zone.priorityScore}</span>
            </div>
          ))
        ) : (
          <div className="empty-state">No analytics zones yet.</div>
        )}
      </div>
    </section>
  );
}

export default TrendPanel;
