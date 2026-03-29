import { haversineDistance } from "./geo";

const categorySkills = {
  food: ["food", "delivery", "distribution", "logistics", "nutrition"],
  disaster: ["rescue", "disaster", "logistics", "medical", "transport"],
  medical: ["medical", "nursing", "first aid", "doctor", "care"],
  shelter: ["shelter", "community support", "logistics", "transport"],
  senior: ["caregiving", "senior care", "medical", "community support"],
  education: ["teaching", "education", "mentoring", "counseling"],
  sanitation: ["sanitation", "cleanliness", "waste", "community support"],
};

function normalizeList(values) {
  return (values ?? [])
    .map((value) => value?.toString().trim().toLowerCase())
    .filter(Boolean);
}

function normalizeTrustScore(value) {
  if (typeof value === "number") {
    return Math.min(Math.max(value, 0), 5);
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 3.8 : Math.min(Math.max(parsed, 0), 5);
}

function getCategorySkills(category) {
  return categorySkills[category] ?? [category];
}

function getDistanceScore(distanceKm) {
  if (distanceKm == null) {
    return 8;
  }

  if (distanceKm <= 2) {
    return 35;
  }

  if (distanceKm <= 5) {
    return 26;
  }

  if (distanceKm <= 10) {
    return 18;
  }

  if (distanceKm <= 20) {
    return 10;
  }

  return 4;
}

function getPriorityBoost(priorityScore) {
  if (priorityScore == null) {
    return 0;
  }

  if (priorityScore >= 220) {
    return 16;
  }

  if (priorityScore >= 160) {
    return 10;
  }

  return 5;
}

function getVolunteerSkillScore(request, volunteer) {
  const requestSkills = getCategorySkills(request.category);
  const volunteerSkills = [
    ...normalizeList(volunteer.skills),
    ...normalizeList(volunteer.categoryTags),
  ];
  return requestSkills.some((skill) => volunteerSkills.includes(skill)) ? 34 : 8;
}

function getNgoCapabilityScore(request, ngo) {
  const requestSkills = getCategorySkills(request.category);
  const ngoServices = normalizeList(ngo.services);
  return requestSkills.some((skill) => ngoServices.includes(skill)) ? 32 : 10;
}

export function scoreVolunteer(request, volunteer) {
  const distanceKm = haversineDistance(request.location, volunteer.location);
  const availabilityScore = volunteer.available || volunteer.availability ? 24 : -200;
  const trustScore = normalizeTrustScore(
    volunteer.trustScore ?? volunteer.rating ?? volunteer.reliabilityScore,
  );

  return {
    distanceKm,
    score:
      getVolunteerSkillScore(request, volunteer) +
      getDistanceScore(distanceKm) +
      availabilityScore +
      trustScore * 4 +
      getPriorityBoost(request.priorityScore),
  };
}

export function scoreNgo(request, ngo) {
  const distanceKm = haversineDistance(request.location, ngo.location);
  const trustScore = normalizeTrustScore(ngo.trustScore);
  const verifiedScore = ngo.verificationStatus === "verified" ? 18 : 8;
  const capacityScore = Math.min(Number(ngo.capacity ?? ngo.dailyHandlingCapacity ?? 20), 40) / 2;

  return {
    distanceKm,
    score:
      getNgoCapabilityScore(request, ngo) +
      getDistanceScore(distanceKm) +
      verifiedScore +
      trustScore * 4 +
      capacityScore,
  };
}

export function findBestVolunteer(request, volunteers) {
  return (volunteers ?? [])
    .filter((volunteer) => volunteer.available || volunteer.availability)
    .map((volunteer) => {
      const result = scoreVolunteer(request, volunteer);
      return {
        ...volunteer,
        distanceKm: result.distanceKm,
        score: result.score,
      };
    })
    .sort((left, right) => right.score - left.score)[0] ?? null;
}

export function findBestNgo(request, ngos) {
  return (ngos ?? [])
    .map((ngo) => {
      const result = scoreNgo(request, ngo);
      return {
        ...ngo,
        distanceKm: result.distanceKm,
        score: result.score,
      };
    })
    .sort((left, right) => right.score - left.score)[0] ?? null;
}
