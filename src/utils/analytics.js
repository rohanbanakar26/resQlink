import { collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const urgencyWeights = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const severityWeights = {
  food: 3,
  disaster: 5,
  medical: 4,
  shelter: 4,
  senior: 2,
  education: 2,
  sanitation: 1,
};

export function getUrgencyValue(urgency) {
  return urgencyWeights[urgency] ?? 1;
}

export function getSeverityValue(category) {
  return severityWeights[category] ?? 2;
}

export function getZoneKey(location) {
  if (location?.lat == null || location?.lng == null) {
    return "unknown";
  }

  return `${location.lat.toFixed(1)}:${location.lng.toFixed(1)}`;
}

export function getZoneCenter(location) {
  if (location?.lat == null || location?.lng == null) {
    return null;
  }

  return {
    lat: Number(location.lat.toFixed(1)),
    lng: Number(location.lng.toFixed(1)),
  };
}

export function calculatePriorityScore({
  averageUrgency = 1,
  totalReports = 1,
  recentReports = 1,
  severity = 1,
}) {
  return averageUrgency * 40 + totalReports * 30 + recentReports * 20 + severity * 10;
}

export function deriveTrend(previousTotal, nextTotal) {
  if (nextTotal - previousTotal >= 3) {
    return "surging";
  }

  if (nextTotal > previousTotal) {
    return "rising";
  }

  return "steady";
}

export async function getAnalyticsSnapshotForLocation(location) {
  const zoneKey = getZoneKey(location);
  const snapshot = await getDoc(doc(db, "analytics", zoneKey));

  if (!snapshot.exists()) {
    return {
      id: zoneKey,
      location: getZoneCenter(location),
      totalReports: 0,
      avgUrgency: 0,
      priorityScore: 0,
      trend: "steady",
      categories: {},
    };
  }

  return { id: snapshot.id, ...snapshot.data() };
}

export async function upsertAnalyticsForRequest(request) {
  const zoneKey = getZoneKey(request.location);
  const analyticsRef = doc(collection(db, "analytics"), zoneKey);
  const current = await getAnalyticsSnapshotForLocation(request.location);
  const nextTotal = (current.totalReports ?? 0) + 1;
  const currentUrgencyValue = getUrgencyValue(request.urgency);
  const nextAvgUrgency =
    ((current.avgUrgency ?? 0) * (current.totalReports ?? 0) + currentUrgencyValue) / nextTotal;
  const nextRecentReports = Math.min((current.recentReports ?? 0) + 1, nextTotal);
  const priorityScore = calculatePriorityScore({
    averageUrgency: nextAvgUrgency,
    totalReports: nextTotal,
    recentReports: nextRecentReports,
    severity: getSeverityValue(request.category),
  });

  await setDoc(
    analyticsRef,
    {
      area: zoneKey,
      location: getZoneCenter(request.location),
      totalReports: nextTotal,
      avgUrgency: Number(nextAvgUrgency.toFixed(2)),
      recentReports: nextRecentReports,
      problemType: request.category,
      priorityScore,
      trend: deriveTrend(current.totalReports ?? 0, nextTotal),
      categories: {
        ...(current.categories ?? {}),
        [request.category]: ((current.categories ?? {})[request.category] ?? 0) + 1,
      },
      lastUpdated: serverTimestamp(),
    },
    { merge: true },
  );

  return priorityScore;
}

export function buildPriorityZones(analyticsDocs = [], problems = []) {
  const activeByZone = problems.reduce((accumulator, problem) => {
    const zoneKey = getZoneKey(problem.location);
    accumulator[zoneKey] = (accumulator[zoneKey] ?? 0) + (problem.status === "Completed" ? 0 : 1);
    return accumulator;
  }, {});

  return analyticsDocs
    .map((zone) => ({
      ...zone,
      activeRequests: activeByZone[zone.id] ?? 0,
    }))
    .sort((left, right) => (right.priorityScore ?? 0) - (left.priorityScore ?? 0));
}
