import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

function normalizeRole(role) {
  return role === "user" ? "citizen" : role;
}

function normalizeLocation(location) {
  if (location?.lat != null && location?.lng != null) {
    return location;
  }

  return null;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const snapshot = await getDoc(doc(db, "users", user.uid));
      setProfile(
        snapshot.exists()
          ? { id: snapshot.id, ...snapshot.data(), role: normalizeRole(snapshot.data().role) }
          : null,
      );
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async ({
    role,
    fullName,
    email,
    password,
    phone,
    location,
    photoUrl,
    skills,
    categoryTags,
    vehicleAvailability,
    preferredDistanceKm,
    ngoName,
    organisationType,
    registrationNumber,
    coverageLabel,
    officeAddress,
  }) => {
    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    const normalizedLocation = normalizeLocation(location);
    const baseProfile = {
      name: fullName || ngoName || "ResQLink user",
      email,
      phone: phone || "",
      role: normalizeRole(role),
      location: normalizedLocation,
      photoUrl: photoUrl || "",
      trustScore: role === "ngo" ? 4.7 : 4.4,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", credentials.user.uid), baseProfile);

    if (normalizeRole(role) === "citizen") {
      await setDoc(doc(db, "citizens", credentials.user.uid), {
        userId: credentials.user.uid,
        activeRequestCount: 0,
        completedRequestCount: 0,
        privacy: {
          email: "private",
        },
        ...baseProfile,
      });
    }

    if (normalizeRole(role) === "volunteer") {
      await setDoc(doc(db, "volunteers", credentials.user.uid), {
        userId: credentials.user.uid,
        name: fullName,
        email,
        phone: phone || "",
        skills: skills ?? [],
        categoryTags: categoryTags ?? [],
        location: normalizedLocation,
        available: true,
        availability: true,
        preferredDistanceKm: Number(preferredDistanceKm || 10),
        vehicleAvailability: vehicleAvailability || "none",
        trustScore: 4.5,
        completedTasks: 0,
        activeTasks: 0,
        verificationStatus: "verified",
        photoUrl: photoUrl || "",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }

    if (normalizeRole(role) === "ngo") {
      await setDoc(doc(db, "ngos", credentials.user.uid), {
        userId: credentials.user.uid,
        ngoName: ngoName || fullName,
        email,
        phone: phone || "",
        organisationType: organisationType || "Community NGO",
        registrationNumber: registrationNumber || "",
        location: normalizedLocation,
        officeAddress: officeAddress || "",
        coverageLabel: coverageLabel || "",
        services: categoryTags ?? [],
        trustScore: 4.8,
        verificationStatus: "verified",
        capacity: 25,
        activeCampaigns: 2,
        photoUrl: photoUrl || "",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }

    setProfile({
      id: credentials.user.uid,
      ...baseProfile,
    });

    return credentials.user;
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  const refreshProfile = async (uid = currentUser?.uid) => {
    if (!uid) {
      return null;
    }

    const snapshot = await getDoc(doc(db, "users", uid));
    if (snapshot.exists()) {
      const nextProfile = { id: snapshot.id, ...snapshot.data() };
      nextProfile.role = normalizeRole(nextProfile.role);
      setProfile(nextProfile);
      return nextProfile;
    }

    return null;
  };

  const saveUserProfile = async (updates) => {
    if (!currentUser) {
      return;
    }

    await updateDoc(doc(db, "users", currentUser.uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    await refreshProfile(currentUser.uid);
  };

  const value = useMemo(
    () => ({
      currentUser,
      profile,
      loading,
      register,
      login,
      logout,
      refreshProfile,
      saveUserProfile,
    }),
    [currentUser, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
