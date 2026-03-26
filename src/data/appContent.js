export const pillars = [
  "Centralization",
  "Real-time updates",
  "Smart matching",
  "Faster response",
  "Better utilisation",
];

export const problemDomains = [
  {
    slug: "food-shortage",
    title: "Food shortage",
    shortTitle: "Food shortage",
    summary:
      "Connect nearby NGOs, compare food stock capacity, and escalate shortages across multiple organizations when one NGO alone is not enough.",
    cta: "Request food support",
    category: "food-shortage",
    defaults: [
      "Supply chain delays",
      "Sudden migrant worker influx",
      "Flood or rain damage",
      "Livelihood loss in the area",
    ],
    fields: [
      { id: "peopleCount", label: "How many people need food?", type: "number" },
      {
        id: "reason",
        label: "Reason for shortage",
        type: "select",
        options: [
          "Supply chain delays",
          "Sudden migrant worker influx",
          "Flood or rain damage",
          "Livelihood loss in the area",
        ],
      },
      { id: "requesterName", label: "Requester name", type: "text" },
    ],
  },
  {
    slug: "senior-help",
    title: "Senior citizen daily help",
    shortTitle: "Senior help",
    summary:
      "Support elderly citizens with daily assistance, medicine pickup, check-ins, mobility help, and community care from verified volunteers and NGOs.",
    cta: "Need help?",
    category: "senior-help",
    defaults: ["Mobility issue", "Medicine reminder", "Doctor visit help", "Daily care support"],
    fields: [
      { id: "seniorName", label: "Senior citizen name", type: "text" },
      { id: "seniorAge", label: "Age", type: "number" },
      {
        id: "healthIssue",
        label: "Current health issue",
        type: "select",
        options: ["Mobility issue", "Diabetes", "BP issue", "Medication support", "Daily care support"],
      },
      { id: "helpNeeded", label: "Help needed right now", type: "text" },
    ],
  },
  {
    slug: "disaster-relief",
    title: "Flood / Disaster relief coordination",
    shortTitle: "Disaster relief",
    summary:
      "Capture affected families, disaster type, resource gaps, and urgency so NGOs can coordinate food, shelter, rescue, and medical response from one map.",
    cta: "Report disaster impact",
    category: "disaster-relief",
    defaults: ["Flood", "Fire", "Landslide", "Cyclone", "Building collapse"],
    fields: [
      {
        id: "disasterType",
        label: "Disaster type",
        type: "select",
        options: ["Flood", "Fire", "Landslide", "Cyclone", "Building collapse"],
      },
      { id: "affectedPeople", label: "People affected", type: "number" },
      {
        id: "resourcesNeeded",
        label: "Resources needed",
        type: "text",
      },
      {
        id: "safeAccess",
        label: "Is the area safely accessible?",
        type: "select",
        options: ["Yes", "No", "Partially"],
      },
    ],
  },
  {
    slug: "education-support",
    title: "Education support drive",
    shortTitle: "Education support",
    summary:
      "Highlight learning gaps, missing teaching support, and student clusters so NGOs can launch tutoring drives and deploy skilled volunteers effectively.",
    cta: "Report education gap",
    category: "education-support",
    defaults: ["No volunteer teachers nearby", "Students dropped out", "No study materials", "No digital access"],
    fields: [
      { id: "studentsCount", label: "How many students are affected?", type: "number" },
      { id: "problemArea", label: "Area that needs support", type: "text" },
      { id: "proofLink", label: "Proof file link", type: "text" },
      { id: "requesterName", label: "Reporter name", type: "text" },
    ],
  },
  {
    slug: "cleanliness-drive",
    title: "City cleanliness drive",
    shortTitle: "Cleanliness drive",
    summary:
      "Route waste, sanitation, and cleanup issues to NGOs and volunteer groups while showing users visible tracking on accepted and completed civic actions.",
    cta: "Report cleanliness issue",
    category: "cleanliness-drive",
    defaults: ["Waste overflow", "Blocked drain", "Street dumping", "Public toilet maintenance"],
    fields: [
      { id: "cleanupArea", label: "Area needing cleanup", type: "text" },
      { id: "actionRequired", label: "Action required", type: "text" },
      { id: "volunteersNeeded", label: "How many people needed?", type: "number" },
      { id: "proofLink", label: "Proof file link", type: "text" },
    ],
  },
];

export const aboutSections = [
  {
    title: "About the App",
    body:
      "ResQLink is a real-time smart resource allocation platform that connects people in need with NGOs and volunteers using centralized data, area intelligence, and live status tracking.",
  },
  {
    title: "Features",
    body:
      "Smart matching, real-time dashboards, verified roles, volunteer coordination, campaign visibility, analytics heatmaps, and emergency prioritization across five unified problem domains.",
  },
  {
    title: "Trust & Safety",
    body:
      "Verified profiles, NGO review states, controlled assignments, and transparent status updates help users understand who is acting and whether support is confirmed or pending.",
  },
  {
    title: "Contact",
    body:
      "Support, feedback, and contact requests are routed through email so stakeholders can reach the team directly.",
  },
];
