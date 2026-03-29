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
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { db, storage } from "../lib/firebase";
import { buildPriorityZones, upsertAnalyticsForRequest } from "../utils/analytics";
import {
  formatDistance,
  getCurrentPosition,
  haversineDistance,
  watchCurrentPosition,
} from "../utils/geo";
import { findBestNgo, findBestVolunteer } from "../utils/matching";

const OFFLINE_QUEUE_KEY = "resqlink-offline-queue";
const EMERGENCY_MODE_KEY = "resqlink-emergency-mode";

const AppDataContext = createContext(null);

function readOfflineQueue() {
  try {
    return JSON.parse(window.localStorage.getItem(OFFLINE_QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeOfflineQueue(queue) {
  window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

function readEmergencyMode() {
  try {
    return window.localStorage.getItem(EMERGENCY_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

async function uploadRequestPhoto(file, userId) {
  if (!file) {
    return "";
  }

  const storageRef = ref(storage, `request-photos/${userId}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

function createMatchPayload(bestNgo, bestVolunteer) {
  const status = bestVolunteer ? "Volunteer assigned" : bestNgo ? "Accepted" : "Requested";
  const etaMinutes =
    bestVolunteer?.distanceKm == null ? null : Math.max(5, Math.round(bestVolunteer.distanceKm * 3));

  return {
    status,
    ngoId: bestNgo?.id ?? "",
    ngoName: bestNgo?.ngoName ?? "",
    assignedVolunteerId: bestVolunteer?.id ?? "",
    volunteerId: bestVolunteer?.id ?? "",
    volunteerName: bestVolunteer?.name ?? "",
    eta: etaMinutes,
    etaMinutes,
    distanceLabel:
      bestVolunteer?.distanceKm == null ? "" : formatDistance(bestVolunteer.distanceKm),
    matchReasons: bestVolunteer?.matchReasons ?? bestNgo?.matchReasons ?? [],
  };
}

export function AppDataProvider({ children }) {
  const { currentUser, profile } = useAuth();
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [requests, setRequests] = useState([]);
  const [offlineRequests, setOfflineRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [networkOnline, setNetworkOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [emergencyMode, setEmergencyModeState] = useState(readEmergencyMode);
  const previousCriticalIds = useRef([]);

  useEffect(() => {
    setOfflineRequests(readOfflineQueue());
  }, []);

  useEffect(() => {
    const handleOnline = () => setNetworkOnline(true);
    const handleOffline = () => setNetworkOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
        } catch {
          // Ignore live-location write failures in UI state.
        }
      },
      (error) => {
        setLocationError(error.message || "Location permission is required.");
      },
    );

    return () => {
      if (watcher != null) {
        navigator.geolocation.clearWatch(watcher);
      }
    };
  }, [currentUser, profile?.role]);

  const syncOfflineQueue = async () => {
    if (!currentUser || !networkOnline) {
      return;
    }

    const queue = readOfflineQueue();
    if (!queue.length) {
      return;
    }

    const remaining = [];

    for (const pending of queue) {
      try {
        const bestNgo = findBestNgo(pending, ngos);
        const bestVolunteer = findBestVolunteer(pending, volunteers);
        const priorityScore = await upsertAnalyticsForRequest(pending);
        const payload = createMatchPayload(bestNgo, bestVolunteer);

        await addDoc(collection(db, "problems"), {
          ...pending,
          ...payload,
          priorityScore,
          pendingSync: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch {
        remaining.push(pending);
      }
    }

    writeOfflineQueue(remaining);
    setOfflineRequests(remaining);
  };

  useEffect(() => {
    syncOfflineQueue();
  }, [networkOnline, currentUser, ngos, volunteers]);

  const allRequests = useMemo(
    () =>
      [...offlineRequests, ...requests].sort((left, right) => {
        const leftTime = left.createdAt?.seconds ?? left.clientCreatedAt ?? 0;
        const rightTime = right.createdAt?.seconds ?? right.clientCreatedAt ?? 0;
        return rightTime - leftTime;
      }),
    [offlineRequests, requests],
  );

  const activeRequests = useMemo(
    () => allRequests.filter((request) => request.status !== "Completed"),
    [allRequests],
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
      return allRequests.filter((request) => request.userId === currentUser.uid);
    }

    if (profile?.role === "volunteer") {
      return allRequests.filter((request) => request.assignedVolunteerId === currentUser.uid);
    }

    if (profile?.role === "ngo") {
      return allRequests.filter((request) => request.ngoId === currentUser.uid);
    }

    return [];
  }, [allRequests, currentUser, profile?.role]);

  const priorityZones = useMemo(
    () => buildPriorityZones(analytics, allRequests),
    [analytics, allRequests],
  );

  const createEmergency = async ({
    category = "general",
    urgency = "critical",
    description = "",
    photoFile = null,
  }) => {
    if (!currentUser) {
      throw new Error("Please sign in before reporting an emergency.");
    }

    const liveLocation = location ?? (await getCurrentPosition());
    const requestDraft = {
      userId: currentUser.uid,
      category,
      location: liveLocation,
      status: networkOnline ? "Requested" : "Pending sync",
      assignedVolunteerId: "",
      eta: null,
      urgency,
      description: description.trim(),
      citizenName: profile?.name || currentUser.email || "Citizen",
      clientCreatedAt: Date.now(),
      pendingSync: !networkOnline,
      photoUrl: "",
    };

    if (!networkOnline) {
      const offlineId = `offline-${Date.now()}`;
      const queueItem = {
        ...requestDraft,
        id: offlineId,
      };
      const nextQueue = [queueItem, ...readOfflineQueue()];
      writeOfflineQueue(nextQueue);
      setOfflineRequests(nextQueue);
      return offlineId;
    }

    const photoUrl = await uploadRequestPhoto(photoFile, currentUser.uid);
    const priorityScore = await upsertAnalyticsForRequest(requestDraft);
    const bestNgo = findBestNgo({ ...requestDraft, priorityScore }, ngos);
    const bestVolunteer = findBestVolunteer({ ...requestDraft, priorityScore }, volunteers);
    const payload = createMatchPayload(bestNgo, bestVolunteer);

    const requestRef = await addDoc(collection(db, "problems"), {
      ...requestDraft,
      ...payload,
      priorityScore,
      photoUrl,
      pendingSync: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return requestRef.id;
  };

  const updateRequestDetails = async (requestId, updates) => {
    const normalizedUpdates = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (String(requestId).startsWith("offline-")) {
      const nextQueue = readOfflineQueue().map((item) =>
        item.id === requestId ? { ...item, ...updates } : item,
      );
      writeOfflineQueue(nextQueue);
      setOfflineRequests(nextQueue);
      return;
    }

    const nextUpdates = { ...normalizedUpdates };
    if (updates.photoFile && currentUser) {
      nextUpdates.photoUrl = await uploadRequestPhoto(updates.photoFile, currentUser.uid);
      delete nextUpdates.photoFile;
    }
    await updateDoc(doc(db, "problems", requestId), nextUpdates);
  };

  const createQuickEmergency = async () =>
    createEmergency({
      category: "general",
      urgency: "critical",
      description: "",
    });

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
    const request = requests.find((item) => item.id === requestId);
    const volunteer = volunteers.find((item) => item.id === volunteerId);
    const distanceKm =
      request && volunteer ? haversineDistance(request.location, volunteer.location) : null;

    await updateDoc(doc(db, "problems", requestId), {
      status: "Volunteer assigned",
      assignedVolunteerId: volunteerId || "",
      volunteerId: volunteerId || "",
      volunteerName: volunteer?.name || "",
      eta: distanceKm == null ? null : Math.max(5, Math.round(distanceKm * 3)),
      etaMinutes: distanceKm == null ? null : Math.max(5, Math.round(distanceKm * 3)),
      distanceLabel: distanceKm == null ? "" : formatDistance(distanceKm),
      matchReasons: volunteer?.matchReasons ?? ["Available"],
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

  const setEmergencyMode = (value) => {
    setEmergencyModeState(value);
    window.localStorage.setItem(EMERGENCY_MODE_KEY, value ? "1" : "0");
  };

  const value = useMemo(
    () => ({
      loading,
      location,
      locationError,
      requests: allRequests,
      activeRequests,
      nearbyRequests,
      nearbyCriticalRequests,
      myRequests,
      volunteers,
      ngos,
      analytics,
      priorityZones,
      networkOnline,
      emergencyMode,
      createEmergency,
      createQuickEmergency,
      updateRequestDetails,
      acceptRequest,
      assignVolunteer,
      volunteerAdvance,
      completeRequest,
      updateVolunteerAvailability,
      setEmergencyMode,
      syncOfflineQueue,
    }),
    [
      loading,
      location,
      locationError,
      allRequests,
      activeRequests,
      nearbyRequests,
      nearbyCriticalRequests,
      myRequests,
      volunteers,
      ngos,
      analytics,
      priorityZones,
      networkOnline,
      emergencyMode,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  return useContext(AppDataContext);
}
