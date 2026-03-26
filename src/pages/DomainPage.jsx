import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmergencyForm from "../components/EmergencyForm";
import { problemDomains } from "../data/appContent";
import { mockCampaignGroups, uiProblemCategories } from "../data/presentationData";
import { db } from "../lib/firebase";

function DomainPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const domain = useMemo(
    () => problemDomains.find((item) => item.slug === slug) ?? problemDomains[0],
    [slug],
  );
  const categoryMeta = useMemo(
    () => uiProblemCategories.find((item) => item.id === domain.category) ?? uiProblemCategories[0],
    [domain.category],
  );

  useEffect(() => {
    const campaignsQuery = query(collection(db, "campaigns"), where("category", "==", domain.category));
    return onSnapshot(campaignsQuery, (snapshot) => {
      const live = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
      setCampaigns(live.length ? live : mockCampaignGroups[domain.category] ?? []);
    });
  }, [domain.category]);

  return (
    <div className="v2-domain-page">
      <section className="v2-domain-hero">
        <button className="v2-inline-link" onClick={() => navigate("/app")} type="button">
          Back to home
        </button>
        <div className="v2-domain-head">
          <span className="v2-domain-emoji">{categoryMeta.emoji}</span>
          <div>
            <p className="v2-kicker">Support category</p>
            <h1>{domain.title}</h1>
            <p>{categoryMeta.description}</p>
          </div>
        </div>
      </section>

      <section className="v2-domain-layout">
        <div className="v2-surface">
          <div className="v2-section-head left">
            <p className="v2-kicker">Campaigns</p>
            <h2>Proof of action in this category</h2>
          </div>
          <div className="v2-campaign-stack">
            {campaigns.map((campaign) => (
              <article className="v2-campaign-card" key={campaign.id}>
                <span className="v2-campaign-photo">{campaign.photo || "•"}</span>
                <div>
                  <div className="v2-campaign-top">
                    <strong>{campaign.title || "Campaign"}</strong>
                    <span>{campaign.status || "active"}</span>
                  </div>
                  <p>{campaign.description || "Campaign details pending."}</p>
                  <small>
                    {campaign.ngo || "NGO"} · {campaign.location || "Coverage area"}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="v2-domain-side">
          <div className="v2-surface tight">
            <div className="v2-section-head left">
              <p className="v2-kicker">How matching works</p>
              <h2>Fast and practical</h2>
            </div>
            <div className="v2-steps">
              <p>1. We capture the issue and its location.</p>
              <p>2. The system checks priority and nearby capacity.</p>
              <p>3. NGOs and volunteers are matched in real time.</p>
              <p>4. Status updates stay visible until completion.</p>
            </div>
          </div>

          <div className="v2-surface tight">
            <div className="v2-section-head left">
              <p className="v2-kicker">Take action</p>
              <h2>Submit a request</h2>
            </div>
            <p className="v2-soft-copy">
              Keep it short. The system will handle prioritization and routing after submission.
            </p>
            <button
              className="v2-primary-button full-width-button"
              onClick={() => setShowForm((current) => !current)}
              type="button"
            >
              {showForm ? "Hide form" : domain.cta}
            </button>
          </div>
        </div>
      </section>

      {showForm && (
        <section className="v2-form-wrap">
          <EmergencyForm domain={domain} />
        </section>
      )}
    </div>
  );
}

export default DomainPage;
