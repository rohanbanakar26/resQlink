import { haversineDistance } from "./geo";

const skillMap = {
  "food-shortage": ["food", "distribution", "logistics", "supply"],
  "senior-help": ["senior care", "caregiving", "community support", "medical"],
  "disaster-relief": ["disaster relief", "rescue", "logistics", "transport"],
  "education-support": ["education", "teaching", "tutoring", "counseling"],
  "cleanliness-drive": ["cleanliness", "sanitation", "community support", "logistics"],
};

function normalizeSkill(value) {
  return value?.toString().trim().toLowerCase() ?? "";
}

function getSkillScore(problem, volunteer) {
  const targetSkills = skillMap[problem.category] ?? [problem.category];
  const normalizedVolunteerSkills = (volunteer.skills ?? []).map(normalizeSkill);
  const match = targetSkills.some((skill) => normalizedVolunteerSkills.includes(skill));
  return match ? 50 : 0;
}

function getAvailabilityScore(volunteer) {
  return volunteer.availability || volunteer.available ? 20 : 0;
}

function getDistanceScore(problem, volunteer) {
  const distance = haversineDistance(problem.location, volunteer.location);

  if (distance === null) {
    return 10;
  }

  return distance < 5 ? 30 : 10;
}

function getPriorityScore(problem) {
  if (problem.priorityScore == null) {
    return 0;
  }

  if (problem.priorityScore >= 300) {
    return 25;
  }

  if (problem.priorityScore >= 180) {
    return 16;
  }

  return 8;
}

export function scoreVolunteer(problem, volunteer) {
  return (
    getSkillScore(problem, volunteer) +
    getAvailabilityScore(volunteer) +
    getDistanceScore(problem, volunteer) +
    getPriorityScore(problem)
  );
}

export function findBestVolunteer(problem, volunteers) {
  const eligibleVolunteers = volunteers
    .filter((volunteer) => volunteer.availability || volunteer.available)
    .map((volunteer) => ({
      ...volunteer,
      score: scoreVolunteer(problem, volunteer),
    }))
    .sort((left, right) => right.score - left.score);

  return eligibleVolunteers[0] ?? null;
}
