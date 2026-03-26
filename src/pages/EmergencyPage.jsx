import EmergencyForm from "../components/EmergencyForm";

function EmergencyPage() {
  return (
    <div className="page-stack">
      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="eyebrow">Quick report</p>
          <h1>Open the report emergency page first</h1>
          <p>
            This page is the fastest entry into the system. Reports write to Firestore instantly,
            update dashboards live, and trigger smart assignment when a strong match exists.
          </p>
        </div>
      </section>

      <EmergencyForm />
    </div>
  );
}

export default EmergencyPage;
