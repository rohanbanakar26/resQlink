import { Navigate, Route, Routes } from "react-router-dom";
import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import DomainPage from "./pages/DomainPage";
import EmergencyPage from "./pages/EmergencyPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import NewsPage from "./pages/NewsPage";
import NgoDashboardPage from "./pages/NgoDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import VolunteerDashboardPage from "./pages/VolunteerDashboardPage";

function App() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/report" element={<EmergencyPage />} />
          <Route path="/domain/:slug" element={<DomainPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/ngo"
            element={
              <ProtectedRoute allowedRoles={["ngo"]}>
                <NgoDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute allowedRoles={["volunteer"]}>
                <VolunteerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["ngo", "volunteer", "user"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:type/:id" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
