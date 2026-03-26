export const uiProblemCategories = [
  {
    id: "food-shortage",
    label: "Food Shortage",
    emoji: "🍱",
    bgColor: "linear-gradient(135deg, rgba(245, 165, 36, 0.14), rgba(255, 255, 255, 0.95))",
    description:
      "Connect families facing hunger with nearby food campaigns, stock-aware NGOs, and live request tracking.",
  },
  {
    id: "senior-help",
    label: "Senior Citizen Daily Help",
    emoji: "👴",
    bgColor: "linear-gradient(135deg, rgba(236, 72, 153, 0.14), rgba(255, 255, 255, 0.95))",
    description:
      "Coordinate verified daily support, medicine delivery, health assistance, and trusted community care.",
  },
  {
    id: "disaster-relief",
    label: "Flood / Disaster Relief",
    emoji: "🌊",
    bgColor: "linear-gradient(135deg, rgba(59, 130, 246, 0.14), rgba(255, 255, 255, 0.95))",
    description:
      "Capture disaster impact fast and route shelter, food, rescue, and medical coordination to the right responders.",
  },
  {
    id: "education-support",
    label: "Education Support Drive",
    emoji: "📚",
    bgColor: "linear-gradient(135deg, rgba(31, 122, 78, 0.14), rgba(255, 255, 255, 0.95))",
    description:
      "Highlight student learning gaps, volunteer teaching demand, and active education drives near the area.",
  },
  {
    id: "cleanliness-drive",
    label: "City Cleanliness Drive",
    emoji: "♻️",
    bgColor: "linear-gradient(135deg, rgba(20, 184, 166, 0.14), rgba(255, 255, 255, 0.95))",
    description:
      "Turn civic cleanliness reports into visible NGO action with request review, cleanup tracking, and campaign proof.",
  },
];

export const mockNgoCards = [
  {
    id: "1",
    ngoName: "Sewa Foundation",
    logo: "SF",
    registrationNumber: "REG-2011-045",
    officeAddress: "South Delhi",
    areasServed: ["South Delhi", "Hauz Khas", "Saket"],
    services: ["Food Distribution", "Medical Help", "Emergency Relief"],
    trustScore: 4.8,
    totalHelped: 1240,
    activeCampaigns: 3,
    verifiedBadge: true,
    teamSize: 45,
    description:
      "A registered NGO working towards food security and healthcare access for underprivileged communities across Delhi.",
    website: "sewafoundation.org",
    phone: "+91 98765 11001",
  },
  {
    id: "2",
    ngoName: "Asha Education Trust",
    logo: "AE",
    registrationNumber: "REG-2015-112",
    officeAddress: "North Delhi",
    areasServed: ["North Delhi", "Rohini", "Pitampura"],
    services: ["Education Support", "Skill Development"],
    trustScore: 4.6,
    totalHelped: 820,
    activeCampaigns: 2,
    verifiedBadge: true,
    teamSize: 28,
    description:
      "Empowering underprivileged students with quality education and skill-building programs.",
    website: "ashaedu.org",
    phone: "+91 98765 11002",
  },
  {
    id: "3",
    ngoName: "Green City Warriors",
    logo: "GC",
    registrationNumber: "REG-2018-203",
    officeAddress: "East Delhi",
    areasServed: ["East Delhi", "Laxmi Nagar", "Preet Vihar"],
    services: ["City Cleanliness", "Environment"],
    trustScore: 4.3,
    totalHelped: 560,
    activeCampaigns: 5,
    verifiedBadge: true,
    teamSize: 62,
    description:
      "A volunteer-driven movement keeping Delhi clean through organized drives and awareness campaigns.",
    website: "greencitywarriors.in",
    phone: "+91 98765 11003",
  },
  {
    id: "4",
    ngoName: "ElderCare India",
    logo: "EC",
    registrationNumber: "REG-2013-078",
    officeAddress: "West Delhi",
    areasServed: ["West Delhi", "Janakpuri", "Dwarka"],
    services: ["Senior Citizen Help", "Medical Help"],
    trustScore: 4.9,
    totalHelped: 2100,
    activeCampaigns: 1,
    verifiedBadge: true,
    teamSize: 38,
    description:
      "Dedicated to improving the quality of life for senior citizens through daily care, medical support, and companionship.",
    website: "eldercareindia.org",
    phone: "+91 98765 11004",
  },
];

