const urgencyWeights = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function HeatmapPanel({ problems }) {
  const grouped = problems.reduce((accumulator, problem) => {
    const key =
      problem.location?.lat != null && problem.location?.lng != null
        ? `${problem.location.lat.toFixed(2)}, ${problem.location.lng.toFixed(2)}`
        : "Unknown area";
    accumulator[key] = (accumulator[key] ?? 0) + (urgencyWeights[problem.urgency] ?? 1);
    return accumulator;
  }, {});

  const rows = Object.entries(grouped).sort((left, right) => right[1] - left[1]);

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Heat signal</p>
          <h2>Crisis density</h2>
        </div>
      </div>

      <div className="heatmap-list">
        {rows.length ? (
          rows.map(([area, score]) => (
            <div className="heat-row" key={area}>
              <div>
                <strong>{area}</strong>
                <span>Weighted urgency score</span>
              </div>
              <div className="heat-bar-wrap">
                <span className="heat-score">{score}</span>
                <div className="heat-bar">
                  <div className="heat-fill" style={{ width: `${Math.min(score * 12, 100)}%` }} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No live reports for the heatmap yet.</div>
        )}
      </div>
    </section>
  );
}

export default HeatmapPanel;
