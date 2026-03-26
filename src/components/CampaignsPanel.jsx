function CampaignsPanel({ campaigns }) {
  return (
    <section className="panel group-panel wow-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Campaigns</p>
          <h2>Unified NGO initiatives</h2>
        </div>
      </div>

      <div className="cards-stack">
        {campaigns.length ? (
          campaigns.map((campaign) => (
            <article className="problem-card premium-card" key={campaign.id}>
              <div className="problem-card-top">
                <div>
                  <p className="eyebrow">{campaign.type || "campaign"}</p>
                  <h3>{campaign.title || "Untitled campaign"}</h3>
                </div>
                <span className="metric-chip">{campaign.status || "active"}</span>
              </div>
              <div className="problem-meta">
                <span>Area: {campaign.zone || "Global"}</span>
                <span>Volunteers needed: {campaign.volunteersNeeded ?? 0}</span>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">No campaigns yet. Firestore is ready for centralized campaign data.</div>
        )}
      </div>
    </section>
  );
}

export default CampaignsPanel;