export const mockVolunteerCards = [
  {
    id: "1",
    name: "Arjun Sharma",
    photo: "AS",
    location: "South Delhi",
    skills: ["Delivery", "Medical Assistance", "Teaching"],
    vehicleAvailability: "Bike",
    tasksCompleted: 47,
    rating: 4.9,
    verifiedBadge: true,
    availability: "Online",
    successRate: "96%",
    ngo: "Sewa Foundation",
    phone: "+91 98765 12001",
  },
  {
    id: "2",
    name: "Priya Menon",
    photo: "PM",
    location: "North Delhi",
    skills: ["Teaching", "Technical Support"],
    vehicleAvailability: "None",
    tasksCompleted: 23,
    rating: 4.7,
    verifiedBadge: true,
    availability: "Offline",
    successRate: "91%",
    ngo: null,
    phone: "+91 98765 12002",
  },
  {
    id: "3",
    name: "Ravi Kumar",
    photo: "RK",
    location: "East Delhi",
    skills: ["Delivery", "First Aid", "Cleaning"],
    vehicleAvailability: "Car",
    tasksCompleted: 89,
    rating: 4.8,
    verifiedBadge: true,
    availability: "Online",
    successRate: "98%",
    ngo: "Green City Warriors",
    phone: "+91 98765 12003",
  },
];

export const mockCampaignGroups = {
  "food-shortage": [
    {
      id: "f1",
      title: "Hunger Relief Drive — Okhla",
      ngo: "Sewa Foundation",
      date: "2026-03-20",
      location: "Okhla Industrial Area, South Delhi",
      peopleHelped: 340,
      status: "Completed",
      description:
        "Distributed meals to 340 daily wage workers affected by a local factory closure.",
      photo: "🍱",
    },
    {
      id: "f2",
      title: "Weekly Food Camp — Saket",
      ngo: "Sewa Foundation",
      date: "2026-03-25",
      location: "Saket Metro Station, South Delhi",
      peopleHelped: 120,
      status: "Active",
      description:
        "Every Tuesday and Friday, free nutritious meals are distributed to homeless individuals.",
      photo: "🥘",
    },
  ],
  "senior-help": [
    {
      id: "s1",
      title: "Health Checkup Camp — Dwarka",
      ngo: "ElderCare India",
      date: "2026-03-22",
      location: "Sector 6, Dwarka, West Delhi",
      peopleHelped: 180,
      status: "Completed",
      description:
        "Free blood pressure, diabetes, and eye checkup camps for senior citizens.",
      photo: "🏥",
    },
  ],
  "disaster-relief": [
    {
      id: "d1",
      title: "Flood Relief — Yamuna Flood Plain",
      ngo: "Sewa Foundation",
      date: "2026-02-10",
      location: "Yamuna Flood Plain, East Delhi",
      peopleHelped: 890,
      status: "Completed",
      description:
        "Emergency relief operations providing food, clothing, and temporary shelter to flood-affected families.",
      photo: "🌊",
    },
  ],
  "education-support": [
    {
      id: "e1",
      title: "Free Tuition Centre — Trilokpuri",
      ngo: "Asha Education Trust",
      date: "2026-03-01",
      location: "Trilokpuri, East Delhi",
      peopleHelped: 75,
      status: "Active",
      description:
        "Classes 6 to 10 students receive free tuition in Maths, Science, and English every day.",
      photo: "📚",
    },
  ],
  "cleanliness-drive": [
    {
      id: "c1",
      title: "Cleanliness Drive — Laxmi Nagar",
      ngo: "Green City Warriors",
      date: "2026-03-15",
      location: "Laxmi Nagar Metro Area, East Delhi",
      peopleHelped: 0,
      volunteersInvolved: 45,
      status: "Completed",
      description:
        "Mass cleanup drive removing plastic waste and unclogging drains in the market area.",
      photo: "♻️",
    },
    {
      id: "c2",
      title: "Park Restoration — Preet Vihar",
      ngo: "Green City Warriors",
      date: "2026-03-28",
      location: "Preet Vihar Community Park, East Delhi",
      volunteersInvolved: 30,
      status: "Upcoming",
      description: "Tree plantation and park beautification initiative.",
      photo: "🌳",
    },
  ],
};

