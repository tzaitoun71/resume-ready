"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

interface UserContextProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  signOutUser: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("Auth state change listener setup");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userId = firebaseUser.uid;

          const response = await fetch(`/api/users/${firebaseUser.uid}`);

          if (!response.ok) throw new Error("Failed to fetch user data");

          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user data, " + error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No user is logged in");
        setUser(null);
        setLoading(false);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const signOutUser = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setLoading(false);
    router.push("/login");
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, signOutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
