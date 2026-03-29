import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { db, storage } from "../lib/firebase";
import { upsertAnalyticsForRequest, buildPriorityZones } from "../utils/analytics";
import {
  formatDistance,
  getCurrentPosition,
  haversineDistance,
  watchCurrentPosition,
} from "../utils/geo";
import { findBestNgo, findBestVolunteer } from "../utils/matching";

const AppDataContext = createContext(null);

async function uploadRequestPhoto(file, userId) {
  if (!file) {
    return "";
  }

  const storageRef = ref(storage, `request-photos/${userId}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export function AppDataProvider({ children }) {
  const { currentUser, profile } = useAuth();
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const previousCriticalIds = useRef([]);

  useEffect(() => {
    const unsubscribeRequests = onSnapshot(
      query(collection(db, "problems"), orderBy("createdAt", "desc")),
      (snapshot) => {
        setRequests(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setLoading(false);
      },
    );
    const unsubscribeVolunteers = onSnapshot(collection(db, "volunteers"), (snapshot) => {
      setVolunteers(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
    const unsubscribeNgos = onSnapshot(collection(db, "ngos"), (snapshot) => {
      setNgos(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
    const unsubscribeAnalytics = onSnapshot(collection(db, "analytics"), (snapshot) => {
      setAnalytics(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    return () => {
      unsubscribeRequests();
      unsubscribeVolunteers();
      unsubscribeNgos();
      unsubscribeAnalytics();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }

    const watcher = watchCurrentPosition(
      async (coords) => {
        setLocation(coords);
        setLocationError("");

        try {
          await updateDoc(doc(db, "users", currentUser.uid), {
            location: coords,
            updatedAt: serverTimestamp(),
          });

          if (profile?.role === "volunteer") {
            await updateDoc(doc(db, "volunteers", currentUser.uid), {
              location: coords,
              updatedAt: serverTimestamp(),
            });
          }

          if (profile?.role === "ngo") {
            await updateDoc(doc(db, "ngos", currentUser.uid), {
              location: coords,
              updatedAt: serverTimestamp(),
            });
          }
        } catch (error) {
          // Firestore update failures should not block live location in UI.
        }
      },
      (error) => {
        setLocationError(error.message || "Location permission is required for live coordination.");
      },
    );

    return () => {
      if (watcher != null) {
        navigator.geolocation.clearWatch(watcher);
      }
    };
  }, [currentUser, profile?.role]);

  const activeRequests = useMemo(
    () => requests.filter((request) => request.status !== "Completed"),
    [requests],
  );

  const nearbyRequests = useMemo(() => {
    if (!location) {
      return activeRequests;
    }

    return activeRequests
      .map((request) => ({
        ...request,
        distanceKm: haversineDistance(location, request.location),
      }))
      .sort((left, right) => (left.distanceKm ?? 999) - (right.distanceKm ?? 999));
  }, [activeRequests, location]);

  const nearbyCriticalRequests = useMemo(
    () =>
      nearbyRequests.filter(
        (request) =>
          request.urgency === "critical" &&
          (request.distanceKm == null || request.distanceKm <= 15),
      ),
    [nearbyRequests],
  );

  useEffect(() => {
    const currentIds = nearbyCriticalRequests.map((request) => request.id);
    const hasNewCritical = currentIds.some((id) => !previousCriticalIds.current.includes(id));

    if (hasNewCritical && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 60, 100]);
    }

    previousCriticalIds.current = currentIds;
  }, [nearbyCriticalRequests]);

  const myRequests = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    if (profile?.role === "citizen") {
      return requests.filter((request) => request.citizenId === currentUser.uid);
    }

    if (profile?.role === "volunteer") {
      return requests.filter((request) => request.volunteerId === currentUser.uid);
    }

    if (profile?.role === "ngo") {
      return requests.filter((request) => request.ngoId === currentUser.uid);
    }

    return [];
  }, [currentUser, profile?.role, requests]);

  const priorityZones = useMemo(
    () => buildPriorityZones(analytics, requests),
    [analytics, requests],
  );

  const createEmergency = async ({
    category,
    urgency,
    description,
    photoFile,
  }) => {
    if (!currentUser) {
      throw new Error("Please sign in before reporting an emergency.");
    }

    const liveLocation = location ?? (await getCurrentPosition());
    const photoUrl = await uploadRequestPhoto(photoFile, currentUser.uid);
    const draftRequest = {
      category,
      urgency,
      description: description?.trim() || "",
      location: liveLocation,
    };

    const priorityScore = await upsertAnalyticsForRequest(draftRequest);
    const bestNgo = findBestNgo({ ...draftRequest, priorityScore }, ngos);
    const bestVolunteer = findBestVolunteer({ ...draftRequest, priorityScore }, volunteers);
    const initialStatus = bestVolunteer
      ? "Volunteer assigned"
      : bestNgo
        ? "Accepted"
        : "Requested";

    const requestRef = await addDoc(collection(db, "problems"), {
      ...draftRequest,
      citizenId: currentUser.uid,
      citizenName: profile?.name || currentUser.email || "Citizen",
      status: initialStatus,
      ngoId: bestNgo?.id ?? "",
      ngoName: bestNgo?.ngoName ?? "",
      volunteerId: bestVolunteer?.id ?? "",
      volunteerName: bestVolunteer?.name ?? "",
      etaMinutes:
        bestVolunteer?.distanceKm == null
          ? null
          : Math.max(5, Math.round(bestVolunteer.distanceKm * 3)),
      distanceLabel: bestVolunteer?.distanceKm == null ? "" : formatDistance(bestVolunteer.distanceKm),
      priorityScore,
      photoUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return requestRef.id;
  };

  const acceptRequest = async (requestId, ngoId = currentUser?.uid) => {
    const ngo = ngos.find((item) => item.id === ngoId);
    await updateDoc(doc(db, "problems", requestId), {
      status: "Accepted",
      ngoId: ngoId || "",
      ngoName: ngo?.ngoName || "",
      updatedAt: serverTimestamp(),
    });
  };

  const assignVolunteer = async (requestId, volunteerId) => {
    const volunteer = volunteers.find((item) => item.id === volunteerId);
    await updateDoc(doc(db, "problems", requestId), {
      status: "Volunteer assigned",
      volunteerId: volunteerId || "",
      volunteerName: volunteer?.name || "",
      etaMinutes:
        volunteer?.location && location
          ? Math.max(
              5,
              Math.round((haversineDistance(location, volunteer.location) ?? 2) * 3),
            )
          : null,
      updatedAt: serverTimestamp(),
    });
  };

  const volunteerAdvance = async (requestId, nextStatus) => {
    await updateDoc(doc(db, "problems", requestId), {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  };

  const completeRequest = async (requestId) => {
    await updateDoc(doc(db, "problems", requestId), {
      status: "Completed",
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateVolunteerAvailability = async (available) => {
    if (!currentUser || profile?.role !== "volunteer") {
      return;
    }

    await updateDoc(doc(db, "volunteers", currentUser.uid), {
      available,
      availability: available,
      updatedAt: serverTimestamp(),
    });
  };

  const value = useMemo(
    () => ({
      loading,
      location,
      locationError,
      requests,
      activeRequests,
      nearbyRequests,
      nearbyCriticalRequests,
      myRequests,
      volunteers,
      ngos,
      analytics,
      priorityZones,
      createEmergency,
      acceptRequest,
      assignVolunteer,
      volunteerAdvance,
      completeRequest,
      updateVolunteerAvailability,
    }),
    [
      loading,
      location,
      locationError,
      requests,
      activeRequests,
      nearbyRequests,
      nearbyCriticalRequests,
      myRequests,
      volunteers,
      ngos,
      analytics,
      priorityZones,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  return useContext(AppDataContext);
}
