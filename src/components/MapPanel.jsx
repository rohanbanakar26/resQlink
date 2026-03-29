import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { formatDistance, haversineDistance } from "../utils/geo";

function FitMapToMarkers({ points }) {
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

function requestColor(request) {
  if (request.status === "Completed") {
    return "#4f9d69";
  }

  if (request.urgency === "critical") {
    return "#d93c2f";
  }

  if (request.urgency === "high") {
    return "#e57c22";
  }

  return "#f0b144";
}

function MapPanel({
  requests = [],
  volunteers = [],
  ngos = [],
  userLocation = null,
  title = "Live coordination map",
}) {
  const requestPoints = requests
    .filter((request) => request.location?.lat != null && request.location?.lng != null)
    .map((request) => [request.location.lat, request.location.lng]);
  const volunteerPoints = volunteers
    .filter((volunteer) => volunteer.location?.lat != null && volunteer.location?.lng != null)
    .map((volunteer) => [volunteer.location.lat, volunteer.location.lng]);
  const ngoPoints = ngos
    .filter((ngo) => ngo.location?.lat != null && ngo.location?.lng != null)
    .map((ngo) => [ngo.location.lat, ngo.location.lng]);
  const points = [
    ...requestPoints,
    ...volunteerPoints,
    ...ngoPoints,
    ...(userLocation?.lat != null && userLocation?.lng != null
      ? [[userLocation.lat, userLocation.lng]]
      : []),
  ];

  return (
    <section className="card map-card">
      <div className="section-head">
        <div>
          <span className="section-label">Realtime view</span>
          <h2>{title}</h2>
        </div>
        <div className="map-legend">
          <span><i className="legend-dot emergency" /> Emergencies</span>
          <span><i className="legend-dot volunteer" /> Volunteers</span>
          <span><i className="legend-dot ngo" /> NGOs</span>
        </div>
      </div>

      <div className="map-shell">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitMapToMarkers points={points} />

          {requests.map((request) =>
            request.location?.lat != null && request.location?.lng != null ? (
              <CircleMarker
                center={[request.location.lat, request.location.lng]}
                color={requestColor(request)}
                key={request.id}
                pathOptions={{ fillOpacity: 0.85 }}
                radius={9}
              >
                <Popup>
                  <strong>{request.category}</strong>
                  <br />
                  {request.status}
                  <br />
                  {request.description || "No extra details"}
                  {userLocation ? (
                    <>
                      <br />
                      {formatDistance(haversineDistance(userLocation, request.location))}
                    </>
                  ) : null}
                </Popup>
              </CircleMarker>
            ) : null,
          )}

          {volunteers.map((volunteer) =>
            volunteer.location?.lat != null && volunteer.location?.lng != null ? (
              <CircleMarker
                center={[volunteer.location.lat, volunteer.location.lng]}
                color="#189c64"
                key={volunteer.id}
                pathOptions={{ fillOpacity: 0.9 }}
                radius={7}
              >
                <Popup>
                  <strong>{volunteer.name}</strong>
                  <br />
                  Volunteer
                  <br />
                  {volunteer.available || volunteer.availability ? "Available" : "Offline"}
                </Popup>
              </CircleMarker>
            ) : null,
          )}

          {ngos.map((ngo) =>
            ngo.location?.lat != null && ngo.location?.lng != null ? (
              <CircleMarker
                center={[ngo.location.lat, ngo.location.lng]}
                color="#2f6fe4"
                key={ngo.id}
                pathOptions={{ fillOpacity: 0.9 }}
                radius={8}
              >
                <Popup>
                  <strong>{ngo.ngoName}</strong>
                  <br />
                  NGO
                  <br />
                  Trust score {ngo.trustScore || 4.5}
                </Popup>
              </CircleMarker>
            ) : null,
          )}

          {userLocation?.lat != null && userLocation?.lng != null ? (
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              color="#101828"
              pathOptions={{ fillOpacity: 0.95 }}
              radius={6}
            >
              <Popup>Your live location</Popup>
            </CircleMarker>
          ) : null}
        </MapContainer>
      </div>
    </section>
  );
}

export default MapPanel;
