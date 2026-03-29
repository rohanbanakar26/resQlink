import { lazy, Suspense, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import EmergencyFAB from "./components/EmergencyFAB";
import EmergencyForm from "./components/EmergencyForm";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAppData } from "./context/AppDataContext";
import { useAuth } from "./context/AuthContext";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const EmergencyPage = lazy(() => import("./pages/EmergencyPage"));
const RequestsPage = lazy(() => import("./pages/RequestsPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const NetworkPage = lazy(() => import("./pages/NetworkPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createQuickEmergency, requests, emergencyMode } = useAppData();
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [sendingEmergency, setSendingEmergency] = useState(false);

  const activeRequest = useMemo(
    () => requests.find((request) => request.id === activeRequestId) ?? null,
    [activeRequestId, requests],
  );

  const closeComposer = () => {
    setComposerOpen(false);
    setActiveRequestId(null);
  };

  const openComposer = async () => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    setSendingEmergency(true);
    try {
      const requestId = await createQuickEmergency();
      setActiveRequestId(requestId);
      setComposerOpen(true);
      navigate("/emergency");
    } finally {
      setSendingEmergency(false);
    }
  };

  const showShell = location.pathname !== "/";
  const showStickyCta = currentUser && location.pathname !== "/auth";

  return (
    <div className="app-shell">
      {showShell ? <AppHeader /> : null}

      <main className="page-shell">
        <Suspense fallback={<section className="page-skeleton">Loading ResQLink...</section>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/emergency"
              element={
                <ProtectedRoute>
                  <EmergencyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <RequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/network"
              element={
                <ProtectedRoute>
                  <NetworkPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/app" element={<Navigate replace to="/emergency" />} />
            <Route path="/report" element={<Navigate replace to="/emergency" />} />
            <Route path="/search" element={<Navigate replace to="/network" />} />
            <Route path="/ngo" element={<Navigate replace to="/requests" />} />
            <Route path="/volunteer" element={<Navigate replace to="/requests" />} />
            <Route path="/about" element={<Navigate replace to="/" />} />
            <Route path="/news" element={<Navigate replace to="/requests" />} />
            <Route path="/domain/:slug" element={<Navigate replace to="/emergency" />} />
            <Route path="/profile/:type/:id" element={<Navigate replace to="/network" />} />
            <Route path="*" element={<Navigate replace to={currentUser ? "/emergency" : "/"} />} />
          </Routes>
        </Suspense>
      </main>

      {showStickyCta ? <EmergencyFAB busy={sendingEmergency} onPress={openComposer} /> : null}

      <EmergencyForm onClose={closeComposer} open={composerOpen} request={activeRequest} />

      {showShell && !emergencyMode ? <BottomNav /> : null}
    </div>
  );
}

export default App;
