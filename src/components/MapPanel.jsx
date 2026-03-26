import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }

    map.fitBounds(points, { padding: [30, 30] });
  }, [map, points]);

  return null;
}

function urgencyColor(urgency, status) {
  if (status === "completed") {
    return "#2f8f58";
  }

  if (urgency === "critical" || urgency === "high") {
    return "#d62f2f";
  }

  if (urgency === "medium") {
    return "#f7ab2f";
  }

  return "#3d74c5";
}

function MapPanel({ problems, volunteerLocation, title = "Crisis map" }) {
  const points = [
    ...problems
      .filter((problem) => problem.location?.lat != null && problem.location?.lng != null)
      .map((problem) => [problem.location.lat, problem.location.lng]),
    ...(volunteerLocation?.lat != null && volunteerLocation?.lng != null
      ? [[volunteerLocation.lat, volunteerLocation.lng]]
      : []),
  ];

  return (
    <section className="panel map-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Map overview</p>
          <h2>{title}</h2>
        </div>
        <span className="subtle-copy">Live OpenStreetMap markers</span>
      </div>
      <div className="map-legend">
        <span className="legend-chip critical">Critical / high</span>
        <span className="legend-chip medium">Medium</span>
        <span className="legend-chip resolved">Completed</span>
        <span className="legend-chip volunteer">Volunteer</span>
      </div>

      <div className="map-canvas live-map">
        <MapContainer center={[20.5937, 78.9629]} scrollWheelZoom style={{ height: "100%", width: "100%" }} zoom={5}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
          {problems.map((problem) =>
            problem.location?.lat != null && problem.location?.lng != null ? (
              <CircleMarker
                center={[problem.location.lat, problem.location.lng]}
                color={urgencyColor(problem.urgency, problem.status)}
                key={problem.id}
                pathOptions={{ fillOpacity: 0.8 }}
                radius={10}
              >
                <Popup>
                  <strong>{problem.category}</strong>
                  <br />
                  {problem.description || "No description"}
                  <br />
                  Status: {problem.status}
                </Popup>
              </CircleMarker>
            ) : null,
          )}
          {volunteerLocation?.lat != null && volunteerLocation?.lng != null && (
            <CircleMarker
              center={[volunteerLocation.lat, volunteerLocation.lng]}
              color="#23518d"
              pathOptions={{ fillOpacity: 0.8 }}
              radius={9}
            >
              <Popup>Your live location</Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>
    </section>
  );
}

export default MapPanel;
