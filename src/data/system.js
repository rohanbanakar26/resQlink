export const ROLE_OPTIONS = [
  {
    id: "citizen",
    label: "I need help",
    shortLabel: "Citizen",
    description: "Report emergencies, see nearby responders, and track help live.",
  },
  {
    id: "volunteer",
    label: "I want to help",
    shortLabel: "Volunteer",
    description: "Receive nearby tasks, go available instantly, and complete missions fast.",
  },
  {
    id: "ngo",
    label: "I represent an NGO",
    shortLabel: "NGO",
    description: "Coordinate incoming requests, volunteers, and area-level allocation.",
  },
];

export const REQUEST_CATEGORIES = [
  {
    id: "general",
    label: "General Emergency",
    emoji: "🚨",
    summary: "Fast dispatch when the exact category can be refined after sending",
  },
  {
    id: "food",
    label: "Food",
    emoji: "🍲",
    summary: "Food shortage, hunger support, community kitchens",
  },
  {
    id: "disaster",
    label: "Disaster",
    emoji: "🌊",
    summary: "Flood, fire, collapse, urgent relief coordination",
  },
  {
    id: "medical",
    label: "Medical",
    emoji: "🩺",
    summary: "Urgent care, medicines, first-aid support",
  },
  {
    id: "shelter",
    label: "Shelter",
    emoji: "🏠",
    summary: "Safe space, beds, temporary protection",
  },
  {
    id: "senior",
    label: "Senior care",
    emoji: "🫶",
    summary: "Daily help, medicine pickup, mobility support",
  },
  {
    id: "education",
    label: "Education",
    emoji: "📚",
    summary: "Tutoring, school access, learning support",
  },
  {
    id: "sanitation",
    label: "Sanitation",
    emoji: "🧹",
    summary: "Waste cleanup, hygiene, public sanitation needs",
  },
];

export const URGENCY_OPTIONS = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "critical", label: "Critical" },
];

export const REQUEST_STATUSES = [
  "Requested",
  "Pending sync",
  "Accepted",
  "Volunteer assigned",
  "In progress",
  "Completed",
];

export const STATUS_COPY = {
  Requested: "Request received",
  "Pending sync": "Waiting for network",
  Accepted: "NGO accepted",
  "Volunteer assigned": "Volunteer matched",
  "In progress": "Help on the way",
  Completed: "Resolved",
};

export function getCategoryMeta(category) {
  return REQUEST_CATEGORIES.find((item) => item.id === category) ?? REQUEST_CATEGORIES[0];
}
