export function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function haversineDistance(pointA, pointB) {
  if (
    pointA?.lat == null ||
    pointA?.lng == null ||
    pointB?.lat == null ||
    pointB?.lng == null
  ) {
    return null;
  }

  const earthRadiusKm = 6371;
  const deltaLat = toRadians(pointB.lat - pointA.lat);
  const deltaLng = toRadians(pointB.lng - pointA.lng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(pointA.lat)) *
      Math.cos(toRadians(pointB.lat)) *
      Math.sin(deltaLng / 2) ** 2;

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  });
}

export function watchCurrentPosition(onSuccess, onError) {
  if (!navigator.geolocation) {
    onError?.(new Error("Geolocation is not supported in this browser."));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) =>
      onSuccess({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }),
    (error) => onError?.(error),
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
  );
}

export function formatDistance(distanceKm) {
  if (distanceKm == null) {
    return "Distance unavailable";
  }

  return `${distanceKm.toFixed(1)} km`;
}

export function formatCoordinates(location) {
  if (location?.lat == null || location?.lng == null) {
    return "Coordinates unavailable";
  }

  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
}

export function getDirectionsUrl(destination, origin) {
  if (destination?.lat == null || destination?.lng == null) {
    return null;
  }

  if (origin?.lat == null || origin?.lng == null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`;
}