export const mockAnalyticsSummary = {
  totalUsersHelped: 4820,
  resourcesAllocated: 12400,
  activeNGOs: 47,
  activeVolunteers: 312,
  requestsThisMonth: 891,
  averageResponseTime: "23 min",
  topAreas: [
    { area: "Yamuna Vihar", score: 91, mainIssue: "Disaster Relief", reports: 67 },
    { area: "Okhla", score: 82, mainIssue: "Food Shortage", reports: 34 },
    { area: "Laxmi Nagar", score: 78, mainIssue: "City Cleanliness", reports: 45 },
  ],
  heatmapData: [
    { area: "Okhla", lat: 28.5347, lng: 77.2732, score: 82, type: "food", count: 34 },
    { area: "Dwarka", lat: 28.5921, lng: 77.046, score: 65, type: "senior", count: 22 },
    { area: "Laxmi Nagar", lat: 28.6341, lng: 77.2767, score: 78, type: "cleanliness", count: 45 },
    { area: "Rohini", lat: 28.7495, lng: 77.0618, score: 45, type: "education", count: 18 },
    { area: "Yamuna Vihar", lat: 28.7041, lng: 77.2865, score: 91, type: "disaster", count: 67 },
    { area: "Saket", lat: 28.5245, lng: 77.2066, score: 38, type: "food", count: 12 },
    { area: "Pitampura", lat: 28.7028, lng: 77.1306, score: 55, type: "education", count: 21 },
  ],
};

export const mockPendingRequests = [
  {
    id: "r1",
    type: "food",
    category: "food-shortage",
    area: "Okhla",
    submittedBy: "Ramesh K.",
    timestamp: "2 hours ago",
    urgency: "High",
    peopleAffected: 45,
    description:
      "Daily wage workers in the factory area are facing severe food shortage after layoffs.",
    status: "Pending",
  },
  {
    id: "r2",
    type: "senior",
    category: "senior-help",
    area: "Dwarka Sector 12",
    submittedBy: "Anita S.",
    timestamp: "5 hours ago",
    urgency: "Medium",
    peopleAffected: 3,
    description:
      "An elderly couple needs daily medication delivery and basic grocery support.",
    status: "Assigned",
    assignedTo: "Arjun Sharma",
  },
  {
    id: "r3",
    type: "cleanliness",
    category: "cleanliness-drive",
    area: "Laxmi Nagar Market",
    submittedBy: "Mohit V.",
    timestamp: "1 day ago",
    urgency: "Low",
    peopleAffected: 0,
    description:
      "Overflowing garbage bins near the main market are causing a health hazard.",
    status: "In Progress",
    assignedTo: "Green City Warriors Team",
  },
  {
    id: "r4",
    type: "disaster",
    category: "disaster-relief",
    area: "Yamuna Bank",
    submittedBy: "Sunil P.",
    timestamp: "30 min ago",
    urgency: "Critical",
    peopleAffected: 200,
    description:
      "Flash flooding is affecting residential areas near Yamuna bank. Immediate evacuation and relief required.",
    status: "Pending",
  },
];

export const mockNewsItems = [
  {
    id: "n1",
    ngo: "Sewa Foundation",
    title: "March Monthly Report: 1,240 Meals Distributed",
    date: "2026-03-24",
    excerpt:
      "This month, Sewa Foundation volunteers covered eight areas across South Delhi, providing nutritious meals to families in need.",
    type: "report",
    emoji: "📊",
  },
  {
    id: "n2",
    ngo: "Green City Warriors",
    title: "Laxmi Nagar Cleanliness Drive — 2 Tonnes of Waste Cleared",
    date: "2026-03-22",
    excerpt:
      "Forty-five volunteers came together to clear plastic waste and unclog storm drains ahead of the monsoon season.",
    type: "event",
    emoji: "♻️",
  },
  {
    id: "n3",
    ngo: "Asha Education Trust",
    title: "Literacy Rate in Trilokpuri Up by 12% — Our Impact",
    date: "2026-03-18",
    excerpt:
      "After six months of free tuition, the dropout rate in partner schools has fallen significantly.",
    type: "impact",
    emoji: "📚",
  },
  {
    id: "n4",
    ngo: "ElderCare India",
    title: "New Partnership with AIIMS for Free Senior Health Checkups",
    date: "2026-03-15",
    excerpt:
      "ElderCare India partnered with AIIMS Delhi to provide quarterly health checkups to more than 500 registered seniors.",
    type: "announcement",
    emoji: "🏥",
  },
];
