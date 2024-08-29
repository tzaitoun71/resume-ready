// app/context/UserContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { auth } from '../firebase'; // Adjust the import path based on your structure

interface UserContextProps {
  user: FirebaseUser | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  loading: true,
  signOutUser: async () => {},
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (!firebaseUser) {
        router.push('/login'); // Redirect to login if user is not authenticated
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]); // Include router as a dependency

  const signOutUser = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setLoading(false);
    router.push('/login'); // Redirect to login after signing out
  };

  return (
    <UserContext.Provider value={{ user, loading, signOutUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);
