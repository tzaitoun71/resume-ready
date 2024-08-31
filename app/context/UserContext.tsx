'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface UserContextProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  signOutUser: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("Auth state change listener setup");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('Firebase User logged in:', firebaseUser);
        setLoading(true); // Set loading while fetching MongoDB data
        try {
          // Fetch user data from MongoDB
          const response = await fetch(`/api/users/${firebaseUser.uid}`);
          console.log('Fetch response: ', response);

          if (response.ok) {
            const userData = await response.json();
            console.log('MongoDB user data fetched:', userData);
            setUser({ ...firebaseUser, ...userData });
          } else {
            console.error('Failed to fetch user data from MongoDB, setting Firebase user data only');
            setUser(firebaseUser); // Fallback to only Firebase user data if fetch fails
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setUser(firebaseUser); // Fallback to only Firebase user data if fetch fails
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No user is logged in');
        setUser(null);
        setLoading(false);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const signOutUser = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setLoading(false);
    router.push('/login');
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
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
