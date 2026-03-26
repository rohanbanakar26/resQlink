import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const urgencyWeights = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const severityWeights = {
  "education-support": 2,
  "food-shortage": 3,
  "senior-help": 2,
  "disaster-relief": 4,
  "cleanliness-drive": 1,
};

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

export function getUrgencyValue(urgency) {
  return urgencyWeights[urgency] ?? 1;
}

export function getSeverityValue(category) {
  return severityWeights[category] ?? 2;
}

export function deriveTrend(frequency, recentReports) {
  if (recentReports >= 3 || frequency >= 8) {
    return "rising";
  }

  if (recentReports >= 1 || frequency >= 3) {
    return "watch";
  }

  return "stable";
}

export function calculatePriorityScore({
  urgencyScore,
  frequency,
  recentReports,
  severity,
}) {
  return urgencyScore * 40 + frequency * 30 + recentReports * 20 + severity * 10;
}

export function calculateProblemPriority({
  urgency,
  category,
  frequency,
  recentReports,
}) {
  return calculatePriorityScore({
    urgencyScore: getUrgencyValue(urgency),
    frequency,
    recentReports,
    severity: getSeverityValue(category),
  });
}

export function buildPriorityZones(analyticsDocs, problems) {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const problemCountsByZone = problems.reduce((accumulator, problem) => {
    const zoneKey = getZoneKey(problem.location);
    const timestampMs = problem.timestamp?.seconds
      ? problem.timestamp.seconds * 1000
      : 0;
    const isRecent = now - timestampMs <= oneDayMs;

    if (!accumulator[zoneKey]) {
      accumulator[zoneKey] = {
        recentReports: 0,
        severity: 0,
      };
    }

    if (isRecent) {
      accumulator[zoneKey].recentReports += 1;
    }

    accumulator[zoneKey].severity = Math.max(
      accumulator[zoneKey].severity,
      getSeverityValue(problem.category),
    );

    return accumulator;
  }, {});

  return analyticsDocs
    .map((zone) => {
      const derived = problemCountsByZone[zone.id] ?? { recentReports: 0, severity: 1 };
      const frequency = zone.frequency ?? 0;
      const urgencyScore = zone.urgencyScore ?? 0;
      return {
        ...zone,
        recentReports: derived.recentReports,
        severity: derived.severity,
        trend: deriveTrend(frequency, derived.recentReports),
        priorityScore: calculatePriorityScore({
          urgencyScore,
          frequency,
          recentReports: derived.recentReports,
          severity: derived.severity,
        }),
      };
    })
    .sort((left, right) => right.priorityScore - left.priorityScore);
}

export async function upsertAnalyticsForProblem(problem) {
  const zoneKey = getZoneKey(problem.location);
  const analyticsRef = doc(collection(db, "analytics"), zoneKey);
  const analyticsDoc = await getDoc(analyticsRef);
  const current = analyticsDoc.exists() ? analyticsDoc.data() : null;
  const nextFrequency = (current?.frequency ?? 0) + 1;
  const nextUrgencyScore =
    (current?.urgencyScore ?? 0) + getUrgencyValue(problem.urgency);
  const nextTrend = deriveTrend(nextFrequency, 1);

  await setDoc(
    analyticsRef,
    {
      location: getZoneCenter(problem.location),
      frequency: nextFrequency,
      urgencyScore: nextUrgencyScore,
      trend: nextTrend,
      lastUpdated: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getAnalyticsSnapshotForLocation(location) {
  const zoneKey = getZoneKey(location);
  const analyticsRef = doc(collection(db, "analytics"), zoneKey);
  const analyticsDoc = await getDoc(analyticsRef);

  if (!analyticsDoc.exists()) {
    return {
      id: zoneKey,
      location: getZoneCenter(location),
      frequency: 0,
      urgencyScore: 0,
      trend: "stable",
    };
  }

  return {
    id: analyticsDoc.id,
    ...analyticsDoc.data(),
  };
}
