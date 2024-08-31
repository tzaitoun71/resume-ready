// app/layout.tsx
'use client';

import { useEffect } from 'react';
import { analytics } from "./firebase";
import { logEvent } from "firebase/analytics";
import { UserProvider } from "./context/UserContext";
import { usePathname } from 'next/navigation';
import Navbar from "./components/Navbar"; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const pathname = usePathname(); // Get the current path

  useEffect(() => {
    if (analytics) {
      console.log('Firebase Analytics initialized');
      logEvent(analytics, 'page_view'); // Example of logging a page view event
    }
  }, []);

  return (
    <html lang="en">
      <body>
        {/* Wrap all children in UserProvider to ensure context is available everywhere */}
        <UserProvider>
          {pathname !== '/' && pathname !== '/login' ? <Navbar /> : null} {/* Conditionally render Navbar */}
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
