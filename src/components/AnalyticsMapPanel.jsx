import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

function getPriorityColor(score) {
  if (score >= 300) {
    return "#d62f2f";
  }

  if (score >= 180) {
    return "#f7ab2f";
  }

  return "#2f8f58";
}

function AnalyticsMapPanel({ zones }) {
  return (
    <section className="panel map-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Heatmap</p>
          <h2>Priority zones</h2>
        </div>
        <span className="subtle-copy">Decision map for NGO planning</span>
      </div>
      <div className="map-legend">
        <span className="legend-chip critical">Critical</span>
        <span className="legend-chip medium">Elevated</span>
        <span className="legend-chip resolved">Stable</span>
      </div>

      <div className="map-canvas live-map">
        <MapContainer center={[20.5937, 78.9629]} scrollWheelZoom style={{ height: "100%", width: "100%" }} zoom={5}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {zones.map((zone) =>
            zone.location?.lat != null && zone.location?.lng != null ? (
              <CircleMarker
                center={[zone.location.lat, zone.location.lng]}
                color={getPriorityColor(zone.priorityScore)}
                key={zone.id}
                pathOptions={{ fillOpacity: 0.55 }}
                radius={Math.max(12, Math.min(26, 8 + zone.frequency * 2))}
              >
                <Popup>
                  <strong>{zone.id}</strong>
                  <br />
                  Priority: {zone.priorityScore}
                  <br />
                  Frequency: {zone.frequency}
                  <br />
                  Trend: {zone.trend}
                </Popup>
              </CircleMarker>
            ) : null,
          )}
        </MapContainer>
      </div>
    </section>
  );
}

export default AnalyticsMapPanel;
