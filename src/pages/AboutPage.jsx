import { useNavigate } from "react-router-dom";
import { aboutSections } from "../data/appContent";
import { mockAnalyticsSummary } from "../data/presentationData";

function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="page-stack mobile-page">
      <section className="zip-about-identity">
        <div className="zip-about-logo">R</div>
        <h1>ResQLink</h1>
        <p>
          A smart platform that connects people in need with the right resources, volunteers, and NGOs in real time.
        </p>
      </section>

      <section className="zip-about-stats">
        <p className="eyebrow">Live Platform Stats</p>
        <div className="zip-about-stats-grid">
          {[
            { value: `${mockAnalyticsSummary.totalUsersHelped.toLocaleString()}+`, label: "People Helped" },
            { value: `${mockAnalyticsSummary.resourcesAllocated.toLocaleString()}+`, label: "Resources Allocated" },
            { value: `${mockAnalyticsSummary.activeNGOs}+`, label: "Verified NGOs" },
            { value: `${mockAnalyticsSummary.activeVolunteers}+`, label: "Active Volunteers" },
          ].map(({ value, label }) => (
            <div className="zip-about-stat" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cards-stack">
        {aboutSections.map((section) => (
          <article className="zip-about-card" key={section.title}>
            <div className="zip-about-icon">
              {{
                "About the App": "🧠",
                Features: "⚡",
                "Trust & Safety": "🛡",
                Contact: "📧",
              }[section.title] || "•"}
            </div>
            <div>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="zip-about-trust">
        <h2>Trust & Safety</h2>
        <div className="cards-stack small-gap">
          <p>All user data is securely handled.</p>
          <p>NGOs are reviewed before approval.</p>
          <p>Trust scores improve after real completed work.</p>
          <p>Users can follow, rate, and review volunteers or NGOs.</p>
        </div>
      </section>

      <section className="zip-about-contact">
        <h2>Contact & Support</h2>
        <div className="cards-stack small-gap">
          <a href="mailto:anirudhbalaji10@gmail.com?subject=ResQLink%20Support">anirudhbalaji10@gmail.com</a>
          <p>For feedback, support, or partnership inquiries, reach out directly by email.</p>
        </div>
      </section>

      <section className="zip-about-cta">
        <p>Built for communities that need faster, smarter support.</p>
        <button className="danger-button large-button" onClick={() => navigate("/app")} type="button">
          Start Using ResQLink
        </button>
      </section>
    </div>
  );
}

export default AboutPage;
