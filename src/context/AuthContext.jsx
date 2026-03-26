import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

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

      const userDoc = await getDoc(doc(db, "users", user.uid));
      setProfile(userDoc.exists() ? userDoc.data() : null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async ({
    email,
    password,
    role,
    name,
    phone,
    skills,
    location,
    available,
    profilePhoto,
    preferredDistanceRange,
    categoryTags,
    previousActivities,
    vehicleAvailability,
    hybridMode,
    ngoName,
    registrationNumber,
    contactPerson,
    officeAddress,
    officialEmailDomain,
    officePhoto,
    documentLinks,
    adminReviewStatus,
  }) => {
    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    const baseUser = {
      email,
      role,
      name,
      phone: phone || "",
      profilePhoto: profilePhoto || "",
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", credentials.user.uid), baseUser);

    if (role === "user") {
      await setDoc(doc(db, "profiles", credentials.user.uid), {
        userId: credentials.user.uid,
        name,
        email,
        phone: phone || "",
        location,
        profilePhoto: profilePhoto || "",
        verificationBadge: "otp-verified",
        createdAt: serverTimestamp(),
      });
    }

    if (role === "volunteer") {
      await setDoc(doc(db, "volunteers", credentials.user.uid), {
        name,
        skills,
        location:
          typeof location === "string"
            ? {
                label: location,
              }
            : location,
        availability: available,
        available,
        email,
        phone: phone || "",
        profilePhoto: profilePhoto || "",
        preferredDistanceRange: preferredDistanceRange || "5 km",
        categoryTags: categoryTags || [],
        previousActivities: previousActivities || "",
        vehicleAvailability: vehicleAvailability || "none",
        hybridMode: hybridMode ?? true,
        status: "online",
        createdAt: serverTimestamp(),
      });
    }

    if (role === "ngo") {
      await setDoc(doc(db, "ngos", credentials.user.uid), {
        ngoName: ngoName || name,
        registrationNumber: registrationNumber || "",
        contactPerson: contactPerson || "",
        email,
        phone: phone || "",
        officeAddress: officeAddress || "",
        location,
        profilePhoto: profilePhoto || "",
        officialEmailDomain: officialEmailDomain || false,
        officePhoto: officePhoto || "",
        documentLinks: documentLinks || {},
        trustScore: 4.7,
        review: {
          ngo_id: credentials.user.uid,
          status: adminReviewStatus || "pending",
        },
        verificationBadge: "pending-review",
        services: [],
        createdAt: serverTimestamp(),
      });
    }

    setProfile(baseUser);
    return credentials.user;
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const refreshProfile = async (uid = currentUser?.uid) => {
    if (!uid) {
      return;
    }

    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      setProfile(userDoc.data());
    }
  };

  const updateVolunteerProfile = async ({
    name,
    skills,
    location,
    available,
    preferredDistanceRange,
    categoryTags,
    previousActivities,
    vehicleAvailability,
  }) => {
    if (!currentUser) {
      return;
    }

    await updateDoc(doc(db, "users", currentUser.uid), { name });
    await updateDoc(doc(db, "volunteers", currentUser.uid), {
      name,
      skills,
      location,
      availability: available,
      available,
      preferredDistanceRange,
      categoryTags,
      previousActivities,
      vehicleAvailability,
    });
    await refreshProfile(currentUser.uid);
  };

  const value = {
    currentUser,
    profile,
    loading,
    login,
    logout,
    register,
    refreshProfile,
    updateVolunteerProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
