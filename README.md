# ResQLink

Real-time NGO resource intelligence and volunteer allocation system.

## Stack

- React + Vite
- Firebase Auth
- Firestore real-time updates

## Run

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Fill in your Firebase project values in `.env`.

4. Start the app:

```bash
npm run dev
```

## Firestore Collections

- `users`
- `volunteers`
- `problems`

## Included Features

- Field report collection into Firestore
- Unified problem domains: food shortage, senior help, disaster relief, education drives, cleanliness drives
- Analytics aggregation by zone
- Priority scoring engine for high-need areas
- NGO decision dashboard with top critical zones and trend graph
- Real-time volunteer task delivery
- Live volunteer location tracking and navigation links
- OpenStreetMap heatmap-style zone visualization
- Centralized Firestore data model across `problems`, `volunteers`, `campaigns`, and `analytics`
- Firebase Auth with NGO and volunteer roles
