import MapPanel from "../components/MapPanel";
import { useAppData } from "../context/AppDataContext";

function MapPage() {
  const { nearbyRequests, volunteers, ngos, location, priorityZones } = useAppData();

  return (
    <div className="page-stack">
      <section className="hero-card compact">
        <div>
          <span className="section-label">Map intelligence</span>
          <h1>See emergencies, responders, and NGOs on one operational map.</h1>
        </div>
        <div className="hero-kpis">
          <div className="stat-card">
            <strong>{nearbyRequests.length}</strong>
            <span>nearby requests</span>
          </div>
          <div className="stat-card">
            <strong>{priorityZones.length}</strong>
            <span>priority zones</span>
          </div>
        </div>
      </section>

      <MapPanel
        ngos={ngos}
        requests={nearbyRequests}
        title="All live markers"
        userLocation={location}
        volunteers={volunteers}
      />
    </div>
  );
}

export default MapPage;
